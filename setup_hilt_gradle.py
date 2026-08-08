import os

toml_path = 'gradle/libs.versions.toml'
with open(toml_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add hilt version
if 'hilt = "2.51.1"' not in content:
    content = content.replace('[versions]\n', '[versions]\nhilt = "2.51.1"\nhiltNavigationCompose = "1.2.0"\n')

# Add hilt libraries
libs = """
hilt-android = { group = "com.google.dagger", name = "hilt-android", version.ref = "hilt" }
hilt-compiler = { group = "com.google.dagger", name = "hilt-compiler", version.ref = "hilt" }
hilt-navigation-compose = { group = "androidx.hilt", name = "hilt-navigation-compose", version.ref = "hiltNavigationCompose" }
"""
if 'hilt-android' not in content:
    content = content.replace('[libraries]\n', '[libraries]\n' + libs)

# Add hilt plugin
plugins = """
hilt-android = { id = "com.google.dagger.hilt.android", version.ref = "hilt" }
"""
if 'hilt-android' not in content.split('[plugins]')[1]:
    content = content.replace('[plugins]\n', '[plugins]\n' + plugins)

with open(toml_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated libs.versions.toml")

# Update project build.gradle.kts
proj_build_path = 'build.gradle.kts'
with open(proj_build_path, 'r', encoding='utf-8') as f:
    proj_content = f.read()

if 'alias(libs.plugins.hilt.android)' not in proj_content:
    proj_content = proj_content.replace('plugins {\n', 'plugins {\n    alias(libs.plugins.hilt.android) apply false\n')

with open(proj_build_path, 'w', encoding='utf-8') as f:
    f.write(proj_content)

print("Updated project build.gradle.kts")

# Update app build.gradle.kts
app_build_path = 'app/build.gradle.kts'
with open(app_build_path, 'r', encoding='utf-8') as f:
    app_content = f.read()

if 'id("kotlin-kapt")' not in app_content:
    app_content = app_content.replace('plugins {\n', 'plugins {\n    id("kotlin-kapt")\n    alias(libs.plugins.hilt.android)\n')

if 'implementation(libs.hilt.android)' not in app_content:
    app_content = app_content.replace('dependencies {\n', 'dependencies {\n    implementation(libs.hilt.android)\n    kapt(libs.hilt.compiler)\n    implementation(libs.hilt.navigation.compose)\n')

with open(app_build_path, 'w', encoding='utf-8') as f:
    f.write(app_content)

print("Updated app build.gradle.kts")
