import os

# Fix gradle.properties
props_path = 'gradle.properties'
with open(props_path, 'r', encoding='utf-8') as f:
    props = f.read()
props = props.replace('android.builtInKotlin=false\n', '')
props = props.replace('android.newDsl=false\n', '')
with open(props_path, 'w', encoding='utf-8') as f:
    f.write(props)

# Fix libs.versions.toml
toml_path = 'gradle/libs.versions.toml'
with open(toml_path, 'r', encoding='utf-8') as f:
    toml = f.read()

if 'ksp = "2.2.10-1.0.29"' not in toml:
    toml = toml.replace('[versions]\n', '[versions]\nksp = "2.2.10-1.0.29"\n')

if 'ksp = { id = "com.google.devtools.ksp"' not in toml:
    toml = toml.replace('[plugins]\n', '[plugins]\nksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }\n')

with open(toml_path, 'w', encoding='utf-8') as f:
    f.write(toml)

# Fix project build.gradle.kts
proj_path = 'build.gradle.kts'
with open(proj_path, 'r', encoding='utf-8') as f:
    proj = f.read()

if 'alias(libs.plugins.ksp)' not in proj:
    proj = proj.replace('alias(libs.plugins.hilt.android) apply false\n', 'alias(libs.plugins.hilt.android) apply false\n    alias(libs.plugins.ksp) apply false\n')

with open(proj_path, 'w', encoding='utf-8') as f:
    f.write(proj)

# Fix app build.gradle.kts
app_path = 'app/build.gradle.kts'
with open(app_path, 'r', encoding='utf-8') as f:
    app = f.read()

app = app.replace('id("kotlin-kapt")\n', 'alias(libs.plugins.ksp)\n')
# Also remove any left over kapt
app = app.replace('kapt(libs.hilt.compiler)\n', 'add("ksp", libs.hilt.compiler)\n')

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(app)

print("Switched to KSP!")
