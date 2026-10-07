package com.example.xedaythongminh.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.*
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.material3.windowsizeclass.WindowWidthSizeClass
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.zIndex
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import coil.compose.AsyncImage
import com.example.xedaythongminh.R
import com.example.xedaythongminh.data.models.CartItem
import com.example.xedaythongminh.data.models.CartSummary
import com.example.xedaythongminh.data.models.Product
import com.example.xedaythongminh.data.models.User
import com.example.xedaythongminh.data.models.CartNotification
import com.example.xedaythongminh.data.models.NotificationType
import com.example.xedaythongminh.ui.components.CartNotificationPill
import com.example.xedaythongminh.ui.components.GlassButton
import com.example.xedaythongminh.ui.components.GlassButtonVariant
import com.example.xedaythongminh.ui.components.OrganicGlassBackground
import com.example.xedaythongminh.ui.components.RemoveProductDialog
import com.example.xedaythongminh.ui.components.ResponsiveLayout
import com.example.xedaythongminh.ui.theme.*
import com.example.xedaythongminh.ui.viewmodel.AppViewModel
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.util.Locale

/**
 * CartDetailScreen: Màn hình chi tiết giỏ hàng xe đẩy thông minh (Stateful Composable)
 * Kết nối dữ liệu thời gian thực từ AppViewModel và điều hướng NavController.
 */
@Composable
fun CartDetailScreen(
    appViewModel: AppViewModel = androidx.lifecycle.viewmodel.compose.viewModel(factory = com.example.xedaythongminh.ui.viewmodel.AppViewModelProvider.Factory),
    navController: NavController,
    windowSize: WindowWidthSizeClass = WindowWidthSizeClass.Expanded
) {
    val cartItems by appViewModel.cartItemsState.collectAsState()
    val cartNotification by appViewModel.cartNotificationState.collectAsState()
    val userState by appViewModel.userState.collectAsState()
    var showRemoveDialog by remember { mutableStateOf(false) }

    CartDetailContent(
        cartItems = cartItems,
        userState = userState,
        cartNotification = cartNotification,
        windowSize = windowSize,
        showRemoveDialog = showRemoveDialog,
        onShowRemoveDialogChange = { showRemoveDialog = it },
        onBack = {
            if (!navController.popBackStack()) {
                navController.navigate("scan_product")
            }
        },
        onContinueShopping = {
            if (!navController.popBackStack()) {
                navController.navigate("scan_product")
            }
        },
        onEndSession = {
            appViewModel.clearSession()
            appViewModel.logoutUser()
            navController.navigate("welcome") {
                popUpTo(0) { inclusive = true }
            }
        },
        onAutoPayment = {
            appViewModel.lockCart()
            navController.navigate("auto_payment")
        },
        onOtherPayment = {
            appViewModel.lockCart()
            navController.navigate("payment_selection")
        },
        onSendRemoveCommand = {
            appViewModel.sendSystemRemoveCommand()
        },
        onRemoveBarcode = { barcode ->
            appViewModel.removeProductByBarcode(barcode)
        }
    )
}

/**
 * CartDetailContent: Composable thuần giao diện (Stateless Composable)
 * Giúp hiển thị trực quan 100% trên Jetpack Compose Preview của Android Studio mà không phụ thuộc vào ViewModel/Network.
 */
@Composable
fun CartDetailContent(
    cartItems: List<CartItem>,
    userState: User? = null,
    cartNotification: CartNotification? = null,
    windowSize: WindowWidthSizeClass = WindowWidthSizeClass.Expanded,
    showRemoveDialog: Boolean = false,
    onShowRemoveDialogChange: (Boolean) -> Unit = {},
    onBack: () -> Unit = {},
    onContinueShopping: () -> Unit = {},
    onEndSession: () -> Unit = {},
    onAutoPayment: () -> Unit = {},
    onOtherPayment: () -> Unit = {},
    onSendRemoveCommand: () -> Unit = {},
    onRemoveBarcode: (String) -> Unit = {}
) {
    val summary = CartSummary(cartItems, userState)
    val listState = rememberLazyListState()
    val scope = rememberCoroutineScope()

    val formatVnd = { amount: Long ->
        NumberFormat.getNumberInstance(Locale.forLanguageTag("vi-VN")).format(amount) + "đ"
    }

    val showScrollUp by remember {
        derivedStateOf {
            listState.firstVisibleItemIndex > 0 || listState.firstVisibleItemScrollOffset > 20
        }
    }

    val statusText = if (userState != null) "KH: ${userState.name} | Wi-Fi | 85%" else stringResource(R.string.status_text_default)

    OrganicGlassBackground(modifier = Modifier.fillMaxSize()) {
        Scaffold(
            modifier = Modifier.fillMaxSize(),
            containerColor = Color.Transparent,
            topBar = { TopBar(statusText = statusText) }
        ) { innerPadding ->
            if (cartItems.isEmpty()) {
                EmptyCartView(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding),
                    onContinueShopping = onContinueShopping,
                    onEndSession = onEndSession
                )
            } else {
                ResponsiveLayout(
                    windowSize = windowSize,
                    modifier = Modifier.padding(innerPadding),
                    leftWeight = 0.65f,
                    rightWeight = 0.35f,
                    leftContent = { modifier ->
                        CartItemsListSection(
                            modifier = modifier,
                            cartItems = cartItems,
                            listState = listState,
                            showScrollUp = showScrollUp,
                            formatVnd = formatVnd,
                            onBack = onBack,
                            onOpenRemoveDialog = {
                                onSendRemoveCommand()
                                onShowRemoveDialogChange(true)
                            },
                            onScrollToTop = {
                                scope.launch { listState.animateScrollToItem(0) }
                            },
                            onScrollToBottom = {
                                scope.launch { listState.animateScrollToItem(cartItems.size - 1) }
                            }
                        )
                    },
                    rightContent = { modifier ->
                        OrderSummarySection(
                            modifier = modifier,
                            summary = summary,
                            userState = userState,
                            formatVnd = formatVnd,
                            onAutoPayment = onAutoPayment,
                            onOtherPayment = onOtherPayment,
                            onOpenRemoveDialog = {
                                onSendRemoveCommand()
                                onShowRemoveDialogChange(true)
                            },
                            onContinueShopping = onContinueShopping
                        )
                    }
                )
            }
        }

        // Popup hướng dẫn quét mã vạch để bớt sản phẩm kèm đếm ngược 15s
        if (showRemoveDialog) {
            RemoveProductDialog(
                cartItems = cartItems,
                onBarcodeScanned = { barcode ->
                    onRemoveBarcode(barcode)
                    true
                },
                onDismiss = {
                    onShowRemoveDialogChange(false)
                }
            )
        }

        // Thông báo nổi bật khi thêm/bớt/xóa sản phẩm
        CartNotificationPill(
            notification = cartNotification,
            modifier = Modifier
                .align(Alignment.TopCenter)
                .padding(top = 76.dp)
                .zIndex(100f)
        )
    }
}

/**
 * Cột bên trái: Danh sách sản phẩm trong giỏ hàng kèm thanh thao tác nhanh
 */
@Composable
fun CartItemsListSection(
    modifier: Modifier = Modifier,
    cartItems: List<CartItem>,
    listState: LazyListState,
    showScrollUp: Boolean,
    formatVnd: (Long) -> String,
    onBack: () -> Unit,
    onOpenRemoveDialog: () -> Unit,
    onScrollToTop: () -> Unit,
    onScrollToBottom: () -> Unit
) {
    Column(modifier = modifier) {
        // Header Row: Nút quay lại, Tiêu đề, Số lượng món, Nút bớt món
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Quay lại",
                    tint = TextDark
                )
            }
            Spacer(modifier = Modifier.width(8.dp))
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
            Spacer(modifier = Modifier.width(12.dp))

            // Nút thao tác nhanh bớt/xóa món trên thanh tiêu đề
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color(0xFFFFEBEE))
                    .border(1.dp, Color(0xFFFFCDD2), RoundedCornerShape(16.dp))
                    .clickable { onOpenRemoveDialog() }
                    .padding(horizontal = 12.dp, vertical = 6.dp)
            )
            Spacer(modifier = Modifier.weight(1f))
            if (cartItems.size >= 2) {
                IconButton(
                    onClick = onScrollToTop,
                    modifier = Modifier.size(36.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.KeyboardArrowUp,
                        contentDescription = "Cuộn lên",
                        tint = if (showScrollUp) PrimaryBlue else TextGray.copy(alpha = 0.4f),
                        modifier = Modifier.size(24.dp)
                    )
                }
                IconButton(
                    onClick = onScrollToBottom,
                    modifier = Modifier.size(36.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.KeyboardArrowDown,
                        contentDescription = "Cuộn xuống",
                        tint = if (listState.canScrollForward) PrimaryBlue else TextGray.copy(alpha = 0.4f),
                        modifier = Modifier.size(24.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Product List with floating "Cuộn lên" button
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

            // Nút nổi "Cuộn lên" hiển thị linh hoạt khi danh sách cuộn xuống
            if (showScrollUp) {
                FilledTonalButton(
                    onClick = onScrollToTop,
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
    }
}

/**
 * Cột bên phải: Thẻ Tổng đơn hàng, chiết khấu hội viên và các nút thanh toán
 */
@Composable
fun OrderSummarySection(
    modifier: Modifier = Modifier,
    summary: CartSummary,
    userState: User?,
    formatVnd: (Long) -> String,
    onAutoPayment: () -> Unit,
    onOtherPayment: () -> Unit,
    onOpenRemoveDialog: () -> Unit,
    onContinueShopping: () -> Unit
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column(
            modifier = Modifier
                .padding(16.dp)
                .verticalScroll(rememberScrollState())
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
            if (userState != null && summary.memberDiscount > 0L) {
                Spacer(modifier = Modifier.height(12.dp))
                BillingRow(
                    label = summary.appliedVoucherName ?: "Voucher giảm giá (${(summary.memberDiscountPercentage * 100).toInt()}%)",
                    value = "-${formatVnd(summary.memberDiscount)}",
                    valueColor = Color(0xFF2ECC71)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Dashed Divider
            androidx.compose.foundation.Canvas(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(1.dp)
            ) {
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
            GlassButton(
                onClick = onAutoPayment,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp),
                shape = RoundedCornerShape(14.dp),
                variant = GlassButtonVariant.Primary
            ) {
                Spacer(modifier = Modifier.width(8.dp))
                Text("Thanh toán tự động", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
            }

            Spacer(modifier = Modifier.height(10.dp))

            GlassButton(
                onClick = onOtherPayment,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                shape = RoundedCornerShape(14.dp),
                variant = GlassButtonVariant.Secondary
            ) {
                Icon(Icons.Default.CreditCard, contentDescription = "Other Pay", tint = PrimaryBlue, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Phương thức thanh toán khác", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = PrimaryBlue)
            }

            Spacer(modifier = Modifier.height(10.dp))

            GlassButton(
                onClick = onContinueShopping,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                shape = RoundedCornerShape(14.dp),
                variant = GlassButtonVariant.Ghost
            ) {
                Icon(Icons.Default.AddShoppingCart, contentDescription = "Continue", modifier = Modifier.size(18.dp), tint = PrimaryBlue)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Tiếp tục mua sắm", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = PrimaryBlue)
            }
        }
    }
}

/**
 * EmptyCartView: Giao diện khi giỏ hàng chưa có sản phẩm nào
 */
@Composable
fun EmptyCartView(
    modifier: Modifier = Modifier,
    onContinueShopping: () -> Unit,
    onEndSession: () -> Unit
) {
    Box(
        modifier = modifier,
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier
                .widthIn(max = 560.dp)
                .fillMaxWidth(0.9f)
                .padding(16.dp),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
            border = BorderStroke(1.dp, BorderGray)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 32.dp, vertical = 40.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Box(
                    modifier = Modifier
                        .size(96.dp)
                        .background(Color(0xFFF0F4F8), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.RemoveShoppingCart,
                        contentDescription = "Giỏ hàng trống",
                        tint = PrimaryBlue,
                        modifier = Modifier.size(48.dp)
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                Text(
                    text = "Giỏ hàng của bạn đang trống",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color = TextDark,
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(10.dp))

                Text(
                    text = "Hiện tại chưa có sản phẩm nào trong giỏ hàng.\nBạn có thể tiếp tục mua sắm hoặc kết thúc phiên sử dụng xe đẩy ngay bây giờ.",
                    fontSize = 15.sp,
                    color = TextGray,
                    textAlign = TextAlign.Center,
                    lineHeight = 22.sp
                )

                Spacer(modifier = Modifier.height(36.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    GlassButton(
                        onClick = onContinueShopping,
                        modifier = Modifier
                            .weight(1f)
                            .height(52.dp),
                        shape = RoundedCornerShape(14.dp),
                        variant = GlassButtonVariant.Primary
                    ) {
                        Icon(
                            imageVector = Icons.Default.AddShoppingCart,
                            contentDescription = "Tiếp tục mua hàng",
                            tint = Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Tiếp tục mua hàng",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }

                    GlassButton(
                        onClick = onEndSession,
                        modifier = Modifier
                            .weight(1f)
                            .height(52.dp),
                        shape = RoundedCornerShape(14.dp),
                        variant = GlassButtonVariant.Danger
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ExitToApp,
                            contentDescription = "Kết thúc phiên",
                            tint = Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Kết thúc phiên",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                }
            }
        }
    }
}

/**
 * DetailedCartItem: Thẻ hiển thị một dòng sản phẩm chi tiết trong giỏ hàng
 */
@Composable
fun DetailedCartItem(
    title: String,
    sku: String,
    unitPrice: String,
    quantity: Int,
    totalPrice: String,
    imageUrl: String = ""
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(2.dp),
        border = BorderStroke(1.dp, BorderGray)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(80.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color(0xFFE0E0E0)),
                    contentAlignment = Alignment.Center
                ) {
                    if (imageUrl.isNotBlank()) {
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

                Box(
                    modifier = Modifier
                        .background(Color(0xFFF0F4F8), RoundedCornerShape(20.dp))
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "SL: $quantity",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = PrimaryBlue
                    )
                }

                Spacer(modifier = Modifier.width(32.dp))

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

// ==========================================
// DỮ LIỆU GIẢ LẬP PHỤC VỤ HIỂN THỊ TRỰC QUAN (@PREVIEW MOCK DATA)
// ==========================================

private val mockCartProducts = listOf(
    Product(
        id = "8934563123456",
        name = "Sữa Tươi Tiệt Trùng Vinamilk 100% 1L",
        sku = "8934563123456",
        unitPrice = 36000L,
        imageUrl = ""
    ),
    Product(
        id = "8935001712345",
        name = "Bơ sáp 034 Đắk Lắk Hàng Tuyển Loại 1",
        sku = "8935001712345",
        unitPrice = 45000L,
        imageUrl = ""
    ),
    Product(
        id = "8936036012345",
        name = "Bánh Quy Oreo Socola Kem Vani 133g",
        sku = "8936036012345",
        unitPrice = 18000L,
        imageUrl = ""
    ),
    Product(
        id = "8934588012345",
        name = "Nước Giải Khát Coca-Cola Lon Sleek 320ml",
        sku = "8934588012345",
        unitPrice = 10000L,
        imageUrl = ""
    )
)

private val mockSampleCartItems = listOf(
    CartItem(product = mockCartProducts[0], quantity = 2), // 72.000đ
    CartItem(product = mockCartProducts[1], quantity = 1), // 45.000đ
    CartItem(product = mockCartProducts[2], quantity = 3), // 54.000đ
    CartItem(product = mockCartProducts[3], quantity = 6)  // 60.000đ
) // Tổng tạm tính: 231.000đ

private val mockVipUser = User(
    id = "CUST_VIP_888",
    name = "Nguyễn Văn An",
    membershipLevel = "Hội Viên Kim Cương",
    points = 1850,
    phoneNumber = "0987.654.321",
    vouchers = listOf("Voucher VIP Giảm 20% Toàn Đơn Hàng", "Miễn phí giao xe tận nhà"),
    promotions = listOf("Tặng 1 bình nước giữ nhiệt khi mua 2 hộp sữa")
)

// ==========================================
// CÁC HÀM @PREVIEW TRỰC QUAN ĐẦY ĐỦ CÁC TRẠNG THÁI TRÊN ANDROID STUDIO
// ==========================================

/**
 * 1. Xem trước: Màn hình Giỏ Hàng Có Sản Phẩm (Tablet Ngang 1280x800)
 */
@Preview(
    showBackground = true,
    widthDp = 1280,
    heightDp = 800,
    name = "1. Giỏ Hàng Có Sản Phẩm (Tablet Landscape 1280x800)"
)
@Composable
fun PreviewCartDetailWithItems() {
    MaterialTheme {
        CartDetailContent(
            cartItems = mockSampleCartItems,
            userState = null,
            windowSize = WindowWidthSizeClass.Expanded
        )
    }
}

/**
 * 2. Xem trước: Khách hàng VIP có Chiết Khấu / Voucher giảm giá 20% (Member Discount)
 */
@Preview(
    showBackground = true,
    widthDp = 1280,
    heightDp = 800,
    name = "2. Khách Hàng VIP Có Giảm Giá (VIP 20% Discount)"
)
@Composable
fun PreviewCartDetailVipDiscount() {
    MaterialTheme {
        CartDetailContent(
            cartItems = mockSampleCartItems,
            userState = mockVipUser,
            windowSize = WindowWidthSizeClass.Expanded
        )
    }
}

/**
 * 3. Xem trước: Giỏ hàng trống (Empty Cart View)
 */
@Preview(
    showBackground = true,
    widthDp = 1280,
    heightDp = 800,
    name = "3. Giỏ Hàng Trống (Empty Cart View)"
)
@Composable
fun PreviewCartDetailEmpty() {
    MaterialTheme {
        CartDetailContent(
            cartItems = emptyList(),
            userState = null,
            windowSize = WindowWidthSizeClass.Expanded
        )
    }
}

/**
 * 4. Xem trước: Đang mở Popup Bớt / Xóa Món (Remove Product Dialog Active)
 */
@Preview(
    showBackground = true,
    widthDp = 1280,
    heightDp = 800,
    name = "4. Popup Bớt Món Đang Mở (Remove Dialog Active)"
)
@Composable
fun PreviewCartDetailWithRemoveDialog() {
    MaterialTheme {
        CartDetailContent(
            cartItems = mockSampleCartItems,
            userState = null,
            windowSize = WindowWidthSizeClass.Expanded,
            showRemoveDialog = true
        )
    }
}

/**
 * 5. Xem trước: Thông báo nổi Đã thêm món (Cart Notification Pill)
 */
@Preview(
    showBackground = true,
    widthDp = 1280,
    heightDp = 800,
    name = "5. Thông Báo Nổi Đã Thêm Món (Cart Toast Pill)"
)
@Composable
fun PreviewCartDetailWithNotification() {
    MaterialTheme {
        CartDetailContent(
            cartItems = mockSampleCartItems,
            userState = null,
            cartNotification = CartNotification(
                message = "Đã thêm: Sữa Tươi Vinamilk 100%",
                productName = "Sữa Tươi Vinamilk 100%",
                type = NotificationType.ADD
            ),
            windowSize = WindowWidthSizeClass.Expanded
        )
    }
}

/**
 * 6. Xem trước: Màn hình dọc trên Thiết bị di động (Compact Mobile 412x915)
 */
@Preview(
    showBackground = true,
    widthDp = 412,
    heightDp = 915,
    name = "6. Màn Hình Dọc Thiết Bị Di Động (Compact Mobile)"
)
@Composable
fun PreviewCartDetailCompactMobile() {
    MaterialTheme {
        CartDetailContent(
            cartItems = mockSampleCartItems,
            userState = null,
            windowSize = WindowWidthSizeClass.Compact
        )
    }
}

/**
 * 7. Xem trước: Thẻ Sản Phẩm Chi Tiết Riêng Lẻ (Detailed Cart Item Component)
 */
@Preview(
    showBackground = true,
    widthDp = 750,
    heightDp = 130,
    name = "7. Component - Thẻ Sản Phẩm Chi Tiết (Detailed Cart Item)"
)
@Composable
fun PreviewDetailedCartItemComponent() {
    MaterialTheme {
        Box(modifier = Modifier.padding(16.dp)) {
            DetailedCartItem(
                title = "Bơ sáp 034 Đắk Lắk Hàng Tuyển Loại 1",
                sku = "8935001712345",
                unitPrice = "45.000đ",
                quantity = 2,
                totalPrice = "90.000đ",
                imageUrl = ""
            )
        }
    }
}

/**
 * 8. Xem trước: Thẻ Tổng Kết Hóa Đơn & Nút Thanh Toán (Order Summary Card)
 */
@Preview(
    showBackground = true,
    widthDp = 420,
    heightDp = 520,
    name = "8. Component - Thẻ Tổng Đơn Hàng (Order Summary Card)"
)
@Composable
fun PreviewOrderSummaryCardComponent() {
    MaterialTheme {
        Box(modifier = Modifier.padding(16.dp)) {
            OrderSummarySection(
                summary = CartSummary(mockSampleCartItems, mockVipUser),
                userState = mockVipUser,
                formatVnd = { amount -> NumberFormat.getNumberInstance(Locale.forLanguageTag("vi-VN")).format(amount) + "đ" },
                onAutoPayment = {},
                onOtherPayment = {},
                onOpenRemoveDialog = {},
                onContinueShopping = {}
            )
        }
    }
}
