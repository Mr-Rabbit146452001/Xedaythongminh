package com.example.xedaythongminh.domain.repository

import com.example.xedaythongminh.domain.model.AutoPaymentReceipt
import com.example.xedaythongminh.domain.model.PaymentMethod

interface PaymentRepository {
    suspend fun getLinkedPaymentMethods(customerId: String): Result<List<PaymentMethod>>
    suspend fun checkCartSecurityStatus(): Result<Boolean>
    suspend fun executeAutoPayment(
        sessionId: String,
        customerId: String,
        paymentMethodId: String
    ): Result<AutoPaymentReceipt>
}
