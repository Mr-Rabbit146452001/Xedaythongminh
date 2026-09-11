package com.example.xedaythongminh.domain.model

import com.example.xedaythongminh.data.models.Product

/**
 * Phân loại nguồn gốc phát hiện việc quét sản phẩm vi phạm
 */
enum class ViolationSource {
    LOCAL_BARCODE_SCAN,
    REMOTE_POLLER_SYNC,
    LOADCELL_ANOMALY
}

/**
 * Ảnh chụp giỏ hàng tại thời điểm khóa (khi bắt đầu chuyển sang quy trình thanh toán)
 */
data class CartLockSnapshot(
    val lockedAtTimestamp: Long = System.currentTimeMillis(),
    val itemsMap: Map<String, Int> = emptyMap() // Key: Product SKU/Barcode/ID, Value: Quantity
)

/**
 * Thông tin sản phẩm quét vi phạm không hợp lệ
 */
data class InvalidProductViolation(
    val product: Product,
    val scannedQuantity: Int = 1,
    val detectedAt: Long = System.currentTimeMillis(),
    val source: ViolationSource = ViolationSource.LOCAL_BARCODE_SCAN
)
