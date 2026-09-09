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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.xedaythongminh.data.models.CartNotification
import com.example.xedaythongminh.data.models.NotificationType

@Composable
fun CartNotificationPill(
    notification: CartNotification?,
    modifier: Modifier = Modifier
) {
    AnimatedVisibility(
        visible = notification != null,
        enter = slideInVertically(initialOffsetY = { -it }) + fadeIn(),
        exit = slideOutVertically(targetOffsetY = { -it }) + fadeOut(),
        modifier = modifier
    ) {
        if (notification != null) {
            val isAdd = notification.type == NotificationType.ADD
            val iconColor = if (isAdd) Color(0xFF10B981) else Color(0xFFEF4444)
            val bgColor = if (isAdd) Color(0xFFECFDF5) else Color(0xFFFEF2F2)
            val borderColor = if (isAdd) Color(0xFFA7F3D0) else Color(0xFFFECACA)

            Card(
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = bgColor),
                modifier = Modifier
                    .shadow(elevation = 6.dp, shape = RoundedCornerShape(24.dp))
                    .border(width = 1.dp, color = borderColor, shape = RoundedCornerShape(24.dp))
                    .padding(horizontal = 4.dp)
            ) {
                Row(
                    modifier = Modifier
                        .padding(horizontal = 16.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Icon(
                        imageVector = if (isAdd) Icons.Default.AddCircle else Icons.Default.RemoveCircle,
                        contentDescription = if (isAdd) "Added" else "Removed",
                        tint = iconColor,
                        modifier = Modifier.size(22.dp)
                    )
                    Text(
                        text = notification.message,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF1E293B)
                    )
                }
            }
        }
    }
}
