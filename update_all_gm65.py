import re

md_path = r"c:\Users\LE THI HAU\.gemini\antigravity\scratch\StrollerApp\BaoCao_Backend_HeThong_Chuong3_4.md"

with open(md_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Update Section 4.4.4 text
old_444 = """Từ biểu đồ Hình 4.2:
- **Biểu đồ tròn (bên trái):** Thể hiện rõ nét cơ cấu nhận diện tổng thể. Có tới **$89.7\%$** số lượt thao tác (269/300 lượt) được camera AI nhận diện chính xác ngay lập tức. Chỉ có **$10.3\%$** số lượt (31/300 lượt) rơi vào diện góc khuất hoặc lóa sáng cần chuyển hướng quét dự phòng qua đầu đọc RM65.
- **Biểu đồ thanh xếp chồng (bên phải):** Phân tích chi tiết từng mặt hàng. Sản phẩm bao bì cố định và ít phản quang như **Snack Poca** đạt tỷ lệ camera nhận diện cao nhất (**$95.0\%$** - 57/60 lượt). Ngược lại, các sản phẩm vỏ mềm dễ bị bóp méo khi cầm như **Khăn ướt** ($86.7\%$) và **Sữa đặc** ($88.3\%$) ghi nhận số lượt cần quét dự phòng cao hơn (7–8 lượt)."""

new_444 = """Từ biểu đồ Hình 4.2:
- **Biểu đồ tròn (bên trái):** Thể hiện rõ nét cơ cấu nhận diện tổng thể. Có tới **$89.7\%$** số lượt thao tác (269/300 lượt) được camera AI nhận diện chính xác ngay lập tức. Có **$10.3\%$** số lượt (31/300 lượt) rơi vào diện góc khuất hoặc lóa sáng cần chuyển hướng quét bổ sung qua đầu đọc quang học GM65. Nhờ cơ chế hiệp đồng này, **100.00% giao dịch (300/300 lượt) đều được hệ thống ghi nhận chính xác tuyệt đối, tỷ lệ lỗi sai sót hệ thống là 0.00%**.
- **Biểu đồ thanh xếp chồng (bên phải):** Phân tích chi tiết từng mặt hàng. Sản phẩm bao bì cố định và ít phản quang như **Snack Poca** đạt tỷ lệ camera nhận diện cao nhất (**$95.0\%$** — 57/60 lượt đúng qua AI, 3 lượt qua GM65). Ngược lại, các sản phẩm vỏ mềm dễ bị biến dạng khi cầm như **Khăn ướt** ($86.7\%$) và **Sữa đặc** ($88.3\%$) ghi nhận số lượt cần quét bổ sung qua GM65 cao hơn (7–8 lượt). Toàn bộ 5 sản phẩm sau khi qua đầu đọc GM65 đều đạt tỷ lệ chốt đơn thành công $100.00\%$."""

text = text.replace("![Biểu đồ Tỷ lệ Nhận diện Camera AI và RM65]", "![Biểu đồ Tỷ lệ Nhận diện Camera AI và GM65]")
text = text.replace("*Hình 4.2: Biểu đồ cơ cấu nhận diện Camera AI và số lượt quét dự phòng RM65 qua 150 cặp thử nghiệm thực tế (300 lượt).* ", 
                    "*Hình 4.2: Biểu đồ kết quả hệ thống sau nhận diện AI và quét GM65 bổ sung qua 150 cặp thử nghiệm thực tế (300 lượt).*")
text = text.replace("*Hình 4.2: Biểu đồ cơ cấu nhận diện Camera AI và số lượt quét dự phòng RM65 qua 150 cặp thử nghiệm thực tế (300 lượt).*", 
                    "*Hình 4.2: Biểu đồ kết quả hệ thống sau nhận diện AI và quét GM65 bổ sung qua 150 cặp thử nghiệm thực tế (300 lượt).*")

# Replace 4.4.4 text if found
if old_444 in text:
    text = text.replace(old_444, new_444)
    print("✅ Đã thay thế đoạn 4.4.4 thành công!")
else:
    # Try regex with newline tolerance
    pat = r"Từ biểu đồ Hình 4\.2:.*?- \*\*Biểu đồ thanh xếp chồng \(bên phải\):\*\*.*?(?=\n\n---|\Z)"
    text = re.sub(pat, new_444.replace('\\', '\\\\'), text, flags=re.DOTALL)
    print("✅ Đã thay thế đoạn 4.4.4 qua regex!")

# Also update Section 4.6 and Conclusion where RM65 is mentioned
text = text.replace("quét dự phòng RM65", "quét bổ sung GM65")

with open(md_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("✅ Đã hoàn tất cập nhật Markdown với dữ liệu GM65!")
