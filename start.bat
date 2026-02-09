@echo off
setlocal
cd /D "%~dp0"

echo ============================================
echo   Watcher — Starting services
echo ============================================

:: Check setup has been run
if not exist ".venv" (
    echo ERROR: Run setup.bat first.
    pause
    exit /b 1
)

:: Activate venv
call .venv\Scripts\activate.bat

:: Launch mediamtx in the background
echo [1/2] Starting mediamtx...
if exist "mediamtx\mediamtx.exe" (
    start "" /D "%~dp0mediamtx" mediamtx.exe
    timeout /t 2 /nobreak >nul
) else (
    echo       WARNING: mediamtx.exe not found — skipping.
    echo       Stream proxy will not be available.
)

:: Launch FastAPI backend
echo [2/2] Starting backend on 0.0.0.0:8000...
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
