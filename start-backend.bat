@echo off
title PawCare Backend Server
color 0B
cd /d "%~dp0pawcare-backend"
echo Starting Django REST Framework API at http://localhost:8000/api/ ...
..\venv\Scripts\python manage.py runserver 0.0.0.0:8000
pause

