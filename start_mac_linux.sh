#!/bin/bash
echo "========================================"
echo "  AI Student Placement Prediction System"
echo "========================================"
echo ""

echo "[1/4] Installing Python dependencies..."
cd backend
pip install -r requirements.txt
echo ""

echo "[2/4] Training ML Model (86%+ accuracy)..."
python3 train_model.py
echo ""

echo "[3/4] Starting Flask backend on port 5000..."
python3 app.py &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
echo ""

echo "[4/4] Installing and starting React frontend..."
cd ../frontend
npm install
npm start &

echo ""
echo "✅ All services started!"
echo "   Backend:  http://localhost:5000"
echo "   Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"
wait
