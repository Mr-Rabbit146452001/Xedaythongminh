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
}
