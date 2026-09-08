package com.example.mockbank.ui.camera

import androidx.annotation.OptIn
import androidx.camera.core.ExperimentalGetImage
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import com.example.mockbank.data.QrPayload
import com.google.gson.Gson
import com.google.mlkit.vision.barcode.BarcodeScannerOptions
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage

/**
 * Phân tích khung hình từ CameraX để nhận diện mã QR của Xe Đẩy Thông Minh.
 * Tự động trích xuất chuỗi JSON thành đối tượng QrPayload.
 */
class QrCodeAnalyzer(
    private val onQrCodeDetected: (QrPayload) -> Unit
) : ImageAnalysis.Analyzer {

    private val gson = Gson()
    private val options = BarcodeScannerOptions.Builder()
        .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
        .build()

    private val scanner = BarcodeScanning.getClient(options)
    private var isScanned = false

    @OptIn(ExperimentalGetImage::class)
    override fun analyze(imageProxy: ImageProxy) {
        if (isScanned) {
            imageProxy.close()
            return
        }

        val mediaImage = imageProxy.image
        if (mediaImage != null) {
            val image = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)
            scanner.process(image)
                .addOnSuccessListener { barcodes ->
                    for (barcode in barcodes) {
                        val rawValue = barcode.rawValue ?: barcode.displayValue
                        if (!rawValue.isNullOrBlank()) {
                            try {
                                // Phân tích cú pháp JSON từ QR xe đẩy
                                val payload = gson.fromJson(rawValue, QrPayload::class.java)
                                if (!payload.orderId.isNullOrBlank() && payload.amount > 0) {
                                    isScanned = true
                                    onQrCodeDetected(payload)
                                    break
                                }
                            } catch (e: Exception) {
                                // Không phải JSON hợp lệ, tiếp tục quét
                            }
                        }
                    }
                }
                .addOnFailureListener {
                    // Lỗi quét frame
                }
                .addOnCompleteListener {
                    imageProxy.close()
                }
        } else {
            imageProxy.close()
        }
    }
}
