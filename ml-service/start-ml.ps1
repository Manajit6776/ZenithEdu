# Start ML Service
Write-Host "Starting ML Service..." -ForegroundColor Green

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Start the ML service
$env:PYTHONIOENCODING = "utf-8"
python -m uvicorn realistic_ml_api:app --reload --host 0.0.0.0 --port 8000
