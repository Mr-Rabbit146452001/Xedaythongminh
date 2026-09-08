package com.example.xedaythongminh.data.remote.dto

import com.example.xedaythongminh.domain.model.AutoPaymentReceipt
import com.example.xedaythongminh.domain.model.PaymentMethod
import com.example.xedaythongminh.domain.model.PaymentMethodType
import com.google.gson.annotations.SerializedName

data class AutoPaymentRequestDto(
    @SerializedName("sessionId") val sessionId: String,
    @SerializedName("customerId") val customerId: String,
    @SerializedName("paymentMethodId") val paymentMethodId: String
)

data class AutoPaymentResponseDto(
    @SerializedName("status") val status: String,
    @SerializedName("data") val data: AutoPaymentReceiptDataDto?,
    @SerializedName("message") val message: String?
)

data class AutoPaymentReceiptDataDto(
    @SerializedName("transactionId") val transactionId: String,
    @SerializedName("timestamp") val timestamp: Long,
    @SerializedName("subtotal") val subtotal: Long,
    @SerializedName("discountAmount") val discountAmount: Long,
    @SerializedName("finalAmount") val finalAmount: Long,
    @SerializedName("pointsEarned") val pointsEarned: Int,
    @SerializedName("paymentMethodName") val paymentMethodName: String,
    @SerializedName("customerId") val customerId: String
)

fun AutoPaymentReceiptDataDto.toDomainModel(): AutoPaymentReceipt {
    return AutoPaymentReceipt(
        transactionId = transactionId,
        timestamp = timestamp,
        subtotal = subtotal,
        discountAmount = discountAmount,
        finalAmount = finalAmount,
        pointsEarned = pointsEarned,
        paymentMethodName = paymentMethodName,
        customerId = customerId
    )
}

data class PaymentMethodsResponseDto(
    @SerializedName("status") val status: String,
    @SerializedName("data") val data: List<PaymentMethodDto>?
)

data class PaymentMethodDto(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("type") val type: String,
    @SerializedName("maskedNumber") val maskedNumber: String,
    @SerializedName("balance") val balance: Long,
    @SerializedName("isDefault") val isDefault: Boolean
)

fun PaymentMethodDto.toDomainModel(): PaymentMethod {
    val methodType = when (type) {
        "E_WALLET" -> PaymentMethodType.E_WALLET
        "CREDIT_DEBIT_CARD" -> PaymentMethodType.CREDIT_DEBIT_CARD
        "MEMBER_ACCOUNT" -> PaymentMethodType.MEMBER_ACCOUNT
        else -> PaymentMethodType.E_WALLET
    }
    return PaymentMethod(
        id = id,
        name = name,
        type = methodType,
        maskedNumber = maskedNumber,
        balance = balance,
        isDefault = isDefault
    )
}
