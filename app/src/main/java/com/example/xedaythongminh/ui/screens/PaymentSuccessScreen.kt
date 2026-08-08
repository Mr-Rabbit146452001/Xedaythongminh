package com.example.xedaythongminh.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import com.example.xedaythongminh.ui.viewmodel.AppViewModel
import androidx.compose.runtime.Composable
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.xedaythongminh.data.models.CartSummary
import java.text.NumberFormat
import java.util.Locale
import androidx.compose.material3.windowsizeclass.WindowWidthSizeClass
import com.example.xedaythongminh.ui.theme.*
import com.example.xedaythongminh.R
import androidx.compose.ui.res.stringResource
import com.example.xedaythongminh.ui.components.ResponsiveLayout

@Composable
fun PaymentSuccessScreen(
    appViewModel: AppViewModel = androidx.lifecycle.viewmodel.compose.viewModel(factory = com.example.xedaythongminh.ui.viewmodel.AppViewModelProvider.Factory),
    navController: NavController,
    windowSize: WindowWidthSizeClass = WindowWidthSizeClass.Expanded
) {
    val cartItems by appViewModel.cartItemsState.collectAsState()
    val summary = CartSummary(cartItems)
    
    val formatVnd = { amount: Long ->
        NumberFormat.getNumberInstance(Locale.forLanguageTag("vi-VN")).format(amount) + "đ"
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = BackgroundGray,
        topBar = { TopBar(statusText = stringResource(R.string.status_text_default)) }
    ) { innerPadding ->
        ResponsiveLayout(
            windowSize = windowSize,
            modifier = Modifier.padding(innerPadding),
            leftWeight = 0.55f,
            rightWeight = 0.45f,
            leftContent = { modifier ->
                Column(
                    modifier = modifier,
                    verticalArrangement = Arrangement.SpaceBetween
                ) {
                    // Main Success Card
                    Card(
                        modifier = Modifier.weight(1f, fill = false).fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        shape = RoundedCornerShape(16.dp),
                        elevation = CardDefaults.cardElevation(2.dp)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(32.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center
                        ) {
                            // Green Checkmark
                            Box(
                                modifier = Modifier
                                    .size(100.dp)
                                    .background(Color(0xFF82F57A), CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Check,
                                    contentDescription = "Success",
                                    tint = Color(0xFF004D00),
                                    modifier = Modifier.size(56.dp)
                                )
                            }
                            
                            Spacer(modifier = Modifier.height(32.dp))
                            
                            Text(
                                text = stringResource(R.string.payment_success_title),
                                fontSize = 32.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextDark
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = "Cảm ơn bạn đã mua sắm. Giao dịch của bạn đã được\nxử lý an toàn.",
                                fontSize = 16.sp,
                                color = TextGray,
                                textAlign = TextAlign.Center,
                                lineHeight = 24.sp
                            )
                            
                            Spacer(modifier = Modifier.height(48.dp))
                            
                            // Action Buttons
                            Row(
                                modifier = Modifier.fillMaxWidth(0.8f),
                                horizontalArrangement = Arrangement.spacedBy(16.dp)
                            ) {
                                OutlinedButton(
                                    onClick = { 
                                        appViewModel.clearSession()
                                        navController.navigate("session_ended") 
                                    },
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(48.dp),
                                    shape = RoundedCornerShape(12.dp),
                                    border = BorderStroke(1.dp, PrimaryBlue)
                                ) {
                                    Icon(Icons.Default.Download, contentDescription = null, tint = PrimaryBlue, modifier = Modifier.size(20.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(stringResource(R.string.btn_download_receipt), color = PrimaryBlue, fontWeight = FontWeight.Bold)
                                }
                                
                                OutlinedButton(
                                    onClick = { 
                                        appViewModel.clearSession()
                                        navController.navigate("session_ended") 
                                    },
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(48.dp),
                                    shape = RoundedCornerShape(12.dp),
                                    border = BorderStroke(1.dp, PrimaryBlue)
                                ) {
                                    Icon(Icons.Default.Email, contentDescription = null, tint = PrimaryBlue, modifier = Modifier.size(20.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(stringResource(R.string.btn_send_email), color = PrimaryBlue, fontWeight = FontWeight.Bold)
                                }
                            }
                            
                            Spacer(modifier = Modifier.height(16.dp))
                            
                            Button(
                                onClick = { 
                                    appViewModel.clearSession()
                                    navController.navigate("session_ended") 
                                },
                                modifier = Modifier
                                    .fillMaxWidth(0.8f)
                                    .height(56.dp),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue)
                            ) {
                                Icon(Icons.Default.ShoppingBag, contentDescription = null, tint = Color.White)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(stringResource(R.string.btn_end_session), color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(24.dp))
                    
                    // Points Banner
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(PrimaryBlue, RoundedCornerShape(16.dp))
                            .padding(24.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Điểm tích lũy mới", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                            Spacer(modifier = Modifier.height(8.dp))
                            Text("Bạn vừa nhận được thêm 50 điểm từ hóa đơn này.", color = Color(0xCCFFFFFF), fontSize = 14.sp)
                        }
                        
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("+50", color = Color.White, fontSize = 36.sp, fontWeight = FontWeight.Bold)
                            Text("POINTS", color = Color(0xCCFFFFFF), fontSize = 14.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            },
            rightContent = { modifier ->
                Card(
                    modifier = modifier,
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    shape = RoundedCornerShape(16.dp),
                    elevation = CardDefaults.cardElevation(2.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(24.dp)
                    ) {
                        // Header
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.Top
                        ) {
                            Column {
                                Text(stringResource(R.string.receipt_title), fontSize = 20.sp, fontWeight = FontWeight.Bold, color = TextDark)
                                Spacer(modifier = Modifier.height(4.dp))
                                Text("Mã #HD12345", fontSize = 14.sp, color = TextGray)
                            }
                            Box(
                                modifier = Modifier
                                    .background(Color(0xFFEEEEEE), RoundedCornerShape(8.dp))
                                    .padding(8.dp)
                            ) {
                                Icon(Icons.Default.QrCode, contentDescription = "QR", tint = TextDark)
                            }
                        }
                        
                        Spacer(modifier = Modifier.height(24.dp))
                        
                        // Meta Info
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Thời gian:", fontSize = 12.sp, color = TextGray)
                            Text("14:30 - 24/05/2024", fontSize = 12.sp, color = TextDark)
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Cửa hàng:", fontSize = 12.sp, color = TextGray)
                            Text("Smart Mart Central", fontSize = 12.sp, color = TextDark)
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Thu ngân:", fontSize = 12.sp, color = TextGray)
                            Text("Tự động - Cart #42", fontSize = 12.sp, color = TextDark)
                        }
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        HorizontalDivider(color = BorderGray)
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        // Purchased Items
                        LazyColumn(modifier = if (windowSize == WindowWidthSizeClass.Compact) Modifier.heightIn(max = 200.dp) else Modifier.weight(1f)) {
                            items(cartItems.size) { index ->
                                val item = cartItems[index]
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 8.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(40.dp)
                                            .clip(RoundedCornerShape(8.dp))
                                            .background(Color(0xFFE0E0E0)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(Icons.Default.Image, contentDescription = null, tint = Color.Gray, modifier = Modifier.size(20.dp))
                                    }
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(item.product.name, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = TextDark)
                                        Text("Số lượng: ${item.quantity}", fontSize = 12.sp, color = TextGray)
                                    }
                                    Text(formatVnd(item.totalPrice), fontSize = 14.sp, color = TextDark)
                                }
                            }
                        }
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        HorizontalDivider(color = BorderGray)
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        // Footer
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Tạm tính", fontSize = 14.sp, color = TextGray)
                            Text(formatVnd(summary.subtotal), fontSize = 14.sp, color = TextDark)
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Giảm giá (Voucher)", fontSize = 14.sp, color = TextGray)
                            Text("- ${formatVnd(summary.memberDiscount)}", fontSize = 14.sp, color = Color(0xFFE74C3C))
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("VAT (${(summary.taxPercentage * 100).toInt()}%)", fontSize = 14.sp, color = TextGray)
                            Text(formatVnd(summary.taxAmount), fontSize = 14.sp, color = TextDark)
                        }
                        
                        Spacer(modifier = Modifier.height(24.dp))
                        
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("TỔNG TIỀN", fontSize = 16.sp, color = TextGray)
                            Text(
                                text = formatVnd(summary.finalTotal),
                                fontSize = 28.sp,
                                fontWeight = FontWeight.Bold,
                                color = PrimaryBlue
                            )
                        }
                    }
                }
            }
        )
    }
}

@Preview(showBackground = true, widthDp = 1280, heightDp = 800, name = "Tablet Landscape - Payment Success")
@Composable
fun PaymentSuccessScreenPreview() {
    MaterialTheme {
        PaymentSuccessScreen(navController = rememberNavController(), windowSize = WindowWidthSizeClass.Expanded)
    }
}
