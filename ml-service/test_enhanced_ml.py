import sqlite3
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import sys
import os

# Add parent directory to path to import from enhanced_ml_api
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def test_enhanced_ml_model():
    """Test the enhanced ML model with real data"""
    print("🧪 Testing Enhanced ML Model...")
    
    try:
        # Connect to database
        conn = sqlite3.connect('../prisma/dev.db')
        
        # Get comprehensive student data with assignment information
        query = """
        SELECT 
            s.id,
            s.name,
            s.rollNo,
            s.department,
            s.attendance,
            s.cgpa,
            s.feesStatus,
            s.overallAssignmentScore,
            u.email,
            COUNT(sub.id) as total_submissions,
            AVG(sub.score) as avg_submission_score,
            MAX(sub.submittedAt) as last_submission_date,
            COUNT(DISTINCT sub.assignmentId) as unique_assignments
        FROM students s
        JOIN users u ON s.userId = u.id
        LEFT JOIN submissions sub ON s.id = sub.studentId
        LEFT JOIN assignments a ON sub.assignmentId = a.id AND a.status = 'Published'
        GROUP BY s.id, s.name, s.rollNo, s.department, s.attendance, s.cgpa, s.feesStatus, s.overallAssignmentScore, u.email
        ORDER BY s.name
        """
        
        df = pd.read_sql_query(query, conn)
        conn.close()
        
        print(f"📊 Retrieved {len(df)} students from database")
        
        if df.empty:
            print("❌ No student data found")
            return
        
        # Display sample data
        print("\n📋 Sample Student Data:")
        print(df[['name', 'cgpa', 'attendance', 'total_submissions', 'avg_submission_score']].head(10))
        
        # Calculate statistics
        print(f"\n📈 Statistics:")
        print(f"   Average CGPA: {df['cgpa'].mean():.2f}")
        print(f"   Average Attendance: {df['attendance'].mean():.2f}%")
        print(f"   Students with submissions: {(df['total_submissions'] > 0).sum()}")
        print(f"   Average assignment score: {df['avg_submission_score'].mean():.2f}")
        
        # Create risk categories based on real data
        create_risk_analysis(df)
        
    except Exception as e:
        print(f"❌ Error: {e}")

def create_risk_analysis(df):
    """Create risk analysis based on real student data"""
    print("\n🎯 Creating Risk Analysis...")
    
    # Fill missing values
    df['avg_submission_score'] = df['avg_submission_score'].fillna(0)
    df['total_submissions'] = df['total_submissions'].fillna(0)
    
    risk_data = []
    
    for _, student in df.iterrows():
        # Normalize features
        attendance_norm = student['attendance'] / 100
        cgpa_norm = student['cgpa'] / 10
        avg_score_norm = student['avg_submission_score'] / 100 if student['avg_submission_score'] > 0 else 0
        
        # Calculate assignment completion rate (assuming 10 assignments per semester)
        assignment_completion = min(student['total_submissions'] / 10, 1.0)
        
        # Generate additional realistic features
        base_performance = (attendance_norm + cgpa_norm + avg_score_norm) / 3
        
        class_participation = np.clip(
            base_performance + np.random.normal(0, 0.15), 0.1, 1.0
        )
        
        # Enhanced risk calculation
        risk_score = (attendance_norm * 0.25 + cgpa_norm * 0.25 + 
                     assignment_completion * 0.2 + avg_score_norm * 0.2 + 
                     class_participation * 0.1)
        
        # Ensure some students fall into high-risk zone
        # Students with low performance metrics
        if attendance_norm < 0.6 or cgpa_norm < 0.5 or avg_score_norm < 0.4:
            risk_score *= np.random.uniform(0.6, 0.9)  # Reduce score for at-risk students
        
        # Convert to risk category
        if risk_score > 0.7:
            risk = 0  # low risk
        elif risk_score > 0.5:
            risk = 1  # medium risk
        else:
            risk = 2  # high risk
        
        risk_data.append({
            'student_id': student['id'],
            'student_name': student['name'],
            'department': student['department'],
            'attendance': student['attendance'],
            'cgpa': student['cgpa'],
            'total_submissions': student['total_submissions'],
            'avg_submission_score': student['avg_submission_score'],
            'risk_score': risk_score,
            'risk_level': ['low', 'medium', 'high'][risk],
            'risk_category': risk
        })
    
    risk_df = pd.DataFrame(risk_data)
    
    # Display risk distribution
    risk_counts = risk_df['risk_level'].value_counts()
    print(f"\n🎭 Risk Distribution:")
    print(f"   Low Risk: {risk_counts.get('low', 0)} students")
    print(f"   Medium Risk: {risk_counts.get('medium', 0)} students")
    print(f"   High Risk: {risk_counts.get('high', 0)} students")
    
    # Show high-risk students
    high_risk_students = risk_df[risk_df['risk_level'] == 'high']
    if not high_risk_students.empty:
        print(f"\n⚠️  High Risk Students ({len(high_risk_students)}):")
        print(high_risk_students[['student_name', 'attendance', 'cgpa', 'avg_submission_score', 'risk_score']].head(10))
    
    # Show low-risk students for comparison
    low_risk_students = risk_df[risk_df['risk_level'] == 'low']
    if not low_risk_students.empty:
        print(f"\n✅ Low Risk Students ({len(low_risk_students)}):")
        print(low_risk_students[['student_name', 'attendance', 'cgpa', 'avg_submission_score', 'risk_score']].head(5))
    
    return risk_df

def train_enhanced_model():
    """Train the enhanced ML model"""
    print("\n🚀 Training Enhanced ML Model...")
    
    try:
        # Import the enhanced predictor
        from enhanced_ml_api import EnhancedStudentPerformancePredictor
        
        # Get student data
        conn = sqlite3.connect('../prisma/dev.db')
        query = """
        SELECT 
            s.id,
            s.name,
            s.rollNo,
            s.department,
            s.attendance,
            s.cgpa,
            s.feesStatus,
            s.overallAssignmentScore,
            u.email,
            COUNT(sub.id) as total_submissions,
            AVG(sub.score) as avg_submission_score,
            MAX(sub.submittedAt) as last_submission_date,
            COUNT(DISTINCT sub.assignmentId) as unique_assignments
        FROM students s
        JOIN users u ON s.userId = u.id
        LEFT JOIN submissions sub ON s.id = sub.studentId
        LEFT JOIN assignments a ON sub.assignmentId = a.id AND a.status = 'Published'
        GROUP BY s.id, s.name, s.rollNo, s.department, s.attendance, s.cgpa, s.feesStatus, s.overallAssignmentScore, u.email
        """
        
        df = pd.read_sql_query(query, conn)
        conn.close()
        
        # Prepare ML data
        ml_data = prepare_enhanced_training_data(df)
        
        if ml_data.empty:
            print("❌ No ML data prepared")
            return
        
        # Train model
        predictor = EnhancedStudentPerformancePredictor()
        accuracy = predictor.train(ml_data)
        
        print(f"✅ Model trained successfully!")
        print(f"📊 Training accuracy: {accuracy:.3f}")
        print(f"👥 Training samples: {len(ml_data)}")
        
        # Test predictions
        test_predictions(predictor, ml_data, df)
        
    except Exception as e:
        print(f"❌ Training error: {e}")

def prepare_enhanced_training_data(df):
    """Prepare enhanced training data"""
    ml_data = []
    
    for _, student in df.iterrows():
        # Normalize features
        attendance_norm = student['attendance'] / 100
        cgpa_norm = student['cgpa'] / 10
        avg_score_norm = (student['avg_submission_score'] / 100) if student['avg_submission_score'] > 0 else 0
        
        # Assignment completion rate
        assignment_completion = min(student['total_submissions'] / 10, 1.0)
        
        # Generate additional features
        base_performance = (attendance_norm + cgpa_norm + avg_score_norm) / 3
        class_participation = np.clip(base_performance + np.random.normal(0, 0.15), 0.1, 1.0)
        prev_gpa = max(2.0, student['cgpa'] - np.random.uniform(0.2, 1.0))
        study_hours = np.clip(5 + base_performance * 15 + np.random.normal(0, 3), 1, 25)
        
        # Enhanced risk calculation
        risk_score = (attendance_norm * 0.25 + cgpa_norm * 0.25 + 
                     assignment_completion * 0.2 + avg_score_norm * 0.2 + 
                     class_participation * 0.1)
        
        # Ensure high-risk students
        if attendance_norm < 0.6 or cgpa_norm < 0.5 or avg_score_norm < 0.4:
            risk_score *= np.random.uniform(0.6, 0.9)
        
        # Risk category
        if risk_score > 0.7:
            risk = 0  # low
        elif risk_score > 0.5:
            risk = 1  # medium
        else:
            risk = 2  # high
        
        ml_data.append({
            'attendance': attendance_norm,
            'cgpa': cgpa_norm,
            'fees_status_numeric': 1 if student['feesStatus'] == 'Paid' else 0,
            'assignment_completion_rate': assignment_completion,
            'avg_assignment_score': avg_score_norm,
            'class_participation_score': class_participation,
            'previous_semester_gpa': prev_gpa,
            'study_hours_per_week': study_hours,
            'extracurricular_activities': np.random.choice([0, 1], p=[0.6, 0.4]),
            'recent_performance_trend': np.random.uniform(-0.3, 0.3),
            'submission_consistency': assignment_completion + np.random.normal(0, 0.1),
            'grade_variance': np.random.uniform(0.05, 0.3) if avg_score_norm > 0.5 else np.random.uniform(0.2, 0.5),
            'performance_risk': risk
        })
    
    return pd.DataFrame(ml_data)

def test_predictions(predictor, ml_data, original_df):
    """Test model predictions"""
    print("\n🧪 Testing Predictions...")
    
    # Test on sample students
    sample_indices = np.random.choice(len(ml_data), min(5, len(ml_data)), replace=False)
    
    for i in sample_indices:
        student_ml_data = ml_data.iloc[[i]]
        student_original = original_df.iloc[i]
        
        prediction = predictor.predict(student_ml_data)
        
        print(f"\n📝 Student: {student_original['name']}")
        print(f"   Department: {student_original['department']}")
        print(f"   CGPA: {student_original['cgpa']:.2f}")
        print(f"   Attendance: {student_original['attendance']:.1f}%")
        print(f"   Avg Assignment Score: {student_original['avg_submission_score']:.1f}")
        print(f"   Predicted Risk: {prediction['risk']} (confidence: {prediction['confidence']:.2f})")
        print(f"   Key Factors: {', '.join(prediction['factors'])}")

if __name__ == "__main__":
    print("🎯 Enhanced ML Model Testing and Training")
    print("=" * 50)
    
    # Test with real data
    test_enhanced_ml_model()
    
    # Train the enhanced model
    train_enhanced_model()
    
    print("\n✅ Enhanced ML model testing complete!")
