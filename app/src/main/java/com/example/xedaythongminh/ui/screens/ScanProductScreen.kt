package com.example.xedaythongminh.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.animation.*
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
import com.example.xedaythongminh.ui.components.CartNotificationPill
import com.example.xedaythongminh.ui.theme.PrimaryBlue
import com.example.xedaythongminh.ui.theme.LightBlueBg
import com.example.xedaythongminh.ui.theme.BackgroundGray
import com.example.xedaythongminh.ui.theme.TextDark
import com.example.xedaythongminh.ui.theme.TextGray
import com.example.xedaythongminh.ui.theme.BorderGray
import com.example.xedaythongminh.ui.theme.GreenAccent
import com.example.xedaythongminh.ui.theme.ErrorRed
import com.example.xedaythongminh.ui.theme.ErrorLightBg
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
    val cartNotification by appViewModel.cartNotificationState.collectAsState()
    
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

    val userState by appViewModel.userState.collectAsState()
    val statusText = if (userState != null) "KH: ${userState?.name} | Wi-Fi | 85%" else "Khách Vãng Lai | Wi-Fi | 85%"

    Box(modifier = Modifier.fillMaxSize()) {
        Scaffold(
            modifier = Modifier.fillMaxSize(),
            containerColor = BackgroundGray,
            topBar = { TopBar(statusText = statusText, appViewModel = appViewModel) }
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
                                    com.example.xedaythongminh.data.remote.RetrofitClient.apiService.rootCheck() // test connection
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

        // Thông báo nhỏ khi thêm/bớt/xóa sản phẩm
        CartNotificationPill(
            notification = cartNotification,
            modifier = Modifier
                .align(Alignment.TopCenter)
                .padding(top = 16.dp)
        )
    }
}

@Composable
fun ScanProductScannerSection(
    modifier: Modifier = Modifier,
    appViewModel: AppViewModel,
    selectedCartItem: CartItem?
) {
    val errorMsg by appViewModel.errorState.collectAsState()
    val formatVnd = { amount: Long ->
        NumberFormat.getNumberInstance(Locale.forLanguageTag("vi-VN")).format(amount) + "đ"
    }

    Column(
        modifier = modifier
            .fillMaxHeight()
            .padding(12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // 1. Dòng thông báo tự động quét sản phẩm với quầng sáng neon nhấp nháy tinh tế
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            shape = RoundedCornerShape(12.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF00E5FF).copy(alpha = 0.5f))
        ) {
            Row(
                modifier = Modifier.padding(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Đốm sáng Neon Pulsing giả lập quét tự động
                Box(
                    modifier = Modifier
                        .size(10.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF00E5FF))
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = "Đang tự động quét sản phẩm...",
                    fontSize = 14.sp,
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
                    modifier = Modifier.padding(10.dp)
                )
            }
        }

        // 2. Vùng hiển thị chi tiết của sản phẩm vừa quét / đang được chọn
        Text(
            text = "Chi tiết sản phẩm",
            fontWeight = FontWeight.Bold,
            fontSize = 16.sp,
            color = TextDark
        )

        // Khung chi tiết sản phẩm kéo dài toàn bộ chiều cao màn hình bên dưới (thay thế khoảng trống của ô barcode cũ)
        ProductDetailBox(
            selectedCartItem = selectedCartItem,
            formatVnd = formatVnd,
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
        )
    }
}

@Composable
fun ProductDetailBox(
    selectedCartItem: CartItem?,
    formatVnd: (Long) -> String,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .shadow(2.dp, RoundedCornerShape(16.dp))
            .clip(RoundedCornerShape(16.dp))
            .background(Color.White)
            .border(1.dp, BorderGray, RoundedCornerShape(16.dp)),
        contentAlignment = Alignment.Center
    ) {
            if (selectedCartItem != null) {
                val product = selectedCartItem.product
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(20.dp)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Header Bar của thẻ chi tiết
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .background(Color(0xFFE8F8F0), RoundedCornerShape(20.dp))
                                .padding(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = "Verified",
                                tint = GreenAccent,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "ĐÃ XÁC THỰC CẢM BIẾN",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = GreenAccent
                            )
                        }

                        Box(
                            modifier = Modifier
                                .background(BackgroundGray, RoundedCornerShape(8.dp))
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Text(
                                text = "Mã SKU: ${product.sku}",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Medium,
                                color = TextGray
                            )
                        }
                    }

                    // Khối hình ảnh và thông tin chính
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(20.dp)
                    ) {
                        // Hình ảnh sản phẩm lớn
                        Box(
                            modifier = Modifier
                                .size(140.dp)
                                .clip(RoundedCornerShape(14.dp))
                                .background(LightBlueBg)
                                .border(1.dp, BorderGray, RoundedCornerShape(14.dp)),
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
                                    modifier = Modifier.size(80.dp)
                                )
                            }
                        }

                        // Thông tin tên và đơn giá
                        Column(
                            modifier = Modifier.weight(1f),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Text(
                                text = product.name,
                                fontSize = 24.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextDark,
                                lineHeight = 32.sp
                            )
                            Text(
                                text = "Đơn vị: Sản phẩm đóng gói",
                                fontSize = 13.sp,
                                color = TextGray
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .background(PrimaryBlue, RoundedCornerShape(8.dp))
                                        .padding(horizontal = 12.dp, vertical = 6.dp)
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

                    HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp), color = BorderGray.copy(alpha = 0.8f))

                    // Bento Grid: 3 Thẻ thông số giá và số lượng
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        // Thẻ Đơn giá
                        Card(
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = BackgroundGray)
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text("Đơn giá", fontSize = 12.sp, color = TextGray)
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = formatVnd(product.unitPrice),
                                    fontSize = 17.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextDark
                                )
                            }
                        }

                        // Thẻ Số lượng
                        Card(
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = BackgroundGray)
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text("Số lượng trong giỏ", fontSize = 12.sp, color = TextGray)
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "x${selectedCartItem.quantity}",
                                    fontSize = 17.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = PrimaryBlue
                                )
                            }
                        }

                        // Thẻ Thành tiền mục này
                        Card(
                            modifier = Modifier.weight(1.2f),
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = LightBlueBg)
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text("Thành tiền mục này", fontSize = 12.sp, color = PrimaryBlue)
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = formatVnd(selectedCartItem.totalPrice),
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = PrimaryBlue
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.weight(1f, fill = false))

                    // Hộp thông tin bảo mật & kiểm soát IoT
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFF0FDF4)),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFBBF7D0))
                    ) {
                        Column(
                            modifier = Modifier.padding(14.dp),
                            verticalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.Security,
                                    contentDescription = "IoT Security",
                                    tint = Color(0xFF16A34A),
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "Hệ thống kiểm soát an toàn Smart Stroller",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF166534)
                                )
                            }
                            Text(
                                text = "• Cảm biến tải trọng (Loadcell): Đã khớp trọng lượng chuẩn xác theo cơ sở dữ liệu.",
                                fontSize = 12.sp,
                                color = Color(0xFF15803D)
                            )
                            Text(
                                text = "• Để bỏ sản phẩm: Vui lòng nhấc sản phẩm ra khỏi giỏ hàng, hệ thống sẽ tự động trừ món này.",
                                fontSize = 12.sp,
                                color = Color(0xFF15803D)
                            )
                        }
                    }
                }
            } else {
                // Trạng thái trống (Empty State) kéo dài toàn bộ chiều cao
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(32.dp),
                    verticalArrangement = Arrangement.Center
                ) {
                    Box(
                        modifier = Modifier
                            .size(90.dp)
                            .clip(CircleShape)
                            .background(Color(0xFFF0F4F8)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.QrCodeScanner,
                            contentDescription = "Empty",
                            tint = PrimaryBlue,
                            modifier = Modifier.size(48.dp)
                        )
                    }
                    Spacer(modifier = Modifier.height(20.dp))
                    Text(
                        text = "Sẵn sàng nhận diện sản phẩm",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextDark,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Vui lòng đặt sản phẩm vào giỏ hàng xe đẩy để hệ thống cảm biến tự động nhận diện và tính tiền.\nHoặc chạm vào bất kỳ sản phẩm nào trong danh sách giỏ hàng bên phải để xem chi tiết tại đây.",
                        fontSize = 14.sp,
                        color = TextGray,
                        textAlign = TextAlign.Center,
                        lineHeight = 22.sp,
                        modifier = Modifier.widthIn(max = 440.dp)
                    )
                    Spacer(modifier = Modifier.height(24.dp))
                    Row(
                        modifier = Modifier
                            .background(LightBlueBg, RoundedCornerShape(20.dp))
                            .padding(horizontal = 16.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.TouchApp,
                            contentDescription = "Tip",
                            tint = PrimaryBlue,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Chạm vào sản phẩm trong giỏ để kiểm tra chi tiết",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium,
                            color = PrimaryBlue
                        )
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
    val listState = rememberLazyListState()
    val scope = rememberCoroutineScope()
    
    val formatVnd = { amount: Long ->
        NumberFormat.getNumberInstance(Locale.forLanguageTag("vi-VN")).format(amount) + "đ"
    }

    // Tự động cuộn đến sản phẩm mới nhất khi giỏ hàng có thêm sản phẩm
    LaunchedEffect(cartItems.size) {
        if (cartItems.isNotEmpty()) {
            listState.animateScrollToItem(cartItems.size - 1)
        }
    }

    // Trạng thái kiểm tra xem danh sách có đang bị cuộn xuống không
    val showScrollUp by remember {
        derivedStateOf {
            listState.firstVisibleItemIndex > 0 || listState.firstVisibleItemScrollOffset > 20
        }
    }

    Column(
        modifier = modifier
            .background(Color(0xFFF1F3F4))
            .padding(16.dp),
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

            Row(verticalAlignment = Alignment.CenterVertically) {
                // Nút cuộn nhanh trên thanh tiêu đề
                if (cartItems.size >= 2) {
                    IconButton(
                        onClick = {
                            scope.launch {
                                listState.animateScrollToItem(0)
                            }
                        },
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.KeyboardArrowUp,
                            contentDescription = "Cuộn lên",
                            tint = if (showScrollUp) PrimaryBlue else TextGray.copy(alpha = 0.4f),
                            modifier = Modifier.size(22.dp)
                        )
                    }
                    IconButton(
                        onClick = {
                            scope.launch {
                                listState.animateScrollToItem(cartItems.size - 1)
                            }
                        },
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.KeyboardArrowDown,
                            contentDescription = "Cuộn xuống",
                            tint = if (listState.canScrollForward) PrimaryBlue else TextGray.copy(alpha = 0.4f),
                            modifier = Modifier.size(22.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(4.dp))
                }
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
        
        // Product List (Fixed height inside Sidebar) with floating "Cuộn lên" button
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
        ) {
            LazyColumn(
                state = listState,
                modifier = Modifier.fillMaxSize(),
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
                        onClick = { onItemSelect(item) }
                    )
                }
            }

            // Nút nổi "Cuộn lên" hiển thị linh hoạt khi danh sách cuộn xuống
            if (showScrollUp) {
                FilledTonalButton(
                    onClick = {
                        scope.launch {
                            listState.animateScrollToItem(0)
                        }
                    },
                    colors = ButtonDefaults.filledTonalButtonColors(
                        containerColor = PrimaryBlue,
                        contentColor = Color.White
                    ),
                    shape = RoundedCornerShape(20.dp),
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 6.dp),
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp),
                    modifier = Modifier
                        .align(Alignment.TopCenter)
                        .padding(top = 8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.KeyboardArrowUp,
                        contentDescription = "Cuộn lên",
                        modifier = Modifier.size(18.dp),
                        tint = Color.White
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "Cuộn lên",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }
        }
        
        // Bottom Actions
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Button(
                onClick = { navController.navigate("cart_detail") },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(46.dp),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue)
            ) {
                Text("Xem chi tiết giỏ hàng", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Spacer(modifier = Modifier.width(6.dp))
                Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = "Forward", modifier = Modifier.size(18.dp), tint = Color.White)
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
    onClick: () -> Unit
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
                
                // Read-only Quantity Badge (Tự động đồng bộ với giỏ hàng xe đẩy)
                Box(
                    modifier = Modifier
                        .background(LightBlueBg, RoundedCornerShape(8.dp))
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "SL: $quantity",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = PrimaryBlue
                    )
                }
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

@Preview(showBackground = true, widthDp = 720, heightDp = 650, name = "Component - Product Detail (Active)")
@Composable
fun ProductDetailCardActivePreview() {
    MaterialTheme {
        val sampleProduct = com.example.xedaythongminh.data.models.Product(
            id = "8934567890123",
            name = "Bơ sáp 034 Đắk Lắk loại 1",
            sku = "SKU-893456789",
            unitPrice = 35000L,
            imageUrl = ""
        )
        val sampleItem = CartItem(
            product = sampleProduct,
            quantity = 2
        )
        Box(modifier = Modifier.fillMaxSize().padding(16.dp)) {
            ProductDetailBox(
                selectedCartItem = sampleItem,
                formatVnd = { amount -> java.text.NumberFormat.getNumberInstance(java.util.Locale.forLanguageTag("vi-VN")).format(amount) + "đ" },
                modifier = Modifier.fillMaxSize()
            )
        }
    }
}

@Preview(showBackground = true, widthDp = 720, heightDp = 650, name = "Component - Product Detail (Empty)")
@Composable
fun ProductDetailCardEmptyPreview() {
    MaterialTheme {
        Box(modifier = Modifier.fillMaxSize().padding(16.dp)) {
            ProductDetailBox(
                selectedCartItem = null,
                formatVnd = { amount -> java.text.NumberFormat.getNumberInstance(java.util.Locale.forLanguageTag("vi-VN")).format(amount) + "đ" },
                modifier = Modifier.fillMaxSize()
            )
        }
    }
}

@Preview(showBackground = true, widthDp = 420, heightDp = 100, name = "Component - Cart Item Row")
@Composable
fun CartItemRowPreview() {
    MaterialTheme {
        Box(modifier = Modifier.padding(12.dp)) {
            CartItem(
                title = "Bơ sáp 034 Đắk Lắk loại 1",
                price = "35.000đ",
                quantity = 2,
                isSelected = true,
                onClick = {}
            )
        }
    }
}
