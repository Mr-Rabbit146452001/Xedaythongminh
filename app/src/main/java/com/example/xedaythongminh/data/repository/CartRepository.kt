package com.example.xedaythongminh.data.repository

import com.example.xedaythongminh.data.models.CartItem
import kotlinx.coroutines.flow.Flow

interface CartRepository {
    fun getCartItems(): Flow<List<CartItem>>
    fun addCartItem(item: CartItem)
    fun removeCartItem(item: CartItem)
    fun updateQuantity(item: CartItem, newQuantity: Int)
    fun clearCart()
}
