# Stroller Backend Server (Node.js + PostgreSQL)

Hệ thống Backend API Server phục vụ cho ứng dụng **Smart Stroller (Xe đẩy thông minh)** kết nối trực tiếp đến Cơ sở dữ liệu **PostgreSQL**.

---

## 🛠️ Hướng dẫn cài đặt và chạy Server

### 1. Cài đặt các thư viện phụ thuộc (Dependencies)
Mở Terminal / Command Prompt tại thư mục `server` và chạy câu lệnh:

```bash
npm install
```

### 2. Khởi chạy Server
Chạy câu lệnh sau để bắt đầu khởi chạy server ở chế độ Development:

```bash
npm run dev
```
hoặc:
```bash
npm start
```

Server sẽ lắng nghe tại cổng `3000` (`http://localhost:3000`).

---

## 📌 Danh sách các Endpoint API khả dụng

| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Kiểm tra kết nối server (Health Check) |
| `GET` | `/api/products` | Lấy danh sách tất cả sản phẩm từ PostgreSQL |
| `GET` | `/api/products/search?barcode=...` | Tìm kiếm sản phẩm theo mã vạch Barcode |
| `GET` | `/api/customer?id=...` | Lấy thông tin khách hàng & điểm tích lũy |
| `GET` | `/api/auth/session` | Khởi tạo phiên làm việc QR Code |
| `GET` | `/api/auth/status?sessionId=...` | Kiểm tra trạng thái đăng nhập QR Code |
| `GET` | `/api/cart/status` | Kiểm tra phát hiện sản phẩm chưa quét |
| `POST`| `/api/iot/set-weight-anomaly` | Bật/Tắt cờ cảnh báo cảm biến tải trọng bất thường |

---

## 📡 Công Cụ Ping Giả Lập Cảm Biến (`ping_mock.js` & `ping_unscanned.js`)

Hệ thống cung cấp sẵn các script CLI để giả lập thao tác thêm/bớt sản phẩm hoặc phát hiện bất thường từ cảm biến xe đẩy:

### 1. Xem Menu Danh Sách 14 Sản Phẩm
```bash
node ping_mock.js menu
```

### 2. Thêm / Bớt Sản Phẩm Nhanh
- **Thêm sản phẩm:** `node ping_mock.js <tên_hoặc_mã_vạch>` (VD: `node ping_mock.js coca`, `node ping_mock.js haohao`, `node ping_mock.js 8934588063145`)
- **Bớt sản phẩm:** `node ping_mock.js - <tên_hoặc_mã_vạch>` (VD: `node ping_mock.js - coca`)
- **Xem giỏ hàng hiện tại:** `node ping_mock.js status`
- **Xóa sạch giỏ hàng:** `node ping_mock.js clear`

### 3. Giả Lập Bỏ Hàng KHÔNG Quét Mã (Cảm Biến Tải Trọng Loadcell Bất Thường)
- **Kích hoạt cảnh báo:** `node ping_mock.js unscanned [số_gram]` hoặc `node ping_unscanned.js`
- **Giải tỏa & Mở khóa xe:** `node ping_mock.js resolve` hoặc `node ping_unscanned.js resolve`

