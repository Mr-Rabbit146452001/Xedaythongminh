# Smart Retail Cart Backend

Backend dùng FastAPI, PostgreSQL trên server (hoặc SQLite khi phát triển local)
và gửi telemetry lên ThingsBoard theo mô hình offline-first.

## Kiến trúc

1. Firmware gửi quan sát GM65, Vision AI và HX711 vào REST API.
2. Backend ghi dữ liệu vào SQLite trước.
3. Quyết định hợp lệ cập nhật giỏ hàng trong cùng một transaction.
4. Telemetry được đưa vào bảng `thingsboard_outbox`.
5. Worker gửi dữ liệu lên ThingsBoard. Mất mạng thì dữ liệu vẫn nằm trong
   SQLite và được thử lại theo exponential backoff.

## 1. Cài Python trên Windows

Nếu lệnh `py --version` chưa chạy được, cài Python 3.12 (64-bit) và chọn:

- Add python.exe to PATH
- Install launcher for all users

Mở PowerShell mới và kiểm tra:

```powershell
py --version
```

Trong giai đoạn chưa có SSD, nên chạy backend này trên Windows. Pi chỉ gọi API
qua Wi-Fi. Khi SSD đến, có thể chép nguyên thư mục backend sang Pi mà không đổi
schema SQLite hay luồng ThingsBoard.

## 2. Tạo môi trường backend

```powershell
cd E:\SmartRetailCart_RaspberryPi\backend
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
```

## 3. Chạy local, chưa bật ThingsBoard

Giữ `THINGSBOARD_ENABLED=false` trong `.env`, sau đó chạy:

```powershell
.\.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Nếu Windows Firewall hỏi quyền truy cập, chỉ cho phép trên **Private networks**.

Mở Swagger UI:

```text
http://127.0.0.1:8000/docs
```

Mở PowerShell thứ hai để chạy bài kiểm tra đầy đủ:

```powershell
cd E:\SmartRetailCart_RaspberryPi\backend
powershell -ExecutionPolicy Bypass -File .\test_backend.ps1
```

Database được tạo tại `backend\data\smartcart.db`.

## Chạy với PostgreSQL trên server

Tạo database và user riêng, sau đó đặt biến sau trong `.env` (không commit file
`.env` và không chia sẻ mật khẩu):

```dotenv
DATABASE_URL=
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
POSTGRES_DB=SmartCart_Retail
POSTGRES_USER=SmartCart_App
POSTGRES_PASSWORD=MAT_KHAU_DA_TAO_TRONG_PGADMIN
```

Ứng dụng tự mã hóa ký tự đặc biệt trong mật khẩu khi tạo chuỗi kết nối.

Cài lại dependencies và khởi động backend. Lần khởi động đầu tiên backend sẽ
tạo các bảng cần thiết trong database do `SmartCart_App` sở hữu:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000
```

Kiểm tra `http://127.0.0.1:8000/health`. Trường `database` phải có giá trị
`postgresql`; API không trả chuỗi kết nối hoặc mật khẩu.

## 4. Tạo thiết bị ThingsBoard

1. Đăng nhập ThingsBoard.
2. Vào **Entities → Devices → + Add device**.
3. Đặt tên `SmartCart-Pi4-01`, dùng device profile mặc định.
4. Mở thiết bị, chọn **Copy access token**.
5. Không đăng access token lên GitHub và không gửi ảnh token công khai.

Sửa `.env`:

```dotenv
THINGSBOARD_URL=https://thingsboard.cloud
THINGSBOARD_DEVICE_TOKEN=TOKEN_VUA_COPY
THINGSBOARD_ENABLED=true
```

Nếu dùng ThingsBoard tự cài trong mạng LAN, URL thường có dạng:

```dotenv
THINGSBOARD_URL=http://192.168.1.100:8080
```

Tắt backend bằng `Ctrl+C`, sau đó chạy lại để nạp `.env`.

## 5. Kiểm tra gửi ThingsBoard

Tạo một sự kiện trong Swagger hoặc chạy lại `test_backend.ps1`. Worker sẽ tự
gửi dữ liệu. Có thể ép đồng bộ ngay:

```text
POST /api/v1/thingsboard/sync
```

Kiểm tra:

```text
GET /api/v1/thingsboard/status
```

Trong ThingsBoard, mở thiết bị `SmartCart-Pi4-01` → **Latest telemetry**. Các
key dự kiến gồm:

- `event_type`
- `source`
- `barcode`
- `ai_class`
- `ai_confidence`
- `delta_weight_g`
- `weight_source`
- `decision`
- `cart_quantity`
- `cart_total_vnd`
- `session_id`

## API chính

| Method | Endpoint | Mục đích |
|---|---|---|
| `GET` | `/health` | Sức khỏe DB và trạng thái ThingsBoard |
| `GET` | `/api/v1/products` | Danh mục sản phẩm |
| `PUT` | `/api/v1/products/{barcode}` | Thêm/cập nhật sản phẩm |
| `POST` | `/api/v1/sessions` | Bắt đầu phiên mua hàng |
| `POST` | `/api/v1/events` | Ghi quan sát cảm biến |
| `POST` | `/api/v1/cart/decisions` | Xác minh và thêm/lấy sản phẩm |
| `GET` | `/api/v1/cart/{session_id}` | Đọc giỏ hàng |
| `POST` | `/api/v1/thingsboard/sync` | Gửi ngay hàng đợi telemetry |

## Quy tắc xác minh hiện tại

Một quyết định chỉ được chấp nhận khi:

- Barcode tồn tại và đang hoạt động.
- Lớp AI khớp `vision_class` của sản phẩm.
- AI confidence không thấp hơn `SMARTCART_AI_THRESHOLD`.
- Dấu của `delta_weight_g` đúng với thao tác add/remove.
- Nếu đã khai báo khối lượng chuẩn và sai số, chênh lệch phải nằm trong ngưỡng.
- Không thể remove một sản phẩm chưa có trong giỏ.

Trong giai đoạn chưa có HX711, dùng `weight_source="simulated"`. Khi có phần
cứng, firmware gửi `weight_source="hx711"` mà không cần đổi database.
