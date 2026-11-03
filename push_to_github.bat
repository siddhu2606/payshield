@echo off
title Push PayShield to GitHub & Host
echo ========================================================
echo        PayShield - Push to GitHub & Enable Hosting
echo ========================================================
echo.

:: Check if git exists
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed or not in PATH.
    echo Please install Git from https://git-scm.com/
    pause
    exit /b
)

echo Initializing Git repository...
git init
git add .
git commit -m "feat: PayShield FIN-11 Coerced Payment Interruption System"
git branch -M main

echo.
echo --------------------------------------------------------
echo Choose how you would like to push to GitHub:
echo [1] Automatic via GitHub CLI (gh repo create)
echo [2] Push to an existing GitHub repo URL
echo --------------------------------------------------------
set /p choice="Enter choice (1 or 2): "

if "%choice%"=="1" (
    echo Creating public repository on GitHub and pushing...
    gh repo create payshield --public --source=. --remote=origin --push
    echo.
    echo Enabling GitHub Pages...
    echo Visit your repo settings -> Pages -> Deploy from branch 'main' / root
) else (
    set /p REPO_URL="Enter your GitHub Repository URL (e.g. https://github.com/username/payshield.git): "
    git remote remove origin 2>nul
    git remote add origin %REPO_URL%
    git push -u origin main --force
    echo.
    echo Pushed successfully!
    echo To host for free on GitHub Pages:
    echo 1. Open your repository on GitHub.
    echo 2. Click Settings -^> Pages.
    echo 3. Under Branch, select 'main' and '/ (root)', then click Save.
    echo 4. Your live hosted URL will be ready in 1 minute!
)

echo.
pause
