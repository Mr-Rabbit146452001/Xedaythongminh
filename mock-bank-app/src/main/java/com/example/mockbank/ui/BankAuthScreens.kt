package com.example.mockbank.ui

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.mockbank.data.AccountData
import com.example.mockbank.data.BankApiClient
import com.example.mockbank.data.LoginRequest
import com.example.mockbank.data.RegisterRequest
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.util.Locale

// Luxury Dark Theme Colors Matching MockBank
private val ColorBg = Color(0xFF090D11)
private val ColorCardSurface = Color(0xFF131A22)
private val ColorCardBorder = Color(0xFF232D3B)
private val ColorAccentGreen = Color(0xFF00E676)
private val ColorAccentMint = Color(0xFF69F0AE)
private val ColorTextPrimary = Color(0xFFF1F5F9)
private val ColorTextSecondary = Color(0xFF94A3B8)
private val ColorTextMuted = Color(0xFF64748B)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BankLoginScreen(
    onLoginSuccess: (AccountData, String) -> Unit,
    onNavigateToRegister: () -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val focusManager = LocalFocusManager.current

    var phoneNumber by remember { mutableStateOf(BankApiClient.getSavedPhone(context) ?: "0987654321") }
    var pin by remember { mutableStateOf(BankApiClient.getSavedPin(context)) }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var showSettingsDialog by remember { mutableStateOf(false) }
    var serverUrlInput by remember { mutableStateOf(BankApiClient.baseUrl) }

    fun doLogin(phoneToUse: String = phoneNumber, pinToUse: String = pin) {
        if (phoneToUse.isBlank() || pinToUse.isBlank()) {
            errorMessage = "Vui lòng nhập đầy đủ Số điện thoại và Mã PIN"
            return
        }
        isLoading = true
        errorMessage = null
        coroutineScope.launch {
            try {
                val res = BankApiClient.getService().login(LoginRequest(phoneToUse.trim(), pinToUse.trim()))
                if (res.isSuccessful && res.body()?.success == true && res.body()?.data != null) {
                    val account = res.body()!!.data!!
                    BankApiClient.saveAuthSession(context, account, pinToUse.trim())
                    onLoginSuccess(account, pinToUse.trim())
                } else {
                    val rawError = res.errorBody()?.string()
                    errorMessage = res.body()?.message ?: rawError ?: "Đăng nhập thất bại (HTTP ${res.code()})"
                }
            } catch (e: Exception) {
                errorMessage = "Không thể kết nối máy chủ: ${e.message}"
            } finally {
                isLoading = false
            }
        }
    }

    if (showSettingsDialog) {
        AlertDialog(
            onDismissRequest = { showSettingsDialog = false },
            containerColor = Color(0xFF161E28),
            titleContentColor = ColorTextPrimary,
            textContentColor = ColorTextSecondary,
            title = { Text("Cấu Hình Máy Chủ MockBank", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Địa chỉ API Server (Ngrok / Mạng LAN):", fontSize = 12.sp)
                    OutlinedTextField(
                        value = serverUrlInput,
                        onValueChange = { serverUrlInput = it },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = ColorTextPrimary,
                            unfocusedTextColor = ColorTextPrimary,
                            focusedBorderColor = ColorAccentGreen,
                            unfocusedBorderColor = ColorCardBorder
                        )
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        BankApiClient.updateBaseUrl(context, serverUrlInput)
                        showSettingsDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = ColorAccentGreen)
                ) {
                    Text("Lưu Thay Đổi", color = Color.Black, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showSettingsDialog = false }) {
                    Text("Đóng", color = ColorTextSecondary)
                }
            }
        )
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(ColorBg)
            .padding(24.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Logo & Brand Header
            Box(
                modifier = Modifier
                    .size(72.dp)
                    .clip(CircleShape)
                    .background(Brush.radialGradient(listOf(ColorAccentGreen.copy(alpha = 0.25f), Color.Transparent)))
                    .border(2.dp, ColorAccentGreen, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.AccountBalance,
                    contentDescription = null,
                    tint = ColorAccentGreen,
                    modifier = Modifier.size(36.dp)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "MOCKBANK FINTECH",
                fontSize = 22.sp,
                fontWeight = FontWeight.Black,
                color = ColorTextPrimary,
                letterSpacing = 1.sp
            )
            Text(
                text = "Cổng Thanh Toán Số Cho Xe Đẩy Thông Minh",
                fontSize = 12.sp,
                color = ColorTextSecondary,
                fontWeight = FontWeight.Medium
            )

            Spacer(modifier = Modifier.height(32.dp))

            // Login Card
            Surface(
                shape = RoundedCornerShape(24.dp),
                color = ColorCardSurface,
                border = androidx.compose.foundation.BorderStroke(1.dp, ColorCardBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Text(
                        text = "ĐĂNG NHẬP TÀI KHOẢN",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = ColorAccentMint,
                        letterSpacing = 0.5.sp
                    )

                    // Phone Number Field
                    OutlinedTextField(
                        value = phoneNumber,
                        onValueChange = { phoneNumber = it },
                        label = { Text("Số điện thoại đăng ký") },
                        leadingIcon = { Icon(Icons.Default.PhoneIphone, contentDescription = null, tint = ColorAccentGreen) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone, imeAction = ImeAction.Next),
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        shape = RoundedCornerShape(16.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = ColorTextPrimary,
                            unfocusedTextColor = ColorTextPrimary,
                            focusedBorderColor = ColorAccentGreen,
                            unfocusedBorderColor = ColorCardBorder,
                            focusedLabelColor = ColorAccentGreen,
                            unfocusedLabelColor = ColorTextSecondary
                        )
                    )

                    // PIN Code Field
                    OutlinedTextField(
                        value = pin,
                        onValueChange = { if (it.length <= 6) pin = it },
                        label = { Text("Mã PIN bảo mật (4-6 số)") },
                        leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null, tint = ColorAccentGreen) },
                        visualTransformation = PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword, imeAction = ImeAction.Done),
                        keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus(); doLogin() }),
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        shape = RoundedCornerShape(16.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = ColorTextPrimary,
                            unfocusedTextColor = ColorTextPrimary,
                            focusedBorderColor = ColorAccentGreen,
                            unfocusedBorderColor = ColorCardBorder,
                            focusedLabelColor = ColorAccentGreen,
                            unfocusedLabelColor = ColorTextSecondary
                        )
                    )

                    if (!errorMessage.isNullOrBlank()) {
                        Text(
                            text = errorMessage!!,
                            color = Color(0xFFFF5252),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }

                    // Login Button
                    Button(
                        onClick = { doLogin() },
                        enabled = !isLoading,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = ColorAccentGreen)
                    ) {
                        if (isLoading) {
                            CircularProgressIndicator(modifier = Modifier.size(24.dp), color = Color.Black, strokeWidth = 2.5.dp)
                        } else {
                            Text(
                                text = "ĐĂNG NHẬP NGAY",
                                color = Color.Black,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Black,
                                letterSpacing = 0.5.sp
                            )
                        }
                    }

                    // Quick Demo Login Pill
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFF1B2430))
                            .clickable {
                                phoneNumber = "0987654321"
                                pin = "652001"
                                doLogin("0987654321", "652001")
                            }
                            .padding(horizontal = 12.dp, vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.FlashOn, contentDescription = null, tint = Color(0xFFFFD54F), modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Thử ngay tài khoản Demo", fontSize = 12.sp, color = ColorTextPrimary, fontWeight = FontWeight.Bold)
                        }
                        Text("0987654321", fontSize = 11.sp, color = ColorAccentMint, fontFamily = FontFamily.Monospace)
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Register Link
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                Text("Chưa có tài khoản MockBank? ", color = ColorTextSecondary, fontSize = 13.sp)
                Text(
                    text = "Mở tài khoản ngay",
                    color = ColorAccentGreen,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.clickable { onNavigateToRegister() }
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Settings button
            IconButton(onClick = { showSettingsDialog = true }) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Outlined.Lan, contentDescription = null, tint = ColorTextMuted, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Cài đặt Máy Chủ", fontSize = 11.sp, color = ColorTextMuted)
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BankRegisterScreen(
    onRegisterSuccess: (AccountData, String) -> Unit,
    onNavigateToLogin: () -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val focusManager = LocalFocusManager.current

    var fullName by remember { mutableStateOf("") }
    var idCardNumber by remember { mutableStateOf("") }
    var phoneNumber by remember { mutableStateOf("") }
    var pin by remember { mutableStateOf("") }
    var confirmPin by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    fun doRegister() {
        if (fullName.trim().length < 2) {
            errorMessage = "Vui lòng nhập đầy đủ Họ và tên (tối thiểu 2 ký tự)"
            return
        }
        if (!idCardNumber.trim().matches(Regex("^\\d{12}$"))) {
            errorMessage = "Số Căn cước công dân (CCCD) phải bao gồm đúng 12 chữ số"
            return
        }
        val cleanPhone = phoneNumber.trim().replace(Regex("^(?:\\+84|84)"), "0")
        if (!cleanPhone.matches(Regex("^(0[3|5|7|8|9])\\d{8}$"))) {
            errorMessage = "Số điện thoại di động không đúng chuẩn (10 chữ số)"
            return
        }
        if (!pin.trim().matches(Regex("^\\d{4,6}$"))) {
            errorMessage = "Mã PIN bảo mật phải là dãy gồm 4 đến 6 chữ số"
            return
        }
        if (pin.trim() != confirmPin.trim()) {
            errorMessage = "Xác nhận mã PIN không khớp! Vui lòng nhập lại."
            return
        }

        isLoading = true
        errorMessage = null

        coroutineScope.launch {
            try {
                val res = BankApiClient.getService().register(
                    RegisterRequest(
                        fullName = fullName.trim(),
                        idCardNumber = idCardNumber.trim(),
                        phoneNumber = cleanPhone,
                        pin = pin.trim()
                    )
                )
                if (res.isSuccessful && res.body()?.success == true && res.body()?.data != null) {
                    val account = res.body()!!.data!!
                    BankApiClient.saveAuthSession(context, account, pin.trim())
                    onRegisterSuccess(account, pin.trim())
                } else {
                    val rawError = res.errorBody()?.string()
                    errorMessage = res.body()?.message ?: rawError ?: "Đăng ký thất bại (HTTP ${res.code()})"
                }
            } catch (e: Exception) {
                errorMessage = "Không thể kết nối máy chủ: ${e.message}"
            } finally {
                isLoading = false
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(ColorBg)
            .padding(24.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(16.dp))

            // Header Icon
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .clip(CircleShape)
                    .background(Color(0xFF131A22))
                    .border(1.5.dp, ColorAccentGreen, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.Badge, contentDescription = null, tint = ColorAccentGreen, modifier = Modifier.size(28.dp))
            }

            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "MỞ TÀI KHOẢN MOCKBANK",
                fontSize = 20.sp,
                fontWeight = FontWeight.Black,
                color = ColorTextPrimary
            )
            Text(
                text = "Định danh điện tử eKYC bằng CCCD & Số điện thoại",
                fontSize = 12.sp,
                color = ColorTextSecondary
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Welcome Bonus Banner
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = Color(0xFF0F291E),
                border = androidx.compose.foundation.BorderStroke(1.dp, ColorAccentGreen.copy(alpha = 0.5f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.CardGiftcard, contentDescription = null, tint = ColorAccentGreen, modifier = Modifier.size(24.dp))
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text("Quà Tặng Mở Thẻ Khởi Nghiệp", color = ColorAccentMint, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        Text("Tặng ngay 100.000 Token (≈ 1.000.000 VNĐ) vào ví", color = ColorTextPrimary, fontSize = 11.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Form Surface
            Surface(
                shape = RoundedCornerShape(24.dp),
                color = ColorCardSurface,
                border = androidx.compose.foundation.BorderStroke(1.dp, ColorCardBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    // Full Name
                    OutlinedTextField(
                        value = fullName,
                        onValueChange = { fullName = it },
                        label = { Text("Họ và tên chủ tài khoản") },
                        placeholder = { Text("VD: NGUYEN VAN A") },
                        leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = ColorAccentGreen) },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        shape = RoundedCornerShape(16.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = ColorTextPrimary,
                            unfocusedTextColor = ColorTextPrimary,
                            focusedBorderColor = ColorAccentGreen,
                            unfocusedBorderColor = ColorCardBorder
                        )
                    )

                    // CCCD Number (12 digits)
                    OutlinedTextField(
                        value = idCardNumber,
                        onValueChange = { if (it.length <= 12) idCardNumber = it },
                        label = { Text("Số Căn cước công dân (12 số)") },
                        placeholder = { Text("001200001234") },
                        leadingIcon = { Icon(Icons.Default.CreditCard, contentDescription = null, tint = ColorAccentGreen) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number, imeAction = ImeAction.Next),
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        shape = RoundedCornerShape(16.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = ColorTextPrimary,
                            unfocusedTextColor = ColorTextPrimary,
                            focusedBorderColor = ColorAccentGreen,
                            unfocusedBorderColor = ColorCardBorder
                        )
                    )

                    // Phone Number (10 digits)
                    OutlinedTextField(
                        value = phoneNumber,
                        onValueChange = { if (it.length <= 11) phoneNumber = it },
                        label = { Text("Số điện thoại di động") },
                        placeholder = { Text("0987654321") },
                        leadingIcon = { Icon(Icons.Default.PhoneIphone, contentDescription = null, tint = ColorAccentGreen) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone, imeAction = ImeAction.Next),
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        shape = RoundedCornerShape(16.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = ColorTextPrimary,
                            unfocusedTextColor = ColorTextPrimary,
                            focusedBorderColor = ColorAccentGreen,
                            unfocusedBorderColor = ColorCardBorder
                        )
                    )

                    // PIN
                    OutlinedTextField(
                        value = pin,
                        onValueChange = { if (it.length <= 6) pin = it },
                        label = { Text("Mã PIN bảo mật (6 số)") },
                        placeholder = { Text("VD: 652001") },
                        leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null, tint = ColorAccentGreen) },
                        visualTransformation = PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword, imeAction = ImeAction.Next),
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        shape = RoundedCornerShape(16.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = ColorTextPrimary,
                            unfocusedTextColor = ColorTextPrimary,
                            focusedBorderColor = ColorAccentGreen,
                            unfocusedBorderColor = ColorCardBorder
                        )
                    )

                    // Confirm PIN
                    OutlinedTextField(
                        value = confirmPin,
                        onValueChange = { if (it.length <= 6) confirmPin = it },
                        label = { Text("Xác nhận lại mã PIN") },
                        leadingIcon = { Icon(Icons.Default.VerifiedUser, contentDescription = null, tint = ColorAccentGreen) },
                        visualTransformation = PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword, imeAction = ImeAction.Done),
                        keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus(); doRegister() }),
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        shape = RoundedCornerShape(16.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = ColorTextPrimary,
                            unfocusedTextColor = ColorTextPrimary,
                            focusedBorderColor = ColorAccentGreen,
                            unfocusedBorderColor = ColorCardBorder
                        )
                    )

                    if (!errorMessage.isNullOrBlank()) {
                        Text(
                            text = errorMessage!!,
                            color = Color(0xFFFF5252),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }

                    // Register Button
                    Button(
                        onClick = { doRegister() },
                        enabled = !isLoading,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = ColorAccentGreen)
                    ) {
                        if (isLoading) {
                            CircularProgressIndicator(modifier = Modifier.size(24.dp), color = Color.Black, strokeWidth = 2.5.dp)
                        } else {
                            Text(
                                text = "XÁC NHẬN MỞ TÀI KHOẢN",
                                color = Color.Black,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Black
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Back to Login Link
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                Text("Đã có tài khoản MockBank? ", color = ColorTextSecondary, fontSize = 13.sp)
                Text(
                    text = "Đăng nhập ngay",
                    color = ColorAccentGreen,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.clickable { onNavigateToLogin() }
                )
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@Composable
fun PaymentPinDialog(
    amountTokens: Double,
    amountVnd: Double,
    orderId: String,
    onConfirmPin: (String) -> Unit,
    onDismiss: () -> Unit
) {
    var pinInput by remember { mutableStateOf("") }
    val formatVnd = NumberFormat.getNumberInstance(Locale.forLanguageTag("vi-VN"))

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = Color(0xFF131A22),
        shape = RoundedCornerShape(24.dp),
        title = {
            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(ColorAccentGreen.copy(alpha = 0.2f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.Shield, contentDescription = null, tint = ColorAccentGreen)
                }
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    "Xác Thực Thanh Toán",
                    color = ColorTextPrimary,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    "Đơn hàng: $orderId",
                    color = ColorTextSecondary,
                    fontSize = 12.sp,
                    fontFamily = FontFamily.Monospace
                )
            }
        },
        text = {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                // Amount Preview Box
                Surface(
                    color = Color(0xFF1B2430),
                    shape = RoundedCornerShape(16.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, ColorCardBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "${formatVnd.format(amountTokens.toLong())} Token",
                            color = ColorAccentGreen,
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Black,
                            fontFamily = FontFamily.Monospace
                        )
                        Text(
                            text = "≈ ${formatVnd.format(amountVnd.toLong())} VNĐ (Tỷ giá 1:10)",
                            color = ColorTextSecondary,
                            fontSize = 12.sp
                        )
                    }
                }

                // 6 Pin Dots
                Row(
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    (0..5).forEach { index ->
                        val isFilled = index < pinInput.length
                        Box(
                            modifier = Modifier
                                .size(14.dp)
                                .clip(CircleShape)
                                .background(if (isFilled) ColorAccentGreen else Color(0xFF2A3644))
                                .border(1.dp, if (isFilled) ColorAccentMint else ColorCardBorder, CircleShape)
                        )
                    }
                }

                // Numeric Keypad Grid
                Column(
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    val rows = listOf(
                        listOf("1", "2", "3"),
                        listOf("4", "5", "6"),
                        listOf("7", "8", "9"),
                        listOf("C", "0", "DEL")
                    )

                    rows.forEach { row ->
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            row.forEach { key ->
                                Surface(
                                    modifier = Modifier
                                        .size(64.dp, 48.dp)
                                        .clickable {
                                            when (key) {
                                                "C" -> pinInput = ""
                                                "DEL" -> if (pinInput.isNotEmpty()) pinInput = pinInput.dropLast(1)
                                                else -> {
                                                    if (pinInput.length < 6) {
                                                        val next = pinInput + key
                                                        pinInput = next
                                                        if (next.length == 6) {
                                                            onConfirmPin(next)
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                    color = if (key in listOf("C", "DEL")) Color(0xFF1B2430) else Color(0xFF202A38),
                                    shape = RoundedCornerShape(12.dp)
                                ) {
                                    Box(contentAlignment = Alignment.Center) {
                                        Text(
                                            text = key,
                                            color = if (key in listOf("C", "DEL")) ColorTextSecondary else ColorTextPrimary,
                                            fontSize = 16.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }
                            }
                        }
                    }
                }

                Text(
                    text = "Mã PIN của bạn hoặc Master PIN: 652001",
                    color = ColorTextMuted,
                    fontSize = 11.sp,
                    textAlign = TextAlign.Center
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { if (pinInput.isNotEmpty()) onConfirmPin(pinInput) },
                colors = ButtonDefaults.buttonColors(containerColor = ColorAccentGreen),
                shape = RoundedCornerShape(12.dp),
                enabled = pinInput.length in 4..6
            ) {
                Text("Xác Nhận", color = Color.Black, fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Hủy", color = ColorTextSecondary)
            }
        }
    )
}
