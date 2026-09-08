package com.example.xedaythongminh.data.repository

import com.example.xedaythongminh.data.models.Product
import com.example.xedaythongminh.data.remote.RetrofitClient
import com.example.xedaythongminh.data.remote.dto.*

class ProductRepositoryImpl : ProductRepository {

    // Danh mục 4 sản phẩm chính thức theo tài liệu bàn giao & ERD cơ sở dữ liệu
    private val defaultHandoverProducts = listOf(
        Product(
            id = "8935005801135",
            sku = "lavie_500ml",
            name = "La Vie 500 ml",
            unitPrice = 10000L,
            imageUrl = "${RetrofitClient.getBaseUrl()}images/8935005801135.jpg"
        ),
        Product(
            id = "6975493200982",
            sku = "banh_sua_chua_20g",
            name = "Bánh Sữa Chua 20g",
            unitPrice = 3000L,
            imageUrl = "${RetrofitClient.getBaseUrl()}images/6975493200982.jpg"
        ),
        Product(
            id = "8938556329004",
            sku = "pocari_sweat_500ml",
            name = "Pocari Sweat 500 ml",
            unitPrice = 15000L,
            imageUrl = "${RetrofitClient.getBaseUrl()}images/8938556329004.jpg"
        ),
        Product(
            id = "8936154640613",
            sku = "siro_ho_euca_super_extra_125ml",
            name = "Siro EUCA Super Extra 125 ml",
            unitPrice = 60000L,
            imageUrl = "${RetrofitClient.getBaseUrl()}images/8936154640613.jpg"
        )
    )

    override suspend fun getProducts(): Result<List<Product>> {
        return try {
            val response = RetrofitClient.apiService.getProductsV1()
            if (response.isSuccessful && response.body() != null) {
                val products = response.body()!!.map { it.toDomainProduct() }
                Result.success(products)
            } else {
                Result.success(defaultHandoverProducts)
            }
        } catch (e: Exception) {
            Result.success(defaultHandoverProducts)
        }
    }

    override suspend fun getProductByBarcode(barcode: String): Result<Product?> {
        val cleanBarcode = barcode.trim()
        val productsResult = getProducts()
        val list = productsResult.getOrDefault(defaultHandoverProducts)
        val product = list.find { it.id == cleanBarcode || it.sku == cleanBarcode }
        return if (product != null) {
            Result.success(product)
        } else {
            Result.failure(Exception("Không tìm thấy sản phẩm có mã $cleanBarcode"))
        }
    }
}
