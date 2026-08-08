import os
import re

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

imports_to_add = """import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import com.example.xedaythongminh.ui.viewmodel.AppViewModel
"""

for screen in screens:
    path = os.path.join(SCREENS_DIR, screen)
    if not os.path.exists(path):
        continue
        
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Add imports
    if 'import com.example.xedaythongminh.ui.viewmodel.AppViewModel' not in content:
        content = content.replace('import androidx.compose.runtime.Composable', imports_to_add + 'import androidx.compose.runtime.Composable')
        
    # Add parameter
    func_name = screen.replace('.kt', '')
    content = content.replace(f'fun {func_name}() {{', f'fun {func_name}(appViewModel: AppViewModel) {{')
    
    # Replace MockData.currentUser
    content = content.replace('val user = MockData.currentUser', 'val user by appViewModel.userState.collectAsState()')
    
    # Replace MockData.cartItems
    content = content.replace('val cartItems = MockData.cartItems', 'val cartItems by appViewModel.cartItemsState.collectAsState()')
    
    # SessionEnded specific
    if screen == 'SessionEndedScreen.kt':
        content = content.replace('MockData.clearSession()', 'appViewModel.clearSession()')
        
    # Previews: since preview functions call the screen without arguments, we need to pass a dummy viewmodel or skip preview. 
    # To fix preview, we can provide a default parameter in the composable: `fun Screen(appViewModel: AppViewModel = androidx.lifecycle.viewmodel.compose.viewModel())`
    # Or just replace the preview call. Let's add viewModel() to preview or modify the signature.
    # Actually, modifying signature to `fun Screen(appViewModel: AppViewModel = androidx.lifecycle.viewmodel.compose.viewModel())` is better.
    
    content = content.replace(f'fun {func_name}(appViewModel: AppViewModel) {{', f'fun {func_name}(appViewModel: AppViewModel = androidx.lifecycle.viewmodel.compose.viewModel()) {{')
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Refactored screens successfully")
