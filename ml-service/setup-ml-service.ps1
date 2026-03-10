# Setup ML Service Environment
Write-Host "Setting up ML Service..." -ForegroundColor Green

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Found $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "Python is not installed or not in PATH. Please install Python 3.8 or later." -ForegroundColor Red
    exit 1
}

# Create virtual environment
Write-Host "Creating virtual environment..." -ForegroundColor Cyan
python -m venv venv

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
.\venv\Scripts\Activate.ps1

# Upgrade pip
Write-Host "Upgrading pip..." -ForegroundColor Cyan
python -m pip install --upgrade pip

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Cyan
pip install -r requirements.txt

Write-Host "`nSetup completed successfully!" -ForegroundColor Green
Write-Host "To start the ML service, run: .\start.bat" -ForegroundColor Yellow
Write-Host "The API will be available at: http://localhost:8000" -ForegroundColor Yellow
Write-Host "API documentation: http://localhost:8000/docs" -ForegroundColor Yellow
