@echo off
rem Ensure the script runs from its own directory
cd /d "%~dp0"
echo Starting ML Service...
python -m uvicorn realistic_ml_api:app --reload --host 0.0.0.0 --port 8000
pause
