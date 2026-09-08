package com.example.mockbank.ui.camera

import android.Manifest
import android.content.pm.PackageManager
import android.util.Size
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.RoundRect
import androidx.compose.ui.graphics.ClipOp
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.clipPath
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.example.mockbank.data.QrPayload
import java.util.concurrent.Executors

private val ColorAccentGreen = Color(0xFF00E676)
private val ColorCardSurface = Color(0xFF131A22)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QrScannerScreen(
    onBack: () -> Unit,
    onQrScanned: (QrPayload) -> Unit,
    onManualInputClick: () -> Unit
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current

    var hasCameraPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED
        )
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        hasCameraPermission = isGranted
    }

    LaunchedEffect(Unit) {
        if (!hasCameraPermission) {
            permissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    var cameraControl by remember { mutableStateOf<CameraControl?>(null) }
    var isFlashOn by remember { mutableStateOf(false) }

    Scaffold(
        containerColor = Color.Black,
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "Quét mã QR Xe Đẩy",
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = Color.White
                        )
                    }
                },
                actions = {
                    if (hasCameraPermission) {
                        IconButton(
                            onClick = {
                                isFlashOn = !isFlashOn
                                cameraControl?.enableTorch(isFlashOn)
                            }
                        ) {
                            Icon(
                                imageVector = if (isFlashOn) Icons.Default.FlashOn else Icons.Default.FlashOff,
                                contentDescription = "Flashlight",
                                tint = if (isFlashOn) Color(0xFFFFD700) else Color.White
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Transparent)
            )
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            if (hasCameraPermission) {
                // 1. CameraX Preview Layer
                AndroidView(
                    modifier = Modifier.fillMaxSize(),
                    factory = { ctx ->
                        val previewView = PreviewView(ctx).apply {
                            scaleType = PreviewView.ScaleType.FILL_CENTER
                        }

                        val cameraProviderFuture = ProcessCameraProvider.getInstance(ctx)
                        val cameraExecutor = Executors.newSingleThreadExecutor()

                        cameraProviderFuture.addListener({
                            val cameraProvider = cameraProviderFuture.get()

                            val preview = Preview.Builder().build().also {
                                it.setSurfaceProvider(previewView.surfaceProvider)
                            }

                            val imageAnalysis = ImageAnalysis.Builder()
                                .setTargetResolution(Size(1280, 720))
                                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                                .build()
                                .also {
                                    it.setAnalyzer(cameraExecutor, QrCodeAnalyzer { payload ->
                                        onQrScanned(payload)
                                    })
                                }

                            try {
                                cameraProvider.unbindAll()
                                val camera = cameraProvider.bindToLifecycle(
                                    lifecycleOwner,
                                    CameraSelector.DEFAULT_BACK_CAMERA,
                                    preview,
                                    imageAnalysis
                                )
                                cameraControl = camera.cameraControl
                            } catch (e: Exception) {
                                e.printStackTrace()
                            }
                        }, ContextCompat.getMainExecutor(ctx))

                        previewView
                    }
                )

                // 2. Viewfinder & Animated Laser Scanner Overlay
                ViewfinderOverlay(
                    modifier = Modifier.fillMaxSize()
                )

                // 3. Hướng dẫn và nút thao tác phía dưới
                Column(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(bottom = 40.dp, start = 24.dp, end = 24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Surface(
                        color = Color.Black.copy(alpha = 0.65f),
                        shape = RoundedCornerShape(12.dp),
                        border = androidx.compose.foundation.BorderStroke(0.8.dp, Color(0xFF334155))
                    ) {
                        Text(
                            text = "Căn chỉnh mã QR trên xe đẩy vào giữa khung",
                            color = Color.White,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium,
                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    // Nút chuyển sang nhập mã thủ công
                    OutlinedButton(
                        onClick = onManualInputClick,
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = ColorAccentGreen),
                        border = androidx.compose.foundation.BorderStroke(1.dp, ColorAccentGreen.copy(alpha = 0.6f)),
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.fillMaxWidth(0.8f)
                    ) {
                        Icon(Icons.Default.Keyboard, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Nhập mã đơn thủ công", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    }
                }
            } else {
                // Khi chưa cấp quyền Camera
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(32.dp),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier
                            .size(72.dp)
                            .clip(CircleShape)
                            .background(ColorCardSurface),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Default.CameraAlt,
                            contentDescription = null,
                            tint = ColorAccentGreen,
                            modifier = Modifier.size(36.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    Text(
                        text = "Yêu cầu quyền truy cập Camera",
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = "Mock Bank cần sử dụng camera để quét mã QR thanh toán trên màn hình xe đẩy thông minh.",
                        color = Color(0xFF94A3B8),
                        fontSize = 14.sp,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(28.dp))

                    Button(
                        onClick = { permissionLauncher.launch(Manifest.permission.CAMERA) },
                        colors = ButtonDefaults.buttonColors(containerColor = ColorAccentGreen, contentColor = Color.Black),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Cấp quyền máy ảnh", fontWeight = FontWeight.Bold)
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    TextButton(onClick = onManualInputClick) {
                        Text("Dùng chế độ nhập mã thủ công", color = Color(0xFF94A3B8))
                    }
                }
            }
        }
    }
}

/**
 * Lớp phủ Viewfinder với khung cắt trong suốt và tia laser quét động
 */
@Composable
private fun ViewfinderOverlay(
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "laser_sweep")
    val laserProgress by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(1800, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "laser_anim"
    )

    BoxWithConstraints(modifier = modifier) {
        val boxWidth = maxWidth
        val boxHeight = maxHeight
        val scanBoxSize = 270.dp

        androidx.compose.foundation.Canvas(modifier = Modifier.fillMaxSize()) {
            val scanBoxPx = scanBoxSize.toPx()
            val left = (size.width - scanBoxPx) / 2f
            val top = (size.height - scanBoxPx) / 2.3f
            val right = left + scanBoxPx
            val bottom = top + scanBoxPx

            // 1. Cắt khung rỗng ở giữa và làm mờ xung quanh
            val cutOutRect = RoundRect(
                Rect(left, top, right, bottom),
                CornerRadius(24.dp.toPx(), 24.dp.toPx())
            )
            val cutOutPath = Path().apply { addRoundRect(cutOutRect) }

            clipPath(cutOutPath, clipOp = ClipOp.Difference) {
                drawRect(color = Color.Black.copy(alpha = 0.65f))
            }

            // 2. Vẽ 4 góc khung ngắm công nghệ cao
            val cornerLen = 32.dp.toPx()
            val strokeW = 4.dp.toPx()
            val cornerRadius = 24.dp.toPx()

            // Góc trên-trái
            drawLine(ColorAccentGreen, Offset(left, top + cornerLen), Offset(left, top + cornerRadius), strokeW)
            drawLine(ColorAccentGreen, Offset(left + cornerRadius, top), Offset(left + cornerLen, top), strokeW)

            // Góc trên-phải
            drawLine(ColorAccentGreen, Offset(right, top + cornerLen), Offset(right, top + cornerRadius), strokeW)
            drawLine(ColorAccentGreen, Offset(right - cornerRadius, top), Offset(right - cornerLen, top), strokeW)

            // Góc dưới-trái
            drawLine(ColorAccentGreen, Offset(left, bottom - cornerLen), Offset(left, bottom - cornerRadius), strokeW)
            drawLine(ColorAccentGreen, Offset(left + cornerRadius, bottom), Offset(left + cornerLen, bottom), strokeW)

            // Góc dưới-phải
            drawLine(ColorAccentGreen, Offset(right, bottom - cornerLen), Offset(right, bottom - cornerRadius), strokeW)
            drawLine(ColorAccentGreen, Offset(right - cornerRadius, bottom), Offset(right - cornerLen, bottom), strokeW)

            // 3. Vẽ tia laser quét chuyển động lên xuống
            val laserY = top + (bottom - top) * laserProgress
            drawLine(
                color = ColorAccentGreen,
                start = Offset(left + 10.dp.toPx(), laserY),
                end = Offset(right - 10.dp.toPx(), laserY),
                strokeWidth = 2.5.dp.toPx()
            )
        }
    }
}
