import os
import re

UI_DIRS = [
    'app/src/main/java/com/example/xedaythongminh/ui/screens',
]

def fix_syntax(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix WindowWidthSizeClass.Expanded? = null
    content = content.replace('= WindowWidthSizeClass.Expanded? = null', '? = null, windowSize: WindowWidthSizeClass = WindowWidthSizeClass.Expanded')

    # Fix WelcomeScreenPreview etc missing parameters if they show errors?
    # Not strictly necessary yet.

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

for d in UI_DIRS:
    for root, _, files in os.walk(d):
        for file in files:
            if file.endswith('Screen.kt'):
                fix_syntax(os.path.join(root, file))

print("Fixed syntax errors.")
