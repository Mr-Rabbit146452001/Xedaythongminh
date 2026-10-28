package com.example.xedaythongminh.data.repository

import com.example.xedaythongminh.data.models.Product
import com.example.xedaythongminh.data.remote.RetrofitClient
import com.example.xedaythongminh.data.remote.dto.*

class ProductRepositoryImpl : ProductRepository {

    // Danh mục 10 sản phẩm chính thức theo cơ sở dữ liệu siêu thị thực tế
    private val defaultHandoverProducts = listOf(
        Product(
            id = "8936120311028",
            sku = "8936120311028",
            name = "Muối tinh sấy i-ốt Sosal Group 500 g",
            unitPrice = 4100L,
            imageUrl = "${RetrofitClient.getBaseUrl()}images/8936120311028.jpg"
        ),
        Product(
            id = "8936040077271",
            sku = "8936040077271",
            name = "Khăn ướt Puri không mùi 20 tờ",
            unitPrice = 8800L,
            imageUrl = "${RetrofitClient.getBaseUrl()}images/8936040077271.jpg"
        ),
        Product(
            id = "8935024120187",
            sku = "8935024120187",
            name = "Cà phê G7 hòa tan đen 15 gói",
            unitPrice = 47000L,
            imageUrl = "${RetrofitClient.getBaseUrl()}images/8935024120187.jpg"
        ),
        Product(
            id = "8938558334556",
            sku = "8938558334556",
            name = "Khăn giấy Premier 100 tờ 3 lớp",
            unitPrice = 9500L,
            imageUrl = "${RetrofitClient.getBaseUrl()}images/8938558334556.jpg"
        ),
        Product(
            id = "8935049501503",
            sku = "8935049501503",
            name = "Nước ngọt Coca Cola lon 330ml",
            unitPrice = 10900L,
            imageUrl = "${RetrofitClient.getBaseUrl()}images/8935049501503.jpg"
        ),
        Product(
            id = "8935311110464",
            sku = "8935311110464",
            name = "Phở gà Vifon gói 65g",
            unitPrice = 9900L,
            imageUrl = "${RetrofitClient.getBaseUrl()}images/8935311110464.jpg"
        ),
        Product(
            id = "8934673200325",
            sku = "8934673200325",
            name = "Sữa đặc Ông Thọ đỏ tuýp 165g",
            unitPrice = 20000L,
            imageUrl = "${RetrofitClient.getBaseUrl()}images/8934673200325.jpg"
        ),
        Product(
            id = "8936079120382",
            sku = "8936079120382",
            name = "Snack Poca bắp ngọt xóc bơ gói 32g",
            unitPrice = 6000L,
            imageUrl = "${RetrofitClient.getBaseUrl()}images/8936079120382.jpg"
        ),
        Product(
            id = "8934673573344",
            sku = "8934673573344",
            name = "Sữa tươi tiệt trùng Vinamilk 100% Có đường 180ml",
            unitPrice = 9500L,
            imageUrl = "${RetrofitClient.getBaseUrl()}images/8934673573344.jpg"
        ),
        Product(
            id = "8935217400454",
            sku = "8935217400454",
            name = "Sữa tươi tiệt trùng TH true MILK Socola 180ml",
            unitPrice = 9500L,
            imageUrl = "${RetrofitClient.getBaseUrl()}images/8935217400454.jpg"
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
