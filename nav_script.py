import os
import re

def update_screen(file_path, screen_name, replacements):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'androidx.navigation.NavController' not in content:
        content = content.replace('import androidx.compose.runtime.*', 'import androidx.compose.runtime.*\nimport androidx.navigation.NavController\nimport androidx.navigation.compose.rememberNavController')
        content = content.replace('import androidx.compose.runtime.Composable', 'import androidx.compose.runtime.Composable\nimport androidx.navigation.NavController\nimport androidx.navigation.compose.rememberNavController')
    
    # Update signature
    if f'fun {screen_name}(appViewModel' in content and 'navController: NavController' not in content:
        content = re.sub(rf'fun {screen_name}\(appViewModel: AppViewModel = androidx.lifecycle.viewmodel.compose.viewModel\(\)\)', 
                         f'fun {screen_name}(appViewModel: AppViewModel = androidx.lifecycle.viewmodel.compose.viewModel(), navController: NavController = rememberNavController())', 
                         content)
                         
    # Update bottom nav
    content = re.sub(r'BottomNavBar\(activeLabel = "([^"]+)"\)', r'BottomNavBar(activeLabel = "\1", navController = navController)', content)

    for old, new in replacements:
        content = content.replace(old, new)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)


# PaymentQRScreen
update_screen('app/src/main/java/com/example/xedaythongminh/ui/screens/PaymentQRScreen.kt', 'PaymentQRScreen', [
    ('onClick = { /* TODO */ }', 'onClick = { navController.popBackStack() }'),
    ('painter = painterResource(id = R.drawable.ic_launcher_background), // Thay bằng mã QR thật', 
     'painter = painterResource(id = R.drawable.ic_launcher_background), // Thay bằng mã QR thật\n                            modifier = Modifier.clickable { navController.navigate("payment_success") }')
])

# PaymentSuccessScreen
update_screen('app/src/main/java/com/example/xedaythongminh/ui/screens/PaymentSuccessScreen.kt', 'PaymentSuccessScreen', [
    ('onClick = { /* TODO */ }', 'onClick = { \n                        appViewModel.clearSession()\n                        navController.navigate("session_ended") \n                    }')
])

# SessionEndedScreen
update_screen('app/src/main/java/com/example/xedaythongminh/ui/screens/SessionEndedScreen.kt', 'SessionEndedScreen', [
    ('@Composable\nfun SessionEndedScreen', 'import androidx.compose.runtime.LaunchedEffect\nimport kotlinx.coroutines.delay\n\n@Composable\nfun SessionEndedScreen'),
    ('Scaffold(', 'LaunchedEffect(Unit) {\n        delay(10000)\n        navController.navigate("welcome") {\n            popUpTo(0) { inclusive = true }\n        }\n    }\n\n    Scaffold(')
])

# ConnectionErrorScreen
update_screen('app/src/main/java/com/example/xedaythongminh/ui/screens/ConnectionErrorScreen.kt', 'ConnectionErrorScreen', [
    ('onClick = { /* TODO: Retry logic */ }', 'onClick = { navController.popBackStack() }'),
    ('onClick = { /* TODO: Call support */ }', 'onClick = { /* TODO: Call support */ }')
])

print("Applied navigation logic to remaining screens.")
