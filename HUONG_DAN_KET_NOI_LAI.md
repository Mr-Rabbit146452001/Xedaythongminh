# 📡 CẨM NANG CẤU HÌNH KẾT NỐI & XỬ LÝ KHI ĐỔI WI-FI / MỞ LẠI SERVER

Tài liệu này hướng dẫn chi tiết về **toàn bộ các cổng kết nối (Port)** trong hệ thống Xe Đẩy Thông Minh, cách khởi động lại toàn bộ hệ thống sau khi tắt máy, và các bước cấu hình lại IP khi bị mất mạng, đổi mạng Wi-Fi hoặc dùng 4G/5G.

---

## 📌 PHẦN 1: BẢNG TỔNG HỢP CÁC CỔNG KẾT NỐI (PORTS)

Hệ thống bao gồm các dịch vụ chạy đồng thời trên các cổng sau:

| Cổng (Port) | Dịch vụ phụ trách | Công nghệ | Ai kết nối vào cổng này? | URL truy cập kiểm tra |
| :---: | :--- | :--- | :--- | :--- |
| **`3000`** | **Shop Server (API Gateway)** | Node.js Express | • Tablet Xe đẩy<br>• Web Admin<br>• Mock Bank Callback | `http://localhost:3000/api/health`<br>`http://localhost:3000/api/products` |
| **`4000`** | **Mock Bank Server** | Node.js Express | • App Ngân hàng trên ĐT<br>• Tablet xe đẩy (tự trừ ví) | `http://localhost:4000/api/health` |
| **`8000`** | **AI & Sensor Hub** | Python FastAPI | • Raspberry Pi (AI/Cân)<br>• Port 3000 (Proxy `/api/v1`) | `http://localhost:8000/health`<br>`http://localhost:8000/docs` (Swagger UI) |
| **`3001`** | **Web Admin Dashboard** | Next.js 14 / React | • Quản lý siêu thị (Trình duyệt) | `http://localhost:3001` |
| **`5432`** | **Cơ sở dữ liệu PostgreSQL** | PostgreSQL Server | • Cả 3 Server (3000, 4000, 8000) | `stroller_db` (User: `postgres`) |
| **`4040`** | **Ngrok Web Inspector** | Ngrok Client | • Quản trị viên theo dõi tunnel | `http://localhost:4040` |
| **`9090`** | **ThingsBoard IoT** *(Tùy chọn)* | ThingsBoard | • FastAPI worker gửi telemetry | `http://localhost:9090` |

---

## 📌 PHẦN 2: CÁCH KHỞI ĐỘNG LẠI TOÀN BỘ SERVER KHI MỞ MÁY

Bất kỳ khi nào bạn tắt máy tính, tắt terminal hoặc khởi động lại:

### 👉 Cách 1: Bấm đúp vào file Script có sẵn (Khuyên dùng)
Tại thư mục gốc dự án (`f:\S.Cart\Xedaythongminh`), bấm đúp chuột vào:
```text
chay_tat_ca_he_thong.bat
```
*(Script này sẽ tự động chạy `start_all.js` và kích hoạt toàn bộ 4 server + đường hầm Ngrok).*

---

### 👉 Cách 2: Chạy lệnh bằng Terminal (PowerShell hoặc CMD)
Mở PowerShell tại máy tính và chạy lệnh:
```powershell
cd "f:\S.Cart\Xedaythongminh\server" ; node start_all.js
```

Khi terminal hiện thông báo:
```text
========================================================================
🎉 TOÀN BỘ HỆ SINH THÁI SMART CART ĐÃ SẴN SÀNG!
========================================================================
🛒 Shop Server:       http://localhost:3000
🏦 Mock Bank:         http://localhost:4000
⚡ FastAPI:           http://localhost:8000
🖥️ Web Admin:         http://localhost:3001
📟 Tablet LAN:        http://192.168.x.x:3000
🌐 Ngrok HTTPS:       https://reflex-swipe-placidly.ngrok-free.dev
========================================================================
```
$\rightarrow$ Hệ thống đã hoạt động bình thường!

---

## 📌 PHẦN 3: KỊCH BẢN KHI ĐỔI WI-FI / MẤT KẾT NỐI

Khi bạn đổi sang mạng Wi-Fi khác (hoặc tắt/bật lại router), địa chỉ IP LAN của máy tính máy chủ sẽ bị thay đổi (Ví dụ từ `192.168.1.15` đổi sang `192.168.1.32`).

### Bước 1: Lấy địa chỉ IP LAN mới của máy tính
1. Mở PowerShell hoặc CMD gõ lệnh:
   ```cmd
   ipconfig
   ```
2. Tìm dòng **`IPv4 Address`** của mạng Wi-Fi bạn đang kết nối (Ví dụ: `192.168.1.25`).
3. Lúc này địa chỉ API máy chủ trong mạng nội bộ là:
   $$\text{URL} = \mathbf{http://192.168.1.25:3000/}$$

---

### Bước 2: Cấu hình lại Máy tính bảng Android gắn trên Xe Đẩy
Khi bị mất mạng hoặc đổi IP, ứng dụng xe đẩy sẽ lập tức:
1. Hiện màn hình mờ khóa tương tác với cảnh báo: **"Mất kết nối máy chủ!"**.
2. Bấm vào nút màu xanh: **"Thay đổi IP cấu hình"**.
3. **Nhập địa chỉ mới**:
   * **Nếu xe đẩy và máy tính cùng chung 1 mạng Wi-Fi:**
     Nhập: `http://192.168.1.25:3000/` *(Thay bằng IP máy tính của bạn ở Bước 1)*.
   * **Nếu xe đẩy dùng mạng khác / SIM 4G / Cách xa máy tính:**
     Nhập địa chỉ Ngrok HTTPS công khai (được in trên màn hình `start_all.js`):
     `https://reflex-swipe-placidly.ngrok-free.dev/`
4. Bấm **"Lưu & Thử kết nối"**.
5. Màn hình tự động gỡ khóa, chuông thông báo kết nối lại bình thường!

---

### Bước 3: Cấu hình lại App Ngân Hàng (Mock Bank App trên điện thoại)
1. Mở ứng dụng **Mock Bank** trên điện thoại.
2. Tại màn hình chính, mở mục Cài đặt kết nối (Settings):
   * Nhập URL máy chủ ngân hàng:
     * Dùng chung Wi-Fi: `http://192.168.1.25:4000/`
     * Dùng Ngrok / 4G: `https://reflex-swipe-placidly.ngrok-free.dev/`
3. Bấm **Lưu** để cập nhật.

---

### Bước 4: Cấu hình lại Raspberry Pi (Cụm Camera AI & Cân Loadcell)
Nếu bạn có mạch Raspberry Pi thực tế gắn trên xe:
1. Mở file cấu hình script nhận diện trên Pi (`client.py` hoặc `config.ini`).
2. Sửa lại biến `SERVER_URL`:
   ```python
   SERVER_URL = "http://192.168.1.25:8000"  # Hoặc cổng 3000
   ```
3. Khởi động lại script trên Pi.

---

## 📌 PHẦN 4: KHẮC PHỤC CÁC LỖI THƯỜNG GẶP (TROUBLESHOOTING)

### 🔴 Lỗi 1: Báo lỗi "EADDRINUSE: address already in use :::3000" hoặc "Port 8000 is already in use"
* **Nguyên nhân**: Lần chạy trước bạn tắt cửa sổ nhưng tiến trình Node.js hoặc Python vẫn còn chạy ngầm chiếm cổng.
* **Cách xử lý triệt để**:
  Mở PowerShell chạy 1 dòng lệnh sau để giải phóng toàn bộ cổng:
  ```powershell
  Get-Process -Name node, python, uvicorn, ngrok -ErrorAction SilentlyContinue | Stop-Process -Force
  ```
  Sau đó chạy lại `chay_tat_ca_he_thong.bat`.

---

### 🔴 Lỗi 2: Báo lỗi "database stroller_db does not exist" hoặc không kết nối được PostgreSQL
* **Nguyên nhân**: Dịch vụ PostgreSQL trên Windows chưa được bật.
* **Cách xử lý**:
  1. Nhấn tổ hợp phím `Windows + R`, gõ `services.msc` rồi nhấn `Enter`.
  2. Tìm dịch vụ có tên **`postgresql-x64-...`**.
  3. Chuột phải chọn **Start** (hoặc **Restart**).

---

### 🔴 Lỗi 3: Ngrok bị lỗi hoặc đổi link HTTPS lạ
* **Nguyên nhân**: Tài khoản Ngrok miễn phí tạo subdomain ngẫu nhiên nếu không cấu hình domain tĩnh.
* **Cách xử lý**:
  * Kiểm tra URL Ngrok được in ra trên màn hình console màu tím của `start_all.js`.
  * Copy URL đó dán vào ô **"Thay đổi IP cấu hình"** trên màn hình xe đẩy là kết nối lại được ngay lập tức.
