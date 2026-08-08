package com.example.xedaythongminh.ui.screens

import android.net.Uri
import android.widget.VideoView
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.viewinterop.AndroidView
import androidx.navigation.NavController
import com.example.xedaythongminh.R

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
