package com.example.xedaythongminh

import com.example.xedaythongminh.data.models.CartItem
import com.example.xedaythongminh.data.models.Product
import com.example.xedaythongminh.data.repository.CartRepository
import com.example.xedaythongminh.domain.model.*
import com.example.xedaythongminh.domain.repository.PaymentRepository
import com.example.xedaythongminh.domain.usecase.GetLinkedPaymentMethodsUseCase
import com.example.xedaythongminh.domain.usecase.ProcessAutoPaymentUseCase
import com.example.xedaythongminh.domain.usecase.ValidateCartForAutoPaymentUseCase
import com.example.xedaythongminh.ui.autopayment.AutoPaymentUiEvent
import com.example.xedaythongminh.ui.autopayment.AutoPaymentViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class AutoPaymentViewModelTest {

    private val testDispatcher = StandardTestDispatcher()

    private class FakeCartRepository : CartRepository {
        val cartFlow = MutableStateFlow<List<CartItem>>(emptyList())
        override fun getCartItems(): Flow<List<CartItem>> = cartFlow.asStateFlow()
        override fun addCartItem(item: CartItem) {
            cartFlow.value = cartFlow.value + item
        }
        override fun removeCartItem(item: CartItem) {
            cartFlow.value = cartFlow.value - item
        }
        override fun updateQuantity(item: CartItem, newQuantity: Int) {}
        override fun clearCart() {
            cartFlow.value = emptyList()
        }
    }

    private class FakePaymentRepository : PaymentRepository {
        val sampleMethods = listOf(
            PaymentMethod(
                id = "PM_WALLET_01",
                name = "Ví SmartPay",
                type = PaymentMethodType.E_WALLET,
                maskedNumber = "0987***321",
                balance = 5000000,
                isDefault = true
            ),
            PaymentMethod(
                id = "PM_CARD_02",
                name = "Thẻ Visa",
                type = PaymentMethodType.CREDIT_DEBIT_CARD,
                maskedNumber = "•••• 8899",
                balance = 10000000,
                isDefault = false
            )
        )

        override suspend fun getLinkedPaymentMethods(customerId: String): Result<List<PaymentMethod>> =
            Result.success(sampleMethods)

        override suspend fun checkCartSecurityStatus(): Result<Boolean> =
            Result.success(false)

        override suspend fun executeAutoPayment(
            sessionId: String,
            customerId: String,
            paymentMethodId: String
        ): Result<AutoPaymentReceipt> = Result.success(
            AutoPaymentReceipt(
                transactionId = "TXN_TEST_999",
                timestamp = 1700000000L,
                subtotal = 50000,
                discountAmount = 5000,
                finalAmount = 45000,
                pointsEarned = 45,
                paymentMethodName = "Ví SmartPay",
                customerId = customerId
            )
        )
    }

    private lateinit var cartRepo: FakeCartRepository
    private lateinit var paymentRepo: FakePaymentRepository
    private lateinit var viewModel: AutoPaymentViewModel

    @Before
    fun setUp() {
        Dispatchers.setMain(testDispatcher)
        cartRepo = FakeCartRepository()
        paymentRepo = FakePaymentRepository()

        val validateCartUseCase = ValidateCartForAutoPaymentUseCase(paymentRepo)
        val getMethodsUseCase = GetLinkedPaymentMethodsUseCase(paymentRepo)
        val processUseCase = ProcessAutoPaymentUseCase(paymentRepo, validateCartUseCase)

        viewModel = AutoPaymentViewModel(
            cartRepository = cartRepo,
            getLinkedPaymentMethodsUseCase = getMethodsUseCase,
            processAutoPaymentUseCase = processUseCase,
            ioDispatcher = testDispatcher
        )
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `initial state loads payment methods and selects default`() = runTest(testDispatcher) {
        testScheduler.advanceUntilIdle()

        val state = viewModel.uiState.value
        assertEquals(2, state.availableMethods.size)
        assertEquals("PM_WALLET_01", state.selectedMethod?.id)
        assertTrue(state.selectedMethod?.isDefault == true)
    }

    @Test
    fun `when select payment method, uiState updates selectedMethod`() = runTest(testDispatcher) {
        testScheduler.advanceUntilIdle()

        val newMethod = paymentRepo.sampleMethods[1]
        viewModel.onEvent(AutoPaymentUiEvent.SelectMethod(newMethod))

        assertEquals("PM_CARD_02", viewModel.uiState.value.selectedMethod?.id)
    }

    @Test
    fun `when start payment with empty cart, state becomes FAILED`() = runTest(testDispatcher) {
        testScheduler.advanceUntilIdle()

        viewModel.onEvent(AutoPaymentUiEvent.StartAutoPayment("CUST_1", "SESS_1"))
        testScheduler.advanceUntilIdle()

        val state = viewModel.uiState.value
        assertEquals(AutoPaymentStatus.FAILED, state.status)
        assertEquals(AutoPaymentException.CartEmptyException.message, state.errorMessage)
    }

    @Test
    fun `when payment succeeds, cart is cleared and state is SUCCESS`() = runTest(testDispatcher) {
        // Thêm sản phẩm vào giỏ
        cartRepo.addCartItem(
            CartItem(
                product = Product(id = "1", name = "Táo Envy", sku = "893456", unitPrice = 50000),
                quantity = 1
            )
        )
        testScheduler.advanceUntilIdle()

        viewModel.onEvent(AutoPaymentUiEvent.StartAutoPayment("CUST_1", "SESS_1"))
        testScheduler.advanceUntilIdle()

        val state = viewModel.uiState.value
        assertEquals(AutoPaymentStatus.SUCCESS, state.status)
        assertNotNull(state.receipt)
        assertEquals("TXN_TEST_999", state.receipt?.transactionId)
        assertTrue(cartRepo.cartFlow.value.isEmpty())
    }
}
