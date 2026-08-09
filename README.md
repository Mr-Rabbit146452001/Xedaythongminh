# 🛒 Hệ Thống Xe Đẩy Thông Minh (Smart Shopping Stroller System)

Dự án **Xe Đẩy Thông Minh (Smart Shopping Stroller)** là hệ thống bán lẻ mua sắm tự động cao cấp, kết hợp giữa **Thiết bị ngoại vi IoT (Raspberry Pi/Camera/Cảm biến trọng lượng)**, **Hệ thống Backend Node.js & CSDL PostgreSQL**, và **Ứng dụng di động Android Jetpack Compose**.

---

## 🌟 Tính Năng Nổi Bật

* **🤖 Tự động nhận diện sản phẩm (IoT Simulation)**:
  * Camera và cảm biến trọng lượng kết nối qua Raspberry Pi tự động nhận diện mã vạch và đẩy dữ liệu lên hệ thống.
  * Tự động phát hiện cảnh báo chênh lệch trọng lượng (sản phẩm chưa quét barcode).
* **📱 Ứng dụng Android Jetpack Compose Đa nền tảng**:
  * **Cố định màn hình ngang (Landscape)** tối ưu cho cả Tablet lắp trên xe đẩy lẫn Điện thoại di động.
  * Giao diện thiết kế theo phong cách siêu thị hiện đại, màu sắc hài hòa (`PrimaryBlue`), bo góc mịn và icon trực quan.
  * Hỗ trợ **cuộn dọc cảm ứng mượt mà 100%** trên toàn bộ 8 màn hình chức năng.
  * Tải và hiển thị hình ảnh sản phẩm chất lượng cao qua thư viện **Coil**.
* **🔐 Đăng nhập QR Zalo-Style**:
  * Quét mã QR trên màn hình xe đẩy để tự động liên kết tài khoản thành viên di động.
* **💳 Thanh toán đa dạng & Tích điểm**:
  * Tích hợp thanh toán QR Code ngân hàng/ví điện tử, tự động tính thuế VAT, giảm giá thành viên và tích điểm đổi thưởng.

---

## 📐 Kiến Trúc Luồng Hoạt Động (System Flow)

$$\text{Thiết bị ngoại vi (Camera/Sensors)} \xrightarrow{\text{Điều khiển}} \text{Raspberry Pi} \xrightarrow{\text{Sync Data}} \text{Node.js Backend & PostgreSQL} \xrightarrow{\text{Real-time Websocket/HTTP}} \text{Android App (Jetpack Compose)}$$

---

## 📁 Cấu Trúc Mã Nguồn (Repository Structure)

```text
Xedaythongminh/
├── app/                                  # Mã nguồn Android App (Jetpack Compose)
│   ├── src/main/
│   │   ├── java/com/example/xedaythongminh/
│   │   │   ├── data/                     # Repository, Models & Retrofit DTOs
│   │   │   ├── ui/                       # ViewModels, Components & Screens
│   │   │   │   ├── components/           # ResponsiveLayout, CameraScanner
│   │   │   │   ├── navigation/           # AppNavigation graph
│   │   │   │   ├── screens/              # 8 Màn hình giao diện chuẩn
│   │   │   │   └── theme/                # Design System & Colors
│   │   └── AndroidManifest.xml           # Khóa màn hình ngang (sensorLandscape)
│   └── build.gradle.kts
├── server/                               # Node.js Express Backend & PostgreSQL
│   ├── index.js                          # RESTful API endpoints & IoT simulation
│   ├── db.js                             # Kết nối CSDL PostgreSQL (stroller_db)
│   ├── public/images/                    # Ảnh sản phẩm tĩnh chất lượng studio
│   ├── init_postgres.sql                 # Script khởi tạo CSDL PostgreSQL
│   ├── update_product_images.js          # Script nạp ảnh sản phẩm
│   └── test_api.js                       # Script kiểm thử API tự động
├── build.gradle.kts                      # Cấu hình Gradle Root
└── README.md                             # Tài liệu dự án
```

---

## 🛠️ Hướng Dẫn Chạy Dự Án

### 1. Khởi chạy Backend Node.js & PostgreSQL
```bash
cd server
npm install
node index.js
```
* API sẽ lắng nghe tại: `http://localhost:3000`

### 2. Biên dịch & Chạy Android App
* Mở thư mục gốc dự án bằng **Android Studio**.
* Bấm nút **Run ▶️** (hoặc tổ hợp phím `Shift + F10`) để chạy ứng dụng trên Emulator hoặc Điện thoại thật.

---

## 👨‍💻 Tác giả
* **GitHub**: [@Mr-Rabbit146452001](https://github.com/Mr-Rabbit146452001)
* **Email**: levanhungu652001@gmail.com
