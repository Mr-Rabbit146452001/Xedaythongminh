@echo off
chcp 65001 > nul
title Mo Web Admin Ra Internet (Ngrok Port 3001)
echo ========================================================
echo   DANG KHOI TAO DUONG LINK PUBLIC INTERNET CHO WEB ADMIN
echo ========================================================
echo   Luu y: Web Admin (Port 3001) phai dang duoc chay truoc.
echo   Sau khi ngrok ket noi thanh cong, hay copy duong link
echo   co dang: https://xxxx.ngrok-free.app
echo   va gui link: https://xxxx.ngrok-free.app/smart-cart
echo   cho ban cua ban!
echo ========================================================
echo.
ngrok http 3001
pause
