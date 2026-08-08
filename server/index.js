const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Phục vụ các tệp hình ảnh sản phẩm tĩnh từ thư mục public/images
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Trạng thái phiên đăng nhập QR trong bộ nhớ (sessionId -> { status, customer })
const activeSessions = new Map();

// Trạng thái cảm biến trọng lượng bất thường
let weightAnomalyDetected = false;

// 1. API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 2. API Lấy danh sách toàn bộ sản phẩm kèm Hình ảnh
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, barcode, name, price, imageurl FROM Products ORDER BY id ASC');
    const formattedProducts = result.rows.map(row => ({
      Id: row.id,
      Barcode: row.barcode,
      Name: row.name,
      Price: parseFloat(row.price),
      ImageUrl: row.imageurl || null
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

// Khởi chạy Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`===================================================`);
  console.log(`🚀 Stroller Backend Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`===================================================`);
});
