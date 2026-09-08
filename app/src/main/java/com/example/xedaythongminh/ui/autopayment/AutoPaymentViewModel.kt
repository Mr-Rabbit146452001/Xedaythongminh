package com.example.xedaythongminh.ui.autopayment

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.xedaythongminh.data.repository.CartRepository
import com.example.xedaythongminh.domain.model.AutoPaymentException
import com.example.xedaythongminh.domain.model.AutoPaymentStatus
import com.example.xedaythongminh.domain.usecase.GetLinkedPaymentMethodsUseCase
import com.example.xedaythongminh.domain.usecase.ProcessAutoPaymentUseCase
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class AutoPaymentViewModel(
    private val cartRepository: CartRepository,
    private val getLinkedPaymentMethodsUseCase: GetLinkedPaymentMethodsUseCase,
    private val processAutoPaymentUseCase: ProcessAutoPaymentUseCase,
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO
) : ViewModel() {

    private val _uiState = MutableStateFlow(AutoPaymentUiState())
    val uiState: StateFlow<AutoPaymentUiState> = _uiState.asStateFlow()

    private var lastCustomerId: String = "CUSTOMER_888"
    private var lastSessionId: String = "SESSION_DEFAULT"

    init {
        // Đồng bộ danh sách mặt hàng trong giỏ hàng
        viewModelScope.launch {
            cartRepository.getCartItems().collect { items ->
                _uiState.value = _uiState.value.copy(cartItems = items)
            }
        }
        loadPaymentMethods(lastCustomerId)
    }

    fun loadPaymentMethods(customerId: String) {
        lastCustomerId = customerId
        viewModelScope.launch(ioDispatcher) {
            _uiState.value = _uiState.value.copy(isLoadingMethods = true)
            val result = getLinkedPaymentMethodsUseCase(customerId)
            if (result.isSuccess) {
                val methods = result.getOrDefault(emptyList())
                val defaultMethod = methods.firstOrNull { it.isDefault } ?: methods.firstOrNull()
                _uiState.value = _uiState.value.copy(
                    availableMethods = methods,
                    selectedMethod = defaultMethod,
                    isLoadingMethods = false
                )
            } else {
                _uiState.value = _uiState.value.copy(
                    isLoadingMethods = false,
                    errorMessage = "Không thể tải phương thức thanh toán: ${result.exceptionOrNull()?.message}"
                )
            }
        }
    }

    fun onEvent(event: AutoPaymentUiEvent) {
        when (event) {
            is AutoPaymentUiEvent.SelectMethod -> {
                _uiState.value = _uiState.value.copy(selectedMethod = event.method)
            }
            is AutoPaymentUiEvent.StartAutoPayment -> {
                lastCustomerId = event.customerId
                lastSessionId = event.sessionId
                startPaymentExecution(event.customerId, event.sessionId)
            }
            is AutoPaymentUiEvent.Retry -> {
                startPaymentExecution(lastCustomerId, lastSessionId)
            }
            is AutoPaymentUiEvent.DismissError -> {
                _uiState.value = _uiState.value.copy(errorMessage = null)
            }
        }
    }

    private fun startPaymentExecution(customerId: String, sessionId: String) {
        val currentItems = _uiState.value.cartItems
        if (currentItems.isEmpty()) {
            _uiState.value = _uiState.value.copy(
                status = AutoPaymentStatus.FAILED,
                errorMessage = AutoPaymentException.CartEmptyException.message
            )
            return
        }

        val selectedMethod = _uiState.value.selectedMethod
        if (selectedMethod == null) {
            _uiState.value = _uiState.value.copy(
                status = AutoPaymentStatus.FAILED,
                errorMessage = "Chưa chọn phương thức thanh toán tự động"
            )
            return
        }

        viewModelScope.launch(ioDispatcher) {
            // Bước 1: Kiểm tra an toàn giỏ hàng
            _uiState.value = _uiState.value.copy(
                status = AutoPaymentStatus.VERIFYING_CART,
                currentStepIndex = 1,
                statusMessage = "Đang kiểm tra an toàn giỏ hàng & cảm biến trọng lượng...",
                errorMessage = null
            )
            delay(500) // Cho người dùng thấy bước kiểm tra trực quan

            // Bước 2: Ủy quyền và xác thực nguồn tiền
            _uiState.value = _uiState.value.copy(
                status = AutoPaymentStatus.AUTHORIZING,
                currentStepIndex = 2,
                statusMessage = "Đang kết nối tài khoản ${selectedMethod.name}..."
            )
            delay(500)

            // Bước 3: Khấu trừ tự động qua backend
            _uiState.value = _uiState.value.copy(
                status = AutoPaymentStatus.CHARGING,
                currentStepIndex = 3,
                statusMessage = "Đang thực hiện giao dịch khấu trừ..."
            )

            val result = processAutoPaymentUseCase(
                sessionId = sessionId,
                customerId = customerId,
                paymentMethodId = selectedMethod.id,
                cartItemsCount = currentItems.size
            )

            if (result.isSuccess) {
                val receipt = result.getOrNull()
                // Xóa giỏ hàng sau khi thành công
                cartRepository.clearCart()
                _uiState.value = _uiState.value.copy(
                    status = AutoPaymentStatus.SUCCESS,
                    currentStepIndex = 4,
                    statusMessage = "Giao dịch thành công! Đã tích điểm thưởng.",
                    receipt = receipt
                )
            } else {
                val error = result.exceptionOrNull()
                _uiState.value = _uiState.value.copy(
                    status = AutoPaymentStatus.FAILED,
                    errorMessage = error?.message ?: "Giao dịch thất bại",
                    statusMessage = "Thanh toán tự động chưa hoàn tất"
                )
            }
        }
    }
}
