package com.example.xedaythongminh.ui.components

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddCircle
import androidx.compose.material.icons.filled.RemoveCircle
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.xedaythongminh.data.models.CartNotification
import com.example.xedaythongminh.data.models.NotificationType

import androidx.compose.animation.core.tween
import androidx.compose.ui.zIndex

@Composable
fun CartNotificationPill(
    notification: CartNotification?,
    modifier: Modifier = Modifier
) {
    AnimatedVisibility(
        visible = notification != null,
        enter = slideInVertically(
            initialOffsetY = { -it / 2 },
            animationSpec = tween(300)
        ) + fadeIn(animationSpec = tween(300)),
        exit = slideOutVertically(
            targetOffsetY = { -it / 2 },
            animationSpec = tween(250)
        ) + fadeOut(animationSpec = tween(250)),
        modifier = modifier.zIndex(100f)
    ) {
        if (notification != null) {
            val isAdd = notification.type == NotificationType.ADD
            val iconColor = if (isAdd) Color(0xFF34D399) else Color(0xFFF87171)
            // Màu nền tương phản cao, nổi bật trên cả nền sáng và nền tối
            val bgColor = if (isAdd) Color(0xFF064E3B) else Color(0xFF7F1D1D)
            val borderColor = if (isAdd) Color(0xFF10B981) else Color(0xFFEF4444)

            Surface(
                shape = RoundedCornerShape(30.dp),
                color = bgColor,
                shadowElevation = 12.dp,
                border = androidx.compose.foundation.BorderStroke(1.5.dp, borderColor),
                modifier = Modifier.padding(horizontal = 8.dp)
            ) {
                Row(
                    modifier = Modifier
                        .padding(horizontal = 20.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Icon(
                        imageVector = if (isAdd) Icons.Default.AddCircle else Icons.Default.RemoveCircle,
                        contentDescription = if (isAdd) "Added" else "Removed",
                        tint = iconColor,
                        modifier = Modifier.size(24.dp)
                    )
                    Text(
                        text = notification.message,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        letterSpacing = 0.3.sp
                    )
                }
            }
        }
    }
}

@Preview(showBackground = true, name = "Notification - Item Added")
@Composable
fun CartNotificationPillAddPreview() {
    MaterialTheme {
        Box(modifier = Modifier.padding(16.dp)) {
            CartNotificationPill(
                notification = CartNotification(
                    message = "Đã thêm: Bơ sáp loại 1 (x1)",
                    productName = "Bơ sáp loại 1",
                    type = NotificationType.ADD
                )
            )
        }
    }
}

@Preview(showBackground = true, name = "Notification - Item Removed")
@Composable
fun CartNotificationPillRemovePreview() {
    MaterialTheme {
        Box(modifier = Modifier.padding(16.dp)) {
            CartNotificationPill(
                notification = CartNotification(
                    message = "Đã bớt: Bơ sáp loại 1 (x1)",
                    productName = "Bơ sáp loại 1",
                    type = NotificationType.REMOVE
                )
            )
        }
    }
}
