@echo off
title PawCare Frontend Server
color 0E
cd /d "%~dp0pawcare-frontend"
echo Starting Vite React Frontend at http://localhost:5173 ...
npm run dev -- --host
pause

