package com.example.xedaythongminh.domain.usecase

import com.example.xedaythongminh.domain.model.PaymentMethod
import com.example.xedaythongminh.domain.repository.PaymentRepository

class GetLinkedPaymentMethodsUseCase(
    private val paymentRepository: PaymentRepository
) {
    suspend operator fun invoke(customerId: String): Result<List<PaymentMethod>> {
        return paymentRepository.getLinkedPaymentMethods(customerId)
    }
}
