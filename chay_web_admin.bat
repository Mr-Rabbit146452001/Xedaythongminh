@echo off
chcp 65001 > nul
title Smart Cart Web Admin (Port 3001)
echo ========================================================
echo   DANG KHOI DONG SMART CART RETAIL INTELLIGENCE ADMIN...
echo   Giao dien quan tri san sang tai: http://localhost:3001
echo ========================================================
cd /d "%~dp0web-admin"

echo [Thong tin] Kiem tra Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [LOI] Khong tim thay Node.js trong he thong!
    echo Vui long cai dat Node.js tai https://nodejs.org
    pause
    exit /b 1
)

echo [Thong tin] Dang khoi chay Next.js Dev Server tren cong 3001...
call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo ========================================================
    echo   [CANH BAO] Server da dung lai (Ma loi: %errorlevel%)
    echo   Luu y: Neu ban da chay file start_all.js thi Web Admin
    echo   DA DUOC BAT SAN ROI tai http://localhost:3001
    echo ========================================================
)
pause

