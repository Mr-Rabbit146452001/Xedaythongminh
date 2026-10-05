package com.example.xedaythongminh.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.windowsizeclass.WindowWidthSizeClass
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

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
            leftContent(
                Modifier
                    .weight(leftWeight)
                    .fillMaxHeight()
            )
            rightContent(
                Modifier
                    .weight(rightWeight)
                    .fillMaxHeight()
            )
        }
    }
}

@Preview(showBackground = true, widthDp = 1280, heightDp = 800, name = "Tablet Landscape - Responsive Layout")
@Composable
fun ResponsiveLayoutExpandedPreview() {
    MaterialTheme {
        ResponsiveLayout(
            windowSize = WindowWidthSizeClass.Expanded,
            leftWeight = 0.5f,
            rightWeight = 0.5f,
            leftContent = { modifier ->
                Card(
                    modifier = modifier.padding(8.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFE3F2FD))
                ) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("Left Content (50% Tablet)", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = Color(0xFF1565C0))
                    }
                }
            },
            rightContent = { modifier ->
                Card(
                    modifier = modifier.padding(8.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFE8F5E9))
                ) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("Right Content (50% Tablet)", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = Color(0xFF2E7D32))
                    }
                }
            }
        )
    }
}

@Preview(showBackground = true, widthDp = 400, heightDp = 800, name = "Phone Portrait - Responsive Layout")
@Composable
fun ResponsiveLayoutCompactPreview() {
    MaterialTheme {
        ResponsiveLayout(
            windowSize = WindowWidthSizeClass.Compact,
            leftContent = { modifier ->
                Card(
                    modifier = modifier.height(200.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFE3F2FD))
                ) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("Top Content (Compact)", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color(0xFF1565C0))
                    }
                }
            },
            rightContent = { modifier ->
                Card(
                    modifier = modifier.height(300.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFE8F5E9))
                ) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("Bottom Content (Compact)", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color(0xFF2E7D32))
                    }
                }
            }
        )
    }
}
