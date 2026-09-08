@echo off
chcp 65001 > nul
title Mock Bank Server + Ngrok
echo ========================================================
echo   DANG KHOI DONG MOCK BANK SERVER KEM NGROK TUNNEL...
echo ========================================================
cd /d "%~dp0server"
node mock-bank\start_with_ngrok.js
pause
