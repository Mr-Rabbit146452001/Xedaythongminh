import os

SCREENS_DIR = 'app/src/main/java/com/example/xedaythongminh/ui/screens'

replacements = {
    'Locale("vi", "VN")': 'Locale.forLanguageTag("vi-VN")',
}

for root, _, files in os.walk(SCREENS_DIR):
    for file in files:
        if not file.endswith('.kt'): continue
        path = os.path.join(root, file)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        modified = False
        for old, new in replacements.items():
            if old in content:
                content = content.replace(old, new)
                modified = True
                
        if modified:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)

print("Cleaned up Locale deprecations.")
