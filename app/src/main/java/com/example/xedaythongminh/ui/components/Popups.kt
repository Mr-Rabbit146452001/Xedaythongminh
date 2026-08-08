package com.example.xedaythongminh.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import com.example.xedaythongminh.ui.theme.*
import com.example.xedaythongminh.R
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties

val ColorRedAlert = Color(0xFFD32F2F)
val ColorRedLight = Color(0xFFFFEBEE)

@Composable
fun UnscannedItemWarningDialog(
    onDismiss: () -> Unit,
    onScanNow: () -> Unit,
    onItemRemoved: () -> Unit,
    onSupport: () -> Unit
) {
    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(
            dismissOnBackPress = false,
            dismissOnClickOutside = false,
            usePlatformDefaultWidth = false // Cho phép custom width/height lớn hơn mặc định
        )
    ) {
        Surface(
            modifier = Modifier
                .width(800.dp)
                .height(450.dp)
                .clip(RoundedCornerShape(24.dp)),
            shape = RoundedCornerShape(24.dp),
            color = Color.White,
            shadowElevation = 24.dp
        ) {
            Row(modifier = Modifier.fillMaxSize()) {
                // LEFT SECTION: Alert Zone (Red)
                Column(
                    modifier = Modifier
                        .weight(0.4f)
                        .fillMaxHeight()
                        .background(ColorRedAlert)
                        .padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Box(
                        modifier = Modifier
                            .size(80.dp)
                            .background(Color.White, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.WarningAmber,
                            contentDescription = "Warning",
                            tint = ColorRedAlert,
                            modifier = Modifier.size(48.dp)
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(24.dp))
                    
                    Text(
                        text = "Phát hiện sản\nphẩm chưa quét",
                        color = Color.White,
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center,
                        lineHeight = 36.sp
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Text(
                        text = "Hệ thống phát hiện có sản phẩm được đặt vào xe nhưng chưa được quét mã. Vui lòng quét sản phẩm để tiếp tục.",
                        color = Color.White,
                        fontSize = 16.sp,
                        textAlign = TextAlign.Center,
                        lineHeight = 24.sp
                    )
                }

                // RIGHT SECTION: Details & Actions (White)
                Column(
                    modifier = Modifier
                        .weight(0.6f)
                        .fillMaxHeight()
                        .padding(32.dp),
                    verticalArrangement = Arrangement.SpaceBetween
                ) {
                    // Error Details Stack
                    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                        // Detail Box 1: Weight Scale
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .border(1.dp, ColorRedLight, RoundedCornerShape(12.dp))
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Scale, // Using Scale as fallback for Weight
                                contentDescription = "Weight",
                                tint = ColorRedAlert,
                                modifier = Modifier.size(32.dp)
                            )
                            Spacer(modifier = Modifier.width(16.dp))
                            Column {
                                Text(
                                    text = "Cân nặng thay đổi",
                                    color = ColorRedAlert,
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = "+0.45kg không khớp giỏ hàng",
                                    color = Color.Gray,
                                    fontSize = 14.sp
                                )
                            }
                        }

                        // Detail Box 2: Camera
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .border(1.dp, ColorRedLight, RoundedCornerShape(12.dp))
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.PhotoCamera,
                                contentDescription = "Camera",
                                tint = ColorRedAlert,
                                modifier = Modifier.size(32.dp)
                            )
                            Spacer(modifier = Modifier.width(16.dp))
                            Column {
                                Text(
                                    text = "Camera phát hiện vật phẩm lạ",
                                    color = ColorRedAlert,
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = "Vật phẩm chưa xác định ở góc trái",
                                    color = Color.Gray,
                                    fontSize = 14.sp
                                )
                            }
                        }
                    }

                    // Action Buttons Row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        // Button 1: Quét ngay
                        Button(
                            onClick = onScanNow,
                            modifier = Modifier.weight(1f).height(80.dp),
                            shape = RoundedCornerShape(16.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue)
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Icon(Icons.Default.QrCodeScanner, contentDescription = null, tint = Color.White)
                                Spacer(modifier = Modifier.height(4.dp))
                                Text("Quét ngay", color = Color.White, fontWeight = FontWeight.Bold)
                            }
                        }

                        // Button 2: Đã bỏ ra
                        OutlinedButton(
                            onClick = onItemRemoved,
                            modifier = Modifier.weight(1f).height(80.dp),
                            shape = RoundedCornerShape(16.dp),
                            border = androidx.compose.foundation.BorderStroke(2.dp, ColorRedAlert),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = ColorRedAlert)
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Icon(Icons.Default.RemoveShoppingCart, contentDescription = null, tint = ColorRedAlert)
                                Spacer(modifier = Modifier.height(4.dp))
                                Text("Đã bỏ ra", color = ColorRedAlert, fontWeight = FontWeight.Bold)
                            }
                        }

                        // Button 3: Hỗ trợ
                        Button(
                            onClick = onSupport,
                            modifier = Modifier.weight(1f).height(80.dp),
                            shape = RoundedCornerShape(16.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = ColorRedAlert)
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Icon(Icons.Default.SupportAgent, contentDescription = null, tint = Color.White)
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(stringResource(R.string.nav_support), color = Color.White, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Preview(showBackground = true, widthDp = 1280, heightDp = 800)
@Composable
fun WarningDialogPreview() {
    MaterialTheme {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.DarkGray)
        ) {
            UnscannedItemWarningDialog(
                onDismiss = {},
                onScanNow = {},
                onItemRemoved = {},
                onSupport = {}
            )
        }
    }
}

@Composable
fun RemoveItemConfirmDialog(
    itemName: String,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.DeleteOutline, contentDescription = null, tint = ColorRedAlert)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Xác nhận xoá sản phẩm", fontWeight = FontWeight.Bold, color = TextDark)
            }
        },
        text = {
            Text(
                "Bạn có chắc chắn muốn bỏ '$itemName' khỏi giỏ hàng không?",
                fontSize = 16.sp,
                color = TextGray
            )
        },
        confirmButton = {
            Button(
                onClick = onConfirm,
                colors = ButtonDefaults.buttonColors(containerColor = ColorRedAlert)
            ) {
                Text("Xoá khỏi giỏ", color = Color.White)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Hủy", color = TextGray)
            }
        },
        containerColor = Color.White,
        shape = RoundedCornerShape(16.dp)
    )
}

@Composable
fun TimeoutWarningDialog(
    onContinue: () -> Unit,
    onEndSession: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onContinue,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Timer, contentDescription = null, tint = PrimaryBlue)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Cảnh báo không hoạt động", fontWeight = FontWeight.Bold, color = TextDark)
            }
        },
        text = {
            Text(
                "Hệ thống nhận thấy bạn không có tương tác nào trong thời gian dài. Phiên mua sắm của bạn sẽ tự động kết thúc sau 60 giây nữa nếu không có thao tác.",
                fontSize = 16.sp,
                color = TextGray
            )
        },
        confirmButton = {
            Button(
                onClick = onContinue,
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue)
            ) {
                Text("Tiếp tục mua sắm", color = Color.White)
            }
        },
        dismissButton = {
            OutlinedButton(
                onClick = onEndSession,
                border = androidx.compose.foundation.BorderStroke(1.dp, PrimaryBlue),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = PrimaryBlue)
            ) {
                Text("Kết thúc phiên")
            }
        },
        containerColor = Color.White,
        shape = RoundedCornerShape(16.dp)
    )
}
