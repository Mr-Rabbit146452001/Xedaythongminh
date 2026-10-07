package com.example.xedaythongminh.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.material3.windowsizeclass.WindowWidthSizeClass
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import com.example.xedaythongminh.ui.viewmodel.AppViewModel
import com.example.xedaythongminh.ui.components.GlassButton
import com.example.xedaythongminh.ui.components.GlassButtonVariant
import com.example.xedaythongminh.ui.theme.*
import com.example.xedaythongminh.R
import androidx.compose.ui.res.stringResource
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@Composable
fun ScanCustomerScreen(
    appViewModel: AppViewModel = androidx.lifecycle.viewmodel.compose.viewModel(factory = com.example.xedaythongminh.ui.viewmodel.AppViewModelProvider.Factory),
    navController: NavController,
    windowSize: WindowWidthSizeClass = WindowWidthSizeClass.Expanded
) {
    val sessionQrUrl by appViewModel.sessionQrUrl.collectAsState()
    val userState by appViewModel.userState.collectAsState()

    // 1. Khởi động phiên đăng nhập QR Zalo-style khi vào màn hình (đồng thời đóng phiên cũ nếu có)
    LaunchedEffect(Unit) {
        appViewModel.completeActiveSession()
        appViewModel.startQrLoginSession()
    }

    // 2. Tự động chuyển trang khi đăng nhập thành công qua QR (chỉ chuyển khi đang ở đúng màn hình này)
    LaunchedEffect(userState) {
        if (userState != null) {
            val currentRoute = navController.currentBackStackEntry?.destination?.route
            if (currentRoute == "scan_customer") {
                navController.navigate("customer_info") {
                    popUpTo("scan_customer") { inclusive = true }
                }
            }
        }
    }

    // 3. Giải phóng tài nguyên/dừng polling khi rời màn hình
    DisposableEffect(Unit) {
        onDispose {
            appViewModel.stopQrLoginSession()
        }
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = BackgroundGray,
        topBar = { TopBar(statusText = "Chế độ Đăng nhập Khách hàng", appViewModel = appViewModel) }
    ) { innerPadding ->
        val isCompact = windowSize == WindowWidthSizeClass.Compact
        
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            contentAlignment = Alignment.Center
        ) {
            if (isCompact) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    QrLoginBox(
                        qrUrl = sessionQrUrl,
                        modifier = Modifier.fillMaxWidth(0.9f).aspectRatio(1f)
                    )
                    Spacer(modifier = Modifier.height(32.dp))
                    ScanCustomerInstructionBox(
                        navController = navController,
                        appViewModel = appViewModel,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            } else {
                Row(
                    modifier = Modifier.fillMaxWidth(0.92f),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    QrLoginBox(
                        qrUrl = sessionQrUrl,
                        modifier = Modifier.weight(1.1f).aspectRatio(1f)
                    )
                    Spacer(modifier = Modifier.width(48.dp))
                    ScanCustomerInstructionBox(
                        navController = navController,
                        appViewModel = appViewModel,
                        modifier = Modifier.weight(1.2f)
                    )
                }
            }
        }
    }
}

@Composable
fun QrLoginBox(qrUrl: String?, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier
            .clip(RoundedCornerShape(24.dp))
            .border(1.dp, BorderGray, RoundedCornerShape(24.dp)),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(32.dp),
            contentAlignment = Alignment.Center
        ) {
            if (qrUrl != null) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    QrCodeImage(
                        qrContent = qrUrl,
                        modifier = Modifier.weight(1f).aspectRatio(1f)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "QUÉT MÃ ĐỂ ĐĂNG NHẬP",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = PrimaryBlue,
                        letterSpacing = 1.5.sp
                    )
                }
            } else {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    CircularProgressIndicator(color = PrimaryBlue, strokeWidth = 3.dp)
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Đang tạo phiên đăng nhập...",
                        color = TextGray,
                        fontSize = 14.sp
                    )
                }
            }
        }
    }
}

@Composable
fun QrCodeImage(qrContent: String, modifier: Modifier = Modifier) {
    var bitmap by remember(qrContent) { mutableStateOf<android.graphics.Bitmap?>(null) }
    
    LaunchedEffect(qrContent) {
        withContext(Dispatchers.IO) {
            try {
                val encoded = java.net.URLEncoder.encode(qrContent, "UTF-8")
                val url = java.net.URL("https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=$encoded")
                val bytes = url.readBytes()
                val bmp = android.graphics.BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                bitmap = bmp
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
    
    Box(modifier = modifier, contentAlignment = Alignment.Center) {
        if (bitmap != null) {
            Image(
                bitmap = bitmap!!.asImageBitmap(),
                contentDescription = "QR Code Login",
                modifier = Modifier.fillMaxSize()
            )
        } else {
            CircularProgressIndicator(color = PrimaryBlue)
        }
    }
}

@Composable
fun ScanCustomerInstructionBox(
    navController: NavController,
    appViewModel: AppViewModel,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Đăng nhập quét QR",
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            color = PrimaryBlue
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = "Vui lòng mở ứng dụng quét mã QR trên điện thoại di động để quét mã QR bên trái và xác nhận liên kết tài khoản mua sắm của bạn.",
            fontSize = 16.sp,
            color = TextGray,
            lineHeight = 24.sp
        )
        Spacer(modifier = Modifier.height(32.dp))
        
        Row(
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            GlassButton(
                onClick = {
                    appViewModel.stopQrLoginSession()
                    appViewModel.completeActiveSession()
                    navController.navigate("welcome") { popUpTo("welcome") { inclusive = true } }
                },
                modifier = Modifier.weight(0.85f).height(52.dp),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 10.dp),
                variant = GlassButtonVariant.Secondary,
                shape = RoundedCornerShape(14.dp)
            ) {
                Text(
                    text = "Quay lại",
                    color = PrimaryBlue,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    maxLines = 1
                )
            }
            
            GlassButton(
                onClick = {
                    // Dừng phiên polling đăng nhập QR và kích hoạt tạo phiên mới UUID trên Server
                    appViewModel.stopQrLoginSession()
                    appViewModel.createShoppingSession(forceNew = true)
                    navController.navigate("scan_product") {
                        popUpTo("scan_customer") { inclusive = true }
                    }
                },
                modifier = Modifier.weight(1.35f).height(52.dp),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 10.dp),
                variant = GlassButtonVariant.Primary,
                shape = RoundedCornerShape(14.dp)
            ) {
                Text(
                    text = stringResource(R.string.btn_skip_login),
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    maxLines = 1,
                    softWrap = false
                )
            }
        }
    }
}

@Preview(showBackground = true, widthDp = 1280, heightDp = 800, name = "Tablet Landscape - Scan Customer")
@Composable
fun ScanCustomerScreenPreview() {
    MaterialTheme {
        ScanCustomerScreen(navController = rememberNavController(), windowSize = WindowWidthSizeClass.Expanded)
    }
}
