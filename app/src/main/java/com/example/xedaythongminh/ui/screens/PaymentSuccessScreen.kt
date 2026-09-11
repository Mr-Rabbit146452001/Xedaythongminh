package com.example.xedaythongminh.ui.screens

import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.material3.windowsizeclass.WindowWidthSizeClass
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import com.example.xedaythongminh.R
import com.example.xedaythongminh.ui.theme.*
import com.example.xedaythongminh.ui.viewmodel.AppViewModel
import kotlinx.coroutines.delay

@Composable
fun PaymentSuccessScreen(
    appViewModel: AppViewModel = androidx.lifecycle.viewmodel.compose.viewModel(factory = com.example.xedaythongminh.ui.viewmodel.AppViewModelProvider.Factory),
    navController: NavController,
    windowSize: WindowWidthSizeClass = WindowWidthSizeClass.Expanded
) {
    val context = LocalContext.current
    var autoEndCountdown by remember { mutableIntStateOf(8) }

    // Khóa phím Back tuyệt đối: Không cho quay lại các trang trước sau khi đã thanh toán thành công
    BackHandler(enabled = true) {
        // Chặn phím Back
    }

    // Tự động tiến thẳng luồng sang kết thúc phiên sau 8 giây
    LaunchedEffect(Unit) {
        while (autoEndCountdown > 0) {
            delay(1000)
            autoEndCountdown--
        }
        appViewModel.terminateSessionImmediately()
        navController.navigate("session_ended") {
            popUpTo(0) { inclusive = true }
        }
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = BackgroundGray,
        topBar = { TopBar(statusText = stringResource(R.string.status_text_default)) }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Card(
                modifier = Modifier
                    .widthIn(min = 520.dp, max = 720.dp)
                    .fillMaxWidth(if (windowSize == WindowWidthSizeClass.Compact) 0.95f else 0.62f),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                shape = RoundedCornerShape(20.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 3.dp),
                border = BorderStroke(1.dp, BorderGray.copy(alpha = 0.5f))
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 36.dp, vertical = 36.dp)
                        .verticalScroll(rememberScrollState()),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    // Success Checkmark Badge (Double circle design)
                    Box(
                        modifier = Modifier
                            .size(96.dp)
                            .background(Color(0xFFE8F8F5), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Box(
                            modifier = Modifier
                                .size(74.dp)
                                .background(Color(0xFF2ECC71), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Check,
                                contentDescription = "Success",
                                tint = Color.White,
                                modifier = Modifier.size(44.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    Text(
                        text = stringResource(R.string.payment_success_title),
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextDark,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = "Cảm ơn bạn đã mua sắm. Giao dịch của bạn đã được\nxử lý an toàn.",
                        fontSize = 15.sp,
                        color = TextGray,
                        textAlign = TextAlign.Center,
                        lineHeight = 22.sp
                    )

                    Spacer(modifier = Modifier.height(32.dp))

                    // Action Buttons (Xuất hóa đơn & Gửi hóa đơn qua Gmail)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        OutlinedButton(
                            onClick = {
                                Toast.makeText(context, "Đã xuất hóa đơn thành công!", Toast.LENGTH_SHORT).show()
                            },
                            modifier = Modifier
                                .weight(1f)
                                .height(50.dp),
                            shape = RoundedCornerShape(12.dp),
                            border = BorderStroke(1.5.dp, PrimaryBlue),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 10.dp),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = PrimaryBlue)
                        ) {
                            Icon(Icons.Default.Download, contentDescription = null, tint = PrimaryBlue, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = stringResource(R.string.btn_download_receipt),
                                color = PrimaryBlue,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                maxLines = 1
                            )
                        }

                        OutlinedButton(
                            onClick = {
                                Toast.makeText(context, "Đã gửi hóa đơn qua Gmail của bạn!", Toast.LENGTH_SHORT).show()
                            },
                            modifier = Modifier
                                .weight(1f)
                                .height(50.dp),
                            shape = RoundedCornerShape(12.dp),
                            border = BorderStroke(1.5.dp, PrimaryBlue),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 10.dp),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = PrimaryBlue)
                        ) {
                            Icon(Icons.Default.Email, contentDescription = null, tint = PrimaryBlue, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = stringResource(R.string.btn_send_email),
                                color = PrimaryBlue,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                maxLines = 1
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Primary Button: Kết thúc phiên mua sắm
                    Button(
                        onClick = {
                            appViewModel.clearSession()
                            navController.navigate("session_ended") {
                                popUpTo(0) { inclusive = true }
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue)
                    ) {
                        Icon(Icons.Default.ShoppingBag, contentDescription = null, tint = Color.White, modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = stringResource(R.string.btn_end_session),
                            color = Color.White,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = "Tự động kết thúc phiên sau ${autoEndCountdown}s...",
                        fontSize = 13.sp,
                        color = TextGray,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }
    }
}

@Preview(showBackground = true, widthDp = 1280, heightDp = 800, name = "Tablet Landscape - Payment Success")
@Composable
fun PaymentSuccessScreenPreview() {
    MaterialTheme {
        PaymentSuccessScreen(navController = rememberNavController(), windowSize = WindowWidthSizeClass.Expanded)
    }
}
