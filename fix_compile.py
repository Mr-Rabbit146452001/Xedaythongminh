import os

# Fix SessionEndedScreen.kt
session_path = 'app/src/main/java/com/example/xedaythongminh/ui/screens/SessionEndedScreen.kt'
with open(session_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the incorrectly placed imports
bad_import = 'import androidx.compose.runtime.LaunchedEffect\nimport kotlinx.coroutines.delay\n\n@Composable\nfun SessionEndedScreenPreview'
if bad_import in content:
    content = content.replace(bad_import, '@Composable\nfun SessionEndedScreenPreview')

with open(session_path, 'w', encoding='utf-8') as f:
    f.write(content)

# Fix WelcomeScreen.kt
welcome_path = 'app/src/main/java/com/example/xedaythongminh/ui/screens/WelcomeScreen.kt'
with open(welcome_path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'import androidx.compose.foundation.clickable' not in content:
    content = content.replace('import androidx.compose.foundation.background', 'import androidx.compose.foundation.background\nimport androidx.compose.foundation.clickable')

with open(welcome_path, 'w', encoding='utf-8') as f:
    f.write(content)

# Also check PaymentQRScreen.kt because I added .clickable there too
qr_path = 'app/src/main/java/com/example/xedaythongminh/ui/screens/PaymentQRScreen.kt'
with open(qr_path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'import androidx.compose.foundation.clickable' not in content:
    if 'import androidx.compose.foundation.background' in content:
        content = content.replace('import androidx.compose.foundation.background', 'import androidx.compose.foundation.background\nimport androidx.compose.foundation.clickable')
    else:
        content = content.replace('import androidx.compose.foundation.layout.*', 'import androidx.compose.foundation.layout.*\nimport androidx.compose.foundation.clickable')

with open(qr_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed syntax errors and imports.")
