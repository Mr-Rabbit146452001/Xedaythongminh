package com.example.xedaythongminh.domain.usecase

import com.example.xedaythongminh.domain.model.AutoPaymentReceipt
import com.example.xedaythongminh.domain.repository.PaymentRepository

class ProcessAutoPaymentUseCase(
    private val paymentRepository: PaymentRepository,
    private val validateCartUseCase: ValidateCartForAutoPaymentUseCase
) {
    suspend operator fun invoke(
        sessionId: String,
        customerId: String,
        paymentMethodId: String,
        cartItemsCount: Int
    ): Result<AutoPaymentReceipt> {
        val validation = validateCartUseCase(cartItemsCount)
        if (validation.isFailure) {
            return Result.failure(validation.exceptionOrNull()!!)
        }

        return paymentRepository.executeAutoPayment(
            sessionId = sessionId,
            customerId = customerId,
            paymentMethodId = paymentMethodId
        )
    }
}
