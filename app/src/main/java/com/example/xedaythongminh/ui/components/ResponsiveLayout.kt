package com.example.xedaythongminh.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.windowsizeclass.WindowWidthSizeClass
import androidx.compose.runtime.Composable
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
                .padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            leftContent(Modifier.fillMaxWidth().wrapContentHeight())
            rightContent(Modifier.fillMaxWidth().wrapContentHeight())
        }
    } else {
        Row(
            modifier = modifier
                .fillMaxSize()
                .padding(12.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Box(
                modifier = Modifier
                    .weight(leftWeight)
                    .fillMaxHeight()
                    .verticalScroll(rememberScrollState())
            ) {
                leftContent(Modifier.fillMaxWidth().wrapContentHeight())
            }
            Box(
                modifier = Modifier
                    .weight(rightWeight)
                    .fillMaxHeight()
                    .verticalScroll(rememberScrollState())
            ) {
                rightContent(Modifier.fillMaxWidth().wrapContentHeight())
            }
        }
    }
}
