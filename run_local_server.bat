@echo off
title PayShield Local Server & Phone Link
echo ========================================================
echo        PayShield - FIN-11 Coerced Payment Interruption
echo ========================================================
echo.
echo Starting local web server on port 3000...
echo.

:: Get local IP address
for /f "tokens=4" %%a in ('route print ^| find " 0.0.0.0"') do (
    set LOCAL_IP=%%a
    goto :found_ip
)
:found_ip

echo --------------------------------------------------------
echo [1] Desktop Arena & Console:
echo     http://localhost:3000
echo.
echo [2] Real Phone Mobile Link (Open in Safari/Chrome on phone):
echo     http://%LOCAL_IP%:3000/mobile.html
echo --------------------------------------------------------
echo.
echo Press Ctrl+C in this window to stop the server.
echo.

where node >nul 2>nul
if %errorlevel% equ 0 (
    node server.js
) else (
    python -m http.server 3000
)
pause
