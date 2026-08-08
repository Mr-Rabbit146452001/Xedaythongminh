package com.example.xedaythongminh.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.windowsizeclass.WindowWidthSizeClass
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun ResponsiveLayout(
    windowSize: WindowWidthSizeClass,
    modifier: Modifier = Modifier,
    leftWeight: Float = 0.45f,
    rightWeight: Float = 0.55f,
    leftContent: @Composable (Modifier) -> Unit,
    rightContent: @Composable (Modifier) -> Unit
) {
    val isCompact = windowSize == WindowWidthSizeClass.Compact

    if (isCompact) {
        Column(
            modifier = modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            leftContent(Modifier.fillMaxWidth())
            rightContent(Modifier.fillMaxWidth())
        }
    } else {
        Row(
            modifier = modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            leftContent(Modifier.weight(leftWeight).fillMaxHeight())
            rightContent(Modifier.weight(rightWeight).fillMaxHeight())
        }
    }
}
