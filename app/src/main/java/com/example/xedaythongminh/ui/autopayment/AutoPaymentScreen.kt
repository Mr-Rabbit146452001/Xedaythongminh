package com.example.xedaythongminh.ui.autopayment

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.material3.windowsizeclass.WindowWidthSizeClass
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import com.example.xedaythongminh.R
import com.example.xedaythongminh.data.models.CartSummary
import com.example.xedaythongminh.domain.model.AutoPaymentStatus
import com.example.xedaythongminh.domain.model.PaymentMethod
import com.example.xedaythongminh.domain.model.PaymentMethodType
import com.example.xedaythongminh.ui.components.ResponsiveLayout
import com.example.xedaythongminh.ui.screens.TopBar
import com.example.xedaythongminh.ui.theme.*
import com.example.xedaythongminh.ui.viewmodel.AppViewModel
import java.text.NumberFormat
import java.util.Locale

@Composable
fun AutoPaymentScreen(
    autoPaymentViewModel: AutoPaymentViewModel = androidx.lifecycle.viewmodel.compose.viewModel(factory = com.example.xedaythongminh.ui.viewmodel.AppViewModelProvider.Factory),
    appViewModel: AppViewModel = androidx.lifecycle.viewmodel.compose.viewModel(factory = com.example.xedaythongminh.ui.viewmodel.AppViewModelProvider.Factory),
    navController: NavController,
    windowSize: WindowWidthSizeClass = WindowWidthSizeClass.Expanded
) {
    val uiState by autoPaymentViewModel.uiState.collectAsState()
    val userState by appViewModel.userState.collectAsState()
    val summary = CartSummary(uiState.cartItems)

    val formatVnd = { amount: Long ->
        NumberFormat.getNumberInstance(Locale.forLanguageTag("vi-VN")).format(amount) + "đ"
    }

    val customerId = userState?.id ?: "CUSTOMER_888"

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = BackgroundGray,
        topBar = { TopBar(statusText = "Thanh toán tự động") }
    ) { innerPadding ->
        ResponsiveLayout(
            windowSize = windowSize,
            modifier = Modifier.padding(innerPadding),
            leftWeight = 0.45f,
            rightWeight = 0.55f,
            leftContent = { modifier ->
                Column(
                    modifier = modifier
                        .fillMaxSize()
                        .padding(end = if (windowSize == WindowWidthSizeClass.Expanded) 8.dp else 0.dp)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // 1. Tóm tắt hóa đơn
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        shape = RoundedCornerShape(16.dp),
                        border = BorderStroke(1.dp, BorderGray)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "Đơn hàng của bạn",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextDark
                                )
                                Text(
                                    text = "${uiState.cartItems.sumOf { it.quantity }} sản phẩm",
                                    fontSize = 13.sp,
                                    color = TextGray
                                )
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            // Danh sách sản phẩm rút gọn
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .heightIn(max = 160.dp)
                                    .verticalScroll(rememberScrollState()),
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                uiState.cartItems.forEach { item ->
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Column(modifier = Modifier.weight(1f)) {
                                            Text(
                                                text = item.product.name,
                                                fontWeight = FontWeight.SemiBold,
                                                fontSize = 14.sp,
                                                color = TextDark,
                                                maxLines = 1
                                            )
                                            Text(
                                                text = "SL: ${item.quantity} × ${formatVnd(item.product.unitPrice)}",
                                                fontSize = 12.sp,
                                                color = TextGray
                                            )
                                        }
                                        Text(
                                            text = formatVnd(item.totalPrice),
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 14.sp,
                                            color = TextDark
                                        )
                                    }
                                }
                            }

                            HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp), color = BorderGray)

                            // Chi tiết giá
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("Tạm tính:", fontSize = 13.sp, color = TextGray)
                                Text(formatVnd(summary.subtotal), fontSize = 13.sp, color = TextDark)
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("Giảm giá hội viên (10%):", fontSize = 13.sp, color = Color(0xFF2ECC71))
                                Text("-${formatVnd(summary.memberDiscount)}", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color(0xFF2ECC71))
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("Thuế VAT (8%):", fontSize = 13.sp, color = TextGray)
                                Text(formatVnd(summary.taxAmount), fontSize = 13.sp, color = TextDark)
                            }
                            Spacer(modifier = Modifier.height(12.dp))

                            // Tổng tiền nổi bật
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(LightBlueBg, RoundedCornerShape(12.dp))
                                    .padding(12.dp)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text("CẦN THANH TOÁN:", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = PrimaryBlue)
                                    Text(
                                        text = formatVnd(summary.finalTotal),
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 22.sp,
                                        color = PrimaryBlue
                                    )
                                }
                            }
                        }
                    }

                    // 2. Chọn Phương thức thanh toán tự động
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        shape = RoundedCornerShape(16.dp),
                        border = BorderStroke(1.dp, BorderGray)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(Icons.Default.AccountBalanceWallet, contentDescription = null, tint = PrimaryBlue, modifier = Modifier.size(20.dp))
                                Text(
                                    text = "Nguồn tiền trừ tự động",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextDark
                                )
                            }
                            Spacer(modifier = Modifier.height(12.dp))

                            uiState.availableMethods.forEach { method ->
                                val isSelected = uiState.selectedMethod?.id == method.id
                                val isEnabled = uiState.status == AutoPaymentStatus.IDLE || uiState.status == AutoPaymentStatus.FAILED

                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 4.dp)
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(if (isSelected) LightBlueBg else Color(0xFFFAFAFA))
                                        .border(
                                            width = if (isSelected) 2.dp else 1.dp,
                                            color = if (isSelected) PrimaryBlue else BorderGray,
                                            shape = RoundedCornerShape(12.dp)
                                        )
                                        .clickable(enabled = isEnabled) {
                                            autoPaymentViewModel.onEvent(AutoPaymentUiEvent.SelectMethod(method))
                                        }
                                        .padding(12.dp)
                                ) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(
                                            imageVector = getPaymentIcon(method.type),
                                            contentDescription = null,
                                            tint = if (isSelected) PrimaryBlue else TextGray,
                                            modifier = Modifier.size(28.dp)
                                        )
                                        Spacer(modifier = Modifier.width(12.dp))
                                        Column(modifier = Modifier.weight(1f)) {
                                            Text(
                                                text = method.name,
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 14.sp,
                                                color = if (isSelected) PrimaryBlue else TextDark
                                            )
                                            Spacer(modifier = Modifier.height(2.dp))
                                            Text(
                                                text = "${method.maskedNumber} • Số dư: ${formatVnd(method.balance)}",
                                                fontSize = 12.sp,
                                                color = TextGray
                                            )
                                        }
                                        if (isSelected) {
                                            Icon(
                                                imageVector = Icons.Default.CheckCircle,
                                                contentDescription = "Selected",
                                                tint = PrimaryBlue,
                                                modifier = Modifier.size(20.dp)
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            rightContent = { modifier ->
                Card(
                    modifier = modifier
                        .fillMaxSize()
                        .padding(start = if (windowSize == WindowWidthSizeClass.Expanded) 8.dp else 0.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    shape = RoundedCornerShape(16.dp),
                    border = BorderStroke(1.dp, BorderGray)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(24.dp)
                            .verticalScroll(rememberScrollState()),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.SpaceBetween
                    ) {
                        // Tiêu đề & Stepper
                        Column(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.Center
                            ) {
                                Icon(Icons.Default.Bolt, contentDescription = null, tint = Color(0xFFF39C12), modifier = Modifier.size(28.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "Thanh toán tự động",
                                    fontSize = 24.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = PrimaryBlue
                                )
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "Hệ thống tự động kiểm tra giỏ hàng và trừ tiền an toàn",
                                fontSize = 13.sp,
                                color = TextGray,
                                textAlign = TextAlign.Center
                            )

                            Spacer(modifier = Modifier.height(24.dp))

                            // Thanh quy trình 4 bước
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceEvenly,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                StepItem(number = "1", label = "Giỏ hàng", active = uiState.currentStepIndex >= 1)
                                StepDivider(active = uiState.currentStepIndex >= 2)
                                StepItem(number = "2", label = "Xác thực", active = uiState.currentStepIndex >= 2)
                                StepDivider(active = uiState.currentStepIndex >= 3)
                                StepItem(number = "3", label = "Trừ tiền", active = uiState.currentStepIndex >= 3)
                                StepDivider(active = uiState.currentStepIndex >= 4)
                                StepItem(number = "4", label = "Hoàn tất", active = uiState.currentStepIndex >= 4)
                            }
                        }

                        Spacer(modifier = Modifier.height(24.dp))

                        // Trung tâm tương tác động (Dynamic Center Area)
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .weight(1f, fill = false),
                            contentAlignment = Alignment.Center
                        ) {
                            when (uiState.status) {
                                AutoPaymentStatus.IDLE -> {
                                    Column(
                                        horizontalAlignment = Alignment.CenterHorizontally,
                                        verticalArrangement = Arrangement.spacedBy(16.dp)
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .size(90.dp)
                                                .background(LightBlueBg, CircleShape),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.FlashOn,
                                                contentDescription = "Ready",
                                                tint = PrimaryBlue,
                                                modifier = Modifier.size(50.dp)
                                            )
                                        }

                                        Text(
                                            text = "Sẵn sàng thanh toán",
                                            fontSize = 20.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = TextDark
                                        )
                                        Text(
                                            text = "Phương thức: ${uiState.selectedMethod?.name ?: "Ví điện tử"}\nNhấn nút bên dưới để tiến hành thanh toán tự động.",
                                            fontSize = 14.sp,
                                            color = TextGray,
                                            textAlign = TextAlign.Center
                                        )
                                    }
                                }

                                AutoPaymentStatus.VERIFYING_CART,
                                AutoPaymentStatus.AUTHORIZING,
                                AutoPaymentStatus.CHARGING -> {
                                    Column(
                                        horizontalAlignment = Alignment.CenterHorizontally,
                                        verticalArrangement = Arrangement.spacedBy(20.dp)
                                    ) {
                                        CircularProgressIndicator(
                                            modifier = Modifier.size(72.dp),
                                            color = PrimaryBlue,
                                            strokeWidth = 6.dp
                                        )
                                        Text(
                                            text = uiState.statusMessage,
                                            fontSize = 17.sp,
                                            fontWeight = FontWeight.SemiBold,
                                            color = PrimaryBlue,
                                            textAlign = TextAlign.Center
                                        )
                                        Text(
                                            text = "Vui lòng giữ nguyên xe đẩy trong khu vực thanh toán...",
                                            fontSize = 13.sp,
                                            color = TextGray
                                        )
                                    }
                                }

                                AutoPaymentStatus.SUCCESS -> {
                                    Column(
                                        horizontalAlignment = Alignment.CenterHorizontally,
                                        verticalArrangement = Arrangement.spacedBy(16.dp)
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .size(80.dp)
                                                .background(Color(0xFF82F57A), CircleShape),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Icon(Icons.Default.Check, contentDescription = "Success", tint = Color(0xFF004D00), modifier = Modifier.size(48.dp))
                                        }

                                        Text(
                                            text = "Thanh toán thành công!",
                                            fontSize = 22.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = TextDark
                                        )

                                        val receipt = uiState.receipt
                                        if (receipt != null) {
                                            Card(
                                                modifier = Modifier.fillMaxWidth(0.9f),
                                                colors = CardDefaults.cardColors(containerColor = Color(0xFFF9F9F9)),
                                                shape = RoundedCornerShape(12.dp)
                                            ) {
                                                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                                        Text("Mã GD:", fontSize = 12.sp, color = TextGray)
                                                        Text(receipt.transactionId, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextDark)
                                                    }
                                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                                        Text("Số tiền trừ:", fontSize = 12.sp, color = TextGray)
                                                        Text(formatVnd(receipt.finalAmount), fontSize = 14.sp, fontWeight = FontWeight.Bold, color = PrimaryBlue)
                                                    }
                                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                                        Text("Điểm thưởng:", fontSize = 12.sp, color = TextGray)
                                                        Text("+${receipt.pointsEarned} PTS", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color(0xFF2ECC71))
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }

                                AutoPaymentStatus.FAILED -> {
                                    Column(
                                        horizontalAlignment = Alignment.CenterHorizontally,
                                        verticalArrangement = Arrangement.spacedBy(16.dp)
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .size(80.dp)
                                                .background(Color(0xFFFFEBEE), CircleShape),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Icon(Icons.Default.ErrorOutline, contentDescription = "Error", tint = Color(0xFFD32F2F), modifier = Modifier.size(48.dp))
                                        }

                                        Text(
                                            text = "Thanh toán chưa hoàn tất",
                                            fontSize = 20.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Color(0xFFD32F2F)
                                        )

                                        Card(
                                            modifier = Modifier.fillMaxWidth(0.9f),
                                            colors = CardDefaults.cardColors(containerColor = Color(0xFFFFF3F3)),
                                            border = BorderStroke(1.dp, Color(0xFFFFCDD2)),
                                            shape = RoundedCornerShape(12.dp)
                                        ) {
                                            Text(
                                                text = uiState.errorMessage ?: "Đã có sự cố xảy ra trong quá trình thanh toán.",
                                                fontSize = 13.sp,
                                                color = Color(0xFFC62828),
                                                modifier = Modifier.padding(14.dp),
                                                textAlign = TextAlign.Center
                                            )
                                        }
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(24.dp))

                        // Nút hành động dưới cùng
                        Column(
                            modifier = Modifier.fillMaxWidth(),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            when (uiState.status) {
                                AutoPaymentStatus.IDLE -> {
                                    Button(
                                        onClick = {
                                            autoPaymentViewModel.onEvent(
                                                AutoPaymentUiEvent.StartAutoPayment(
                                                    customerId = customerId,
                                                    sessionId = "SESSION_DEFAULT"
                                                )
                                            )
                                        },
                                        modifier = Modifier.fillMaxWidth().height(50.dp),
                                        shape = RoundedCornerShape(12.dp),
                                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue),
                                        enabled = uiState.cartItems.isNotEmpty() && uiState.selectedMethod != null
                                    ) {
                                        Icon(Icons.Default.Bolt, contentDescription = null, tint = Color.White)
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text(
                                            text = "Xác nhận & Thanh toán tự động",
                                            fontSize = 16.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Color.White
                                        )
                                    }

                                    OutlinedButton(
                                        onClick = { navController.popBackStack() },
                                        modifier = Modifier.fillMaxWidth().height(44.dp),
                                        shape = RoundedCornerShape(12.dp),
                                        border = BorderStroke(1.dp, BorderGray)
                                    ) {
                                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null, tint = TextDark, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text("Quay lại", color = TextDark, fontSize = 14.sp)
                                    }
                                }

                                AutoPaymentStatus.SUCCESS -> {
                                    Button(
                                        onClick = {
                                            // Điều hướng tới màn hình thành công chuẩn của App
                                            navController.navigate("payment_success") {
                                                popUpTo("cart_detail") { inclusive = true }
                                            }
                                        },
                                        modifier = Modifier.fillMaxWidth().height(50.dp),
                                        shape = RoundedCornerShape(12.dp),
                                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue)
                                    ) {
                                        Icon(Icons.Default.Receipt, contentDescription = null, tint = Color.White)
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text("Xem hóa đơn điện tử", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                                    }
                                }

                                AutoPaymentStatus.FAILED -> {
                                    Button(
                                        onClick = { autoPaymentViewModel.onEvent(AutoPaymentUiEvent.Retry) },
                                        modifier = Modifier.fillMaxWidth().height(50.dp),
                                        shape = RoundedCornerShape(12.dp),
                                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue)
                                    ) {
                                        Icon(Icons.Default.Refresh, contentDescription = null, tint = Color.White)
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text("Thử lại", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                                    }

                                    OutlinedButton(
                                        onClick = { navController.navigate("payment_selection") },
                                        modifier = Modifier.fillMaxWidth().height(44.dp),
                                        shape = RoundedCornerShape(12.dp),
                                        border = BorderStroke(1.dp, PrimaryBlue)
                                    ) {
                                        Text("Chọn phương thức khác", color = PrimaryBlue, fontSize = 14.sp, fontWeight = FontWeight.Medium)
                                    }
                                }

                                else -> {
                                    // Trong lúc đang xử lý (loading)
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .height(48.dp)
                                            .background(Color(0xFFEEEEEE), RoundedCornerShape(12.dp)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text("Đang xử lý giao dịch an toàn...", color = TextGray, fontSize = 14.sp)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        )
    }
}

@Composable
private fun StepItem(number: String, label: String, active: Boolean) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Box(
            modifier = Modifier
                .size(28.dp)
                .background(if (active) PrimaryBlue else Color(0xFFE0E0E0), CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = number,
                color = if (active) Color.White else TextGray,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold
            )
        }
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = label,
            fontSize = 11.sp,
            color = if (active) PrimaryBlue else TextGray,
            fontWeight = if (active) FontWeight.Bold else FontWeight.Normal
        )
    }
}

@Composable
private fun StepDivider(active: Boolean) {
    Box(
        modifier = Modifier
            .width(28.dp)
            .height(2.dp)
            .background(if (active) PrimaryBlue else Color(0xFFE0E0E0))
    )
}

private fun getPaymentIcon(type: PaymentMethodType): ImageVector {
    return when (type) {
        PaymentMethodType.E_WALLET -> Icons.Default.AccountBalanceWallet
        PaymentMethodType.CREDIT_DEBIT_CARD -> Icons.Default.CreditCard
        PaymentMethodType.MEMBER_ACCOUNT -> Icons.Default.Badge
    }
}

@Preview(showBackground = true, widthDp = 1280, heightDp = 800, name = "Tablet Landscape - Auto Payment")
@Composable
fun AutoPaymentScreenPreview() {
    MaterialTheme {
        AutoPaymentScreen(navController = rememberNavController(), windowSize = WindowWidthSizeClass.Expanded)
    }
}
