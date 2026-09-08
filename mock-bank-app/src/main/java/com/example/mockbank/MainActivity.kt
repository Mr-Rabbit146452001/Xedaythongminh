package com.example.mockbank

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.mockbank.data.BankApiClient
import com.example.mockbank.data.PayQrRequest
import com.example.mockbank.data.QrPayload
import com.example.mockbank.ui.BankHomeScreen
import com.example.mockbank.ui.camera.QrScannerScreen
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.*
import org.json.JSONObject

// Design Tokens Matching Obsidian & Emerald
private val ColorBg = Color(0xFF090D11)
private val ColorCardSurface = Color(0xFF131A22)
private val ColorCardBorder = Color(0xFF232D3B)
private val ColorAccentGreen = Color(0xFF00E676)
private val ColorTextPrimary = Color(0xFFF1F5F9)
private val ColorTextSecondary = Color(0xFF94A3B8)
private val ColorTextMuted = Color(0xFF64748B)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        BankApiClient.init(this)
        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = ColorBg
                ) {
                    BankAppNavigation()
                }
            }
        }
    }
}

@Composable
fun BankAppNavigation() {
    var currentScreen by remember { mutableStateOf("home") }
    var activeQrPayload by remember { mutableStateOf<QrPayload?>(null) }
    var lastTxId by remember { mutableStateOf<String?>(null) }
    var lastAmountPaid by remember { mutableStateOf(13500.0) }
    var lastOrderId by remember { mutableStateOf("ORD_DEMO") }
    val coroutineScope = rememberCoroutineScope()

    AnimatedContent(
        targetState = currentScreen,
        transitionSpec = {
            fadeIn(animationSpec = tween(300)) + slideInVertically(animationSpec = spring(stiffness = Spring.StiffnessMedium)) { it / 8 } togetherWith
            fadeOut(animationSpec = tween(200))
        },
        label = "screen_transition"
    ) { screen ->
        when (screen) {
            "home" -> {
                BankHomeScreen(
                    onScanQrClick = {
                        // Mở màn hình Camera quét QR thật
                        currentScreen = "scanner"
                    }
                )
            }
            "scanner" -> {
                // Màn hình Camera quét mã QR Xe Đẩy thực tế
                QrScannerScreen(
                    onBack = { currentScreen = "home" },
                    onQrScanned = { payload ->
                        activeQrPayload = payload
                        currentScreen = "confirm_payment"
                    },
                    onManualInputClick = {
                        currentScreen = "manual_input"
                    }
                )
            }
            "manual_input" -> {
                // Màn hình dự phòng nhập mã đơn thủ công nếu camera không quét được
                ManualOrderInputScreen(
                    onBack = { currentScreen = "home" },
                    onSubmit = { orderId, amount ->
                        activeQrPayload = QrPayload(
                            orderId = orderId,
                            amount = amount,
                            toAccount = "ACC_STORE_MAIN",
                            storeName = "Siêu Thị Xe Đẩy Thông Minh"
                        )
                        currentScreen = "confirm_payment"
                    }
                )
            }
            "confirm_payment" -> {
                val payload = activeQrPayload ?: QrPayload(
                    orderId = "ORD_DEMO",
                    amount = 13500.0,
                    toAccount = "ACC_STORE_MAIN",
                    storeName = "Siêu Thị Xe Đẩy Thông Minh"
                )

                PaymentConfirmationScreen(
                    payload = payload,
                    onDismiss = { currentScreen = "home" },
                    onConfirmPayment = { orderId, amount, toAccount, onError ->
                        coroutineScope.launch {
                            lastOrderId = orderId
                            lastAmountPaid = amount
                            try {
                                val res = BankApiClient.getService().payQr(
                                    PayQrRequest(
                                        fromAccount = "ACC_CUSTOMER_01",
                                        toAccount = toAccount,
                                        amount = amount,
                                        orderId = orderId,
                                        pin = "123456"
                                    )
                                )
                                if (res.isSuccessful && res.body()?.success == true) {
                                    lastTxId = res.body()?.data?.transactionId ?: "TX_${System.currentTimeMillis()}"
                                    currentScreen = "success"
                                } else {
                                    val rawError = res.errorBody()?.string()
                                    val parsedMsg = try {
                                        if (!rawError.isNullOrBlank()) {
                                            JSONObject(rawError).optString("message", "")
                                        } else ""
                                    } catch (_: Exception) { "" }

                                    val finalError = res.body()?.message
                                        ?.ifBlank { null }
                                        ?: if (parsedMsg.isNotBlank()) parsedMsg else rawError
                                        ?: "Giao dịch không thành công (HTTP ${res.code()})"
                                    onError(finalError)
                                }
                            } catch (e: Exception) {
                                onError("Lỗi kết nối tới hệ thống: ${e.localizedMessage ?: "Vui lòng kiểm tra lại kết nối mạng"}")
                            }
                        }
                    }
                )
            }
            "success" -> {
                PaymentSuccessScreen(
                    orderId = lastOrderId,
                    amountPaid = lastAmountPaid,
                    txId = lastTxId ?: "TX_${System.currentTimeMillis()}",
                    onBackHome = { currentScreen = "home" }
                )
            }
        }
    }
}

/**
 * Màn hình nhập mã đơn hàng thủ công (Dự phòng khi chạy trên máy ảo hoặc camera hỏng)
 */
@Composable
private fun ManualOrderInputScreen(
    onBack: () -> Unit,
    onSubmit: (orderId: String, amount: Double) -> Unit
) {
    var orderId by remember { mutableStateOf("ORD_${System.currentTimeMillis()}") }
    var tokenAmountInput by remember { mutableStateOf("13500") }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(ColorBg)
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Surface(
            shape = RoundedCornerShape(24.dp),
            color = ColorCardSurface,
            border = androidx.compose.foundation.BorderStroke(1.dp, ColorCardBorder),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(24.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        "Nhập mã đơn thủ công",
                        color = ColorTextPrimary,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = ColorTextSecondary)
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = orderId,
                    onValueChange = { orderId = it },
                    label = { Text("Mã đơn hàng (Order ID)") },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = ColorAccentGreen,
                        unfocusedBorderColor = ColorCardBorder,
                        focusedTextColor = ColorTextPrimary,
                        unfocusedTextColor = ColorTextPrimary
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = tokenAmountInput,
                    onValueChange = { tokenAmountInput = it },
                    label = { Text("Số lượng Token thanh toán") },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = ColorAccentGreen,
                        unfocusedBorderColor = ColorCardBorder,
                        focusedTextColor = ColorTextPrimary,
                        unfocusedTextColor = ColorTextPrimary
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                val amount = tokenAmountInput.toDoubleOrNull() ?: 0.0
                Text(
                    text = "Quy đổi (1 Token = 10 VNĐ): ≈ ${NumberFormat.getNumberInstance(Locale.forLanguageTag("vi-VN")).format(amount.toLong() * 10)} VNĐ",
                    color = ColorAccentGreen,
                    fontSize = 12.sp,
                    modifier = Modifier.padding(top = 8.dp)
                )

                Spacer(modifier = Modifier.height(24.dp))

                Button(
                    onClick = {
                        val parsed = tokenAmountInput.toDoubleOrNull() ?: 13500.0
                        onSubmit(orderId, parsed)
                    },
                    modifier = Modifier.fillMaxWidth().height(52.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = ColorAccentGreen, contentColor = Color.Black),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Tiếp tục thanh toán", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

/**
 * Màn hình xác nhận thanh toán (Payment Confirmation Screen):
 * Nhận dữ liệu thực tế được quét từ mã QR xe đẩy.
 */
@Composable
private fun PaymentConfirmationScreen(
    payload: QrPayload,
    onDismiss: () -> Unit,
    onConfirmPayment: (orderId: String, amount: Double, toAccount: String, onError: (String) -> Unit) -> Unit
) {
    var isProcessing by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    val formatVnd = NumberFormat.getNumberInstance(Locale.forLanguageTag("vi-VN"))

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.75f))
            .padding(20.dp),
        contentAlignment = Alignment.Center
    ) {
        Surface(
            shape = RoundedCornerShape(24.dp),
            color = ColorCardSurface,
            border = androidx.compose.foundation.BorderStroke(1.dp, ColorCardBorder),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Header Sheet
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(ColorAccentGreen)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "XÁC NHẬN CHUYỂN TOKEN",
                            color = ColorTextMuted,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.2.sp
                        )
                    }
                    IconButton(onClick = onDismiss, modifier = Modifier.size(28.dp)) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = ColorTextSecondary)
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Số Token cần chuyển (Được quét trực tiếp từ QR)
                Text(
                    text = "${formatVnd.format(payload.amount.toLong())} TOKEN",
                    color = ColorAccentGreen,
                    fontSize = 34.sp,
                    fontWeight = FontWeight.ExtraBold,
                    letterSpacing = (-0.5).sp
                )
                // Tỷ giá quy đổi: 1 Token = 10 VNĐ
                Text(
                    text = "Quy đổi: ≈ ${formatVnd.format((payload.amount * 10).toLong())} VNĐ (Tỷ giá 1:10)",
                    color = ColorTextSecondary,
                    fontSize = 13.sp
                )

                Spacer(modifier = Modifier.height(20.dp))

                // Bảng chi tiết hóa đơn quét từ QR xe đẩy
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = Color(0xFF0F151C),
                    border = androidx.compose.foundation.BorderStroke(0.8.dp, ColorCardBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Đơn hàng", color = ColorTextMuted, fontSize = 12.sp)
                            Text(payload.orderId, color = ColorTextPrimary, fontSize = 12.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold)
                        }
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Nơi nhận", color = ColorTextMuted, fontSize = 12.sp)
                            Text(payload.storeName ?: "Siêu Thị Xe Đẩy Thông Minh", color = ColorTextPrimary, fontSize = 12.sp, fontWeight = FontWeight.Medium)
                        }
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Ví thụ hưởng", color = ColorTextMuted, fontSize = 12.sp)
                            Text(payload.toAccount, color = Color(0xFF38BDF8), fontSize = 12.sp, fontFamily = FontFamily.Monospace)
                        }
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Ví thanh toán", color = ColorTextMuted, fontSize = 12.sp)
                            Text("ACC_CUSTOMER_01", color = ColorAccentGreen, fontSize = 12.sp, fontFamily = FontFamily.Monospace)
                        }
                    }
                }

                if (errorMessage != null) {
                    Spacer(modifier = Modifier.height(14.dp))
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = Color(0x22FF5252),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFF5252).copy(alpha = 0.5f)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Warning,
                                contentDescription = "Error",
                                tint = Color(0xFFFF5252),
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = errorMessage!!,
                                color = Color(0xFFFF8A80),
                                fontSize = 12.sp,
                                lineHeight = 16.sp,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Nút Chuyển Token với Tactile Spring
                val interactionSource = remember { MutableInteractionSource() }
                val isPressed by interactionSource.collectIsPressedAsState()
                val scale by animateFloatAsState(
                    targetValue = if (isPressed) 0.96f else 1f,
                    animationSpec = spring(stiffness = Spring.StiffnessMedium),
                    label = "confirm_scale"
                )

                Button(
                    onClick = {
                        isProcessing = true
                        errorMessage = null
                        onConfirmPayment(payload.orderId, payload.amount, payload.toAccount) { err ->
                            isProcessing = false
                            errorMessage = err
                        }
                    },
                    enabled = !isProcessing,
                    modifier = Modifier
                        .fillMaxWidth()
                        .scale(scale)
                        .height(54.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = ColorAccentGreen,
                        contentColor = Color.Black
                    )
                ) {
                    if (isProcessing) {
                        CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.Black, strokeWidth = 2.dp)
                        Spacer(modifier = Modifier.width(10.dp))
                        Text("Đang xác thực giao dịch...", fontWeight = FontWeight.Bold)
                    } else {
                        Icon(Icons.Default.Lock, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("XÁC NHẬN CHUYỂN TOKEN", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    }
                }
            }
        }
    }
}

/**
 * Màn hình Biên nhận Thanh toán thành công (Digital Receipt)
 */
@Composable
private fun PaymentSuccessScreen(
    orderId: String,
    amountPaid: Double,
    txId: String,
    onBackHome: () -> Unit
) {
    val timeStr = remember { SimpleDateFormat("HH:mm:ss - dd/MM/yyyy", Locale.getDefault()).format(Date()) }
    val formatVnd = NumberFormat.getNumberInstance(Locale.forLanguageTag("vi-VN"))

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(ColorBg)
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.fillMaxWidth()
        ) {
            // Vòng tròn checkmark thành công với ánh sáng Emerald
            Box(
                modifier = Modifier
                    .size(80.dp)
                    .clip(CircleShape)
                    .background(ColorAccentGreen.copy(alpha = 0.15f))
                    .border(1.5.dp, ColorAccentGreen, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Check,
                    contentDescription = "Success",
                    tint = ColorAccentGreen,
                    modifier = Modifier.size(44.dp)
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            Text(
                text = "GIAO DỊCH THÀNH CÔNG!",
                color = ColorTextPrimary,
                fontSize = 20.sp,
                fontWeight = FontWeight.ExtraBold,
                letterSpacing = 0.5.sp
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "Đã trừ -${formatVnd.format(amountPaid.toLong())} Token từ ví cá nhân",
                color = ColorAccentGreen,
                fontSize = 15.sp,
                fontWeight = FontWeight.SemiBold
            )

            Spacer(modifier = Modifier.height(28.dp))

            // Phiếu biên nhận kỹ thuật số (Receipt Surface)
            Surface(
                shape = RoundedCornerShape(18.dp),
                color = ColorCardSurface,
                border = androidx.compose.foundation.BorderStroke(1.dp, ColorCardBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    ReceiptRow(label = "Mã giao dịch", value = txId, isMono = true)
                    ReceiptRow(label = "Mã đơn hàng", value = orderId, isMono = true)
                    ReceiptRow(label = "Giá trị quy đổi", value = "${formatVnd.format((amountPaid * 10).toLong())} VNĐ")
                    ReceiptRow(label = "Nơi nhận", value = "Siêu Thị Xe Đẩy Thông Minh")
                    ReceiptRow(label = "Thời gian", value = timeStr)
                    ReceiptRow(label = "Trạng thái Xe Đẩy", value = "ĐÃ MỞ KHÓA THANH TOÁN", isHighlighted = true)
                }
            }

            Spacer(modifier = Modifier.height(36.dp))

            Button(
                onClick = onBackHome,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = ColorCardSurface,
                    contentColor = ColorTextPrimary
                ),
                border = androidx.compose.foundation.BorderStroke(1.dp, ColorCardBorder)
            ) {
                Icon(Icons.Default.Home, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("VỀ TRANG CHỦ", fontWeight = FontWeight.Bold, fontSize = 14.sp)
            }
        }
    }
}

@Composable
private fun ReceiptRow(
    label: String,
    value: String,
    isMono: Boolean = false,
    isHighlighted: Boolean = false
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = label, color = ColorTextMuted, fontSize = 12.sp)
        Text(
            text = value,
            color = if (isHighlighted) ColorAccentGreen else ColorTextPrimary,
            fontSize = 12.sp,
            fontWeight = if (isHighlighted) FontWeight.Bold else FontWeight.Normal,
            fontFamily = if (isMono) FontFamily.Monospace else FontFamily.Default
        )
    }
}
