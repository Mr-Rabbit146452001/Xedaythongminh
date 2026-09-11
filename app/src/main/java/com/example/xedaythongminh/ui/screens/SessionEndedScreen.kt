package com.example.xedaythongminh.ui.screens

import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import com.example.xedaythongminh.ui.viewmodel.AppViewModel
import androidx.compose.runtime.Composable
import androidx.compose.material3.windowsizeclass.WindowWidthSizeClass
import com.example.xedaythongminh.ui.theme.*
import com.example.xedaythongminh.R
import androidx.compose.ui.res.stringResource
import androidx.activity.compose.BackHandler
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import com.example.xedaythongminh.ui.components.ResponsiveLayout

@Composable
fun SessionEndedScreen(
    appViewModel: AppViewModel = androidx.lifecycle.viewmodel.compose.viewModel(factory = com.example.xedaythongminh.ui.viewmodel.AppViewModelProvider.Factory),
    navController: NavController,
    windowSize: WindowWidthSizeClass = WindowWidthSizeClass.Expanded
) {
    // Khóa phím Back tuyệt đối: Không cho phép quay lại
    BackHandler(enabled = true) {
        // Chặn phím Back
    }

    // Logic to clear all local session variables when this screen is initialized
    LaunchedEffect(Unit) {
        appViewModel.clearSession()
    }

    LaunchedEffect(Unit) {
        delay(10000)
        navController.navigate("welcome") {
            popUpTo(0) { inclusive = true }
        }
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = BackgroundGray,
        topBar = { TopBar(statusText = stringResource(R.string.status_text_default)) }
    ) { innerPadding ->
        ResponsiveLayout(
            windowSize = windowSize,
            modifier = Modifier.padding(innerPadding),
            leftWeight = 0.70f,
            rightWeight = 0.30f,
            leftContent = { modifier ->
                Card(
                    modifier = modifier,
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    shape = RoundedCornerShape(20.dp),
                    elevation = CardDefaults.cardElevation(2dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(24.dp)
                            .verticalScroll(rememberScrollState()),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Box(
                            modifier = Modifier
                                .size(120.dp)
                                .background(PrimaryBlue, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.VerifiedUser,
                                contentDescription = "Success",
                                tint = Color.White,
                                modifier = Modifier.size(64.dp)
                            )
                        }
                        
                        Spacer(modifier = Modifier.height(32.dp))
                        
                        Text(
                            text = stringResource(R.string.session_ended_title),
                            fontSize = 32.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextDark,
                            textAlign = TextAlign.Center
                        )
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        Text(
                            text = "Vui lòng đưa xe về khu vực quy định. Cảm ơn quý khách đã tin\ntưởng sử dụng dịch vụ của chúng tôi!",
                            fontSize = 18.sp,
                            color = TextGray,
                            textAlign = TextAlign.Center,
                            lineHeight = 28.sp,
                            modifier = Modifier.widthIn(max = 680.dp)
                        )
                        
                        Spacer(modifier = Modifier.height(44.dp))
                        
                        Box(
                            modifier = Modifier
                                .background(LightBlueBg, RoundedCornerShape(24.dp))
                                .padding(horizontal = 28.dp, vertical = 14.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.LocalParking, contentDescription = null, tint = PrimaryBlue)
                                Spacer(modifier = Modifier.width(10.dp))
                                Text(
                                    text = "Khu vực trả xe: Cổng A & Cổng B",
                                    color = PrimaryBlue,
                                    fontWeight = FontWeight.Medium,
                                    fontSize = 16.sp
                                )
                            }
                        }
                    }
                }
            },
            rightContent = { modifier ->
                val isCompact = windowSize == WindowWidthSizeClass.Compact
                val columnModifier = if (isCompact) {
                    modifier
                        .fillMaxWidth()
                        .verticalScroll(rememberScrollState())
                } else {
                    modifier.fillMaxHeight()
                }

                Column(
                    modifier = columnModifier,
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Security Box (Mở rộng theo chiều dọc để lấp đầy cân đối)
                    Card(
                        modifier = if (isCompact) Modifier.fillMaxWidth().wrapContentHeight() else Modifier.fillMaxWidth().weight(1f),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        shape = RoundedCornerShape(20.dp),
                        elevation = CardDefaults.cardElevation(2.dp)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(24.dp),
                            verticalArrangement = Arrangement.Center
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(54.dp)
                                    .background(LightBlueBg, RoundedCornerShape(14.dp)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Security,
                                    contentDescription = "Security",
                                    tint = PrimaryBlue,
                                    modifier = Modifier.size(28.dp)
                                )
                            }
                            
                            Spacer(modifier = Modifier.height(16.dp))
                            
                            Text(
                                text = "Bảo mật thông tin",
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextDark
                            )
                            
                            Spacer(modifier = Modifier.height(8.dp))
                            
                            Text(
                                text = "Dữ liệu cá nhân của bạn đã được xóa an toàn khỏi hệ thống.",
                                fontSize = 14.sp,
                                color = TextGray,
                                lineHeight = 22.sp
                            )
                        }
                    }
                    
                    // Next Session Call-to-Action (Mở rộng theo chiều dọc để lấp đầy cân đối)
                    Card(
                        modifier = if (isCompact) Modifier.fillMaxWidth().wrapContentHeight() else Modifier.fillMaxWidth().weight(1f),
                        colors = CardDefaults.cardColors(containerColor = PrimaryBlue),
                        shape = RoundedCornerShape(20.dp),
                        elevation = CardDefaults.cardElevation(2.dp)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(24.dp),
                            verticalArrangement = Arrangement.Center
                        ) {
                            Text(
                                text = "Sẵn sàng cho lượt tiếp theo?",
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            
                            Spacer(modifier = Modifier.height(10.dp))
                            
                            Text(
                                text = "Hệ thống đã sẵn sàng để phục vụ khách hàng mới.",
                                fontSize = 14.sp,
                                color = Color(0xDDFFFFFF),
                                lineHeight = 22.sp
                            )
                            
                            Spacer(modifier = Modifier.height(26.dp))
                            
                            Button(
                                onClick = { 
                                    appViewModel.terminateSessionImmediately()
                                    navController.navigate("welcome") {
                                        popUpTo(0) { inclusive = true }
                                    } 
                                },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(48.dp),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Color.White)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Refresh,
                                    contentDescription = null,
                                    tint = PrimaryBlue,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "Bắt đầu phiên mới",
                                    color = PrimaryBlue,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold
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
fun FooterBar() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.White)
            .padding(16.dp),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically
    ) {
        FooterItem(Icons.Default.Security, "Kết nối an toàn")
        Spacer(modifier = Modifier.width(24.dp))
        Text("•", color = Color.Gray)
        Spacer(modifier = Modifier.width(24.dp))
        FooterItem(Icons.Default.Headset, "Hỗ trợ kỹ thuật")
        Spacer(modifier = Modifier.width(24.dp))
        Text("•", color = Color.Gray)
        Spacer(modifier = Modifier.width(24.dp))
        FooterItem(Icons.Default.Language, "Tiếng Việt")
    }
}

@Composable
fun FooterItem(icon: androidx.compose.ui.graphics.vector.ImageVector, text: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(icon, contentDescription = null, tint = Color.Gray, modifier = Modifier.size(16.dp))
        Spacer(modifier = Modifier.width(8.dp))
        Text(text, color = Color.Gray, fontSize = 14.sp)
    }
}

@Preview(showBackground = true, widthDp = 1280, heightDp = 800, name = "Tablet Landscape - Session Ended")
@Composable
fun SessionEndedScreenPreview() {
    MaterialTheme {
        SessionEndedScreen(navController = rememberNavController(), windowSize = WindowWidthSizeClass.Expanded)
    }
}
