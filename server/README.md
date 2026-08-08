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
