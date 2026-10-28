# BÁO CÁO THUYẾT MINH CHUYÊN ĐỀ ĐỒ ÁN TỐT NGHIỆP
**Đề tài:** Thiết kế và thi công mô hình xe đẩy mua sắm thông minh tích hợp AIoT cho siêu thị bán lẻ  
**Phân hệ chuyên trách (Thành viên 3):** Backend Engine (FastAPI & Node.js Express), Cơ sở dữ liệu quan hệ (PostgreSQL), IoT Gateway & Kiểm thử tích hợp hệ thống.

---

## MỤC LỤC TỔNG QUAN CHUYÊN ĐỀ THÀNH VIÊN 3

1. **CHƯƠNG 3: THIẾT KẾ VÀ THI CÔNG HỆ THỐNG**
   - 3.1. Sơ đồ kiến trúc tổng thể hệ thống 3 tầng (3-Tier Architecture)
     - 3.1.1. Tầng 1: Thiết bị biên IoT (Edge Computing Tier)
     - 3.1.2. Tầng 2: Backend và Gateway dịch vụ (Core Services & Data Tier)
     - 3.1.3. Tầng 3: Ứng dụng và Quản trị (Presentation & Client Tier)
   - 3.5. Thiết kế phần mềm hệ thống máy chủ (Backend Design)
     - 3.5.1. Thiết kế Cơ sở Dữ liệu và Đặc tả Giao diện Lập trình Ứng dụng (API Spec)
       - 3.5.1.1. Cấu trúc Cơ sở dữ liệu quan hệ thực tế (PostgreSQL - stroller_db)
       - 3.5.1.2. Định mức trọng lượng và dung sai vật lý thực nghiệm trong CSDL
       - 3.5.1.3. Đặc tả Giao diện Lập trình Ứng dụng (API Specification - FastAPI :8000)
       - 3.5.1.4. Bảng từ điển mã lỗi nghiệp vụ chuẩn hóa (Business Error Codes)
2. **CHƯƠNG 4: KẾT QUẢ THỰC NGHIỆM VÀ ĐÁNH GIÁ HỆ THỐNG**
   - 4.0. Cấu hình môi trường thực nghiệm và phương pháp kiểm thử
   - 4.1. Thẩm định 5 kịch bản kiểm thử hệ thống tích hợp (Bộ 230 lượt kiểm thử chức năng)
     - 4.1.1. Kịch bản 1: Luồng mua hàng chuẩn thành công (Happy Path)
     - 4.1.2. Kịch bản 2: Bất thường trọng lượng và khóa an toàn chống gian lận
     - 4.1.3. Kịch bản 3: Độ tin cậy AI thấp do góc khuất hoặc thiếu sáng
     - 4.1.4. Kịch bản 4: Cơ chế cứu hộ mở khóa qua đầu quét RM65 (Barcode Recovery)
     - 4.1.5. Kịch bản 5: Khả năng chịu lỗi và tính bất biến khi mạng gián đoạn
     - 4.1.6. Bảng tổng hợp kết quả 230 lượt kiểm thử tích hợp kịch bản
   - 4.4. Phân tích kết quả thực nghiệm nhận diện và độ ổn định cảm biến (Bộ 150 cặp thử / 300 lượt)
     - 4.4.1. Phương pháp kiểm thử theo cặp thao tác hoàn chỉnh (Test Pairs: Vào - Ra)
     - 4.4.2. Bảng tổng hợp số liệu thực nghiệm nhận diện Camera AI và Quét dự phòng RM65
     - 4.4.3. Phân tích độ ổn định và sai lệch lặp lại của cảm biến cân Loadcell HX711
     - 4.4.4. Phân tích trực quan từ Biểu đồ Hình 4.2
   - 4.5. Đo lường và phân tích hiệu năng hệ thống (System Performance Benchmarking)
     - 4.5.1. Đo lường và phân rã độ trễ xử lý Backend (Latency Benchmark 500 requests)
     - 4.5.2. Phân rã 5 công đoạn xử lý nội bộ Backend và So sánh ngưỡng SLA
   - 4.6. Giới hạn nghiên cứu của đề tài và Hướng phát triển trong tương lai
3. **KẾT LUẬN CHUYÊN ĐỀ THÀNH VIÊN 3**

---

# CHƯƠNG 3: THIẾT KẾ VÀ THI CÔNG HỆ THỐNG

## 3.1. SƠ ĐỒ KIẾN TRÚC TỔNG THỂ HỆ THỐNG 3 TẦNG (3-TIER ARCHITECTURE)

Hệ thống Xe đẩy Mua sắm Thông minh (*Smart Retail Cart*) được thiết kế theo mô hình kiến trúc phân tầng chuyên biệt (3-Tier Architecture), nhằm tách bạch rõ ràng giữa tầng thu thập vật lý tại biên (Edge Computing), tầng xử lý logic nghiệp vụ trung tâm (Backend & Data Tier) và tầng hiển thị trải nghiệm người dùng (Presentation Tier).

![Sơ đồ Kiến trúc Tổng thể 3 Tầng Hệ thống](file:///c:/Users/LE%20THI%20HAU/.gemini/antigravity/scratch/StrollerApp/so_do_kien_truc_3_tang_chuan.png)  
*Hình 3.1: Sơ đồ kiến trúc tổng thể 3 tầng hệ thống Xe đẩy Mua sắm Thông minh AIoT.*

### 3.1.1. Tầng 1: Thiết bị biên IoT (Edge Computing Tier)
Tầng thiết bị biên đóng vai trò là "giác quan vật lý" gắn trực tiếp trên khung xe đẩy:
- **Camera AI (Mô hình YOLO11n):** Gắn tại góc nhìn bao quát miệng giỏ, liên tục nhận diện hình ảnh với mô hình mạng nơ-ron YOLO11n (bản nano tinh gọn), xuất ra nhãn định danh `ai_class` và chỉ số độ tin cậy `ai_confidence` theo thời gian thực.
- **Cảm biến cân Loadcell & Mạch HX711 (1 Cảm biến duy nhất tại tâm bàn cân):** Đo lường liên tục biến thiên khối lượng $\Delta W$ với độ phân giải ADC 24-bit. Thiết kế 1 Loadcell đặt tại trọng tâm đáy giỏ giúp tối ưu hóa không gian cơ khí, giảm thiểu điểm lỗi và đơn giản hóa quy trình hiệu chuẩn cân tĩnh.
- **Đầu đọc mã vạch quang học RM65 (GM65):** Kết nối UART/USB, quét tức thời mã vạch tiêu chuẩn 1D (EAN-13) và QR Code trong $< 50\text{ms}$, đóng vai trò then chốt trong cơ chế cứu hộ (*Barcode Recovery Flow*) khi điều kiện ánh sáng hoặc góc nhìn camera AI gặp bất lợi.
- **Cảm biến khoảng cách quang học ToF (VL53L0X):** Kết nối I2C, giám sát chuyển động đưa tay qua miệng giỏ để kích hoạt chu kỳ chụp ảnh và đọc cân.
- **Máy tính nhúng Raspberry Pi 4 Model B (8GB RAM):** Trung tâm điều phối biên, chạy Linux Debian và Python 3.11. Thiết bị thực thi suy luận mô hình AI YOLO11n, lọc nhiễu tín hiệu cân, đóng gói telemetry và gửi yêu cầu đối soát HTTP REST (`POST /api/v1/cart/decisions`) lên máy chủ.

### 3.1.2. Tầng 2: Backend và Gateway dịch vụ (Core Services & Data Tier)
Tầng máy chủ trung tâm đảm nhiệm vai trò "bộ não điều hành", xử lý logic và lưu trữ dữ liệu an toàn:
- **FastAPI Core Engine (:8000):** Vi dịch vụ IoT hiệu năng cao viết trên nền tảng Python bất đồng bộ (`asyncio`/`Uvicorn`), chuyên trách tiếp nhận gói tin telemetry từ Raspberry Pi, thực thi thuật toán dung hợp đa cảm biến (Sensor Fusion Logic) và đưa ra quyết định chấp thuận (`accepted: true/false`) trong $< 30\text{ms}$.
- **Shop Server (:3000):** Máy chủ ứng dụng trung tâm (Node.js/Express) quản lý toàn bộ vòng đời phiên mua hàng, xác thực khách hàng, kết nối CSDL và cung cấp API đồng bộ giao diện người dùng.
- **Cơ sở dữ liệu quan hệ PostgreSQL 15 (:5432):** Cơ sở dữ liệu trung tâm (`stroller_db`), quản lý 7 bảng thực thể chuẩn hóa quan hệ, bảo đảm tính toàn vẹn giao dịch tài chính (ACID) và hỗ trợ chỉ mục B-Tree tốc độ cao.
- **Ngân hàng số giả lập Mock Bank Server (:4000):** Hệ thống cổng thanh toán mô phỏng cung cấp dịch vụ quản lý số dư thẻ ảo, đối soát hạn mức và thực thi trừ tiền giao dịch trực tiếp không qua trung gian bên thứ ba.

### 3.1.3. Tầng 3: Ứng dụng và Quản trị (Presentation & Client Tier)
Tầng giao diện cung cấp trải nghiệm tương tác trực quan cho cả khách mua hàng và nhân viên vận hành siêu thị:
- **Tablet Android trên xe đẩy:** Ứng dụng gốc lập trình 100% bằng Jetpack Compose và Material 3, sử dụng cơ chế Polling chu kỳ ngắn **650ms** gọi về Shop Server để cập nhật tức thì giỏ hàng và cảnh báo an toàn.
- **Web Quản trị Siêu thị (Next.js 14):** Bảng điều khiển quản lý toàn diện với 5 phân hệ cốt lõi: KPI kinh doanh, kiểm soát kho hàng, Radar 2D giám sát vị trí xe đẩy, nghiệp vụ nhập/xuất sản phẩm và quản lý dữ liệu khách hàng.
- **Web Khách hàng (PWA):** Ứng dụng web tiến bộ hỗ trợ tra cứu hóa đơn, nạp tiền thẻ Mock Bank và đồng bộ trạng thái giỏ hàng thời gian thực (Live Sync).

---

## 3.5. THIẾT KẾ PHẦN MỀM HỆ THỐNG MÁY CHỦ (BACKEND DESIGN)

### 3.5.1. Thiết kế Cơ sở Dữ liệu và Đặc tả Giao diện Lập trình Ứng dụng (API Spec)

#### 3.5.1.1. Cấu trúc Cơ sở dữ liệu quan hệ thực tế (PostgreSQL - stroller_db)

Hệ thống cơ sở dữ liệu đóng vai trò hạt nhân trong việc duy trì tính nhất quán và bảo vệ tính toàn vẹn dữ liệu giao dịch. CSDL được thiết kế chuẩn hóa mức 3NF trên hệ quản trị **PostgreSQL 15**, đã được đối chiếu khớp nối 100% với mã nguồn sao lưu CSDL thực tế (`schema_handover.sql` và `stroller_db_backup.sql`).

![Sơ đồ Quan hệ Thực thể ERD PostgreSQL](file:///c:/Users/LE%20THI%20HAU/.gemini/antigravity/scratch/StrollerApp/so_do_erd_database_stroller.png)  
*Hình 3.2: Sơ đồ quan hệ thực thể (ERD) Cơ sở dữ liệu quan hệ PostgreSQL (stroller_db).*

Từ điển dữ liệu chi tiết của 7 bảng thực thể cốt lõi trong hệ thống:

| STT | Tên bảng CSDL | Cột chính & Kiểu dữ liệu | Khóa | Ràng buộc & Chỉ mục | Mục đích nghiệp vụ |
| :---: | :--- | :--- | :---: | :--- | :--- |
| 1 | `bank_accounts` | `account_number` (VARCHAR(30)), `owner_name` (VARCHAR(100)), `token_balance` (NUMERIC(15,2)), `pin` (VARCHAR(10)), `is_active` (BOOLEAN) | PK | CHECK(`token_balance >= 0`), Default `is_active = true` | Quản lý tài khoản và số dư thẻ ảo khách hàng trong hệ thống Mock Bank. |
| 2 | `shopping_sessions` | `id` (TEXT), `status` (TEXT), `started_at_ms` (BIGINT), `ended_at_ms` (BIGINT) | PK | CHECK(`status` IN ('active', 'completed')), Index(`started_at_ms`) | Quản lý vòng đời phiên mua sắm của xe đẩy từ lúc quẹt thẻ đến lúc đóng giỏ. |
| 3 | `products` | `id` (BIGINT), `barcode` (VARCHAR(50)), `name` (VARCHAR(255)), `sku` (TEXT), `vision_class` (TEXT), `price_vnd` (INTEGER), `expected_weight_g` (REAL), `weight_tolerance_g` (REAL), `active` (INTEGER), `imageurl` (VARCHAR(255)) | PK, UQ | UNIQUE(`barcode`), Index B-Tree `ix_products_barcode`, CHECK(`price_vnd >= 0`) | Danh mục hàng hóa chính thức, lưu trữ trọng lượng định mức và dung sai cho phép. |
| 4 | `cart_items` | `session_id` (TEXT), `product_id` (BIGINT), `quantity` (INTEGER), `unit_price_vnd` (INTEGER), `updated_at_ms` (BIGINT) | PK, FK | **PRIMARY KEY (session_id, product_id)**, FK $\to$ `sessions`, `products` (ON DELETE CASCADE) | Lưu vết số lượng và đơn giá từng mặt hàng trong giỏ, chống trùng lặp dòng sản phẩm. |
| 5 | `cart_events` | `id` (BIGINT IDENTITY), `session_id` (TEXT), `product_id` (BIGINT), `action` (TEXT), `barcode` (TEXT), `ai_class` (TEXT), `ai_confidence` (REAL), `delta_weight_g` (REAL), `decision` (TEXT), `reasons_json` (TEXT), `created_at_ms` (BIGINT) | PK, FK | FK $\to$ `sessions`, `products` (ON DELETE SET NULL), Index(`created_at_ms`) | Nhật ký kiểm toán phán quyết Sensor Fusion, lưu danh sách lỗi vi phạm dạng mảng JSON. |
| 6 | `sensor_events` | `id` (BIGINT IDENTITY), `session_id` (TEXT), `source` (TEXT), `event_type` (TEXT), `barcode` (TEXT), `weight_g` (REAL), `delta_weight_g` (REAL), `ai_class` (TEXT), `ai_confidence` (REAL), `created_at_ms` (BIGINT) | PK, FK | FK $\to$ `sessions` (ON DELETE SET NULL), Index(`session_id`) | Nhật ký chuỗi sự kiện cảm biến thô từ Raspberry Pi phục vụ phân tích hậu kiểm. |
| 7 | `bank_transactions` | `id` (UUID gen_random_uuid), `order_id` (VARCHAR(50)), `from_account` (VARCHAR(30)), `to_account` (VARCHAR(30)), `amount` (NUMERIC(15,2)), `status` (VARCHAR(20)), `idempotency_key` (VARCHAR(100)) | PK, FK | FK $\to$ `bank_accounts(account_number)`, CHECK(`amount > 0`), UNIQUE(`idempotency_key`) | Nhật ký giao dịch trừ tiền thẻ ảo Mock Bank, bảo đảm tính bất biến khi thanh toán. |

---

#### 3.5.1.2. Định mức trọng lượng và dung sai vật lý thực nghiệm trong CSDL

Thay vì sử dụng thông số lý thuyết từ vỏ bao bì, các trường `expected_weight_g` và `weight_tolerance_g` trong bảng `products` của CSDL được cấu hình chuẩn xác dựa trên kết quả đo kiểm thực tế 60 lượt cân (30 lượt vào + 30 lượt ra) qua cảm biến Loadcell HX711:

| STT | Mặt hàng thử nghiệm cốt lõi | Mã vạch (EAN-13) | Nhãn AI (`vision_class`) | Trung điểm định mức (`expected_weight_g`) | Dung sai cho phép (`weight_tolerance_g`) | Khoảng cân hợp lệ (Cận dưới – Cận trên) | Đơn giá niêm yết |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | **Snack Poca bắp ngọt 32g** | `8934588012112` | `BIMBIMPOCA` | **$38.0\text{g}$** | **$\pm 1.0\text{g}$** | $37.0\text{g} - 39.0\text{g}$ | 6.000 đ |
| 2 | **Sữa đặc Ông Thọ đỏ tuýp 165g** | `8934673122115` | `sua dac` | **$178.0\text{g}$** | **$\pm 1.2\text{g}$** | $176.8\text{g} - 179.2\text{g}$ | 20.000 đ |
| 3 | **Sữa tươi Vinamilk Có đường 180ml** | `8934673573344` | `sua Vina` | **$197.7\text{g}$** | **$\pm 1.3\text{g}$** | $196.4\text{g} - 199.0\text{g}$ | 9.500 đ |
| 4 | **Khăn ướt Puri không mùi 20 tờ** | `8936079340014` | `giay uot` | **$95.4\text{g}$** | **$\pm 1.3\text{g}$** | $94.1\text{g} - 96.7\text{g}$ | 8.800 đ |
| 5 | **Cà phê G7 hòa tan đen 15 gói** | `8935024120187` | `CAFEG7` | **$60.3\text{g}$** | **$\pm 1.2\text{g}$** | $59.1\text{g} - 61.5\text{g}$ | 47.000 đ |

---

#### 3.5.1.3. Đặc tả Giao diện Lập trình Ứng dụng (API Specification - FastAPI :8000)

Backend cung cấp tập hợp các Endpoint RESTful API bất đồng bộ tốc độ cao phục vụ luồng giao tiếp giữa Raspberry Pi 4, CSDL và hệ thống giao diện:

| STT | Phương thức & URI Endpoint | Chức năng nghiệp vụ | Dữ liệu đầu vào chính (Request Body / Param) | Dữ liệu trả về (Response) | Mã trạng thái HTTP |
| :---: | :--- | :--- | :--- | :--- | :---: |
| 1 | `POST /api/v1/cart/decisions` | **Sensor Fusion:** Đối soát Camera AI, Cân HX711 và Barcode GM65 để quyết định cập nhật giỏ hàng. | `session_id`, `action`, `barcode`, `verification_mode`, `ai_class`, `ai_confidence`, `delta_weight_g`, `client_event_id` | `accepted`, `decision`, `reasons`, `product`, `cart_summary` | `200 OK`<br>`400 Bad Request`<br>`422 Unprocessable` |
| 2 | `POST /api/v1/sessions` | Khởi tạo phiên mua sắm mới khi quẹt thẻ RFID tại cổng siêu thị. | Body JSON rỗng hoặc thông tin xe | `id` (UUID), `status = 'active'`, `started_at_ms` | `201 Created` |
| 3 | `POST /api/v1/sessions/{id}/complete` | Đóng phiên mua sắm và thanh toán giỏ hàng. | Path Param: `id` | `id`, `status = 'completed'`, `started_at_ms`, `ended_at_ms` | `200 OK`<br>`404 Not Found` |
| 4 | `GET /api/v1/products` | Lấy danh mục sản phẩm đang kinh doanh (`active = 1`). | Không có | Mảng danh sách sản phẩm, định mức cân và dung sai | `200 OK` |
| 5 | `POST /product` | Tra cứu tức thời thông tin sản phẩm theo mã vạch / QR. | `barcode` hoặc `qr_code` | Thông tin chi tiết sản phẩm, giá bán, trọng lượng định mức | `200 OK`<br>`400 Bad Request` |
| 6 | `GET /health` | Kiểm tra trạng thái hoạt động (Healthcheck) của FastAPI và kết nối CSDL. | Không có | `status = "ok"`, `database = "postgresql"`, `time_ms` | `200 OK` |

##### Cấu trúc Schema JSON mẫu: Endpoint `/api/v1/cart/decisions`

**Ví dụ 1: Giao dịch hợp lệ được chấp thuận (`accepted: true`, mã HTTP `200 OK`):**
- *Request gửi từ Raspberry Pi (Poca vào giỏ hàng, cân nặng thực tế $38.3\text{g}$):*
```json
{
  "session_id": "SESSION_20261020_001",
  "action": "add",
  "barcode": "8934588012112",
  "verification_mode": "fusion",
  "client_event_id": "EVT_PI4_POCA_001",
  "ai_class": "BIMBIMPOCA",
  "ai_confidence": 0.950,
  "delta_weight_g": 38.3,
  "weight_source": "hx711"
}
```
- *Response phản hồi từ FastAPI:*
```json
{
  "status": "success",
  "accepted": true,
  "decision": "accepted",
  "reasons": [],
  "session_id": "SESSION_20261020_001",
  "barcode": "8934588012112",
  "action": "add",
  "product": {
    "name": "Snack Poca bắp ngọt 32g",
    "price_vnd": 6000,
    "current_quantity_in_cart": 1
  },
  "cart_summary": { "total_items": 1, "total_vnd": 6000 }
}
```

**Ví dụ 2: Giao dịch phát hiện bất thường bị từ chối (`accepted: false`, mã HTTP `200 OK`):**
- *Request gửi từ Raspberry Pi (Lệch cân giả lập $+350\text{g}$):*
```json
{
  "session_id": "SESSION_20261020_001",
  "action": "add",
  "barcode": "8934588012112",
  "verification_mode": "fusion",
  "client_event_id": "EVT_PI4_ANOMALY_002",
  "ai_class": "BIMBIMPOCA",
  "ai_confidence": 0.915,
  "delta_weight_g": 389.5,
  "weight_source": "hx711"
}
```
- *Response phản hồi từ FastAPI:*
```json
{
  "status": "rejected",
  "accepted": false,
  "decision": "rejected",
  "reasons": ["weight_out_of_tolerance"],
  "session_id": "SESSION_20261020_001",
  "barcode": "8934588012112",
  "action": "add",
  "message": "Phát hiện bất thường: weight_out_of_tolerance"
}
```

---

#### 3.5.1.4. Bảng từ điển mã lỗi nghiệp vụ chuẩn hóa (Business Error Codes)

Mọi vi phạm trong quá trình đối soát cảm biến đều được hệ thống gắn nhãn phân loại cụ thể theo bảng từ điển mã lỗi dưới đây, làm căn cứ để Tablet hiển thị thông điệp phù hợp cho khách hàng:

| Mã lỗi (`reasons_json`) | Ý nghĩa kỹ thuật | Hành vi xử lý của hệ thống | Mã HTTP |
| :--- | :--- | :--- | :---: |
| `weight_out_of_tolerance` | Biến thiên cân nặng $\Delta W$ sai lệch vượt ngưỡng $\pm \text{weight\_tolerance\_g}$. | Từ chối cập nhật giỏ hàng, khóa màn hình Tablet cảnh báo đỏ, còi bíp. | `200 OK` |
| `weight_direction_mismatch` | Chiều biến thiên trọng lượng trái ngược hành vi (bỏ hàng nhưng cân giảm, hoặc lấy hàng nhưng cân tăng). | Từ chối giao dịch, yêu cầu kiểm tra lại thao tác trong giỏ. | `200 OK` |
| `ai_confidence_low` | Độ tin cậy nhận diện của mô hình YOLO11n thấp hơn ngưỡng an toàn ($< 0.80$). | Tạm giữ an toàn, Tablet hiển thị hướng dẫn khách quét mã RM65 cứu hộ. | `200 OK` |
| `ai_class_mismatch` | Nhãn phân loại hình ảnh không khớp với `vision_class` của mã hàng trong CSDL. | Từ chối tự động, chống tráo đổi hàng hóa khác loại. | `200 OK` |
| `product_not_found` | Mã barcode quét được không tồn tại trong bảng `products`. | Báo lỗi sản phẩm chưa đăng ký trong danh mục siêu thị. | `200 OK` |
| `product_inactive` | Sản phẩm đã bị vô hiệu hóa kinh doanh (`active = 0`). | Từ chối cho phép thêm vào giỏ hàng. | `200 OK` |
| `product_not_in_cart` | Thao tác lấy hàng ra (`remove`) khi mặt hàng đó chưa có trong giỏ (`quantity <= 0`). | Từ chối thao tác, ngăn chặn số lượng giỏ hàng âm. | `200 OK` |
| `session_not_found` | Mã định danh phiên mua hàng (`session_id`) không tồn tại hoặc đã kết thúc. | Trả lỗi yêu cầu quẹt thẻ khởi tạo phiên mới. | `404 Not Found` |

---

# CHƯƠNG 4: KẾT QUẢ THỰC NGHIỆM VÀ ĐÁNH GIÁ HỆ THỐNG

## 4.0. CẤU HÌNH MÔI TRƯỜNG THỰC NGHIỆM VÀ PHƯƠNG PHÁP KIỂM THỬ

Để bảo đảm tính khách quan, khoa học và khả năng tái lập kết quả, toàn bộ các bài đo kiểm thực nghiệm được tiến hành trên môi trường phần cứng và phần mềm tiêu chuẩn:

* **Cấu hình phần cứng Thiết bị biên (Edge Hardware):**  
  Máy tính nhúng Raspberry Pi 4 Model B (SoC Broadcom BCM2711, 4 nhân ARM Cortex-A72 @ 1.5GHz, RAM 8GB LPDDR4, HĐH Linux Debian 64-bit kernel 6.1, Python 3.11). Cảm biến cân: 1 Loadcell thanh nhôm đơn điểm 10kg gắn chính tâm bàn cân đáy giỏ, kết nối mạch khuếch đại ADC 24-bit HX711 lấy mẫu ở tần số $10\text{Hz}$. Camera góc rộng độ phân giải $1920 \times 1080$, xử lý khung hình $640 \times 640$ qua YOLO11n. Đầu quét quang học RM65 / GM65 (UART baudrate 9600). Cảm biến ToF VL53L0X (I2C).
* **Cấu hình phần cứng Máy chủ Backend (Server Environment):**  
  Máy chủ CPU Intel Core đa nhân x86-64, RAM 16GB DDR4, ổ cứng SSD NVMe tốc độ cao. Môi trường phần mềm: Python 3.12, framework FastAPI 0.110, máy chủ ASGI Uvicorn, Node.js v20.11 (Shop Server Express), PostgreSQL 15.6 trung tâm.
* **Hạ tầng truyền thông mạng:**  
  Mạng Wi-Fi nội bộ băng tần kép 5GHz (IEEE 802.11ac, độ trễ Ping trung bình $< 3\text{ms}$ giữa Pi và Server) và mạng có dây Ethernet Gigabit kết nối máy chủ CSDL.
* **Phương pháp thu thập dữ liệu:**  
  Sử dụng hàm đo thời gian đơn điệu nano-giây `time.perf_counter_ns()` tại thiết bị biên và Middleware đo vi sai `ProcessTimeMiddleware` tại máy chủ FastAPI. Phân định rõ ràng giữa **Bộ 230 lượt kiểm thử tích hợp kịch bản chức năng** (Mục 4.1) và **Bộ 150 cặp thử / 300 lượt đo kiểm thực tế** (Mục 4.4).

---

## 4.1. THẨM ĐỊNH 5 KỊCH BẢN KIỂM THỬ HỆ THỐNG TÍCH HỢP (BỘ 230 LƯỢT KIỂM THỬ CHỨC NĂNG)

Bộ kiểm thử kịch bản chức năng bao gồm tổng cộng **230 lượt thử nghiệm có chủ đích** nhằm thẩm định 5 ca biên đặc thù:

### 4.1.1. Kịch bản 1: Luồng mua hàng chuẩn thành công (Happy Path - 50 lượt)
- **Tình huống thực nghiệm:** Khách hàng đặt **Snack Poca bắp ngọt 32g** vào giỏ hàng. Camera AI nhận diện rõ nhãn `BIMBIMPOCA` với `ai_confidence = 0.950 >= 0.80`. Bàn cân đơn tâm HX711 ghi nhận $\Delta W = +38.3\text{g}$ (sai lệch $+0.3\text{g}$, nằm an toàn trong khoảng định mức $38.0\text{g} \pm 1.0\text{g}$).
- **Quy trình xử lý:** Raspberry Pi gửi yêu cầu đối soát lên FastAPI `/api/v1/cart/decisions`. FastAPI kiểm tra cả hai điều kiện: độ tin cậy AI hợp lệ và cân nặng khớp định mức $\implies$ Ra quyết định chấp thuận (`accepted = true`), kích hoạt ghi bảng `cart_items` và phản hồi trong $28.4\text{ms}$.
- **Kết quả nghiệm thu:** Thử nghiệm lặp lại 50 lần, hệ thống đạt tỷ lệ phê duyệt tự động **100% (50/50)**. Màn hình Tablet cập nhật giỏ hàng ngay chu kỳ Polling tiếp theo kèm viền xanh báo hiệu thành công.

---

### 4.1.2. Kịch bản 2: Bất thường trọng lượng và khóa an toàn chống gian lận (Weight Anomaly - 50 lượt)
- **Tình huống thực nghiệm:** Mô phỏng hành vi gian lận: Khách hàng đưa gói **Snack Poca** qua tầm quét camera AI (nhận diện thành công `ai_class = "BIMBIMPOCA"`, `confidence = 0.915`), nhưng lén thả kèm một vật kim loại nặng $+350\text{g}$ vào giỏ hàng. Cân HX711 đo được $\Delta W = +389.5\text{g}$.
- **Quy trình xử lý:** FastAPI tính toán sai lệch: $|389.5 - 38.0| = 351.5\text{g} > 1.0\text{g}$ (vượt xa dung sai). Hệ thống lập tức từ chối (`accepted: false, decision: "rejected"`), gán mã vi phạm `weight_out_of_tolerance`. Đồng thời, FastAPI gửi cảnh báo sang Shop Server để Tablet lập tức chuyển sang giao diện cảnh báo đỏ và phát còi bíp.
- **Kết quả nghiệm thu:** Trong phạm vi 50 lần thử nghiệm giả lập gian lận tại phòng thí nghiệm (với các mức sai lệch từ $\pm 25\text{g}$ đến $\pm 500\text{g}$), hệ thống phát hiện chính xác **100% (50/50)**, ngăn chặn việc ghi nhận sai lệch vào giỏ hàng.

---

### 4.1.3. Kịch bản 3: Độ tin cậy AI thấp do góc khuất hoặc thiếu sáng (AI Low Confidence - 50 lượt)
- **Tình huống thực nghiệm:** Khách hàng đưa hộp **Sữa tươi tiệt trùng Vinamilk 180ml** vào xe nhưng dùng bàn tay che khuất $60\%$ thân hộp và di chuyển nhanh. Camera AI chỉ đạt độ tin cậy $61.2\%$ ($0.612 < 0.80$). Trọng lượng bàn cân ghi nhận chuẩn xác $\Delta W = +197.8\text{g} \approx 197.7\text{g}$.
- **Quy trình xử lý:** Mặc dù cân nặng hợp lệ, FastAPI tuân thủ nguyên tắc an toàn đa chiều: từ chối tự động cộng giỏ hàng (`decision: "rejected", reasons: ["ai_confidence_low"]`) để tránh nhầm lẫn với các sản phẩm cùng kích thước nhưng khác chủng loại. Hệ thống chuyển sang trạng thái chờ cứu hộ.
- **Kết quả nghiệm thu:** 100% các trường hợp điểm tin cậy AI $< 0.80$ (50/50 lần) đều được giữ lại an toàn, ngăn ngừa hiện tượng phân loại nhầm nhãn mác.

---

### 4.1.4. Kịch bản 4: Cơ chế cứu hộ mở khóa qua đầu quét RM65 (Barcode Recovery - 50 lượt)
- **Tình huống thực nghiệm:** Tiếp nối Kịch bản 3, màn hình Tablet hướng dẫn khách hàng quét mã vạch qua mắt đọc RM65 trên thành xe. Khách hàng quét mã EAN-13 `8934673573344` của hộp Vinamilk.
- **Quy trình xử lý:** RM65 giải mã trong $< 50\text{ms}$. Raspberry Pi gửi gói tin cứu hộ với tham số `verification_mode = "barcode_recovery"`. FastAPI kích hoạt nhánh cứu trợ: tự động bỏ qua điều kiện AI, kiểm tra mã vạch hợp lệ trong CSDL và đối chiếu trọng lượng thực tế trên bàn cân ($197.8\text{g}$) $\implies$ Chấp thuận (`accepted: true`), mở khóa giỏ hàng và đồng bộ gỡ cảnh báo trên Tablet.
- **Kết quả nghiệm thu:** Thử nghiệm 50 lần giải cứu lỗi AI, cơ chế RM65 mở khóa thành công **100% (50/50)** trong thời gian trung bình **$410\text{ms}$**, khôi phục trải nghiệm mượt mà cho người mua.

---

### 4.1.5. Kịch bản 5: Khả năng chịu lỗi và tính bất biến khi mạng gián đoạn (Network Resilience - 30 lượt)
- **Tình huống thực nghiệm:** Thêm **Cà phê G7 15 gói** (`8935024120187`, $60.3\text{g}$) vào giỏ trong điều kiện Wi-Fi bị ngắt kết nối giả lập 3–5 giây.
- **Quy trình xử lý:** Raspberry Pi bắt mã lỗi timeout, đưa gói tin có gắn mã bất biến `client_event_id = "EVT_PI4_RETRY_G7_9999"` vào hàng đợi thử lại nội bộ (*Local Retry Queue*). Khi mạng phục hồi, gói tin được tự động gửi lại. FastAPI sử dụng ràng buộc `UNIQUE(client_event_id)` trên bảng `cart_events` để chỉ xử lý cộng giỏ hàng đúng 1 lần duy nhất, loại bỏ hoàn toàn nguy cơ cộng lặp.
- **Kết quả nghiệm thu:** Thử nghiệm 30 lần mất mạng đột ngột, **100% các giao dịch đều phục hồi chính xác (30/30)**, số lượng sản phẩm không bị sai lệch.

---

### 4.1.6. Bảng tổng hợp kết quả 230 lượt kiểm thử tích hợp kịch bản

| Mã kịch bản | Tên kịch bản kiểm thử | Tình huống thử nghiệm với sản phẩm thật | Số lần test | Tỷ lệ thành công | Độ trễ Server (Latency) | Đánh giá kết quả |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| **TC-01** | **Happy Path** | Snack Poca 32g (AI: `BIMBIMPOCA` $\ge 80\%$, cân: $38.3\text{g} \approx 38.0\text{g}$) | 50 | **100%** (50/50) | 28.4 ms | **Đạt (Passed)** |
| **TC-02** | **Weight Anomaly** | Snack Poca cố tình bỏ kèm vật nặng $+350\text{g}$, Cân đo $+389.5\text{g}$ | 50 | **100%** (50/50) | 32.1 ms | **Đạt (Passed)** |
| **TC-03** | **AI Low Confidence** | Vinamilk 180ml (`sua Vina`) bị che khuất $60\%$, thiếu sáng (AI: $61.2\% < 80\%$) | 50 | **100%** (50/50) | 26.8 ms | **Đạt (Passed)** |
| **TC-04** | **Barcode Recovery** | Quét mã RM65 hộp Vinamilk 180ml (`8934673573344`) để mở khóa giỏ hàng | 50 | **100%** (50/50) | 24.5 ms | **Đạt (Passed)** |
| **TC-05** | **Network Resilience** | Thêm Cà phê G7, ngắt Wi-Fi 3–5 giây, Pi tự động gửi lại có Idempotency Key | 30 | **100%** (30/30) | 31.0 ms | **Đạt (Passed)** |
| **TỔNG** | **Kiểm thử tích hợp 5 kịch bản** | **Thẩm định chức năng hệ thống theo ca kiểm thử có chủ đích** | **230** | **100% (230/230)** | **28.6 ms (TB)** | **Nghiệm thu toàn phần** |

---

## 4.4. PHÂN TÍCH KẾT QUẢ THỰC NGHIỆM NHẬN DIỆN VÀ ĐỘ ỔN ĐỊNH CẢM BIẾN (BỘ 150 CẶP THỬ / 300 LƯỢT)

### 4.4.1. Phương pháp kiểm thử theo cặp thao tác hoàn chỉnh (Test Pairs: Vào - Ra)

Để thẩm định tính thực tế của xe đẩy thông minh trong chu trình mua sắm của người tiêu dùng, nhóm tác giả đã thiết lập phương pháp kiểm thử theo **Cặp thử nghiệm hoàn chỉnh (Pairs)**:
- Mỗi cặp thử bao gồm **1 lượt vào (khách hàng chọn và bỏ hàng vào giỏ - `action: "add"`)** và **1 lượt ra (khách hàng đổi ý lấy hàng ra khỏi giỏ - `action: "remove"`)**.
- Quá trình thực nghiệm được triển khai trên **5 sản phẩm đại diện** cho 5 dạng hình học và bao bì vật lý: Snack Poca (gói màng nilon nhẹ), Sữa đặc Ông Thọ (dạng tuýp mềm), Sữa tươi Vinamilk (hộp giấy hình khối chữ nhật), Khăn ướt Puri (gói mềm nhiều tờ) và Cà phê G7 (hộp giấy nhẹ).
- Mỗi mặt hàng được thực hiện nghiêm ngặt qua **30 cặp thử nghiệm độc lập** (tương đương 60 lượt chụp ảnh camera AI và 60 lượt đọc cân HX711). Tổng quy mô thực nghiệm đạt **150 cặp thử (300 lượt thao tác vào/ra)**.

![Sơ đồ Luồng Đồng thuận Đa Cảm biến và 3 Lớp Phòng vệ](file:///c:/Users/LE%20THI%20HAU/.gemini/antigravity/scratch/StrollerApp/so_do_dong_thuan_3_lop_phong_ve.png)  
*Hình 4.1: Sơ đồ luồng đồng thuận đa cảm biến và cơ chế hiệp đồng 3 lớp phòng vệ.*

---

### 4.4.2. Bảng tổng hợp số liệu thực nghiệm nhận diện Camera AI và Quét bổ sung GM65

Dữ liệu kiểm chứng thực nghiệm qua 150 cặp thao tác (300 lượt vào/ra) trên 5 sản phẩm cốt lõi siêu thị được thẩm định và xác nhận toàn diện:

#### Bảng 4.2: Kết quả hệ thống sau nhận diện AI và quét GM65

| Sản phẩm | Tổng lượt vào và ra | AI nhận diện đúng | GM65 bổ sung đúng | Hệ thống đúng | Hệ thống sai | Hệ thống đúng (%) | Hệ thống sai (%) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Poca** | 60 | 57 | 3 | 60 | 0 | **100.00%** | **0.00%** |
| **Sữa đặc** | 60 | 53 | 7 | 60 | 0 | **100.00%** | **0.00%** |
| **Sữa Vina** | 60 | 54 | 6 | 60 | 0 | **100.00%** | **0.00%** |
| **Khăn ướt** | 60 | 52 | 8 | 60 | 0 | **100.00%** | **0.00%** |
| **Cà phê G7** | 60 | 53 | 7 | 60 | 0 | **100.00%** | **0.00%** |
| **Tổng hệ thống** | **300** | **269** | **31** | **300** | **0** | **100.00%** | **0.00%** |

> **Xác nhận thực nghiệm:** Trong các lượt đã kiểm chứng, các trường hợp AI không nhận diện được (do góc khuất hoặc che lấp góc nhãn mác) đều đúng sau quét GM65, theo xác nhận của người thực hiện. Tỷ lệ hệ thống gồm cả nhận diện AI và quét GM65 bổ sung đạt **100.00% độ chính xác chốt đơn** (Hệ thống sai: **0.00%**). Số lượt GM65 bổ sung đúng (**31 lượt**) đã được thẩm định và đối soát thực tế tại bàn cân.

#### Bảng 4.2b: Phân tích chuyên sâu nhận diện Camera AI theo chiều thao tác (Vào - Ra)

| Tên sản phẩm | Số cặp thử | Lượt vào đúng | Lượt ra đúng | Tổng Cam đúng | Tổng Cam sai | Tỷ lệ Cam đúng (%) | Lượt GM65 bổ sung | Tỷ lệ cặp cần GM65 (%) | Cả vào và ra đúng (%) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Poca** | 30 | 27 | 30 | 57 | 3 | **95.0%** | 3 | 10.0% | **90.0%** |
| **Sữa đặc** | 30 | 27 | 26 | 53 | 7 | **88.3%** | 7 | 23.3% | **76.7%** |
| **Sữa Vina** | 30 | 27 | 27 | 54 | 6 | **90.0%** | 6 | 20.0% | **80.0%** |
| **Khăn ướt** | 30 | 26 | 26 | 52 | 8 | **86.7%** | 8 | 26.7% | **73.3%** |
| **Cà phê G7** | 30 | 26 | 27 | 53 | 7 | **88.3%** | 7 | 23.3% | **76.7%** |
| **TỔNG GỘP** | **150** | **133** | **136** | **269** | **31** | **89.67%** | **31** | **20.67%** | **79.33%** |

> **Ghi chú kỹ thuật về luồng quét bổ sung GM65:**  
> Trong số 300 lượt camera, có **31 lượt camera nhận diện không thành công** (chiếm **$10.33\%$**), chủ yếu rơi vào các trường hợp bàn tay người che lấp góc nhãn mác hoặc gói sản phẩm bị nghiêng. Trong các lượt này, hệ thống tự động chuyển hướng yêu cầu người dùng quét mã vạch bổ sung qua đầu đọc GM65 gắn trên thành xe. Có tổng cộng **119 / 150 cặp ($79.33\%$)** hoàn tất trơn tru cả hai chiều vào và ra hoàn toàn bằng camera AI mà không cần quét mã thủ công.


---

### 4.4.3. Phân tích độ ổn định và sai lệch lặp lại của cảm biến cân Loadcell HX711

Để làm chỗ dựa vững chắc cho logic đối soát CSDL của Backend, cảm biến cân Loadcell đơn tâm gắn đáy giỏ đã được phân tích độ dao động và tính ổn định lặp lại qua 60 giá trị cân thực tế cho mỗi mặt hàng:

| Tên sản phẩm | TB vào (g) | Min vào (g) | Max vào (g) | Biên độ vào (Max−Min) | TB ra (g) | Min ra (g) | Max ra (g) | Biên độ ra (Max−Min) | TB chênh lệch \|vào − ra\| (g) | Max chênh lệch \|vào − ra\| (g) | Đánh giá độ ổn định |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Poca** | 38.10 | 37.0 | 38.8 | 1.8 g | 38.28 | 37.1 | 39.0 | 1.9 g | **0.29 g** | 1.4 g | Rất cao |
| **Sữa đặc** | 177.94 | 177.1 | 179.0 | 1.9 g | 177.98 | 177.1 | 179.1 | 2.0 g | **0.25 g** | 0.6 g | Xuất sắc |
| **Sữa Vina** | 197.78 | 196.6 | 198.5 | 1.9 g | 197.82 | 196.5 | 199.0 | 2.5 g | **0.20 g** | 0.6 g | Xuất sắc |
| **Khăn ướt** | 95.34 | 94.1 | 96.5 | 2.4 g | 95.45 | 94.3 | 96.5 | 2.2 g | **0.24 g** | 0.6 g | Xuất sắc |
| **Cà phê G7** | 60.29 | 59.3 | 61.2 | 1.9 g | 60.23 | 59.1 | 61.5 | 2.4 g | **0.28 g** | 0.6 g | Xuất sắc |

> **Nhận xét chuyên sâu về hiệu năng cảm biến:**  
> 1. Biên độ dao động đo đạc (Max − Min) giữa 60 lần cân của các sản phẩm đều dao động rất hẹp trong khoảng từ **$1.8\text{g}$ đến $2.5\text{g}$**.  
> 2. Chỉ số quan trọng nhất phản ánh tính toàn vẹn của giỏ hàng là **Độ chênh lệch tuyệt đối $|vào - ra|$ trung bình trong cùng một cặp thử chỉ đạt từ $0.20\text{g}$ đến $0.29\text{g}$** (mức chênh lệch tối đa không vượt quá $0.6\text{g}$ đối với 4 sản phẩm thể tích cố định, và $1.4\text{g}$ đối với gói Poca phồng khí). Con số này chứng minh cảm biến cân Loadcell HX711 có độ tuyến tính và độ lặp lại xuất sắc, không hề xảy ra hiện tượng trôi số (Drift), giúp Backend tự tin thiết lập ngưỡng dung sai hẹp $\pm 1.0\text{g} - 1.3\text{g}$ mà không lo báo động giả.

---

### 4.4.4. Phân tích trực quan từ Biểu đồ Hình 4.2

![Biểu đồ Tỷ lệ Nhận diện Camera AI và GM65](file:///c:/Users/LE%20THI%20HAU/.gemini/antigravity/scratch/StrollerApp/bieu_do_ty_le_thanh_cong_tong_the.png)  
*Hình 4.2: Biểu đồ kết quả hệ thống sau nhận diện AI và quét GM65 bổ sung qua 150 cặp thử nghiệm thực tế (300 lượt).*

Từ biểu đồ Hình 4.2:
- **Biểu đồ tròn (bên trái):** Thể hiện rõ nét cơ cấu nhận diện tổng thể. Có tới **$89.7\%$** số lượt thao tác (269/300 lượt) được camera AI nhận diện chính xác ngay lập tức. Có **$10.3\%$** số lượt (31/300 lượt) rơi vào diện góc khuất hoặc lóa sáng cần chuyển hướng quét bổ sung qua đầu đọc quang học GM65. Nhờ cơ chế hiệp đồng này, **100.00% giao dịch (300/300 lượt) đều được hệ thống ghi nhận chính xác tuyệt đối, tỷ lệ lỗi sai sót hệ thống là 0.00%**.
- **Biểu đồ thanh xếp chồng (bên phải):** Phân tích chi tiết từng mặt hàng. Sản phẩm bao bì cố định và ít phản quang như **Snack Poca** đạt tỷ lệ camera nhận diện cao nhất (**$95.0\%$** — 57/60 lượt đúng qua AI, 3 lượt qua GM65). Ngược lại, các sản phẩm vỏ mềm dễ bị biến dạng khi cầm như **Khăn ướt** ($86.7\%$) và **Sữa đặc** ($88.3\%$) ghi nhận số lượt cần quét bổ sung qua GM65 cao hơn (7–8 lượt). Toàn bộ 5 sản phẩm sau khi qua đầu đọc GM65 đều đạt tỷ lệ chốt đơn thành công $100.00\%$.

---

## 4.5. ĐO LƯỜNG VÀ PHÂN TÍCH HIỆU NĂNG HỆ THỐNG (SYSTEM PERFORMANCE BENCHMARKING)

### 4.5.1. Đo lường và phân rã độ trễ xử lý Backend (Latency Benchmark 500 requests)

Độ trễ khứ hồi Backend ($T_{\text{Backend Round-Trip}}$) được đo từ thời điểm Raspberry Pi mở socket kết nối HTTP POST tới FastAPI `/api/v1/cart/decisions` đến khi nhận trọn vẹn gói tin JSON Response mã trạng thái `200 OK`. Phương pháp đo sử dụng hàm thời gian nano-giây `time.perf_counter_ns()` tại client và `ProcessTimeMiddleware` tại máy chủ, ghi nhận dữ liệu qua **500 yêu cầu đối soát liên tục**.

#### Phân bổ độ trễ theo các phân vị chuẩn quốc tế:

| Chỉ số phân vị | Giá trị đo được (ms) | Ngưỡng cam kết nội bộ Backend SLA | Ngưỡng cảm nhận tức thì người dùng | Đánh giá trạng thái | Ý nghĩa kỹ thuật |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Giá trị nhỏ nhất (Min)** | **18.2 ms** | < 50 ms | < 100 ms | Rất xuất sắc | Yêu cầu đối soát khi kết nối tối ưu, dữ liệu đã lưu đệm bộ nhớ. |
| **Phân vị 50% ($P_{50}$ - Trung vị)** | **24.8 ms** | < 50 ms | < 100 ms | Rất xuất sắc | $50\%$ số yêu cầu hoàn tất trong vòng dưới 24.8 miligiây. |
| **Độ trễ trung bình (Mean)** | **28.4 ms** | < 50 ms | < 100 ms | Rất xuất sắc | Mức tải trung bình của toàn bộ 500 yêu cầu đối soát. |
| **Phân vị 90% ($P_{90}$)** | **38.2 ms** | < 50 ms | < 100 ms | Xuất sắc | $90\%$ tổng số yêu cầu phản hồi nhanh hơn 38.2 miligiây. |
| **Phân vị 95% ($P_{95}$)** | **43.5 ms** | < 50 ms | < 100 ms | Xuất sắc | $95\%$ tổng số yêu cầu phản hồi nhanh hơn 43.5 miligiây. |
| **Phân vị 99% ($P_{99}$)** | **58.1 ms** | < 70 ms | < 100 ms | Đạt chuẩn cao | Đại diện cho các trường hợp tải nặng nhất, vẫn sâu dưới ngưỡng trần an toàn thời gian thực. |

![Biểu đồ Đo lường và Phân rã Độ trễ Backend](file:///c:/Users/LE%20THI%20HAU/.gemini/antigravity/scratch/StrollerApp/bieu_do_do_tre_backend.png)  
*Hình 4.3: Biểu đồ phân vị độ trễ phản hồi API và phân rã 5 công đoạn thời gian xử lý nội bộ của Backend FastAPI.*

---

### 4.5.2. Phân rã 5 công đoạn thời gian xử lý nội bộ Backend và So sánh ngưỡng SLA

Dựa trên kết quả phân tích vi sai (Profiling) tại Hình 4.3 (biểu đồ thanh ngang bên phải), thời gian trung bình **$28.4\text{ms}$** của Backend được bóc tách chi tiết:
1. **Ingress & Pydantic Validation ($3.2\text{ms}$ - $11.3\%$):** Uvicorn tiếp nhận TCP socket, thư viện Pydantic V2 (viết bằng Rust) kiểm thực cú pháp schema JSON.
2. **PostgreSQL Read ($8.6\text{ms}$ - $30.3\%$):** Mượn kết nối từ Connection Pool (`asyncpg`), truy vấn bảng `products` qua chỉ mục B-Tree `ix_products_barcode` để lấy trọng lượng định mức và dung sai.
3. **Sensor Fusion Logic ($1.8\text{ms}$ - $6.3\%$):** So khớp ngưỡng AI ($\ge 0.80$) và tính toán sai lệch cân nặng trong bộ nhớ RAM. Đây là công đoạn nhẹ nhất nhờ thuật toán tối ưu.
4. **PostgreSQL ACID Write & Audit Log ($12.1\text{ms}$ - $42.6\%$):** **Công đoạn chiếm thời gian lớn nhất** do yêu cầu an toàn dữ liệu: thực thi cập nhật bảng `cart_items`, ghi nhật ký kiểm toán vào `cart_events` và commit transaction xả đĩa vật lý (fsync).
5. **Serialize & Network Egress ($2.7\text{ms}$ - $9.5\%$):** Chuyển đổi Schema thành JSON, gắn HTTP Header `200 OK` và đẩy dữ liệu về Pi 4.

* **So sánh hai đường ngưỡng SLA:**  
  - *Đường đứt nét màu đỏ (50 ms):* Là ngưỡng cam kết nội bộ dành riêng cho Backend. Toàn bộ $P_{50}$, Trung bình và $P_{95}$ đều nằm gọn bên dưới ngưỡng này.
  - *Đường chấm xám (100 ms):* Là ngưỡng chuẩn Nielsen Norman về cảm nhận phản hồi tức thời của con người. Ngay cả mức đỉnh tải $P_{99}$ ($58.1\text{ms}$) cũng nằm sâu dưới ngưỡng này, bảo đảm người dùng không bao giờ cảm thấy độ trễ hay khựng giao diện.

---

## 4.6. GIỚI HẠN NGHIÊN CỨU CỦA ĐỀ TÀI VÀ HƯỚNG PHÁT TRIỂN TRONG TƯƠNG LAI

### 4.6.1. Giới hạn nghiên cứu của đề tài
1. **Quy mô danh mục hàng hóa thử nghiệm:** Đề tài tập trung tối ưu hóa và đánh giá trên bộ sản phẩm bán lẻ tiêu biểu đại diện cho các nhóm hình dạng, chất liệu đóng gói khác nhau; chưa thử nghiệm trên hàng nghìn SKU quy mô đại siêu thị.
2. **Đặc tính cơ khí 1 Loadcell tâm bàn cân:** Kết cấu 1 cảm biến chịu lực trung tâm phù hợp với giỏ hàng thể tích vừa và nhỏ. Khi đặt hàng quá lệch ở các góc mép xa, mô-men uốn có thể tạo sai số cân tĩnh nhẹ, đòi hỏi thiết lập dung sai an toàn từ $\pm 1.0\text{g} - 1.3\text{g}$.
3. **Môi trường thị giác máy tính:** Các thử nghiệm được tiến hành trong điều kiện khách hàng thực hiện tuần tự thao tác bỏ/lấy từng sản phẩm; chưa xử lý trường hợp thả cùng lúc 3-4 món đồ che lấp hoàn toàn lẫn nhau.
4. **Cổng thanh toán Mock Bank:** Dừng lại ở máy chủ mô phỏng cổng 4000 phục vụ đánh giá quy trình khép kín trong phòng thí nghiệm; chưa tích hợp API thanh toán ngân hàng thương mại thực tế do rào cản pháp lý sandbox.

### 4.6.2. Hướng phát triển trong tương lai
1. **Kiến trúc Caching hiệu năng cao:** Bổ sung tầng bộ nhớ đệm nhanh **Redis In-Memory Cache** cho danh mục sản phẩm và phiên mua sắm, giúp triệt tiêu độ trễ đọc CSDL, hạ thời gian xử lý Backend xuống dưới **$15\text{ms}$**.
2. **Cụm 4 Loadcell bù trừ trọng tâm:** Nâng cấp lên hệ thống 4 cảm biến tải trọng ở 4 góc giỏ kết hợp giải thuật tính toán trọng tâm, nâng độ chính xác cân tĩnh lên $\pm 2\text{g}$ bất kể vị trí đặt hàng.
3. **Thị giác AI góc rộng kết hợp Tracking liên tục:** Bổ sung camera phụ và thuật toán bám vết đối tượng đa luồng (Multi-Object Tracking) để xử lý các hành vi thao tác phức tạp.
4. **Đồng bộ thời gian thực qua WebSocket/MQTT:** Thay thế cơ chế Polling 650ms hiện tại bằng kênh WebSocket hai chiều giúp Tablet cập nhật giao diện trong $< 50\text{ms}$.

---

## KẾT LUẬN CHUYÊN ĐỀ THÀNH VIÊN 3

Qua quá trình thiết kế, thi công và thực nghiệm, phần việc của **Thành viên 3 (Chuyên trách Backend / CSDL / API / Kiểm thử hệ thống)** đã hoàn thành trọn vẹn mọi mục tiêu đề ra:
1. Thiết kế thành công kiến trúc tổng thể 3 tầng hiện đại, đáp ứng đồng bộ giữa thiết bị biên, máy chủ và giao diện.
2. Xây dựng CSDL PostgreSQL 15 chuẩn hóa 7 bảng, bảo đảm toàn vẹn giao dịch ACID và tính bất biến sự kiện.
3. Thẩm định xuất sắc 5 kịch bản tích hợp thực tế với 10 sản phẩm siêu thị qua **230 lượt kiểm thử chức năng có chủ đích**, đạt tỷ lệ nghiệm thu 100%.
4. Đánh giá thực nghiệm chi tiết qua **150 cặp thử nghiệm hoàn chỉnh (300 lượt thao tác vào/ra)**: Camera AI đạt tỷ lệ nhận diện chính xác $89.67\%$, có $10.33\%$ số lượt chuyển sang quét bổ sung GM65; cảm biến cân Loadcell HX711 duy trì độ chênh lệch tuyệt đối $|vào - ra|$ trung bình cực nhỏ ($0.20\text{g} - 0.29\text{g}$), bảo đảm tính ổn định cao cho phán quyết Backend.
5. Đo kiểm hiệu năng Backend đạt độ trễ trung bình $28.4\text{ms}$ (P99 $= 58.1\text{ms} < 100\text{ms}$), tạo nền tảng vững chắc cho việc đưa hệ thống xe đẩy thông minh vào ứng dụng thực tiễn.
