package com.example.xedaythongminh.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.tooling.preview.Preview
import com.example.xedaythongminh.R

/**
 * OrganicGlassBackground: Hệ thống nền thủy tinh hữu cơ cao cấp (Organic Glassmorphism)
 * Thiết kế tối ưu cho máy tính bảng xe đẩy thông minh:
 * - Màu chủ đạo: #0D47A1 điểm xuyết góc dưới phải
 * - Làn sóng hữu cơ mềm mại góc trên bên trái với viền kính phản quang
 * - Vùng trung tâm cực kỳ trong sáng và thoáng mát giúp chữ, thẻ card và nút bấm có độ tương phản tối ưu
 */
@Composable
fun OrganicGlassBackground(
    modifier: Modifier = Modifier,
    content: @Composable BoxScope.() -> Unit
) {
    Box(
        modifier = modifier.fillMaxSize()
    ) {
        // 1. Lớp hình nền chính Organic Glassmorphism chất lượng cao
        Image(
            painter = painterResource(id = R.drawable.bg_tablet_organic_glass),
            contentDescription = null,
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop
        )

        // 2. Lớp phủ vi quang phổ tạo chiều sâu quang học thủy tinh mờ
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color.White.copy(alpha = 0.05f),
                            Color.Transparent,
                            Color(0xFF0D47A1).copy(alpha = 0.03f)
                        )
                    )
                )
        )

        // 3. Nội dung giao diện màn hình
        content()
    }
}

@Preview(
    showBackground = true,
    widthDp = 1280,
    heightDp = 800,
    name = "Tablet Landscape - Organic Glass Background"
)
@Composable
fun OrganicGlassBackgroundPreview() {
    OrganicGlassBackground {
        // Khung xem trước hình nền thực tế
    }
}
