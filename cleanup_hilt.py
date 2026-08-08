import os

# 1. Clean libs.versions.toml
toml_path = 'gradle/libs.versions.toml'
with open(toml_path, 'r', encoding='utf-8') as f:
    toml = f.read()

lines = toml.split('\n')
new_lines = []
for line in lines:
    if 'hilt' in line or 'ksp' in line:
        continue
    new_lines.append(line)

with open(toml_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_lines))

# 2. Clean project build.gradle.kts
proj_path = 'build.gradle.kts'
with open(proj_path, 'r', encoding='utf-8') as f:
    proj = f.read()

proj_lines = proj.split('\n')
new_proj_lines = []
for line in proj_lines:
    if 'hilt' in line or 'ksp' in line:
        continue
    new_proj_lines.append(line)

with open(proj_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_proj_lines))

# 3. Clean app build.gradle.kts
app_path = 'app/build.gradle.kts'
with open(app_path, 'r', encoding='utf-8') as f:
    app = f.read()

app_lines = app.split('\n')
new_app_lines = []
for line in app_lines:
    if 'hilt' in line or 'ksp' in line:
        continue
    new_app_lines.append(line)

with open(app_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_app_lines))

# 4. Remove Hilt annotations
# StrollerApplication.kt
app_kt = 'app/src/main/java/com/example/xedaythongminh/StrollerApplication.kt'
with open(app_kt, 'r', encoding='utf-8') as f:
    app_kt_content = f.read()
app_kt_content = app_kt_content.replace('import dagger.hilt.android.HiltAndroidApp\n', '')
app_kt_content = app_kt_content.replace('@HiltAndroidApp\n', '')
with open(app_kt, 'w', encoding='utf-8') as f:
    f.write(app_kt_content)

# MainActivity.kt
main_kt = 'app/src/main/java/com/example/xedaythongminh/MainActivity.kt'
with open(main_kt, 'r', encoding='utf-8') as f:
    main_kt_content = f.read()
main_kt_content = main_kt_content.replace('import dagger.hilt.android.AndroidEntryPoint\n', '')
main_kt_content = main_kt_content.replace('@AndroidEntryPoint\n', '')
with open(main_kt, 'w', encoding='utf-8') as f:
    f.write(main_kt_content)

# AppViewModel.kt
vm_kt = 'app/src/main/java/com/example/xedaythongminh/ui/viewmodel/AppViewModel.kt'
with open(vm_kt, 'r', encoding='utf-8') as f:
    vm_kt_content = f.read()
vm_kt_content = vm_kt_content.replace('import dagger.hilt.android.lifecycle.HiltViewModel\n', '')
vm_kt_content = vm_kt_content.replace('import javax.inject.Inject\n', '')
vm_kt_content = vm_kt_content.replace('@HiltViewModel\n', '')
vm_kt_content = vm_kt_content.replace('@Inject constructor', 'constructor')
with open(vm_kt, 'w', encoding='utf-8') as f:
    f.write(vm_kt_content)

# 5. Remove AppModule and CartRepositoryImpl @Inject
repo_kt = 'app/src/main/java/com/example/xedaythongminh/data/repository/CartRepositoryImpl.kt'
with open(repo_kt, 'r', encoding='utf-8') as f:
    repo_kt_content = f.read()
repo_kt_content = repo_kt_content.replace('import javax.inject.Inject\n', '')
repo_kt_content = repo_kt_content.replace('@Inject constructor', 'constructor')
with open(repo_kt, 'w', encoding='utf-8') as f:
    f.write(repo_kt_content)

print("Cleaned up Hilt!")
