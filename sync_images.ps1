# ============================================================
# sync_images.ps1
# Đồng bộ ảnh sản phẩm từ server/public/images/ 
# sang web-admin/public/products/ và web-admin/public/images/
# Hỗ trợ đường dẫn động linh hoạt trên mọi máy tính ($PSScriptRoot)
# ============================================================

$root      = $PSScriptRoot
$source    = Join-Path $root "server\public\images"
$destProd  = Join-Path $root "web-admin\public\products"
$destImg   = Join-Path $root "web-admin\public\images"

Write-Host "`n======================================================"
Write-Host "  ĐỒNG BỘ ẢNH SẢN PHẨM -> WEB ADMIN"
Write-Host "======================================================`n"

if (-not (Test-Path $source)) {
    Write-Error "Không tìm thấy thư mục nguồn: $source"
    exit 1
}

if (-not (Test-Path $destProd)) { New-Item -ItemType Directory -Path $destProd -Force | Out-Null }
if (-not (Test-Path $destImg))  { New-Item -ItemType Directory -Path $destImg  -Force | Out-Null }

$sourceFiles = Get-ChildItem $source -File
$copied = 0
$skipped = 0

foreach ($file in $sourceFiles) {
    $destProdPath = Join-Path $destProd $file.Name
    $destImgPath  = Join-Path $destImg  $file.Name

    # Đồng bộ vào /products/
    if (-not (Test-Path $destProdPath)) {
        Copy-Item $file.FullName $destProdPath
        Write-Host "  ✅ COPIED (products): $($file.Name)"
        $copied++
    } else {
        $skipped++
    }

    # Đồng bộ vào /images/ (đảm bảo cả 2 nơi đều có)
    if (-not (Test-Path $destImgPath)) {
        Copy-Item $file.FullName $destImgPath
        Write-Host "  ✅ COPIED (images):   $($file.Name)"
    }
}

Write-Host "`n--------------------------------------------------"
Write-Host "  Tổng: $($sourceFiles.Count) file(s) trong server"
Write-Host "  Đã copy mới: $copied file(s)"
Write-Host "  Đã có sẵn:   $skipped file(s)"
Write-Host "--------------------------------------------------`n"
Write-Host "✨ Hoàn tất đồng bộ ảnh! Khởi động lại Web Admin nếu cần."
