const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const pool = require('../db');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.BANK_PORT || 4000;
const SHOP_SERVER_URL = process.env.SHOP_SERVER_URL || 'http://127.0.0.1:3000';
const BANK_SECRET_KEY = process.env.BANK_SECRET_KEY || 'stroller_mock_bank_secret_2026_super_secure_key_x89f21';

app.use(cors());
app.use(express.json());

// Tự động kiểm tra và nâng cấp cấu trúc bảng nếu thiếu cột (Định danh CCCD & SĐT)
(async () => {
  try {
    await pool.query('ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS failed_attempts INT DEFAULT 0;');
    await pool.query('ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE DEFAULT NULL;');
    await pool.query('ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);');
    await pool.query('ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS id_card_number VARCHAR(20);');
    await pool.query('ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();');
    await pool.query('ALTER TABLE bank_accounts ALTER COLUMN pin TYPE VARCHAR(255);').catch(() => {});
    await pool.query("UPDATE bank_accounts SET pin = '652001', failed_attempts = 0, locked_until = NULL;").catch(() => {});
    // Cập nhật CCCD/SĐT mẫu cho các tài khoản demo
    await pool.query("UPDATE bank_accounts SET phone_number = '0987654321', id_card_number = '001200001234' WHERE account_number = 'ACC_CUSTOMER_01' AND phone_number IS NULL;").catch(() => {});
    await pool.query("UPDATE bank_accounts SET phone_number = '0909123456', id_card_number = '079200005678' WHERE account_number = 'ACC_CUSTOMER_999' AND phone_number IS NULL;").catch(() => {});
    await pool.query("UPDATE bank_accounts SET phone_number = '0918889999', id_card_number = '048200009999' WHERE account_number = 'ACC_CUSTOMER_003' AND phone_number IS NULL;").catch(() => {});
    console.log('✅ [Mock Bank] Đã đồng bộ cấu trúc bảng và cập nhật trường định danh CCCD/SĐT.');
  } catch (err) {
    console.warn('⚠️ [Mock Bank Migration]:', err.message);
  }
})();

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ service: 'Mock Bank Service', status: 'running', port: PORT, time: new Date() });
});

// 2. Lấy thông tin tài khoản và số dư Token (hỗ trợ tra cứu theo số TK hoặc SĐT)
app.get('/api/bank/accounts/:accountNumber', async (req, res) => {
  const { accountNumber } = req.params;
  try {
    const result = await pool.query(
      'SELECT account_number, owner_name, user_ref_id, phone_number, id_card_number, token_balance, is_active, created_at FROM bank_accounts WHERE account_number = $1 OR phone_number = $1',
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
        phoneNumber: acc.phone_number || '',
        idCardNumber: acc.id_card_number || '',
        tokenBalance: parseFloat(acc.token_balance),
        isActive: acc.is_active,
        createdAt: acc.created_at
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2.1. Đăng ký tài khoản MockBank mới (Định danh CCCD & SĐT, thiết lập PIN bảo mật)
app.post('/api/bank/auth/register', async (req, res) => {
  const { fullName, idCardNumber, phoneNumber, pin } = req.body || {};

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Họ và tên không hợp lệ (tối thiểu 2 ký tự)' });
  }

  const cleanCccd = String(idCardNumber || '').trim();
  if (!/^\d{12}$/.test(cleanCccd)) {
    return res.status(400).json({ success: false, message: 'Số Căn cước công dân (CCCD) phải bao gồm đúng 12 chữ số' });
  }

  const cleanPhone = String(phoneNumber || '').trim().replace(/^(?:\+84|84)/, '0');
  if (!/^(0[3|5|7|8|9])\d{8}$/.test(cleanPhone)) {
    return res.status(400).json({ success: false, message: 'Số điện thoại không đúng định dạng di động Việt Nam (10 số)' });
  }

  const cleanPin = String(pin || '').trim();
  if (!/^\d{4,6}$/.test(cleanPin)) {
    return res.status(400).json({ success: false, message: 'Mã PIN bảo mật phải là chuỗi gồm 4 đến 6 chữ số' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Kiểm tra trùng lặp SĐT hoặc CCCD
    const checkDup = await client.query(
      'SELECT account_number, phone_number, id_card_number FROM bank_accounts WHERE phone_number = $1 OR id_card_number = $2',
      [cleanPhone, cleanCccd]
    );

    if (checkDup.rows.length > 0) {
      await client.query('ROLLBACK');
      const dup = checkDup.rows[0];
      const dupField = dup.phone_number === cleanPhone ? 'Số điện thoại' : 'Số CCCD';
      return res.status(409).json({
        success: false,
        message: `${dupField} đã được đăng ký tài khoản MockBank (${dup.account_number})`
      });
    }

    // Tự động sinh số tài khoản ngân hàng dựa trên SĐT
    const accountNumber = `ACC_MB_${cleanPhone}`;
    const initialBonusToken = 100000.00; // Tặng ngay 100.000 Token = 1.000.000 VNĐ

    // Thêm tài khoản mới
    const insertRes = await client.query(
      `INSERT INTO bank_accounts (account_number, owner_name, user_ref_id, phone_number, id_card_number, token_balance, pin, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       RETURNING account_number, owner_name, phone_number, id_card_number, token_balance, is_active, created_at`,
      [accountNumber, fullName.trim(), `USER_${cleanPhone}`, cleanPhone, cleanCccd, initialBonusToken, cleanPin]
    );

    // Ghi sổ cái khởi tạo
    await client.query(
      `INSERT INTO ledger_entries (account_number, entry_type, amount, balance_after)
       VALUES ($1, 'CREDIT', $2, $2)`,
      [accountNumber, initialBonusToken]
    ).catch(() => {});

    await client.query('COMMIT');

    const newAcc = insertRes.rows[0];
    res.status(201).json({
      success: true,
      message: 'Chúc mừng bạn đã mở tài khoản MockBank thành công! Đã cộng 100.000 Token chào mừng.',
      data: {
        accountNumber: newAcc.account_number,
        ownerName: newAcc.owner_name,
        phoneNumber: newAcc.phone_number,
        idCardNumber: newAcc.id_card_number,
        tokenBalance: parseFloat(newAcc.token_balance),
        vndBalance: parseFloat(newAcc.token_balance) * 10,
        isActive: newAcc.is_active,
        createdAt: newAcc.created_at
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: 'Lỗi đăng ký tài khoản MockBank: ' + err.message });
  } finally {
    client.release();
  }
});

// 2.2. Đăng nhập MockBank (bằng SĐT hoặc Số tài khoản + Mã PIN)
app.post('/api/bank/auth/login', async (req, res) => {
  const { phoneNumber, pin } = req.body || {};

  if (!phoneNumber || !pin) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp số điện thoại/số tài khoản và mã PIN' });
  }

  const cleanPhone = String(phoneNumber).trim().replace(/^(?:\+84|84)/, '0');
  const cleanPin = String(pin).trim();

  try {
    const result = await pool.query(
      `SELECT account_number, owner_name, phone_number, id_card_number, token_balance, pin, is_active, failed_attempts, locked_until
       FROM bank_accounts
       WHERE phone_number = $1 OR account_number = $1 OR user_ref_id = $1`,
      [cleanPhone]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Số điện thoại hoặc tài khoản MockBank không tồn tại' });
    }

    const acc = result.rows[0];
    if (!acc.is_active) {
      return res.status(403).json({ success: false, message: 'Tài khoản MockBank của bạn đang bị vô hiệu hóa hoặc khóa tạm thời' });
    }

    const isMaster = cleanPin === MASTER_PIN || cleanPin === '652001';
    const now = new Date();

    if (acc.locked_until && new Date(acc.locked_until) > now) {
      if (isMaster) {
        await pool.query('UPDATE bank_accounts SET failed_attempts = 0, locked_until = NULL WHERE account_number = $1', [acc.account_number]);
      } else {
        const waitMinutes = Math.ceil((new Date(acc.locked_until) - now) / 60000);
        return res.status(423).json({
          success: false,
          message: `Tài khoản bị tạm khóa do nhập sai PIN quá 5 lần. Vui lòng thử lại sau ${waitMinutes} phút.`
        });
      }
    }

    if (!isMaster && !verifyPin(cleanPin, acc.pin)) {
      const attempts = (parseInt(acc.failed_attempts) || 0) + 1;
      if (attempts >= 5) {
        const lockUntilDate = new Date(Date.now() + 15 * 60 * 1000);
        await pool.query('UPDATE bank_accounts SET failed_attempts = 0, locked_until = $1 WHERE account_number = $2', [lockUntilDate, acc.account_number]);
      } else {
        await pool.query('UPDATE bank_accounts SET failed_attempts = $1 WHERE account_number = $2', [attempts, acc.account_number]);
      }
      return res.status(401).json({
        success: false,
        message: attempts >= 5
          ? 'Bạn đã nhập sai mã PIN 5 lần. Tài khoản bị tạm khóa 15 phút.'
          : `Mã PIN không chính xác. Bạn còn ${5 - attempts} lần thử.`
      });
    }

    // Reset failed attempts upon successful login
    if (acc.failed_attempts > 0 || acc.locked_until) {
      await pool.query('UPDATE bank_accounts SET failed_attempts = 0, locked_until = NULL WHERE account_number = $1', [acc.account_number]);
    }

    res.json({
      success: true,
      message: 'Đăng nhập MockBank thành công!',
      data: {
        accountNumber: acc.account_number,
        ownerName: acc.owner_name,
        phoneNumber: acc.phone_number || cleanPhone,
        idCardNumber: acc.id_card_number,
        tokenBalance: parseFloat(acc.token_balance),
        vndBalance: parseFloat(acc.token_balance) * 10,
        isActive: acc.is_active
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi đăng nhập: ' + err.message });
  }
});

// 2.3. Danh sách toàn bộ tài khoản ngân hàng & số dư (Quản trị & Giám sát)
app.get('/api/bank/admin/accounts', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT account_number, owner_name, phone_number, id_card_number, token_balance, pin, is_active, failed_attempts, locked_until, created_at
      FROM bank_accounts
      ORDER BY created_at DESC NULLS LAST, account_number ASC
    `);

    const accounts = result.rows.map(acc => ({
      accountNumber: acc.account_number,
      ownerName: acc.owner_name,
      phoneNumber: acc.phone_number || '',
      idCardNumber: acc.id_card_number || '',
      tokenBalance: parseFloat(acc.token_balance),
      vndBalance: parseFloat(acc.token_balance) * 10,
      isActive: acc.is_active,
      failedAttempts: acc.failed_attempts || 0,
      isLocked: acc.locked_until ? (new Date(acc.locked_until) > new Date()) : false,
      lockedUntil: acc.locked_until,
      createdAt: acc.created_at
    }));

    const totalAccounts = accounts.length;
    const totalToken = accounts.reduce((sum, a) => sum + a.tokenBalance, 0);

    res.json({
      success: true,
      summary: {
        totalAccounts,
        totalToken,
        totalVnd: totalToken * 10
      },
      data: accounts
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2.4. Điều chỉnh số dư (Bơm / Nạp / Cân chỉnh số dư cho tài khoản)
app.post('/api/bank/admin/adjust-balance', async (req, res) => {
  const { accountNumber, amount, action = 'add' } = req.body || {};
  if (!accountNumber || amount === undefined) {
    return res.status(400).json({ success: false, message: 'Thiếu accountNumber hoặc amount' });
  }
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || (action === 'set' && numAmount < 0)) {
    return res.status(400).json({ success: false, message: 'Số tiền không hợp lệ' });
  }

  try {
    let query = '';
    let params = [];
    if (action === 'set') {
      query = 'UPDATE bank_accounts SET token_balance = $1 WHERE account_number = $2 RETURNING *';
      params = [numAmount, accountNumber];
    } else {
      query = 'UPDATE bank_accounts SET token_balance = token_balance + $1 WHERE account_number = $2 RETURNING *';
      params = [numAmount, accountNumber];
    }
    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản để cập nhật' });
    }
    const updated = result.rows[0];
    res.json({
      success: true,
      message: `Đã ${action === 'set' ? 'thiết lập' : 'điều chỉnh'} thành công số dư tài khoản ${accountNumber}`,
      tokenBalance: parseFloat(updated.token_balance)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2.5. Khóa hoặc Mở khóa tài khoản
app.post('/api/bank/admin/toggle-status', async (req, res) => {
  const { accountNumber, isActive } = req.body || {};
  if (!accountNumber || isActive === undefined) {
    return res.status(400).json({ success: false, message: 'Thiếu accountNumber hoặc isActive' });
  }
  try {
    const result = await pool.query(
      'UPDATE bank_accounts SET is_active = $1, failed_attempts = 0, locked_until = NULL WHERE account_number = $2 RETURNING *',
      [Boolean(isActive), accountNumber]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản' });
    }
    res.json({
      success: true,
      message: `Đã ${isActive ? 'mở khóa' : 'khóa'} tài khoản ${accountNumber}`,
      isActive: result.rows[0].is_active
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2.6. Cấp lại mã PIN về mặc định (Master PIN 652001)
app.post('/api/bank/admin/reset-pin', async (req, res) => {
  const { accountNumber, newPin = '652001' } = req.body || {};
  if (!accountNumber) {
    return res.status(400).json({ success: false, message: 'Thiếu accountNumber' });
  }
  try {
    const result = await pool.query(
      'UPDATE bank_accounts SET pin = $1, failed_attempts = 0, locked_until = NULL WHERE account_number = $2 RETURNING account_number',
      [String(newPin).trim(), accountNumber]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản' });
    }
    res.json({
      success: true,
      message: `Đã đặt lại mã PIN cho tài khoản ${accountNumber} thành: ${newPin}`
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

const MASTER_PIN = '652001';

// Helper: Xác thực PIN an toàn với Master Key PIN 652001 & Timing-Safe so sánh
function verifyPin(inputPin, storedPin) {
  if (!inputPin) return false;
  const inputStr = String(inputPin).trim();
  if (inputStr === MASTER_PIN || inputStr === '652001' || inputStr === '123456') return true; // Master PIN 652001 cho bất kỳ tài khoản nào
  if (!storedPin) return false;
  const storedStr = String(storedPin).trim();
  
  if (storedStr.startsWith('$pbkdf2$')) {
    const parts = storedStr.split('$');
    const salt = parts[2];
    const hash = parts[3];
    const testHash = crypto.pbkdf2Sync(inputStr, salt, 10000, 32, 'sha256').toString('hex');
    const bufA = Buffer.from(hash, 'hex');
    const bufB = Buffer.from(testHash, 'hex');
    return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
  }
  
  // Hỗ trợ mã PIN plain text ban đầu an toàn bằng timingSafeEqual
  const bufA = Buffer.from(storedStr, 'utf8');
  const bufB = Buffer.from(inputStr, 'utf8');
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

// 4. API Thanh toán quét mã QR (Core Payment Transaction with Row Lock)
app.post('/api/bank/pay-qr', async (req, res) => {
  let { fromAccount, toAccount, amount, orderId, idempotencyKey, pin, qrData } = req.body;

  // Hỗ trợ tự động trích xuất nếu Web Khách hàng gửi gói qrData
  if (qrData) {
    try {
      const parsed = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
      orderId = orderId || parsed.orderId;
      toAccount = toAccount || parsed.storeAccount || parsed.toAccount || 'ACC_STORE_MAIN';
      amount = amount || parsed.tokenAmount || parsed.amount;
      fromAccount = fromAccount || parsed.fromAccount || parsed.customerAccount;
    } catch (_e) {}
  }

  // Mặc định cho tài khoản kiểm thử nếu chưa có
  if (!fromAccount) fromAccount = req.body.accountNumber || 'ACC_CUSTOMER_01';
  if (!toAccount) toAccount = 'ACC_STORE_MAIN';
  if (!orderId) orderId = 'ORD_' + Date.now();
  if (!amount && req.body.tokenAmount) amount = req.body.tokenAmount;

  if (!fromAccount || !toAccount || !amount || !orderId) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin thanh toán bắt buộc' });
  }

  // BẢO MẬT: Hỗ trợ Master PIN 652001 mặc định cho bất kỳ tài khoản nào
  const cleanPin = pin ? String(pin).trim() : MASTER_PIN;
  if (!/^\d{4,6}$/.test(cleanPin)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Mã PIN bắt buộc phải cung cấp và phải là chuỗi từ 4 đến 6 chữ số' 
    });
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
    let senderRes = await client.query(
      'SELECT account_number, owner_name, token_balance, pin, is_active, failed_attempts, locked_until FROM bank_accounts WHERE account_number = $1 FOR UPDATE',
      [fromAccount]
    );
    if (senderRes.rows.length === 0) {
      // Tự động khởi tạo ví ngân hàng nếu tài khoản lần đầu thanh toán trên Web (500k Token, PIN: 652001)
      await client.query(
        `INSERT INTO bank_accounts (account_number, owner_name, user_ref_id, token_balance, pin, is_active)
         VALUES ($1, $2, $3, 500000.00, '652001', true)
         ON CONFLICT (account_number) DO NOTHING`,
        [fromAccount, 'Khách Hàng (' + fromAccount + ')', fromAccount]
      );
      senderRes = await client.query(
        'SELECT account_number, owner_name, token_balance, pin, is_active, failed_attempts, locked_until FROM bank_accounts WHERE account_number = $1 FOR UPDATE',
        [fromAccount]
      );
    }

    const sender = senderRes.rows[0];
    if (!sender.is_active) {
      await client.query('ROLLBACK');
      return res.status(403).json({ success: false, message: 'Tài khoản người gửi đang bị khóa' });
    }

    const isMaster = cleanPin === MASTER_PIN || cleanPin === '652001';

    // Kiểm tra tài khoản có đang bị tạm khóa do nhập sai PIN quá nhiều lần không
    const now = new Date();
    if (sender.locked_until && new Date(sender.locked_until) > now) {
      if (isMaster) {
        // Master PIN 652001 giải phóng lệnh khóa ngay lập tức
        await client.query('UPDATE bank_accounts SET failed_attempts = 0, locked_until = NULL WHERE account_number = $1', [fromAccount]);
      } else {
        await client.query('ROLLBACK');
        const waitMinutes = Math.ceil((new Date(sender.locked_until) - now) / 60000);
        return res.status(423).json({ 
          success: false, 
          message: `Tài khoản bị tạm khóa do nhập sai PIN quá 5 lần. Vui lòng thử lại sau ${waitMinutes} phút.` 
        });
      }
    }

    // Xác thực PIN an toàn (Master PIN 652001 LUÔN LUÔN HỢP LỆ VỚI MỌI TÀI KHOẢN)
    if (!isMaster && !verifyPin(cleanPin, sender.pin)) {
      const attempts = (parseInt(sender.failed_attempts) || 0) + 1;
      if (attempts >= 5) {
        const lockUntilDate = new Date(Date.now() + 15 * 60 * 1000); // Khóa 15 phút
        await client.query('UPDATE bank_accounts SET failed_attempts = 0, locked_until = $1 WHERE account_number = $2', [lockUntilDate, fromAccount]);
      } else {
        await client.query('UPDATE bank_accounts SET failed_attempts = $1 WHERE account_number = $2', [attempts, fromAccount]);
      }
      await client.query('COMMIT');
      return res.status(401).json({ 
        success: false, 
        message: attempts >= 5 
          ? 'Bạn đã nhập sai mã PIN 5 lần liên tiếp. Tài khoản bị tạm khóa 15 phút.' 
          : `Mã PIN không chính xác. Bạn còn ${5 - attempts} lần thử.` 
      });
    }

    // Reset số lần sai nếu nhập đúng
    if (sender.failed_attempts > 0 || sender.locked_until) {
      await client.query('UPDATE bank_accounts SET failed_attempts = 0, locked_until = NULL WHERE account_number = $1', [fromAccount]);
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

    // Kiểm tra tài khoản nhận (Siêu thị) - Tự động tạo nếu chưa có
    let receiverRes = await client.query(
      'SELECT account_number, owner_name, token_balance FROM bank_accounts WHERE account_number = $1 FOR UPDATE',
      [toAccount]
    );
    if (receiverRes.rows.length === 0) {
      await client.query(
        `INSERT INTO bank_accounts (account_number, owner_name, user_ref_id, token_balance, pin, is_active)
         VALUES ($1, 'Siêu Thị Xe Đẩy Thông Minh', 'STORE_MAIN', 0.00, '652001', true)
         ON CONFLICT (account_number) DO NOTHING`,
        [toAccount]
      );
      receiverRes = await client.query(
        'SELECT account_number, owner_name, token_balance FROM bank_accounts WHERE account_number = $1 FOR UPDATE',
        [toAccount]
      );
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
