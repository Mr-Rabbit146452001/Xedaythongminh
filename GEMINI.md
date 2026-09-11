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
