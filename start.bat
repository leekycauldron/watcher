@echo off
echo ============================================
echo   Watcher — Starting services
echo ============================================

:: Launch mediamtx in the background
echo [1/2] Starting mediamtx...
start "" /D "%~dp0mediamtx" mediamtx.exe
timeout /t 2 /nobreak >nul

:: Launch FastAPI backend
echo [2/2] Starting backend on 0.0.0.0:8000...
cd /D "%~dp0"
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
