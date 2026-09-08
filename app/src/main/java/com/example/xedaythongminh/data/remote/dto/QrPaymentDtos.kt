package com.example.xedaythongminh.data.remote.dto

import com.google.gson.annotations.SerializedName

data class QrPaymentSessionResponseDto(
    @SerializedName("status") val status: String,
    @SerializedName("data") val data: QrPaymentSessionData?
)

data class QrPaymentSessionData(
    @SerializedName("orderId") val orderId: String,
    @SerializedName("amountVnd") val amountVnd: Long,
    @SerializedName("amountTokens") val amountTokens: Long,
    @SerializedName("toAccount") val toAccount: String,
    @SerializedName("qrContent") val qrContent: String,
    @SerializedName("expiresAt") val expiresAt: Long? = null,
    @SerializedName("lockedUntil") val lockedUntil: Long? = null,
    @SerializedName("validitySeconds") val validitySeconds: Int? = 300,
    @SerializedName("lockSeconds") val lockSeconds: Int? = 60
)

data class QrPaymentStatusResponseDto(
    @SerializedName("status") val status: String,
    @SerializedName("data") val data: QrPaymentStatusData?
)

data class QrPaymentStatusData(
    @SerializedName("orderId") val orderId: String,
    @SerializedName("isPaid") val isPaid: Boolean,
    @SerializedName("paymentStatus") val paymentStatus: String,
    @SerializedName("transactionId") val transactionId: String?,
    @SerializedName("amountTokens") val amountTokens: Long,
    @SerializedName("isLocked") val isLocked: Boolean? = false,
    @SerializedName("lockRemainingSeconds") val lockRemainingSeconds: Int? = 0,
    @SerializedName("expiryRemainingSeconds") val expiryRemainingSeconds: Int? = 0
)