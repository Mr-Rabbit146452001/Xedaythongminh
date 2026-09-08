package com.example.xedaythongminh.ui.navigation

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.material3.windowsizeclass.WindowWidthSizeClass
import com.example.xedaythongminh.ui.screens.CartDetailScreen
import com.example.xedaythongminh.ui.screens.ScanCustomerScreen
import com.example.xedaythongminh.ui.screens.ScanProductScreen
import com.example.xedaythongminh.ui.screens.WelcomeScreen
import com.example.xedaythongminh.ui.screens.SplashScreen
import com.example.xedaythongminh.ui.screens.CustomerInfoScreen
import com.example.xedaythongminh.ui.screens.PaymentSelectionScreen
import com.example.xedaythongminh.ui.screens.PaymentQRScreen
import com.example.xedaythongminh.ui.screens.PaymentSuccessScreen
import com.example.xedaythongminh.ui.screens.SessionEndedScreen
import com.example.xedaythongminh.ui.screens.ConnectionErrorScreen
import com.example.xedaythongminh.ui.screens.ServerSettingsDialog
import com.example.xedaythongminh.ui.viewmodel.AppViewModel
import com.example.xedaythongminh.ui.viewmodel.AppViewModelProvider
import com.example.xedaythongminh.ui.theme.TextGray
import com.example.xedaythongminh.ui.theme.PrimaryBlue

@Composable
fun AppNavigation(
    appViewModel: AppViewModel = viewModel(factory = AppViewModelProvider.Factory),
    windowSize: WindowWidthSizeClass
) {
    val navController = rememberNavController()
    val isConnected by appViewModel.isServerConnected.collectAsState()
    var showSettingsDialog by remember { mutableStateOf(false) }

    Box(modifier = Modifier.fillMaxSize()) {
        NavHost(navController = navController, startDestination = "splash") {
            composable("splash") {
                SplashScreen(navController = navController)
            }
            composable("welcome") {
                WelcomeScreen(appViewModel = appViewModel, navController = navController, windowSize = windowSize) 
            }
            composable("scan_customer") {
                ScanCustomerScreen(appViewModel = appViewModel, navController = navController, windowSize = windowSize)
            }
            composable("customer_info") {
                CustomerInfoScreen(appViewModel = appViewModel, navController = navController, windowSize = windowSize)
            }
            composable("scan_product") {
                ScanProductScreen(appViewModel = appViewModel, navController = navController, windowSize = windowSize)
            }
            composable("cart_detail") {
                CartDetailScreen(appViewModel = appViewModel, navController = navController, windowSize = windowSize)
            }
            composable("payment_selection") {
                PaymentSelectionScreen(appViewModel = appViewModel, navController = navController, windowSize = windowSize)
            }
            composable("auto_payment") {
                val autoPaymentViewModel: com.example.xedaythongminh.ui.autopayment.AutoPaymentViewModel = viewModel(factory = AppViewModelProvider.Factory)
                com.example.xedaythongminh.ui.autopayment.AutoPaymentScreen(
                    autoPaymentViewModel = autoPaymentViewModel,
                    appViewModel = appViewModel,
                    navController = navController,
                    windowSize = windowSize
                )
            }
            composable("payment_qr") {
                PaymentQRScreen(appViewModel = appViewModel, navController = navController, windowSize = windowSize)
            }
            composable("payment_success") {
                PaymentSuccessScreen(appViewModel = appViewModel, navController = navController, windowSize = windowSize)
            }
            composable("session_ended") {
                SessionEndedScreen(appViewModel = appViewModel, navController = navController, windowSize = windowSize)
            }
            composable("connection_error") {
                ConnectionErrorScreen(appViewModel = appViewModel, navController = navController, windowSize = windowSize)
            }
        }

        // Overlay toàn màn hình khóa tương tác khi mất mạng
        if (!isConnected) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.7f))
                    .clickable(enabled = false) {}, // Nuốt toàn bộ sự kiện click bên dưới
                contentAlignment = Alignment.Center
            ) {
                Card(
                    modifier = Modifier
                        .padding(32.dp)
                        .widthIn(max = 450.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        CircularProgressIndicator(
                            color = Color(0xFFD32F2F),
                            strokeWidth = 4.dp,
                            modifier = Modifier.size(56.dp)
                        )
                        Spacer(modifier = Modifier.height(24.dp))
                        Text(
                            text = "Mất kết nối máy chủ!",
                            fontWeight = FontWeight.Bold,
                            fontSize = 22.sp,
                            color = Color(0xFFD32F2F)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "Hệ thống đang thử kết nối lại với máy chủ. Vui lòng kiểm tra Wi-Fi hoặc thiết bị phát mạng của xe đẩy.",
                            fontSize = 15.sp,
                            color = TextGray,
                            textAlign = TextAlign.Center,
                            lineHeight = 22.sp
                        )
                        Spacer(modifier = Modifier.height(24.dp))
                        
                        // Nút cấu hình Server IP khi bị chặn màn hình
                        Button(
                            onClick = { showSettingsDialog = true },
                            colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth().height(48.dp)
                        ) {
                            Text(
                                text = "Thay đổi IP cấu hình",
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp
                            )
                        }
                    }
                }
            }
        }

        if (showSettingsDialog) {
            ServerSettingsDialog(
                appViewModel = appViewModel,
                onDismiss = { showSettingsDialog = false }
            )
        }
    }
}
