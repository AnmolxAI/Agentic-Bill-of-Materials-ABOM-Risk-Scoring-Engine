#!/bin/bash

# ABOM Risk Scoring Engine - Startup Script
# This script starts both the backend and frontend servers

echo "Starting ABOM Risk Scoring Engine..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    exit 1
fi

# Start backend in background
echo "Starting backend server on http://localhost:8000"
cd backend
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt -q
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend
echo "Starting frontend server on http://localhost:3000"
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✓ Backend running on http://localhost:8000 (PID: $BACKEND_PID)"
echo "✓ Frontend running on http://localhost:3000 (PID: $FRONTEND_PID)"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait

