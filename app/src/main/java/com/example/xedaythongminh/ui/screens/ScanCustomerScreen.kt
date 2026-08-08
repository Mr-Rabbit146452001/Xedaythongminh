package com.example.xedaythongminh.ui.screens

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

    // 1. Khởi động phiên đăng nhập QR Zalo-style khi vào màn hình
    LaunchedEffect(Unit) {
        appViewModel.startQrLoginSession()
    }

    // 2. Tự động chuyển trang khi đăng nhập thành công qua QR
    LaunchedEffect(userState) {
        if (userState != null) {
            navController.navigate("customer_info") {
                popUpTo("scan_customer") { inclusive = true }
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
                    modifier = Modifier.fillMaxWidth(0.9f),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    QrLoginBox(
                        qrUrl = sessionQrUrl,
                        modifier = Modifier.weight(1.2f).aspectRatio(1f)
                    )
                    Spacer(modifier = Modifier.width(64.dp))
                    ScanCustomerInstructionBox(
                        navController = navController,
                        appViewModel = appViewModel,
                        modifier = Modifier.weight(1f)
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
        elevation = CardDefaults.cardElevation(4.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            contentAlignment = Alignment.Center
        ) {
            if (qrUrl != null) {
                val bitmapState = remember(qrUrl) { mutableStateOf<android.graphics.Bitmap?>(null) }
                
                LaunchedEffect(qrUrl) {
                    withContext(Dispatchers.IO) {
                        try {
                            val writer = com.google.zxing.qrcode.QRCodeWriter()
                            val bitMatrix = writer.encode(
                                qrUrl,
                                com.google.zxing.BarcodeFormat.QR_CODE,
                                512,
                                512
                            )
                            val width = bitMatrix.width
                            val height = bitMatrix.height
                            val bmp = android.graphics.Bitmap.createBitmap(width, height, android.graphics.Bitmap.Config.RGB_565)
                            for (x in 0 until width) {
                                for (y in 0 until height) {
                                    bmp.setPixel(x, y, if (bitMatrix.get(x, y)) android.graphics.Color.BLACK else android.graphics.Color.WHITE)
                                }
                            }
                            bitmapState.value = bmp
                        } catch (e: Exception) {
                            e.printStackTrace()
                        }
                    }
                }

                if (bitmapState.value != null) {
                    Image(
                        bitmap = bitmapState.value!!.asImageBitmap(),
                        contentDescription = "Mã QR Đăng Nhập",
                        modifier = Modifier.fillMaxSize()
                    )
                } else {
                    CircularProgressIndicator(color = PrimaryBlue)
                }
            } else {
                CircularProgressIndicator(color = PrimaryBlue)
            }
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
            text = "Quét mã để\nđăng nhập",
            fontSize = 36.sp,
            fontWeight = FontWeight.Bold,
            color = PrimaryBlue,
            lineHeight = 44.sp
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = "Dùng ứng dụng di động Siêu Thị / Zalo để quét mã QR trên màn hình xe đẩy và bắt đầu phiên mua sắm.",
            fontSize = 16.sp,
            color = TextGray,
            lineHeight = 24.sp
        )
        
        Spacer(modifier = Modifier.height(32.dp))
        
        Button(
            onClick = {
                // Giả lập quét QR thành công để test đăng nhập
                appViewModel.simulateQrScanSuccess()
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue)
        ) {
            Icon(Icons.Default.QrCodeScanner, contentDescription = null, tint = Color.White)
            Spacer(modifier = Modifier.width(8.dp))
            Text("Giả lập Đăng nhập (Demo Test)", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)
        }
        
        Spacer(modifier = Modifier.height(12.dp))

        OutlinedButton(
            onClick = { navController.navigate("scan_product") },
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            shape = RoundedCornerShape(12.dp),
            border = BorderStroke(1.dp, PrimaryBlue)
        ) {
            Text("Bỏ qua đăng nhập -> Mua hàng ngay", color = PrimaryBlue, fontSize = 16.sp, fontWeight = FontWeight.Bold)
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
