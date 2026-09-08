package com.example.xedaythongminh.domain.usecase

import com.example.xedaythongminh.domain.model.AutoPaymentException
import com.example.xedaythongminh.domain.repository.PaymentRepository

class ValidateCartForAutoPaymentUseCase(
    private val paymentRepository: PaymentRepository
) {
    suspend operator fun invoke(cartItemsCount: Int): Result<Unit> {
        if (cartItemsCount <= 0) {
            return Result.failure(AutoPaymentException.CartEmptyException)
        }

        val securityCheck = paymentRepository.checkCartSecurityStatus()
        if (securityCheck.isFailure) {
            return Result.failure(
                securityCheck.exceptionOrNull()
                    ?: AutoPaymentException.GatewayException("Không thể kiểm tra an toàn giỏ hàng")
            )
        }

        val hasUnscanned = securityCheck.getOrDefault(false)
        if (hasUnscanned) {
            return Result.failure(AutoPaymentException.WeightAnomalyException)
        }

        return Result.success(Unit)
    }
}
