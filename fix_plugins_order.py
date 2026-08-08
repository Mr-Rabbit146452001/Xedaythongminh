import os

app_path = 'app/build.gradle.kts'
with open(app_path, 'r', encoding='utf-8') as f:
    app = f.read()

correct_plugins = """plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ksp)
    alias(libs.plugins.hilt.android)
}"""

# Find the current plugins block and replace it
import re
app = re.sub(r'plugins \{.*?\}', correct_plugins, app, flags=re.DOTALL)

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(app)

print("Fixed plugins order!")
