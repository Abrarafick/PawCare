@echo off
title PawCare Application Launcher
color 0A

echo ========================================================
echo                 Starting PawCare System
echo       "Your Pet's Health, All in One Place."
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Starting Django Backend Server (Port 8000)...
start "PawCare Backend (Django)" cmd /k "cd /d "%~dp0pawcare-backend" && ..\venv\Scripts\python manage.py runserver 0.0.0.0:8000"

echo [2/3] Starting React Frontend Server (Port 5173)...
start "PawCare Frontend (Vite)" cmd /k "cd /d "%~dp0pawcare-frontend" && npm run dev -- --host"

echo [3/3] Opening browser at http://localhost:5173 ...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo ========================================================
echo   PawCare is now running!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8000/api/
echo.
echo   Demo Login:
echo     Email:    demo@pawcare.com
echo     Password: PawCare123!
echo ========================================================
pause

