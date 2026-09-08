package com.example.xedaythongminh.data.remote

import android.content.Context
import android.content.SharedPreferences
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {
    // URL Ngrok chính thức kết nối máy chủ từ xa cách 20km
    private const val DEFAULT_REMOTE_URL = "https://reflex-swipe-placidly.ngrok-free.dev/"
    private var currentBaseUrl = DEFAULT_REMOTE_URL
    private var _apiService: ApiService? = null
    private var sharedPrefs: SharedPreferences? = null

    fun initialize(context: Context) {
        sharedPrefs = context.getSharedPreferences("smartcart_prefs", Context.MODE_PRIVATE)
        val savedUrl = sharedPrefs?.getString("server_base_url", null)
        val targetUrl = if (!savedUrl.isNullOrBlank()) savedUrl else DEFAULT_REMOTE_URL
        setBaseUrl(targetUrl)
    }

    private fun isEmulator(): Boolean {
        return (android.os.Build.FINGERPRINT.startsWith("generic")
                || android.os.Build.FINGERPRINT.startsWith("unknown")
                || android.os.Build.MODEL.contains("google_sdk")
                || android.os.Build.MODEL.contains("Emulator")
                || android.os.Build.MODEL.contains("Android SDK built for x86")
                || android.os.Build.MANUFACTURER.contains("Genymotion")
                || "google_sdk" == android.os.Build.PRODUCT)
    }

    val apiService: ApiService
        get() {
            if (_apiService == null) {
                _apiService = buildRetrofit(currentBaseUrl).create(ApiService::class.java)
            }
            return _apiService!!
        }

    fun updateBaseUrl(newUrl: String) {
        val formattedUrl = setBaseUrl(newUrl)
        sharedPrefs?.edit()?.putString("server_base_url", formattedUrl)?.apply()
    }

    fun getBaseUrl(): String = currentBaseUrl

    private fun setBaseUrl(newUrl: String): String {
        var url = newUrl.trim()
        if (url.isBlank()) {
            url = DEFAULT_REMOTE_URL
        }
        
        // Thêm protocol nếu thiếu
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "https://$url"
        }
        
        // Đảm bảo có dấu gạch chéo cuối
        if (!url.endsWith("/")) {
            url = "$url/"
        }
        
        if (currentBaseUrl != url) {
            currentBaseUrl = url
            _apiService = buildRetrofit(currentBaseUrl).create(ApiService::class.java)
        }
        return currentBaseUrl
    }

    private fun buildRetrofit(baseUrl: String): Retrofit {
        val okHttpClient = OkHttpClient.Builder()
            .addInterceptor { chain ->
                val newRequest = chain.request().newBuilder()
                    .addHeader("ngrok-skip-browser-warning", "true")
                    .addHeader("User-Agent", "SmartCartApp")
                    .build()
                chain.proceed(newRequest)
            }
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(15, TimeUnit.SECONDS)
            .build()

        return Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
}
