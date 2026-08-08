import os

def update_manual_di(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    modified = False
    
    if 'hiltViewModel()' in content:
        content = content.replace('hiltViewModel()', 'androidx.lifecycle.viewmodel.compose.viewModel(factory = com.example.xedaythongminh.ui.viewmodel.AppViewModelProvider.Factory)')
        content = content.replace('import androidx.hilt.navigation.compose.hiltViewModel\n', '')
        modified = True
            
    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

UI_DIRS = [
    'app/src/main/java/com/example/xedaythongminh/ui/screens',
    'app/src/main/java/com/example/xedaythongminh/ui/navigation'
]

for d in UI_DIRS:
    for root, _, files in os.walk(d):
        for file in files:
            if file.endswith('.kt'):
                update_manual_di(os.path.join(root, file))

print("Applied Manual DI to all screens and navigation.")
