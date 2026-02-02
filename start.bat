@echo off
REM ABOM Risk Scoring Engine - Startup Script for Windows
REM This script starts both the backend and frontend servers

echo Starting ABOM Risk Scoring Engine...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed
    exit /b 1
)

REM Start backend
echo Starting backend server on http://localhost:8000
cd backend
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate.bat
pip install -r requirements.txt -q
start "Backend Server" cmd /k "uvicorn main:app --reload --port 8000"
cd ..

REM Wait a moment for backend to start
timeout /t 2 /nobreak >nul

REM Start frontend
echo Starting frontend server on http://localhost:3000
cd frontend
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)
start "Frontend Server" cmd /k "npm run dev"
cd ..

echo.
echo Backend running on http://localhost:8000
echo Frontend running on http://localhost:3000
echo.
echo Close the command windows to stop the servers
pause

