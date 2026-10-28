package com.example.xedaythongminh.domain.model

/**
 * Sự kiện Cổng An Ninh RFID quét nhận diện thẻ từ gắn trên xe đẩy thông minh.
 * Khi xe đẩy di chuyển qua cổng an ninh, cảm biến RFID (RC522 / UHF RFID)
 * sẽ nhận diện thẻ và truyền tín hiệu về hệ thống để kích hoạt chế độ thanh toán tự động.
 *
 * @param rfidTag Mã định danh thẻ từ RFID gắn trên xe đẩy (ví dụ: "CART_RFID_8888")
 * @param gateId Mã định danh cổng an ninh / quầy thanh toán (ví dụ: "GATE_01")
 * @param detectedAt Thời điểm phát hiện quét thẻ (mili-giây)
 */
data class RfidGateEvent(
    val rfidTag: String,
    val gateId: String = "GATE_01",
    val detectedAt: Long = System.currentTimeMillis()
)
