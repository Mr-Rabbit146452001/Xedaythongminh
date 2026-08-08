package com.example.xedaythongminh.data.remote.dto

import com.google.gson.annotations.SerializedName

data class RemoteCartResponse(
    @SerializedName("status") val status: String,
    @SerializedName("data") val data: RemoteCartData?
)

data class RemoteCartData(
    @SerializedName("sessionId") val sessionId: String,
    @SerializedName("items") val items: List<RemoteCartItemDto>,
    @SerializedName("totalAmount") val totalAmount: Double,
    @SerializedName("totalItems") val totalItems: Int
)

data class RemoteCartItemDto(
    @SerializedName("product") val product: ProductDto,
    @SerializedName("quantity") val quantity: Int
)

data class CartItemRequest(
    @SerializedName("barcode") val barcode: String,
    @SerializedName("quantity") val quantity: Int,
    @SerializedName("sessionId") val sessionId: String? = "SESSION_DEFAULT"
)

data class CartItemDeleteRequest(
    @SerializedName("barcode") val barcode: String,
    @SerializedName("sessionId") val sessionId: String? = "SESSION_DEFAULT"
)

data class CheckoutRequest(
    @SerializedName("sessionId") val sessionId: String? = "SESSION_DEFAULT",
    @SerializedName("customerId") val customerId: String? = "CUSTOMER_888"
)
