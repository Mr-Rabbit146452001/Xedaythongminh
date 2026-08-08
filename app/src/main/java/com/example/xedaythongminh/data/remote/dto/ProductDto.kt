package com.example.xedaythongminh.data.remote.dto

import com.google.gson.annotations.SerializedName
import com.example.xedaythongminh.data.models.Product

data class ProductDto(
    @SerializedName("Id") val id: Int,
    @SerializedName("Barcode") val barcode: String,
    @SerializedName("Name") val name: String,
    @SerializedName("Price") val price: Double,
    @SerializedName("ImageUrl") val imageUrl: String?
)

fun ProductDto.toDomainModel(): Product {
    val baseUrl = com.example.xedaythongminh.data.remote.RetrofitClient.getBaseUrl()
    val fullImageUrl = if (!this.imageUrl.isNullOrBlank()) "${baseUrl}images/${this.imageUrl}" else ""
    return Product(
        id = this.id.toString(),
        sku = this.barcode,
        name = this.name,
        unitPrice = this.price.toLong(),
        imageUrl = fullImageUrl
    )
}
