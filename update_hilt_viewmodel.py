import os

def replace_viewmodel_default(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    modified = False
    
    if 'androidx.lifecycle.viewmodel.compose.viewModel()' in content:
        content = content.replace('androidx.lifecycle.viewmodel.compose.viewModel()', 'hiltViewModel()')
        content = content.replace('import androidx.lifecycle.viewmodel.compose.viewModel', 'import androidx.hilt.navigation.compose.hiltViewModel')
        
        # If it wasn't imported, add it
        if 'import androidx.hilt.navigation.compose.hiltViewModel' not in content:
            content = content.replace('import androidx.compose.runtime.Composable', 'import androidx.compose.runtime.Composable\nimport androidx.hilt.navigation.compose.hiltViewModel')
        
        modified = True
            
    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

UI_DIRS = [
    'app/src/main/java/com/example/xedaythongminh/ui/screens',
    'app/src/main/java/com/example/xedaythongminh/ui/components'
]

for d in UI_DIRS:
    for root, _, files in os.walk(d):
        for file in files:
            if file.endswith('.kt'):
                replace_viewmodel_default(os.path.join(root, file))

print("Replaced viewModel() with hiltViewModel() in screens.")
