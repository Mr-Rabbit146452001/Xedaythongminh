import os

SCREENS_DIR = 'app/src/main/java/com/example/xedaythongminh/ui/screens'

for root, _, files in os.walk(SCREENS_DIR):
    for file in files:
        if not file.endswith('.kt'): continue
        path = os.path.join(root, file)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        modified = False
        
        if 'HorizontalHorizontalDivider' in content:
            content = content.replace('HorizontalHorizontalDivider', 'HorizontalDivider')
            modified = True
            
        if 'Icons.AutoMirrored' in content and 'import androidx.compose.material.icons.automirrored.filled.*' not in content:
            content = content.replace('import androidx.compose.material.icons.filled.*', 'import androidx.compose.material.icons.filled.*\nimport androidx.compose.material.icons.automirrored.filled.*')
            modified = True
            
        if modified:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)

print("Fixed broken code.")
