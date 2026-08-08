import os

SCREENS_DIR = 'app/src/main/java/com/example/xedaythongminh/ui/screens'

screens = [
    'ScanCustomerScreen.kt',
    'ScanProductScreen.kt',
    'CartDetailScreen.kt',
    'PaymentSelectionScreen.kt',
    'PaymentQRScreen.kt',
    'PaymentSuccessScreen.kt',
    'SessionEndedScreen.kt'
]

imports_to_ensure = [
    "import androidx.compose.runtime.collectAsState\n",
    "import androidx.compose.runtime.getValue\n",
    "import com.example.xedaythongminh.ui.viewmodel.AppViewModel\n"
]

for screen in screens:
    path = os.path.join(SCREENS_DIR, screen)
    if not os.path.exists(path): continue
    
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Ensure imports
    for imp in imports_to_ensure:
        if imp.strip() not in content:
            content = content.replace("import androidx.compose.runtime.Composable", imp + "import androidx.compose.runtime.Composable")
            
    # Fix ScanProductScreen CartSidebar
    if screen == 'ScanProductScreen.kt':
        content = content.replace('fun CartSidebar(modifier: Modifier = Modifier) {', 'fun CartSidebar(modifier: Modifier = Modifier, appViewModel: AppViewModel = androidx.lifecycle.viewmodel.compose.viewModel()) {')

    # Fix ScanCustomerScreen delegated property smart cast
    if screen == 'ScanCustomerScreen.kt':
        content = content.replace('if (user != null) {', 'val currentUser = user\n                if (currentUser != null) {')
        # Replace user.name -> currentUser.name, user.points -> currentUser.points, user.membershipLevel -> currentUser.membershipLevel
        content = content.replace('user.name', 'currentUser.name')
        content = content.replace('user.points', 'currentUser.points')
        content = content.replace('user.membershipLevel', 'currentUser.membershipLevel')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixes applied.")
