# Ban giao frontend SmartCart V2

Ngay: 2026-10-05. Tai lieu dua tren backend trong workspace hien tai;
can doi chieu neu backend dang deploy la mot ban khac.

## 1. Muc tieu

Frontend hien phan hoi ngay khi co giao dich, roi cap nhat gio khi backend
chap nhan. Thoi gian AI tren Pi va thoi gian UI hien gio can do rieng.
Log Pi hien tai co CLEAR->backend khoang 6-8s o nhieu ca ADD; frontend
toi uu se giam phan cho cap nhat/hien thi, khong tu rut ngan inference tren Pi.

## 2. API DA CO

Base URL dang dung: https://reflex-swipe-placidly.ngrok-free.dev
Swagger: /docs. Base URL nen la bien cau hinh de doi khi deploy.

| Method | Path | Vai tro |
| --- | --- | --- |
| GET | /api/v1/sessions/active | Lay session hien tai, response co id |
| POST | /api/v1/sessions | Tao phien khi nguoi dung bat dau mua hang |
| GET | /api/v1/products | Danh muc san pham, gia, vision_class |
| GET | /api/v1/cart/{session_id} | Snapshot gio da xac nhan |
| POST | /api/v1/cart/decisions | Pi gui quyet dinh ADD/REMOVE |
| POST | /api/v1/sessions/{session_id}/complete | Ket thuc phien |

Snapshot gio co cac truong:

```json
{
  "session_id": "example-session-id",
  "items": [
    {
      "barcode": "000000000001",
      "sku": "PURI_EXAMPLE",
      "name": "Khan uot Puri",
      "vision_class": "giay uot",
      "quantity": 1,
      "unit_price_vnd": 10000,
      "line_total_vnd": 10000
    }
  ],
  "total_quantity": 1,
  "total_vnd": 10000
}
```

Barcode, SKU va gia trong vi du chi minh hoa; lay gia tri that tu backend.
Response POST decisions co event_id, client_event_id, decision
(accepted/rejected), reasons, verification_mode, product, cart, created_at_ms.
Response nay tra cho Pi. Frontend can GET snapshot hoac kenh backend push
de nhan ket qua, khong tu nhan duoc response HTTP ma Pi vua goi.

Backend dang co REST; CHUA CO endpoint SSE/WebSocket, cart revision hay
luong trang thai ToF/AI cho frontend. GET /api/v1/events hien chi doc sensor
events; khong su dung no nhu danh sach day du cart decisions.

## 3. Frontend co the toi uu ngay voi API hien tai

- Tai snapshot khi vao session. Trong luc mua hang, thu polling 500-750ms
  va do tai backend/latency thuc te; khong de request chong nhau. Dat timeout,
  backoff khi loi mang, dung timer khi doi session/unmount.
- Danh muc san pham cache; khong tai lai products moi lan gio thay doi.
- Giu gio cu hien thi trong luc fetch; chi hien loading lon khi lan dau.
- Cap nhat state bang snapshot, key item theo barcode. Khong cong/tru them
  tu so luong trong snapshot va khong reload ca trang.
- Huy/bo response cua session cu; tranh request tra muon ghi de gio moi.
- Tong tien va so luong da xac nhan lay tu backend. Thay doi anh camera,
  vat bi che hay can tang/giam khong du de frontend tu sua gio.
- Polling snapshot chi biet gio da doi. Muon hien chinh xac "Dang nhan dien"
  hoac "Can quet ma" can them luong trang thai o muc 4.

## 4. De xuat luong push, can backend VA Pi bo sung

De xuat SSE cho thong bao mot chieu backend -> frontend, giu HTTP cho
thao tac session. Endpoint de xuat (CHUA TRIEN KHAI):
GET /api/v1/cart/{session_id}/stream.
SSE duoc trinh duyet nhan bang EventSource; co co che reconnect.
Tai lieu: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
Neu he thong da co WebSocket thi co the dung lai kenh do; FastAPI ho tro:
https://fastapi.tiangolo.com/advanced/websockets/

Thong nhat 2 loai message:

1. interaction.status: Pi bao trang thai giao dich len backend, backend
   chuyen cho frontend. session_id + client_event_id + status_seq tang dan,
   phase (processing/await_backend/scan_required/finished), action co the null
   khi chua biet huong, barcode co the null, reason_code neu can, updated_at_ms.
   Giao dich ket thuc khong doi gio cung gui finished. Moi thong bao mang
   day du trang thai cua giao dich, khong chi la delta.
2. cart.updated: Chi phat sau khi mutation DA COMMIT. session_id,
   client_event_id, action, decision=accepted, cart_revision tang dan theo
   session va toan bo cart snapshot. GET snapshot cung tra cart_revision.
   Rejected gui ket qua giao dich de dung loading/bao ly do, khong sua gio.

Vi du message cart.updated de xuat, khong phai response dang co:

```json
{
  "type": "cart.updated",
  "session_id": "example-session-id",
  "client_event_id": "example-event-id",
  "cart_revision": 12,
  "action": "add",
  "decision": "accepted",
  "cart": {
    "session_id": "example-session-id",
    "cart_revision": 12,
    "items": [
      {
        "barcode": "000000000001",
        "sku": "PURI_EXAMPLE",
        "name": "Khan uot Puri",
        "vision_class": "giay uot",
        "quantity": 1,
        "unit_price_vnd": 10000,
        "line_total_vnd": 10000
      }
    ],
    "total_quantity": 1,
    "total_vnd": 10000
  }
}
```

Gia tri trong vi du chi minh hoa; server gui snapshot thuc sau commit.
Frontend ap dung snapshot moi neu revision lon hon ban dang giu, dung
client_event_id de tranh lap thong bao/am thanh. Khong bo status message chi
vi cart_revision chua doi: trang thai giao dich co status_seq rieng.

Khi reconnect, GET snapshot de doi soat, roi bat lai stream; de tranh khe ho
giua GET va subscribe, stream nen gui snapshot hien tai luc subscribe, cung
revision, hoac backend cung cap replay. Cho den khi backend co replay/snapshot
dung nghia, polling nhe co the dung lam doi soat.

Stream phai tiep tuc qua proxy/ngrok, gioi han dung session, co heartbeat,
va dung khi session ket thuc. Backend can cau hinh CORS theo origin frontend
thuc te; hien code chi cho phep localhost/127.0.0.1 khong kem port.

## 5. Hien thi cho nguoi dung

| Trang thai | Hien thi |
| --- | --- |
| processing | Dang nhan dien san pham... |
| await_backend | Dang cap nhat gio... |
| accepted ADD | Da them [ten mon]; cap nhat snapshot va am thanh mot lan |
| accepted REMOVE | Da xoa [ten mon]; cap nhat snapshot va am thanh mot lan |
| scan_required | Hay quet ma vach cua san pham vua thao tac |
| finished, unchanged | Ket thuc trang thai cho, giu gio da xac nhan |
| lost connection | Mat ket noi; giu gio cu va danh dau chua dong bo |

Hang dang xu ly hien rieng voi gio da xac nhan; khong tinh vao tong tien.
Khong hien confidence AI/thong so GPIO trong luong mua hang.

## 6. Kiem thu va do latency

- Ghi frontend_receive va frontend_render bang dong ho monotonic cung may.
  Muc tieu de xuat receive->render p95 <200ms; phai do tren thiet bi thuc.
- Ghep log bang client_event_id, ghi ToF CLEAR, Pi decision, backend commit,
  browser receive/render. Do duration trong tung may; so timestamp giua cac
  may chi co y nghia khi dong ho da dong bo.
- Test them 2 sua, them mon che Puri, lay mon bi che, xep lai gio, lap lai
  message, mat mang/reconnect, response dao thu tu, doi session khi dang cho.
- Snapshot trung khong tang quantity. Revision cu khong ghi de gio moi.
- Loading khong bi treo sau scan_timeout/rejected/unchanged; server gui trang
  thai ket thuc. Hien UI nhanh khong dong nghia la AI da xac nhan nhanh.

Frontend nen gui lai: code/service dang fetch gio, chu ky polling hien tai,
endpoint dang dung, origin frontend va timestamp receive/render cua mot ADD.
