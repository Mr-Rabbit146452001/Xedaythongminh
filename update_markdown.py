import re

md_path = r"c:\Users\LE THI HAU\.gemini\antigravity\scratch\StrollerApp\BaoCao_Backend_HeThong_Chuong3_4.md"

with open(md_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the table in Section 4.4.2 with the updated table and detailed analysis
old_pattern = r"(### 4\.4\.2\. Bảng tổng hợp số liệu thực nghiệm nhận diện Camera AI và Quét bổ sung GM65.*?\n\n).*?(\| \*\*TỔNG GỘP\*\* \|.*?\n\n> \*\*Ghi chú kỹ thuật về luồng quét dự phòng RM65:\*\*.*?\n> .*?\n)"

new_section = """### 4.4.2. Bảng tổng hợp số liệu thực nghiệm nhận diện Camera AI và Quét bổ sung GM65

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
> Trong số 300 lượt camera, có **31 lượt camera nhận diện không thành công** (chiếm **$10.33\%$**), chủ yếu rơi vào các trường hợp bàn tay người che lấp góc nhãn mác hoặc gói sản phẩm bị nghiêng. Trong các lượt này, hệ thống tự động chuyển hướng yêu cầu người dùng quét mã vạch bổ sung qua đầu đọc GM65 gắn trên thành xe. Có tổng cộng **119 / 150 cặp ($79.33\%$)** hoàn tất trơn tru cả hai chiều vào và ra hoàn toàn bằng camera AI mà không cần quét mã thủ công."""

match = re.search(old_pattern, content, re.DOTALL)
if match:
    content = content[:match.start()] + new_section + "\n\n" + content[match.end():]
    with open(md_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("✅ Đã cập nhật Bảng 4.2 và Bảng 4.2b thành công!")
else:
    print("⚠️ Pattern không khớp, kiểm tra chuỗi!")
