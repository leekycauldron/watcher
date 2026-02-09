@echo off
setlocal
cd /D "%~dp0"

echo ============================================
echo   Watcher — Setup
echo ============================================
echo.

:: ── Python venv ─────────────────────────────
echo [1/4] Creating Python virtual environment...
if not exist ".venv" (
    python -m venv .venv
    if errorlevel 1 (
        echo ERROR: Python not found. Install Python 3.12+ and ensure it's on PATH.
        pause
        exit /b 1
    )
)
echo       .venv OK

:: ── Python deps ─────────────────────────────
echo [2/4] Installing Python dependencies...
call .venv\Scripts\activate.bat
pip install -r backend\requirements.txt --quiet
if errorlevel 1 (
    echo ERROR: pip install failed.
    pause
    exit /b 1
)
echo       pip OK

:: ── Node deps ───────────────────────────────
echo [3/4] Installing frontend dependencies...
cd frontend
call npm install --silent
if errorlevel 1 (
    echo ERROR: npm install failed. Install Node.js 20+ and ensure npm is on PATH.
    pause
    exit /b 1
)
echo       npm OK

:: ── Frontend build ──────────────────────────
echo [4/4] Building frontend...
call npm run build
if errorlevel 1 (
    echo ERROR: Frontend build failed.
    pause
    exit /b 1
)
cd ..
echo       build OK

echo.
echo ============================================
echo   Setup complete!
echo.
echo   Next steps:
echo     1. Download mediamtx from:
echo        https://github.com/bluenviron/mediamtx/releases
echo        Place mediamtx.exe in the mediamtx\ folder.
echo.
echo     2. Edit mediamtx\mediamtx.yml if your Pi
echo        IP differs from 192.168.2.150.
echo.
echo     3. Run start.bat to launch Watcher.
echo ============================================
pause
