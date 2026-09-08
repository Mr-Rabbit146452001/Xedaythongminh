package com.example.xedaythongminh.domain.model

enum class PaymentMethodType {
    E_WALLET,          // Ví điện tử (SmartPay, MoMo, ZaloPay)
    CREDIT_DEBIT_CARD, // Thẻ thanh toán quốc tế / nội địa
    MEMBER_ACCOUNT     // Tài khoản ví hội viên trả sau
}

enum class AutoPaymentStatus {
    IDLE,              // Sẵn sàng
    VERIFYING_CART,    // Đang kiểm tra an toàn giỏ hàng & cảm biến cân nặng IoT
    AUTHORIZING,       // Đang ủy quyền & xác thực phương thức thanh toán
    CHARGING,          // Đang thực hiện khấu trừ số dư tự động
    SUCCESS,           // Giao dịch thành công
    FAILED             // Thất bại
}

data class PaymentMethod(
    val id: String,
    val name: String,
    val type: PaymentMethodType,
    val maskedNumber: String,
    val balance: Long,
    val isDefault: Boolean,
    val providerIcon: String = ""
)

data class AutoPaymentReceipt(
    val transactionId: String,
    val timestamp: Long,
    val subtotal: Long,
    val discountAmount: Long,
    val finalAmount: Long,
    val pointsEarned: Int,
    val paymentMethodName: String,
    val customerId: String
)

sealed class AutoPaymentException(override val message: String) : Exception(message) {
    object CartEmptyException : AutoPaymentException("Giỏ hàng đang trống, không thể thanh toán")
    object WeightAnomalyException : AutoPaymentException("Cảnh báo trọng lượng giỏ hàng bất thường! Vui lòng quét mã sản phẩm hoặc liên hệ nhân viên.")
    object InsufficientBalanceException : AutoPaymentException("Số dư tài khoản thanh toán tự động không đủ")
    data class GatewayException(val errorMsg: String) : AutoPaymentException(errorMsg)
}
