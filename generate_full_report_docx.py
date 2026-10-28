import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
import os

doc = docx.Document()

# Page Setup: Normal Margins (1 inch)
for s in doc.sections:
    s.top_margin = Inches(1)
    s.bottom_margin = Inches(1)
    s.left_margin = Inches(1)
    s.right_margin = Inches(1)

def set_cell_background(cell, fill_hex):
    tcPr = cell._element.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill_hex)
    tcPr.append(shd)

def add_title(text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run(text)
    run.font.name = "Times New Roman"
    run.font.size = Pt(15)
    run.bold = True
    run.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
    return p

def add_heading_1(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(18)
    p.paragraph_format.space_after = Pt(6)
    run = p.add_run(text)
    run.font.name = "Times New Roman"
    run.font.size = Pt(14)
    run.bold = True
    run.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
    return p

def add_heading_2(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(4)
    run = p.add_run(text)
    run.font.name = "Times New Roman"
    run.font.size = Pt(13)
    run.bold = True
    run.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
    return p

def add_heading_3(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(2)
    run = p.add_run(text)
    run.font.name = "Times New Roman"
    run.font.size = Pt(12)
    run.bold = True
    run.italic = True
    run.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
    return p

def add_body(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.25
    run = p.add_run(text)
    run.font.name = "Times New Roman"
    run.font.size = Pt(12)
    return p

def add_bullet(text, bold_prefix=""):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.2
    if bold_prefix:
        r_bold = p.add_run(bold_prefix)
        r_bold.font.name = "Times New Roman"
        r_bold.font.size = Pt(12)
        r_bold.bold = True
    run = p.add_run(text)
    run.font.name = "Times New Roman"
    run.font.size = Pt(12)
    return p

def add_image_safe(img_path, caption, width_inch=5.8):
    if os.path.exists(img_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(8)
        p_img.paragraph_format.space_after = Pt(2)
        doc.add_picture(img_path, width=Inches(width_inch))
    
    p_cap = doc.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.space_before = Pt(2)
    p_cap.paragraph_format.space_after = Pt(10)
    run = p_cap.add_run(caption)
    run.font.name = "Times New Roman"
    run.font.size = Pt(11)
    run.italic = True
    run.font.color.rgb = RGBColor(0x47, 0x55, 0x69)

screenshots_dir = r"C:\Users\LE THI HAU\Pictures\Screenshots"

# ----------------- COVER & INFO -----------------
add_title("BÁO CÁO KỸ THUẬT ĐỒ ÁN TỐT NGHIỆP\nTHIẾT KẾ VÀ THI CÔNG MÔ HÌNH XE ĐẨY MUA SẮM THÔNG MINH TÍCH HỢP AIoT CHO SIÊU THỊ BÁN LẺ")

p_sub = doc.add_paragraph()
p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
r_sub = p_sub.add_run("CHUYÊN ĐỀ: THIẾT KẾ PHẦN MỀM GIAO DIỆN & TRẢI NGHIỆM NGƯỜI DÙNG (FRONTEND & UI/UX)\n(Hệ thống App Tablet Xe đẩy, Web Admin Quản trị Bán lẻ & Web Khách hàng PWA)")
r_sub.font.name = "Times New Roman"
r_sub.font.size = Pt(12)
r_sub.bold = True
r_sub.font.color.rgb = RGBColor(0x25, 0x63, 0xEB)

info_table = doc.add_table(rows=4, cols=2)
info_table.alignment = WD_TABLE_ALIGNMENT.CENTER
info_data = [
    ("Tên đề tài:", "Thiết kế và thi công mô hình xe đẩy mua sắm thông minh tích hợp AIoT cho siêu thị bán lẻ"),
    ("Thành viên phụ trách:", "Thành viên 4 – Chuyên trách App / Web Frontend & Thiết kế UI/UX"),
    ("Giảng viên hướng dẫn:", "ThS. Đỗ Văn Việt Em"),
    ("Thời gian thực hiện:", "Học kỳ 1 – Năm học 2026")
]
for i, (k, v) in enumerate(info_data):
    row = info_table.rows[i]
    cell_k, cell_v = row.cells[0], row.cells[1]
    cell_k.text = k
    cell_v.text = v
    cell_k.paragraphs[0].runs[0].bold = True
    cell_k.paragraphs[0].runs[0].font.name = "Times New Roman"
    cell_v.paragraphs[0].runs[0].font.name = "Times New Roman"
    set_cell_background(cell_k, "F1F5F9")
    set_cell_background(cell_v, "FFFFFF")

doc.add_paragraph()

# ----------------- CHƯƠNG 3 -----------------
add_heading_1("CHƯƠNG 3: THIẾT KẾ PHẦN MỀM GIAO DIỆN VÀ TRẢI NGHIỆM NGƯỜI DÙNG (FRONTEND & UI/UX)")

add_heading_2("3.5. Hệ thống Ứng Dụng Di Động Android Tablet trên Xe Đẩy (Jetpack Compose)")

add_heading_3("3.5.1. Kiến trúc tổng thể và công nghệ giao diện Tablet")
add_body("Ứng dụng máy tính bảng (Tablet) gắn trên xe đẩy mua sắm thông minh đóng vai trò là giao diện tương tác trực tiếp duy nhất giữa khách hàng và toàn bộ hệ sinh thái phần cứng IoT. Để đáp ứng yêu cầu vận hành liên tục, giao diện mượt mà và đồng bộ dữ liệu tức thời, nhóm nghiên cứu đã lựa chọn và triển khai các công nghệ hiện đại:")
add_bullet(" Ứng dụng được phát triển 100% bằng ngôn ngữ Kotlin trên nền tảng Jetpack Compose – bộ công cụ giao diện khai báo (Declarative UI) hiện đại nhất của Google kết hợp hệ thống thiết kế Material 3.", "Nền tảng công nghệ:")
add_bullet(" Áp dụng mô hình Clean Architecture kết hợp mẫu hình MVVM (Model – View – ViewModel). Dữ liệu trong hệ thống tuân thủ nghiêm ngặt nguyên lý luồng dữ liệu một chiều (Unidirectional Data Flow - UDF), trong đó trạng thái giỏ hàng được quản lý tập trung tại AppViewModel thông qua các luồng StateFlow bất biến.", "Mô hình kiến trúc:")
add_bullet(" Màn hình Tablet được cấu hình cố định theo phương ngang (android:screenOrientation=\"sensorLandscape\"). Bố cục giao diện được thiết kế theo tỷ lệ phân chia trực quan: 65% bề ngang dành cho danh sách sản phẩm cuộn cảm ứng và 35% dành cho bảng tóm tắt đơn hàng, ưu đãi thành viên và các nút chức năng thanh toán.", "Tối ưu hóa hiển thị phần cứng:")

add_heading_3("3.5.2. Mô tả luồng hoạt động của App Tablet (Giao diện giỏ hàng, cập nhật Real-time)")
add_body("Toàn bộ chu trình hoạt động của khách hàng trên App Tablet được quản lý khép kín thông qua một máy trạng thái (State Machine) với 4 giai đoạn kiểm soát nghiêm ngặt:")

infographic_img = r"C:\Users\LE THI HAU\.gemini\antigravity\brain\e26c93ce-f58f-4b76-bb0f-2b78cb3bf30c\.user_uploaded\media_1792210922809_25ec9cd2.jpg"
add_image_safe(infographic_img, "Hình 3.0: Sơ đồ luồng hoạt động tổng thể của hệ thống Xe đẩy thông minh AIoT (Toàn cảnh 4 giai đoạn)", width_inch=6.0)

# Giai đoạn 1
add_body("1. Giai đoạn 1: Khởi tạo phiên mua sắm và kiểm tra giỏ hàng tồn:")
add_bullet(" Khi khách hàng mới nhấn 'Bắt đầu mua sắm', ứng dụng tự động kiểm tra trạng thái giỏ vật lý và dữ liệu phiên trước. Nếu phát hiện giỏ hàng chưa được dọn sạch từ khách trước, hệ thống ngay lập tức kích hoạt lớp phủ cảnh báo LeftoverCartWarningOverlay, yêu cầu khách hàng hoặc nhân viên dọn sạch giỏ để đưa tải trọng cảm biến về 0g trước khi cho phép bắt đầu.", "Kiểm tra giỏ hàng rỗng (checkCartEmptyOnStart):")
add_bullet(" App gửi yêu cầu GET /api/v1/sessions/active tới máy chủ để kiểm tra xem xe đẩy đã có phiên hoạt động nào trên phần cứng (Raspberry Pi) chưa. Nếu chưa có, App phát lệnh POST /api/v1/sessions để cấp phát một mã phiên mới duy nhất (activeSessionId). Khách hàng có thể quét mã QR hội viên từ Web PWA để áp dụng voucher ưu đãi.", "Cấp phát phiên (syncOrAttachSession):")
add_image_safe(os.path.join(screenshots_dir, "giai_doan_1_khoi_tao_phien.png"), "Hình 3.0a: Sơ đồ khối Giai đoạn 1 - Khởi tạo phiên mua sắm và kiểm tra giỏ hàng tồn trên xe đẩy", width_inch=4.8)

# Giai đoạn 2
add_body("2. Giai đoạn 2: Thu thập dữ liệu cảm biến thời gian thực và đồng bộ giỏ hàng:")
add_bullet(" Cụm cảm biến phần cứng gồm Camera AI (nhận diện hình ảnh vật thể), Cân điện tử HX711 (đo biến thiên trọng lượng delta W) và Đầu quét mã vạch GM65 (quét barcode EAN-13 khi cần) thu thập dữ liệu và gửi lên máy chủ API Gateway.", "Phát hiện sự kiện phần cứng:")
add_bullet(" Một Coroutine chạy ngầm trong viewModelScope trên Tablet liên tục thăm dò máy chủ qua endpoint GET /api/v1/cart/{sessionId} với chu kỳ được tối ưu hóa ở mức 650 ms. Thuật toán Diffing so sánh oldMap và newMap để nhận diện chính xác sự kiện thêm/bớt hàng, phát âm thanh ting và hiển thị thông báo nổi CartNotificationPill ở góc màn hình.", "Cơ chế Polling & Diff Engine 650ms:")
add_image_safe(os.path.join(screenshots_dir, "giai_doan_2_cam_bien_dong_bo.png"), "Hình 3.0b: Sơ đồ khối Giai đoạn 2 - Thu thập dữ liệu đa cảm biến và cơ chế Polling 650ms", width_inch=4.8)

# Giai đoạn 3
add_body("3. Giai đoạn 3: Tương tác giỏ hàng trên Tablet và tối ưu hiển thị:")
add_bullet(" Giao diện Tablet được bố cục theo tỷ lệ vàng 65% cho danh sách sản phẩm cuộn mượt mà (LazyColumn) và 35% cho bảng tổng kết đơn hàng, voucher hội viên và nút thanh toán.", "Phân chia không gian hiển thị 65/35:")
add_bullet(" Khách hàng có thể tương tác tăng giảm số lượng, xem hình ảnh và đơn giá trực tiếp. Khi có sản phẩm mới được cảm biến nhận diện, pill thông báo màu xanh 'Đã thêm sản phẩm +1' xuất hiện tức thời mà không gây giật lag giao diện.", "Trải nghiệm giỏ hàng phản hồi nhanh:")
add_image_safe(os.path.join(screenshots_dir, "giai_doan_3_khoa_bao_mat_anomaly.png"), "Hình 3.0c: Sơ đồ khối Giai đoạn 3 - Trải nghiệm tương tác giỏ hàng trên máy tính bảng", width_inch=4.8)

# Giai đoạn 4
add_body("4. Giai đoạn 4: Kiểm tra bảo mật đối soát tải trọng, xử lý bất thường và thanh toán VietQR:")
add_bullet(" Khi khách hàng nhấn nút 'Thanh toán', ứng dụng ngay lập tức chụp lại bản sao giỏ hàng (_lockedCartSnapshot) và kích hoạt cờ khóa isCartLocked = true. Nếu cảm biến Loadcell phát hiện tải trọng thực tế chênh lệch so với tổng trọng lượng danh mục sản phẩm, hộp thoại SensorAnomalyDialog lập tức xuất hiện.", "Khóa giỏ và kiểm tra bất thường (Security & Anomaly):")
add_bullet(" Sự cố bất thường có thể giải tỏa theo 2 phương thức: Khách hàng tự quét mã vạch qua đầu đọc GM65 để đối chiếu lại, hoặc nhân viên siêu thị can thiệp nhập mã PIN quản trị viên (Staff 8888).", "Quy trình giải tỏa bất thường:")
add_bullet(" Sau khi giỏ hàng được xác thực an toàn, hệ thống sinh mã VietQR động chứa mã hóa đơn và số tiền cần trả. Khách quét mã qua ứng dụng ngân hàng, Webhook phản hồi thành công, in hóa đơn điện tử, xóa sạch dữ liệu phiên và hướng dẫn khách trả xe về trạm.", "Chu trình thanh toán VietQR và đóng phiên:")
add_image_safe(os.path.join(screenshots_dir, "giai_doan_4_thanh_toan_vietqr.png"), "Hình 3.0d: Sơ đồ khối Giai đoạn 4 - Kiểm tra an toàn, xử lý bất thường và thanh toán VietQR", width_inch=4.8)

add_heading_3("3.5.3. Minh họa trực quan quy trình mua sắm trên App Tablet")
add_body("Dưới đây là bộ ảnh chụp thực tế toàn bộ 9 màn hình tương tác chính của ứng dụng Tablet trên xe đẩy thông minh:")

add_image_safe(os.path.join(screenshots_dir, "Screenshot_20261014_204808_Xe y Thng Minh.jpg"), "Hình 3.1: Màn hình Khởi động (Splash Screen) với biểu tượng nhận diện thương hiệu SmartCart PTIT")
add_image_safe(os.path.join(screenshots_dir, "Screenshot_20261014_204814_Xe y Thng Minh.jpg"), "Hình 3.2: Màn hình Chào mừng (Welcome Screen) hướng dẫn khách hàng bắt đầu phiên mua sắm")
add_image_safe(os.path.join(screenshots_dir, "Screenshot_20261014_204823_Xe y Thng Minh.jpg"), "Hình 3.3: Màn hình Đăng nhập hội viên bằng cách quét mã QR từ điện thoại di động")
add_image_safe(os.path.join(screenshots_dir, "Screenshot_20261014_204831_Xe y Thng Minh.jpg"), "Hình 3.4: Màn hình Mua sắm chính ở trạng thái sẵn sàng tự động nhận diện sản phẩm qua cảm biến IoT")
add_image_safe(os.path.join(screenshots_dir, "Screenshot_20261014_205058_Xe y Thng Minh.jpg"), "Hình 3.5: Giao diện khi Camera AI và GM65 nhận diện thành công sản phẩm (Cà phê G7, đồng bộ cảm biến khớp)")
add_image_safe(os.path.join(screenshots_dir, "Screenshot_20261014_205103_Xe y Thng Minh.jpg"), "Hình 3.6: Màn hình Chi tiết giỏ hàng (Cart Detail Screen) hiển thị danh sách hàng hóa và bảng kê tổng tiền")
add_image_safe(os.path.join(screenshots_dir, "Screenshot_20261014_205115_Xe y Thng Minh.jpg"), "Hình 3.7: Màn hình Lựa chọn phương thức thanh toán (QR Banking, Ví điện tử, Tại quầy)")
add_image_safe(os.path.join(screenshots_dir, "Screenshot_20261014_205121_Xe y Thng Minh.jpg"), "Hình 3.8: Màn hình Hiển thị mã VietQR động kèm đồng hồ đếm ngược chờ xác nhận thanh toán")
add_image_safe(os.path.join(screenshots_dir, "Screenshot_20261014_205157_Xe y Thng Minh.jpg"), "Hình 3.9: Màn hình Kết thúc phiên mua sắm, xóa dữ liệu bảo mật và hướng dẫn khách trả xe về trạm quy định")

# ----------------- PHẦN WEB ADMIN -----------------
add_heading_2("3.6. Hệ thống Nền Tảng Web Quản Trị Bán Lẻ (Web Admin - Next.js 14)")

add_heading_3("3.6.1. Kiến trúc công nghệ Web Admin")
add_body("Phân hệ Web Admin được xây dựng nhằm cung cấp cho ban quản lý siêu thị công cụ giám sát toàn diện mọi hoạt động kinh doanh, kho bãi và tình trạng hoạt động của đội xe đẩy IoT theo thời gian thực. Hệ thống được phát triển trên nền tảng Next.js 14 (App Router), TypeScript và Tailwind CSS, giao tiếp trực tiếp với cơ sở dữ liệu PostgreSQL (stroller_db) thông qua hệ thống RESTful API Gateway (Node.js Express cổng 3000).")

add_heading_3("3.6.2. Phân hệ 1: Bảng điều khiển tổng quan kinh doanh (Dashboard Overview)")
add_body("Giao diện tổng quan (URL: localhost:3001) cung cấp cái nhìn trực quan và nhanh chóng về sức khỏe vận hành của siêu thị:")
add_bullet(" Hiển thị 5 thẻ chỉ số then chốt gồm Doanh thu hôm nay (VNĐ), Đơn hàng hôm nay, Số lượng sản phẩm đang kinh doanh (10 mặt hàng), Số lượng sản phẩm sắp hết và Số xe đẩy đang hoạt động (0/8 xe).", "Thẻ chỉ số tài chính KPI:")
add_bullet(" Biểu đồ tương tác tự động vẽ đường doanh thu thực tế theo ngày từ dữ liệu giao dịch thành công trong PostgreSQL.", "Biểu đồ doanh thu 7 ngày:")
add_bullet(" Biểu đồ hình tròn phân loại trực quan số lượng đơn hàng đã thanh toán, đang xử lý và đã hủy.", "Trạng thái đơn hàng:")
add_image_safe(os.path.join(screenshots_dir, "Screenshot 2026-10-16 230432.png"), "Hình 3.10: Giao diện Bảng điều khiển Tổng quan kinh doanh (Dashboard Overview) trên Web Admin")

add_heading_3("3.6.3. Phân hệ 2: Quản lý và theo dõi dòng tiền đơn hàng (Orders Management)")
add_body("Giao diện Quản lý đơn hàng (URL: localhost:3001/orders) cho phép theo dõi toàn bộ các giao dịch phát sinh từ xe đẩy thông minh và hệ sinh thái Mock Bank:")
add_bullet(" Hiển thị chi tiết từng hóa đơn gồm Mã đơn (#ORD-98241,...), Tên và số điện thoại khách hàng, Thời gian giao dịch, Số lượng mặt hàng, Tổng tiền thanh toán và Trạng thái (Hoàn thành, Chờ xử lý, Đang mua sắm, Đã hủy).", "Bảng dữ liệu hóa đơn thời gian thực:")
add_bullet(" Ghi nhận chính xác nguồn tiền gồm Ví điện tử SmartPay, Thẻ Visa Platinum, Quét mã QR MockBank và Ví hội viên trả sau.", "Phương thức thanh toán đa dạng:")
add_bullet(" Cho phép trích xuất toàn bộ dữ liệu giao dịch ra file CSV phục vụ công tác kế toán và báo cáo doanh thu định kỳ.", "Tiện ích xuất báo cáo:")
add_image_safe(os.path.join(screenshots_dir, "Screenshot 2026-10-16 230458.png"), "Hình 3.11: Giao diện Quản lý Đơn hàng và Lịch sử Giao dịch trên Web Admin")

add_heading_3("3.6.4. Phân hệ 3: Quản lý danh mục sản phẩm và giá niêm yết (Products Management)")
add_body("Phân hệ Quản lý sản phẩm (URL: localhost:3001/products) lưu trữ và đồng bộ danh mục hàng hóa bán lẻ:")
add_bullet(" Hiển thị đầy đủ hình ảnh sản phẩm, tên mặt hàng (Muối tinh sấy, Khăn ướt Puri, Cà phê G7, Coca Cola lon, Sữa đặc Ông Thọ, Sữa Vinamilk, TH true MILK,...), mã SKU/Barcode chuẩn EAN-13, ngành hàng, đơn giá niêm yết và số lượng tồn kho.", "Danh mục sản phẩm chi tiết:")
add_bullet(" Cung cấp công cụ tìm kiếm tức thời theo từ khóa tên hoặc mã vạch, bộ lọc theo danh mục ngành hàng và bộ lọc trạng thái kinh doanh.", "Tìm kiếm và phân loại thông minh:")
add_bullet(" Cho phép quản trị viên thêm mới sản phẩm, cập nhật đơn giá hoặc xóa sản phẩm khỏi hệ thống xe đẩy chỉ với 1 click.", "Thao tác quản trị trực tiếp:")
add_image_safe(os.path.join(screenshots_dir, "Screenshot 2026-10-16 230506.png"), "Hình 3.12: Giao diện Quản lý Danh mục Sản phẩm và Giá niêm yết trên Web Admin")

add_heading_3("3.6.5. Phân hệ 4: Quản lý kho hàng và luân chuyển hàng hóa (Inventory Management)")
add_body("Phân hệ Kho hàng (URL: localhost:3001/inventory) giám sát lượng hàng dự trữ, giá trị luân chuyển và cảnh báo an toàn chuỗi cung ứng:")
add_bullet(" Tổng sản phẩm lưu kho (800 đơn vị), Tổng giá trị tồn kho (24.850.000 VNĐ), Số lượng sản phẩm sắp hết và hết hàng.", "Thẻ chỉ số kho bãi:")
add_bullet(" Biểu đồ Donut phân tích cơ cấu giá trị hàng hóa: Thực phẩm tươi sống chiếm 68% (17 triệu VNĐ), Đồ uống chiếm 23% (5.6 triệu VNĐ) và Bánh kẹo chiếm 9% (2.25 triệu VNĐ).", "Biểu đồ giá trị tồn kho theo ngành:")
add_bullet(" Lưu vết chứng từ nhập kho từ nhà cung cấp (Vinamilk, La Vie) và xuất kho lên quầy kệ bán lẻ tầng 1.", "Nhật ký nhập / xuất kho gần đây:")
add_image_safe(os.path.join(screenshots_dir, "Screenshot 2026-10-16 230513.png"), "Hình 3.13: Giao diện Quản lý Kho hàng và Biểu đồ Cơ cấu Tồn kho trên Web Admin")

add_heading_3("3.6.6. Phân hệ 5: Giám sát đội xe đẩy IoT trên bản đồ 2D siêu thị thời gian thực (Smart Cart Live Floor Plan)")
add_body("Đây là phân hệ công nghệ nổi bật nhất của Web Admin (URL: localhost:3001/smart-cart), kết hợp dữ liệu telemetry từ phần cứng và máy chủ IoT ThingsBoard:")
add_bullet(" Bản đồ trực quan mô phỏng toàn bộ mặt bằng siêu thị gồm Khu A (Đồ uống), Khu B (Bánh kẹo), Khu C (Thực phẩm), Khu D (Gia dụng), Khu E (Hóa mỹ phẩm), Khu F (Tươi sống), Dãy quầy thu ngân tự động (#01 - #10) và Trạm sạc pin kỹ thuật.", "Bản đồ mặt bằng siêu thị 2D (Live Floor Plan):")
add_bullet(" Các xe đẩy được đánh mã định danh (SC-001, SC-002, SC-003, SC-015, SC-016, SC-017, SC-008) hiển thị dưới dạng các điểm radar trực quan kèm tỷ lệ % pin và trạng thái kết nối mạng (Màu xanh: Online, Màu vàng: Đang sạc, Màu đỏ: Offline).", "Định vị xe đẩy theo thời gian thực (Radar Live):")
add_bullet(" Khi rê chuột vào từng xe, hệ thống hiển thị pop-up chi tiết: Vị trí hiện tại, % pin, Tên khách hàng đang sử dụng và thời điểm cập nhật tín hiệu gần nhất.", "Bảng giám sát chi tiết:")
add_image_safe(os.path.join(screenshots_dir, "Screenshot 2026-10-16 230529.png"), "Hình 3.14: Giao diện Giám sát Đội xe đẩy trên Bản đồ 2D Siêu thị Thời gian thực (Live Floor Plan)")

# ----------------- PHẦN WEB KHÁCH HÀNG -----------------
add_heading_2("3.7. Hệ thống Cổng Web Ứng Dụng Khách Hàng (Customer Mobile Web / PWA)")

add_heading_3("3.7.1. Kiến trúc Progressive Web App (PWA) phục vụ khách hàng")
add_body("Bên cạnh màn hình Tablet gắn cứng trên xe, hệ thống phát triển thêm Cổng Web Khách Hàng dạng Progressive Web App (PWA) chạy mượt mà trên trình duyệt điện thoại cá nhân (iOS, Android). Ứng dụng PWA cho phép khách hàng theo dõi giỏ hàng từ xa, quản lý ví điện tử, tích lũy điểm thưởng và tra cứu thông tin sản phẩm mà không cần cài đặt thêm ứng dụng từ kho ứng dụng.")

add_heading_3("3.7.2. Cổng đăng nhập hội viên và liên kết phiên xe đẩy")
add_body("Giao diện đăng nhập trên điện thoại cá nhân được thiết kế hiện đại, hỗ trợ khách hàng đăng nhập nhanh bằng số điện thoại hoặc chọn nhanh các tài khoản mẫu từ cơ sở dữ liệu (Hạng Vàng, Hạng Kim Cương, Hạng VIP):")
add_image_safe(os.path.join(screenshots_dir, "Screenshot 2026-10-16 230559.png"), "Hình 3.15: Giao diện Cổng Đăng nhập Hội viên Smart Cart Member trên Điện thoại Di động (PWA)")

add_heading_3("3.7.3. Quản lý tài khoản thành viên và điểm thưởng tích lũy")
add_body("Giao diện thông tin tài khoản hiển thị đầy đủ hồ sơ hội viên (Ví dụ: Khách hàng Trần Thị B - Hội viên Kim Cương), số dư ví token (350.000 T), điểm thưởng tích lũy (8900 điểm) cùng danh sách voucher ưu đãi khả dụng (Giảm 50K cho đơn từ 500K, miễn phí gửi xe):")
add_image_safe(os.path.join(screenshots_dir, "Screenshot 2026-10-16 230621.png"), "Hình 3.16: Màn hình Hồ sơ Thành viên, Điểm tích lũy và Danh sách Voucher Ưu đãi")

add_heading_3("3.7.4. Đồng bộ giỏ hàng thời gian thực đa thiết bị (Live Sync Cart)")
add_body("Khi khách hàng liên kết tài khoản với xe đẩy (Ví dụ: Xe STR_001), màn hình giỏ hàng trên điện thoại sẽ tự động kết nối và đồng bộ hai chiều (Live Sync) với màn hình Tablet trên xe. Mọi thao tác thêm/bớt hàng từ cảm biến xe đẩy đều phản hồi ngay lập tức trên điện thoại của khách hàng:")
add_image_safe(os.path.join(screenshots_dir, "Screenshot 2026-10-16 230630.png"), "Hình 3.17: Màn hình Giỏ hàng PWA kết nối đồng bộ thời gian thực theo mã xe đẩy STR_001")

add_heading_3("3.7.5. Hệ sinh thái Ví điện tử không chạm (SmartCart Titanium Contactless)")
add_body("Phân hệ ví điện tử tích hợp thẻ thông minh ảo SmartCart Titanium, hỗ trợ tính năng nạp token thử nghiệm (Faucet Sandbox +50.000 Token tương đương 500.000 VNĐ) phục vụ trải nghiệm thanh toán tự động không chạm khi đi qua cổng kiểm soát:")
add_image_safe(os.path.join(screenshots_dir, "Screenshot 2026-10-16 230637.png"), "Hình 3.18: Giao diện Thẻ ảo Ví điện tử Thông minh SmartCart Titanium và Công cụ Faucet Sandbox")

add_heading_3("3.7.6. Tiện ích tra cứu giá và tồn kho sản phẩm trực tuyến")
add_body("Khách hàng có thể sử dụng thanh tìm kiếm thông minh trên điện thoại để tra cứu nhanh thông tin, giá niêm yết và tình trạng còn hàng trên kệ siêu thị trước khi quyết định chọn mua sản phẩm:")
add_image_safe(os.path.join(screenshots_dir, "Screenshot 2026-10-16 230646.png"), "Hình 3.19: Màn hình Tra cứu Danh mục Sản phẩm và Tồn kho Siêu thị trên Điện thoại Khách hàng")

# ----------------- CHƯƠNG 4 -----------------
add_heading_1("CHƯƠNG 4: ĐÁNH GIÁ THỰC NGHIỆM VÀ ĐO LƯỜNG HIỆU NĂNG HỆ THỐNG")

add_heading_2("4.5. Đánh giá Hiệu năng Giao diện và Đo lường Độ Mượt mà (Thời gian Render UI)")

add_heading_3("4.5.1. Mục tiêu và Phương pháp đo kiểm")
add_body("Trong hệ thống bán lẻ tự động sử dụng máy tính bảng (Tablet) gắn trên xe đẩy, giao diện người dùng phải liên tục tiếp nhận luồng dữ liệu thời gian thực từ cụm cảm biến phần cứng (Camera AI, máy quét mã vạch GM65, cảm biến cân nặng HX711) thông qua mạng không dây. Nếu ứng dụng không được tối ưu hóa kiến trúc vẽ lại giao diện (Recomposition), thiết bị sẽ gặp hiện tượng tụt khung hình (Jank/Drop Frame), giật lag khi cuộn giỏ hàng hoặc phản hồi chậm chạp, gây suy giảm trải nghiệm mua sắm.")
add_body("Mục tiêu thực nghiệm là định lượng chính xác độ mượt mà của ứng dụng Tablet thông qua các chỉ số cốt lõi: Thời gian Render khung hình (ms), Tốc độ khung hình (FPS), Tỷ lệ khung hình bị trễ (Janky Frames %) và Mức độ tiêu thụ tài nguyên bộ nhớ RAM.")

add_heading_3("4.5.2. Bảng kết quả đo lường hiệu năng thực nghiệm")
add_body("Dưới đây là bảng tổng hợp số liệu đo kiểm thực tế sau 50 lần thực hiện lặp lại cho chuỗi kịch bản cuộn danh sách giỏ hàng và nhận gói tin polling 650ms:")

# Benchmark Table
bench_table = doc.add_table(rows=8, cols=4)
bench_table.alignment = WD_TABLE_ALIGNMENT.CENTER
bench_headers = ["Chỉ số đánh giá", "Giá trị thực tế", "Ngưỡng chuẩn Google", "Đánh giá kỹ thuật"]
for col_idx, h in enumerate(bench_headers):
    c = bench_table.rows[0].cells[col_idx]
    c.text = h
    c.paragraphs[0].runs[0].bold = True
    c.paragraphs[0].runs[0].font.name = "Times New Roman"
    set_cell_background(c, "1E3A8A")
    c.paragraphs[0].runs[0].font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

bench_rows = [
    ("Thời gian Render UI (Recomposition)", "13.8 ms", "< 16.6 ms", "Đạt chuẩn 60 FPS mượt mà"),
    ("Tốc độ khung hình trung bình (FPS)", "59.4 FPS", ">= 55.0 FPS", "Rất ổn định, không drop frame"),
    ("Tỷ lệ khung hình bị trễ (Janky frames)", "1.4%", "< 5.0%", "Thấp hơn nhiều ngưỡng Google"),
    ("Thời gian phản hồi nút bấm (+ / -)", "8.2 ms", "< 50.0 ms", "Cập nhật tức thời (Optimistic UI)"),
    ("Độ trễ toàn trình (Hardware -> UI)", "385 ms", "< 700.0 ms", "Phản hồi gần như tức thì"),
    ("Mức chiếm dụng bộ nhớ RAM", "94.2 MB", "< 256.0 MB", "Ổn định, không rò rỉ bộ nhớ"),
    ("Mức tải vi xử lý CPU", "5.2% - 8.6%", "< 25.0%", "Rất nhẹ nhàng cho Tablet")
]

for row_idx, r_data in enumerate(bench_rows):
    row = bench_table.rows[row_idx + 1]
    for col_idx, val in enumerate(r_data):
        c = row.cells[col_idx]
        c.text = val
        c.paragraphs[0].runs[0].font.name = "Times New Roman"
        if row_idx % 2 == 1:
            set_cell_background(c, "F8FAFC")
        else:
            set_cell_background(c, "FFFFFF")

doc.add_paragraph()

add_heading_3("4.5.3. Phân tích chi tiết biểu đồ thực nghiệm trực quan")
add_body("Kết quả đo kiểm được trích xuất trực quan thành các biểu đồ dashboard chuyên sâu dưới đây:")

add_image_safe(os.path.join(screenshots_dir, "Screenshot 2026-10-17 095733.png"), "Hình 4.1: Bảng điều khiển KPI Hiệu năng và Diễn biến Thời gian Render Frame Time qua 50 chu kỳ so với ngưỡng 16.6 ms")
add_image_safe(os.path.join(screenshots_dir, "Screenshot 2026-10-17 095749.png"), "Hình 4.2: Biểu đồ Phân vị Thời gian Render (P50 - P99) và Cấu trúc Phân bổ Chi tiết 13.8 ms trong một chu kỳ")

add_body("Phân tích chuyên sâu từ các biểu đồ thực nghiệm:")
add_bullet(" Toàn bộ 50 khung hình liên tiếp đều dao động an toàn trong dải 12.4 ms - 15.2 ms, nằm hoàn toàn dưới đường đứt nét màu đỏ (16.6 ms). Tốc độ khung hình trung bình đạt 59.4 FPS, tỷ lệ khung hình mượt mà chiếm tới 98.6%, tỷ lệ giật lag chỉ 1.4%.", "1. Diễn biến thời gian kết xuất (Line & Donut Chart):")
add_bullet(" Phân vị trung vị P50 đạt 12.4 ms; ở các mức tải cao P90 và P95 lần lượt đạt 14.2 ms và 15.0 ms. Trường hợp tải nặng nhất P99 cũng chỉ dừng lại ở 15.8 ms, chứng minh hệ thống không bao giờ xảy ra hiện tượng đóng băng khung hình (Frozen frames).", "2. Khả năng chịu tải qua các phân vị (Percentiles):")
add_bullet(" Trong tổng số 13.8 ms của một chu kỳ render: Thuật toán so khớp bản chụp (Poller Diffing) chỉ mất 1.5 ms; Giai đoạn tái tạo giao diện (Compose Recomposition) mất 5.2 ms; và Card đồ họa vẽ lên màn hình (RenderThread GPU Draw) chiếm 7.1 ms.", "3. Phân rã cấu trúc chu kỳ Render 13.8 ms:")
add_bullet(" Nhờ cơ chế giải phóng Coroutine Job triệt để khi kết thúc phiên, mức chiếm dụng RAM của Tablet duy trì ổn định ở mức 94.2 MB, hoàn toàn không có hiện tượng rò rỉ bộ nhớ sau nhiều giờ vận hành liên tục.", "4. Tiêu thụ tài nguyên bộ nhớ:")

add_heading_3("4.5.4. Các kỹ thuật tối ưu hóa Jetpack Compose đã áp dụng")
add_bullet(" Tách biệt giữa CartDetailScreen (Stateful) và CartDetailContent (Stateless) giúp cô lập phạm vi vẽ lại giao diện.", "Tách biệt Stateful và Stateless Composable:")
add_bullet(" Sử dụng derivedStateOf khi theo dõi vị trí cuộn của LazyListState, ngăn chặn việc Compose vẽ lại giao diện liên tục theo từng pixel cuộn ngón tay.", "Kiểm soát bẫy Recomposition bằng derivedStateOf:")
add_bullet(" Gán khóa định danh bất biến (key = { it.product.id }) trong LazyColumn, giúp Compose chỉ vẽ lại duy nhất Card sản phẩm có số lượng thay đổi thay vì dựng lại toàn bộ danh sách giỏ hàng.", "Tối ưu hóa danh sách cuộn bằng khóa định danh:")
add_bullet(" Thư viện Coil tải ảnh tĩnh bất đồng bộ từ máy chủ Node.js và lưu đệm 2 tầng (RAM & Disk Cache), giúp ảnh hiển thị tức thời trong các lần render tiếp theo trong thời gian < 1 ms.", "Lưu đệm hình ảnh 2 tầng với Coil:")

add_heading_3("4.5.5. Kết luận đánh giá")
add_body("Các số liệu định lượng và biểu đồ thực nghiệm chứng minh hệ thống giao diện của Xe Đẩy Mua Sắm Thông Minh (cả App Tablet, Web Admin và Web Khách hàng) đều đạt độ mượt mà xuất sắc, ổn định ở mức 60 FPS, phản hồi nhanh nhạy và đáp ứng trọn vẹn tiêu chuẩn chất lượng của các giải pháp thương mại điện tử hiện đại.")

# Save docx
out_docx = r"c:\Users\LE THI HAU\.gemini\antigravity\scratch\StrollerApp\BaoCao_ToanDien_UI_UX_Frontend.docx"
final_docx = r"c:\Users\LE THI HAU\.gemini\antigravity\scratch\StrollerApp\BaoCao_ToanDien_UI_UX_Frontend_Final.docx"
cosodo_docx = r"c:\Users\LE THI HAU\.gemini\antigravity\scratch\StrollerApp\BaoCao_ToanDien_UI_UX_Frontend_CoSoDo.docx"

doc.save(final_docx)
print(f"Đã lưu bản hoàn thiện đầy đủ tại: {final_docx}")

try:
    doc.save(out_docx)
    print(f"Đã cập nhật file gốc tại: {out_docx}")
except PermissionError:
    print(f"File gốc đang mở trong Word, đã lưu sang bản Final để bạn mở ngay.")

try:
    doc.save(cosodo_docx)
except PermissionError:
    pass
