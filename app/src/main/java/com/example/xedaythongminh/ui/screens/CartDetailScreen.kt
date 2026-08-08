package com.example.xedaythongminh.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import com.example.xedaythongminh.ui.viewmodel.AppViewModel
import androidx.compose.runtime.Composable
import androidx.compose.material3.windowsizeclass.WindowWidthSizeClass
import com.example.xedaythongminh.ui.theme.*
import com.example.xedaythongminh.R
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.xedaythongminh.data.models.CartSummary
import java.text.NumberFormat
import java.util.Locale
import com.example.xedaythongminh.ui.components.ResponsiveLayout
import coil.compose.AsyncImage
import androidx.compose.ui.layout.ContentScale

@Composable
fun CartDetailScreen(
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
            leftWeight = 0.65f,
            rightWeight = 0.35f,
            leftContent = { modifier ->
                Column(
                    modifier = modifier
                ) {
                    // Header Row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = stringResource(R.string.cart_detail_title),
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold,
                            color = TextDark
                        )
                        Spacer(modifier = Modifier.width(16.dp))
                        Box(
                            modifier = Modifier
                                .background(Color(0xFFE0E0E0), RoundedCornerShape(16.dp))
                                .padding(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Text(
                                text = "${cartItems.sumOf { it.quantity }} sản phẩm",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Medium,
                                color = TextDark
                            )
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(24.dp))
                    
                    // Product List
                    LazyColumn(
                        modifier = Modifier.weight(1f, fill = false).heightIn(max = 280.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(cartItems.size) { index ->
                            val item = cartItems[index]
                            DetailedCartItem(
                                title = item.product.name,
                                sku = item.product.sku,
                                unitPrice = formatVnd(item.product.unitPrice),
                                quantity = item.quantity,
                                totalPrice = formatVnd(item.totalPrice),
                                imageUrl = item.product.imageUrl
                            )
                        }
                    }
                }
            },
            rightContent = { modifier ->
                Card(
                    modifier = modifier,
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(2.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .padding(16.dp)
                            .androidx.compose.foundation.verticalScroll(androidx.compose.foundation.rememberScrollState())
                    ) {
                        Text(
                            text = "Tổng đơn hàng",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextDark
                        )
                        
                        Spacer(modifier = Modifier.height(24.dp))
                        
                        // Billing Rows
                        BillingRow(label = "Tạm tính", value = formatVnd(summary.subtotal), valueColor = TextDark)
                        Spacer(modifier = Modifier.height(12.dp))
                        BillingRow(label = "Giảm giá thành viên (${(summary.memberDiscountPercentage * 100).toInt()}%)", value = "-${formatVnd(summary.memberDiscount)}", valueColor = Color(0xFF2ECC71))
                        Spacer(modifier = Modifier.height(12.dp))
                        BillingRow(label = "Thuế VAT (${(summary.taxPercentage * 100).toInt()}%)", value = formatVnd(summary.taxAmount), valueColor = TextDark)
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        // Dashed Divider
                        androidx.compose.foundation.Canvas(modifier = Modifier.fillMaxWidth().height(1.dp)) {
                            drawLine(
                                color = BorderGray,
                                start = androidx.compose.ui.geometry.Offset(0f, 0f),
                                end = androidx.compose.ui.geometry.Offset(size.width, 0f),
                                strokeWidth = 2f,
                                pathEffect = PathEffect.dashPathEffect(floatArrayOf(10f, 10f), 0f)
                            )
                        }
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        // Total Payment Row
                        Text("Tổng thanh toán", fontSize = 16.sp, color = TextGray)
                        Text(
                            text = formatVnd(summary.finalTotal),
                            fontSize = 32.sp,
                            fontWeight = FontWeight.Bold,
                            color = PrimaryBlue
                        )
                        
                        Spacer(modifier = Modifier.height(24.dp))
                        
                        // Action Buttons
                        Button(
                            onClick = { navController.navigate("payment_selection") },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(56.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue)
                        ) {
                            Icon(Icons.Default.ShoppingCart, contentDescription = "Pay", tint = Color.White)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Thanh toán ngay", fontSize = 18.sp, fontWeight = FontWeight.Bold)
                        }
                        
                        Spacer(modifier = Modifier.height(12.dp))
                        
                        OutlinedButton(
                            onClick = { navController.navigate("scan_product") },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(48.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = TextDark),
                            border = androidx.compose.foundation.BorderStroke(1.dp, BorderGray)
                        ) {
                            Icon(Icons.Default.AddShoppingCart, contentDescription = "Continue", modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Tiếp tục mua sắm", fontWeight = FontWeight.Medium)
                        }
                        
                        Spacer(modifier = Modifier.height(24.dp))
                        
                        // Tip / Promo Box
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(LightBlueBg, RoundedCornerShape(12.dp))
                                .padding(16.dp),
                            verticalAlignment = Alignment.Top
                        ) {
                            Icon(
                                imageVector = Icons.Default.Stars,
                                contentDescription = "Promo",
                                tint = PrimaryBlue,
                                modifier = Modifier.size(24.dp)
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text(
                                    text = "Mẹo ưu đãi",
                                    fontWeight = FontWeight.Bold,
                                    color = PrimaryBlue,
                                    fontSize = 14.sp
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "Quét mã thành viên để nhận ưu đãi giảm giá lên tới 20% cho các sản phẩm Organic.",
                                    fontSize = 12.sp,
                                    color = PrimaryBlue,
                                    lineHeight = 18.sp
                                )
                            }
                        }
                    }
                }
            }
        )
    }
}

@Composable
fun DetailedCartItem(title: String, sku: String, unitPrice: String, quantity: Int, totalPrice: String, imageUrl: String = "") {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(2.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, BorderGray)
    ) {
        Box(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
            // For compact screens, stack vertically; for expanded, row
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Product Image
                Box(
                    modifier = Modifier
                        .size(80.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color(0xFFE0E0E0)),
                    contentAlignment = Alignment.Center
                ) {
                    if (!imageUrl.isNullOrBlank()) {
                        AsyncImage(
                            model = imageUrl,
                            contentDescription = "Product Image",
                            contentScale = ContentScale.Crop,
                            modifier = Modifier.fillMaxSize()
                        )
                    } else {
                        Icon(Icons.Default.Image, contentDescription = "Image Placeholder", tint = Color.Gray)
                    }
                }
                
                Spacer(modifier = Modifier.width(16.dp))
                
                // Info Column (Title, SKU, Unit Price)
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = title,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextDark,
                        maxLines = 1
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(text = sku, fontSize = 12.sp, color = TextGray)
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(verticalAlignment = Alignment.Bottom) {
                        Text("Đơn giá", fontSize = 12.sp, color = TextGray, modifier = Modifier.padding(bottom = 2.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(text = unitPrice, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = PrimaryBlue)
                    }
                }
                
                Spacer(modifier = Modifier.width(16.dp))
                
                // Quantity Selector Pill
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .background(Color(0xFFF5F5F5), RoundedCornerShape(24.dp))
                        .padding(horizontal = 8.dp, vertical = 6.dp)
                ) {
                    IconButton(
                        onClick = { /* TODO */ },
                        modifier = Modifier.size(28.dp).background(Color.White, CircleShape)
                    ) {
                        Icon(Icons.Default.Remove, contentDescription = "Decrease", tint = PrimaryBlue, modifier = Modifier.size(16.dp))
                    }
                    Text(
                        text = quantity.toString(),
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextDark,
                        modifier = Modifier.padding(horizontal = 16.dp)
                    )
                    IconButton(
                        onClick = { /* TODO */ },
                        modifier = Modifier.size(28.dp).background(Color.White, CircleShape)
                    ) {
                        Icon(Icons.Default.Add, contentDescription = "Increase", tint = PrimaryBlue, modifier = Modifier.size(16.dp))
                    }
                }
                
                Spacer(modifier = Modifier.width(32.dp))
                
                // Total Price Column
                Column(horizontalAlignment = Alignment.End) {
                    Text("Thành tiền", fontSize = 12.sp, color = TextGray)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = totalPrice,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextDark
                    )
                }
                
                Spacer(modifier = Modifier.width(40.dp)) // Make room for delete icon
            }
            
            // Delete Icon (Top Right)
            IconButton(
                onClick = { /* TODO */ },
                modifier = Modifier.align(Alignment.TopEnd)
            ) {
                Icon(Icons.Default.DeleteOutline, contentDescription = "Delete", tint = Color.Red)
            }
        }
    }
}

@Composable
fun BillingRow(label: String, value: String, valueColor: Color) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = label, fontSize = 14.sp, color = TextGray)
        Text(text = value, fontSize = 14.sp, fontWeight = FontWeight.Medium, color = valueColor)
    }
}

@Preview(showBackground = true, widthDp = 1280, heightDp = 800, name = "Tablet Landscape - Cart Detail")
@Composable
fun CartDetailScreenPreview() {
    MaterialTheme {
        CartDetailScreen(navController = rememberNavController(), windowSize = WindowWidthSizeClass.Expanded)
    }
}
