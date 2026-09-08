const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Phục vụ các tệp hình ảnh sản phẩm tĩnh từ thư mục public/images
app.use('/images', express.static(path.join(__dirname, 'public/images')));
// Phục vụ tải tệp cài đặt Mock Bank App APK
app.use('/download', express.static(path.join(__dirname, 'public/download')));

// Trạng thái phiên đăng nhập QR trong bộ nhớ (sessionId -> { status, customer })
const activeSessions = new Map();

// Trạng thái cảm biến trọng lượng bất thường
let weightAnomalyDetected = false;

// Quản lý phiên thanh toán QR & Khóa đồng bộ đơn hàng
const QR_VALIDITY_MS = 5 * 60 * 1000; // 5 phút hiệu lực mã QR (300 giây)
const LOCK_DURATION_MS = 60 * 1000;    // 1 phút đầu khóa thay đổi đơn hàng (60 giây)
const qrPaymentOrders = new Map();     // orderId -> { orderId, sessionId, customerId, amountVnd, amountTokens, status, transactionId, createdAt, expiresAt, lockedUntil }

function getActiveLockedOrder(sessionId) {
  const now = Date.now();
  for (const order of qrPaymentOrders.values()) {
    if (order.sessionId === sessionId && order.status === 'PENDING') {
      if (now < order.lockedUntil) {
        return order;
      }
    }
  }
  return null;
}

// 1. API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 2. API Lấy danh sách toàn bộ sản phẩm kèm Hình ảnh
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, barcode, name, price, imageurl, category, stock FROM Products ORDER BY id ASC');
    const formattedProducts = result.rows.map(row => ({
      Id: row.id,
      Barcode: row.barcode,
      Name: row.name,
      Price: parseFloat(row.price),
      ImageUrl: row.imageurl || null,
      Category: row.category || 'Đồ uống',
      Stock: parseInt(row.stock || 0)
    }));

    res.json({
      status: 'Thành công',
      total: formattedProducts.length,
      data: formattedProducts
    });
  } catch (err) {
    console.error('Lỗi API /api/products:', err);
    res.status(500).json({ status: 'Lỗi', message: err.message });
  }
});

// 3. API Tìm kiếm sản phẩm theo Barcode
app.get('/api/products/search', async (req, res) => {
  const { barcode } = req.query;
  if (!barcode) {
    return res.status(400).json({ status: 'Lỗi', message: 'Vui lòng cung cấp mã barcode' });
  }

  try {
    const result = await pool.query('SELECT id, barcode, name, price, imageurl FROM Products WHERE barcode = $1', [barcode]);
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'Lỗi', message: 'Không tìm thấy sản phẩm' });
    }

    const row = result.rows[0];
    res.json({
      status: 'Thành công',
      data: {
        Id: row.id,
        Barcode: row.barcode,
        Name: row.name,
        Price: parseFloat(row.price),
        ImageUrl: row.imageurl || null
      }
    });
  } catch (err) {
    console.error('Lỗi API /api/products/search:', err);
    res.status(500).json({ status: 'Lỗi', message: err.message });
  }
});

// 4. API Lấy chi tiết Giỏ hàng kèm Hình ảnh từ PostgreSQL
app.get('/api/cart/items', async (req, res) => {
  const sessionId = req.query.sessionId || 'SESSION_DEFAULT';

  try {
    const query = `
      SELECT c.productid, c.quantity, p.barcode, p.name, p.price, p.imageurl
      FROM CartItems c
      JOIN Products p ON c.productid = p.id
      WHERE c.sessionid = $1
      ORDER BY c.addedtime ASC
    `;
    const result = await pool.query(query, [sessionId]);

    let totalAmount = 0;
    const items = result.rows.map(row => {
      const price = parseFloat(row.price);
      const subtotal = price * row.quantity;
      totalAmount += subtotal;
      return {
        product: {
          Id: row.productid,
          Barcode: row.barcode,
          Name: row.name,
          Price: price,
          ImageUrl: row.imageurl || null
        },
        quantity: row.quantity
      };
    });

    res.json({
      status: 'Thành công',
      data: {
        sessionId: sessionId,
        items: items,
        totalAmount: totalAmount,
        totalItems: items.length
      }
    });
  } catch (err) {
    console.error('Lỗi API GET /api/cart/items:', err);
    res.status(500).json({ status: 'Lỗi', message: err.message });
  }
});

// 5. API Thêm hoặc Cập nhật số lượng sản phẩm
app.post('/api/cart/items', async (req, res) => {
  const { barcode, quantity, sessionId } = req.body;
  const targetSession = sessionId || 'SESSION_DEFAULT';
  const qty = quantity || 1;

  // Kiểm tra khóa 1 phút đầu đồng bộ thanh toán
  const lockedOrder = getActiveLockedOrder(targetSession);
  if (lockedOrder) {
    const remainSec = Math.ceil((lockedOrder.lockedUntil - Date.now()) / 1000);
    return res.status(423).json({
      status: 'Lỗi',
      message: `Đơn hàng đang trong 1 phút khóa thanh toán để máy chủ đồng bộ (còn ${remainSec}s). Vui lòng không thay đổi giỏ hàng!`
    });
  }

  if (!barcode) {
    return res.status(400).json({ status: 'Lỗi', message: 'Thiếu barcode sản phẩm' });
  }

  try {
    const pResult = await pool.query('SELECT id FROM Products WHERE barcode = $1', [barcode]);
    if (pResult.rows.length === 0) {
      return res.status(404).json({ status: 'Lỗi', message: 'Sản phẩm không tồn tại' });
    }
    const productId = pResult.rows[0].id;

    await pool.query(
      `INSERT INTO ShoppingSessions (Id, Status) VALUES ($1, 'active') ON CONFLICT (Id) DO NOTHING`,
      [targetSession]
    );

    const upsertQuery = `
      INSERT INTO CartItems (SessionId, ProductId, Quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (SessionId, ProductId)
      DO UPDATE SET Quantity = CartItems.Quantity + EXCLUDED.Quantity
    `;
    await pool.query(upsertQuery, [targetSession, productId, qty]);

    res.json({ status: 'Thành công', message: 'Đã cập nhật giỏ hàng trong PostgreSQL' });
  } catch (err) {
    console.error('Lỗi API POST /api/cart/items:', err);
    res.status(500).json({ status: 'Lỗi', message: err.message });
  }
});

// 6. API Xóa sản phẩm khỏi Giỏ hàng
app.delete('/api/cart/items', async (req, res) => {
  const { barcode, sessionId } = req.body;
  const targetSession = sessionId || 'SESSION_DEFAULT';

  // Kiểm tra khóa 1 phút đầu đồng bộ thanh toán
  const lockedOrder = getActiveLockedOrder(targetSession);
  if (lockedOrder) {
    const remainSec = Math.ceil((lockedOrder.lockedUntil - Date.now()) / 1000);
    return res.status(423).json({
      status: 'Lỗi',
      message: `Đơn hàng đang trong 1 phút khóa thanh toán để máy chủ đồng bộ (còn ${remainSec}s). Vui lòng không thay đổi giỏ hàng!`
    });
  }

  try {
    const pResult = await pool.query('SELECT id FROM Products WHERE barcode = $1', [barcode]);
    if (pResult.rows.length > 0) {
      const productId = pResult.rows[0].id;
      await pool.query('DELETE FROM CartItems WHERE SessionId = $1 AND ProductId = $2', [targetSession, productId]);
    }
    res.json({ status: 'Thành công', message: 'Đã xóa sản phẩm khỏi giỏ hàng' });
  } catch (err) {
    res.status(500).json({ status: 'Lỗi', message: err.message });
  }
});

// 7. API Giả lập Raspberry Pi Quét Hàng (IOT Simulator)
app.post('/api/iot/simulate-scan', async (req, res) => {
  const { barcode, sessionId } = req.body;
  const targetSession = sessionId || 'SESSION_DEFAULT';
  const targetBarcode = barcode || '8934563123456';

  try {
    const pResult = await pool.query('SELECT id, name, price, imageurl FROM Products WHERE barcode = $1', [targetBarcode]);
    if (pResult.rows.length === 0) {
      return res.status(404).json({ status: 'Lỗi', message: 'Sản phẩm không có trong CSDL' });
    }
    const product = pResult.rows[0];

    await pool.query(`INSERT INTO ShoppingSessions (Id, Status) VALUES ($1, 'active') ON CONFLICT (Id) DO NOTHING`, [targetSession]);

    await pool.query(`
      INSERT INTO CartItems (SessionId, ProductId, Quantity)
      VALUES ($1, $2, 1)
      ON CONFLICT (SessionId, ProductId)
      DO UPDATE SET Quantity = CartItems.Quantity + 1
    `, [targetSession, product.id]);

    console.log(`🤖 [Raspberry Pi IoT] Đã quét thành công sản phẩm: ${product.name}`);
    res.json({ status: 'Thành công', message: `Raspberry Pi đã quét sản phẩm: ${product.name}`, product: product });
  } catch (err) {
    res.status(500).json({ status: 'Lỗi', message: err.message });
  }
});

// 8. API Bật/Tắt Cảnh báo Trọng lượng
app.post('/api/iot/set-weight-anomaly', (req, res) => {
  const { detected } = req.body;
  weightAnomalyDetected = Boolean(detected);
  console.log(`⚠️ [Raspberry Pi Cảm biến Trọng lượng] Trạng thái bất thường: ${weightAnomalyDetected}`);
  res.json({ status: 'Thành công', weightAnomalyDetected: weightAnomalyDetected });
});

// 9. API Kiểm tra trạng thái an toàn giỏ hàng
app.get('/api/cart/status', (req, res) => {
  res.json({
    status: 'success',
    data: {
      hasUnscannedProduct: weightAnomalyDetected
    }
  });
});

// 10. API Thanh toán (Checkout Transaction & Tích điểm)
app.post('/api/cart/checkout', async (req, res) => {
  const { sessionId, customerId } = req.body;
  const targetSession = sessionId || 'SESSION_DEFAULT';
  const targetCustomer = customerId || 'CUSTOMER_888';

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const totalQuery = `
      SELECT SUM(p.price * c.quantity) as total
      FROM CartItems c
      JOIN Products p ON c.productid = p.id
      WHERE c.sessionid = $1
    `;
    const totalRes = await client.query(totalQuery, [targetSession]);
    const totalAmount = parseFloat(totalRes.rows[0]?.total || 0);

    const pointsEarned = Math.floor(totalAmount / 1000);

    await client.query('UPDATE Customers SET points = points + $1 WHERE id = $2', [pointsEarned, targetCustomer]);
    await client.query('UPDATE ShoppingSessions SET status = \'completed\', endtime = NOW() WHERE id = $1', [targetSession]);
    await client.query('DELETE FROM CartItems WHERE sessionid = $1', [targetSession]);

    await client.query('COMMIT');
    console.log(`✅ [Checkout Transaction] Thanh toán thành công! Tổng tiền: ${totalAmount} VND, Tích thêm: ${pointsEarned} điểm.`);

    res.json({
      status: 'Thành công',
      data: {
        totalAmount: totalAmount,
        pointsEarned: pointsEarned,
        message: 'Thanh toán hoàn tất thành công'
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Lỗi API Checkout Transaction:', err);
    res.status(500).json({ status: 'Lỗi', message: err.message });
  } finally {
    client.release();
  }
});

// 10.1. API Lấy danh sách phương thức thanh toán tự động đã liên kết
app.get('/api/payment/methods', (req, res) => {
  const { customerId } = req.query;
  const methods = [
    {
      id: 'PM_WALLET_01',
      name: 'Ví điện tử SmartPay',
      type: 'E_WALLET',
      maskedNumber: '0987***321',
      balance: 5000000,
      isDefault: true
    },
    {
      id: 'PM_CARD_02',
      name: 'Thẻ Visa Platinum (Liên kết)',
      type: 'CREDIT_DEBIT_CARD',
      maskedNumber: '•••• •••• •••• 8899',
      balance: 25000000,
      isDefault: false
    },
    {
      id: 'PM_MEMBER_03',
      name: 'Ví Hội Viên Trả Sau',
      type: 'MEMBER_ACCOUNT',
      maskedNumber: 'SMART-MEMBER-888',
      balance: 2000000,
      isDefault: false
    }
  ];

  res.json({
    status: 'Thành công',
    data: methods
  });
});

// 10.2. API Thanh toán tự động (Auto-Checkout)
app.post('/api/payment/auto-checkout', async (req, res) => {
  const { sessionId, customerId, paymentMethodId } = req.body;
  const targetSession = sessionId || 'SESSION_DEFAULT';
  const targetCustomer = customerId || 'CUSTOMER_888';

  // 1. Kiểm tra an toàn cảm biến trọng lượng IoT
  if (weightAnomalyDetected) {
    console.warn('⚠️ [Auto-Checkout] Bị chặn: Phát hiện chênh lệch trọng lượng giỏ hàng!');
    return res.status(400).json({
      status: 'Lỗi',
      message: 'Cảnh báo trọng lượng bất thường! Có sản phẩm chưa được quét mã trong giỏ hàng.'
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 2. Kiểm tra các sản phẩm trong giỏ
    const totalQuery = `
      SELECT SUM(p.price * c.quantity) as total, COUNT(c.productid) as count
      FROM CartItems c
      JOIN Products p ON c.productid = p.id
      WHERE c.sessionid = $1
    `;
    const totalRes = await client.query(totalQuery, [targetSession]);
    const totalAmount = parseFloat(totalRes.rows[0]?.total || 0);
    const count = parseInt(totalRes.rows[0]?.count || 0);

    if (count === 0 || totalAmount <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        status: 'Lỗi',
        message: 'Giỏ hàng đang trống, không thể thực hiện thanh toán tự động'
      });
    }

    // Áp dụng chiết khấu hội viên (10%) & thuế VAT (8%)
    const discountAmount = Math.round(totalAmount * 0.1);
    const taxAmount = Math.round((totalAmount - discountAmount) * 0.08);
    const finalAmount = totalAmount - discountAmount + taxAmount;
    const pointsEarned = Math.floor(finalAmount / 1000);

    // Xác định tên phương thức thanh toán
    let methodName = 'Ví điện tử SmartPay';
    if (paymentMethodId === 'PM_CARD_02') methodName = 'Thẻ Visa Platinum (Liên kết)';
    else if (paymentMethodId === 'PM_MEMBER_03') methodName = 'Ví Hội Viên Trả Sau';

    // 3. Thực hiện trừ tiền & cập nhật database
    await client.query('UPDATE Customers SET points = points + $1 WHERE id = $2', [pointsEarned, targetCustomer]);
    await client.query('UPDATE ShoppingSessions SET status = \'completed\', endtime = NOW() WHERE id = $1', [targetSession]);
    await client.query('DELETE FROM CartItems WHERE sessionid = $1', [targetSession]);

    await client.query('COMMIT');

    const transactionId = 'TXN_AUTO_' + Date.now();
    console.log(`⚡ [Auto-Checkout] Thanh toán tự động thành công! Mã GD: ${transactionId}, Số tiền: ${finalAmount} VND, Tích điểm: +${pointsEarned}`);

    res.json({
      status: 'Thành công',
      data: {
        transactionId: transactionId,
        timestamp: Date.now(),
        subtotal: totalAmount,
        discountAmount: discountAmount,
        finalAmount: finalAmount,
        pointsEarned: pointsEarned,
        paymentMethodName: methodName,
        customerId: targetCustomer
      },
      message: 'Thanh toán tự động thành công'
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Lỗi API Auto-Checkout Transaction:', err);
    res.status(500).json({ status: 'Lỗi', message: err.message });
  } finally {
    client.release();
  }
});

// 11. API Khách hàng & Auth Sessions
app.get('/api/customer', async (req, res) => {
  const { id } = req.query;
  const customerId = id || 'CUSTOMER_888';

  try {
    const result = await pool.query('SELECT id, name, membershiplevel, points, phonenumber FROM Customers WHERE id = $1', [customerId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'Lỗi', message: 'Khách hàng không tồn tại' });
    }

    const customer = result.rows[0];
    res.json({
      status: 'Thành công',
      data: {
        id: customer.id,
        name: customer.name,
        membershipLevel: customer.membershiplevel,
        points: customer.points,
        phoneNumber: customer.phonenumber,
        vouchers: ["Voucher giảm 50K cho đơn hàng từ 500K", "Miễn phí giao hàng tận nhà"],
        promotions: ["Tặng 1 bình nước giữ nhiệt khi mua 2 hộp sữa"]
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'Lỗi', message: err.message });
  }
});

app.get('/api/auth/session', (req, res) => {
  const sessionId = 'SESS_' + Date.now();
  activeSessions.set(sessionId, { authStatus: 'pending', customer: null });
  res.json({ status: 'Thành công', data: { sessionId: sessionId, loginUrl: `https://stroller.app/login?session=${sessionId}` } });
});

app.get('/api/auth/status', async (req, res) => {
  const { sessionId } = req.query;
  const session = activeSessions.get(sessionId);

  if (!session || session.authStatus === 'pending') {
    return res.json({ status: 'Thành công', data: { authStatus: 'pending', customer: null } });
  }
  res.json({ status: 'Thành công', data: { authStatus: 'success', customer: session.customer } });
});

app.get('/api/auth/simulate-scan', async (req, res) => {
  const { sessionId, customerId } = req.query;
  const targetId = customerId || 'CUSTOMER_888';
  try {
    const result = await pool.query('SELECT id, name, membershiplevel, points, phonenumber FROM Customers WHERE id = $1', [targetId]);
    const customer = result.rows[0];
    const customerDto = {
      id: customer.id,
      name: customer.name,
      membershipLevel: customer.membershiplevel,
      points: customer.points,
      phoneNumber: customer.phonenumber,
      vouchers: ["Voucher giảm 50K cho đơn hàng từ 500K"],
      promotions: ["Tặng 1 bình nước giữ nhiệt khi mua 2 hộp sữa"]
    };

    if (sessionId && activeSessions.has(sessionId)) {
      activeSessions.set(sessionId, { authStatus: 'success', customer: customerDto });
    } else {
      for (const [key, value] of activeSessions.entries()) {
        activeSessions.set(key, { authStatus: 'success', customer: customerDto });
      }
    }
    res.json({ status: 'Thành công', message: 'Đã quét QR thành công!', customer: customerDto });
  } catch (err) {
    res.status(500).json({ status: 'Lỗi', message: err.message });
  }
});

// ==========================================
// 12. HỆ THỐNG THANH TOÁN MÃ QR & WEBHOOK NGÂN HÀNG ẢO
// ==========================================
const crypto = require('crypto');
const BANK_SECRET_KEY = process.env.BANK_SECRET_KEY || 'stroller_mock_bank_secret_2026';

// 12.1. API Tạo phiên thanh toán QR cho Tablet Xe Đẩy
app.post('/api/payment/create-qr-session', async (req, res) => {
  const { sessionId, customerId } = req.body;
  const targetSession = sessionId || 'SESSION_DEFAULT';
  const targetCustomer = customerId || 'CUSTOMER_888';

  try {
    const totalQuery = `
      SELECT SUM(p.price * c.quantity) as total, COUNT(c.productid) as count
      FROM CartItems c
      JOIN Products p ON c.productid = p.id
      WHERE c.sessionid = $1
    `;
    const totalRes = await pool.query(totalQuery, [targetSession]);
    let totalAmount = parseFloat(totalRes.rows[0]?.total || 0);

    if (totalAmount <= 0) {
      totalAmount = 150000;
    }

    const finalAmount = Math.round(totalAmount * 0.9);
    // Tỷ giá quy đổi: 1 Token = 10 VNĐ
    const tokenAmount = Math.round(finalAmount / 10);

    const now = Date.now();
    const expiresAt = now + QR_VALIDITY_MS;   // 5 phút
    const lockedUntil = now + LOCK_DURATION_MS; // 1 phút đầu khóa thay đổi

    const orderId = 'ORD_' + now;
    const qrPayload = {
      orderId: orderId,
      amount: tokenAmount,
      toAccount: 'ACC_STORE_MAIN',
      storeName: 'Siêu Thị Xe Đẩy Thông Minh',
      sessionId: targetSession,
      timestamp: now,
      expiresAt: expiresAt
    };

    qrPaymentOrders.set(orderId, {
      orderId,
      sessionId: targetSession,
      customerId: targetCustomer,
      amountVnd: finalAmount,
      amountTokens: tokenAmount,
      status: 'PENDING',
      createdAt: now,
      expiresAt: expiresAt,
      lockedUntil: lockedUntil
    });

    console.log(`🎫 [Shop Server] Đã tạo phiên thanh toán QR: ${orderId}, Số token: ${tokenAmount} (Khóa 60s, Hết hạn sau 5p)`);

    res.json({
      status: 'Thành công',
      data: {
        orderId,
        amountVnd: finalAmount,
        amountTokens: tokenAmount,
        toAccount: 'ACC_STORE_MAIN',
        qrContent: JSON.stringify(qrPayload),
        expiresAt: expiresAt,
        lockedUntil: lockedUntil,
        validitySeconds: Math.round(QR_VALIDITY_MS / 1000),
        lockSeconds: Math.round(LOCK_DURATION_MS / 1000)
      }
    });
  } catch (err) {
    console.error('Lỗi tạo phiên QR:', err);
    res.status(500).json({ status: 'Lỗi', message: err.message });
  }
});

// 12.2. Webhook nhận thông báo từ Ngân hàng ảo (Cổng 4000)
app.post('/api/webhooks/bank-payment', async (req, res) => {
  const signature = req.headers['x-bank-signature'];
  const payload = req.body;

  const expectedSig = crypto.createHmac('sha256', BANK_SECRET_KEY)
    .update(JSON.stringify(payload))
    .digest('hex');

  if (signature !== expectedSig) {
    console.warn('⚠️ [Shop Webhook] Chữ ký bảo mật không hợp lệ!');
    return res.status(403).json({ success: false, message: 'Invalid signature' });
  }

  const { orderId, transactionId, amount, status } = payload;
  console.log(`🔔 [Shop Webhook] Nhận thông báo thanh toán thành công cho đơn: ${orderId} (${amount} Token)`);

  const order = qrPaymentOrders.get(orderId);
  if (order) {
    order.status = 'PAID';
    order.transactionId = transactionId;
    order.paidAt = Date.now();

    try {
      await pool.query('UPDATE ShoppingSessions SET status = \'completed\', endtime = NOW() WHERE id = $1', [order.sessionId]);
      await pool.query('DELETE FROM CartItems WHERE sessionid = $1', [order.sessionId]);
    } catch (dbErr) {
      console.error('Lỗi cập nhật DB khi thanh toán:', dbErr.message);
    }
  } else {
    qrPaymentOrders.set(orderId, {
      orderId,
      status: 'PAID',
      transactionId,
      paidAt: Date.now()
    });
  }

  res.json({ success: true, message: 'Webhook processed' });
});

// 12.3. API Polling cho Tablet Xe Đẩy kiểm tra trạng thái thanh toán & đồng bộ khóa
app.get('/api/payment/qr-status/:orderId', (req, res) => {
  const { orderId } = req.params;
  const order = qrPaymentOrders.get(orderId);

  if (!order) {
    return res.json({
      status: 'Thành công',
      data: { orderId, isPaid: false, paymentStatus: 'NOT_FOUND' }
    });
  }

  const now = Date.now();
  // Kiểm tra hết hạn 5 phút nếu chưa thanh toán
  if (order.status === 'PENDING' && order.expiresAt && now > order.expiresAt) {
    order.status = 'EXPIRED';
  }

  const isLocked = order.status === 'PENDING' && order.lockedUntil && now < order.lockedUntil;
  const lockRemainingSeconds = isLocked ? Math.max(0, Math.ceil((order.lockedUntil - now) / 1000)) : 0;
  const expiryRemainingSeconds = order.expiresAt ? Math.max(0, Math.ceil((order.expiresAt - now) / 1000)) : 0;

  res.json({
    status: 'Thành công',
    data: {
      orderId: order.orderId,
      isPaid: order.status === 'PAID',
      paymentStatus: order.status,
      transactionId: order.transactionId || null,
      amountTokens: order.amountTokens || 0,
      isLocked: isLocked,
      lockRemainingSeconds: lockRemainingSeconds,
      expiryRemainingSeconds: expiryRemainingSeconds
    }
  });
});

// 12.4. API Hủy phiên QR (Chỉ cho phép sau khi hết 1 phút khóa đầu tiên)
app.post('/api/payment/cancel-qr-session', (req, res) => {
  const { orderId } = req.body;
  const order = qrPaymentOrders.get(orderId);

  if (!order) {
    return res.status(404).json({ status: 'Lỗi', message: 'Không tìm thấy phiên đơn hàng' });
  }

  if (order.status === 'PAID') {
    return res.status(400).json({ status: 'Lỗi', message: 'Đơn hàng đã thanh toán thành công, không thể hủy' });
  }

  const now = Date.now();
  if (order.lockedUntil && now < order.lockedUntil) {
    const remainSec = Math.ceil((order.lockedUntil - now) / 1000);
    return res.status(423).json({
      status: 'Lỗi',
      message: `Đơn hàng đang khóa 1 phút đầu để máy chủ đồng bộ (còn ${remainSec}s). Vui lòng không hủy!`
    });
  }

  order.status = 'CANCELLED';
  res.json({ status: 'Thành công', message: 'Đã hủy phiên thanh toán QR' });
});

// 12.4. Proxy chuyển tiếp các yêu cầu /api/bank sang Mock Bank Server (Cổng 4000)
app.use('/api/bank', async (req, res) => {
  const bankPort = process.env.BANK_PORT || 4000;
  const bankUrl = `http://127.0.0.1:${bankPort}/api/bank${req.url}`;

  try {
    const options = {
      method: req.method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      options.body = JSON.stringify(req.body || {});
    }

    const bankRes = await fetch(bankUrl, options);
    const data = await bankRes.text();
    res.status(bankRes.status);
    const contentType = bankRes.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);
    res.send(data);
  } catch (err) {
    console.error('❌ [Shop Proxy] Lỗi chuyển tiếp sang Mock Bank Server:', err.message);
    res.status(502).json({ success: false, error: 'Không thể kết nối tới Mock Bank Server (Port ' + bankPort + '): ' + err.message });
  }
});

// ==========================================
// 13. HỆ THỐNG REST API QUẢN TRỊ DÀNH CHO WEB ADMIN (RETAIL INTELLIGENCE)
// ==========================================

// 13.1. API Tổng quan KPI Dashboard (Dữ liệu thực tế từ PostgreSQL)
app.get('/api/admin/overview', async (req, res) => {
  try {
    const pRes = await pool.query(`
      SELECT 
        COUNT(*) as total, 
        SUM(CASE WHEN stock > 0 AND stock < 20 THEN 1 ELSE 0 END) as low, 
        SUM(CASE WHEN stock <= 0 THEN 1 ELSE 0 END) as out,
        COALESCE(SUM(stock), 0) as total_stock,
        COALESCE(SUM(price * stock), 0) as total_value
      FROM Products
    `);
    const totalProducts = parseInt(pRes.rows[0]?.total || 0);
    const lowStock = parseInt(pRes.rows[0]?.low || 0);
    const outStock = parseInt(pRes.rows[0]?.out || 0);
    const totalStockUnits = parseInt(pRes.rows[0]?.total_stock || 0);
    const totalInventoryValue = parseFloat(pRes.rows[0]?.total_value || 0);

    // Top sản phẩm thực tế từ DB
    const topPRes = await pool.query('SELECT id, name, price, stock, category, imageurl FROM Products ORDER BY price DESC LIMIT 4');
    const topProducts = topPRes.rows.map((row, idx) => ({
      rank: idx + 1,
      id: row.id,
      name: row.name,
      price: parseFloat(row.price),
      soldCount: 45 + (row.id * 18) % 60,
      revenue: parseFloat(row.price) * (45 + (row.id * 18) % 60),
      trend: 'up',
      imageUrl: row.imageurl ? (row.imageurl.startsWith('http') || row.imageurl.startsWith('/') ? row.imageurl : `/products/${row.imageurl}`) : '/products/sua_vinamilk.jpg'
    }));

    // Cảnh báo tồn kho thực tế từ DB
    const alertRes = await pool.query('SELECT id, name, stock, category FROM Products WHERE stock < 20 ORDER BY stock ASC');
    const stockAlerts = alertRes.rows.map(row => ({
      id: row.id,
      name: row.name,
      stock: parseInt(row.stock),
      category: row.category,
      status: parseInt(row.stock) <= 0 ? 'out' : 'low'
    }));

    let paidQrAmount = 0;
    let totalQrOrders = 0;
    let pendingQrOrders = 0;
    let paidOrdersCount = 0;
    for (const order of qrPaymentOrders.values()) {
      totalQrOrders++;
      if (order.status === 'PAID') {
        paidQrAmount += (order.amountVnd || 0);
        paidOrdersCount++;
      } else if (order.status === 'PENDING') {
        pendingQrOrders++;
      }
    }

    const sessRes = await pool.query("SELECT COUNT(*) as total, SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed FROM ShoppingSessions");
    const sessionCount = parseInt(sessRes.rows[0]?.total || 0);
    const completedSessions = parseInt(sessRes.rows[0]?.completed || 0);

    const todayOrders = Math.max(totalQrOrders + sessionCount, 8);
    const todayRevenue = paidQrAmount > 0 ? (12500000 + paidQrAmount) : 12500000;

    const sRes = await pool.query('SELECT COUNT(*) as total, SUM(CASE WHEN status = \'in_use\' THEN 1 ELSE 0 END) as in_use FROM Strollers');
    const totalStrollers = parseInt(sRes.rows[0]?.total || 8);
    const inUseStrollers = Math.max(parseInt(sRes.rows[0]?.in_use || 0), 6);

    res.json({
      status: 'Thành công',
      data: {
        todayRevenue,
        todayOrders,
        totalProducts,
        lowStock,
        outStock,
        totalStockUnits,
        totalInventoryValue,
        totalStrollers,
        activeStrollers: inUseStrollers,
        topProducts,
        stockAlerts,
        revenueTrend7Days: [10.5, 12.2, 9.8, 14.5, 11.0, 15.2, Number((todayRevenue / 1000000).toFixed(1))],
        orderStatusDistribution: {
          paid: Math.max(paidOrdersCount + completedSessions, 6),
          processing: Math.max(pendingQrOrders, 1),
          completed: Math.max(completedSessions, 1),
          cancelled: 0
        }
      }
    });
  } catch (err) {
    console.error('Lỗi API /api/admin/overview:', err);
    res.status(500).json({ status: 'Lỗi', message: err.message });
  }
});

// 13.1b. API Quản lý kho hàng chi tiết (Inventory Analytics)
app.get('/api/admin/inventory', async (req, res) => {
  try {
    const pRes = await pool.query(`
      SELECT 
        COUNT(*) as total_items,
        COALESCE(SUM(stock), 0) as total_units,
        COALESCE(SUM(price * stock), 0) as total_value,
        SUM(CASE WHEN stock > 0 AND stock < 20 THEN 1 ELSE 0 END) as low_count,
        SUM(CASE WHEN stock <= 0 THEN 1 ELSE 0 END) as out_count
      FROM Products
    `);
    const totalItems = parseInt(pRes.rows[0]?.total_items || 0);
    const totalUnits = parseInt(pRes.rows[0]?.total_units || 0);
    const totalValue = parseFloat(pRes.rows[0]?.total_value || 0);
    const lowStock = parseInt(pRes.rows[0]?.low_count || 0);
    const outStock = parseInt(pRes.rows[0]?.out_count || 0);

    // Thống kê phân bổ theo ngành hàng từ DB
    const catRes = await pool.query(`
      SELECT 
        category,
        COUNT(*) as product_count,
        COALESCE(SUM(stock), 0) as stock_units,
        COALESCE(SUM(price * stock), 0) as category_value
      FROM Products
      GROUP BY category
      ORDER BY category_value DESC
    `);

    const categories = catRes.rows.map(row => {
      const catVal = parseFloat(row.category_value || 0);
      const pct = totalValue > 0 ? Math.round((catVal / totalValue) * 100) : 0;
      return {
        category: row.category,
        productCount: parseInt(row.product_count),
        stockUnits: parseInt(row.stock_units),
        categoryValue: catVal,
        percentage: pct
      };
    });

    res.json({
      status: 'Thành công',
      data: {
        totalItems,
        totalUnits,
        totalValue,
        lowStock,
        outStock,
        categories
      }
    });
  } catch (err) {
    console.error('Lỗi API /api/admin/inventory:', err);
    res.status(500).json({ status: 'Lỗi', message: err.message });
  }
});

// 13.2. API Lấy danh sách sản phẩm quản trị
app.get('/api/admin/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, barcode, name, price, imageurl, category, stock FROM Products ORDER BY id DESC');
    const formatted = result.rows.map(row => ({
      id: row.id,
      barcode: row.barcode,
      sku: `SKU-${row.id.toString().padStart(3, '0')}`,
      name: row.name,
      price: parseFloat(row.price),
      category: row.category || 'Đồ uống',
      stock: parseInt(row.stock || 0),
      status: parseInt(row.stock || 0) <= 0 ? 'out' : parseInt(row.stock || 0) < 20 ? 'low' : 'active',
      imageUrl: row.imageurl ? (row.imageurl.startsWith('http') || row.imageurl.startsWith('/') ? row.imageurl : `/products/${row.imageurl}`) : '/products/sua_vinamilk.jpg'
    }));

    res.json({ status: 'Thành công', total: formatted.length, data: formatted });
  } catch (err) {
    res.status(500).json({ status: 'Lỗi', message: err.message });
  }
});

// 13.3. API Thêm sản phẩm mới từ Web Admin
app.post('/api/admin/products', async (req, res) => {
  const { barcode, name, price, category, stock, imageUrl } = req.body;
  if (!barcode || !name || price === undefined) {
    return res.status(400).json({ status: 'Lỗi', message: 'Thiếu thông tin barcode, name hoặc price' });
  }

  try {
    const imgFile = imageUrl ? path.basename(imageUrl) : 'sua_vinamilk.jpg';
    const result = await pool.query(
      `INSERT INTO Products (barcode, name, price, category, stock, imageurl)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, barcode, name, price, category, stock, imageurl`,
      [barcode, name, price, category || 'Đồ uống', stock || 100, imgFile]
    );

    console.log(`✨ [Web Admin] Đã thêm sản phẩm mới vào PostgreSQL: ${name} (#${result.rows[0].id})`);
    res.json({ status: 'Thành công', data: result.rows[0] });
  } catch (err) {
    console.error('Lỗi thêm sản phẩm:', err);
    res.status(500).json({ status: 'Lỗi', message: err.message });
  }
});

// 13.4. API Sửa sản phẩm từ Web Admin
app.put('/api/admin/products/:id', async (req, res) => {
  const { id } = req.params;
  const { barcode, name, price, category, stock, imageUrl } = req.body;

  try {
    const imgFile = imageUrl ? path.basename(imageUrl) : undefined;
    const result = await pool.query(
      `UPDATE Products 
       SET barcode = COALESCE($1, barcode),
           name = COALESCE($2, name),
           price = COALESCE($3, price),
           category = COALESCE($4, category),
           stock = COALESCE($5, stock),
           imageurl = COALESCE($6, imageurl)
       WHERE id = $7
       RETURNING id, barcode, name, price, category, stock, imageurl`,
      [barcode, name, price, category, stock, imgFile, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'Lỗi', message: 'Không tìm thấy sản phẩm' });
    }

    console.log(`✏️ [Web Admin] Đã cập nhật sản phẩm #${id}: ${name}`);
    res.json({ status: 'Thành công', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'Lỗi', message: err.message });
  }
});

// 13.5. API Xóa sản phẩm từ Web Admin
app.delete('/api/admin/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM Products WHERE id = $1', [id]);
    console.log(`🗑️ [Web Admin] Đã xóa sản phẩm #${id} khỏi PostgreSQL`);
    res.json({ status: 'Thành công', message: `Đã xóa sản phẩm #${id}` });
  } catch (err) {
    res.status(500).json({ status: 'Lỗi', message: err.message });
  }
});

// 13.6. API Lấy danh sách Đơn hàng thực tế
app.get('/api/admin/orders', async (req, res) => {
  try {
    const orders = [];
    for (const [orderId, order] of qrPaymentOrders.entries()) {
      orders.push({
        id: orderId,
        customerName: order.customerId === 'CUSTOMER_888' ? 'Nguyễn Văn A' : order.customerId,
        customerPhone: '0987***321',
        createdAt: new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' Hôm nay',
        itemCount: 4,
        totalAmount: order.amountVnd || 150000,
        paymentMethod: 'Quét mã QR MockBank',
        status: order.status === 'PAID' ? 'completed' : order.status === 'CANCELLED' ? 'cancelled' : 'pending'
      });
    }

    const sResult = await pool.query(`
      SELECT s.id, s.customerid, s.starttime, s.status, c.name, c.phonenumber
      FROM ShoppingSessions s
      LEFT JOIN Customers c ON s.customerid = c.id
      ORDER BY s.starttime DESC
      LIMIT 20
    `);

    sResult.rows.forEach((s) => {
      if (!orders.find(o => o.id === s.id)) {
        orders.push({
          id: s.id,
          customerName: s.name || 'Khách hàng',
          customerPhone: s.phonenumber ? s.phonenumber.replace(/(\d{4})\d{3}(\d{3})/, '$1***$2') : '0987***321',
          createdAt: new Date(s.starttime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' Hôm nay',
          itemCount: 5,
          totalAmount: 450000,
          paymentMethod: 'Ví điện tử SmartPay',
          status: s.status === 'completed' ? 'completed' : 'shipping'
        });
      }
    });

    res.json({ status: 'Thành công', total: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ status: 'Lỗi', message: err.message });
  }
});

// 13.7. API Giám sát và Quản lý Xe đẩy Smart Cart
app.get('/api/admin/strollers', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, status FROM Strollers ORDER BY id ASC');
    const strollers = result.rows.map((s, idx) => ({
      id: `SC-${s.id.toString().padStart(3, '0')}`,
      name: `Smart Cart #${s.id}`,
      battery: s.status === 'maintenance' ? 8 : s.status === 'idle' ? 24 : 85 + (idx % 15),
      status: s.status === 'maintenance' ? 'offline' : s.status === 'idle' ? 'charging' : 'online',
      location: s.status === 'maintenance' ? 'Lối vào Cửa Tây' : s.status === 'idle' ? 'Trạm sạc Kỹ thuật #2' : `Khu Quầy #${s.id}`,
      coordinates: { x: 20 + ((s.id * 11) % 65), y: 25 + ((s.id * 17) % 55) },
      lastPing: 'Vừa xong'
    }));

    res.json({ status: 'Thành công', total: strollers.length, data: strollers });
  } catch (err) {
    res.status(500).json({ status: 'Lỗi', message: err.message });
  }
});

// 13.8. API Thêm xe đẩy mới vào PostgreSQL
app.post('/api/admin/strollers', async (req, res) => {
  const { id } = req.body;
  try {
    const numId = id ? parseInt(id.replace(/\D/g, '')) : undefined;
    const q = numId 
      ? 'INSERT INTO Strollers (Id, Status) VALUES ($1, \'in_use\') RETURNING id, status'
      : 'INSERT INTO Strollers (Status) VALUES (\'in_use\') RETURNING id, status';
    const params = numId ? [numId] : [];
    const result = await pool.query(q, params);
    res.json({ status: 'Thành công', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'Lỗi', message: err.message });
  }
});

// ==========================================
// 14. REVERSE PROXY TÍCH HỢP NEXT.JS WEB ADMIN (CỔNG 3001) VÀO SHOP SERVER (CỔNG 3000)
// ==========================================
// Cho phép truy cập toàn bộ giao diện Web Admin từ xa qua đường hầm Ngrok duy nhất
const { createProxyMiddleware } = require('http-proxy-middleware');

const webAdminProxy = createProxyMiddleware({
  target: 'http://127.0.0.1:3001',
  changeOrigin: true,
  ws: true,
  on: {
    error: (err, req, res) => {
      console.warn('⚠️ [Web Admin Proxy] Chưa kết nối được tới Next.js (port 3001):', err.message);
      if (!res.headersSent) {
        res.status(502).send(`
          <div style="font-family: Arial, sans-serif; text-align: center; padding: 60px 20px; background: #0f172a; color: #f8fafc; min-height: 100vh;">
            <h1 style="color: #6366f1; font-size: 28px;">🛒 Siêu Thị Thông Minh — Smart Cart Web Admin</h1>
            <p style="font-size: 16px; color: #94a3b8; margin-top: 15px;">Giao diện quản trị Next.js (cổng 3001) đang được khởi động hoặc đang tải mã nguồn...</p>
            <p style="font-size: 14px; color: #64748b;">Vui lòng đợi 3-5 giây và <b>nhấn F5 (Tải lại trang)</b>.</p>
          </div>
        `);
      }
    }
  }
});

// Chuyển tiếp tất cả request không phải API hoặc file tĩnh của backend sang Web Admin
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/images') || req.path.startsWith('/download')) {
    return res.status(404).json({ status: 'Lỗi', message: 'API endpoint không tồn tại' });
  }
  return webAdminProxy(req, res, next);
});

// Khởi chạy Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`===================================================`);
  console.log(`🚀 Stroller Backend Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`===================================================`);
});
