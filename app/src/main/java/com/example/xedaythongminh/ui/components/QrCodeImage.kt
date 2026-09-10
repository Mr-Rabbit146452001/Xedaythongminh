package com.example.xedaythongminh.ui.components

import android.graphics.Bitmap
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.unit.dp
import com.google.zxing.BarcodeFormat
import com.google.zxing.EncodeHintType
import com.google.zxing.qrcode.QRCodeWriter
import androidx.compose.material3.MaterialTheme
import androidx.compose.ui.tooling.preview.Preview
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@Composable
fun QrCodeImage(
    content: String?,
    modifier: Modifier = Modifier,
    size: Int = 512
) {
    var qrBitmap by remember(content) { mutableStateOf<Bitmap?>(null) }
    var isGenerating by remember(content) { mutableStateOf(true) }

    LaunchedEffect(content) {
        if (content.isNullOrBlank()) {
            qrBitmap = null
            isGenerating = false
            return@LaunchedEffect
        }
        isGenerating = true
        qrBitmap = withContext(Dispatchers.Default) {
            try {
                val hints = hashMapOf<EncodeHintType, Any>(
                    EncodeHintType.MARGIN to 1,
                    EncodeHintType.CHARACTER_SET to "UTF-8"
                )
                val bitMatrix = QRCodeWriter().encode(content, BarcodeFormat.QR_CODE, size, size, hints)
                val width = bitMatrix.width
                val height = bitMatrix.height
                val pixels = IntArray(width * height)
                for (y in 0 until height) {
                    val offset = y * width
                    for (x in 0 until width) {
                        pixels[offset + x] = if (bitMatrix.get(x, y)) android.graphics.Color.BLACK else android.graphics.Color.WHITE
                    }
                }
                val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.RGB_565)
                bitmap.setPixels(pixels, 0, width, 0, 0, width, height)
                bitmap
            } catch (e: Exception) {
                null
            }
        }
        isGenerating = false
    }

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .background(Color.White)
            .padding(12.dp),
        contentAlignment = Alignment.Center
    ) {
        if (isGenerating) {
            CircularProgressIndicator(color = Color(0xFF1E88E5))
        } else if (qrBitmap != null) {
            Image(
                bitmap = qrBitmap!!.asImageBitmap(),
                contentDescription = "Payment QR Code",
                modifier = Modifier.fillMaxSize()
            )
        }
    }
}

@Preview(showBackground = true, name = "Component - QR Code")
@Composable
fun QrCodeImagePreview() {
    MaterialTheme {
        Box(modifier = Modifier.padding(16.dp)) {
            QrCodeImage(
                content = "00020101021238540010A00000072701240006970422011012345678905204739953037045405500005802VN6304ABCD",
                modifier = Modifier.padding(8.dp)
            )
        }
    }
}