package com.example.xedaythongminh

import com.example.xedaythongminh.domain.model.AutoPaymentException
import com.example.xedaythongminh.domain.model.AutoPaymentReceipt
import com.example.xedaythongminh.domain.model.PaymentMethod
import com.example.xedaythongminh.domain.repository.PaymentRepository
import com.example.xedaythongminh.domain.usecase.ProcessAutoPaymentUseCase
import com.example.xedaythongminh.domain.usecase.ValidateCartForAutoPaymentUseCase
import kotlinx.coroutines.test.runTest
import org.junit.Assert.*
import org.junit.Test

class ProcessAutoPaymentUseCaseTest {

    private class FakePaymentRepository(
        var hasWeightAnomaly: Boolean = false,
        var isPaymentSuccessful: Boolean = true
    ) : PaymentRepository {
        override suspend fun getLinkedPaymentMethods(customerId: String): Result<List<PaymentMethod>> =
            Result.success(emptyList())

        override suspend fun checkCartSecurityStatus(): Result<Boolean> =
            Result.success(hasWeightAnomaly)

        override suspend fun executeAutoPayment(
            sessionId: String,
            customerId: String,
            paymentMethodId: String
        ): Result<AutoPaymentReceipt> {
            return if (isPaymentSuccessful) {
                Result.success(
                    AutoPaymentReceipt(
                        transactionId = "TXN_TEST_123",
                        timestamp = 1700000000L,
                        subtotal = 100000,
                        discountAmount = 10000,
                        finalAmount = 98000,
                        pointsEarned = 98,
                        paymentMethodName = "Ví SmartPay",
                        customerId = customerId
                    )
                )
            } else {
                Result.failure(AutoPaymentException.InsufficientBalanceException)
            }
        }
    }

    @Test
    fun `when cart has weight anomaly, process fails without executing payment`() = runTest {
        val fakeRepo = FakePaymentRepository(hasWeightAnomaly = true, isPaymentSuccessful = true)
        val validateUseCase = ValidateCartForAutoPaymentUseCase(fakeRepo)
        val processUseCase = ProcessAutoPaymentUseCase(fakeRepo, validateUseCase)

        val result = processUseCase(
            sessionId = "SESS_1",
            customerId = "CUST_1",
            paymentMethodId = "PM_WALLET_01",
            cartItemsCount = 2
        )

        assertTrue(result.isFailure)
        assertTrue(result.exceptionOrNull() is AutoPaymentException.WeightAnomalyException)
    }

    @Test
    fun `when everything is valid, process succeeds and returns receipt with points`() = runTest {
        val fakeRepo = FakePaymentRepository(hasWeightAnomaly = false, isPaymentSuccessful = true)
        val validateUseCase = ValidateCartForAutoPaymentUseCase(fakeRepo)
        val processUseCase = ProcessAutoPaymentUseCase(fakeRepo, validateUseCase)

        val result = processUseCase(
            sessionId = "SESS_1",
            customerId = "CUST_1",
            paymentMethodId = "PM_WALLET_01",
            cartItemsCount = 3
        )

        assertTrue(result.isSuccess)
        val receipt = result.getOrNull()
        assertNotNull(receipt)
        assertEquals("TXN_TEST_123", receipt?.transactionId)
        assertEquals(98000L, receipt?.finalAmount)
        assertEquals(98, receipt?.pointsEarned)
    }

    @Test
    fun `when account has insufficient funds, returns failure`() = runTest {
        val fakeRepo = FakePaymentRepository(hasWeightAnomaly = false, isPaymentSuccessful = false)
        val validateUseCase = ValidateCartForAutoPaymentUseCase(fakeRepo)
        val processUseCase = ProcessAutoPaymentUseCase(fakeRepo, validateUseCase)

        val result = processUseCase(
            sessionId = "SESS_1",
            customerId = "CUST_1",
            paymentMethodId = "PM_WALLET_01",
            cartItemsCount = 1
        )

        assertTrue(result.isFailure)
        assertTrue(result.exceptionOrNull() is AutoPaymentException.InsufficientBalanceException)
    }
}
