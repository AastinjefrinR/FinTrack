@echo off
title FinTrack Launcher
echo ========================================================
echo   Starting FinTrack - Smart Expense & Budget Manager
echo ========================================================
echo.

echo Starting FinTrack Backend Server (Port 5000)...
start "FinTrack Backend Server" cmd /k "cd /d "%~dp0server" && npm.cmd run dev"

timeout /t 3 /nobreak >nul

echo Starting FinTrack Frontend Client (Port 5173)...
start "FinTrack Frontend Client" cmd /k "cd /d "%~dp0client" && npm.cmd run dev"

echo.
echo ========================================================
echo   Both Servers are starting!
echo   Open your browser at: http://localhost:5173
echo ========================================================
echo.
pause
