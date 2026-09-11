package com.example.xedaythongminh.ui.screens

import androidx.compose.ui.res.stringResource
import com.example.xedaythongminh.R
import com.example.xedaythongminh.ui.theme.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.automirrored.filled.*
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import com.example.xedaythongminh.ui.viewmodel.AppViewModel
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.xedaythongminh.data.models.CartSummary
import java.text.NumberFormat
import java.util.Locale
import androidx.compose.material3.windowsizeclass.WindowWidthSizeClass
import androidx.activity.compose.BackHandler
import androidx.compose.ui.platform.LocalContext
import android.widget.Toast
import kotlinx.coroutines.delay
import com.example.xedaythongminh.ui.components.ResponsiveLayout
import com.example.xedaythongminh.ui.components.QrCodeImage

@Composable
fun PaymentQRScreen(
    appViewModel: AppViewModel = androidx.lifecycle.viewmodel.compose.viewModel(factory = com.example.xedaythongminh.ui.viewmodel.AppViewModelProvider.Factory),
    navController: NavController,
    windowSize: WindowWidthSizeClass = WindowWidthSizeClass.Expanded
) {
    val cartItems by appViewModel.cartItemsState.collectAsState()
    val qrContent by appViewModel.paymentQrContent.collectAsState()
    val qrSessionData by appViewModel.qrSessionData.collectAsState()
    val isQrExpiredServer by appViewModel.isQrExpired.collectAsState()
    val summary = CartSummary(cartItems)
    val context = LocalContext.current

    var lockRemainingSeconds by remember { mutableIntStateOf(60) }
    var expiryRemainingSeconds by remember { mutableIntStateOf(300) }

    LaunchedEffect(qrSessionData?.orderId) {
        lockRemainingSeconds = qrSessionData?.lockSeconds ?: 60
        expiryRemainingSeconds = qrSessionData?.validitySeconds ?: 300
        while (expiryRemainingSeconds > 0) {
            delay(1000)
            if (lockRemainingSeconds > 0) {
                lockRemainingSeconds--
            }
            if (expiryRemainingSeconds > 0) {
                expiryRemainingSeconds--
            }
        }
    }

    val isExpired = isQrExpiredServer || (expiryRemainingSeconds <= 0)

    // Khóa phím Back trong 1 phút đầu để server đồng bộ
    BackHandler(enabled = true) {
        if (lockRemainingSeconds > 0) {
            Toast.makeText(
                context,
                "Hệ thống đang tạm khóa để đồng bộ máy chủ (còn ${lockRemainingSeconds}s), vui lòng đợi!",
                Toast.LENGTH_SHORT
            ).show()
        } else {
            navController.popBackStack()
        }
    }

    LaunchedEffect(Unit) {
        appViewModel.startQrPaymentSession {
            // Tiến thẳng luồng đến payment_success và xóa sạch backstack
            navController.navigate("payment_success") {
                popUpTo(0) { inclusive = true }
            }
        }
    }

    DisposableEffect(Unit) {
        onDispose {
            appViewModel.stopQrPaymentSession()
        }
    }
    
    val formatVnd = { amount: Long ->
        NumberFormat.getNumberInstance(Locale.forLanguageTag("vi-VN")).format(amount) + " VNĐ"
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = BackgroundGray,
        topBar = { TopBar(statusText = stringResource(R.string.status_text_default)) }
    ) { innerPadding ->
        ResponsiveLayout(
            windowSize = windowSize,
            modifier = Modifier.padding(innerPadding),
            leftWeight = 0.35f,
            rightWeight = 0.65f,
            leftContent = { modifier ->
                Card(
                    modifier = modifier,
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    shape = RoundedCornerShape(16.dp),
                    border = BorderStroke(1.dp, BorderGray)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp)
                            .verticalScroll(rememberScrollState())
                    ) {
                        // Header
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Receipt, contentDescription = "Receipt", tint = PrimaryBlue)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Tóm tắt đơn hàng",
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextDark
                            )
                        }
                        
                        Spacer(modifier = Modifier.height(24.dp))
                        
                        // Product List
                        LazyColumn(
                            modifier = if (windowSize == WindowWidthSizeClass.Compact) Modifier.heightIn(max = 200.dp) else Modifier.weight(1f),
                            verticalArrangement = Arrangement.spacedBy(16.dp)
                        ) {
                            items(cartItems.size) { index ->
                                val item = cartItems[index]
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .background(Color(0xFFF8F9FA), RoundedCornerShape(12.dp))
                                        .padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = item.product.name,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 14.sp,
                                            color = TextDark,
                                            maxLines = 1
                                        )
                                        Spacer(modifier = Modifier.height(4.dp))
                                        Text(
                                            text = "SL: ${item.quantity}",
                                            fontSize = 12.sp,
                                            color = TextGray
                                        )
                                    }
                                    
                                    Text(
                                        text = formatVnd(item.totalPrice),
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 14.sp,
                                        color = PrimaryBlue
                                    )
                                }
                            }
                        }
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        // Dashed Divider
                        Canvas(modifier = Modifier.fillMaxWidth().height(1.dp)) {
                            drawLine(
                                color = BorderGray,
                                start = Offset(0f, 0f),
                                end = Offset(size.width, 0f),
                                strokeWidth = 2f,
                                pathEffect = PathEffect.dashPathEffect(floatArrayOf(10f, 10f), 0f)
                            )
                        }
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        // Billing Details
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(text = "Tạm tính:", color = TextGray)
                            Text(text = formatVnd(summary.subtotal), fontWeight = FontWeight.Bold, color = TextDark)
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(text = "Khuyến mãi:", color = TextGray)
                            Text(text = "- " + formatVnd(summary.memberDiscount), fontWeight = FontWeight.Bold, color = Color(0xFF2ECC71))
                        }
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        // Total Box
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(LightBlueBg, RoundedCornerShape(12.dp))
                                .padding(16.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Tổng\ncộng",
                                fontWeight = FontWeight.Bold,
                                fontSize = 18.sp,
                                color = TextDark
                            )
                            Text(
                                text = formatVnd(summary.subtotal - summary.memberDiscount),
                                fontWeight = FontWeight.Bold,
                                fontSize = 24.sp,
                                color = PrimaryBlue
                            )
                        }
                    }
                }
            },
            rightContent = { modifier ->
                Card(
                    modifier = modifier,
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    shape = RoundedCornerShape(16.dp),
                    border = BorderStroke(1.dp, BorderGray)
                ) {
                    val isCompact = windowSize == WindowWidthSizeClass.Compact
                    if (isCompact) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(32.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(32.dp)
                        ) {
                            PaymentQRScannerBox(
                                qrContent = qrContent,
                                isExpired = isExpired,
                                onRefresh = {
                                    appViewModel.startQrPaymentSession {
                                        navController.navigate("payment_success") {
                                            popUpTo(0) { inclusive = true }
                                        }
                                    }
                                },
                                modifier = Modifier.fillMaxWidth(0.8f).aspectRatio(1f)
                            )
                            PaymentQRInstructionsBox(
                                appViewModel = appViewModel,
                                navController = navController,
                                lockRemainingSeconds = lockRemainingSeconds,
                                expiryRemainingSeconds = expiryRemainingSeconds,
                                isExpired = isExpired,
                                onRefresh = {
                                    appViewModel.startQrPaymentSession {
                                        navController.navigate("payment_success") {
                                            popUpTo(0) { inclusive = true }
                                        }
                                    }
                                },
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                    } else {
                        Row(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(16.dp)
                                .verticalScroll(rememberScrollState()),
                            horizontalArrangement = Arrangement.spacedBy(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            PaymentQRScannerBox(
                                qrContent = qrContent,
                                isExpired = isExpired,
                                onRefresh = {
                                    appViewModel.startQrPaymentSession {
                                        navController.navigate("payment_success") {
                                            popUpTo(0) { inclusive = true }
                                        }
                                    }
                                },
                                modifier = Modifier.weight(1f).aspectRatio(1f)
                            )
                            PaymentQRInstructionsBox(
                                appViewModel = appViewModel,
                                navController = navController,
                                lockRemainingSeconds = lockRemainingSeconds,
                                expiryRemainingSeconds = expiryRemainingSeconds,
                                isExpired = isExpired,
                                onRefresh = {
                                    appViewModel.startQrPaymentSession {
                                        navController.navigate("payment_success") {
                                            popUpTo(0) { inclusive = true }
                                        }
                                    }
                                },
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }
                }
            }
        )
    }
}

@Composable
fun PaymentQRScannerBox(
    qrContent: String?,
    isExpired: Boolean = false,
    onRefresh: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(24.dp))
            .border(4.dp, if (isExpired) Color(0xFFFF5252) else PrimaryBlue, RoundedCornerShape(24.dp))
            .padding(12.dp),
        contentAlignment = Alignment.Center
    ) {
        QrCodeImage(
            content = qrContent,
            modifier = Modifier.fillMaxSize()
        )
        if (isExpired) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color.Black.copy(alpha = 0.88f))
                    .padding(16.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Warning,
                        contentDescription = null,
                        tint = Color(0xFFFF5252),
                        modifier = Modifier.size(48.dp)
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Text(
                        text = "MÃ QR ĐÃ HẾT HẠN",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Đã quá 5 phút hiệu lực.\nVui lòng tạo mã QR mới.",
                        color = Color(0xFFCCCCCC),
                        fontSize = 12.sp,
                        textAlign = TextAlign.Center,
                        lineHeight = 16.sp
                    )
                    Spacer(modifier = Modifier.height(14.dp))
                    Button(
                        onClick = onRefresh,
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Tạo mã QR mới", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
fun PaymentQRInstructionsBox(
    appViewModel: AppViewModel,
    navController: NavController,
    lockRemainingSeconds: Int = 0,
    expiryRemainingSeconds: Int = 300,
    isExpired: Boolean = false,
    onRefresh: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Quét mã để\nthanh toán",
            fontSize = 36.sp,
            fontWeight = FontWeight.Bold,
            color = PrimaryBlue,
            lineHeight = 44.sp
        )
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // Status & Timer
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Waiting Status
            Row(
                modifier = Modifier
                    .background(if (isExpired) Color(0xFFFFEBEE) else LightBlueBg, RoundedCornerShape(24.dp))
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = if (isExpired) Icons.Default.ErrorOutline else Icons.Default.HourglassTop,
                    contentDescription = null,
                    tint = if (isExpired) Color(0xFFFF1744) else PrimaryBlue,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (isExpired) "Mã QR\nhết hạn" else "Đang chờ\nthanh toán...",
                    color = if (isExpired) Color(0xFFFF1744) else PrimaryBlue,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium
                )
            }
            
            // Timer đếm ngược 5 phút
            val minutes = expiryRemainingSeconds / 60
            val seconds = expiryRemainingSeconds % 60
            val timeFormatted = String.format("%02d:%02d", minutes, seconds)
            val timerColor = if (expiryRemainingSeconds <= 60) Color(0xFFFF1744) else Color(0xFFE74C3C)

            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Timer, contentDescription = null, tint = timerColor)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = timeFormatted,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = timerColor
                )
            }
        }
        
        Spacer(modifier = Modifier.height(36.dp))
        
        // Action Buttons
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            OutlinedButton(
                onClick = { 
                    if (lockRemainingSeconds <= 0) {
                        navController.popBackStack() 
                    }
                },
                enabled = lockRemainingSeconds <= 0,
                modifier = if (isExpired) Modifier.weight(1f).height(48.dp) else Modifier.fillMaxWidth().height(48.dp),
                shape = RoundedCornerShape(10.dp),
                border = BorderStroke(1.dp, if (lockRemainingSeconds > 0) Color.LightGray else PrimaryBlue)
            ) {
                if (lockRemainingSeconds > 0) {
                    Icon(Icons.Default.Lock, contentDescription = null, tint = Color.Gray, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Tạm khóa (${lockRemainingSeconds}s)",
                        color = Color.Gray,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                } else {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null, tint = PrimaryBlue, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(stringResource(R.string.btn_back), color = PrimaryBlue, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                }
            }
            
            if (isExpired) {
                Button(
                    onClick = onRefresh,
                    modifier = Modifier
                        .weight(1f)
                        .height(48.dp),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue)
                ) {
                    Icon(Icons.Default.Refresh, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Làm mới QR", color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Preview(showBackground = true, widthDp = 1280, heightDp = 800, name = "Tablet Landscape - Payment QR")
@Composable
fun PaymentQRScreenPreview() {
    MaterialTheme {
        PaymentQRScreen(navController = rememberNavController(), windowSize = WindowWidthSizeClass.Expanded)
    }
}
