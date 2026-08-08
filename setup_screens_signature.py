import os
import re

app_nav_path = 'app/src/main/java/com/example/xedaythongminh/ui/navigation/AppNavigation.kt'

with open(app_nav_path, 'r', encoding='utf-8') as f:
    app_nav = f.read()

# Replace the entire content of AppNavigation.kt
new_app_nav = """package com.example.xedaythongminh.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.material3.windowsizeclass.WindowWidthSizeClass
import com.example.xedaythongminh.ui.screens.CartDetailScreen
import com.example.xedaythongminh.ui.screens.ScanCustomerScreen
import com.example.xedaythongminh.ui.screens.ScanProductScreen
import com.example.xedaythongminh.ui.screens.WelcomeScreen
import com.example.xedaythongminh.ui.screens.PaymentSelectionScreen
import com.example.xedaythongminh.ui.screens.PaymentQRScreen
import com.example.xedaythongminh.ui.screens.PaymentSuccessScreen
import com.example.xedaythongminh.ui.screens.SessionEndedScreen
import com.example.xedaythongminh.ui.screens.ConnectionErrorScreen
import com.example.xedaythongminh.ui.viewmodel.AppViewModel
import com.example.xedaythongminh.ui.viewmodel.AppViewModelProvider

@Composable
fun AppNavigation(
    appViewModel: AppViewModel = viewModel(factory = AppViewModelProvider.Factory),
    windowSize: WindowWidthSizeClass
) {
    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = "welcome") {
        composable("welcome") {
            WelcomeScreen(navController = navController, windowSize = windowSize) 
        }
        composable("scan_customer") {
            ScanCustomerScreen(appViewModel = appViewModel, navController = navController, windowSize = windowSize)
        }
        composable("scan_product") {
            ScanProductScreen(appViewModel = appViewModel, navController = navController, windowSize = windowSize)
        }
        composable("cart_detail") {
            CartDetailScreen(appViewModel = appViewModel, navController = navController, windowSize = windowSize)
        }
        composable("payment_selection") {
            PaymentSelectionScreen(appViewModel = appViewModel, navController = navController, windowSize = windowSize)
        }
        composable("payment_qr") {
            PaymentQRScreen(appViewModel = appViewModel, navController = navController, windowSize = windowSize)
        }
        composable("payment_success") {
            PaymentSuccessScreen(appViewModel = appViewModel, navController = navController, windowSize = windowSize)
        }
        composable("session_ended") {
            SessionEndedScreen(appViewModel = appViewModel, navController = navController, windowSize = windowSize)
        }
        composable("connection_error") {
            ConnectionErrorScreen(appViewModel = appViewModel, navController = navController, windowSize = windowSize)
        }
    }
}
"""

with open(app_nav_path, 'w', encoding='utf-8') as f:
    f.write(new_app_nav)


# Now update all screens to accept windowSize: WindowWidthSizeClass
UI_DIRS = [
    'app/src/main/java/com/example/xedaythongminh/ui/screens',
]

def update_screen_signature(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add import if missing
    if 'import androidx.compose.material3.windowsizeclass.WindowWidthSizeClass' not in content:
        content = content.replace('import androidx.compose.runtime.Composable', 'import androidx.compose.runtime.Composable\nimport androidx.compose.material3.windowsizeclass.WindowWidthSizeClass')

    # Add windowSize to signature
    # Find the main Composable function definition.
    # E.g., fun WelcomeScreen(navController: NavController) -> fun WelcomeScreen(navController: NavController, windowSize: WindowWidthSizeClass = WindowWidthSizeClass.Expanded)
    
    # Simple regex for finding main composable. E.g. fun ScanCustomerScreen(
    basename = os.path.basename(file_path)
    screen_name = basename.replace('.kt', '')
    
    # We will just replace `navController: NavController` with `navController: NavController, windowSize: WindowWidthSizeClass = WindowWidthSizeClass.Expanded`
    if 'windowSize: WindowWidthSizeClass' not in content:
        # Some screens have `navController: NavHostController`, others `navController: NavController`
        content = re.sub(r'(navController: [A-Za-z]+Controller)', r'\1, windowSize: WindowWidthSizeClass = WindowWidthSizeClass.Expanded', content)

    # Some screens only have appViewModel, no navController? All screens should have navController.
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

for d in UI_DIRS:
    for root, _, files in os.walk(d):
        for file in files:
            if file.endswith('Screen.kt'):
                update_screen_signature(os.path.join(root, file))

print("Updated AppNavigation and all screens signatures.")
