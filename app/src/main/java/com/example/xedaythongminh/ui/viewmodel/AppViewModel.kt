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
import com.example.xedaythongminh.data.models.CartNotification
import com.example.xedaythongminh.data.models.NotificationType
import com.example.xedaythongminh.data.remote.dto.toDomainModel
import com.example.xedaythongminh.data.remote.dto.toDomainCartItem
import com.example.xedaythongminh.domain.model.CartLockSnapshot
import com.example.xedaythongminh.domain.model.InvalidProductViolation
import com.example.xedaythongminh.domain.model.ViolationSource

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

    private val _activeSessionId = MutableStateFlow<String?>("SESSION_DEFAULT")
    val activeSessionId: StateFlow<String?> = _activeSessionId.asStateFlow()

    private val _cartNotificationState = MutableStateFlow<CartNotification?>(null)
    val cartNotificationState: StateFlow<CartNotification?> = _cartNotificationState.asStateFlow()

    private val _lastScannedItem = MutableStateFlow<CartItem?>(null)
    val lastScannedItem: StateFlow<CartItem?> = _lastScannedItem.asStateFlow()

    private val _scanEventTimestamp = MutableStateFlow<Long>(0L)
    val scanEventTimestamp: StateFlow<Long> = _scanEventTimestamp.asStateFlow()

    // Trạng thái khóa giỏ hàng khi chuyển sang quy trình thanh toán
    private val _isCartLocked = MutableStateFlow<Boolean>(false)
    val isCartLocked: StateFlow<Boolean> = _isCartLocked.asStateFlow()

    // Ảnh chụp giỏ hàng tại thời điểm khóa
    private val _lockedCartSnapshot = MutableStateFlow<CartLockSnapshot?>(null)
    val lockedCartSnapshot: StateFlow<CartLockSnapshot?> = _lockedCartSnapshot.asStateFlow()

    // Sản phẩm vi phạm quét không hợp lệ khi giỏ hàng đã chốt
    private val _invalidScannedProduct = MutableStateFlow<InvalidProductViolation?>(null)
    val invalidScannedProduct: StateFlow<InvalidProductViolation?> = _invalidScannedProduct.asStateFlow()

    private var notificationJob: kotlinx.coroutines.Job? = null
    private var qrPollingJob: kotlinx.coroutines.Job? = null

    fun lockCart() {
        val currentItems = _cartItemsState.value
        val itemsMap = currentItems.associate { (it.product.sku.ifBlank { it.product.id }) to it.quantity }
        _lockedCartSnapshot.value = CartLockSnapshot(
            lockedAtTimestamp = System.currentTimeMillis(),
            itemsMap = itemsMap
        )
        _isCartLocked.value = true
        _invalidScannedProduct.value = null
    }

    fun unlockCart() {
        _isCartLocked.value = false
        _lockedCartSnapshot.value = null
        _invalidScannedProduct.value = null
    }

    fun resolveInvalidScannedProduct() {
        _invalidScannedProduct.value = null
        resolveWeightAnomaly()
    }

    fun resolveWeightAnomaly() {
        _hasUnscannedProduct.value = false
        if (_invalidScannedProduct.value?.source == ViolationSource.LOADCELL_ANOMALY) {
            _invalidScannedProduct.value = null
        }
        viewModelScope.launch {
            try {
                com.example.xedaythongminh.data.remote.RetrofitClient.apiService.setWeightAnomaly(mapOf("detected" to false))
            } catch (ignored: Exception) {}
        }
    }

    fun triggerCartNotification(productName: String, type: NotificationType) {
        notificationJob?.cancel()
        val message = when (type) {
            NotificationType.ADD -> "Đã thêm: $productName"
            NotificationType.REMOVE -> "Đã lấy ra: $productName"
        }
        _cartNotificationState.value = CartNotification(
            message = message,
            productName = productName,
            type = type
        )
        notificationJob = viewModelScope.launch {
            kotlinx.coroutines.delay(2800L)
            _cartNotificationState.value = null
        }
    }

    init {
        // Lắng nghe dữ liệu từ Repository (Source of Truth)
        viewModelScope.launch {
            cartRepository.getCartItems().collect { items ->
                _cartItemsState.value = items
            }
        }
        fetchAllProducts()
        createShoppingSession()
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
                    // KIỂM TRA BẢO MẬT: Nếu giỏ hàng đã bị khóa sau khi next qua giỏ hàng (giai đoạn thanh toán)
                    if (_isCartLocked.value) {
                        _invalidScannedProduct.value = InvalidProductViolation(
                            product = product,
                            scannedQuantity = 1,
                            detectedAt = System.currentTimeMillis(),
                            source = ViolationSource.LOCAL_BARCODE_SCAN
                        )
                        return@launch
                    }

                    // Cập nhật giỏ hàng nếu tìm thấy sản phẩm
                    val existingItem = _cartItemsState.value.find { it.product.sku == barcode || it.product.id == barcode }
                    if (existingItem != null) {
                        val updated = existingItem.copy(quantity = existingItem.quantity + 1)
                        _lastScannedItem.value = updated
                        _scanEventTimestamp.value = System.currentTimeMillis()
                        increaseQuantity(existingItem)
                    } else {
                        val newItem = CartItem(product = product, quantity = 1)
                        _lastScannedItem.value = newItem
                        _scanEventTimestamp.value = System.currentTimeMillis()
                        cartRepository.addCartItem(newItem)
                        triggerCartNotification(product.name, NotificationType.ADD)
                    }

                    // Đồng bộ quyết định lên server cổng 8000
                    val sId = _activeSessionId.value
                    if (!sId.isNullOrBlank()) {
                        try {
                            val req = com.example.xedaythongminh.data.remote.dto.CartDecisionRequestDto(
                                sessionId = sId,
                                action = "add",
                                barcode = product.sku,
                                aiClass = product.sku,
                                aiConfidence = 1.0f,
                                deltaWeightG = 500.0f,
                                weightSource = "simulated"
                            )
                            com.example.xedaythongminh.data.remote.RetrofitClient.apiService.sendCartDecisionV1(req)
                        } catch (ignored: Exception) {}
                    }
                } else {
                    _errorState.value = "Mã vạch không đúng hoặc không tồn tại"
                }
            } else {
                val errorMsg = result.exceptionOrNull()?.message ?: "Lỗi kết nối máy chủ"
                _errorState.value = errorMsg
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
                    // KIỂM TRA BẢO MẬT: Nếu giỏ hàng đã bị khóa sau khi next qua giỏ hàng (giai đoạn thanh toán)
                    if (_isCartLocked.value) {
                        _invalidScannedProduct.value = InvalidProductViolation(
                            product = product,
                            scannedQuantity = quantity,
                            detectedAt = System.currentTimeMillis(),
                            source = ViolationSource.LOCAL_BARCODE_SCAN
                        )
                        return@launch
                    }

                    val existingItem = _cartItemsState.value.find { it.product.sku == barcode || it.product.id == barcode }
                    if (existingItem != null) {
                        val updated = existingItem.copy(quantity = existingItem.quantity + quantity)
                        _lastScannedItem.value = updated
                        _scanEventTimestamp.value = System.currentTimeMillis()
                        cartRepository.updateQuantity(existingItem, existingItem.quantity + quantity)
                        triggerCartNotification(existingItem.product.name, NotificationType.ADD)
                    } else {
                        val newItem = CartItem(product = product, quantity = quantity)
                        _lastScannedItem.value = newItem
                        _scanEventTimestamp.value = System.currentTimeMillis()
                        cartRepository.addCartItem(newItem)
                        triggerCartNotification(product.name, NotificationType.ADD)
                    }
                } else {
                    _errorState.value = "Mã vạch không đúng hoặc không tồn tại"
                }
            } else {
                val errorMsg = result.exceptionOrNull()?.message ?: "Lỗi kết nối máy chủ"
                _errorState.value = errorMsg
            }
        }
    }

    fun removeCartItem(item: CartItem) {
        triggerCartNotification(item.product.name, NotificationType.REMOVE)

        // 1. Cập nhật UI giỏ hàng ngay lập tức
        val currentList = _cartItemsState.value.toMutableList()
        currentList.removeAll { it.product.id == item.product.id || it.product.sku == item.product.sku }
        _cartItemsState.value = currentList
        if (_lastScannedItem.value?.product?.sku == item.product.sku || _lastScannedItem.value?.product?.id == item.product.id) {
            _lastScannedItem.value = currentList.lastOrNull()
            _scanEventTimestamp.value = System.currentTimeMillis()
        }

        // 2. Cập nhật Repository
        cartRepository.removeCartItem(item)

        // 3. Đồng bộ quyết định xóa lên server cổng 8000
        val sId = _activeSessionId.value
        if (!sId.isNullOrBlank()) {
            viewModelScope.launch {
                try {
                    val req = com.example.xedaythongminh.data.remote.dto.CartDecisionRequestDto(
                        sessionId = sId,
                        action = "remove",
                        barcode = item.product.sku,
                        aiClass = item.product.sku,
                        aiConfidence = 1.0f,
                        deltaWeightG = -500.0f,
                        weightSource = "simulated"
                    )
                    com.example.xedaythongminh.data.remote.RetrofitClient.apiService.sendCartDecisionV1(req)
                } catch (ignored: Exception) {}
            }
        }
    }

    fun increaseQuantity(item: CartItem) {
        triggerCartNotification(item.product.name, NotificationType.ADD)

        val currentList = _cartItemsState.value.toMutableList()
        val idx = currentList.indexOfFirst { it.product.id == item.product.id || it.product.sku == item.product.sku }
        if (idx != -1) {
            val updated = currentList[idx].copy(quantity = currentList[idx].quantity + 1)
            currentList[idx] = updated
            _cartItemsState.value = currentList
            _lastScannedItem.value = updated
            _scanEventTimestamp.value = System.currentTimeMillis()
        }
        cartRepository.updateQuantity(item, item.quantity + 1)

        val sId = _activeSessionId.value
        if (!sId.isNullOrBlank()) {
            viewModelScope.launch {
                try {
                    val req = com.example.xedaythongminh.data.remote.dto.CartDecisionRequestDto(
                        sessionId = sId,
                        action = "add",
                        barcode = item.product.sku,
                        aiClass = item.product.sku,
                        aiConfidence = 1.0f,
                        deltaWeightG = 500.0f,
                        weightSource = "simulated"
                    )
                    com.example.xedaythongminh.data.remote.RetrofitClient.apiService.sendCartDecisionV1(req)
                } catch (ignored: Exception) {}
            }
        }
    }

    fun decreaseQuantity(item: CartItem) {
        if (item.quantity > 1) {
            triggerCartNotification(item.product.name, NotificationType.REMOVE)

            val currentList = _cartItemsState.value.toMutableList()
            val idx = currentList.indexOfFirst { it.product.id == item.product.id || it.product.sku == item.product.sku }
            if (idx != -1) {
                val updated = currentList[idx].copy(quantity = currentList[idx].quantity - 1)
                currentList[idx] = updated
                _cartItemsState.value = currentList
                _lastScannedItem.value = updated
                _scanEventTimestamp.value = System.currentTimeMillis()
            }
            cartRepository.updateQuantity(item, item.quantity - 1)

            val sId = _activeSessionId.value
            if (!sId.isNullOrBlank()) {
                viewModelScope.launch {
                    try {
                        val req = com.example.xedaythongminh.data.remote.dto.CartDecisionRequestDto(
                            sessionId = sId,
                            action = "remove",
                            barcode = item.product.id,
                            aiClass = item.product.sku,
                            aiConfidence = 1.0f,
                            deltaWeightG = -500.0f,
                            weightSource = "simulated"
                        )
                        com.example.xedaythongminh.data.remote.RetrofitClient.apiService.sendCartDecisionV1(req)
                    } catch (ignored: Exception) {}
                }
            }
        } else {
            removeCartItem(item)
        }
    }

    fun createShoppingSession(onSuccess: (String) -> Unit = {}) {
        viewModelScope.launch {
            try {
                val res = com.example.xedaythongminh.data.remote.RetrofitClient.apiService.createSessionV1()
                if (res.isSuccessful && res.body() != null) {
                    val sId = res.body()!!.id
                    _activeSessionId.value = sId
                    onSuccess(sId)
                    return@launch
                }
            } catch (e: Exception) {
                // Fallback
            }
            val localSessionId = "SESSION_${System.currentTimeMillis()}"
            _activeSessionId.value = localSessionId
            onSuccess(localSessionId)
        }
    }

    fun completeShoppingSession(onSuccess: () -> Unit = {}) {
        val sId = _activeSessionId.value ?: "SESSION_DEFAULT"
        viewModelScope.launch {
            try {
                com.example.xedaythongminh.data.remote.RetrofitClient.apiService.completeSessionV1(sId)
            } catch (e: Exception) {
                // ignore
            } finally {
                _cartItemsState.value = emptyList()
                cartRepository.clearCart()
                onSuccess()
            }
        }
    }

    private fun startNetworkAndCartMonitoring() {
        // Network monitor (kiểm tra trạng thái server cổng 8000 qua /health hoặc /)
        viewModelScope.launch {
            while (true) {
                try {
                    val resHealth = com.example.xedaythongminh.data.remote.RetrofitClient.apiService.healthCheckV1()
                    if (resHealth.isSuccessful) {
                        _isServerConnected.value = true
                    } else {
                        val resRoot = com.example.xedaythongminh.data.remote.RetrofitClient.apiService.rootCheck()
                        _isServerConnected.value = resRoot.isSuccessful
                    }
                } catch (e: Exception) {
                    _isServerConnected.value = false
                }
                kotlinx.coroutines.delay(3000)
            }
        }

        // Real-time Cart Items Sync Poller (đồng bộ giỏ hàng từ /api/v1/cart/{sessionId})
        viewModelScope.launch {
            var isFirstSync = true
            while (true) {
                if (_isServerConnected.value) {
                    val currentSession = _activeSessionId.value
                    if (!currentSession.isNullOrBlank()) {
                        try {
                            val v1Response = com.example.xedaythongminh.data.remote.RetrofitClient.apiService.getCartV1(currentSession)
                            if (v1Response.isSuccessful && v1Response.body() != null) {
                                val v1Data = v1Response.body()!!
                                val domainItems = v1Data.items.map { it.toDomainCartItem() }

                                if (isFirstSync) {
                                    isFirstSync = false
                                    _cartItemsState.value = domainItems
                                    if (domainItems.isNotEmpty()) {
                                        _lastScannedItem.value = domainItems.lastOrNull()
                                        _scanEventTimestamp.value = System.currentTimeMillis()
                                    }
                                } else {
                                    // KIỂM TRA BẢO MẬT: Nếu giỏ hàng đang bị khóa (sau khi next qua khỏi giỏ hàng để thanh toán)
                                    if (_isCartLocked.value && _lockedCartSnapshot.value != null) {
                                        val snapshot = _lockedCartSnapshot.value!!
                                        val snapshotMap = snapshot.itemsMap
                                        val currentServerMap = domainItems.associateBy { it.product.sku.ifBlank { it.product.id } }

                                        // Kiểm tra xem có sản phẩm nào mới hoặc vượt quá số lượng đã chốt không
                                        var foundViolation: InvalidProductViolation? = null
                                        for ((key, item) in currentServerMap) {
                                            val allowedQty = snapshotMap[key] ?: 0
                                            if (item.quantity > allowedQty) {
                                                foundViolation = InvalidProductViolation(
                                                    product = item.product,
                                                    scannedQuantity = item.quantity - allowedQty,
                                                    detectedAt = System.currentTimeMillis(),
                                                    source = ViolationSource.REMOTE_POLLER_SYNC
                                                )
                                                break
                                            }
                                        }

                                        if (foundViolation != null) {
                                            _invalidScannedProduct.value = foundViolation
                                        } else {
                                            // Nếu tất cả sản phẩm trên xe đã trở về đúng mức chốt -> Tự động giải tỏa cảnh báo!
                                            if (_invalidScannedProduct.value != null) {
                                                _invalidScannedProduct.value = null
                                            }
                                        }
                                    } else {
                                        val currentList = _cartItemsState.value
                                        val oldMap = currentList.associateBy { it.product.sku.ifBlank { it.product.id } }
                                        val newMap = domainItems.associateBy { it.product.sku.ifBlank { it.product.id } }

                                        // 1. Phát hiện sản phẩm mới thêm hoặc tăng số lượng từ máy chủ / đầu quét xe đẩy
                                        for ((key, newItem) in newMap) {
                                            val oldItem = oldMap[key]
                                            if (oldItem == null) {
                                                _lastScannedItem.value = newItem
                                                _scanEventTimestamp.value = System.currentTimeMillis()
                                                triggerCartNotification(newItem.product.name, NotificationType.ADD)
                                            } else if (newItem.quantity > oldItem.quantity) {
                                                _lastScannedItem.value = newItem
                                                _scanEventTimestamp.value = System.currentTimeMillis()
                                                triggerCartNotification(newItem.product.name, NotificationType.ADD)
                                            }
                                        }

                                        // 2. Phát hiện sản phẩm bị lấy ra khỏi giỏ
                                        for ((key, oldItem) in oldMap) {
                                            val newItem = newMap[key]
                                            if (newItem == null) {
                                                triggerCartNotification(oldItem.product.name, NotificationType.REMOVE)
                                                if (_lastScannedItem.value?.let { it.product.sku.ifBlank { it.product.id } } == key) {
                                                    _lastScannedItem.value = domainItems.lastOrNull()
                                                    _scanEventTimestamp.value = System.currentTimeMillis()
                                                }
                                            } else if (newItem.quantity < oldItem.quantity) {
                                                triggerCartNotification(oldItem.product.name, NotificationType.REMOVE)
                                            }
                                        }

                                        if (_cartItemsState.value != domainItems) {
                                            _cartItemsState.value = domainItems
                                        }
                                    }
                                }
                            } else if (v1Response.code() == 404) {
                                // Nếu session chưa có trên server (ví dụ SESSION_DEFAULT) hoặc đã đóng, tự tạo session mới
                                createShoppingSession()
                            }
                        } catch (e: Exception) {
                            // ignore transient error
                        }
                    }

                    // Đồng bộ trạng thái cảm biến trọng lượng bất thường (Vật lạ / sản phẩm chưa quét)
                    try {
                        val statusResponse = com.example.xedaythongminh.data.remote.RetrofitClient.apiService.getCartStatus()
                        if (statusResponse.isSuccessful) {
                            val hasUnscanned = statusResponse.body()?.data?.hasUnscannedProduct ?: false
                            _hasUnscannedProduct.value = hasUnscanned

                            if (hasUnscanned) {
                                if (_isCartLocked.value && _invalidScannedProduct.value == null) {
                                    _invalidScannedProduct.value = InvalidProductViolation(
                                        product = com.example.xedaythongminh.data.models.Product(
                                            id = "LOADCELL_ANOMALY",
                                            name = "Vật lạ / Sản phẩm chưa quét mã vạch",
                                            sku = "LOADCELL_ANOMALY",
                                            unitPrice = 0L,
                                            imageUrl = ""
                                        ),
                                        scannedQuantity = 1,
                                        detectedAt = System.currentTimeMillis(),
                                        source = ViolationSource.LOADCELL_ANOMALY
                                    )
                                }
                            } else {
                                if (_invalidScannedProduct.value?.source == ViolationSource.LOADCELL_ANOMALY) {
                                    _invalidScannedProduct.value = null
                                }
                            }
                        }
                    } catch (ignoredStatus: Exception) {}
                }
                kotlinx.coroutines.delay(1500)
            }
        }
    }

    fun checkoutCart(onSuccess: () -> Unit = {}) {
        viewModelScope.launch {
            try {
                if (_cartItemsState.value.isNotEmpty()) {
                    _lastCompletedCartItems.value = _cartItemsState.value
                }
                val req = com.example.xedaythongminh.data.remote.dto.CheckoutRequest(
                    sessionId = _activeSessionId.value ?: "SESSION_DEFAULT",
                    customerId = _userState.value?.id ?: "CUSTOMER_888"
                )
                val response = com.example.xedaythongminh.data.remote.RetrofitClient.apiService.checkoutCart(req)
                if (response.isSuccessful) {
                    cartRepository.clearCart()
                    _cartItemsState.value = emptyList()
                    onSuccess()
                }
            } catch (e: Exception) {
                _errorState.value = "Lỗi thanh toán: ${e.message}"
            }
        }
    }

    fun startQrLoginSession() {
        // Cancel existing job if running
        qrPollingJob?.cancel()
        _sessionQrUrl.value = null
        _userState.value = null // BẢO MẬT: Luôn reset trạng thái khách hàng khi bắt đầu phiên quét mới
        
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

    // ==========================================
    // QUẢN LÝ THANH TOÁN QR XE ĐẨY (STROLLER QR PAYMENT)
    // ==========================================
    // THANH TOÁN QR ĐỘC LẬP VỚI MOCK BANK (1 TOKEN = 10 VNĐ)
    // ==========================================
    private val _paymentQrContent = MutableStateFlow<String?>(null)
    val paymentQrContent: StateFlow<String?> = _paymentQrContent.asStateFlow()

    private val _qrSessionData = MutableStateFlow<com.example.xedaythongminh.data.remote.dto.QrPaymentSessionData?>(null)
    val qrSessionData: StateFlow<com.example.xedaythongminh.data.remote.dto.QrPaymentSessionData?> = _qrSessionData.asStateFlow()

    private val _isQrExpired = MutableStateFlow<Boolean>(false)
    val isQrExpired: StateFlow<Boolean> = _isQrExpired.asStateFlow()

    private val _isPaymentCompleted = MutableStateFlow<Boolean>(false)
    val isPaymentCompleted: StateFlow<Boolean> = _isPaymentCompleted.asStateFlow()

    private val _lastCompletedCartItems = MutableStateFlow<List<CartItem>>(emptyList())
    val lastCompletedCartItems: StateFlow<List<CartItem>> = _lastCompletedCartItems.asStateFlow()

    fun setLastCompletedCartItems(items: List<CartItem>) {
        if (items.isNotEmpty()) {
            _lastCompletedCartItems.value = items
        }
    }

    private var paymentPollingJob: kotlinx.coroutines.Job? = null

    fun startQrPaymentSession(onPaymentSuccess: () -> Unit) {
        paymentPollingJob?.cancel()
        _paymentQrContent.value = null
        _qrSessionData.value = null
        _isPaymentCompleted.value = false
        _isQrExpired.value = false

        viewModelScope.launch {
            try {
                val currentItems = _cartItemsState.value
                val summary = com.example.xedaythongminh.data.models.CartSummary(currentItems)
                val finalPayAmount = (summary.subtotal - summary.memberDiscount).coerceAtLeast(0L)

                val req = mapOf(
                    "sessionId" to (_activeSessionId.value ?: "SESSION_DEFAULT"),
                    "customerId" to (_userState.value?.id ?: "CUSTOMER_888"),
                    "totalAmount" to summary.subtotal.toString(),
                    "finalAmount" to (if (finalPayAmount > 0L) finalPayAmount.toString() else summary.subtotal.toString())
                )
                val response = com.example.xedaythongminh.data.remote.RetrofitClient.apiService.createQrPaymentSession(req)
                if (response.isSuccessful && response.body()?.status == "Thành công") {
                    val sessionData = response.body()?.data
                    if (sessionData != null) {
                        _qrSessionData.value = sessionData
                        _paymentQrContent.value = sessionData.qrContent
                        startPaymentPolling(sessionData.orderId, onPaymentSuccess)
                    }
                }
            } catch (e: Exception) {
                _errorState.value = "Lỗi khởi tạo thanh toán QR: ${e.message}"
            }
        }
    }

    private fun startPaymentPolling(orderId: String, onPaymentSuccess: () -> Unit) {
        paymentPollingJob = viewModelScope.launch {
            while (true) {
                kotlinx.coroutines.delay(1500)
                try {
                    val response = com.example.xedaythongminh.data.remote.RetrofitClient.apiService.checkQrPaymentStatus(orderId)
                    if (response.isSuccessful && response.body()?.status == "Thành công") {
                        val statusData = response.body()?.data
                        if (statusData != null) {
                            if (statusData.isPaid) {
                                _isPaymentCompleted.value = true
                                if (_cartItemsState.value.isNotEmpty()) {
                                    _lastCompletedCartItems.value = _cartItemsState.value
                                }
                                cartRepository.clearCart()
                                _cartItemsState.value = emptyList()
                                paymentPollingJob?.cancel()
                                onPaymentSuccess()
                                break
                            } else if (statusData.paymentStatus == "EXPIRED") {
                                _isQrExpired.value = true
                                paymentPollingJob?.cancel()
                                break
                            }
                        }
                    }
                } catch (e: Exception) {
                    // Bỏ qua lỗi mạng chập chờn khi polling
                }
            }
        }
    }

    fun stopQrPaymentSession() {
        paymentPollingJob?.cancel()
        _paymentQrContent.value = null
        _qrSessionData.value = null
        _isQrExpired.value = false
    }

    fun logoutUser() {
        _userState.value = null
        _sessionQrUrl.value = null
        qrPollingJob?.cancel()
    }

    fun terminateSessionImmediately() {
        // BẢO MẬT: Xóa trắng RAM ngay lập tức trên UI Thread để tránh rò rỉ phiên
        _userState.value = null
        _cartItemsState.value = emptyList()
        _isPaymentCompleted.value = false
        _hasUnscannedProduct.value = false
        _paymentQrContent.value = null
        _qrSessionData.value = null
        _isQrExpired.value = false
        _lastCompletedCartItems.value = emptyList()
        _sessionQrUrl.value = null
        _lastScannedItem.value = null
        _scanEventTimestamp.value = 0L
        _cartNotificationState.value = null
        _isCartLocked.value = false
        _lockedCartSnapshot.value = null
        _invalidScannedProduct.value = null
        notificationJob?.cancel()
        qrPollingJob?.cancel()
        paymentPollingJob?.cancel()

        val sId = _activeSessionId.value
        viewModelScope.launch {
            try {
                cartRepository.clearCart()
                if (!sId.isNullOrBlank()) {
                    com.example.xedaythongminh.data.remote.RetrofitClient.apiService.completeSessionV1(sId)
                    com.example.xedaythongminh.data.remote.RetrofitClient.apiService.logoutAuthSession(mapOf("sessionId" to sId))
                }
            } catch (e: Exception) {
                // ignore
            } finally {
                createShoppingSession()
            }
        }
    }

    fun resetSessionAfterPayment() {
        terminateSessionImmediately()
    }

    fun clearSession() {
        terminateSessionImmediately()
    }

    fun clearError() {
        _errorState.value = null
    }
}
