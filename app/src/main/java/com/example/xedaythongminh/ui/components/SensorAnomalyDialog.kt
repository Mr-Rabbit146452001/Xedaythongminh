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
 * 2. HOẶC nhận diện mở khóa tự động từ Raspberry Pi qua Server polling.
 * 3. HOẶC nhân viên siêu thị can thiệp bằng Mã PIN quản trị (Staff Override PIN).
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
        // Khóa hoàn toàn, không cho thoát khi chưa xử lý quét mã vạch
    }

    var scanInput by remember { mutableStateOf("") }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var successMessage by remember { mutableStateOf<String?>(null) }
    var isChecking by remember { mutableStateOf(false) }
    var showStaffPinDialog by remember { mutableStateOf(false) }
    var staffPinInput by remember { mutableStateOf("") }
    var staffPinError by remember { mutableStateOf<String?>(null) }
    val focusRequester = remember { FocusRequester() }

    // Tự động focus để sẵn sàng đón nhận mã vạch từ đầu đọc GM65 / HID wedge
    LaunchedEffect(Unit) {
        try {
            delay(250L)
            focusRequester.requestFocus()
        } catch (ignored: Exception) {}
    }

    // Hiệu ứng nhịp đập cảnh báo & radar beacon
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
        SensorAnomalyDialogContent(
            anomaly = anomaly,
            scanInput = scanInput,
            onScanInputChange = { input ->
                scanInput = input
                if (input.contains("\n") || input.length >= 13) {
                    processBarcodeScan(input)
                }
            },
            onConfirmScan = { processBarcodeScan(scanInput) },
            errorMessage = errorMessage,
            successMessage = successMessage,
            isChecking = isChecking,
            focusRequester = focusRequester,
            pulseScale = pulseScale,
            pulseAlpha = pulseAlpha,
            onRequestStaffPin = {
                staffPinInput = ""
                staffPinError = null
                showStaffPinDialog = true
            },
            onSecondaryAction = onSecondaryAction
        )
    }

    // Popup nhập mã PIN dành cho Nhân viên can thiệp xử lý sự cố
    if (showStaffPinDialog) {
        StaffPinDialog(
            pinInput = staffPinInput,
            onPinInputChange = { input ->
                if (input.length <= 6 && input.all { it.isDigit() }) {
                    staffPinInput = input
                }
            },
            errorMessage = staffPinError,
            onConfirm = {
                if (staffPinInput == "1234" || staffPinInput == "9999" || staffPinInput == "8888") {
                    showStaffPinDialog = false
                    onResolve()
                } else {
                    staffPinError = "Mã PIN không chính xác!"
                }
            },
            onDismiss = { showStaffPinDialog = false }
        )
    }
}

/**
 * SensorAnomalyDialogContent: Component nội dung chính của Popup cảnh báo
 * Thời gian quét GM65 là không giới hạn, hiển thị "Đang chờ quét mã vạch", không nhảy sang màn hình khóa bảo mật.
 */
@Composable
fun SensorAnomalyDialogContent(
    anomaly: SensorAnomaly,
    scanInput: String = "",
    onScanInputChange: (String) -> Unit = {},
    onConfirmScan: () -> Unit = {},
    errorMessage: String? = null,
    successMessage: String? = null,
    isChecking: Boolean = false,
    focusRequester: FocusRequester? = null,
    pulseScale: Float = 1.0f,
    pulseAlpha: Float = 0.85f,
    onRequestStaffPin: () -> Unit = {},
    onSecondaryAction: (() -> Unit)? = null
) {
    val alertColor = anomaly.primaryColor

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
                    .scale(pulseScale)
                    .background(alertColor.copy(alpha = 0.12f), CircleShape)
                    .border(2.dp, alertColor.copy(alpha = 0.6f), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.QrCodeScanner,
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
                    text = anomaly.type.badgeText,
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
                text = anomaly.displayTitle,
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
                    text = anomaly.displayDescription,
                    fontSize = 14.sp,
                    color = Color(0xFF334155),
                    textAlign = TextAlign.Center,
                    lineHeight = 21.sp,
                    modifier = Modifier.padding(14.dp)
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            // 4. Khung trạng thái không giới hạn thời gian: "Đang chờ quét mã vạch"
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                color = LightBlueBg.copy(alpha = 0.6f),
                border = BorderStroke(1.5.dp, PrimaryBlue.copy(alpha = 0.35f))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.weight(1f)
                    ) {
                        // Vòng tròn nhấp nháy phát tín hiệu
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .scale(pulseScale)
                                .background(PrimaryBlue.copy(alpha = 0.18f), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(12.dp)
                                    .background(PrimaryBlue, CircleShape)
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = "Đang chờ quét mã vạch",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = PrimaryBlue
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "Thời gian quét: Không giới hạn",
                                fontSize = 12.sp,
                                color = Color(0xFF475569)
                            )
                        }
                    }

                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = PrimaryBlue.copy(alpha = 0.1f),
                        border = BorderStroke(1.dp, PrimaryBlue.copy(alpha = 0.25f))
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.QrCodeScanner,
                                contentDescription = null,
                                tint = PrimaryBlue,
                                modifier = Modifier.size(15.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "GM65 Live",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = PrimaryBlue
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // 5. Khung hướng dẫn hành động
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
                        text = anomaly.actionGuide,
                        fontSize = 13.sp,
                        color = Color(0xFF1E293B),
                        lineHeight = 18.sp
                    )
                }
            }

            // 6. Ô nhận diện mã vạch tự động (Auto-focus cho đầu đọc GM65 / Bàn phím HID)
            val tfModifier = if (focusRequester != null) {
                Modifier.size(1.dp).focusRequester(focusRequester)
            } else {
                Modifier.size(1.dp)
            }
            androidx.compose.foundation.text.BasicTextField(
                value = scanInput,
                onValueChange = onScanInputChange,
                modifier = tfModifier,
                singleLine = true
            )

            // 7. Thông báo trạng thái quét
            if (isChecking) {
                Spacer(modifier = Modifier.height(10.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(16.dp),
                        strokeWidth = 2.dp,
                        color = PrimaryBlue
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Đang kiểm tra sản phẩm trong hệ thống...",
                        color = PrimaryBlue,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            if (errorMessage != null) {
                Spacer(modifier = Modifier.height(10.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.ErrorOutline, contentDescription = null, tint = Color(0xFFDC2626), modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = errorMessage,
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
                        text = successMessage,
                        color = Color(0xFF16A34A),
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 8. Nút thao tác dưới cùng (Mã PIN nhân viên & Hỗ trợ)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedButton(
                    onClick = onRequestStaffPin,
                    modifier = Modifier
                        .weight(1f)
                        .height(44.dp),
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(1.dp, PrimaryBlue.copy(alpha = 0.5f))
                ) {
                    Icon(
                        imageVector = Icons.Default.AdminPanelSettings,
                        contentDescription = null,
                        tint = PrimaryBlue,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "MÃ PIN NHÂN VIÊN",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = PrimaryBlue
                    )
                }

                if (onSecondaryAction != null) {
                    TextButton(
                        onClick = onSecondaryAction,
                        modifier = Modifier
                            .weight(1f)
                            .height(44.dp),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.SupportAgent,
                            contentDescription = null,
                            tint = Color(0xFF64748B),
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Hỗ trợ",
                            fontSize = 12.sp,
                            color = Color(0xFF64748B),
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }
        }
    }
}

/**
 * StaffPinDialog: Hộp thoại xác thực mã PIN dành cho nhân viên siêu thị can thiệp
 */
@Composable
fun StaffPinDialog(
    pinInput: String,
    onPinInputChange: (String) -> Unit,
    errorMessage: String?,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
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
                    value = pinInput,
                    onValueChange = onPinInputChange,
                    placeholder = { Text("Nhập mã PIN...") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    isError = errorMessage != null
                )
                if (errorMessage != null) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(text = errorMessage, color = Color(0xFFDC2626), fontSize = 12.sp)
                }
            }
        },
        confirmButton = {
            Button(
                onClick = onConfirm,
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue)
            ) {
                Text("Mở Khóa Xe")
            }
        },
        dismissButton = {
            OutlinedButton(onClick = onDismiss) {
                Text("Hủy")
            }
        }
    )
}

// ==========================================
// CÁC HÀM @PREVIEW TRỰC QUAN ĐẦY ĐỦ CÁC TRẠNG THÁI TRÊN ANDROID STUDIO
// ==========================================

@Composable
private fun SensorAnomalyPreviewContainer(
    content: @Composable () -> Unit
) {
    MaterialTheme {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0x990F172A)), // Lớp nền tối mờ chân thực mô phỏng Dialog
            contentAlignment = Alignment.Center
        ) {
            content()
        }
    }
}

/**
 * 1. Xem trước: Trạng thái đang chờ quét GM65 không giới hạn thời gian (Active Waiting)
 */
@Preview(
    showBackground = true,
    widthDp = 800,
    heightDp = 600,
    name = "1. Đang Chờ Quét Mã Vạch (Không Giới Hạn)"
)
@Composable
fun PreviewSensorAnomalyActiveWaiting() {
    SensorAnomalyPreviewContainer {
        SensorAnomalyDialogContent(
            anomaly = SensorAnomaly(type = AnomalyType.PI_UNRECOGNIZED_ITEM),
            scanInput = "",
            pulseScale = 1.05f,
            pulseAlpha = 0.8f
        )
    }
}

/**
 * 2. Xem trước: Trạng thái yêu cầu quét mã khi thêm sản phẩm chưa xác nhận
 */
@Preview(
    showBackground = true,
    widthDp = 800,
    heightDp = 600,
    name = "2. Yêu Cầu Quét Mã GM65 (Unrecognized Item)"
)
@Composable
fun PreviewSensorAnomalyUnrecognizedItem() {
    SensorAnomalyPreviewContainer {
        SensorAnomalyDialogContent(
            anomaly = SensorAnomaly(type = AnomalyType.WEIGHT_ADD_UNCONFIRMED),
            scanInput = "",
            pulseScale = 1.0f,
            pulseAlpha = 0.85f,
            onSecondaryAction = {}
        )
    }
}

/**
 * 3. Xem trước: Trạng thái quét mã vạch không hợp lệ / không có trong CSDL (Error)
 */
@Preview(
    showBackground = true,
    widthDp = 800,
    heightDp = 600,
    name = "3. Lỗi Mã Vạch Không Tồn Tại (Scan Error)"
)
@Composable
fun PreviewSensorAnomalyScanError() {
    SensorAnomalyPreviewContainer {
        SensorAnomalyDialogContent(
            anomaly = SensorAnomaly(type = AnomalyType.PI_UNRECOGNIZED_ITEM),
            scanInput = "893999999999",
            errorMessage = "Mã vạch '893999999999' không tồn tại trong hệ thống siêu thị!",
            pulseScale = 1.02f,
            pulseAlpha = 0.75f
        )
    }
}

/**
 * 4. Xem trước: Trạng thái nhận diện thành công sau khi quét GM65 (Success)
 */
@Preview(
    showBackground = true,
    widthDp = 800,
    heightDp = 600,
    name = "4. Quét Thành Công (Scan Success)"
)
@Composable
fun PreviewSensorAnomalyScanSuccess() {
    SensorAnomalyPreviewContainer {
        SensorAnomalyDialogContent(
            anomaly = SensorAnomaly(type = AnomalyType.PI_UNRECOGNIZED_ITEM),
            scanInput = "8934563123456",
            successMessage = "✓ Đã nhận diện thành công: Sữa Tươi Tiệt Trùng Vinamilk 100%!",
            pulseScale = 1.0f,
            pulseAlpha = 0.6f
        )
    }
}

/**
 * 5. Xem trước: Trạng thái cảnh báo sai lệch dung sai cân nặng (Weight Tolerance Anomaly)
 */
@Preview(
    showBackground = true,
    widthDp = 800,
    heightDp = 600,
    name = "5. Cảnh Báo Lệch Cân Nặng (Weight Mismatch)"
)
@Composable
fun PreviewSensorAnomalyWeightTolerance() {
    SensorAnomalyPreviewContainer {
        SensorAnomalyDialogContent(
            anomaly = SensorAnomaly(type = AnomalyType.WEIGHT_OUT_OF_TOLERANCE),
            scanInput = "",
            pulseScale = 1.04f,
            pulseAlpha = 0.8f
        )
    }
}

/**
 * 6. Xem trước: Trực quan trên màn hình Tablet xe đẩy nằm ngang (Landscape 1024x600)
 */
@Preview(
    showBackground = true,
    widthDp = 1024,
    heightDp = 600,
    name = "6. Xe Đẩy Màn Hình Ngang (Landscape Tablet)"
)
@Composable
fun PreviewSensorAnomalyTabletLandscape() {
    SensorAnomalyPreviewContainer {
        SensorAnomalyDialogContent(
            anomaly = SensorAnomaly(type = AnomalyType.PI_UNRECOGNIZED_ITEM),
            scanInput = "",
            pulseScale = 1.03f,
            pulseAlpha = 0.8f
        )
    }
}

/**
 * 7. Xem trước: Hộp thoại Nhập Mã PIN Nhân Viên Mở Khóa (Staff PIN Dialog)
 */
@Preview(
    showBackground = true,
    widthDp = 800,
    heightDp = 600,
    name = "7. Hộp Thoại Mã PIN Nhân Viên (Staff PIN)"
)
@Composable
fun PreviewStaffPinDialog() {
    SensorAnomalyPreviewContainer {
        StaffPinDialog(
            pinInput = "1234",
            onPinInputChange = {},
            errorMessage = null,
            onConfirm = {},
            onDismiss = {}
        )
    }
}
