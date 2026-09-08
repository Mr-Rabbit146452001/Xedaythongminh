const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const pool = require('../db');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.BANK_PORT || 4000;
const SHOP_SERVER_URL = process.env.SHOP_SERVER_URL || 'http://127.0.0.1:3000';
const BANK_SECRET_KEY = process.env.BANK_SECRET_KEY || 'stroller_mock_bank_secret_2026';

app.use(cors());
app.use(express.json());

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ service: 'Mock Bank Service', status: 'running', port: PORT, time: new Date() });
});

// 2. Lấy thông tin tài khoản và số dư Token
app.get('/api/bank/accounts/:accountNumber', async (req, res) => {
  const { accountNumber } = req.params;
  try {
    const result = await pool.query(
      'SELECT account_number, owner_name, user_ref_id, token_balance, is_active, created_at FROM bank_accounts WHERE account_number = $1',
      [accountNumber]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản ngân hàng' });
    }
    const acc = result.rows[0];
    res.json({
      success: true,
      data: {
        accountNumber: acc.account_number,
        ownerName: acc.owner_name,
        userRefId: acc.user_ref_id,
        tokenBalance: parseFloat(acc.token_balance),
        isActive: acc.is_active
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Faucet API: Bơm Token thử nghiệm cho tài khoản (1 Token = 10 VNĐ)
app.post('/api/bank/faucet', async (req, res) => {
  const { accountNumber, amount = 50000 } = req.body;
  if (!accountNumber) {
    return res.status(400).json({ success: false, message: 'Thiếu accountNumber' });
  }

  try {
    const result = await pool.query(
      'UPDATE bank_accounts SET token_balance = token_balance + $1 WHERE account_number = $2 RETURNING *',
      [amount, accountNumber]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản để nạp' });
    }
    res.json({
      success: true,
      message: 'Đã nạp thành công ' + amount + ' Token vào tài khoản ' + accountNumber,
      tokenBalance: parseFloat(result.rows[0].token_balance)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. API Thanh toán quét mã QR (Core Payment Transaction with Row Lock)
app.post('/api/bank/pay-qr', async (req, res) => {
  const { fromAccount, toAccount, amount, orderId, idempotencyKey, pin } = req.body;

  if (!fromAccount || !toAccount || !amount || !orderId) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin thanh toán bắt buộc' });
  }

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Số tiền thanh toán phải lớn hơn 0' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Kiểm tra Idempotency
    const keyToCheck = idempotencyKey || ('ORDER_' + orderId + '_' + fromAccount);
    const existingTx = await client.query(
      'SELECT * FROM bank_transactions WHERE idempotency_key = $1',
      [keyToCheck]
    );
    if (existingTx.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.json({
        success: true,
        message: 'Giao dịch đã được xử lý trước đó',
        transaction: existingTx.rows[0]
      });
    }

    // 1.5. Kiểm tra thời hạn hiệu lực của đơn hàng trên Shop Server (Hạn 5 phút)
    try {
      const orderCheckRes = await fetch(`${SHOP_SERVER_URL}/api/payment/qr-status/${orderId}`);
      if (orderCheckRes.ok) {
        const orderInfo = await orderCheckRes.json();
        if (orderInfo.data && orderInfo.data.paymentStatus === 'EXPIRED') {
          await client.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            message: 'Mã QR thanh toán đã hết hạn hiệu lực (quá 5 phút). Vui lòng tạo mã QR mới trên xe đẩy.'
          });
        }
      }
    } catch (_e) {}

    // 2. Khóa dòng tài khoản người gửi (Row-level lock chống Race Condition)
    const senderRes = await client.query(
      'SELECT account_number, owner_name, token_balance, pin, is_active FROM bank_accounts WHERE account_number = $1 FOR UPDATE',
      [fromAccount]
    );
    if (senderRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Tài khoản người gửi không tồn tại' });
    }

    const sender = senderRes.rows[0];
    if (!sender.is_active) {
      await client.query('ROLLBACK');
      return res.status(403).json({ success: false, message: 'Tài khoản người gửi đang bị khóa' });
    }

    // Kiểm tra PIN nếu có
    if (pin && sender.pin !== pin) {
      await client.query('ROLLBACK');
      return res.status(401).json({ success: false, message: 'Mã PIN ngân hàng không chính xác' });
    }

    // Kiểm tra số dư Token
    const currentBalance = parseFloat(sender.token_balance);
    if (currentBalance < numAmount) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        errorCode: 'INSUFFICIENT_TOKEN_BALANCE',
        message: 'Số dư không đủ. Bạn có ' + currentBalance + ' Token, cần ' + numAmount + ' Token'
      });
    }

    // Kiểm tra tài khoản nhận (Siêu thị)
    const receiverRes = await client.query(
      'SELECT account_number, owner_name FROM bank_accounts WHERE account_number = $1 FOR UPDATE',
      [toAccount]
    );
    if (receiverRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Tài khoản thụ hưởng không tồn tại' });
    }

    // 3. Thực hiện chuyển Token
    await client.query(
      'UPDATE bank_accounts SET token_balance = token_balance - $1 WHERE account_number = $2',
      [numAmount, fromAccount]
    );
    await client.query(
      'UPDATE bank_accounts SET token_balance = token_balance + $1 WHERE account_number = $2',
      [numAmount, toAccount]
    );

    // 4. Tạo bản ghi giao dịch
    const txRes = await client.query(
      'INSERT INTO bank_transactions (order_id, from_account, to_account, amount, status, idempotency_key) VALUES ($1, $2, $3, $4, \'SUCCESS\', $5) RETURNING *',
      [orderId, fromAccount, toAccount, numAmount, keyToCheck]
    );
    const transaction = txRes.rows[0];

    // 5. Ghi sổ cái kép (Ledger Entries)
    const receiverBalance = parseFloat(receiverRes.rows[0].token_balance || 0);
    await client.query(
      'INSERT INTO ledger_entries (transaction_id, account_number, entry_type, amount, balance_after) VALUES ($1, $2, \'DEBIT\', $3, $4), ($1, $5, \'CREDIT\', $3, $6)',
      [transaction.id, fromAccount, numAmount, currentBalance - numAmount, toAccount, receiverBalance + numAmount]
    );

    await client.query('COMMIT');

    // 6. Bắn Webhook sang Shop Server (bất đồng bộ)
    triggerWebhook(transaction);

    res.json({
      success: true,
      message: 'Thanh toán Token thành công!',
      data: {
        transactionId: transaction.id,
        orderId: transaction.order_id,
        amountPaid: numAmount,
        remainingBalance: currentBalance - numAmount,
        timestamp: transaction.created_at
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
});

// Hàm gửi Webhook có chữ ký bảo mật HMAC SHA-256
async function triggerWebhook(tx) {
  const payload = {
    transactionId: tx.id,
    orderId: tx.order_id,
    fromAccount: tx.from_account,
    toAccount: tx.to_account,
    amount: parseFloat(tx.amount),
    status: tx.status,
    timestamp: Date.now()
  };

  const payloadString = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', BANK_SECRET_KEY).update(payloadString).digest('hex');

  const webhookUrl = SHOP_SERVER_URL + '/api/webhooks/bank-payment';
  console.log('📡 [Mock Bank] Đang bắn Webhook tới Shop Server: ' + webhookUrl);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bank-signature': signature
      },
      body: payloadString
    });

    if (response.ok) {
      console.log('✅ [Mock Bank] Webhook gửi thành công cho đơn hàng: ' + tx.order_id);
      await pool.query('UPDATE bank_transactions SET webhook_status = \'DELIVERED\' WHERE id = $1', [tx.id]);
    } else {
      console.warn('⚠️ [Mock Bank] Shop server phản hồi mã: ' + response.status);
      await pool.query('UPDATE bank_transactions SET webhook_status = \'FAILED\' WHERE id = $1', [tx.id]);
    }
  } catch (err) {
    console.error('❌ [Mock Bank] Lỗi kết nối gửi Webhook: ' + err.message);
    await pool.query('UPDATE bank_transactions SET webhook_status = \'FAILED\' WHERE id = $1', [tx.id]);
  }
}

// 5. API Kiểm tra giao dịch theo Order ID
app.get('/api/bank/transactions/:orderId', async (req, res) => {
  const { orderId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM bank_transactions WHERE order_id = $1 ORDER BY created_at DESC LIMIT 1',
      [orderId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Chưa có giao dịch cho đơn hàng này' });
    }
    res.json({ success: true, transaction: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 [Mock Bank Server] Đang chạy tại cổng http://localhost:' + PORT);
});

module.exports = { app, server, pool };
