# Quy Tắc Dự Án & Lệnh Ghim (Project Rules & Pinned Commands)

## 📌 Lệnh 1 (Ghim ưu tiên): Khởi động toàn bộ hệ thống Server
Bất kỳ khi nào người dùng hỏi về:
- "Lệnh 1"
- "Bật server" / "Khởi động server" / "Chạy server"
- "Lệnh bật máy chủ" / "Lệnh chạy mockbank / shop server"

➡️ **Trả lời NGAY LẬP TỨC và NGẮN GỌN duy nhất câu lệnh sau:**

```powershell
cd "C:\Users\LE THI HAU\.gemini\antigravity\scratch\StrollerApp\server" ; node start_all.js
```

*(Lệnh này tự động kích hoạt đồng thời cả Shop Server cổng 3000, Mock Bank Server cổng 4000 và đường hầm HTTPS Ngrok).*

---

## 📌 Lệnh @push: Tự động đẩy toàn bộ thay đổi lên GitHub
Bất kỳ khi nào người dùng gõ `@push` (hoặc nhắc tới lệnh `@push`):

➡️ **TỰ ĐỘNG THỰC HIỆN NGAY QUY TRÌNH PUSH CODE:**
1. Chạy `git add .` để gom toàn bộ file đã chỉnh sửa / tạo mới.
2. Chạy `git commit -m "..."` tạo ghi chú commit phù hợp với các thay đổi vừa làm (hoặc "Update project changes" nếu không có mô tả chi tiết).
3. Chạy `git push origin main` đẩy mã nguồn lên GitHub.
4. Báo cáo ngắn gọn kết quả thành công và kèm link GitHub kho chứa.

---

## 📌 Lệnh @team: Kích hoạt Đội ngũ Đa Tác nhân Toàn diện (7 Tác Nhân Full-Stack & Android Specialist)
Bất kỳ khi nào người dùng gõ `@team` (hoặc nhắc tới lệnh `@team`, "gọi đội ngũ tác nhân", "triệu tập team AI"):

➡️ **TỰ ĐỘNG KÍCH HOẠT VÀ ĐIỀU PHỐI ĐỘI NGŨ 7 TÁC NHÂN CHUYÊN TRÁCH:**

### 🌟 Danh Sách Đội Ngũ 7 Tác Nhân Toàn Diện:
1. 📋 **Product Manager (PM / BA)**: Phân tích bài toán, lập User Stories, luồng chức năng và tiêu chí nghiệm thu.
2. 🏛️ **System Architect (Tech Lead)**: Thiết kế kiến trúc tổng thể toàn hệ thống, database schema, API spec và tech stack.
3. 🎨 **UI/UX Designer**: Thiết kế luồng trải nghiệm người dùng, wireframe, design system và layout giao diện.
4. ⚙️ **Backend Developer**: Lập trình API (Node.js Shop Server, FastAPI, Mock Bank), PostgreSQL, xử lý nghiệp vụ và Webhook.
5. 💻 **Frontend & Mobile Developer**: Lập trình Android App (100% Jetpack Compose, Material 3, ViewModel, StateFlow) & Web Admin (Next.js 14).
6. 🧪 **QA / Test Engineer & Code Reviewer**: Lập Test Plan, kiểm tra chất lượng code (chống leak bộ nhớ, chống recomposition trap), viết Unit Test và kiểm tra biên dịch (`./gradlew compileDebugKotlin`).
7. 🚀 **DevOps Engineer**: Quản lý script vận hành (`start_all.js`), đường hầm HTTPS Ngrok, Docker, môi trường mạng và CI/CD.

---

### 🚀 Quy trình điều phối tác vụ:
1. **Khi người dùng chỉ gõ `@team` độc lập:**
   - Điểm danh, báo cáo trạng thái sẵn sàng của cả 7 tác nhân và mời người dùng giao việc.
2. **Khi người dùng giao nhiệm vụ cho ứng dụng Android (App Xe đẩy):**
   - Kích hoạt phân đội chuyên biệt Android gồm 4 vai trò nòng cốt: **Architect ➔ Developer ➔ Reviewer ➔ QA Tester** theo đúng SOP (`.agent/workflows/android-team-workflow.md`), bảo đảm build thành công 100%.
3. **Khi người dùng giao nhiệm vụ cho Web Admin, Server Backend, Database hay DevOps:**
   - Điều phối trực tiếp các tác nhân tương ứng (Backend Dev, Frontend Dev, UI/UX Designer, DevOps) cùng kiểm thử và nghiệm thu.
4. **Khi người dùng giao nhiệm vụ Giao tiếp Firmware & Frontend (Raspberry Pi/ESP32 sensor <-> Gateway <-> Android/Web):**
   - Kích hoạt Phân đội Chuyên biệt Firmware-Frontend (4 subagents: `firmware-architect`, `firmware-developer`, `firmware-bridge-developer`, `firmware-qa-tester`) theo đúng SOP (`.agent/workflows/firmware-frontend-workflow.md`), đảm bảo dữ liệu cảm biến cân nặng, RFID, Barcode GM65 đồng bộ thời gian thực sang UI.

---

### 🔌 Phân Đội Chuyên Chế Giao Tiếp Firmware <-> Frontend:
1. 📐 **Firmware Architect (`firmware-architect`)**: Thiết kế giao thức truyền nhận (WebSocket, MQTT, Serial packets), JSON payload schema, state machine giữa Raspberry Pi/ESP32 và Frontend.
2. ⚡ **Embedded Firmware Developer (`firmware-developer`)**: Viết driver cảm biến cân nặng HX711/SQL, GM65 Barcode, RFID RC522, lọc nhiễu tín hiệu cân, phát sóng event thời gian thực.
3. 🌉 **Firmware Bridge Integrator (`firmware-bridge-developer`)**: Xây dựng server gateway bridge (Node.js/FastAPI WebSockets), kết nối StateFlow Android ViewModel và Web Admin Next.js live stream.
4. 🧪 **Firmware QA & Simulator (`firmware-qa-tester`)**: Giả lập gói tin cảm biến, đo độ trễ latency (<100ms), kiểm thử mất kết nối và tự động khôi phục dữ liệu UI.



