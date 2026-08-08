import os

replacements = {
    '"Chào mừng bạn đến với xe đẩy thông minh"': 'stringResource(R.string.welcome_title)',
    '"Nâng tầm trải nghiệm mua sắm của bạn với công nghệ tự động thanh toán và tìm kiếm sản phẩm thông minh chỉ trong vài bước chạm."': 'stringResource(R.string.welcome_desc)',
    '"Bắt đầu mua sắm"': 'stringResource(R.string.btn_start_shopping)',
    '"Quét mã khách hàng để bắt đầu"': 'stringResource(R.string.btn_scan_customer)',
    '"Thanh toán nhanh"': 'stringResource(R.string.feature_fast_payment)',
    '"Quản lý giỏ hàng"': 'stringResource(R.string.feature_cart_management)',
    '"Chỉ đường AI"': 'stringResource(R.string.feature_ai_routing)',
    '"Tiết kiệm 15p"': 'stringResource(R.string.save_time_title)',
    '"Thời gian mua sắm\\ntrung bình của bạn"': 'stringResource(R.string.save_time_desc)',
    '"Khách hàng | Wi-Fi | 85% | 14:30"': 'stringResource(R.string.status_text_default)',
    '"Trang chủ"': 'stringResource(R.string.nav_home)',
    '"Quét mã"': 'stringResource(R.string.nav_scan)',
    '"Giỏ hàng"': 'stringResource(R.string.nav_cart)',
    '"Hỗ trợ"': 'stringResource(R.string.nav_support)',
    '"Thanh toán"': 'stringResource(R.string.nav_payment)',
    '"Quét khuôn mặt"': 'stringResource(R.string.scan_face_title)',
    '"Đưa khuôn mặt của bạn vào khung hình để hệ thống nhận diện và áp dụng các ưu đãi cá nhân hóa."': 'stringResource(R.string.scan_face_desc)',
    '"Đang khởi động camera..."': 'stringResource(R.string.camera_starting)',
    '"Mẹo: Bỏ qua bước này nếu bạn không muốn đăng nhập, bạn vẫn có thể mua sắm bình thường."': 'stringResource(R.string.scan_face_tip)',
    '"Bắt đầu quét"': 'stringResource(R.string.btn_start_scan)',
    '"Bỏ qua đăng nhập"': 'stringResource(R.string.btn_skip_login)',
    '"Nhận diện sản phẩm"': 'stringResource(R.string.scan_product_title)',
    '"Đưa mã vạch hoặc toàn bộ sản phẩm vào khu vực camera để thêm vào giỏ hàng."': 'stringResource(R.string.scan_product_desc)',
    '"Đang quét sản phẩm..."': 'stringResource(R.string.scanning_product)',
    '"Bạn đang mua:"': 'stringResource(R.string.cart_summary_title)',
    '"Tổng cộng"': 'stringResource(R.string.cart_total)',
    '"sản phẩm"': 'stringResource(R.string.items)',
    '"Tới giỏ hàng"': 'stringResource(R.string.btn_go_to_cart)',
    '"Giỏ hàng của bạn"': 'stringResource(R.string.cart_detail_title)',
    '"Danh sách các sản phẩm bạn đã chọn."': 'stringResource(R.string.cart_detail_desc)',
    '"Tiếp tục quét"': 'stringResource(R.string.btn_continue_scan)',
    '"Phương thức thanh toán"': 'stringResource(R.string.payment_selection_title)',
    '"Chọn cách bạn muốn thanh toán cho đơn hàng này."': 'stringResource(R.string.payment_selection_desc)',
    '"Thẻ tín dụng / Ghi nợ"': 'stringResource(R.string.pay_card)',
    '"Chạm thẻ lên máy POS"': 'stringResource(R.string.pay_card_desc)',
    '"Ví điện tử (QR Code)"': 'stringResource(R.string.pay_qr)',
    '"Quét bằng Momo, ZaloPay, VNPay"': 'stringResource(R.string.pay_qr_desc)',
    '"Thanh toán tiền mặt"': 'stringResource(R.string.pay_cash)',
    '"XÁC NHẬN THANH TOÁN"': 'stringResource(R.string.btn_confirm_payment)',
    '"Quay lại giỏ hàng"': 'stringResource(R.string.btn_back_to_cart)',
    '"Thanh toán qua mã QR"': 'stringResource(R.string.payment_qr_title)',
    '"Mở ứng dụng ngân hàng hoặc ví điện tử để quét mã dưới đây."': 'stringResource(R.string.payment_qr_desc)',
    '"Quay lại"': 'stringResource(R.string.btn_back)',
    '"Thanh toán thành công!"': 'stringResource(R.string.payment_success_title)',
    '"Cảm ơn bạn đã mua sắm. Giao dịch của bạn đã được xử lý an toàn."': 'stringResource(R.string.payment_success_desc)',
    '"Tải hóa đơn"': 'stringResource(R.string.btn_download_receipt)',
    '"Gửi email"': 'stringResource(R.string.btn_send_email)',
    '"Hóa đơn điện tử"': 'stringResource(R.string.receipt_title)',
    '"Ngày:"': 'stringResource(R.string.receipt_date)',
    '"Mã GD:"': 'stringResource(R.string.receipt_id)',
    '"Giảm giá:"': 'stringResource(R.string.receipt_discount)',
    '"Kết thúc phiên mua sắm"': 'stringResource(R.string.btn_end_session)',
    '"Phiên mua sắm đã kết thúc"': 'stringResource(R.string.session_ended_title)',
    '"Vui lòng đưa xe về khu vực quy định. Cảm ơn quý khách đã tin tưởng sử dụng dịch vụ của chúng tôi!"': 'stringResource(R.string.session_ended_desc)',
    '"Khu vực trả xe: Công A & Cổng B"': 'stringResource(R.string.return_area)',
    '"Bảo mật thông tin: Dữ liệu cá nhân của bạn đã được xóa hoàn toàn khỏi hệ thống xe đẩy để đảm bảo an toàn."': 'stringResource(R.string.privacy_notice)',
    '"Mất kết nối hệ thống"': 'stringResource(R.string.connection_error_title)',
    '"Không thể đồng bộ giỏ hàng. Vui lòng chờ hoặc gọi nhân viên."': 'stringResource(R.string.connection_error_desc)',
    '"Kết nối Wi-Fi chập chờn hoặc rớt mạng."': 'stringResource(R.string.error_wifi)',
    '"Lỗi máy chủ không phản hồi."': 'stringResource(R.string.error_server)',
    '"Thử lại"': 'stringResource(R.string.btn_retry)',
    '"Gọi nhân viên hỗ trợ"': 'stringResource(R.string.btn_call_support)',
    '"Phát hiện sản phẩm chưa quét"': 'stringResource(R.string.unscanned_warning_title)',
    '"Hệ thống cân điện tử hoặc camera phát hiện có sản phẩm trong giỏ nhưng chưa được nhận diện. Vui lòng kiểm tra lại!"': 'stringResource(R.string.unscanned_warning_desc)',
    '"Trọng lượng tăng bất thường"': 'stringResource(R.string.unscanned_reason_weight)',
    '"Camera phát hiện vật thể lạ"': 'stringResource(R.string.unscanned_reason_camera)',
    '"Đã quét lại sản phẩm"': 'stringResource(R.string.btn_confirm_scan)',
    '"Bỏ sản phẩm ra"': 'stringResource(R.string.btn_remove_item)',
    '"SMART CART"': 'stringResource(R.string.logo_text)'
}

# Add import statements
IMPORTS = [
    'import androidx.compose.ui.res.stringResource',
    'import com.example.xedaythongminh.R',
    'import com.example.xedaythongminh.ui.theme.*'
]

def add_imports_and_replace(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add imports
    for imp in IMPORTS:
        if imp not in content:
            content = content.replace('import androidx.compose.runtime.Composable', f'import androidx.compose.runtime.Composable\n{imp}')

    # For replacing hardcoded colors
    # We replace local val PrimaryBlue = Color(...) and others.
    # We'll just remove them
    colors_to_remove = [
        'val PrimaryBlue = Color(0xFF0D47A1)\n',
        'val LightBlueBg = Color(0xFFE3F2FD)\n',
        'val BackgroundGray = Color(0xFFF8F9FA)\n',
        'val TextDark = Color(0xFF1A1A1A)\n',
        'val TextGray = Color(0xFF666666)\n',
        'val BorderGray = Color(0xFFE0E0E0)\n',
        'val GreenAccent = Color(0xFF69F0AE)\n'
    ]
    for c in colors_to_remove:
        content = content.replace(c, '')
        
    # Also handle some variations without \n at the end just in case
    for c in colors_to_remove:
        content = content.replace(c.strip(), '')

    # Apply string replacements
    for old, new in replacements.items():
        # Text(text = "abc") -> Text(text = stringResource(R.string.abc))
        # activeLabel = "abc" -> activeLabel = stringResource(R.string.abc)
        content = content.replace(old, new)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

UI_DIRS = [
    'app/src/main/java/com/example/xedaythongminh/ui/screens',
    'app/src/main/java/com/example/xedaythongminh/ui/components'
]

for d in UI_DIRS:
    for root, _, files in os.walk(d):
        for file in files:
            if file.endswith('.kt'):
                add_imports_and_replace(os.path.join(root, file))

print("Strings replaced and colors removed from screens.")
