@echo off
setlocal
echo ==========================================
echo    Noodles King - Local Server Manager
echo ==========================================
echo.

:: Check Node.js
where node >nul 2>&1
if %errorlevel% == 0 (
    echo [✓] Node.js detected.
    echo [i] Starting full Express server (server.js)...
    echo [!] Pointing to http://localhost:3000
    timeout /t 2 >nul
    start "" "http://localhost:3000"
    npm install && npm start
) else (
    echo [!] Node.js NOT found in your terminal.
    
    :: Check Python
    where python >nul 2>&1
    if %errorlevel% == 0 (
        echo [✓] Python detected. Using as fallback (Static Mode).
        echo [!] Note: Custom routes like /login/dashboard may require .html extension.
        echo [!] Pointing to http://localhost:3000
        timeout /t 2 >nul
        start "" "http://localhost:3000"
        python -m http.server 3000
    ) else (
        echo [X] ERROR: Neither Node.js nor Python were found.
        echo Please install Node.js (https://nodejs.org) or Python (https://python.org) to run locally.
        echo.
        echo [TIP] You can always access your live site at:
        echo https://noodles-king.onrender.com
        pause
    )
)

endlocal
