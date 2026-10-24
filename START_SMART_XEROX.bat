@echo off
title Smart Xerox Express Server
cd /d "%~dp0"
echo ===================================================
echo   Smart Xerox - Epson L3250 Mobile Print Server
echo   Running at: http://localhost:8000
echo ===================================================
echo.
echo Press CTRL+C to stop the server anytime.
echo.
".\backend\venv\Scripts\python.exe" backend/run.py
pause
