package com.example.xedaythongminh.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.xedaythongminh.data.models.CartItem
import com.example.xedaythongminh.ui.theme.*
import kotlinx.coroutines.delay

@Composable
fun RemoveProductDialog(
    cartItems: List<CartItem>,
    onBarcodeScanned: (String) -> Boolean,
    onDismiss: () -> Unit
) {
    var remainingSeconds by remember { mutableIntStateOf(15) }
    var scanInput by remember { mutableStateOf("") }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var successMessage by remember { mutableStateOf<String?>(null) }
    val initialTotalCount = remember { cartItems.sumOf { it.quantity } }
    val focusRequester = remember { FocusRequester() }

    // 1. Bộ đếm ngược 15 giây tự động đóng
    LaunchedEffect(Unit) {
        try {
            focusRequester.requestFocus()
        } catch (ignored: Exception) {}

        while (remainingSeconds > 0) {
            delay(1000L)
            remainingSeconds--
        }
        // Hết 15s -> Tự động đóng Popup và quay về màn hình giỏ hàng bình thường
        onDismiss()
    }

    // 2. Lắng nghe nếu giỏ hàng giảm sản phẩm (từ phần cứng hoặc server poller)
    val currentTotalCount = cartItems.sumOf { it.quantity }
    LaunchedEffect(currentTotalCount) {
        if (currentTotalCount < initialTotalCount) {
            successMessage = "Đã xóa sản phẩm khỏi giỏ hàng!"
            delay(500L)
            onDismiss()
        }
    }

    val animatedProgress by animateFloatAsState(
        targetValue = remainingSeconds / 15f,
        label = "countdown_progress"
    )

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(
            dismissOnBackPress = true,
            dismissOnClickOutside = false,
            usePlatformDefaultWidth = false
        )
    ) {
        Card(
            modifier = Modifier
                .widthIn(min = 480.dp, max = 600.dp)
                .padding(16.dp),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(8.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(28.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Biểu tượng máy quét mã vạch xóa món
                Box(
                    modifier = Modifier
                        .size(72.dp)
                        .background(Color(0xFFFFEBEE), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.QrCodeScanner,
                        contentDescription = "Quét để xóa",
                        tint = Color(0xFFD32F2F),
                        modifier = Modifier.size(38.dp)
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Huy hiệu trạng thái
                Box(
                    modifier = Modifier
                        .background(Color(0xFFFFEBEE), RoundedCornerShape(12.dp))
                        .padding(horizontal = 14.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = "CHẾ ĐỘ BỚT / XÓA SẢN PHẨM",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFC62828),
                        letterSpacing = 0.5.sp
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Dòng hướng dẫn chính xác theo yêu cầu
                Text(
                    text = "Vui lòng đưa mã vạch của sản phẩm vào máy quét để xóa",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextDark,
                    textAlign = TextAlign.Center,
                    lineHeight = 28.sp
                )

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "Đưa mã vạch của sản phẩm cần bỏ ra trước mắt đọc để hệ thống tự động bớt món khỏi giỏ hàng.",
                    fontSize = 14.sp,
                    color = TextGray,
                    textAlign = TextAlign.Center,
                    lineHeight = 20.sp
                )

                Spacer(modifier = Modifier.height(24.dp))

                // Thanh đếm ngược 15 giây
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFFF8F9FA), RoundedCornerShape(16.dp))
                        .padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Thời gian chờ quét:",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium,
                            color = TextDark
                        )
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Timer,
                                contentDescription = null,
                                tint = if (remainingSeconds <= 5) Color(0xFFD32F2F) else PrimaryBlue,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "${remainingSeconds}s",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (remainingSeconds <= 5) Color(0xFFD32F2F) else PrimaryBlue
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    LinearProgressIndicator(
                        progress = { animatedProgress },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(8.dp)
                            .clip(RoundedCornerShape(4.dp)),
                        color = if (remainingSeconds <= 5) Color(0xFFD32F2F) else PrimaryBlue,
                        trackColor = Color(0xFFE0E0E0)
                    )
                }

                // Thông báo kết quả quét
                if (errorMessage != null) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = errorMessage!!,
                        color = Color(0xFFD32F2F),
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        textAlign = TextAlign.Center
                    )
                }

                if (successMessage != null) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = successMessage!!,
                        color = Color(0xFF2ECC71),
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center
                    )
                }

                // Ô nhận mã vạch (tự động focus cho đầu đọc máy quét mã vạch HID / bàn phím)
                Spacer(modifier = Modifier.height(16.dp))
                OutlinedTextField(
                    value = scanInput,
                    onValueChange = { input ->
                        scanInput = input
                        if (input.contains("\n") || input.length >= 8) {
                            val code = input.replace("\n", "").trim()
                            if (code.isNotEmpty()) {
                                val success = onBarcodeScanned(code)
                                if (success) {
                                    successMessage = "Quét thành công! Đang xóa sản phẩm..."
                                    errorMessage = null
                                    onDismiss()
                                } else {
                                    errorMessage = "Mã vạch '$code' không có trong giỏ hàng!"
                                    scanInput = ""
                                }
                            }
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .focusRequester(focusRequester),
                    placeholder = { Text("Đang chờ quét mã vạch sản phẩm...", fontSize = 13.sp) },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = PrimaryBlue,
                        unfocusedBorderColor = BorderGray
                    ),
                    shape = RoundedCornerShape(10.dp),
                    trailingIcon = {
                        if (scanInput.isNotBlank()) {
                            IconButton(onClick = {
                                val code = scanInput.trim()
                                val success = onBarcodeScanned(code)
                                if (success) {
                                    onDismiss()
                                } else {
                                    errorMessage = "Mã vạch '$code' không có trong giỏ hàng!"
                                }
                            }) {
                                Icon(Icons.Default.Check, contentDescription = "Xóa", tint = PrimaryBlue)
                            }
                        }
                    }
                )

                Spacer(modifier = Modifier.height(20.dp))

                // Nút Hủy bỏ quay về giỏ hàng
                OutlinedButton(
                    onClick = onDismiss,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(46.dp),
                    shape = RoundedCornerShape(12.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, BorderGray)
                ) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Hủy",
                        tint = TextGray,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Hủy bỏ / Quay lại giỏ hàng",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = TextDark
                    )
                }
            }
        }
    }
}

@androidx.compose.ui.tooling.preview.Preview(showBackground = true, widthDp = 800, heightDp = 600, name = "Remove Product Dialog Preview")
@Composable
fun RemoveProductDialogPreview() {
    MaterialTheme {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            RemoveProductDialog(
                cartItems = emptyList(),
                onBarcodeScanned = { true },
                onDismiss = {}
            )
        }
    }
}

