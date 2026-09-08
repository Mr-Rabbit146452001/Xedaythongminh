package com.example.xedaythongminh.di

import com.example.xedaythongminh.data.repository.CartRepository
import com.example.xedaythongminh.data.repository.CartRepositoryImpl
import com.example.xedaythongminh.data.repository.PaymentRepositoryImpl
import com.example.xedaythongminh.data.repository.ProductRepository
import com.example.xedaythongminh.data.repository.ProductRepositoryImpl
import com.example.xedaythongminh.domain.repository.PaymentRepository
import com.example.xedaythongminh.domain.usecase.GetLinkedPaymentMethodsUseCase
import com.example.xedaythongminh.domain.usecase.ProcessAutoPaymentUseCase
import com.example.xedaythongminh.domain.usecase.ValidateCartForAutoPaymentUseCase

interface AppContainer {
    val cartRepository: CartRepository
    val productRepository: ProductRepository
    val paymentRepository: PaymentRepository
    val validateCartForAutoPaymentUseCase: ValidateCartForAutoPaymentUseCase
    val getLinkedPaymentMethodsUseCase: GetLinkedPaymentMethodsUseCase
    val processAutoPaymentUseCase: ProcessAutoPaymentUseCase
}

class DefaultAppContainer : AppContainer {
    override val cartRepository: CartRepository by lazy {
        CartRepositoryImpl()
    }

    override val productRepository: ProductRepository by lazy {
        ProductRepositoryImpl()
    }

    override val paymentRepository: PaymentRepository by lazy {
        PaymentRepositoryImpl()
    }

    override val validateCartForAutoPaymentUseCase: ValidateCartForAutoPaymentUseCase by lazy {
        ValidateCartForAutoPaymentUseCase(paymentRepository)
    }

    override val getLinkedPaymentMethodsUseCase: GetLinkedPaymentMethodsUseCase by lazy {
        GetLinkedPaymentMethodsUseCase(paymentRepository)
    }

    override val processAutoPaymentUseCase: ProcessAutoPaymentUseCase by lazy {
        ProcessAutoPaymentUseCase(paymentRepository, validateCartForAutoPaymentUseCase)
    }
}
