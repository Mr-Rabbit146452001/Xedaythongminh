package com.example.xedaythongminh.data.repository

import com.example.xedaythongminh.data.models.Product

interface ProductRepository {
    suspend fun getProducts(): Result<List<Product>>
    suspend fun getProductByBarcode(barcode: String): Result<Product?>
}
