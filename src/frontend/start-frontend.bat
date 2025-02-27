@echo off
echo Language Tandem App - Frontend Server
echo ====================================

:: Check if Python is available
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    :: Check Python version
    python --version 2>&1 | findstr /C:"Python 3" >nul
    if %ERRORLEVEL% EQU 0 (
        echo Starting server with Python 3...
        python -m http.server 3000
    ) else (
        echo Starting server with Python (might be version 2)...
        python -m SimpleHTTPServer 3000
    )
) else (
    echo Error: Python is not installed or not in your PATH.
    echo Please install Python or use another HTTP server to serve the frontend files.
    echo.
    echo Alternative options:
    echo 1. Open index.html directly in your browser
    echo 2. Use Node.js http-server: npx http-server -p 3000
    pause
    exit /b 1
)

pause 