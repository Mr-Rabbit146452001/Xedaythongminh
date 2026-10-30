package com.example.xedaythongminh.data.models

data class User(
    val id: String,
    val name: String,
    val membershipLevel: String,
    val points: Int,
    val phoneNumber: String = "",
    val vouchers: List<String> = emptyList(),
    val promotions: List<String> = emptyList()
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

    // ĐÃ XÓA TOÀN BỘ VOUCHER KHUYẾN MÃI THANH TOÁN CHO THÀNH VIÊN THEO YÊU CẦU
    val memberDiscountPercentage: Double = 0.0
    val appliedVoucherName: String? = null
    val memberDiscount: Long = 0L

    // ĐÃ LOẠI BỎ TOÀN BỘ PHÍ VAT THEO YÊU CẦU
    val taxPercentage: Double = 0.0
    val taxAmount: Long = 0L

    // Tổng thanh toán: 100% subtotal (không giảm giá, không cộng VAT)
    val finalTotal: Long
        get() = subtotal.coerceAtLeast(0L)
}
