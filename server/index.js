const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Lưu trữ trạng thái phiên đăng nhập QR trong bộ nhớ (sessionId -> { status: 'pending' | 'success', customer: ... })
const activeSessions = new Map();

// 1. API Health Check (App Android gọi 3 giây/lần để kiểm tra kết nối server)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 2. API Lấy danh sách toàn bộ sản phẩm
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, barcode, name, price FROM Products ORDER BY id ASC');
    const formattedProducts = result.rows.map(row => ({
      Id: row.id,
      Barcode: row.barcode,
      Name: row.name,
      Price: parseFloat(row.price),
      ImageUrl: null
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
    const result = await pool.query('SELECT id, barcode, name, price FROM Products WHERE barcode = $1', [barcode]);
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
        ImageUrl: null
      }
    });
  } catch (err) {
    console.error('Lỗi API /api/products/search:', err);
    res.status(500).json({ status: 'Lỗi', message: err.message });
  }
});

// 4. API Lấy thông tin Khách hàng theo ID
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
        vouchers: [
          "Voucher giảm 50K cho đơn hàng từ 500K",
          "Miễn phí giao hàng tận nhà",
          "Voucher sinh nhật giảm 15%"
        ],
        promotions: [
          "Tặng 1 bình nước giữ nhiệt khi mua 2 hộp sữa",
          "Giảm 20% toàn bộ mặt hàng rau xanh hôm nay"
        ]
      }
    });
  } catch (err) {
    console.error('Lỗi API /api/customer:', err);
    res.status(500).json({ status: 'Lỗi', message: err.message });
  }
});

// 5. API Khởi tạo phiên đăng nhập QR Code (Đợi người dùng quét)
app.get('/api/auth/session', (req, res) => {
  const sessionId = 'SESS_' + Date.now();
  // Khởi tạo phiên ở trạng thái 'pending' (chờ quét)
  activeSessions.set(sessionId, { authStatus: 'pending', customer: null });

  res.json({
    status: 'Thành công',
    data: {
      sessionId: sessionId,
      loginUrl: `https://stroller.app/login?session=${sessionId}`
    }
  });
});

// 6. API Kiểm tra trạng thái phiên đăng nhập QR Code (App Android gọi hỏi 1.5s/lần)
app.get('/api/auth/status', async (req, res) => {
  const { sessionId } = req.query;
  const session = activeSessions.get(sessionId);

  if (!session || session.authStatus === 'pending') {
    // Nếu chưa ai quét, trả về trạng thái chờ 'pending' -> Màn hình QR giữ nguyên
    return res.json({
      status: 'Thành công',
      data: {
        authStatus: 'pending',
        customer: null
      }
    });
  }

  // Nếu đã quét thành công (status == 'success'), trả về thông tin khách hàng -> App tự nhảy sang màn hình Thông tin Khách hàng
  res.json({
    status: 'Thành công',
    data: {
      authStatus: 'success',
      customer: session.customer
    }
  });
});

// 7. API Giả lập quét QR đăng nhập thành công (Dùng để test: Gọi endpoint này để xác nhận đã quét)
app.get('/api/auth/simulate-scan', async (req, res) => {
  const { sessionId, customerId } = req.query;
  const targetId = customerId || 'CUSTOMER_888';

  try {
    const result = await pool.query('SELECT id, name, membershiplevel, points, phonenumber FROM Customers WHERE id = $1', [targetId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'Lỗi', message: 'Khách hàng không tồn tại' });
    }

    const customer = result.rows[0];
    const customerDto = {
      id: customer.id,
      name: customer.name,
      membershipLevel: customer.membershiplevel,
      points: customer.points,
      phoneNumber: customer.phonenumber,
      vouchers: ["Voucher giảm 50K cho đơn hàng từ 500K", "Miễn phí giao hàng"],
      promotions: ["Tặng 1 bình nước giữ nhiệt khi mua 2 hộp sữa"]
    };

    // Đánh dấu phiên đã đăng nhập thành công!
    if (sessionId && activeSessions.has(sessionId)) {
      activeSessions.set(sessionId, { authStatus: 'success', customer: customerDto });
    } else {
      // Nếu không truyền sessionId, áp dụng cho tất cả các phiên đang chờ
      for (const [key, value] of activeSessions.entries()) {
        activeSessions.set(key, { authStatus: 'success', customer: customerDto });
      }
    }

    res.json({ status: 'Thành công', message: 'Đã giả lập quét QR thành công!', customer: customerDto });
  } catch (err) {
    res.status(500).json({ status: 'Lỗi', message: err.message });
  }
});

// 8. API Kiểm tra trạng thái giỏ hàng
app.get('/api/cart/status', (req, res) => {
  res.json({
    status: 'success',
    data: {
      hasUnscannedProduct: false
    }
  });
});

// Khởi chạy Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`===================================================`);
  console.log(`🚀 Stroller Backend Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`===================================================`);
});
