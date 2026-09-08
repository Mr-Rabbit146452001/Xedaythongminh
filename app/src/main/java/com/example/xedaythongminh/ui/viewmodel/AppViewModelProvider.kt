package com.example.xedaythongminh.ui.viewmodel

import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewmodel.CreationExtras
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import com.example.xedaythongminh.StrollerApplication

object AppViewModelProvider {
    val Factory = viewModelFactory {
        initializer {
            val application = (this[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY] as StrollerApplication)
            AppViewModel(
                cartRepository = application.container.cartRepository,
                productRepository = application.container.productRepository
            )
        }
        initializer {
            val application = (this[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY] as StrollerApplication)
            com.example.xedaythongminh.ui.autopayment.AutoPaymentViewModel(
                cartRepository = application.container.cartRepository,
                getLinkedPaymentMethodsUseCase = application.container.getLinkedPaymentMethodsUseCase,
                processAutoPaymentUseCase = application.container.processAutoPaymentUseCase
            )
        }
    }
}
