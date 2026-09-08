@echo off
chcp 65001 > nul
title He Thong Xe Day & Mock Bank (Port 3000 + 4000 + Ngrok)
echo ========================================================
echo   DANG KHOI DONG SHOP SERVER, MOCK BANK VA NGROK...
echo ========================================================
cd /d "%~dp0server"
node start_all.js
pause
