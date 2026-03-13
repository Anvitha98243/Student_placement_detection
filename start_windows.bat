@echo off
echo ========================================
echo   AI Student Placement Prediction System
echo ========================================
echo.

echo [1/4] Installing Python dependencies...
cd backend
pip install -r requirements.txt
echo.

echo [2/4] Training ML Model (86%+ accuracy)...
python train_model.py
echo.

echo [3/4] Starting Flask backend on port 5000...
start cmd /k python app.py
echo.

echo [4/4] Installing and starting React frontend...
cd ../frontend
call npm install
start cmd /k npm start

echo.
echo ✅ All services started!
echo    Backend:  http://localhost:5000
echo    Frontend: http://localhost:3000
echo.
pause
