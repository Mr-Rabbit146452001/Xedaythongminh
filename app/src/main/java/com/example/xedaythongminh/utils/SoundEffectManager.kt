package com.example.xedaythongminh.utils

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.SoundPool
import android.media.ToneGenerator
import android.util.Log
import com.example.xedaythongminh.R

/**
 * SoundEffectManager: Quản lý và phát hiệu ứng âm thanh phản hồi tức thì (Zero-Latency Feedback)
 * cho ứng dụng Xe đẩy thông minh (Stroller App).
 * 
 * - Ưu tiên 1: Sử dụng SoundPool với file âm thanh chuẩn siêu thị (R.raw.beep_scan).
 * - Ưu tiên 2 (Fallback): Sử dụng ToneGenerator chuẩn phần cứng POS acknowledgment beep (TONE_PROP_ACK).
 */
object SoundEffectManager {
    private const val TAG = "SoundEffectManager"

    private var soundPool: SoundPool? = null
    private var scanBeepSoundId: Int = 0
    private var isLoaded: Boolean = false
    private var toneGenerator: ToneGenerator? = null

    /**
     * Khởi tạo SoundEffectManager trong Application onCreate.
     */
    fun initialize(context: Context) {
        val appContext = context.applicationContext
        try {
            val audioAttributes = AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_ASSISTANCE_SONIFICATION)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build()

            soundPool = SoundPool.Builder()
                .setMaxStreams(4)
                .setAudioAttributes(audioAttributes)
                .build().apply {
                    setOnLoadCompleteListener { _, sampleId, status ->
                        if (status == 0 && sampleId == scanBeepSoundId) {
                            isLoaded = true
                            Log.d(TAG, "Barcode scan beep sound loaded successfully")
                        }
                    }
                }

            scanBeepSoundId = soundPool?.load(appContext, R.raw.beep_scan, 1) ?: 0
        } catch (e: Exception) {
            Log.e(TAG, "Failed to initialize SoundPool: ${e.message}")
        }

        try {
            toneGenerator = ToneGenerator(AudioManager.STREAM_NOTIFICATION, 100)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to initialize ToneGenerator: ${e.message}")
        }
    }

    private fun getToneGenerator(): ToneGenerator? {
        if (toneGenerator == null) {
            try {
                toneGenerator = ToneGenerator(AudioManager.STREAM_NOTIFICATION, 100)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to lazy init ToneGenerator: ${e.message}")
            }
        }
        return toneGenerator
    }

    /**
     * Phát âm thanh bíp nhận diện sản phẩm thành công khi thêm vào giỏ hàng.
     * Âm thanh bíp chuẩn máy quét mã vạch siêu thị POS (Retail Scanner Chirp, pitch 1.0f).
     */
    fun playScanSuccess() {
        try {
            if (isLoaded && soundPool != null && scanBeepSoundId != 0) {
                val streamId = soundPool?.play(scanBeepSoundId, 1.0f, 1.0f, 1, 0, 1.0f) ?: 0
                if (streamId != 0) return
            }

            // Fallback sang ToneGenerator nếu SoundPool đang nạp hoặc không khả dụng
            val tg = getToneGenerator()
            tg?.startTone(ToneGenerator.TONE_PROP_ACK, 130)
                ?: tg?.startTone(ToneGenerator.TONE_PROP_BEEP, 130)
        } catch (e: Exception) {
            Log.e(TAG, "Error playing scan success sound: ${e.message}")
        }
    }

    /**
     * Phát âm thanh pip nhận diện lấy sản phẩm ra khỏi giỏ hàng thành công.
     * Sử dụng âm pip trầm hơn (pitch 0.8f) hoặc double-beep phần cứng để phân biệt rõ với âm thêm hàng.
     */
    fun playRemoveSuccess() {
        try {
            if (isLoaded && soundPool != null && scanBeepSoundId != 0) {
                val streamId = soundPool?.play(scanBeepSoundId, 1.0f, 1.0f, 1, 0, 0.8f) ?: 0
                if (streamId != 0) return
            }

            // Fallback sang ToneGenerator nếu SoundPool đang nạp hoặc không khả dụng
            val tg = getToneGenerator()
            tg?.startTone(ToneGenerator.TONE_PROP_BEEP2, 160)
                ?: tg?.startTone(ToneGenerator.TONE_CDMA_PIP, 150)
        } catch (e: Exception) {
            Log.e(TAG, "Error playing remove success sound: ${e.message}")
        }
    }

    /**
     * Giải phóng tài nguyên âm thanh khi không còn sử dụng.
     */
    fun release() {
        try {
            soundPool?.release()
            soundPool = null
            toneGenerator?.release()
            toneGenerator = null
            isLoaded = false
        } catch (e: Exception) {
            Log.e(TAG, "Error releasing SoundEffectManager: ${e.message}")
        }
    }
}
