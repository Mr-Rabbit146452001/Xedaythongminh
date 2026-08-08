package com.example.xedaythongminh.data.remote

import com.example.xedaythongminh.data.remote.dto.ApiResponse
import com.example.xedaythongminh.data.remote.dto.SessionResponse
import com.example.xedaythongminh.data.remote.dto.SessionStatusResponse
import com.example.xedaythongminh.data.remote.dto.CustomerResponse
import com.example.xedaythongminh.data.remote.dto.CartStatusResponse
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Query

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
}
