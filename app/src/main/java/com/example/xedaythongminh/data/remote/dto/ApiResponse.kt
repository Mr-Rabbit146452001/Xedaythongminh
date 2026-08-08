package com.example.xedaythongminh.data.remote.dto

import com.google.gson.annotations.SerializedName

data class ApiResponse(
    @SerializedName("status") val status: String,
    @SerializedName("total") val total: Int?,
    @SerializedName("data") val data: List<ProductDto>
)
