# Student Performance ML Service

This service provides advanced machine learning capabilities for student performance prediction, attendance anomaly detection, and comprehensive analytics for the EduNexus Campus Management System.

## Features

- **Performance Prediction**: Predict student academic performance based on multiple factors
- **Attendance Anomaly Detection**: Identify students with unusual attendance patterns
- **Risk Assessment**: Evaluate at-risk students who need intervention
- **Department Analytics**: Comprehensive statistics by department
- **Performance Trends**: Track performance over time
- **Top Performers**: Identify high-achieving students
- **Model Retraining**: Update ML models with current data

## Quick Start

### Fastest Way to Start (Windows)

1. **Open Command Prompt** in the ml-service directory
2. **Run the setup script**:
   ```bash
   setup-ml-service.ps1
   ```
3. **Start the service**:
   - Double-click `start.bat` OR
   - Run: `python -m uvicorn realistic_ml_api:app --reload`

### Manual Setup (All Platforms)

1. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

2. **Train the ML model** (first time only):

   ```bash
   python train_realistic_ml.py
   ```

3. **Start the service**:

   ```bash
   python -m uvicorn realistic_ml_api:app --reload --port 8000
   ```

4. **Verify it's running**:
   - Open browser to: http://localhost:8000
   - Check API docs: http://localhost:8000/docs

## Setup

### Prerequisites

- Python 3.8+
- pip (Python package manager)
- SQLite database (should be available at `../prisma/dev.db`)

### Installation

1. **Clone and navigate to the ml-service directory**

2. **Create and activate virtual environment** (recommended):

   ```bash
   python -m venv venv
   # On Windows
   .\venv\Scripts\activate
   # On Linux/Mac
   source venv/bin/activate
   ```

3. **Install dependencies**:

   ```bash
   pip install fastapi uvicorn pandas numpy scikit-learn sqlite3 joblib
   ```

   Or install from requirements.txt:

   ```bash
   pip install -r requirements.txt
   ```

4. **Train the ML model** (first time setup):

   ```bash
   python train_realistic_ml.py
   ```

5. **Run the service**:

   - **Quick start (Windows)**: Double-click `start.bat`
   - **Manual start**:
     ```bash
     python -m uvicorn realistic_ml_api:app --reload --port 8000
     ```
   - **PowerShell setup**: Run `setup-ml-service.ps1`

## API Endpoints

### Health & Status

- `GET /` - Basic health check
- `GET /health` - Detailed health status with model information

### Analytics & Insights

- `GET /analytics/overview` - Complete analytics overview for dashboard
- `GET /analytics/performance-trends` - Performance trends over time
- `GET /analytics/department-stats` - Statistics by department
- `GET /analytics/top-performers` - Top performing students
- `GET /analytics/at-risk-students` - At-risk students needing attention
- `GET /analytics/attendance-anomaly/{student_id}` - Attendance anomalies for specific student

### Student Performance

- `GET /api/student-performance-stats` - Overall student performance statistics
- `GET /api/student-risk/{student_id}` - Risk assessment for specific student
- `POST /api/retrain-model` - Retrain ML model with current data

## Model Details

### Features Used

- Attendance percentage
- CGPA/Grades
- Assignment scores
- Fee status
- Department
- Historical performance data

### Algorithms

- **Random Forest Classifier** for performance prediction
- **Isolation Forest** for anomaly detection
- **StandardScaler** for feature normalization

## Environment Variables

- `PORT`: Server port (default: 8000)
- `DB_PATH`: SQLite database path (default: `../prisma/dev.db`)

## File Structure

```
ml-service/
├── realistic_ml_api.py          # Main FastAPI application
├── train_realistic_ml.py        # Model training script
├── student_performance_model.joblib  # Trained ML model
├── scaler.joblib                # Feature scaler
├── ml_training_dataset.csv      # Training data
├── requirements.txt             # Python dependencies
├── start.bat                    # Windows startup script
├── setup-ml-service.ps1         # PowerShell setup script
└── test_*.py                    # Test files
```

## Development

### Running Tests

```bash
python test_ml_api.py
python test_enhanced_ml.py
python test_all_endpoints.py
```

### Model Retraining

The ML model can be retrained with updated data:

```bash
# Via API
curl -X POST http://localhost:8000/api/retrain-model

# Or manually
python train_realistic_ml.py
```

### API Documentation

Access interactive API documentation at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## CORS Configuration

The service is configured to accept requests from:

- http://localhost:5173 (Vite dev server)
- http://localhost:3000 (React dev server)
- http://127.0.0.1:3000

## Troubleshooting

### Common Issues

1. **Model files not found**: Run `python train_realistic_ml.py` first
2. **Database connection error**: Ensure `../prisma/dev.db` exists
3. **Port already in use**: Change port with `--port <number>` flag
4. **Import errors**: Activate virtual environment and install dependencies

### Logs

The service provides detailed console logs for:

- Model loading status
- API request handling
- Error tracking
- Performance metrics

## Performance Considerations

- Model files are loaded once at startup for efficiency
- Database queries are optimized with proper indexing
- Caching is implemented for frequently accessed analytics
- Automatic server reload in development mode
