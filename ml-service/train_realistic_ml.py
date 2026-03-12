import sqlite3
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import sys
import os
import joblib

# Add parent directory to path to import from enhanced_ml_api
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def create_realistic_risk_distribution():
    """Create realistic risk distribution with proper high-risk students"""
    print("🎯 Creating Realistic Risk Distribution...")
    
    try:
        # Connect to database
        conn = sqlite3.connect('../prisma/dev.db')
        
        # Get student data
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
        
        # Fill missing values
        df['avg_submission_score'] = df['avg_submission_score'].fillna(0)
        df['total_submissions'] = df['total_submissions'].fillna(0)
        
        # Create realistic risk distribution
        risk_data = []
        
        # Sort students by performance metrics to identify at-risk students
        df['performance_score'] = (df['attendance'] / 100) * 0.3 + (df['cgpa'] / 10) * 0.4 + (df['avg_submission_score'] / 100) * 0.3
        df_sorted = df.sort_values('performance_score')
        
        # Assign risk categories based on performance
        total_students = len(df_sorted)
        high_risk_count = int(total_students * 0.15)  # 15% high risk
        medium_risk_count = int(total_students * 0.25)  # 25% medium risk
        low_risk_count = total_students - high_risk_count - medium_risk_count  # 60% low risk
        
        for i, (_, student) in enumerate(df_sorted.iterrows()):
            # Determine risk category
            if i < high_risk_count:
                risk_category = 2  # high risk
                risk_level = 'high'
            elif i < high_risk_count + medium_risk_count:
                risk_category = 1  # medium risk
                risk_level = 'medium'
            else:
                risk_category = 0  # low risk
                risk_level = 'low'
            
            # Normalize features
            attendance_norm = student['attendance'] / 100
            cgpa_norm = student['cgpa'] / 10
            avg_score_norm = student['avg_submission_score'] / 100 if student['avg_submission_score'] > 0 else 0
            
            # Calculate assignment completion rate
            assignment_completion = min(student['total_submissions'] / 10, 1.0)
            
            # Generate additional realistic features based on risk level
            if risk_level == 'high':
                # High-risk students have poor performance indicators
                class_participation = np.random.uniform(0.1, 0.4)
                study_hours = np.random.uniform(1, 8)
                recent_trend = np.random.uniform(-0.3, -0.1)
                submission_consistency = np.random.uniform(0.2, 0.5)
                grade_variance = np.random.uniform(0.3, 0.6)
            elif risk_level == 'medium':
                # Medium-risk students have moderate performance
                class_participation = np.random.uniform(0.3, 0.6)
                study_hours = np.random.uniform(5, 15)
                recent_trend = np.random.uniform(-0.2, 0.2)
                submission_consistency = np.random.uniform(0.4, 0.7)
                grade_variance = np.random.uniform(0.2, 0.4)
            else:
                # Low-risk students have good performance
                class_participation = np.random.uniform(0.6, 0.9)
                study_hours = np.random.uniform(10, 20)
                recent_trend = np.random.uniform(-0.1, 0.3)
                submission_consistency = np.random.uniform(0.6, 0.9)
                grade_variance = np.random.uniform(0.1, 0.3)
            
            # Previous semester GPA (slightly lower than current for struggling students)
            if risk_level == 'high':
                prev_gpa = max(2.0, student['cgpa'] - np.random.uniform(1.0, 2.0))
            elif risk_level == 'medium':
                prev_gpa = max(3.0, student['cgpa'] - np.random.uniform(0.5, 1.0))
            else:
                prev_gpa = max(4.0, student['cgpa'] - np.random.uniform(0.2, 0.8))
            
            # Calculate risk score
            risk_score = (attendance_norm * 0.25 + cgpa_norm * 0.25 + 
                         assignment_completion * 0.2 + avg_score_norm * 0.2 + 
                         class_participation * 0.1)
            
            # Adjust risk score based on assigned category
            if risk_level == 'high':
                risk_score *= np.random.uniform(0.4, 0.7)
            elif risk_level == 'medium':
                risk_score *= np.random.uniform(0.6, 0.85)
            else:
                risk_score *= np.random.uniform(0.8, 1.0)
            
            risk_data.append({
                'student_id': student['id'],
                'student_name': student['name'],
                'department': student['department'],
                'attendance': student['attendance'],
                'cgpa': student['cgpa'],
                'total_submissions': student['total_submissions'],
                'avg_submission_score': student['avg_submission_score'],
                'performance_score': student['performance_score'],
                'risk_score': risk_score,
                'risk_level': risk_level,
                'risk_category': risk_category,
                'attendance_norm': attendance_norm,
                'cgpa_norm': cgpa_norm,
                'avg_score_norm': avg_score_norm,
                'assignment_completion': assignment_completion,
                'class_participation': class_participation,
                'study_hours': study_hours,
                'recent_trend': recent_trend,
                'submission_consistency': submission_consistency,
                'grade_variance': grade_variance,
                'prev_gpa': prev_gpa
            })
        
        risk_df = pd.DataFrame(risk_data)
        
        # Display risk distribution
        risk_counts = risk_df['risk_level'].value_counts()
        print(f"\n🎭 Realistic Risk Distribution:")
        print(f"   Low Risk: {risk_counts.get('low', 0)} students ({risk_counts.get('low', 0)/len(risk_df)*100:.1f}%)")
        print(f"   Medium Risk: {risk_counts.get('medium', 0)} students ({risk_counts.get('medium', 0)/len(risk_df)*100:.1f}%)")
        print(f"   High Risk: {risk_counts.get('high', 0)} students ({risk_counts.get('high', 0)/len(risk_df)*100:.1f}%)")
        
        # Show high-risk students
        high_risk_students = risk_df[risk_df['risk_level'] == 'high']
        if not high_risk_students.empty:
            print(f"\n⚠️  High Risk Students ({len(high_risk_students)}):")
            print(high_risk_students[['student_name', 'attendance', 'cgpa', 'avg_submission_score', 'risk_score']].head(10))
        
        # Show medium-risk students
        medium_risk_students = risk_df[risk_df['risk_level'] == 'medium']
        if not medium_risk_students.empty:
            print(f"\n⚡ Medium Risk Students ({len(medium_risk_students)}):")
            print(medium_risk_students[['student_name', 'attendance', 'cgpa', 'avg_submission_score', 'risk_score']].head(5))
        
        # Show low-risk students
        low_risk_students = risk_df[risk_df['risk_level'] == 'low']
        if not low_risk_students.empty:
            print(f"\n✅ Low Risk Students ({len(low_risk_students)}):")
            print(low_risk_students[['student_name', 'attendance', 'cgpa', 'avg_submission_score', 'risk_score']].head(5))
        
        return risk_df
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return pd.DataFrame()

def train_realistic_ml_model(risk_df):
    """Train ML model with realistic risk distribution"""
    print("\n🚀 Training ML Model with Realistic Risk Distribution...")
    
    try:
        from realistic_ml_api import EnhancedStudentPerformancePredictor
        
        # Prepare training data
        ml_data = []
        
        for _, student in risk_df.iterrows():
            ml_data.append({
                'attendance': student['attendance_norm'],
                'cgpa': student['cgpa_norm'],
                'fees_status_numeric': 1 if np.random.random() > 0.3 else 0,  # Random fees status
                'assignment_completion_rate': student['assignment_completion'],
                'avg_assignment_score': student['avg_score_norm'],
                'class_participation_score': student['class_participation'],
                'previous_semester_gpa': student['prev_gpa'],
                'study_hours_per_week': student['study_hours'],
                'extracurricular_activities': np.random.choice([0, 1], p=[0.6, 0.4]),
                'recent_performance_trend': student['recent_trend'],
                'submission_consistency': student['submission_consistency'],
                'grade_variance': student['grade_variance'],
                'performance_risk': student['risk_category']
            })
        
        ml_df = pd.DataFrame(ml_data)
        
        # Train model
        predictor = EnhancedStudentPerformancePredictor()
        metrics = predictor.train_enhanced_ensemble(ml_df)
        
        best_model = predictor.active_model
        accuracy = metrics.get(best_model, {}).get('accuracy', 0)
        
        print(f"✅ Model trained successfully!")
        print(f"📊 Best model: {best_model}")
        print(f"📊 Training accuracy: {accuracy:.3f}")
        print(f"👥 Training samples: {len(ml_df)}")
        
        # Save trained model and scaler
        predictor.save_model_with_metadata()
        print(f"💾 Model and metadata saved to files")
        
        # Test predictions on different risk levels
        test_realistic_predictions(predictor, ml_df, risk_df)
        
        return predictor
        
    except Exception as e:
        print(f"❌ Training error: {e}")
        return None

def test_realistic_predictions(predictor, ml_df, risk_df):
    """Test predictions on students from different risk levels"""
    print("\n🧪 Testing Realistic Predictions...")
    
    # Get samples from each risk level
    high_risk_sample = risk_df[risk_df['risk_level'] == 'high'].head(3)
    medium_risk_sample = risk_df[risk_df['risk_level'] == 'medium'].head(3)
    low_risk_sample = risk_df[risk_df['risk_level'] == 'low'].head(3)
    
    for risk_level, sample_data in [('high', high_risk_sample), ('medium', medium_risk_sample), ('low', low_risk_sample)]:
        print(f"\n{'⚠️' if risk_level == 'high' else '⚡' if risk_level == 'medium' else '✅'} {risk_level.upper()} RISK STUDENTS:")
        
        for _, student in sample_data.iterrows():
            # Prepare student data for prediction
            student_ml_data = pd.DataFrame([{
                'attendance': student['attendance_norm'],
                'cgpa': student['cgpa_norm'],
                'fees_status_numeric': 1,
                'assignment_completion_rate': student['assignment_completion'],
                'avg_assignment_score': student['avg_score_norm'],
                'class_participation_score': student['class_participation'],
                'previous_semester_gpa': student['prev_gpa'],
                'study_hours_per_week': student['study_hours'],
                'extracurricular_activities': 0,
                'recent_performance_trend': student['recent_trend'],
                'submission_consistency': student['submission_consistency'],
                'grade_variance': student['grade_variance'],
                'performance_risk': student['risk_category']
            }])
            
            prediction = predictor.predict_with_explanations(student_ml_data)
            
            print(f"   📝 {student['student_name']}")
            print(f"      CGPA: {student['cgpa']:.2f}, Attendance: {student['attendance']:.1f}%, Avg Score: {student['avg_submission_score']:.1f}")
            print(f"      Predicted: {prediction['risk']} (confidence: {prediction['confidence']:.2f})")
            print(f"      Factors: {', '.join(prediction['factors'])}")

def generate_ml_training_dataset():
    """Generate final ML training dataset"""
    print("\n📦 Generating ML Training Dataset...")
    
    risk_df = create_realistic_risk_distribution()
    
    if risk_df.empty:
        print("❌ No risk data generated")
        return
    
    # Prepare final training data
    training_data = []
    
    for _, student in risk_df.iterrows():
        training_data.append({
            'student_id': student['student_id'],
            'student_name': student['student_name'],
            'attendance': student['attendance_norm'],
            'cgpa': student['cgpa_norm'],
            'fees_status_numeric': 1 if np.random.random() > 0.3 else 0,
            'assignment_completion_rate': student['assignment_completion'],
            'avg_assignment_score': student['avg_score_norm'],
            'class_participation_score': student['class_participation'],
            'previous_semester_gpa': student['prev_gpa'],
            'study_hours_per_week': student['study_hours'],
            'extracurricular_activities': np.random.choice([0, 1], p=[0.6, 0.4]),
            'recent_performance_trend': student['recent_trend'],
            'submission_consistency': student['submission_consistency'],
            'grade_variance': student['grade_variance'],
            'performance_risk': student['risk_category'],
            'risk_level': student['risk_level'],
            'risk_score': student['risk_score']
        })
    
    training_df = pd.DataFrame(training_data)
    
    # Save training dataset
    training_df.to_csv('ml_training_dataset.csv', index=False)
    print(f"✅ Training dataset saved with {len(training_df)} samples")
    
    # Train final model
    predictor = train_realistic_ml_model(risk_df)
    
    return training_df, predictor

if __name__ == "__main__":
    print("🎯 Realistic ML Model Training with Proper Risk Distribution")
    print("=" * 60)
    
    # Generate training dataset and train model
    training_df, predictor = generate_ml_training_dataset()
    
    if predictor is not None:
        print("\n🎉 Enhanced ML model training complete!")
        print("📊 Model now has realistic risk distribution with proper high-risk students")
    else:
        print("\n❌ Model training failed")
