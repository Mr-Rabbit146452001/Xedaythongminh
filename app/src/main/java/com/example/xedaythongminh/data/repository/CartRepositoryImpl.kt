package com.example.xedaythongminh.data.repository

import com.example.xedaythongminh.data.models.CartItem
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow

class CartRepositoryImpl constructor() : CartRepository {
    
    // Khởi tạo giỏ hàng trống (không dùng dữ liệu giả nữa)
    private val _cartItems = MutableStateFlow<List<CartItem>>(emptyList())

    override fun getCartItems(): Flow<List<CartItem>> {
        return _cartItems.asStateFlow()
    }

    override fun addCartItem(item: CartItem) {
        val current = _cartItems.value.toMutableList()
        current.add(item)
        _cartItems.value = current
    }

    override fun removeCartItem(item: CartItem) {
        val current = _cartItems.value.toMutableList()
        current.removeAll { it.product.id == item.product.id || it.product.sku == item.product.sku }
        _cartItems.value = current
    }

    override fun updateQuantity(item: CartItem, newQuantity: Int) {
        val current = _cartItems.value.toMutableList()
        val index = current.indexOfFirst { it.product.id == item.product.id || it.product.sku == item.product.sku }
        if (index != -1 && newQuantity > 0) {
            current[index] = current[index].copy(quantity = newQuantity)
            _cartItems.value = current
        } else if (index != -1 && newQuantity <= 0) {
            current.removeAt(index)
            _cartItems.value = current
        }
    }

    override fun clearCart() {
        _cartItems.value = emptyList()
    }
}
