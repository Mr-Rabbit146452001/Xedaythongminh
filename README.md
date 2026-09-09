# 🛒 HỆ THỐNG XE ĐẨY BÁN LẺ THÔNG MINH (SMART SHOPPING STROLLER & RETAIL INTELLIGENCE)

Hệ thống **Xe Đẩy Bán Lẻ Thông Minh (Smart Shopping Stroller Ecosystem)** là giải pháp toàn diện cho mô hình siêu thị và trung tâm thương mại thế hệ mới. Dự án tích hợp xuyên suốt giữa **Phần cứng IoT & Cảm biến trên Xe đẩy**, **Ứng dụng di động Android Jetpack Compose**, **Hệ thống Web Quản trị Bán lẻ Next.js 14**, **Cơ sở dữ liệu PostgreSQL**, **Máy chủ Backend Node.js & FastAPI Python**, cùng **Hệ sinh thái Ngân hàng Giả lập Mock Bank**.

---

## 🌟 SƠ ĐỒ KIẾN TRÚC TOÀN HỆ THỐNG

```text
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│                              KIẾN TRÚC TOÀN DIỆN HỆ THỐNG                                 │
└───────────────────────────────────────────────────────────────────────────────────────────┘

   [📷 Camera AI Barcode]       [⚖️ Cảm Biến Cân Nặng Loadcell HX711]
              │                                      │
              └───────────────────┬──────────────────┘
                                  ▼
                     [🤖 Raspberry Pi 4 Controller]
                                  │
                                  ├──────────────────────────────┐
                    (Telemetry)   │                              │ (HTTP/WebSocket)
                                  ▼                              ▼
                     [☁️ ThingsBoard Cloud Gateway]    [📱 Stroller App - Tablet / Phone]
                                  │                     (Android Jetpack Compose, Landscape,
                                  ▼                      Coil, Cuộn cảm ứng 100%, AutoPay)
               [⚡ FastAPI Server (Port 8000)]                   │
               (ThingsBoard, AI Vision Class,                     │ (RESTful API & Ngrok Tunnel)
                Weight Tolerance, Swagger UI)                     │
                                  │                               ▼
                                  └──────────────► [⚙️ Node.js Shop Server (Port 3000)]
                                                   (Quản lý Giỏ hàng, Checkout, Reverse Proxy)
                                                                  │
                                   ┌──────────────────────────────┼──────────────────────────────┐
                                   ▼                              ▼                              ▼
                        [🗄️ PostgreSQL Database]      [🌐 Web Admin Dashboard]        [🏦 Mock Bank Ecosystem]
                        (Bảng: products, carts,       (Next.js 14 - Port 3001)        (Server Port 4000 & App)
                         cart_items, transactions,    (Kho hàng, Đơn hàng,            (Quét VietQR thời gian thực,
                         smart_carts, customers)       Bản đồ 2D Live Stroller Map)    Webhook thanh toán tự động)
```

---

## 🚀 CHI TIẾT CÁC PHÂN HỆ CHÍNH

### 1. 📱 Ứng Dụng Xe Đẩy Thông Minh (`app/` - Android Jetpack Compose)
* **Khóa màn hình xoay ngang (`sensorLandscape`)**: Tương thích hoàn hảo trên cả máy tính bảng đặt trên xe đẩy lẫn điện thoại thông minh cá nhân.
* **Quy trình mua sắm 8 màn hình khép kín**:
  1. `WelcomeScreen`: Chào mừng khách hàng, lựa chọn ngôn ngữ và bắt đầu phiên mua sắm.
  2. `ScanCustomerScreen`: Đăng nhập nhanh qua mã QR thành viên kiểu Zalo hoặc bỏ qua đăng nhập.
  3. `CustomerInfoScreen`: Hiển thị thông tin hội viên, điểm thưởng tích lũy và voucher ưu đãi.
  4. `ScanProductScreen`: Tự động nhận diện sản phẩm qua IoT, hiển thị hình ảnh từ server, kiểm tra trọng lượng và cảnh báo lệch cân.
  5. `CartDetailScreen`: Danh sách giỏ hàng chi tiết, tăng/giảm số lượng và tính tổng tiền tự động.
  6. `PaymentSelectionScreen`: Lựa chọn phương thức thanh toán (VietQR, Thẻ thông minh, Tự động Auto Payment).
  7. `PaymentQRScreen`: Hiển thị mã VietQR động từ Mock Bank Server để quét thanh toán tức thời.
  8. `PaymentSuccessScreen` & `SessionEndedScreen`: In hóa đơn điện tử, tích lũy điểm và hướng dẫn trả xe về trạm quy định.
* **Tự động tải ảnh sản phẩm tĩnh chất lượng cao** thông qua thư viện Coil.
* **Hỗ trợ vuốt cuộn dọc cảm ứng mượt mà 100%** trên toàn bộ các màn hình, không bị xung đột layout.

---

### 2. 🌐 Nền Tảng Web Quản Trị Bán Lẻ Thông Minh (`web-admin/` - Next.js 14)
* **Công nghệ**: Next.js 14 (App Router) + TypeScript + Tailwind CSS theo quy chuẩn thiết kế `DESIGN.md`.
* **5 Phân hệ Quản trị Chuyên sâu**:
  1. **Tổng quan (Dashboard Overview)**: 5 thẻ KPI tài chính thời gian thực, biểu đồ doanh thu tuần, trạng thái đơn hàng.
  2. **Quản lý Sản phẩm (Products Management)**: Danh mục sản phẩm, mã SKU, Barcode, đơn giá, kiểm soát tồn kho.
  3. **Quản lý Kho hàng (Inventory)**: Bento phân bổ giá trị ngành hàng, nhật ký xuất/nhập kho chứng từ.
  4. **Quản lý Đơn hàng (Orders)**: Danh sách hóa đơn thời gian thực, trạng thái thanh toán và hỗ trợ xuất file CSV.
  5. **Giám sát Xe Đẩy Thông Minh (Smart Cart IoT 2D Floor Plan)**: Bản đồ siêu thị 2D trực quan, radar ping vị trí, theo dõi mức pin % và trạng thái Online / Charging / Offline của 20 xe đẩy.

---

### 3. 🏦 Hệ Sinh Thái Ngân Hàng Giả Lập (`mock-bank-app/` & `server/mock-bank/`)
* **Mock Bank Server (Port 4000)**: Giả lập cổng thanh toán ngân hàng hỗ trợ chuẩn VietQR, tạo giao dịch thanh toán và gửi Webhook đồng bộ kết quả sang Shop Server.
* **Mock Bank Android App**: Ứng dụng ngân hàng di động giả lập quét mã QR trên màn hình xe đẩy để xác nhận thanh toán tức thời.

---

### 4. ⚙️ Hệ Thống Backend Đa Dịch Vụ & Cơ Sở Dữ Liệu PostgreSQL
* **Shop Server Express.js (`server/index.js` - Port 3000)**:
  * Xử lý giỏ hàng (`/api/cart`), thêm/xóa sản phẩm, tính toán giảm giá hội viên.
  * Tích hợp Reverse Proxy tự động điều hướng sang Web Admin (Port 3001), Mock Bank (Port 4000) và FastAPI (Port 8000).
* **FastAPI Server Python (`server/fastapi_server.py` - Port 8000)**:
  * Tích hợp ThingsBoard Cloud, xử lý phân loại hình ảnh AI (`vision_class`).
  * Thuật toán kiểm soát dung sai trọng lượng (`expected_weight_g`, `weight_tolerance_g`).
  * Tài liệu Swagger UI tự động tại: `http://localhost:8000/docs`.
* **Cơ sở dữ liệu PostgreSQL (`stroller_db`)**:
  * Các bảng chuẩn: `products`, `customers`, `cart`, `cart_items`, `transactions`, `smart_carts`.

---

## 📁 CẤU TRÚC THƯ MỤC DỰ ÁN

```text
Xedaythongminh/
├── app/                                  # Ứng dụng Android Xe Đẩy (Jetpack Compose)
│   ├── src/main/java/com/example/xedaythongminh/
│   │   ├── data/                         # Repository, Retrofit Client & DTOs
│   │   ├── domain/                       # UseCases & Business Models
│   │   ├── ui/                           # ViewModels, Components & 8 Màn hình
│   │   └── AndroidManifest.xml           # Khóa màn hình ngang (sensorLandscape)
│   └── build.gradle.kts
├── web-admin/                            # Cổng Web Quản trị Bán lẻ (Next.js 14)
│   ├── app/                              # App Router (Dashboard, Products, Orders, Carts)
│   ├── components/                       # Sidebar, Topbar, KpiCards
│   ├── services/                         # API Client đồng bộ Backend
│   └── package.json
├── mock-bank-app/                        # Ứng dụng Android Ngân hàng giả lập
├── server/                               # Hệ thống Máy chủ Backend & CSDL
│   ├── index.js                          # Shop API Server Express.js (Port 3000)
│   ├── db.js                             # Kết nối CSDL PostgreSQL (stroller_db)
│   ├── fastapi_server.py                 # FastAPI ThingsBoard & IoT Gateway (Port 8000)
│   ├── mock-bank/                        # Mock Bank Server (Port 4000)
│   ├── public/images/                    # Kho ảnh sản phẩm tĩnh chất lượng cao
│   ├── init_postgres.sql                 # Script khởi tạo bảng CSDL
│   ├── schema_handover.sql               # Cấu trúc CSDL bàn giao IoT
│   ├── start_all.js                      # Script chạy đồng thời toàn bộ máy chủ
│   └── .env.example                      # File mẫu cấu hình biến môi trường
├── chay_tat_ca_he_thong.bat              # Script 1-click khởi chạy toàn bộ Server
├── chay_web_admin.bat                    # Script 1-click mở Web Admin (Port 3001)
├── chay_mock_bank_ngrok.bat              # Script 1-click bật Mock Bank & Ngrok
├── mo_web_admin_cho_ban_be.bat           # Script 1-click chia sẻ Web Admin qua Internet
└── README.md                             # Tài liệu tổng quan dự án
```

---

## ⚡ HƯỚNG DẪN KHỞI CHẠY HỆ THỐNG

### Cách 1: Khởi chạy 1-Click (Khuyên dùng trên Windows)
1. **Bật toàn bộ hệ thống Server Backend & Ngrok**:
   * Nhấp đúp chuột vào: **`chay_tat_ca_he_thong.bat`**
   *(Tự động kích hoạt Shop Server cổng 3000, Mock Bank cổng 4000, FastAPI cổng 8000 và đường hầm Ngrok).*
2. **Bật giao diện Web Admin Dashboard**:
   * Nhấp đúp chuột vào: **`chay_web_admin.bat`**
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
* Truy cập giao diện tại: `http://localhost:3001`

#### 3. Chạy ứng dụng Android App
* Mở thư mục dự án bằng **Android Studio**.
* Bấm nút **Run ▶️** (`Shift + F10`) để nạp ứng dụng vào máy tính bảng hoặc điện thoại.

---

## 🌿 QUẢN LÝ PHÂN NHÁNH TRÊN GITHUB (GIT BRANCHES)

Dự án được phân chia nhánh rõ ràng để các team làm việc song song không bị xung đột mã nguồn:

| Tên Nhánh | Chức năng & Phạm vi phụ trách |
| :--- | :--- |
| **`main`** | Nhánh chính tích hợp toàn bộ hệ sinh thái: Android App, Web Admin, Server Backend, Mock Bank. |
| **`feature/backend-python-server`** | Nhánh độc lập lưu trữ trọn vẹn 11 file Backend Python (FastAPI, ThingsBoard, Uvicorn, test script). |
| **`feature/hardware-pi-scanner`** | Nhánh làm việc dành riêng cho Team Phần cứng Raspberry Pi & Cảm biến. |

---

## 👨‍💻 TÁC GIẢ & LIÊN HỆ
* **GitHub Repository:** [https://github.com/Mr-Rabbit146452001/Xedaythongminh](https://github.com/Mr-Rabbit146452001/Xedaythongminh)
* **Tác giả:** [Mr-Rabbit146452001](https://github.com/Mr-Rabbit146452001)
* **Email:** levanhungu652001@gmail.com
