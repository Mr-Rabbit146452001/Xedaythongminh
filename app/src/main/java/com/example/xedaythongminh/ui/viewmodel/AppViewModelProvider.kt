package com.example.xedaythongminh.ui.viewmodel

import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewmodel.CreationExtras
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import com.example.xedaythongminh.StrollerApplication

object AppViewModelProvider {
    val Factory = viewModelFactory {
        initializer {
            val container = (this[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY] as? StrollerApplication)?.container
                ?: com.example.xedaythongminh.di.DefaultAppContainer()
            AppViewModel(
                cartRepository = container.cartRepository,
                productRepository = container.productRepository
            )
        }
        initializer {
            val container = (this[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY] as? StrollerApplication)?.container
                ?: com.example.xedaythongminh.di.DefaultAppContainer()
            com.example.xedaythongminh.ui.autopayment.AutoPaymentViewModel(
                cartRepository = container.cartRepository,
                getLinkedPaymentMethodsUseCase = container.getLinkedPaymentMethodsUseCase,
                processAutoPaymentUseCase = container.processAutoPaymentUseCase
            )
        }
    }
}
