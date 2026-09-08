package com.example.xedaythongminh.data.repository

import com.example.xedaythongminh.data.remote.ApiService
import com.example.xedaythongminh.data.remote.RetrofitClient
import com.example.xedaythongminh.data.remote.dto.AutoPaymentRequestDto
import com.example.xedaythongminh.data.remote.dto.toDomainModel
import com.example.xedaythongminh.domain.model.AutoPaymentException
import com.example.xedaythongminh.domain.model.AutoPaymentReceipt
import com.example.xedaythongminh.domain.model.PaymentMethod
import com.example.xedaythongminh.domain.model.PaymentMethodType
import com.example.xedaythongminh.domain.repository.PaymentRepository
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject

class PaymentRepositoryImpl(
    private val apiService: ApiService = RetrofitClient.apiService,
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO
) : PaymentRepository {

    override suspend fun getLinkedPaymentMethods(customerId: String): Result<List<PaymentMethod>> =
        withContext(ioDispatcher) {
            try {
                val response = apiService.getPaymentMethods(customerId)
                if (response.isSuccessful && response.body()?.status == "Thành công") {
                    val dtoList = response.body()?.data ?: emptyList()
                    val domainList = dtoList.map { it.toDomainModel() }
                    Result.success(domainList)
                } else {
                    // Cung cấp danh sách dự phòng nếu chưa có kết nối API
                    Result.success(getDefaultPaymentMethods())
                }
            } catch (e: Exception) {
                // Fallback nếu ngoại lệ mạng
                Result.success(getDefaultPaymentMethods())
            }
        }

    override suspend fun checkCartSecurityStatus(): Result<Boolean> =
        withContext(ioDispatcher) {
            try {
                val response = apiService.getCartStatus()
                if (response.isSuccessful) {
                    val hasUnscanned = response.body()?.data?.hasUnscannedProduct ?: false
                    Result.success(hasUnscanned)
                } else {
                    Result.failure(AutoPaymentException.GatewayException("Lỗi kiểm tra cảm biến an toàn: mã lỗi ${response.code()}"))
                }
            } catch (e: Exception) {
                Result.failure(AutoPaymentException.GatewayException("Không thể kết nối máy chủ để kiểm tra cảm biến: ${e.message}"))
            }
        }

    override suspend fun executeAutoPayment(
        sessionId: String,
        customerId: String,
        paymentMethodId: String
    ): Result<AutoPaymentReceipt> = withContext(ioDispatcher) {
        try {
            val request = AutoPaymentRequestDto(
                sessionId = sessionId,
                customerId = customerId,
                paymentMethodId = paymentMethodId
            )
            val response = apiService.autoCheckout(request)
            if (response.isSuccessful) {
                val receiptDto = response.body()?.data
                if (receiptDto != null) {
                    Result.success(receiptDto.toDomainModel())
                } else {
                    Result.failure(AutoPaymentException.GatewayException("Dữ liệu phản hồi thanh toán không hợp lệ"))
                }
            } else {
                val errorBodyStr = response.errorBody()?.string()
                var errorMsg = "Giao dịch thanh toán tự động không thành công"
                if (!errorBodyStr.isNullOrBlank()) {
                    try {
                        val json = JSONObject(errorBodyStr!!)
                        if (json.has("message")) {
                            errorMsg = json.getString("message")
                        }
                    } catch (e: Exception) {
                        // Bỏ qua lỗi phân tích cú pháp JSON
                    }
                }

                if (errorMsg.contains("trọng lượng", ignoreCase = true) ||
                    errorMsg.contains("chưa được quét", ignoreCase = true)
                ) {
                    Result.failure(AutoPaymentException.WeightAnomalyException)
                } else if (errorMsg.contains("trống", ignoreCase = true)) {
                    Result.failure(AutoPaymentException.CartEmptyException)
                } else {
                    Result.failure(AutoPaymentException.GatewayException(errorMsg))
                }
            }
        } catch (e: Exception) {
            Result.failure(AutoPaymentException.GatewayException("Lỗi kết nối khi thanh toán: ${e.message}"))
        }
    }

    private fun getDefaultPaymentMethods(): List<PaymentMethod> {
        return listOf(
            PaymentMethod(
                id = "PM_WALLET_01",
                name = "Ví điện tử SmartPay",
                type = PaymentMethodType.E_WALLET,
                maskedNumber = "0987***321",
                balance = 5_000_000,
                isDefault = true
            ),
            PaymentMethod(
                id = "PM_CARD_02",
                name = "Thẻ Visa Platinum (Liên kết)",
                type = PaymentMethodType.CREDIT_DEBIT_CARD,
                maskedNumber = "•••• •••• •••• 8899",
                balance = 25_000_000,
                isDefault = false
            ),
            PaymentMethod(
                id = "PM_MEMBER_03",
                name = "Ví Hội Viên Trả Sau",
                type = PaymentMethodType.MEMBER_ACCOUNT,
                maskedNumber = "SMART-MEMBER-888",
                balance = 2_000_000,
                isDefault = false
            )
        )
    }
}
