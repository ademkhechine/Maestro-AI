@echo off
echo ===================================================
echo Starting Maestro AI Platform (Local Development)
echo ===================================================

:: 1. Start Database & Cache (Postgres & Redis)
echo [1/3] Spinning up PostgreSQL and Redis Docker containers...
docker compose up -d postgres redis

:: 2. Start FastAPI Backend in a new window
echo [2/3] Starting FastAPI Backend...
start "Maestro AI - Backend" cmd /k "cd backend && .\venv\Scripts\activate && uvicorn main:app --reload"

:: 3. Start Vite React Frontend in a new window
echo [3/3] Starting React Frontend...
start "Maestro AI - Frontend" cmd /k "cd frontend && npm run dev"

echo ===================================================
echo Services have been launched in separate windows!
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo ===================================================
pause
