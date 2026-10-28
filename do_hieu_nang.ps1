# Script tự động đo lường hiệu năng UI Render Time và FPS trên Tablet qua ADB
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host " 🚀 CÔNG CỤ TỰ ĐỘNG ĐO HIỆU NĂNG UI & FRAME TIME (STROLLER APP)" -ForegroundColor Yellow
Write-Host "========================================================================" -ForegroundColor Cyan

# 1. Tìm đường dẫn adb.exe
$adbPath = "adb"
$sdkAdb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"

if (Get-Command "adb" -ErrorAction SilentlyContinue) {
    $adbPath = "adb"
} elseif (Test-Path $sdkAdb) {
    $adbPath = $sdkAdb
} else {
    Write-Host "[!] Không tìm thấy lệnh adb trong biến môi trường." -ForegroundColor Red
    Write-Host "    Đang tìm kiếm trong Android SDK..." -ForegroundColor Yellow
    $found = Get-ChildItem -Path "$env:LOCALAPPDATA\Android" -Filter "adb.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) {
        $adbPath = $found.FullName
        Write-Host "    -> Tìm thấy adb tại: $adbPath" -ForegroundColor Green
    } else {
        Write-Host "[X] KHÔNG TÌM THẤY ADB! Vui lòng mở Terminal bên trong Android Studio để chạy script này." -ForegroundColor Red
        Pause
        Exit
    }
}

# 2. Kiểm tra thiết bị kết nối
Write-Host "`n[1/4] Đang kiểm tra thiết bị Android cắm qua cáp USB..." -ForegroundColor Cyan
$devices = & $adbPath devices
$deviceList = $devices | Where-Object { $_ -match "\bdevice\b" -and $_ -notmatch "List of devices" }

if (-not $deviceList) {
    Write-Host "[X] Chưa phát hiện thiết bị nào kết nối!" -ForegroundColor Red
    Write-Host "    Vui lòng kiểm tra:" -ForegroundColor Yellow
    Write-Host "    1. Dây cáp USB đã cắm chắc chắn chưa?"
    Write-Host "    2. Đã bật 'Gỡ lỗi USB' (USB Debugging) trên Tablet chưa?"
    Write-Host "    3. Chuyển chế độ kết nối USB trên Tablet sang 'Truyền tệp' (File Transfer)."
    Write-Host "`nChi tiết adb devices:"
    $devices | ForEach-Object { Write-Host "   $_" }
    Pause
    Exit
} else {
    Write-Host " -> Đã kết nối thành công thiết bị: $($deviceList -join ', ')" -ForegroundColor Green
}

# 3. Đặt lại bộ đếm hiệu năng
$pkg = "com.example.xedaythongminh"
Write-Host "`n[2/4] Đang đặt lại bộ đếm render trên ứng dụng ($pkg)..." -ForegroundColor Cyan
& $adbPath shell dumpsys gfxinfo $pkg reset | Out-Null
Write-Host " -> Đã reset bộ đếm khung hình." -ForegroundColor Green

# 4. Đếm ngược để người dùng thao tác
Write-Host "`n[3/4] BẮT ĐẦU ĐO TRONG 20 GIÂY!" -ForegroundColor Yellow
Write-Host " 👉 Hãy cầm Tablet lên: THỰC HIỆN CUỘN GIỎ HÀNG, BẤM NÚT CỘNG/TRỪ VÀ THÊM MÓN..." -ForegroundColor Magenta

for ($i = 20; $i -gt 0; $i--) {
    Write-Host -NoNewline "`r ⏱️  Thời gian còn lại: $i giây... "
    Start-Sleep -Seconds 1
}
Write-Host "`n -> Hết thời gian đo! Đang trích xuất dữ liệu..." -ForegroundColor Green

# 5. Lấy dữ liệu và phân tích
Write-Host "`n[4/4] Đang trích xuất số liệu từ gfxinfo..." -ForegroundColor Cyan
$rawStats = & $adbPath shell dumpsys gfxinfo $pkg

# Lưu file kết quả thô
$outputFile = "KetQua_Do_HieuNang_Tablet.txt"
$rawStats | Out-File -FilePath $outputFile -Encoding utf8

# Phân tích các thông số quan trọng
Write-Host "`n========================================================================" -ForegroundColor Green
Write-Host " 📊 BẢNG KẾT QUẢ ĐO HIỆU NĂNG GIAO DIỆN TABLET (MỤC 4.5.2)" -ForegroundColor Yellow
Write-Host "========================================================================" -ForegroundColor Green

$totalFrames = ($rawStats | Select-String "Total frames rendered:\s+(\d+)").Matches.Groups[1].Value
$jankyFrames = ($rawStats | Select-String "Janky frames:\s+(\d+)\s+\(([\d\.]+)%\)").Matches
$p50 = ($rawStats | Select-String "50th percentile:\s+(\d+)ms").Matches.Groups[1].Value
$p90 = ($rawStats | Select-String "90th percentile:\s+(\d+)ms").Matches.Groups[1].Value
$p95 = ($rawStats | Select-String "95th percentile:\s+(\d+)ms").Matches.Groups[1].Value
$p99 = ($rawStats | Select-String "99th percentile:\s+(\d+)ms").Matches.Groups[1].Value

if ($totalFrames) {
    $jankCount = $jankyFrames.Groups[1].Value
    $jankPercent = $jankyFrames.Groups[2].Value

    Write-Host " • Tổng số khung hình đã vẽ (Total frames):     $totalFrames frames" -ForegroundColor White
    Write-Host " • Số khung hình bị trễ (Janky frames):         $jankCount frames ($jankPercent%)" -ForegroundColor White
    Write-Host " • Thời gian render trung vị (50th percentile): $p50 ms" -ForegroundColor Cyan
    Write-Host " • Thời gian render mức 90% (90th percentile):  $p90 ms" -ForegroundColor Cyan
    Write-Host " • Thời gian render mức 95% (95th percentile):  $p95 ms" -ForegroundColor Cyan
    Write-Host " • Thời gian render mức 99% (99th percentile):  $p99 ms" -ForegroundColor Cyan
    
    Write-Host "`n 🎯 ĐÁNH GIÁ:" -ForegroundColor Yellow
    if ([double]$jankPercent -lt 5.0) {
        Write-Host " -> Giao diện đạt chuẩn MƯỢT MÀ XUẤT SẮC (Tỷ lệ giật lag $jankPercent% < 5% chuẩn Google)." -ForegroundColor Green
    } else {
        Write-Host " -> Tỷ lệ giật lag: $jankPercent%" -ForegroundColor Yellow
    }
} else {
    Write-Host "[!] Không phân tích được tự động hoặc app chưa bật trên Tablet." -ForegroundColor Yellow
    Write-Host "Dữ liệu chi tiết đã được lưu tại file: $outputFile" -ForegroundColor Cyan
}

Write-Host "`nĐã lưu toàn bộ báo cáo chi tiết vào file: $outputFile" -ForegroundColor Cyan

# Mở tự động biểu đồ trực quan trên trình duyệt
$htmlReport = Join-Path $PSScriptRoot "BieuDo_HieuNang_Tablet.html"
if (Test-Path $htmlReport) {
    Write-Host " 🌐 Đang tự động mở biểu đồ trực quan trong trình duyệt web..." -ForegroundColor Yellow
    Start-Process $htmlReport
}

Write-Host "========================================================================" -ForegroundColor Green
Pause
