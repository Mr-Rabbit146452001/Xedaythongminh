package com.example.xedaythongminh.domain.model

import androidx.compose.ui.graphics.Color

/**
 * Phân loại các trường hợp lỗi & bất đồng bộ cảm biến trên xe đẩy thông minh
 * (Đối chiếu với các kịch bản của hệ thống Edge AI & Loadcell Raspberry Pi)
 */
enum class AnomalyType(
    val code: String,
    val title: String,
    val defaultDescription: String,
    val actionGuide: String,
    val primaryColor: Long, // ARGB
    val badgeText: String
) {
    WEIGHT_OUT_OF_TOLERANCE(
        code = "weight_out_of_tolerance",
        title = "SAI LỆCH DUNG SAI TRỌNG LƯỢNG",
        defaultDescription = "Trọng lượng thực tế đo được trên xe đẩy chênh lệch bất thường so với định lượng chuẩn của sản phẩm trong hệ thống.",
        actionGuide = "Vui lòng nhấc sản phẩm ra kiểm tra lại, hoặc yêu cầu nhân viên hỗ trợ đối soát nếu nghi ngờ sản phẩm lỗi.",
        primaryColor = 0xFFE11D48, // Rose Red
        badgeText = "LỆCH CÂN NẶNG"
    ),
    WEIGHT_DIRECTION_CONFLICT(
        code = "weight_direction_conflict",
        title = "XUNG ĐỘT CHIỀU CÂN NẶNG",
        defaultDescription = "Phát hiện mâu thuẫn giữa Camera và cảm biến tải trọng (ví dụ: quét thêm hàng nhưng cân báo giảm, hoặc lấy ra nhưng cân báo tăng).",
        actionGuide = "Vui lòng không tì tay/đè lên thành xe đẩy và thực hiện đúng thao tác bỏ hàng vào hoặc lấy hàng ra.",
        primaryColor = 0xFFDC2626, // Crimson Red
        badgeText = "XUNG ĐỘT HÀNH VI"
    ),
    SCALE_MOVING(
        code = "scale_moving",
        title = "XE ĐANG RUNG LẮC / CẢM BIẾN TÌ ĐÈ",
        defaultDescription = "Cảm biến tải trọng đang dao động mạnh do xe đẩy đang di chuyển trên sàn gồ ghề hoặc có người tì tay vào mép giỏ.",
        actionGuide = "Vui lòng dừng xe và bỏ tay khỏi thành giỏ xe đẩy trong 2 giây để cảm biến cân ổn định trở lại.",
        primaryColor = 0xFFD97706, // Amber
        badgeText = "CÂN DAO ĐỘNG"
    ),
    CAM2_OUTWARD_UNCONFIRMED(
        code = "cam2_outward_unconfirmed",
        title = "YÊU CẦU QUÉT MÃ BỚT HÀNG",
        defaultDescription = "Cảm biến cân ghi nhận tải trọng giảm (đã lấy hàng ra) nhưng Camera mép giỏ chưa nhận diện rõ món hàng nào.",
        actionGuide = "Vui lòng đưa mã vạch của sản phẩm bạn vừa lấy ra qua đầu đọc mã vạch GM65 để hệ thống bớt món khỏi giỏ hàng.",
        primaryColor = 0xFF4F46E5, // Indigo
        badgeText = "CẦN QUÉT GM65 BỚT MÓN"
    ),
    WEIGHT_ADD_UNCONFIRMED(
        code = "weight_add_identity_unconfirmed",
        title = "PHÁT HIỆN SẢN PHẨM CHƯA XÁC NHẬN",
        defaultDescription = "Cảm biến cân ghi nhận tải trọng giỏ tăng lên nhưng Camera chưa đủ độ tin cậy để định danh món hàng được bỏ vào.",
        actionGuide = "Vui lòng quét mã vạch sản phẩm bạn vừa bỏ vào bằng đầu đọc mã vạch GM65, hoặc nhấc sản phẩm ra khỏi giỏ.",
        primaryColor = 0xFFE11D48, // Rose Red
        badgeText = "CẦN QUÉT GM65 THÊM MÓN"
    ),
    SIMULTANEOUS_ACTIONS(
        code = "simultaneous_add_remove_possible",
        title = "PHÁT HIỆN THAO TÁC ĐỒNG THỜI",
        defaultDescription = "Hệ thống phát hiện có hành vi bỏ sản phẩm mới vào đồng thời rút sản phẩm cũ ra khỏi xe cùng lúc (nghi ngờ tráo đổi).",
        actionGuide = "Để bảo đảm tính chính xác, quý khách vui lòng thực hiện từng thao tác một (bỏ hàng hoặc lấy hàng riêng biệt).",
        primaryColor = 0xFFB91C1C, // Dark Red
        badgeText = "NGHI NGỜ TRÁO ĐỔI"
    ),
    CART_CAMERA_DISAGREEMENT(
        code = "cart_camera_disagreement",
        title = "SAI LỆCH SỐ LƯỢNG GIỎ & CSDL",
        defaultDescription = "Số lượng sản phẩm Camera quan sát thấy trong lòng giỏ không trùng khớp với số lượng đang lưu trong hệ thống CSDL.",
        actionGuide = "Vui lòng xếp ngay ngắn lại các sản phẩm trong giỏ để camera nhận diện lại, hoặc đối soát lại danh sách món hàng.",
        primaryColor = 0xFFEA580C, // Burnt Orange
        badgeText = "LỆCH SỐ LƯỢNG"
    ),
    GENERIC_UNSCANNED(
        code = "generic_unscanned",
        title = "SẢN PHẨM CHƯA ĐƯỢC QUÉT MÃ!",
        defaultDescription = "Phát hiện có sản phẩm được đặt vào xe đẩy nhưng chưa được quét mã vạch trên hệ thống.",
        actionGuide = "Vui lòng quét mã sản phẩm hoặc bỏ sản phẩm ra khỏi khay chứa đồ của xe đẩy để tiếp tục mua sắm.",
        primaryColor = 0xFFEF4444, // Red
        badgeText = "CHƯA QUÉT MÃ"
    );

    companion object {
        fun fromCode(code: String?): AnomalyType {
            if (code.isNullOrBlank()) return GENERIC_UNSCANNED
            val normalized = code.trim().lowercase()
            return entries.firstOrNull { 
                it.code.lowercase() == normalized ||
                normalized.contains(it.name.lowercase()) ||
                it.name.lowercase().contains(normalized)
            } ?: when {
                normalized.contains("tolerance") -> WEIGHT_OUT_OF_TOLERANCE
                normalized.contains("conflict") || normalized.contains("direction") -> WEIGHT_DIRECTION_CONFLICT
                normalized.contains("moving") || normalized.contains("noisy") -> SCALE_MOVING
                normalized.contains("outward") || normalized.contains("cam2") -> CAM2_OUTWARD_UNCONFIRMED
                normalized.contains("identity") || normalized.contains("add_unconfirmed") -> WEIGHT_ADD_UNCONFIRMED
                normalized.contains("simultaneous") -> SIMULTANEOUS_ACTIONS
                normalized.contains("disagreement") || normalized.contains("mismatch") -> CART_CAMERA_DISAGREEMENT
                else -> GENERIC_UNSCANNED
            }
        }
    }
}

/**
 * Trạng thái cảnh báo cảm biến đang hoạt động
 */
data class SensorAnomaly(
    val type: AnomalyType,
    val customTitle: String? = null,
    val customDescription: String? = null,
    val detectedAt: Long = System.currentTimeMillis()
) {
    val displayTitle: String get() = customTitle ?: type.title
    val displayDescription: String get() = customDescription ?: type.defaultDescription
    val actionGuide: String get() = type.actionGuide
    val primaryColor: Color get() = Color(type.primaryColor)
}
