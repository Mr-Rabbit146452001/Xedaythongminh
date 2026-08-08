package com.example.xedaythongminh.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.automirrored.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.windowsizeclass.WindowWidthSizeClass
import com.example.xedaythongminh.ui.theme.*
import androidx.compose.ui.res.stringResource
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.xedaythongminh.R
import com.example.xedaythongminh.ui.viewmodel.AppViewModel

@Composable
fun WelcomeScreen(
    appViewModel: AppViewModel = androidx.lifecycle.viewmodel.compose.viewModel(factory = com.example.xedaythongminh.ui.viewmodel.AppViewModelProvider.Factory),
    navController: NavController,
    windowSize: WindowWidthSizeClass = WindowWidthSizeClass.Expanded
) {
    val isCompact = windowSize == WindowWidthSizeClass.Compact

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = BackgroundGray,
        topBar = { TopBar(appViewModel = appViewModel) }
    ) { innerPadding ->
        if (isCompact) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .padding(16.dp)
                    .verticalScroll(rememberScrollState()),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(24.dp)
            ) {
                WelcomeImageSection(modifier = Modifier.fillMaxWidth().aspectRatio(1f))
                WelcomeTextAndActionSection(navController = navController, modifier = Modifier.fillMaxWidth())
            }
        } else {
            Row(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .padding(horizontal = 24.dp, vertical = 12.dp)
                    .verticalScroll(rememberScrollState()),
                verticalAlignment = Alignment.CenterVertically
            ) {
                WelcomeTextAndActionSection(navController = navController, modifier = Modifier.weight(1.2f).padding(end = 16.dp))
                WelcomeImageSection(modifier = Modifier.weight(0.8f))
            }
        }
    }
}

@Composable
fun WelcomeTextAndActionSection(navController: NavController, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = stringResource(R.string.welcome_title),
            fontSize = 36.sp,
            fontWeight = FontWeight.Bold,
            color = TextDark,
            lineHeight = 44.sp
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = stringResource(R.string.welcome_desc),
            fontSize = 16.sp,
            color = TextGray,
            lineHeight = 24.sp
        )
        Spacer(modifier = Modifier.height(32.dp))
        
        Button(
            onClick = { navController.navigate("scan_customer") },
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue),
            shape = RoundedCornerShape(12.dp)
        ) {
            Icon(
                imageVector = Icons.Default.ShoppingCart,
                contentDescription = "Cart",
                tint = Color.White
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = stringResource(R.string.btn_start_shopping),
                color = Color.White,
                fontSize = 16.sp,
                fontWeight = FontWeight.Medium
            )
        }
    }
}

@Composable
fun WelcomeImageSection(modifier: Modifier = Modifier) {
    Box(
        modifier = modifier,
        contentAlignment = Alignment.Center
    ) {
        Image(
            painter = painterResource(id = R.drawable.img_smart_cart_logo),
            contentDescription = "Smart Cart 3D Liquid Glass Logo",
            modifier = Modifier.size(320.dp),
            contentScale = ContentScale.Fit
        )
    }
}

@Composable
fun TopBar(
    statusText: String = stringResource(R.string.status_text_default),
    appViewModel: AppViewModel? = null
) {
    var showDialog by remember { mutableStateOf(false) }
    
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 16.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(
            modifier = Modifier.clickable { showDialog = true },
            verticalAlignment = Alignment.CenterVertically
        ) {
            Image(
                painter = painterResource(id = R.drawable.img_smart_cart_logo),
                contentDescription = "Logo",
                modifier = Modifier.size(32.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = stringResource(R.string.logo_text),
                fontWeight = FontWeight.Bold,
                fontSize = 20.sp,
                color = PrimaryBlue
            )
        }
        
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = statusText,
                fontSize = 14.sp,
                color = TextDark,
                fontWeight = FontWeight.Medium
            )
            IconButton(onClick = { showDialog = true }) {
                Icon(
                    imageVector = Icons.Default.Settings,
                    contentDescription = "Cấu hình Server IP",
                    tint = PrimaryBlue,
                    modifier = Modifier.size(20.dp)
                )
            }
        }
    }

    if (showDialog) {
        ServerSettingsDialog(appViewModel = appViewModel, onDismiss = { showDialog = false })
    }
}

@Composable
fun ServerSettingsDialog(
    appViewModel: AppViewModel? = null,
    onDismiss: () -> Unit
) {
    var ipInput by remember { mutableStateOf(com.example.xedaythongminh.data.remote.RetrofitClient.getBaseUrl()) }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.Settings,
                    contentDescription = null,
                    tint = PrimaryBlue,
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text("Cấu hình Server IP", fontWeight = FontWeight.Bold, fontSize = 20.sp)
            }
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    text = "Nhập địa chỉ IP và cổng của máy chủ SQL/Node (ví dụ: 192.168.1.15:3000 hoặc 10.0.2.2:3000)",
                    fontSize = 14.sp,
                    color = TextGray
                )
                OutlinedTextField(
                    value = ipInput,
                    onValueChange = { ipInput = it },
                    label = { Text("Địa chỉ máy chủ (Base URL)") },
                    placeholder = { Text("http://192.168.1.51:3000/") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp)
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    com.example.xedaythongminh.data.remote.RetrofitClient.updateBaseUrl(ipInput)
                    appViewModel?.clearError() // Xóa thông báo lỗi cũ
                    appViewModel?.fetchAllProducts() // Refresh dữ liệu từ IP mới
                    onDismiss()
                },
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue)
            ) {
                Text("Lưu cấu hình", color = Color.White)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Hủy", color = TextGray)
            }
        },
        shape = RoundedCornerShape(16.dp),
        containerColor = Color.White
    )
}



@Composable
fun FeatureChip(icon: ImageVector, label: String) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .border(1.dp, BorderGray, RoundedCornerShape(8.dp))
            .background(Color.White, RoundedCornerShape(8.dp))
            .padding(horizontal = 12.dp, vertical = 8.dp)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = label,
            tint = PrimaryBlue,
            modifier = Modifier.size(16.dp)
        )
        Spacer(modifier = Modifier.width(6.dp))
        Text(
            text = label,
            fontSize = 12.sp,
            color = TextDark
        )
    }
}

@Preview(showBackground = true, widthDp = 1280, heightDp = 800, name = "Tablet Landscape")
@Composable
fun WelcomeScreenPreview() {
    MaterialTheme {
        WelcomeScreen(navController = rememberNavController(), windowSize = WindowWidthSizeClass.Expanded)
    }
}
