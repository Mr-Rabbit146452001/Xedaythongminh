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
    val memberDiscountPercentage: Double = 0.1, // 10%
    val taxPercentage: Double = 0.08 // 8%
) {
    val subtotal: Long
        get() = items.sumOf { it.totalPrice }

    val memberDiscount: Long
        get() = (subtotal * memberDiscountPercentage).toLong()

    val taxAmount: Long
        get() = ((subtotal - memberDiscount) * taxPercentage).toLong()

    val finalTotal: Long
        get() = subtotal - memberDiscount + taxAmount
}
