package com.example.xedaythongminh.data.remote.dto

import com.google.gson.annotations.SerializedName
import com.example.xedaythongminh.data.models.User

data class SessionResponse(
    @SerializedName("status") val status: String,
    @SerializedName("data") val data: SessionData
)

data class SessionData(
    @SerializedName("sessionId") val sessionId: String,
    @SerializedName("loginUrl") val loginUrl: String
)

data class SessionStatusResponse(
    @SerializedName("status") val status: String,
    @SerializedName("data") val data: SessionStatusData
)

data class SessionStatusData(
    @SerializedName("authStatus") val authStatus: String,
    @SerializedName("customer") val customer: CustomerDto?
)

data class CustomerDto(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("membershipLevel") val membershipLevel: String,
    @SerializedName("points") val points: Int,
    @SerializedName("phoneNumber") val phoneNumber: String,
    @SerializedName("vouchers") val vouchers: List<String>,
    @SerializedName("promotions") val promotions: List<String>
)

fun CustomerDto.toDomainModel(): User {
    return User(
        id = this.id,
        name = this.name,
        membershipLevel = this.membershipLevel,
        points = this.points,
        phoneNumber = this.phoneNumber,
        vouchers = this.vouchers,
        promotions = this.promotions
    )
}

data class CartStatusResponse(
    @SerializedName("status") val status: String,
    @SerializedName("data") val data: CartStatusData
)

data class CartStatusData(
    @SerializedName("hasUnscannedProduct") val hasUnscannedProduct: Boolean
)

data class CustomerResponse(
    @SerializedName("status") val status: String,
    @SerializedName("data") val data: CustomerDto
)
