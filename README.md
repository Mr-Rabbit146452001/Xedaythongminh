# 🛒 HỆ THỐNG XE ĐẨY BÁN LẺ THÔNG MINH (SMART SHOPPING STROLLER & RETAIL INTELLIGENCE)

Hệ thống **Xe Đẩy Bán Lẻ Thông Minh (Smart Shopping Stroller Ecosystem)** là giải pháp toàn diện cho siêu thị thế hệ mới, kết hợp giữa **Phần cứng IoT & Cảm biến trên Xe đẩy**, **Ứng dụng di động Android Jetpack Compose**, **Hệ sinh thái Thanh toán Ngân hàng Mock Bank**, **Cơ sở dữ liệu PostgreSQL & Node.js Backend**, cùng **Nền tảng Web Quản trị Bán lẻ Thông minh (Web Admin Next.js 14)**.

---

## 🌟 TỔNG QUAN CÁC PHÂN HỆ HỆ THỐNG

Dự án gồm **4 phân hệ chính** hoạt động đồng bộ theo thời gian thực:

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           KIẾN TRÚC TOÀN HỆ THỐNG                               │
└─────────────────────────────────────────────────────────────────────────────────┘

   [📷 Camera & Cảm Biến Cân Nặng IoT]
                   │
                   ▼ (Điều khiển bởi Raspberry Pi)
   [📱 Stroller App - Android Tablet / Mobile] ◄──┐
   (Jetpack Compose, Sensor Landscape, Coil)      │
                   │                              │
                   ▼ (RESTful API & Ngrok Tunnel) │
   [⚙️ Node.js Backend & PostgreSQL] ─────────────┼──────────────┐
   (Port 3000: /api/cart, /api/products, /api/iot)│              │
                   ▲                              │              │
                   │ (Tích hợp Thanh toán QR)     │              ▼
   [🏦 Mock Bank App & Server] ───────────────────┘    [🌐 Web Admin Dashboard]
   (Port 4000: Ngân hàng số giả lập QR)                (Port 3001: Next.js 14)
                                                       (Kho, Đơn hàng, Live Cart)
```

---

## 🚀 CHI TIẾT TỪNG PHÂN HỆ

### 1. 📱 Ứng Dụng Xe Đẩy Thông Minh (`app/` - Android Jetpack Compose)
* **Khóa màn hình ngang (Sensor Landscape)**: Tương thích hoàn hảo trên cả máy tính bảng gắn trên xe đẩy và điện thoại di động cầm tay.
* **Quy trình mua sắm 8 màn hình khép kín**:
  1. `WelcomeScreen`: Chào mừng và giới thiệu tính năng.
  2. `ScanCustomerScreen`: Đăng nhập quét mã QR liên kết tài khoản thành viên.
  3. `CustomerInfoScreen`: Tra cứu hạng thẻ, voucher ưu đãi và điểm tích lũy.
  4. `ScanProductScreen`: Tự động nhận diện sản phẩm qua IoT, hiển thị ảnh sản phẩm, cảnh báo lệch trọng lượng.
  5. `CartDetailScreen`: Chi tiết giỏ hàng và danh sách sản phẩm.
  6. `PaymentSelectionScreen`: Lựa chọn phương thức thanh toán linh hoạt.
  7. `PaymentQRScreen`: Quét mã QR thanh toán ngân hàng thời gian thực.
  8. `PaymentSuccessScreen` & `SessionEndedScreen`: In hóa đơn điện tử, tích điểm và kết thúc phiên mua sắm.
* **Tự động tải ảnh sản phẩm tĩnh** qua thư viện Coil.
* **Hỗ trợ cuộn dọc cảm ứng mượt mà 100%** không bị xung đột layout.

---

### 2. 🌐 Cổng Web Quản Trị Bán Lẻ Thông Minh (`web-admin/` - Next.js 14)
* **Công nghệ**: Next.js 14 (App Router) + TypeScript + Tailwind CSS theo thiết kế chuẩn `DESIGN.md`.
* **5 Chức năng Quản trị Chuyên sâu**:
  1. **Tổng quan (Dashboard Overview)**: Theo dõi 5 chỉ số tài chính KPI, doanh thu 7 ngày, tỷ lệ trạng thái đơn hàng.
  2. **Quản lý Sản phẩm (Products Management)**: Danh sách sản phẩm, mã vạch Barcode, giá bán, tình trạng tồn kho.
  3. **Quản lý Kho hàng (Inventory)**: Bento phân bổ ngành hàng, nhật ký xuất nhập kho chứng từ.
  4. **Quản lý Đơn hàng (Orders)**: Lọc đơn hàng theo thời gian thực, chi tiết hóa đơn và xuất báo cáo CSV.
  5. **Bản đồ Giám sát Xe Đẩy (Smart Cart IoT Floor Plan)**: Bản đồ 2D siêu thị thời gian thực, hiển thị vị trí, mức pin và trạng thái Online/Charging/Offline của 20 xe đẩy.

---

### 3. 🏦 Hệ Sinh Thái Ngân Hàng Giả Lập (`mock-bank-app/` & `server/mock-bank/`)
* **Mock Bank Server (Port 4000)**: Giả lập cổng thanh toán ngân hàng hỗ trợ chuẩn VietQR, tạo giao dịch thanh toán và webhook đồng bộ sang Shop Server.
* **Mock Bank Android App**: Ứng dụng ngân hàng quét mã QR trên màn hình xe đẩy để thanh toán tức thời.

---

### 4. ⚙️ Máy Chủ Backend & Cơ Sở Dữ Liệu (`server/` & PostgreSQL)
* **Cơ sở dữ liệu PostgreSQL (`stroller_db`)**: Quản lý các bảng `Products`, `Customers`, `Cart`, `CartItems`, `Transactions`, `SmartCarts`.
* **Hệ thống RESTful API**: Quản lý giỏ hàng, nhận tín hiệu giả lập IoT Scanner từ Raspberry Pi, kiểm soát bất thường trọng lượng.
* **Đường hầm Ngrok**: Tạo đường dẫn HTTPS công khai kết nối xuyên mạng Wi-Fi và 4G/5G.

---

## 📁 CẤU TRÚC THƯ MỤC DỰ ÁN

```text
Xedaythongminh/
├── app/                                  # Ứng dụng Android Xe Đẩy (Jetpack Compose)
│   ├── src/main/java/com/example/xedaythongminh/
│   │   ├── data/                         # Repository, Retrofit Client & DTOs
│   │   ├── domain/                       # UseCases & Business Models
│   │   ├── ui/                           # ViewModels, Components & 8 Màn hình
│   │   └── AndroidManifest.xml           # Cấu hình khóa xoay ngang
│   └── build.gradle.kts
├── web-admin/                            # Web Dashboard Quản trị (Next.js 14)
│   ├── app/                              # App Router (Dashboard, Products, Orders, Carts)
│   ├── components/                       # Sidebar, Topbar, KpiCards
│   ├── services/                         # API Client đồng bộ Backend
│   └── package.json
├── mock-bank-app/                        # Ứng dụng Android Ngân hàng giả lập
├── server/                               # Node.js Express Backend & PostgreSQL
│   ├── index.js                          # Shop API Server (Port 3000)
│   ├── db.js                             # Kết nối PostgreSQL (stroller_db)
│   ├── mock-bank/                        # Mock Bank Server (Port 4000)
│   ├── public/images/                    # Kho ảnh sản phẩm chất lượng cao
│   ├── init_postgres.sql                 # Script tạo bảng CSDL
│   └── start_all.js                      # Script chạy đồng thời toàn bộ máy chủ
├── chay_tat_ca_he_thong.bat              # Script 1-click khởi chạy toàn bộ Server
├── chay_web_admin.bat                    # Script 1-click mở Web Admin (Port 3001)
├── mo_web_admin_cho_ban_be.bat           # Script 1-click mở Web Admin ra Internet qua Ngrok
└── README.md                             # Tài liệu tổng quan dự án
```

---

## ⚡ HƯỚNG DẪN KHỞI CHẠY HỆ THỐNG

### Cách 1: Khởi chạy nhanh 1-Click (Khuyên dùng trên Windows)
1. **Bật toàn bộ hệ thống Server Backend & Ngrok**:
   * Nhấp đúp chuột vào file: **`chay_tat_ca_he_thong.bat`**
   *(Tự động bật Shop Server cổng 3000, Mock Bank Server cổng 4000 và đường hầm Ngrok).*
2. **Bật giao diện Web Admin**:
   * Nhấp đúp chuột vào file: **`chay_web_admin.bat`**
   *(Tự động mở trình duyệt tại địa chỉ `http://localhost:3001`).*

---

### Cách 2: Khởi chạy thủ công bằng Terminal

#### 1. Khởi chạy Shop Server Backend
```powershell
cd server
npm install
node start_all.js
```

#### 2. Khởi chạy Web Admin Dashboard
```powershell
cd web-admin
npm install
npm run dev
```
* Mở trình duyệt truy cập: `http://localhost:3001`

#### 3. Chạy ứng dụng Android App
* Mở thư mục dự án bằng **Android Studio**.
* Chọn build target và bấm **Run ▶️** (`Shift + F10`).

---

## 👨‍💻 TÁC GIẢ & BẢN QUYỀN
* **Tác giả:** [Mr-Rabbit146452001](https://github.com/Mr-Rabbit146452001)
* **Kho lưu trữ:** [https://github.com/Mr-Rabbit146452001/Xedaythongminh](https://github.com/Mr-Rabbit146452001/Xedaythongminh)
* **Email:** levanhungu652001@gmail.com
