package com.example.xedaythongminh.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.CompareArrows
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.xedaythongminh.domain.model.AnomalyType
import com.example.xedaythongminh.domain.model.SensorAnomaly

/**
 * SensorAnomalyDialog: Màn hình pop-up cảnh báo thông minh các lỗi bất đồng bộ cảm biến & cân nặng
 * Thiết kế chuẩn Material 3 thích ứng linh hoạt theo từng mã lỗi từ hệ thống Edge AI & Loadcell.
 */
@Composable
fun SensorAnomalyDialog(
    anomaly: SensorAnomaly,
    onResolve: () -> Unit,
    onSecondaryAction: (() -> Unit)? = null
) {
    // Hiệu ứng nhịp đập cảnh báo
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 0.95f,
        targetValue = 1.08f,
        animationSpec = infiniteRepeatable(
            animation = tween(700, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "scale"
    )
    val pulseAlpha by infiniteTransition.animateFloat(
        initialValue = 0.25f,
        targetValue = 0.75f,
        animationSpec = infiniteRepeatable(
            animation = tween(700, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "alpha"
    )

    val primaryColor = anomaly.primaryColor
    val icon: ImageVector = when (anomaly.type) {
        AnomalyType.WEIGHT_OUT_OF_TOLERANCE -> Icons.Default.Warning
        AnomalyType.WEIGHT_DIRECTION_CONFLICT -> Icons.Default.SyncProblem
        AnomalyType.SCALE_MOVING -> Icons.Default.Sensors
        AnomalyType.CAM2_OUTWARD_UNCONFIRMED -> Icons.Default.RemoveShoppingCart
        AnomalyType.WEIGHT_ADD_UNCONFIRMED -> Icons.Default.AddShoppingCart
        AnomalyType.SIMULTANEOUS_ACTIONS -> Icons.AutoMirrored.Filled.CompareArrows
        AnomalyType.CART_CAMERA_DISAGREEMENT -> Icons.Default.VisibilityOff
        AnomalyType.GENERIC_UNSCANNED -> Icons.Default.Warning
    }

    Dialog(
        onDismissRequest = {}, // Khóa không cho đóng bằng click ra ngoài khi chưa xử lý
        properties = DialogProperties(
            dismissOnBackPress = false,
            dismissOnClickOutside = false,
            usePlatformDefaultWidth = false
        )
    ) {
        Card(
            modifier = Modifier
                .padding(24.dp)
                .widthIn(max = 520.dp)
                .fillMaxWidth(0.92f),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            border = BorderStroke(2.dp, primaryColor.copy(alpha = pulseAlpha)),
            elevation = CardDefaults.cardElevation(defaultElevation = 16.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // 1. Header: Icon nhịp đập & Badge phân loại lỗi
                Box(
                    modifier = Modifier
                        .size(64.dp)
                        .scale(pulseScale)
                        .background(primaryColor.copy(alpha = 0.12f), CircleShape)
                        .border(2.dp, primaryColor.copy(alpha = 0.6f), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = anomaly.type.name,
                        tint = primaryColor,
                        modifier = Modifier.size(34.dp)
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Badge Mã lỗi
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = primaryColor.copy(alpha = 0.1f),
                    border = BorderStroke(1.dp, primaryColor.copy(alpha = 0.3f))
                ) {
                    Text(
                        text = anomaly.type.badgeText,
                        color = primaryColor,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 3.dp),
                        letterSpacing = 0.5.sp
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                // 2. Tiêu đề cảnh báo
                Text(
                    text = anomaly.displayTitle,
                    color = primaryColor,
                    fontSize = 19.sp,
                    fontWeight = FontWeight.ExtraBold,
                    textAlign = TextAlign.Center,
                    lineHeight = 25.sp
                )

                Spacer(modifier = Modifier.height(14.dp))

                // 3. Khung mô tả chi tiết lỗi
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    color = Color(0xFFF8FAFC),
                    border = BorderStroke(1.dp, Color(0xFFE2E8F0))
                ) {
                    Text(
                        text = anomaly.displayDescription,
                        fontSize = 14.sp,
                        color = Color(0xFF334155),
                        textAlign = TextAlign.Center,
                        lineHeight = 21.sp,
                        modifier = Modifier.padding(14.dp)
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                // 4. Khung hướng dẫn hành động (Action Guide)
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    color = primaryColor.copy(alpha = 0.05f),
                    border = BorderStroke(1.dp, primaryColor.copy(alpha = 0.2f))
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.Top
                    ) {
                        Icon(
                            imageVector = Icons.Default.Lightbulb,
                            contentDescription = "Hướng dẫn",
                            tint = primaryColor,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "HƯỚNG DẪN XỬ LÝ:",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = primaryColor,
                                letterSpacing = 0.5.sp
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = anomaly.actionGuide,
                                fontSize = 13.sp,
                                color = Color(0xFF1E293B),
                                lineHeight = 19.sp
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // 5. Nút bấm tương tác
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = onResolve,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = primaryColor)
                    ) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = "Xác nhận",
                            tint = Color.White,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "ĐÃ KIỂM TRA & GIẢI QUYẾT",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }

                    if (onSecondaryAction != null) {
                        OutlinedButton(
                            onClick = onSecondaryAction,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(44.dp),
                            shape = RoundedCornerShape(12.dp),
                            border = BorderStroke(1.dp, Color(0xFFCBD5E1))
                        ) {
                            Text(
                                text = "ĐỐI SOÁT LẠI GIỎ HÀNG",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color(0xFF475569)
                            )
                        }
                    }
                }
            }
        }
    }
}
