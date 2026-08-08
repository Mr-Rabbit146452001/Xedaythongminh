package com.example.xedaythongminh.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.xedaythongminh.data.models.CartItem
import com.example.xedaythongminh.data.repository.CartRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import com.example.xedaythongminh.data.models.User
import com.example.xedaythongminh.data.remote.dto.toDomainModel

class AppViewModel constructor(
    private val cartRepository: CartRepository,
    private val productRepository: com.example.xedaythongminh.data.repository.ProductRepository
) : ViewModel() {

    private val _userState = MutableStateFlow<User?>(null)
    val userState: StateFlow<User?> = _userState.asStateFlow()

    private val _cartItemsState = MutableStateFlow<List<CartItem>>(emptyList())
    val cartItemsState: StateFlow<List<CartItem>> = _cartItemsState.asStateFlow()

    private val _productsState = MutableStateFlow<List<com.example.xedaythongminh.data.models.Product>>(emptyList())
    val productsState: StateFlow<List<com.example.xedaythongminh.data.models.Product>> = _productsState.asStateFlow()

    private val _errorState = MutableStateFlow<String?>(null)
    val errorState: StateFlow<String?> = _errorState.asStateFlow()

    private val _isServerConnected = MutableStateFlow<Boolean>(true)
    val isServerConnected: StateFlow<Boolean> = _isServerConnected.asStateFlow()

    private val _hasUnscannedProduct = MutableStateFlow<Boolean>(false)
    val hasUnscannedProduct: StateFlow<Boolean> = _hasUnscannedProduct.asStateFlow()

    private val _sessionQrUrl = MutableStateFlow<String?>(null)
    val sessionQrUrl: StateFlow<String?> = _sessionQrUrl.asStateFlow()

    private var qrPollingJob: kotlinx.coroutines.Job? = null

    init {
        // Lắng nghe dữ liệu từ Repository (Source of Truth)
        viewModelScope.launch {
            cartRepository.getCartItems().collect { items ->
                _cartItemsState.value = items
            }
        }
        fetchAllProducts()
        startNetworkAndCartMonitoring()
    }

    fun fetchAllProducts() {
        viewModelScope.launch {
            val result = productRepository.getProducts()
            if (result.isSuccess) {
                _productsState.value = result.getOrDefault(emptyList())
                _errorState.value = null
            } else {
                _errorState.value = result.exceptionOrNull()?.message ?: "Unknown Error"
            }
        }
    }

    fun scanProduct(barcode: String) {
        viewModelScope.launch {
            _errorState.value = null // Clear previous errors
            val result = productRepository.getProductByBarcode(barcode)
            if (result.isSuccess) {
                val product = result.getOrNull()
                if (product != null) {
                    // Cập nhật giỏ hàng nếu tìm thấy sản phẩm
                    val existingItem = _cartItemsState.value.find { it.product.sku == barcode }
                    if (existingItem != null) {
                        increaseQuantity(existingItem)
                    } else {
                        cartRepository.addCartItem(CartItem(product = product, quantity = 1))
                    }
                } else {
                    _errorState.value = "Bancode bạn nhập không đúng"
                }
            } else {
                val errorMsg = result.exceptionOrNull()?.message ?: "Lỗi kết nối máy chủ"
                _errorState.value = "Lỗi mạng: $errorMsg"
            }
        }
    }

    fun addProductWithQuantity(barcode: String, quantity: Int) {
        viewModelScope.launch {
            _errorState.value = null
            val result = productRepository.getProductByBarcode(barcode)
            if (result.isSuccess) {
                val product = result.getOrNull()
                if (product != null) {
                    val existingItem = _cartItemsState.value.find { it.product.sku == barcode }
                    if (existingItem != null) {
                        cartRepository.updateQuantity(existingItem, existingItem.quantity + quantity)
                    } else {
                        cartRepository.addCartItem(CartItem(product = product, quantity = quantity))
                    }
                } else {
                    _errorState.value = "Bancode bạn nhập không đúng"
                }
            } else {
                val errorMsg = result.exceptionOrNull()?.message ?: "Lỗi kết nối máy chủ"
                _errorState.value = "Lỗi mạng: $errorMsg"
            }
        }
    }

    fun removeCartItem(item: CartItem) {
        cartRepository.removeCartItem(item)
    }

    fun increaseQuantity(item: CartItem) {
        cartRepository.updateQuantity(item, item.quantity + 1)
    }

    fun decreaseQuantity(item: CartItem) {
        if (item.quantity > 1) {
            cartRepository.updateQuantity(item, item.quantity - 1)
        } else {
            cartRepository.removeCartItem(item)
        }
    }

    private fun startNetworkAndCartMonitoring() {
        // Network monitor (pings server every 3 seconds)
        viewModelScope.launch {
            while (true) {
                try {
                    val response = com.example.xedaythongminh.data.remote.RetrofitClient.apiService.healthCheck()
                    _isServerConnected.value = response.isSuccessful
                } catch (e: Exception) {
                    _isServerConnected.value = false
                }
                kotlinx.coroutines.delay(3000)
            }
        }

        // Cart unscanned status poller (polls every 2 seconds)
        viewModelScope.launch {
            while (true) {
                if (_isServerConnected.value) {
                    try {
                        val response = com.example.xedaythongminh.data.remote.RetrofitClient.apiService.getCartStatus()
                        if (response.isSuccessful) {
                            _hasUnscannedProduct.value = response.body()?.data?.hasUnscannedProduct ?: false
                        }
                    } catch (e: Exception) {
                        // ignore error
                    }
                }
                kotlinx.coroutines.delay(2000)
            }
        }
    }

    fun startQrLoginSession() {
        // Cancel existing job if running
        qrPollingJob?.cancel()
        _sessionQrUrl.value = null
        
        viewModelScope.launch {
            try {
                val response = com.example.xedaythongminh.data.remote.RetrofitClient.apiService.getAuthSession()
                if (response.isSuccessful && response.body()?.status == "Thành công") {
                    val sessionData = response.body()?.data
                    if (sessionData != null) {
                        _sessionQrUrl.value = sessionData.loginUrl
                        
                        // Start polling status
                        startQrStatusPolling(sessionData.sessionId)
                    }
                }
            } catch (e: Exception) {
                _errorState.value = "Lỗi khởi tạo phiên đăng nhập QR: ${e.message}"
            }
        }
    }

    private fun startQrStatusPolling(sessionId: String) {
        qrPollingJob = viewModelScope.launch {
            while (true) {
                kotlinx.coroutines.delay(1500)
                try {
                    val response = com.example.xedaythongminh.data.remote.RetrofitClient.apiService.checkAuthStatus(sessionId)
                    if (response.isSuccessful && response.body()?.status == "Thành công") {
                        val statusData = response.body()?.data
                        if (statusData != null && statusData.authStatus == "success" && statusData.customer != null) {
                            // Map DTO to User domain model
                            val customer = statusData.customer
                            val user = customer.toDomainModel()
                            _userState.value = user
                            _errorState.value = null
                            
                            // Cancel polling since we logged in successfully
                            qrPollingJob?.cancel()
                            break
                        }
                    }
                } catch (e: Exception) {
                    // Ignore transient network errors during polling
                }
            }
        }
    }

    fun stopQrLoginSession() {
        qrPollingJob?.cancel()
        _sessionQrUrl.value = null
    }

    fun loginCustomerWithId(customerId: String, onSuccess: () -> Unit = {}, onFailure: (String) -> Unit = {}) {
        viewModelScope.launch {
            try {
                val response = com.example.xedaythongminh.data.remote.RetrofitClient.apiService.getCustomer(customerId)
                if (response.isSuccessful && response.body()?.status == "Thành công") {
                    val customerDto = response.body()?.data
                    if (customerDto != null) {
                        _userState.value = customerDto.toDomainModel()
                        _errorState.value = null
                        onSuccess()
                    } else {
                        _errorState.value = "Không tìm thấy thông tin khách hàng"
                        onFailure("Không tìm thấy thông tin khách hàng")
                    }
                } else {
                    _errorState.value = "Khách hàng không tồn tại trên hệ thống"
                    onFailure("Khách hàng không tồn tại trên hệ thống")
                }
            } catch (e: Exception) {
                _errorState.value = "Lỗi kết nối máy chủ: ${e.message}"
                onFailure("Lỗi kết nối máy chủ: ${e.message}")
            }
        }
    }

    fun logoutUser() {
        _userState.value = null
    }

    fun clearSession() {
        cartRepository.clearCart()
    }

    fun clearError() {
        _errorState.value = null
    }
}
