package com.example.xedaythongminh.ui.screens

import android.net.Uri
import android.widget.VideoView
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.navigation.NavController
import com.example.xedaythongminh.R
import com.example.xedaythongminh.ui.theme.LightBlueBg
import com.example.xedaythongminh.ui.theme.PrimaryBlue
import com.example.xedaythongminh.ui.theme.TextGray

@Composable
fun SplashScreen(navController: NavController) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White), // Nền trắng thuần khiết đồng màu với video splash
        contentAlignment = Alignment.Center
    ) {
        AndroidView(
            factory = { context ->
                VideoView(context).apply {
                    // Cấu hình đường dẫn Uri tới tệp video thô trong R.raw
                    val videoUri = Uri.parse("android.resource://" + context.packageName + "/" + R.raw.video_splash_smartcart)
                    setVideoURI(videoUri)
                    
                    // Lắng nghe sự kiện hoàn tất phát video để chuyển hướng sang màn hình tiếp theo
                    setOnCompletionListener {
                        navController.navigate("welcome") {
                            popUpTo("splash") { inclusive = true }
                        }
                    }
                    
                    // Khởi động phát video
                    start()
                }
            },
            modifier = Modifier.fillMaxSize()
        )
    }
}

@Preview(showBackground = true, widthDp = 1280, heightDp = 800, name = "Tablet Landscape - Splash Screen")
@Composable
fun SplashScreenPreview() {
    MaterialTheme {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.White),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Box(
                    modifier = Modifier
                        .size(120.dp)
                        .background(LightBlueBg, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.ShoppingCart,
                        contentDescription = "Smart Stroller Logo",
                        tint = PrimaryBlue,
                        modifier = Modifier.size(64.dp)
                    )
                }
                Spacer(modifier = Modifier.height(24.dp))
                Text(
                    text = "XE ĐẨY THÔNG MINH - SMART STROLLER",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = PrimaryBlue
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Khởi động hệ thống mua sắm tự động...",
                    fontSize = 15.sp,
                    color = TextGray
                )
            }
        }
    }
}
