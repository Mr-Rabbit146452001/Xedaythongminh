@echo off
chcp 65001 >nul
title DO HIEU NANG APP TABLET (UI RENDER TIME & FPS)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0do_hieu_nang.ps1"
pause
