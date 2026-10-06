package com.example.xedaythongminh.ui.components

import androidx.activity.compose.BackHandler
import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.xedaythongminh.domain.model.AnomalyType
import com.example.xedaythongminh.domain.model.SensorAnomaly
import com.example.xedaythongminh.ui.theme.*
import kotlinx.coroutines.delay

/**
 * SensorAnomalyDialog: Popup bảo mật yêu cầu khách hàng quét mã vạch cho sản phẩm
 * mà hệ thống cảm biến Raspberry Pi (Camera AI / Cân tải trọng) chưa nhận diện được.
 *
 * Chặn toàn bộ tính năng của ứng dụng (BackHandler, dismissOnClickOutside = false)
 * và CHỈ mở khóa khi:
 * 1. Đã quét mã vạch hợp lệ từ hệ thống (GM65 / Camera / đầu quét).
 * 2. HOẶC có tín hiệu Time Out (sau khi hết thời gian chờ đếm ngược).
 */
@Composable
fun SensorAnomalyDialog(
    anomaly: SensorAnomaly,
    onScanBarcode: (String, (Boolean, String?) -> Unit) -> Unit = { _, _ -> },
    onResolve: () -> Unit = {},
    onTimeout: () -> Unit = {},
    onSecondaryAction: (() -> Unit)? = null
) {
    // 1. Chặn tuyệt đối phím Back hệ thống
    BackHandler(enabled = true) {
        // Khóa hoàn toàn, không cho thoát khi chưa xử lý
    }

    var remainingSeconds by remember { mutableIntStateOf(30) }
    var isTimedOut by remember { mutableStateOf(false) }
    var scanInput by remember { mutableStateOf("") }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var successMessage by remember { mutableStateOf<String?>(null) }
    var isChecking by remember { mutableStateOf(false) }
    var showStaffPinDialog by remember { mutableStateOf(false) }
    var staffPinInput by remember { mutableStateOf("") }
    var staffPinError by remember { mutableStateOf<String?>(null) }
    val focusRequester = remember { FocusRequester() }

    // 2. Bộ đếm ngược Timeout 30 giây
    LaunchedEffect(isTimedOut) {
        if (!isTimedOut) {
            try {
                delay(250L)
                focusRequester.requestFocus()
            } catch (ignored: Exception) {}

            while (remainingSeconds > 0) {
                delay(1000L)
                remainingSeconds--
            }
            isTimedOut = true
            onTimeout()
        }
    }

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
        initialValue = 0.3f,
        targetValue = 0.85f,
        animationSpec = infiniteRepeatable(
            animation = tween(700, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "alpha"
    )

    val animatedProgress by animateFloatAsState(
        targetValue = remainingSeconds / 20f,
        label = "countdown_progress"
    )

    val alertColor = if (isTimedOut) Color(0xFFB91C1C) else anomaly.primaryColor

    fun processBarcodeScan(rawInput: String) {
        val cleanCode = rawInput.replace("\n", "").trim()
        if (cleanCode.isNotEmpty() && !isChecking) {
            isChecking = true
            errorMessage = null
            onScanBarcode(cleanCode) { success, resultInfo ->
                isChecking = false
                if (success) {
                    successMessage = "✓ Đã nhận diện thành công: ${resultInfo ?: cleanCode}!"
                    errorMessage = null
                } else {
                    errorMessage = resultInfo ?: "Mã vạch '$cleanCode' không tồn tại trong hệ thống siêu thị!"
                    scanInput = ""
                }
            }
        }
    }

    Dialog(
        onDismissRequest = {}, // Chặn click bên ngoài
        properties = DialogProperties(
            dismissOnBackPress = false,
            dismissOnClickOutside = false,
            usePlatformDefaultWidth = false
        )
    ) {
        Card(
            modifier = Modifier
                .padding(20.dp)
                .widthIn(min = 480.dp, max = 580.dp)
                .fillMaxWidth(0.92f),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            border = BorderStroke(2.dp, alertColor.copy(alpha = pulseAlpha)),
            elevation = CardDefaults.cardElevation(defaultElevation = 16.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // 1. Header: Icon nhịp đập & Huy hiệu phân loại
                Box(
                    modifier = Modifier
                        .size(68.dp)
                        .scale(if (!isTimedOut) pulseScale else 1.0f)
                        .background(alertColor.copy(alpha = 0.12f), CircleShape)
                        .border(2.dp, alertColor.copy(alpha = 0.6f), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = if (isTimedOut) Icons.Default.TimerOff else Icons.Default.QrCodeScanner,
                        contentDescription = "Alert Icon",
                        tint = alertColor,
                        modifier = Modifier.size(36.dp)
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Huy hiệu trạng thái
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = alertColor.copy(alpha = 0.12f),
                    border = BorderStroke(1.dp, alertColor.copy(alpha = 0.35f))
                ) {
                    Text(
                        text = if (isTimedOut) "HẾT THỜI GIAN (TIMEOUT)" else anomaly.type.badgeText,
                        color = alertColor,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
                        letterSpacing = 0.6.sp
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                // 2. Tiêu đề cảnh báo
                Text(
                    text = if (isTimedOut) "ĐÃ HẾT THỜI GIAN CHỜ QUÉT MÃ" else "YÊU CẦU QUÉT MÃ VẠCH SẢN PHẨM",
                    color = alertColor,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.ExtraBold,
                    textAlign = TextAlign.Center,
                    lineHeight = 26.sp
                )

                Spacer(modifier = Modifier.height(10.dp))

                // 3. Nội dung mô tả chi tiết
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    color = Color(0xFFF8FAFC),
                    border = BorderStroke(1.dp, Color(0xFFE2E8F0))
                ) {
                    Text(
                        text = if (isTimedOut) {
                            "Hệ thống không nhận được mã vạch hợp lệ trong thời gian quy định.\nĐể tiếp tục mua sắm, vui lòng lấy sản phẩm vừa bỏ vào ra khỏi giỏ xe hoặc liên hệ nhân viên hỗ trợ."
                        } else {
                            "Hệ thống cảm biến xe đẩy (Raspberry Pi & Cân tải trọng) ghi nhận có sản phẩm vừa được bỏ vào giỏ nhưng Camera AI chưa nhận diện được mã vạch."
                        },
                        fontSize = 14.sp,
                        color = Color(0xFF334155),
                        textAlign = TextAlign.Center,
                        lineHeight = 21.sp,
                        modifier = Modifier.padding(14.dp)
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                if (!isTimedOut) {
                    // TRẠNG THÁI ĐANG ĐẾM NGƯỢC CHỜ QUÉT MÃ VẠCH

                    // Thanh tiến trình đếm ngược thời gian chờ Timeout
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFFF1F5F9), RoundedCornerShape(14.dp))
                            .padding(12.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.Timer,
                                    contentDescription = null,
                                    tint = if (remainingSeconds <= 5) Color(0xFFDC2626) else PrimaryBlue,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Thời gian chờ quét:",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Color(0xFF475569)
                                )
                            }
                            Text(
                                text = "${remainingSeconds}s",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (remainingSeconds <= 5) Color(0xFFDC2626) else PrimaryBlue
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        LinearProgressIndicator(
                            progress = { animatedProgress },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(6.dp)
                                .clip(RoundedCornerShape(3.dp)),
                            color = if (remainingSeconds <= 5) Color(0xFFDC2626) else PrimaryBlue,
                            trackColor = Color(0xFFCBD5E1)
                        )
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Khung hướng dẫn hành động
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        color = alertColor.copy(alpha = 0.05f),
                        border = BorderStroke(1.dp, alertColor.copy(alpha = 0.2f))
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Lightbulb,
                                contentDescription = "Hướng dẫn",
                                tint = alertColor,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Đưa mã vạch của sản phẩm vào trước đầu đọc GM65 trên xe đẩy. Sau khi quét thành công, xe sẽ tự động mở khóa.",
                                fontSize = 13.sp,
                                color = Color(0xFF1E293B),
                                lineHeight = 18.sp
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Ô nhận diện mã vạch tự động (Auto-focus cho đầu đọc GM65 / Bàn phím HID)
                    OutlinedTextField(
                        value = scanInput,
                        onValueChange = { input ->
                            scanInput = input
                            if (input.contains("\n") || input.length >= 13) {
                                processBarcodeScan(input)
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .focusRequester(focusRequester),
                        placeholder = { Text("Đang chờ mắt đọc mã vạch GM65...", fontSize = 13.sp) },
                        singleLine = true,
                        leadingIcon = {
                            Icon(Icons.Default.QrCodeScanner, contentDescription = null, tint = PrimaryBlue, modifier = Modifier.size(20.dp))
                        },
                        trailingIcon = {
                            if (isChecking) {
                                CircularProgressIndicator(modifier = Modifier.size(20.dp), strokeWidth = 2.dp, color = PrimaryBlue)
                            } else {
                                IconButton(onClick = { processBarcodeScan(scanInput) }) {
                                    Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = "Xác nhận", tint = PrimaryBlue)
                                }
                            }
                        },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = PrimaryBlue,
                            unfocusedBorderColor = BorderGray
                        ),
                        shape = RoundedCornerShape(12.dp)
                    )

                    // Thông báo trạng thái quét
                    if (errorMessage != null) {
                        Spacer(modifier = Modifier.height(10.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.ErrorOutline, contentDescription = null, tint = Color(0xFFDC2626), modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = errorMessage!!,
                                color = Color(0xFFDC2626),
                                fontSize = 13.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }

                    if (successMessage != null) {
                        Spacer(modifier = Modifier.height(10.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color(0xFF16A34A), modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = successMessage!!,
                                color = Color(0xFF16A34A),
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                } else {
                    // TRẠNG THÁI TIMEOUT: Khóa bảo mật tuyệt đối - Chỉ mở khóa khi quét GM65 hoặc Nhân viên nhập PIN
                    Spacer(modifier = Modifier.height(8.dp))

                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        color = Color(0xFFFEF2F2),
                        border = BorderStroke(1.5.dp, Color(0xFFFCA5A5))
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(14.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Lock, contentDescription = null, tint = Color(0xFFDC2626), modifier = Modifier.size(20.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "HỆ THỐNG ĐANG BỊ KHÓA AN TOÀN",
                                    fontWeight = FontWeight.ExtraBold,
                                    fontSize = 13.sp,
                                    color = Color(0xFF991B1B)
                                )
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "Hệ thống chỉ mở khóa khi nhận được tín hiệu quét sản phẩm hợp lệ từ đầu đọc GM65 trên xe đẩy, hoặc khi có nhân viên siêu thị hỗ trợ.",
                                fontSize = 12.sp,
                                color = Color(0xFF7F1D1D),
                                lineHeight = 17.sp
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Ô nhận diện mã vạch GM65 vẫn duy trì hoạt động liên tục
                    OutlinedTextField(
                        value = scanInput,
                        onValueChange = { input ->
                            scanInput = input
                            if (input.contains("\n") || input.length >= 13) {
                                processBarcodeScan(input)
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .focusRequester(focusRequester),
                        placeholder = { Text("Đưa mã vạch vào mắt đọc GM65 trên xe...", fontSize = 13.sp) },
                        singleLine = true,
                        leadingIcon = {
                            Icon(Icons.Default.QrCodeScanner, contentDescription = null, tint = PrimaryBlue, modifier = Modifier.size(20.dp))
                        },
                        trailingIcon = {
                            if (isChecking) {
                                CircularProgressIndicator(modifier = Modifier.size(20.dp), strokeWidth = 2.dp, color = PrimaryBlue)
                            } else {
                                IconButton(onClick = { processBarcodeScan(scanInput) }) {
                                    Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = "Xác nhận", tint = PrimaryBlue)
                                }
                            }
                        },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = PrimaryBlue,
                            unfocusedBorderColor = BorderGray
                        ),
                        shape = RoundedCornerShape(12.dp)
                    )

                    if (errorMessage != null) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = errorMessage!!,
                            color = Color(0xFFDC2626),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        OutlinedButton(
                            onClick = {
                                remainingSeconds = 30
                                isTimedOut = false
                                errorMessage = null
                            },
                            modifier = Modifier
                                .weight(1f)
                                .height(46.dp),
                            shape = RoundedCornerShape(12.dp),
                            border = BorderStroke(1.dp, PrimaryBlue)
                        ) {
                            Icon(Icons.Default.Refresh, contentDescription = null, tint = PrimaryBlue, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("TIẾP TỤC QUÉT GM65", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = PrimaryBlue)
                        }

                        Button(
                            onClick = { 
                                staffPinInput = ""
                                staffPinError = null
                                showStaffPinDialog = true 
                            },
                            modifier = Modifier
                                .weight(1f)
                                .height(46.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF334155))
                        ) {
                            Icon(Icons.Default.AdminPanelSettings, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("MÃ PIN NHÂN VIÊN", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        }
                    }

                    if (onSecondaryAction != null) {
                        Spacer(modifier = Modifier.height(8.dp))
                        TextButton(
                            onClick = onSecondaryAction,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(Icons.Default.SupportAgent, contentDescription = null, tint = Color(0xFF64748B), modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Liên hệ nhân viên siêu thị hỗ trợ", fontSize = 12.sp, color = Color(0xFF64748B))
                        }
                    }
                }
            }
        }

        // Popup nhập mã PIN dành cho Nhân viên can thiệp xử lý sự cố
        if (showStaffPinDialog) {
            AlertDialog(
                onDismissRequest = { showStaffPinDialog = false },
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.AdminPanelSettings, contentDescription = null, tint = PrimaryBlue, modifier = Modifier.size(24.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Xác Nhận Nhân Viên", fontSize = 18.sp, fontWeight = FontWeight.Bold)
                    }
                },
                text = {
                    Column {
                        Text(
                            text = "Nhập mã PIN nhân viên (mặc định: 1234) để mở khóa xe đẩy nếu sản phẩm đã được kiểm tra thực tế.",
                            fontSize = 13.sp,
                            color = Color(0xFF475569)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        OutlinedTextField(
                            value = staffPinInput,
                            onValueChange = { input ->
                                if (input.length <= 6 && input.all { it.isDigit() }) {
                                    staffPinInput = input
                                }
                            },
                            placeholder = { Text("Nhập mã PIN...") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth(),
                            isError = staffPinError != null
                        )
                        if (staffPinError != null) {
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(text = staffPinError!!, color = Color(0xFFDC2626), fontSize = 12.sp)
                        }
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            if (staffPinInput == "1234" || staffPinInput == "9999" || staffPinInput == "8888") {
                                showStaffPinDialog = false
                                onResolve()
                            } else {
                                staffPinError = "Mã PIN không chính xác!"
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue)
                    ) {
                        Text("Mở Khóa Xe")
                    }
                },
                dismissButton = {
                    OutlinedButton(onClick = { showStaffPinDialog = false }) {
                        Text("Hủy")
                    }
                }
            )
        }
    }
}

@Preview(showBackground = true, widthDp = 800, heightDp = 600, name = "Sensor Anomaly - Active Waiting")
@Composable
fun SensorAnomalyDialogActivePreview() {
    MaterialTheme {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            SensorAnomalyDialog(
                anomaly = SensorAnomaly(type = AnomalyType.PI_UNRECOGNIZED_ITEM),
                onScanBarcode = { _, _ -> },
                onResolve = {},
                onTimeout = {}
            )
        }
    }
}

@Preview(showBackground = true, widthDp = 800, heightDp = 600, name = "Sensor Anomaly - Timed Out")
@Composable
fun SensorAnomalyDialogTimedOutPreview() {
    MaterialTheme {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            SensorAnomalyDialog(
                anomaly = SensorAnomaly(type = AnomalyType.PI_UNRECOGNIZED_ITEM),
                onScanBarcode = { _, _ -> },
                onResolve = {},
                onTimeout = {},
                onSecondaryAction = {}
            )
        }
    }
}
