import os

def fix_explicit_imports(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    to_remove = [
        'import com.example.xedaythongminh.ui.screens.PrimaryBlue\n',
        'import com.example.xedaythongminh.ui.screens.BackgroundGray\n',
        'import com.example.xedaythongminh.ui.screens.TextDark\n',
        'import com.example.xedaythongminh.ui.screens.TextGray\n',
        'import com.example.xedaythongminh.ui.screens.BorderGray\n',
        'import com.example.xedaythongminh.ui.screens.GreenAccent\n'
    ]
    
    modified = False
    for r in to_remove:
        if r in content:
            content = content.replace(r, '')
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
                fix_explicit_imports(os.path.join(root, file))

print("Removed dead explicit imports.")
