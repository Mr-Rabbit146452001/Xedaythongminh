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
    @SerializedName("userRefId") val userRefId: String? = null,
    @SerializedName("phoneNumber") val phoneNumber: String? = null,
    @SerializedName("idCardNumber") val idCardNumber: String? = null,
    @SerializedName("tokenBalance") val tokenBalance: Double,
    @SerializedName("vndBalance") val vndBalance: Double? = null,
    @SerializedName("isActive") val isActive: Boolean = true
)

data class RegisterRequest(
    @SerializedName("fullName") val fullName: String,
    @SerializedName("idCardNumber") val idCardNumber: String,
    @SerializedName("phoneNumber") val phoneNumber: String,
    @SerializedName("pin") val pin: String
)

data class LoginRequest(
    @SerializedName("phoneNumber") val phoneNumber: String,
    @SerializedName("pin") val pin: String
)

data class AuthResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String?,
    @SerializedName("data") val data: AccountData?
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
    @SerializedName("pin") val pin: String = "652001"
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

    @POST("api/bank/auth/register")
    suspend fun register(@Body req: RegisterRequest): Response<AuthResponse>

    @POST("api/bank/auth/login")
    suspend fun login(@Body req: LoginRequest): Response<AuthResponse>

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
    private const val KEY_AUTH_ACCOUNT = "auth_account_number"
    private const val KEY_AUTH_NAME = "auth_owner_name"
    private const val KEY_AUTH_PHONE = "auth_phone_number"
    private const val KEY_AUTH_PIN = "auth_pin"

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

    fun saveAuthSession(context: Context, account: AccountData, pin: String) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit()
            .putString(KEY_AUTH_ACCOUNT, account.accountNumber)
            .putString(KEY_AUTH_NAME, account.ownerName)
            .putString(KEY_AUTH_PHONE, account.phoneNumber ?: "")
            .putString(KEY_AUTH_PIN, pin)
            .apply()
    }

    fun getSavedAccount(context: Context): String? {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getString(KEY_AUTH_ACCOUNT, null)
    }

    fun getSavedOwnerName(context: Context): String? {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getString(KEY_AUTH_NAME, null)
    }

    fun getSavedPhone(context: Context): String? {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getString(KEY_AUTH_PHONE, null)
    }

    fun getSavedPin(context: Context): String {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getString(KEY_AUTH_PIN, "652001") ?: "652001"
    }

    fun clearAuthSession(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit()
            .remove(KEY_AUTH_ACCOUNT)
            .remove(KEY_AUTH_NAME)
            .remove(KEY_AUTH_PHONE)
            .remove(KEY_AUTH_PIN)
            .apply()
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
