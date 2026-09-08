package com.example.xedaythongminh.ui.autopayment

import androidx.compose.runtime.Immutable
import com.example.xedaythongminh.data.models.CartItem
import com.example.xedaythongminh.domain.model.AutoPaymentReceipt
import com.example.xedaythongminh.domain.model.AutoPaymentStatus
import com.example.xedaythongminh.domain.model.PaymentMethod

@Immutable
data class AutoPaymentUiState(
    val status: AutoPaymentStatus = AutoPaymentStatus.IDLE,
    val selectedMethod: PaymentMethod? = null,
    val availableMethods: List<PaymentMethod> = emptyList(),
    val cartItems: List<CartItem> = emptyList(),
    val receipt: AutoPaymentReceipt? = null,
    val errorMessage: String? = null,
    val isLoadingMethods: Boolean = false,
    val currentStepIndex: Int = 0, // 0: Chuẩn bị, 1: Kiểm tra an toàn, 2: Xác thực, 3: Khấu trừ, 4: Hoàn tất
    val statusMessage: String = "Sẵn sàng thanh toán tự động"
)

sealed interface AutoPaymentUiEvent {
    data class SelectMethod(val method: PaymentMethod) : AutoPaymentUiEvent
    data class StartAutoPayment(val customerId: String, val sessionId: String = "SESSION_DEFAULT") : AutoPaymentUiEvent
    object Retry : AutoPaymentUiEvent
    object DismissError : AutoPaymentUiEvent
}
