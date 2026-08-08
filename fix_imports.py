import os

IMPORTS = """
import androidx.compose.ui.res.stringResource
import com.example.xedaythongminh.R
import com.example.xedaythongminh.ui.theme.*
"""

def fix_imports(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # If the file already has them, don't duplicate (but wait, we didn't inject them where they were missing)
    # Let's just blindly inject after the package statement if not present
    if 'import com.example.xedaythongminh.ui.theme.*' not in content:
        if 'package com.example.xedaythongminh.ui.screens' in content:
            content = content.replace('package com.example.xedaythongminh.ui.screens', 'package com.example.xedaythongminh.ui.screens\n' + IMPORTS)
        elif 'package com.example.xedaythongminh.ui.components' in content:
            content = content.replace('package com.example.xedaythongminh.ui.components', 'package com.example.xedaythongminh.ui.components\n' + IMPORTS)
            
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
                fix_imports(os.path.join(root, file))

print("Fixed imports globally.")
