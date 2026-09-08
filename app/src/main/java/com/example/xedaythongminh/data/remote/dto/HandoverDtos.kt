package com.example.xedaythongminh.data.remote.dto

import com.google.gson.annotations.SerializedName
import com.example.xedaythongminh.data.models.Product
import com.example.xedaythongminh.data.models.CartItem

data class SessionResponseDto(
    @SerializedName("id") val id: String,
    @SerializedName("status") val status: String,
    @SerializedName("started_at_ms") val startedAtMs: Long,
    @SerializedName("ended_at_ms") val endedAtMs: Long? = null
)

data class HandoverCartResponseDto(
    @SerializedName("session_id") val sessionId: String,
    @SerializedName("items") val items: List<HandoverCartItemDto>,
    @SerializedName("total_quantity") val totalQuantity: Int,
    @SerializedName("total_vnd") val totalVnd: Long
)

data class HandoverCartItemDto(
    @SerializedName("barcode") val barcode: String,
    @SerializedName("sku") val sku: String? = null,
    @SerializedName("name") val name: String,
    @SerializedName("quantity") val quantity: Int,
    @SerializedName("unit_price_vnd") val unitPriceVnd: Long,
    @SerializedName("line_total_vnd") val lineTotalVnd: Long
)

fun HandoverCartItemDto.toDomainCartItem(): CartItem {
    val baseUrl = com.example.xedaythongminh.data.remote.RetrofitClient.getBaseUrl()
    val fullImageUrl = "${baseUrl}images/${barcode}.jpg"
    return CartItem(
        product = Product(
            id = barcode,
            sku = sku ?: barcode,
            name = name,
            unitPrice = unitPriceVnd,
            imageUrl = fullImageUrl
        ),
        quantity = quantity
    )
}

data class CartDecisionRequestDto(
    @SerializedName("session_id") val sessionId: String,
    @SerializedName("action") val action: String, // "add" hoặc "remove"
    @SerializedName("barcode") val barcode: String,
    @SerializedName("ai_class") val aiClass: String = "unknown",
    @SerializedName("ai_confidence") val aiConfidence: Float = 1.0f,
    @SerializedName("delta_weight_g") val deltaWeightG: Float = 0.0f,
    @SerializedName("weight_source") val weightSource: String = "simulated"
)

data class HandoverProductDto(
    @SerializedName("id") val id: Long? = null,
    @SerializedName("barcode") val barcode: String? = null,
    @SerializedName("sku") val sku: String? = null,
    @SerializedName("name") val name: String? = null,
    @SerializedName("vision_class") val visionClass: String? = null,
    @SerializedName("price_vnd") val priceVnd: Long? = null,
    @SerializedName("expected_weight_g") val expectedWeightG: Float? = null,
    @SerializedName("weight_tolerance_g") val weightToleranceG: Float? = null,
    @SerializedName("active") val active: Int? = 1
)

fun HandoverProductDto.toDomainProduct(): Product {
    val bCode = barcode ?: sku ?: "UNKNOWN"
    val baseUrl = com.example.xedaythongminh.data.remote.RetrofitClient.getBaseUrl()
    val fullImageUrl = "${baseUrl}images/${bCode}.jpg"
    return Product(
        id = bCode,
        sku = sku ?: bCode,
        name = name ?: "Sản phẩm $bCode",
        unitPrice = priceVnd ?: 0L,
        imageUrl = fullImageUrl
    )
}

// ==========================================
// DTOs CHO CỔNG 8001 (Smart Retail Cart AI Server)
// ==========================================
data class QrProductRequest(
    @SerializedName("qr_code") val qrCode: String
)

data class QrProductResponseDto(
    @SerializedName("found") val found: Boolean = false,
    @SerializedName("message") val message: String? = null,
    @SerializedName("id") val id: Any? = null,
    @SerializedName("barcode") val barcode: String? = null,
    @SerializedName("sku") val sku: String? = null,
    @SerializedName("name") val name: String? = null,
    @SerializedName("vision_class") val visionClass: String? = null,
    @SerializedName("price_vnd") val priceVnd: Long? = null,
    @SerializedName("price") val price: Long? = null,
    @SerializedName("expected_weight_g") val expectedWeightG: Float? = null,
    @SerializedName("weight_tolerance_g") val weightToleranceG: Float? = null,
    @SerializedName("product") val product: HandoverProductDto? = null,
    @SerializedName("data") val data: HandoverProductDto? = null
)

fun QrProductResponseDto.toDomainProduct(fallbackBarcode: String): Product {
    val target = product ?: data
    val targetBarcode = target?.barcode ?: barcode ?: fallbackBarcode
    val targetName = target?.name ?: name ?: "Sản phẩm $targetBarcode"
    val targetPrice = target?.priceVnd ?: priceVnd ?: price ?: 0L
    val targetSku = target?.sku ?: sku ?: targetBarcode
    val baseUrl = com.example.xedaythongminh.data.remote.RetrofitClient.getBaseUrl()
    return Product(
        id = targetBarcode,
        sku = targetSku,
        name = targetName,
        unitPrice = targetPrice,
        imageUrl = "${baseUrl}images/${targetBarcode}.jpg"
    )
}
