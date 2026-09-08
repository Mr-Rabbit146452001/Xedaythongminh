@echo off
chcp 65001 > nul
title Smart Cart Web Admin (Port 3001)
echo ========================================================
echo   DANG KHOI DONG SMART CART RETAIL INTELLIGENCE ADMIN...
echo   Giao dien quan tri san sang tai: http://localhost:3001
echo ========================================================
cd /d "%~dp0web-admin"
npm run dev
pause
