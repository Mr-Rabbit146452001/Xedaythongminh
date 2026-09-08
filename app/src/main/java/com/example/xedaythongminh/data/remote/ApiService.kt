package com.example.xedaythongminh.data.remote

import com.example.xedaythongminh.data.remote.dto.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    @GET("api/products")
    suspend fun getProducts(): Response<ApiResponse>

    @GET("api/auth/session")
    suspend fun getAuthSession(): Response<SessionResponse>

    @GET("api/auth/status")
    suspend fun checkAuthStatus(@Query("sessionId") sessionId: String): Response<SessionStatusResponse>

    @GET("api/customer")
    suspend fun getCustomer(@Query("id") id: String): Response<CustomerResponse>

    @GET("api/cart/status")
    suspend fun getCartStatus(): Response<CartStatusResponse>

    @GET("api/health")
    suspend fun healthCheck(): Response<Map<String, String>>

    // ==========================================
    // CÁC API ĐỒNG BỘ GIỎ HÀNG POSTGRESQL & IOT
    // ==========================================
    @GET("api/cart/items")
    suspend fun getCartItems(@Query("sessionId") sessionId: String? = "SESSION_DEFAULT"): Response<RemoteCartResponse>

    @POST("api/cart/items")
    suspend fun addCartItem(@Body request: CartItemRequest): Response<Map<String, Any>>

    @HTTP(method = "DELETE", path = "api/cart/items", hasBody = true)
    suspend fun deleteCartItem(@Body request: CartItemDeleteRequest): Response<Map<String, Any>>

    @POST("api/cart/checkout")
    suspend fun checkoutCart(@Body request: CheckoutRequest): Response<Map<String, Any>>

    // ==========================================
    // CÁC API THANH TOÁN TỰ ĐỘNG (AUTO-PAYMENT)
    // ==========================================
    @GET("api/payment/methods")
    suspend fun getPaymentMethods(@Query("customerId") customerId: String): Response<PaymentMethodsResponseDto>

    // ==========================================
    // CÁC API THANH TOÁN MÃ QR (QR PAYMENT)
    // ==========================================
    @POST("api/payment/create-qr-session")
    suspend fun createQrPaymentSession(@Body request: Map<String, String>): Response<QrPaymentSessionResponseDto>

    @GET("api/payment/qr-status/{orderId}")
    suspend fun checkQrPaymentStatus(@Path("orderId") orderId: String): Response<QrPaymentStatusResponseDto>

    @POST("api/payment/auto-checkout")
    suspend fun autoCheckout(@Body request: AutoPaymentRequestDto): Response<AutoPaymentResponseDto>

    // ==========================================
    // CÁC API THEO TÀI LIỆU BÀN GIAO FASTAPI & POSTGRESQL (CỔNG 8001 & 8000)
    // ==========================================
    @GET(".")
    suspend fun rootCheck(): Response<Map<String, Any>>

    @POST("product")
    suspend fun getProductByQr(@Body request: QrProductRequest): Response<QrProductResponseDto>

    @GET("health")
    suspend fun healthCheckV1(): Response<Map<String, Any>>

    @GET("api/v1/products")
    suspend fun getProductsV1(): Response<List<HandoverProductDto>>

    @POST("api/v1/sessions")
    suspend fun createSessionV1(@Body body: Map<String, String> = emptyMap()): Response<SessionResponseDto>

    @POST("api/v1/sessions/{sessionId}/complete")
    suspend fun completeSessionV1(
        @Path("sessionId") sessionId: String,
        @Body body: Map<String, String> = emptyMap()
    ): Response<SessionResponseDto>

    @GET("api/v1/cart/{sessionId}")
    suspend fun getCartV1(@Path("sessionId") sessionId: String): Response<HandoverCartResponseDto>

    @POST("api/v1/cart/decisions")
    suspend fun sendCartDecisionV1(@Body request: CartDecisionRequestDto): Response<Map<String, Any>>
}
