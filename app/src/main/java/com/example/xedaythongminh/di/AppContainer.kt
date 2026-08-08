package com.example.xedaythongminh.di

import com.example.xedaythongminh.data.repository.CartRepository
import com.example.xedaythongminh.data.repository.CartRepositoryImpl
import com.example.xedaythongminh.data.repository.ProductRepository
import com.example.xedaythongminh.data.repository.ProductRepositoryImpl
import com.example.xedaythongminh.data.remote.RetrofitClient

interface AppContainer {
    val cartRepository: CartRepository
    val productRepository: ProductRepository
}

class DefaultAppContainer : AppContainer {
    override val cartRepository: CartRepository by lazy {
        CartRepositoryImpl()
    }

    override val productRepository: ProductRepository by lazy {
        ProductRepositoryImpl()
    }
}
