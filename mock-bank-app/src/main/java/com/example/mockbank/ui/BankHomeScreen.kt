package com.example.mockbank.ui

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.mockbank.data.AccountData
import com.example.mockbank.data.BankApiClient
import com.example.mockbank.data.FaucetRequest
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

// Design Tokens (Neo-Banking Obsidian & Emerald Luxury)
private val ColorBg = Color(0xFF090D11)
private val ColorCardSurface = Color(0xFF131A22)
private val ColorCardBorder = Color(0xFF232D3B)
private val ColorAccentGreen = Color(0xFF00E676)
private val ColorAccentMint = Color(0xFF69F0AE)
private val ColorTextPrimary = Color(0xFFF1F5F9)
private val ColorTextSecondary = Color(0xFF94A3B8)
private val ColorTextMuted = Color(0xFF64748B)

data class RecentTxItem(
    val id: String,
    val title: String,
    val subtitle: String,
    val amount: String,
    val isPositive: Boolean,
    val icon: ImageVector,
    val time: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BankHomeScreen(
    accountNumber: String = "ACC_CUSTOMER_01",
    onScanQrClick: () -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    var account by remember { mutableStateOf<AccountData?>(null) }
    var isLoading by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }
    var showSettingsDialog by remember { mutableStateOf(false) }
    var serverUrlInput by remember { mutableStateOf(BankApiClient.baseUrl) }

    // Mock Recent Activity (Tỷ giá: 1 Token = 10 VNĐ)
    var transactions by remember {
        mutableStateOf(
            listOf(
                RecentTxItem("1", "Mở ví ngân hàng thử nghiệm", "Đăng ký thành công", "+50,000", true, Icons.Default.Stars, "Hôm nay, 08:30"),
                RecentTxItem("2", "Thanh toán Xe Đẩy Thông Minh", "Đơn hàng ORD_8392", "-13,500", false, Icons.Default.ShoppingCart, "Hôm qua, 17:15"),
                RecentTxItem("3", "Nạp Token Thử Nghiệm", "Faucet System", "+50,000", true, Icons.Default.AddCircle, "02/09/2026")
            )
        )
    }

    fun refreshBalance() {
        coroutineScope.launch {
            isLoading = true
            message = null
            try {
                val res = BankApiClient.getService().getAccount(accountNumber)
                if (res.isSuccessful && res.body()?.success == true) {
                    account = res.body()?.data
                } else {
                    message = "Lỗi phản hồi: ${res.code()}"
                }
            } catch (e: Exception) {
                message = "Không kết nối được: ${e.message}"
            } finally {
                isLoading = false
            }
        }
    }

    LaunchedEffect(Unit) {
        refreshBalance()
    }

    // Settings Dialog
    if (showSettingsDialog) {
        AlertDialog(
            onDismissRequest = { showSettingsDialog = false },
            containerColor = Color(0xFF161E28),
            titleContentColor = ColorTextPrimary,
            textContentColor = ColorTextSecondary,
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Tune, contentDescription = null, tint = ColorAccentGreen)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Cấu hình Ngrok Server", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                }
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        "Nhập địa chỉ HTTPS Ngrok của bạn (hoặc IP Wi-Fi). Ứng dụng đã tự động bỏ qua trang cảnh báo của Ngrok.",
                        fontSize = 13.sp,
                        color = ColorTextSecondary
                    )
                    OutlinedTextField(
                        value = serverUrlInput,
                        onValueChange = { serverUrlInput = it },
                        label = { Text("Server URL", color = ColorTextMuted) },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = ColorAccentGreen,
                            unfocusedBorderColor = ColorCardBorder,
                            focusedTextColor = ColorTextPrimary,
                            unfocusedTextColor = ColorTextPrimary,
                            cursorColor = ColorAccentGreen
                        ),
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Text(
                        "Mặc định: ${BankApiClient.DEFAULT_BASE_URL}",
                        fontSize = 11.sp,
                        color = ColorTextMuted
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        BankApiClient.updateBaseUrl(context, serverUrlInput)
                        showSettingsDialog = false
                        refreshBalance()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = ColorAccentGreen, contentColor = Color.Black),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("Lưu & Kết nối", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(
                    onClick = { showSettingsDialog = false },
                    colors = ButtonDefaults.textButtonColors(contentColor = ColorTextSecondary)
                ) {
                    Text("Đóng")
                }
            }
        )
    }

    Scaffold(
        containerColor = ColorBg,
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "MOCK BANK",
                            color = ColorTextPrimary,
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 17.sp,
                            letterSpacing = 1.5.sp
                        )
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(6.dp)
                                    .clip(CircleShape)
                                    .background(if (account != null) ColorAccentGreen else Color(0xFFFF5252))
                            )
                            Spacer(modifier = Modifier.width(5.dp))
                            Text(
                                text = if (account != null) "Ngrok Online" else "Đang kiểm tra kết nối...",
                                color = ColorTextMuted,
                                fontSize = 11.sp
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = ColorBg),
                actions = {
                    // Nút refresh có animation xoay khi loading
                    val rotation by animateFloatAsState(
                        targetValue = if (isLoading) 360f else 0f,
                        animationSpec = if (isLoading) infiniteRepeatable(tween(800, easing = LinearEasing)) else tween(300),
                        label = "spin"
                    )
                    IconButton(onClick = { refreshBalance() }) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Refresh",
                            tint = ColorTextSecondary,
                            modifier = Modifier.rotate(rotation)
                        )
                    }
                    IconButton(onClick = {
                        serverUrlInput = BankApiClient.baseUrl
                        showSettingsDialog = true
                    }) {
                        Icon(
                            imageVector = Icons.Outlined.Settings,
                            contentDescription = "Settings",
                            tint = ColorTextSecondary
                        )
                    }
                }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 20.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            // 1. THẺ NGÂN HÀNG TITANIUM OBSIDIAN (Anti-slop, Brushed Metal & Champagne Accents)
            item {
                TitaniumBankCard(
                    account = account,
                    accountNumber = accountNumber,
                    isLoading = isLoading
                )
            }

            // 2. THANH THAO TÁC NHANH (Tactile Action Pills)
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Nạp Faucet
                    ActionPill(
                        modifier = Modifier.weight(1f),
                        icon = Icons.Default.AddCircleOutline,
                        label = "Nạp Token",
                        accentColor = ColorAccentGreen,
                        onClick = {
                            coroutineScope.launch {
                                try {
                                    val res = BankApiClient.getService().faucet(FaucetRequest(accountNumber, 50000.0))
                                    if (res.isSuccessful) {
                                        refreshBalance()
                                        val timeStr = SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date())
                                        transactions = listOf(
                                            RecentTxItem(UUID.randomUUID().toString(), "Nạp Token Faucet", "Hệ thống tự động", "+50,000", true, Icons.Default.AddCircle, "Hôm nay, $timeStr")
                                        ) + transactions
                                        message = "Đã nạp +50.000 Token (≈ 500.000 VNĐ) vào tài khoản!"
                                    }
                                } catch (e: Exception) {
                                    message = "Lỗi nạp: ${e.message}"
                                }
                            }
                        }
                    )

                    // Cài đặt Server Ngrok
                    ActionPill(
                        modifier = Modifier.weight(1f),
                        icon = Icons.Outlined.Lan,
                        label = "Máy chủ",
                        accentColor = Color(0xFF38BDF8),
                        onClick = {
                            serverUrlInput = BankApiClient.baseUrl
                            showSettingsDialog = true
                        }
                    )
                }
            }

            // 3. NÚT CHÍNH: QUÉT MÃ QR XE ĐẨY (Tactile Neon CTA với Spring Feedback)
            item {
                ScanQrPrimaryButton(onClick = onScanQrClick)
            }

            // Thông báo lỗi / trạng thái nếu có
            if (message != null) {
                item {
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = Color(0xFF1E2630),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.Info, contentDescription = null, tint = ColorAccentMint, modifier = Modifier.size(20.dp))
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(text = message!!, color = ColorTextPrimary, fontSize = 13.sp)
                        }
                    }
                }
            }

            // 4. LỊCH SỬ GIAO DỊCH GẦN ĐÂY (Recent Ledger Feed)
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "LỊCH SỬ GIAO DỊCH",
                        color = ColorTextMuted,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.2.sp
                    )
                    Text(
                        text = "Tài khoản ảo",
                        color = ColorTextSecondary,
                        fontSize = 12.sp
                    )
                }
            }

            items(transactions, key = { it.id }) { tx ->
                TransactionRow(tx = tx)
            }

            item {
                Spacer(modifier = Modifier.height(20.dp))
            }
        }
    }
}

/**
 * Thẻ Ngân hàng phong cách Titanium Obsidian:
 * Không gradient tím-xanh rẻ tiền, sử dụng bề mặt carbon mờ, chip EMV vàng đồng, font Monospace sắc nét.
 */
@Composable
private fun TitaniumBankCard(
    account: AccountData?,
    accountNumber: String,
    isLoading: Boolean
) {
    // Animation scale nhẹ khi nhấn
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val cardScale by animateFloatAsState(
        targetValue = if (isPressed) 0.98f else 1f,
        animationSpec = spring(dampingRatio = Spring.DampingRatioLowBouncy, stiffness = Spring.StiffnessMedium),
        label = "card_scale"
    )

    // Hiệu ứng animated số dư token
    val balance = account?.tokenBalance ?: 1000.0
    val animatedBalance by animateFloatAsState(
        targetValue = balance.toFloat(),
        animationSpec = spring(stiffness = Spring.StiffnessLow),
        label = "balance_anim"
    )

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .scale(cardScale)
            .height(210.dp)
            .clip(RoundedCornerShape(22.dp))
            .background(ColorCardSurface)
            .border(1.dp, ColorCardBorder, RoundedCornerShape(22.dp))
            .clickable(interactionSource = interactionSource, indication = null) {}
            // Micro-grid line watermark (bề mặt kỹ thuật cao cấp)
            .drawBehind {
                val step = 30f
                for (x in 0..size.width.toInt() step step.toInt()) {
                    drawLine(
                        color = Color(0x07FFFFFF),
                        start = Offset(x.toFloat(), 0f),
                        end = Offset(x.toFloat(), size.height),
                        strokeWidth = 1f
                    )
                }
            }
            .padding(22.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Hàng 1: Chip EMV & Biểu tượng NFC & Logo VIP
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    // Chip EMV vàng kim loại
                    Box(
                        modifier = Modifier
                            .width(36.dp)
                            .height(26.dp)
                            .clip(RoundedCornerShape(6.dp))
                            .background(
                                Brush.linearGradient(
                                    colors = listOf(Color(0xFFF59E0B), Color(0xFFD97706), Color(0xFFB45309))
                                )
                            )
                            .border(0.5.dp, Color(0xFFFFE082), RoundedCornerShape(6.dp))
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Icon(
                        imageVector = Icons.Default.Contactless,
                        contentDescription = "NFC",
                        tint = ColorTextSecondary,
                        modifier = Modifier.size(20.dp)
                    )
                }

                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = Color(0xFF1E2835),
                    border = androidx.compose.foundation.BorderStroke(0.5.dp, Color(0xFF334155))
                ) {
                    Text(
                        text = "TITANIUM TOKEN",
                        color = ColorAccentMint,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            // Hàng 2: Số dư Token (Typography lớn, nổi bật, animated)
            Column {
                Text(
                    text = "SỐ DƯ KHẢ DỤNG",
                    color = ColorTextMuted,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    letterSpacing = 1.2.sp
                )
                Spacer(modifier = Modifier.height(4.dp))
                Row(verticalAlignment = Alignment.Bottom) {
                    Text(
                        text = "%,d".format(animatedBalance.toInt()),
                        color = ColorTextPrimary,
                        fontSize = 38.sp,
                        fontWeight = FontWeight.ExtraBold,
                        fontFamily = FontFamily.SansSerif,
                        letterSpacing = (-0.5).sp
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "TOKEN",
                        color = ColorAccentGreen,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(bottom = 6.dp)
                    )
                }
                Text(
                    text = "≈ %,d VNĐ (Tỷ giá 1:10)".format(animatedBalance.toInt() * 10),
                    color = ColorTextSecondary,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium
                )
            }

            // Hàng 3: Tên chủ thẻ & Số tài khoản masked
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = (account?.ownerName ?: "Khách Hàng Demo").uppercase(),
                        color = ColorTextPrimary,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 0.8.sp
                    )
                    Text(
                        text = account?.accountNumber ?: accountNumber,
                        color = ColorTextMuted,
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace
                    )
                }

                Text(
                    text = "EXP: 12/29",
                    color = ColorTextMuted,
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace
                )
            }
        }
    }
}

/**
 * Nút hành động dạng Pill (Thao tác xúc giác với Spring Animation)
 */
@Composable
private fun ActionPill(
    modifier: Modifier = Modifier,
    icon: ImageVector,
    label: String,
    accentColor: Color,
    onClick: () -> Unit
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.96f else 1f,
        animationSpec = spring(stiffness = Spring.StiffnessMedium),
        label = "pill_scale"
    )

    Surface(
        modifier = modifier
            .scale(scale)
            .height(52.dp)
            .clickable(interactionSource = interactionSource, indication = null, onClick = onClick),
        shape = RoundedCornerShape(14.dp),
        color = ColorCardSurface,
        border = androidx.compose.foundation.BorderStroke(1.dp, ColorCardBorder)
    ) {
        Row(
            modifier = Modifier.fillMaxSize(),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(icon, contentDescription = null, tint = accentColor, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = label,
                color = ColorTextPrimary,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold
            )
        }
    }
}

/**
 * Nút Quét QR Xe Đẩy (Tiêu điểm chính của màn hình)
 * Sử dụng hiệu ứng xung nhịp (pulse animation) nhẹ nhàng để thu hút thị giác.
 */
@Composable
private fun ScanQrPrimaryButton(
    onClick: () -> Unit
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.97f else 1f,
        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessMedium),
        label = "btn_scale"
    )

    // Hiệu ứng pulse viền sáng nhẹ
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val borderAlpha by infiniteTransition.animateFloat(
        initialValue = 0.3f,
        targetValue = 0.9f,
        animationSpec = infiniteRepeatable(tween(1400, easing = FastOutSlowInEasing), RepeatMode.Reverse),
        label = "alpha"
    )

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .scale(scale)
            .height(64.dp)
            .clip(RoundedCornerShape(18.dp))
            .background(Color(0xFF0F1720))
            .border(
                width = 1.5.dp,
                color = ColorAccentGreen.copy(alpha = borderAlpha),
                shape = RoundedCornerShape(18.dp)
            )
            .clickable(interactionSource = interactionSource, indication = null, onClick = onClick)
            .padding(horizontal = 20.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(38.dp)
                    .clip(CircleShape)
                    .background(ColorAccentGreen.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.QrCodeScanner,
                    contentDescription = "Scan",
                    tint = ColorAccentGreen,
                    modifier = Modifier.size(22.dp)
                )
            }
            Spacer(modifier = Modifier.width(14.dp))
            Column {
                Text(
                    text = "QUÉT MÃ QR TRÊN XE ĐẨY",
                    color = ColorTextPrimary,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 0.5.sp
                )
                Text(
                    text = "Thanh toán giỏ hàng tự động qua Token",
                    color = ColorTextSecondary,
                    fontSize = 11.sp
                )
            }
        }
    }
}

/**
 * Mỗi hàng trong danh sách hoạt động gần đây
 */
@Composable
private fun TransactionRow(tx: RecentTxItem) {
    Surface(
        shape = RoundedCornerShape(14.dp),
        color = ColorCardSurface,
        border = androidx.compose.foundation.BorderStroke(0.8.dp, ColorCardBorder.copy(alpha = 0.7f)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f)
            ) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(if (tx.isPositive) ColorAccentGreen.copy(alpha = 0.12f) else Color(0xFFEF4444).copy(alpha = 0.12f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = tx.icon,
                        contentDescription = null,
                        tint = if (tx.isPositive) ColorAccentGreen else Color(0xFFFF5252),
                        modifier = Modifier.size(20.dp)
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column {
                    Text(
                        text = tx.title,
                        color = ColorTextPrimary,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    Text(
                        text = "${tx.subtitle} • ${tx.time}",
                        color = ColorTextMuted,
                        fontSize = 11.sp,
                        maxLines = 1
                    )
                }
            }

            Text(
                text = "${tx.amount} Token",
                color = if (tx.isPositive) ColorAccentGreen else ColorTextPrimary,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.SansSerif
            )
        }
    }
}
