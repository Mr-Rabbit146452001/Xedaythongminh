package com.example.xedaythongminh.data.repository

import com.example.xedaythongminh.data.models.Product
import com.example.xedaythongminh.data.remote.RetrofitClient
import com.example.xedaythongminh.data.remote.dto.toDomainModel

class ProductRepositoryImpl : ProductRepository {

    override suspend fun getProducts(): Result<List<Product>> {
        return try {
            val response = RetrofitClient.apiService.getProducts()
            if (response.isSuccessful) {
                val body = response.body()
                if ((body?.status == "success" || body?.status == "Thành công") && body.data != null) {
                    val products = body.data.map { it.toDomainModel() }
                    Result.success(products)
                } else {
                    Result.failure(Exception("API returned error status: ${body?.status}"))
                }
            } else {
                Result.failure(Exception("HTTP Error: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun getProductByBarcode(barcode: String): Result<Product?> {
        val productsResult = getProducts()
        return if (productsResult.isSuccess) {
            val product = productsResult.getOrNull()?.find { it.sku == barcode }
            Result.success(product)
        } else {
            Result.failure(productsResult.exceptionOrNull() ?: Exception("Network error or server unreachable"))
        }
    }
}
