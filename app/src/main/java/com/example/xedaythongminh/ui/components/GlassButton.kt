package com.example.xedaythongminh.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.LocalContentColor
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ProvideTextStyle
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material3.ripple
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.xedaythongminh.ui.theme.PrimaryBlue

/**
 * Các biến thể phong cách Glassmorphism cho GlassButton
 */
enum class GlassButtonVariant {
    /** Kính Xanh Sapphire - CTA chính */
    Primary,
    /** Thủy tinh mờ tuyết trắng - Hành động phụ */
    Secondary,
    /** Kính Ruby Đỏ - Xóa món, Hủy phiên, Cảnh báo nguy hiểm */
    Danger,
    /** Kính Ngọc Lục Bảo - Xác nhận thành công, Đã thanh toán */
    Success,
    /** Viền Kính Pha Lê Mảnh - Trong suốt tinh tế */
    Ghost
}

/**
 * Nút bấm cao cấp theo ngôn ngữ thiết kế Glassmorphism
 * Kết hợp hiệu ứng Gradient Shift và Liquid Fill khi chạm (Press/Hold interaction).
 */
@Composable
fun GlassButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    variant: GlassButtonVariant = GlassButtonVariant.Primary,
    shape: Shape = RoundedCornerShape(16.dp),
    contentPadding: PaddingValues = PaddingValues(horizontal = 24.dp, vertical = 14.dp),
    interactionSource: MutableInteractionSource = remember { MutableInteractionSource() },
    content: @Composable RowScope.() -> Unit
) {
    val isPressed by interactionSource.collectIsPressedAsState()

    // 1. Tactile Press Spring Scale (Nhún đàn hồi chân thực khi bấm)
    val animatedScale by animateFloatAsState(
        targetValue = if (isPressed && enabled) 0.965f else 1.0f,
        animationSpec = spring(
            dampingRatio = Spring.DampingRatioMediumBouncy,
            stiffness = Spring.StiffnessLow
        ),
        label = "glass_button_scale"
    )

    // 2. Liquid Fill / Gradient Shift Progress (Dòng chảy chất lỏng & dịch chuyển quang phổ)
    val liquidProgress by animateFloatAsState(
        targetValue = if (isPressed && enabled) 1.0f else 0.0f,
        animationSpec = tween(
            durationMillis = 350,
            easing = FastOutSlowInEasing
        ),
        label = "glass_liquid_progress"
    )

    // Cấu hình bảng màu Gradient theo từng biến thể
    val (baseColors, activeColors, specularBorderColors, textColor) = when (variant) {
        GlassButtonVariant.Primary -> {
            val base = listOf(
                Color(0xFF0D47A1).copy(alpha = 0.92f),
                Color(0xFF1976D2).copy(alpha = 0.88f),
                Color(0xFF0288D1).copy(alpha = 0.94f)
            )
            val active = listOf(
                Color(0xFF0A3880).copy(alpha = 0.98f),
                Color(0xFF0091EA).copy(alpha = 0.95f),
                Color(0xFF00E5FF).copy(alpha = 0.92f)
            )
            val border = listOf(
                Color.White.copy(alpha = 0.65f),
                Color(0xFF80D8FF).copy(alpha = 0.40f),
                Color.White.copy(alpha = 0.15f)
            )
            Quadruple(base, active, border, Color.White)
        }
        GlassButtonVariant.Secondary -> {
            val base = listOf(
                Color.White.copy(alpha = 0.85f),
                Color(0xFFF0F4F8).copy(alpha = 0.75f),
                Color(0xFFE2E8F0).copy(alpha = 0.80f)
            )
            val active = listOf(
                Color.White.copy(alpha = 0.95f),
                Color(0xFFE3F2FD).copy(alpha = 0.90f),
                Color(0xFFBBDEFB).copy(alpha = 0.85f)
            )
            val border = listOf(
                Color.White.copy(alpha = 0.90f),
                Color(0xFFCBD5E1).copy(alpha = 0.50f),
                Color.White.copy(alpha = 0.30f)
            )
            Quadruple(base, active, border, PrimaryBlue)
        }
        GlassButtonVariant.Danger -> {
            val base = listOf(
                Color(0xFFC62828).copy(alpha = 0.92f),
                Color(0xFFD32F2F).copy(alpha = 0.88f),
                Color(0xFFE53935).copy(alpha = 0.94f)
            )
            val active = listOf(
                Color(0xFFB71C1C).copy(alpha = 0.98f),
                Color(0xFFF44336).copy(alpha = 0.95f),
                Color(0xFFFF8A80).copy(alpha = 0.92f)
            )
            val border = listOf(
                Color.White.copy(alpha = 0.60f),
                Color(0xFFFF8A80).copy(alpha = 0.35f),
                Color.White.copy(alpha = 0.15f)
            )
            Quadruple(base, active, border, Color.White)
        }
        GlassButtonVariant.Success -> {
            val base = listOf(
                Color(0xFF00796B).copy(alpha = 0.92f),
                Color(0xFF2E7D32).copy(alpha = 0.88f),
                Color(0xFF388E3C).copy(alpha = 0.94f)
            )
            val active = listOf(
                Color(0xFF004D40).copy(alpha = 0.98f),
                Color(0xFF43A047).copy(alpha = 0.95f),
                Color(0xFF69F0AE).copy(alpha = 0.92f)
            )
            val border = listOf(
                Color.White.copy(alpha = 0.65f),
                Color(0xFFB9F6CA).copy(alpha = 0.40f),
                Color.White.copy(alpha = 0.20f)
            )
            Quadruple(base, active, border, Color.White)
        }
        GlassButtonVariant.Ghost -> {
            val base = listOf(
                Color.White.copy(alpha = 0.12f),
                Color.White.copy(alpha = 0.05f)
            )
            val active = listOf(
                Color(0xFF0D47A1).copy(alpha = 0.18f),
                Color(0xFF1976D2).copy(alpha = 0.10f)
            )
            val border = listOf(
                PrimaryBlue.copy(alpha = 0.60f),
                PrimaryBlue.copy(alpha = 0.25f)
            )
            Quadruple(base, active, border, PrimaryBlue)
        }
    }

    // Pha trộn màu sắc mượt mà theo Liquid Progress
    val interpolatedColors = remember(liquidProgress, baseColors, activeColors) {
        baseColors.zip(activeColors).map { (from, to) ->
            Color(
                red = from.red + (to.red - from.red) * liquidProgress,
                green = from.green + (to.green - from.green) * liquidProgress,
                blue = from.blue + (to.blue - from.blue) * liquidProgress,
                alpha = from.alpha + (to.alpha - from.alpha) * liquidProgress
            )
        }
    }

    // Hiệu ứng bóng đổ mềm Glassmorphism Glow
    val glowColor = remember(variant, isPressed) {
        when (variant) {
            GlassButtonVariant.Primary -> if (isPressed) Color(0xFF00B0FF).copy(alpha = 0.45f) else Color(0xFF0D47A1).copy(alpha = 0.25f)
            GlassButtonVariant.Danger -> if (isPressed) Color(0xFFFF5252).copy(alpha = 0.45f) else Color(0xFFD32F2F).copy(alpha = 0.25f)
            GlassButtonVariant.Success -> if (isPressed) Color(0xFF00E676).copy(alpha = 0.45f) else Color(0xFF2E7D32).copy(alpha = 0.25f)
            else -> Color.Black.copy(alpha = if (isPressed) 0.12f else 0.06f)
        }
    }

    Box(
        modifier = modifier
            .scale(animatedScale)
            .shadow(
                elevation = if (isPressed) 10.dp else 4.dp,
                shape = shape,
                spotColor = glowColor,
                ambientColor = glowColor
            )
            .clip(shape)
            .border(
                border = BorderStroke(
                    width = 1.25.dp,
                    brush = Brush.linearGradient(
                        colors = specularBorderColors,
                        start = Offset(0f, 0f),
                        end = Offset(Float.POSITIVE_INFINITY, Float.POSITIVE_INFINITY)
                    )
                ),
                shape = shape
            )
            .drawBehind {
                // Lớp 1: Nền chuyển sắc chính (Glass Body) với góc xoay chuyển động chất lỏng
                val shiftOffset = liquidProgress * size.width * 0.45f
                drawRect(
                    brush = Brush.linearGradient(
                        colors = interpolatedColors,
                        start = Offset(x = -shiftOffset, y = 0f),
                        end = Offset(x = size.width + shiftOffset, y = size.height)
                    )
                )

                // Lớp 2: Specular Top Sheen (Vệt phản quang mặt kính cong sang trọng)
                drawRect(
                    brush = Brush.verticalGradient(
                        colors = listOf(
                            Color.White.copy(alpha = if (variant == GlassButtonVariant.Secondary) 0.35f else 0.20f),
                            Color.White.copy(alpha = 0.02f),
                            Color.Transparent
                        ),
                        startY = 0f,
                        endY = size.height * 0.55f
                    )
                )

                // Lớp 3: Liquid Fill Wave Bloom khi chạm giữ
                if (liquidProgress > 0f) {
                    val radius = size.maxDimension * (0.6f + liquidProgress * 0.4f)
                    drawCircle(
                        brush = Brush.radialGradient(
                            colors = listOf(
                                Color.White.copy(alpha = 0.25f * liquidProgress),
                                Color.Transparent
                            ),
                            center = center,
                            radius = radius
                        ),
                        center = center,
                        radius = radius
                    )
                }
            }
            .clickable(
                interactionSource = interactionSource,
                indication = ripple(bounded = true, color = Color.White.copy(alpha = 0.3f)),
                enabled = enabled,
                role = Role.Button,
                onClick = onClick
            ),
        contentAlignment = Alignment.Center
    ) {
        CompositionLocalProvider(
            LocalContentColor provides if (enabled) textColor else textColor.copy(alpha = 0.45f)
        ) {
            ProvideTextStyle(
                value = TextStyle(
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 16.sp,
                    letterSpacing = 0.3.sp
                )
            ) {
                Row(
                    modifier = Modifier.padding(contentPadding),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically,
                    content = content
                )
            }
        }
    }
}

/**
 * Nút biểu tượng kính trong suốt (Glass Icon Button)
 */
@Composable
fun GlassIconButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    size: Dp = 48.dp,
    variant: GlassButtonVariant = GlassButtonVariant.Secondary,
    interactionSource: MutableInteractionSource = remember { MutableInteractionSource() },
    content: @Composable () -> Unit
) {
    GlassButton(
        onClick = onClick,
        modifier = modifier.size(size),
        enabled = enabled,
        variant = variant,
        shape = CircleShape,
        contentPadding = PaddingValues(0.dp),
        interactionSource = interactionSource
    ) {
        content()
    }
}

private data class Quadruple<A, B, C, D>(
    val first: A,
    val second: B,
    val third: C,
    val fourth: D
)

@Preview(showBackground = true, widthDp = 500, heightDp = 460, name = "GlassButton - All Variants")
@Composable
fun GlassButtonVariantsPreview() {
    MaterialTheme {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            GlassButton(
                onClick = {},
                modifier = Modifier.fillMaxWidth().height(52.dp),
                variant = GlassButtonVariant.Primary
            ) {
                Icon(Icons.Default.ShoppingCart, contentDescription = null, modifier = Modifier.size(20.dp), tint = Color.White)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Primary - Bắt đầu mua sắm", color = Color.White)
            }

            GlassButton(
                onClick = {},
                modifier = Modifier.fillMaxWidth().height(52.dp),
                variant = GlassButtonVariant.Secondary
            ) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null, modifier = Modifier.size(20.dp), tint = PrimaryBlue)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Secondary - Quay lại trang trước", color = PrimaryBlue)
            }

            GlassButton(
                onClick = {},
                modifier = Modifier.fillMaxWidth().height(52.dp),
                variant = GlassButtonVariant.Danger
            ) {
                Icon(Icons.Default.DeleteOutline, contentDescription = null, modifier = Modifier.size(20.dp), tint = Color.White)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Danger - Bớt sản phẩm / Xóa món", color = Color.White)
            }

            GlassButton(
                onClick = {},
                modifier = Modifier.fillMaxWidth().height(52.dp),
                variant = GlassButtonVariant.Success
            ) {
                Icon(Icons.Default.CheckCircle, contentDescription = null, modifier = Modifier.size(20.dp), tint = Color.White)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Success - Xác nhận thanh toán", color = Color.White)
            }

            GlassButton(
                onClick = {},
                modifier = Modifier.fillMaxWidth().height(52.dp),
                variant = GlassButtonVariant.Ghost
            ) {
                Icon(Icons.Default.AddShoppingCart, contentDescription = null, modifier = Modifier.size(20.dp), tint = PrimaryBlue)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Ghost - Tiếp tục mua sắm", color = PrimaryBlue)
            }
        }
    }
}

@Preview(showBackground = true, widthDp = 350, heightDp = 100, name = "GlassIconButton - Round")
@Composable
fun GlassIconButtonPreview() {
    MaterialTheme {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            GlassIconButton(onClick = {}, variant = GlassButtonVariant.Primary) {
                Icon(Icons.Default.Add, contentDescription = "Add", tint = Color.White)
            }
            GlassIconButton(onClick = {}, variant = GlassButtonVariant.Secondary) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = PrimaryBlue)
            }
            GlassIconButton(onClick = {}, variant = GlassButtonVariant.Danger) {
                Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color.White)
            }
            GlassIconButton(onClick = {}, variant = GlassButtonVariant.Success) {
                Icon(Icons.Default.Check, contentDescription = "Check", tint = Color.White)
            }
        }
    }
}
