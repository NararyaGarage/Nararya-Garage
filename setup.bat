@echo off
title Nararya Garage Bot Setup
echo ===============================
echo Nararya Garage Bot Setup
echo ===============================
echo.

:: Check if Node.js is installed
node --version > nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js tidak terdeteksi. Silakan install Node.js terlebih dahulu.
    echo Download Node.js di: https://nodejs.org/
    pause
    exit /b
)

echo [INFO] Node.js terdeteksi.
echo.

:: Check for .env file and create if not exist
if not exist .env (
    echo [INFO] File .env tidak ditemukan. Membuat file .env baru...
    echo DISCORD_TOKEN=ganti_dengan_token_discord_anda> .env
    echo HEALTH_TOKEN=token_rahasia_untuk_endpoint_health>> .env
    echo RESTART_TOKEN=token_rahasia_untuk_restart_bot>> .env
    echo SEND_WELCOME_ON_READY=false>> .env
    echo REPL_SLUG=nararya-garage-bot>> .env
    echo REPL_OWNER=username-anda>> .env
    
    echo [WARNING] File .env dibuat. Silakan edit file tersebut dan masukkan token Discord Anda.
) else (
    echo [INFO] File .env sudah ada.
)

:: Install dependencies
echo.
echo [INFO] Menginstall dependensi...
call npm install
echo.

:: Register slash commands
echo [INFO] Mendaftarkan slash commands...
node deploy-commands.js
echo.

:: Start UptimeRobot server
echo [INFO] Menyiapkan UptimeRobot server...
start "UptimeRobot Keep-Alive" cmd /c node keep-alive.js
echo.

echo ===============================
echo Pengaturan UptimeRobot
echo ===============================
echo.
echo 1. Buat akun di https://uptimerobot.com jika belum memilikinya
echo 2. Buat monitor HTTP(s) baru
echo 3. Masukkan URL: https://%REPL_SLUG%.%REPL_OWNER%.repl.co/keep-alive
echo 4. Atur interval ke 5 menit
echo 5. Simpan monitor
echo.
echo [INFO] Bot siap dijalankan. Gunakan perintah berikut untuk menjalankan bot:
echo       node index.js
echo.
echo [INFO] Atau jalankan bot sekarang:
echo.
echo 1 - Jalankan bot
echo 2 - Keluar
echo.

set /p choice="Pilihan: "
if "%choice%"=="1" (
    echo.
    echo [INFO] Menjalankan bot...
    node index.js
) else (
    echo.
    echo [INFO] Setup selesai. Sampai jumpa!
    timeout /t 3 > nul
)