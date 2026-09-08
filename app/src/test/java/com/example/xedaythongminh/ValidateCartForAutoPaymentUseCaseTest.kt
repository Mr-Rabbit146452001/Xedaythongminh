package com.example.xedaythongminh

import com.example.xedaythongminh.domain.model.AutoPaymentException
import com.example.xedaythongminh.domain.model.AutoPaymentReceipt
import com.example.xedaythongminh.domain.model.PaymentMethod
import com.example.xedaythongminh.domain.repository.PaymentRepository
import com.example.xedaythongminh.domain.usecase.ValidateCartForAutoPaymentUseCase
import kotlinx.coroutines.test.runTest
import org.junit.Assert.*
import org.junit.Test

class ValidateCartForAutoPaymentUseCaseTest {

    private class FakePaymentRepository(
        var hasUnscannedProduct: Boolean = false,
        var shouldThrowError: Boolean = false
    ) : PaymentRepository {
        override suspend fun getLinkedPaymentMethods(customerId: String): Result<List<PaymentMethod>> =
            Result.success(emptyList())

        override suspend fun checkCartSecurityStatus(): Result<Boolean> {
            if (shouldThrowError) {
                return Result.failure(AutoPaymentException.GatewayException("Lỗi kết nối"))
            }
            return Result.success(hasUnscannedProduct)
        }

        override suspend fun executeAutoPayment(
            sessionId: String,
            customerId: String,
            paymentMethodId: String
        ): Result<AutoPaymentReceipt> = Result.failure(NotImplementedError())
    }

    @Test
    fun `when cart is empty, returns CartEmptyException`() = runTest {
        val fakeRepo = FakePaymentRepository(hasUnscannedProduct = false)
        val useCase = ValidateCartForAutoPaymentUseCase(fakeRepo)

        val result = useCase(cartItemsCount = 0)

        assertTrue(result.isFailure)
        assertTrue(result.exceptionOrNull() is AutoPaymentException.CartEmptyException)
    }

    @Test
    fun `when sensor detects unscanned item, returns WeightAnomalyException`() = runTest {
        val fakeRepo = FakePaymentRepository(hasUnscannedProduct = true)
        val useCase = ValidateCartForAutoPaymentUseCase(fakeRepo)

        val result = useCase(cartItemsCount = 3)

        assertTrue(result.isFailure)
        assertTrue(result.exceptionOrNull() is AutoPaymentException.WeightAnomalyException)
    }

    @Test
    fun `when cart has items and sensor is safe, returns success`() = runTest {
        val fakeRepo = FakePaymentRepository(hasUnscannedProduct = false)
        val useCase = ValidateCartForAutoPaymentUseCase(fakeRepo)

        val result = useCase(cartItemsCount = 2)

        assertTrue(result.isSuccess)
    }
}
