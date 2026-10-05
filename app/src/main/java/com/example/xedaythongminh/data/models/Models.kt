package com.example.xedaythongminh.data.models

data class User(
    val id: String,
    val name: String,
    val membershipLevel: String,
    val points: Int,
    val phoneNumber: String = "0987.654.321",
    val vouchers: List<String> = listOf("Giảm 50K cho đơn hàng từ 500K", "Miễn phí giao xe tận nhà", "Voucher sinh nhật giảm 15%"),
    val promotions: List<String> = listOf("Tặng 1 bình nước giữ nhiệt khi mua 2 hộp sữa", "Giảm 20% toàn bộ mặt hàng rau quả xanh hôm nay")
)

data class Product(
    val id: String,
    val name: String,
    val sku: String,
    val unitPrice: Long,
    val imageUrl: String = "" // Placeholder for now
)

data class CartItem(
    val product: Product,
    var quantity: Int
) {
    val totalPrice: Long
        get() = product.unitPrice * quantity
}

data class CartSummary(
    val items: List<CartItem>,
    val user: User? = null,
    val selectedVoucher: String? = null
) {
    val subtotal: Long
        get() = items.sumOf { it.totalPrice }

    // Tỷ lệ giảm giá: CHỈ CÓ KHI ĐÃ ĐĂNG NHẬP VÀO TÀI KHOẢN (user != null)
    // Nếu khách không đăng nhập -> 0.0 (Tuyệt đối không có voucher)
    val memberDiscountPercentage: Double
        get() {
            if (user == null) return 0.0
            return when {
                user.membershipLevel.contains("VIP", ignoreCase = true) || user.membershipLevel.contains("Kim Cương", ignoreCase = true) -> 0.20
                user.membershipLevel.contains("Vàng", ignoreCase = true) || user.membershipLevel.contains("Gold", ignoreCase = true) -> 0.15
                user.membershipLevel.contains("Bạc", ignoreCase = true) || user.membershipLevel.contains("Silver", ignoreCase = true) -> 0.10
                user.vouchers.any { it.contains("20%") } -> 0.20
                user.vouchers.any { it.contains("15%") } -> 0.15
                user.vouchers.any { it.contains("10%") } -> 0.10
                user.vouchers.isNotEmpty() -> 0.10
                else -> 0.05
            }
        }

    // Tên voucher giảm giá đồng bộ từ tài khoản khách
    val appliedVoucherName: String?
        get() {
            if (user == null) return null
            if (!selectedVoucher.isNullOrBlank()) return selectedVoucher
            return user.vouchers.firstOrNull() ?: "Ưu đãi ${user.membershipLevel} (${(memberDiscountPercentage * 100).toInt()}%)"
        }

    val memberDiscount: Long
        get() {
            if (user == null || memberDiscountPercentage <= 0.0) return 0L
            return (subtotal * memberDiscountPercentage).toLong()
        }

    // ĐÃ LOẠI BỎ TOÀN BỘ PHÍ VAT THEO YÊU CẦU
    val taxPercentage: Double = 0.0
    val taxAmount: Long = 0L

    // Tổng thanh toán: subtotal - discount (KHÔNG CỘNG VAT)
    val finalTotal: Long
        get() = (subtotal - memberDiscount).coerceAtLeast(0L)
}
