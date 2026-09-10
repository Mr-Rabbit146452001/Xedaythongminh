package com.example.mockbank.data

import android.content.Context
import com.google.gson.annotations.SerializedName
import okhttp3.OkHttpClient
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*
import java.util.concurrent.TimeUnit

data class AccountResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("data") val data: AccountData?
)

data class AccountData(
    @SerializedName("accountNumber") val accountNumber: String,
    @SerializedName("ownerName") val ownerName: String,
    @SerializedName("userRefId") val userRefId: String,
    @SerializedName("tokenBalance") val tokenBalance: Double,
    @SerializedName("isActive") val isActive: Boolean
)

data class FaucetRequest(
    @SerializedName("accountNumber") val accountNumber: String,
    @SerializedName("amount") val amount: Double = 1000.0
)

data class FaucetResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String?,
    @SerializedName("tokenBalance") val tokenBalance: Double?
)

data class PayQrRequest(
    @SerializedName("fromAccount") val fromAccount: String,
    @SerializedName("toAccount") val toAccount: String,
    @SerializedName("amount") val amount: Double,
    @SerializedName("orderId") val orderId: String,
    @SerializedName("pin") val pin: String = "123456"
)

data class PayQrResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String?,
    @SerializedName("data") val data: PayQrData?,
    @SerializedName("error") val error: String?
)

data class PayQrData(
    @SerializedName("transactionId") val transactionId: String,
    @SerializedName("orderId") val orderId: String,
    @SerializedName("amountPaid") val amountPaid: Double,
    @SerializedName("remainingBalance") val remainingBalance: Double
)

data class QrPayload(
    @SerializedName("orderId") val orderId: String,
    @SerializedName("amount") val amount: Double,
    @SerializedName("toAccount") val toAccount: String,
    @SerializedName("storeName") val storeName: String?
)

interface BankApi {
    @GET("api/bank/accounts/{accountNumber}")
    suspend fun getAccount(@Path("accountNumber") accountNumber: String): Response<AccountResponse>

    @POST("api/bank/faucet")
    suspend fun faucet(@Body req: FaucetRequest): Response<FaucetResponse>

    @POST("api/bank/pay-qr")
    suspend fun payQr(@Body req: PayQrRequest): Response<PayQrResponse>
}

object BankApiClient {
    // Địa chỉ ngrok HTTPS công khai mặc định (Máy bạn Vinh)
    const val DEFAULT_BASE_URL = "https://reflex-swipe-placidly.ngrok-free.dev/"
    private const val PREFS_NAME = "mock_bank_prefs"
    private const val KEY_BASE_URL = "base_url"

    var baseUrl: String = DEFAULT_BASE_URL
        private set

    private var cachedService: BankApi? = null

    fun init(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val savedUrl = prefs.getString(KEY_BASE_URL, DEFAULT_BASE_URL) ?: DEFAULT_BASE_URL
        updateBaseUrl(context, savedUrl)
    }

    fun updateBaseUrl(context: Context, newUrl: String) {
        var formatted = newUrl.trim()
        if (!formatted.endsWith("/")) {
            formatted += "/"
        }
        baseUrl = formatted
        cachedService = null

        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putString(KEY_BASE_URL, formatted).apply()
    }

    fun getService(): BankApi {
        return cachedService ?: synchronized(this) {
            val okHttpClient = OkHttpClient.Builder()
                .connectTimeout(15, TimeUnit.SECONDS)
                .readTimeout(15, TimeUnit.SECONDS)
                .addInterceptor { chain ->
                    val request = chain.request().newBuilder()
                        .header("ngrok-skip-browser-warning", "true")
                        .header("User-Agent", "MockBankApp/1.0")
                        .build()
                    chain.proceed(request)
                }
                .build()

            Retrofit.Builder()
                .baseUrl(baseUrl)
                .client(okHttpClient)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
                .create(BankApi::class.java).also {
                    cachedService = it
                }
        }
    }
}
