import os
import re

# 1. Update libs.versions.toml
toml_path = 'gradle/libs.versions.toml'
with open(toml_path, 'r', encoding='utf-8') as f:
    toml = f.read()

# Add to libraries
if 'androidx-compose-material3-windowSizeClass' not in toml:
    lib_entry = 'androidx-compose-material3-windowSizeClass = { group = "androidx.compose.material3", name = "material3-window-size-class" }'
    toml = toml.replace('[libraries]\n', f'[libraries]\n{lib_entry}\n')
    
with open(toml_path, 'w', encoding='utf-8') as f:
    f.write(toml)

# 2. Update app/build.gradle.kts
app_path = 'app/build.gradle.kts'
with open(app_path, 'r', encoding='utf-8') as f:
    app = f.read()

if 'implementation(libs.androidx.compose.material3.windowSizeClass)' not in app:
    app = app.replace('implementation(libs.androidx.compose.material3)', 'implementation(libs.androidx.compose.material3)\n    implementation(libs.androidx.compose.material3.windowSizeClass)')

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(app)

print("Updated Gradle configuration for WindowSizeClass")
