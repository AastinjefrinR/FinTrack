@echo off
title Push FinTrack to GitHub
echo ========================================================
echo   Pushing FinTrack to https://github.com/Jagan96404/FinTrack
echo ========================================================
echo.

cd /d "%~dp0"

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed or not in your system PATH.
    echo Please install Git from: https://git-scm.com/download/win
    echo After installing Git, run this script again!
    echo.
    pause
    exit /b
)

echo [1/5] Initializing Git repository...
if not exist .git (
    git init
)

echo [2/5] Staging all project files...
git add .

echo [3/5] Creating commit...
git commit -m "feat: complete FinTrack smart expense & budget manager with full rubric coverage"

echo [4/5] Setting main branch and remote origin...
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/Jagan96404/FinTrack.git

echo [5/5] Pushing to GitHub...
git push -u origin main

echo.
echo ========================================================
echo   Done! Check your repository:
echo   https://github.com/Jagan96404/FinTrack
echo ========================================================
pause
