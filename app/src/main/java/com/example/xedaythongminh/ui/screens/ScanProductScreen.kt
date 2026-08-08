package com.example.xedaythongminh.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.automirrored.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import com.example.xedaythongminh.R
import com.example.xedaythongminh.data.models.CartItem
import com.example.xedaythongminh.data.models.CartSummary
import com.example.xedaythongminh.ui.components.ResponsiveLayout
import com.example.xedaythongminh.ui.theme.*
import com.example.xedaythongminh.ui.viewmodel.AppViewModel
import androidx.compose.material3.windowsizeclass.WindowWidthSizeClass
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.util.Locale
import coil.compose.AsyncImage

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ScanProductScreen(
    appViewModel: AppViewModel = androidx.lifecycle.viewmodel.compose.viewModel(factory = com.example.xedaythongminh.ui.viewmodel.AppViewModelProvider.Factory),
    navController: NavController,
    windowSize: WindowWidthSizeClass = WindowWidthSizeClass.Expanded
) {
    val cartItems by appViewModel.cartItemsState.collectAsState()
    
    // Trạng thái sản phẩm đang được chọn hiển thị chi tiết ở khung bên trái
    var selectedCartItem by remember { mutableStateOf<CartItem?>(null) }

    val hasUnscannedProduct by appViewModel.hasUnscannedProduct.collectAsState()
    val scope = rememberCoroutineScope()
    
    // Tự động chọn sản phẩm cuối cùng vừa được thêm vào giỏ hàng
    LaunchedEffect(cartItems) {
        if (cartItems.isNotEmpty()) {
            selectedCartItem = cartItems.last()
        } else {
            selectedCartItem = null
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        Scaffold(
            modifier = Modifier.fillMaxSize(),
            containerColor = BackgroundGray,
            topBar = { TopBar(statusText = "KH: Nguyễn Văn A | Wi-Fi | 85% | 14:30", appViewModel = appViewModel) }
        ) { innerPadding ->
            ResponsiveLayout(
                windowSize = windowSize,
                modifier = Modifier.padding(innerPadding),
                leftWeight = 0.6f,
                rightWeight = 0.4f,
                leftContent = { modifier ->
                    ScanProductScannerSection(
                        modifier = modifier,
                        appViewModel = appViewModel,
                        selectedCartItem = selectedCartItem
                    )
                },
                rightContent = { modifier ->
                    CartSidebar(
                        modifier = modifier,
                        appViewModel = appViewModel,
                        navController = navController,
                        selectedCartItem = selectedCartItem,
                        onItemSelect = { selectedCartItem = it }
                    )
                }
            )
        }

        // Popup cảnh báo sản phẩm chưa quét từ Server
        if (hasUnscannedProduct) {
            AlertDialog(
                onDismissRequest = {}, // Khóa không cho dismiss khi click bên ngoài
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Warning,
                            contentDescription = "Cảnh báo",
                            tint = Color(0xFFD32F2F),
                            modifier = Modifier.size(28.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Sản phẩm chưa được quét!",
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFD32F2F),
                            fontSize = 20.sp
                        )
                    }
                },
                text = {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(
                            text = "Phát hiện có sản phẩm được đặt vào xe đẩy nhưng chưa được quét mã vạch trên hệ thống.",
                            fontSize = 15.sp,
                            color = TextDark
                        )
                        Text(
                            text = "Vui lòng quét mã sản phẩm hoặc bỏ sản phẩm ra khỏi khay chứa đồ của xe đẩy để tiếp tục mua sắm.",
                            fontSize = 14.sp,
                            color = TextGray
                        )
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            // Giả lập gửi tín hiệu giải quyết lỗi về server để xóa cảnh báo
                            scope.launch {
                                try {
                                    com.example.xedaythongminh.data.remote.RetrofitClient.apiService.healthCheck() // test connection
                                    // Gọi API giả lập tắt trạng thái chưa quét
                                    val baseUrl = com.example.xedaythongminh.data.remote.RetrofitClient.getBaseUrl()
                                    val url = java.net.URL("${baseUrl}api/cart/unscanned-simulation?status=false")
                                    withContext(Dispatchers.IO) {
                                        url.readBytes() // Trigger API
                                    }
                                } catch (e: Exception) {
                                    e.printStackTrace()
                                }
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue)
                    ) {
                        Text("Đã giải quyết (Xóa cảnh báo)", color = Color.White)
                    }
                },
                shape = RoundedCornerShape(16.dp),
                containerColor = Color.White
            )
        }
    }
}

@Composable
fun ScanProductScannerSection(
    modifier: Modifier = Modifier,
    appViewModel: AppViewModel,
    selectedCartItem: CartItem?
) {
    var manualBarcode by remember { mutableStateOf("") }
    var manualQuantity by remember { mutableStateOf("1") }
    
    val errorMsg by appViewModel.errorState.collectAsState()
    val formatVnd = { amount: Long ->
        NumberFormat.getNumberInstance(Locale.forLanguageTag("vi-VN")).format(amount) + "đ"
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // 1. Dòng thông báo tự động quét sản phẩm với quầng sáng neon nhấp nháy tinh tế
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            shape = RoundedCornerShape(12.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF00E5FF).copy(alpha = 0.5f))
        ) {
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Đốm sáng Neon Pulsing giả lập quét tự động
                Box(
                    modifier = Modifier
                        .size(12.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF00E5FF))
                )
                Spacer(modifier = Modifier.width(16.dp))
                Text(
                    text = "Đang tự động quét sản phẩm...",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = PrimaryBlue,
                    letterSpacing = 0.5.sp
                )
            }
        }

        // Hiển thị lỗi mạng / lỗi không tìm thấy sản phẩm
        if (errorMsg != null) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFFFEBEE))
            ) {
                Text(
                    text = errorMsg ?: "",
                    color = Color.Red,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(12.dp)
                )
            }
        }

        // 2. Vùng hiển thị chi tiết của sản phẩm vừa quét / đang được chọn
        Text(
            text = "Chi tiết sản phẩm",
            fontWeight = FontWeight.Bold,
            fontSize = 20.sp,
            color = TextDark
        )

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .shadow(4.dp, RoundedCornerShape(16.dp))
                .clip(RoundedCornerShape(16.dp))
                .background(Color.White)
                .border(1.dp, BorderGray, RoundedCornerShape(16.dp)),
            contentAlignment = Alignment.Center
        ) {
            if (selectedCartItem != null) {
                val product = selectedCartItem.product
                Row(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(24.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(24.dp)
                ) {
                    // Hình ảnh sản phẩm lớn
                    Box(
                        modifier = Modifier
                            .size(160.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(LightBlueBg),
                        contentAlignment = Alignment.Center
                    ) {
                        if (!product.imageUrl.isNullOrBlank()) {
                            AsyncImage(
                                model = product.imageUrl,
                                contentDescription = "Product Image",
                                contentScale = ContentScale.Crop,
                                modifier = Modifier.fillMaxSize()
                            )
                        } else {
                            Icon(
                                imageVector = Icons.Default.ShoppingBag,
                                contentDescription = "Product Image",
                                tint = PrimaryBlue,
                                modifier = Modifier.size(72.dp)
                            )
                        }
                    }

                    // Thông tin chi tiết sản phẩm
                    Column(
                        modifier = Modifier.weight(1f),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = product.name,
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextDark,
                            lineHeight = 30.sp
                        )
                        Text(
                            text = "Mã SKU: ${product.sku}",
                            fontSize = 14.sp,
                            color = TextGray
                        )
                        Text(
                            text = "Đơn giá: ${formatVnd(product.unitPrice)}",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Medium,
                            color = TextDark
                        )
                        
                        Divider(modifier = Modifier.padding(vertical = 4.dp), color = BorderGray)
                        
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .background(PrimaryBlue, RoundedCornerShape(6.dp))
                                    .padding(horizontal = 10.dp, vertical = 6.dp)
                            ) {
                                Text(
                                    text = "Đã quét: ${selectedCartItem.quantity} sản phẩm",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                            }
                        }
                    }
                }
            } else {
                // Trạng thái trống (Empty State)
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.padding(32.dp),
                    verticalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Inbox,
                        contentDescription = "Empty",
                        tint = TextGray,
                        modifier = Modifier.size(64.dp)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Đang đợi sản phẩm được đặt vào khay...",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Medium,
                        color = TextDark,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Vui lòng đặt sản phẩm lên bàn cân xe đẩy hoặc nhập tay mã barcode bên dưới.",
                        fontSize = 13.sp,
                        color = TextGray,
                        textAlign = TextAlign.Center
                    )
                }
            }
        }

        // 3. Khung nhập tay mã barcode & số lượng dưới cùng
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            shape = RoundedCornerShape(16.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, BorderGray)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    text = "Nhập tay mã sản phẩm",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = TextDark
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Ô nhập Barcode (Chiếm 3/4 độ rộng)
                    OutlinedTextField(
                        value = manualBarcode,
                        onValueChange = { input ->
                            appViewModel.clearError() // Xóa thông báo lỗi cũ ngay khi bắt đầu nhập mới
                            
                            // Hỗ trợ đầu quét phần cứng tự động gửi phím Enter (\n hoặc \r)
                            if (input.contains("\n") || input.contains("\r")) {
                                val cleanBarcode = input.replace("\n", "").replace("\r", "").trim()
                                if (cleanBarcode.isNotBlank()) {
                                    val qty = manualQuantity.toIntOrNull() ?: 1
                                    appViewModel.addProductWithQuantity(cleanBarcode, qty)
                                    manualBarcode = ""
                                    manualQuantity = "1"
                                }
                            } else {
                                manualBarcode = input
                            }
                        },
                        placeholder = { Text("Nhập mã vạch sản phẩm", color = Color.Gray, fontSize = 14.sp) },
                        modifier = Modifier.weight(2.5f),
                        shape = RoundedCornerShape(10.dp),
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(
                            keyboardType = KeyboardType.Text,
                            imeAction = ImeAction.Done
                        ),
                        keyboardActions = KeyboardActions(
                            onDone = {
                                val qty = manualQuantity.toIntOrNull() ?: 1
                                if (manualBarcode.isNotBlank()) {
                                    appViewModel.addProductWithQuantity(manualBarcode, qty)
                                    manualBarcode = ""
                                    manualQuantity = "1"
                                }
                            }
                        ),
                        colors = OutlinedTextFieldDefaults.colors(
                            unfocusedContainerColor = BackgroundGray,
                            focusedContainerColor = BackgroundGray,
                            unfocusedBorderColor = BorderGray
                        )
                    )

                    // Ô nhập số lượng (Chiếm 1/4 độ rộng)
                    OutlinedTextField(
                        value = manualQuantity,
                        onValueChange = { 
                            if (it.isEmpty() || it.all { char -> char.isDigit() }) {
                                manualQuantity = it
                            }
                        },
                        placeholder = { Text("SL", color = Color.Gray, fontSize = 14.sp) },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp),
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        colors = OutlinedTextFieldDefaults.colors(
                            unfocusedContainerColor = BackgroundGray,
                            focusedContainerColor = BackgroundGray,
                            unfocusedBorderColor = BorderGray
                        )
                    )

                    // Nút cập nhật / thêm sản phẩm
                    Button(
                        onClick = {
                            val qty = manualQuantity.toIntOrNull() ?: 1
                            if (manualBarcode.isNotBlank()) {
                                appViewModel.addProductWithQuantity(manualBarcode, qty)
                                manualBarcode = ""
                                manualQuantity = "1"
                            }
                        },
                        modifier = Modifier.height(56.dp),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue)
                    ) {
                        Icon(Icons.Default.Add, contentDescription = "Add Item", tint = Color.White)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Thêm", fontWeight = FontWeight.Bold, color = Color.White)
                    }
                }
            }
        }
    }
}

@Composable
fun CartSidebar(
    modifier: Modifier = Modifier,
    appViewModel: AppViewModel,
    navController: NavController,
    selectedCartItem: CartItem?,
    onItemSelect: (CartItem) -> Unit
) {
    val cartItems by appViewModel.cartItemsState.collectAsState()
    val summary = CartSummary(cartItems)
    
    val formatVnd = { amount: Long ->
        NumberFormat.getNumberInstance(Locale.forLanguageTag("vi-VN")).format(amount) + "đ"
    }

    Column(
        modifier = modifier
            .background(Color(0xFFF1F3F4))
            .padding(16.dp)
            .fillMaxHeight(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Giỏ hàng hiện tại (${cartItems.size})",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = TextDark
            )
            TextButton(onClick = { appViewModel.clearSession() }) {
                Text("Xóa hết", color = Color.Red, fontSize = 14.sp, fontWeight = FontWeight.Bold)
            }
        }
        
        // Cart Total
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.Bottom
        ) {
            Text("Tổng cộng", style = MaterialTheme.typography.bodyLarge, color = TextGray)
            Text(
                text = formatVnd(summary.subtotal),
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                color = PrimaryBlue
            )
        }
        
        // Product List (Fixed height inside Sidebar)
        LazyColumn(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(cartItems.size) { index ->
                val item = cartItems[index]
                val isSelected = selectedCartItem?.product?.sku == item.product.sku
                CartItem(
                    title = item.product.name,
                    price = formatVnd(item.product.unitPrice),
                    quantity = item.quantity,
                    isSelected = isSelected,
                    imageUrl = item.product.imageUrl,
                    onClick = { onItemSelect(item) },
                    onIncrease = { appViewModel.increaseQuantity(item) },
                    onDecrease = { appViewModel.decreaseQuantity(item) },
                    onRemove = { appViewModel.removeCartItem(item) }
                )
            }
        }
        
        // Bottom Actions
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Button(
                onClick = { navController.navigate("cart_detail") },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue)
            ) {
                Text("Xem chi tiết giỏ hàng", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Spacer(modifier = Modifier.width(8.dp))
                Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = "Forward", modifier = Modifier.size(20.dp), tint = Color.White)
            }
        }
    }
}

@Composable
fun CartItem(
    title: String,
    price: String,
    quantity: Int,
    isSelected: Boolean,
    imageUrl: String = "",
    onClick: () -> Unit,
    onIncrease: () -> Unit,
    onDecrease: () -> Unit,
    onRemove: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .border(
                width = if (isSelected) 2.dp else 0.dp,
                color = if (isSelected) PrimaryBlue else Color.Transparent,
                shape = RoundedCornerShape(12.dp)
            ),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Image Placeholder
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(LightBlueBg),
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
                    Icon(Icons.Default.ShoppingBag, contentDescription = "Product", tint = PrimaryBlue, modifier = Modifier.size(28.dp))
                }
            }
            
            Spacer(modifier = Modifier.width(12.dp))
            
            // Text Content
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = TextDark,
                    maxLines = 2
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = price,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = PrimaryBlue
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                // Quantity Selector
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .border(1.dp, BorderGray, RoundedCornerShape(24.dp))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Remove,
                        contentDescription = "Decrease",
                        tint = TextGray,
                        modifier = Modifier.size(16.dp).clickable { onDecrease() }
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(text = quantity.toString(), fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.width(12.dp))
                    Icon(
                        imageVector = Icons.Default.Add,
                        contentDescription = "Increase",
                        tint = PrimaryBlue,
                        modifier = Modifier.size(16.dp).clickable { onIncrease() }
                    )
                }
            }
            
            // Delete Icon
            IconButton(onClick = { onRemove() }) {
                Icon(Icons.Default.Close, contentDescription = "Remove Item", tint = TextGray)
            }
        }
    }
}

@Preview(showBackground = true, widthDp = 1280, heightDp = 800, name = "Tablet Landscape - Scan Product")
@Composable
fun ScanProductScreenPreview() {
    MaterialTheme {
        ScanProductScreen(navController = rememberNavController(), windowSize = WindowWidthSizeClass.Expanded)
    }
}
