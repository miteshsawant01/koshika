@echo off
cd /d "%~dp0"
echo ===================================================
echo Starting STEMBRIDGE AI (Stem Cell DBMS)
echo Backend: Python Django + REST API (Port 8000)
echo Frontend: React.js + Vite (Port 5173)
echo Database: Supabase PostgreSQL (Cloud) / SQLite (Fallback)
echo ===================================================

start "STEMBRIDGE Backend (Django)" cmd /k "cd backend && python manage.py runserver 127.0.0.1:8000"
start "STEMBRIDGE Frontend (React)" cmd /k "cd frontend && npm run dev -- --host 127.0.0.1 --port 5173"

echo.
echo Applications are launching!
echo Open your browser at:
echo   Frontend UI: http://127.0.0.1:5173
echo   Backend API: http://127.0.0.1:8000/api/
echo ===================================================
