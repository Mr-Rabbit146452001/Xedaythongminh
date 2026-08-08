package com.example.xedaythongminh

import android.app.Application
import com.example.xedaythongminh.di.AppContainer
import com.example.xedaythongminh.di.DefaultAppContainer

class StrollerApplication : Application() {
    lateinit var container: AppContainer
    override fun onCreate() {
        super.onCreate()
        com.example.xedaythongminh.data.remote.RetrofitClient.initialize(this)
        container = DefaultAppContainer()
    }
}
