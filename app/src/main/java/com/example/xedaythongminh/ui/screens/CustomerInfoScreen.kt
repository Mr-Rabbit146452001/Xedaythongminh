package com.example.xedaythongminh.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.*
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import com.example.xedaythongminh.R
import com.example.xedaythongminh.ui.theme.*
import com.example.xedaythongminh.ui.viewmodel.AppViewModel
import androidx.compose.material3.windowsizeclass.WindowWidthSizeClass
import com.example.xedaythongminh.ui.components.GlassButton
import com.example.xedaythongminh.ui.components.GlassButtonVariant
import com.example.xedaythongminh.ui.components.OrganicGlassBackground
import com.example.xedaythongminh.ui.components.ResponsiveLayout
import java.text.NumberFormat
import java.util.Locale

@Composable
fun CustomerInfoScreen(
    appViewModel: AppViewModel = androidx.lifecycle.viewmodel.compose.viewModel(factory = com.example.xedaythongminh.ui.viewmodel.AppViewModelProvider.Factory),
    navController: NavController,
    windowSize: WindowWidthSizeClass = WindowWidthSizeClass.Expanded
) {
    val userState by appViewModel.userState.collectAsState()
    val user = userState ?: com.example.xedaythongminh.data.models.User(
        id = "MOCK123",
        name = "Khách Hàng Danh Dự",
        membershipLevel = "Hội viên Vàng",
        points = 2450
    )

    OrganicGlassBackground(modifier = Modifier.fillMaxSize()) {
        Scaffold(
            modifier = Modifier.fillMaxSize(),
            containerColor = Color.Transparent,
            topBar = { TopBar(statusText = stringResource(R.string.status_text_default)) }
        ) { innerPadding ->
        ResponsiveLayout(
            windowSize = windowSize,
            modifier = Modifier.padding(innerPadding),
            leftWeight = 0.6f,
            rightWeight = 0.4f,
            leftContent = { modifier ->
                Column(
                    modifier = modifier
                        .fillMaxSize()
                        .padding(32.dp)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(24.dp)
                ) {
                    Text(
                        text = "Thông tin tài khoản",
                        fontSize = 32.sp,
                        fontWeight = FontWeight.Bold,
                        color = PrimaryBlue
                    )

                    // Thẻ Hồ sơ khách hàng lớn
                    Card(
                        modifier = Modifier.fillMaxWidth().shadow(8.dp, RoundedCornerShape(20.dp)),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        shape = RoundedCornerShape(20.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(24.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(80.dp)
                                    .clip(CircleShape)
                                    .background(LightBlueBg),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.AccountCircle,
                                    contentDescription = "User Avatar",
                                    tint = PrimaryBlue,
                                    modifier = Modifier.size(56.dp)
                                )
                            }

                            Spacer(modifier = Modifier.width(24.dp))

                            Column {
                                Text(
                                    text = user.name,
                                    fontSize = 24.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextDark
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = Icons.Default.Phone,
                                        contentDescription = "Phone",
                                        tint = TextGray,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = user.phoneNumber,
                                        fontSize = 16.sp,
                                        color = TextGray
                                    )
                                }
                                Spacer(modifier = Modifier.height(10.dp))
                                Box(
                                    modifier = Modifier
                                        .background(Color(0xFFFFF9C4), RoundedCornerShape(6.dp))
                                        .padding(horizontal = 12.dp, vertical = 6.dp)
                                ) {
                                    Text(
                                        text = user.membershipLevel,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFFF57F17)
                                    )
                                }
                            }
                        }
                    }

                    // Điểm tích lũy & Bảng thống kê điểm
                    Card(
                        modifier = Modifier.fillMaxWidth().shadow(4.dp, RoundedCornerShape(16.dp)),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        shape = RoundedCornerShape(16.dp)
                    ) {
                        Column(modifier = Modifier.padding(24.dp)) {
                            Text("Tổng điểm tích lũy", color = TextGray, fontSize = 16.sp)
                            Spacer(modifier = Modifier.height(8.dp))
                            Row(verticalAlignment = Alignment.Bottom) {
                                val formatPoints = NumberFormat.getNumberInstance(Locale.forLanguageTag("vi-VN")).format(user.points)
                                Text(
                                    text = formatPoints,
                                    fontSize = 44.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = PrimaryBlue
                                )
                                Text(
                                    text = " điểm thưởng",
                                    fontSize = 18.sp,
                                    color = TextGray,
                                    modifier = Modifier.padding(bottom = 8.dp)
                                )
                            }
                            Spacer(modifier = Modifier.height(12.dp))
                            LinearProgressIndicator(
                                progress = { 0.75f },
                                modifier = Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(4.dp)),
                                color = PrimaryBlue,
                                trackColor = BorderGray,
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text("Chỉ cần thêm 550 điểm để lên hạng Hội viên Kim Cương!", fontSize = 13.sp, color = TextGray)
                        }
                    }
                }
            },
            rightContent = { modifier ->
                Column(
                    modifier = modifier
                        .background(Color.White)
                        .padding(24.dp)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(24.dp)
                ) {

                    Spacer(modifier = Modifier.height(16.dp))

                    // 3. Các nút điều hướng dưới cùng
                    Column(
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        GlassButton(
                            onClick = { 
                                appViewModel.createShoppingSession(forceNew = true)
                                navController.navigate("scan_product") 
                            },
                            modifier = Modifier.fillMaxWidth().height(52.dp),
                            shape = RoundedCornerShape(14.dp),
                            variant = GlassButtonVariant.Primary
                        ) {
                            Text("Mua sắm ngay", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                            Spacer(modifier = Modifier.width(8.dp))
                            Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = "Shop Now", tint = Color.White, modifier = Modifier.size(20.dp))
                        }

                        GlassButton(
                            onClick = {
                                appViewModel.completeActiveSession()
                                navController.popBackStack()
                            },
                            modifier = Modifier.fillMaxWidth().height(48.dp),
                            shape = RoundedCornerShape(14.dp),
                            variant = GlassButtonVariant.Secondary
                        ) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = PrimaryBlue, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Quay lại trang trước", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = PrimaryBlue)
                        }
                    }
                }
            }
        )
    }
}
}

@Preview(showBackground = true, widthDp = 1280, heightDp = 800, name = "Tablet Landscape - Customer Info")
@Composable
fun CustomerInfoScreenPreview() {
    MaterialTheme {
        CustomerInfoScreen(navController = rememberNavController(), windowSize = WindowWidthSizeClass.Expanded)
    }
}
