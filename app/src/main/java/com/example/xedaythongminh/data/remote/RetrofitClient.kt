package com.example.xedaythongminh.data.remote

import android.content.Context
import android.content.SharedPreferences
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {
    private var currentBaseUrl = "https://recede-scalded-turret.ngrok-free.dev/"
    private var _apiService: ApiService? = null
    private var sharedPrefs: SharedPreferences? = null

    fun initialize(context: Context) {
        sharedPrefs = context.getSharedPreferences("smartcart_prefs", Context.MODE_PRIVATE)
        // Cập nhật URL Ngrok công khai (Kết nối xuyên suốt mọi mạng Wi-Fi và 4G)
        val targetUrl = "https://recede-scalded-turret.ngrok-free.dev/"
        updateBaseUrl(targetUrl)
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
            url = "http://10.0.2.2:3000/"
        }
        
        // Add protocol if missing
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "http://$url"
        }
        
        // Ensure trailing slash
        if (!url.endsWith("/")) {
            url = "$url/"
        }
        
        if (currentBaseUrl != url) {
            currentBaseUrl = url
            // Re-create the Retrofit service with the new base URL
            _apiService = buildRetrofit(currentBaseUrl).create(ApiService::class.java)
        }
        return currentBaseUrl
    }

    private fun buildRetrofit(baseUrl: String): Retrofit {
        return Retrofit.Builder()
            .baseUrl(baseUrl)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
}
