package com.example.xedaythongminh.data.models

enum class NotificationType {
    ADD,
    REMOVE
}

data class CartNotification(
    val id: Long = System.currentTimeMillis(),
    val message: String,
    val productName: String,
    val type: NotificationType,
    val durationMs: Long = 2500L
)
