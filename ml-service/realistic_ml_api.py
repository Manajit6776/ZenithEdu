from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, IsolationForest, VotingClassifier
from sklearn.preprocessing import RobustScaler
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score, confusion_matrix
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.feature_selection import SelectFromModel
import sqlite3
from datetime import datetime, timedelta
import json
from typing import List, Dict, Optional, Tuple
import warnings
import joblib
import os
import asyncio
from concurrent.futures import ThreadPoolExecutor
import logging
from dataclasses import dataclass
from scipy import stats
from scipy.stats import ks_2samp
import xgboost as xgb
from sklearn.calibration import CalibratedClassifierCV
from sklearn.impute import SimpleImputer
import hashlib
try:
    from imblearn.over_sampling import SMOTE
    SMOTE_AVAILABLE = True
except ImportError:
    SMOTE_AVAILABLE = False
    print("⚠️ imbalanced-learn not installed. SMOTE will be disabled.")
try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False
    print("⚠️ SHAP not installed. Model explainability will be limited.")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

warnings.filterwarnings('ignore')

# Centralized Feature Configuration
FEATURE_CONFIG = {
    'base': [
        'attendance', 'cgpa', 'fees_status_numeric',
        'assignment_completion_rate', 'avg_assignment_score',
        'class_participation_score', 'previous_semester_gpa',
        'study_hours_per_week', 'extracurricular_activities',
        'recent_performance_trend', 'submission_consistency',
        'grade_variance'
    ],
    'engineered': [
        'academic_score', 'attendance_consistency',
        'composite_risk_score', 'attendance_cgpa_interaction',
        'performance_trend_score', 'days_since_last_submission',
        'submission_recency_score', 'weekend_submission'
    ],
    'all': lambda: FEATURE_CONFIG['base'] + FEATURE_CONFIG['engineered']
}

app = FastAPI(title="Enhanced Student Performance ML API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@dataclass
class ModelConfig:
    """Configuration for ML models"""
    n_estimators: int = 200
    max_depth: int = 10
    min_samples_split: int = 5
    min_samples_leaf: int = 2
    random_state: int = 42
    test_size: float = 0.2
    validation_size: float = 0.1
    n_jobs: int = -1
    contamination: float = 0.25  # For anomaly detection
    cv_folds: int = 5

class FeatureEngineer:
    """Enhanced feature engineering for student performance prediction"""
    
    @staticmethod
    def create_advanced_features(df: pd.DataFrame) -> pd.DataFrame:
        """Create advanced derived features"""
        df_features = df.copy()
        
        # Academic performance composite score
        avg_submission_score = df_features['avg_submission_score'] if 'avg_submission_score' in df_features.columns else 65
        df_features['academic_score'] = (
            df_features['cgpa'] * 0.4 +
            (avg_submission_score / 100) * 100 * 0.3 +
            df_features['attendance'] * 0.3
        )
        
        # Attendance consistency (lower variance is better)
        df_features['attendance_consistency'] = 1 - np.minimum(
            abs(df_features['attendance'] - df_features['attendance'].rolling(window=5, min_periods=1).mean()) / 100,
            1
        )
        
        # Performance trend (last 3 assignments vs overall)
        if 'recent_assignment_scores' in df_features.columns:
            df_features['performance_trend_score'] = (
                df_features['recent_assignment_scores'] / 
                df_features['avg_submission_score'].clip(lower=1)
            )
        
        # Risk flags based on thresholds
        df_features['attendance_risk'] = (df_features['attendance'] < 75).astype(int)
        df_features['cgpa_risk'] = (df_features['cgpa'] < 6.0).astype(int)
        
        # Handle assignment risk with proper column access
        avg_submission_score = df_features['avg_submission_score'] if 'avg_submission_score' in df_features.columns else 65
        total_submissions = df_features['total_submissions'] if 'total_submissions' in df_features.columns else 5
        
        df_features['assignment_risk'] = (
            (avg_submission_score < 60) | 
            (total_submissions < 3)
        ).astype(int)
        
        # Composite risk score
        df_features['composite_risk_score'] = (
            df_features['attendance_risk'] * 0.4 +
            df_features['cgpa_risk'] * 0.4 +
            df_features['assignment_risk'] * 0.2
        )
        
        # Time-based features (if dates available)
        if 'last_submission_date' in df_features.columns:
            df_features['days_since_last_submission'] = (
                datetime.now() - pd.to_datetime(df_features['last_submission_date'])
            ).dt.days
        
        # Interaction features
        df_features['attendance_cgpa_interaction'] = (
            df_features['attendance'] * df_features['cgpa']
        )
        
        # Standardize features
        numeric_cols = df_features.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            if df_features[col].std() > 0:
                df_features[f'{col}_zscore'] = (
                    (df_features[col] - df_features[col].mean()) / 
                    df_features[col].std()
                )
        
        return df_features
    
    @staticmethod
    def engineer_temporal_features(df: pd.DataFrame) -> pd.DataFrame:
        """Create time-based features"""
        if 'last_submission_date' not in df.columns:
            return df
        
        df_temp = df.copy()
        df_temp['last_submission_date'] = pd.to_datetime(df_temp['last_submission_date'])
        
        # Time since last activity
        current_time = datetime.now()
        df_temp['hours_since_last_submission'] = (
            (current_time - df_temp['last_submission_date']).dt.total_seconds() / 3600
        )
        
        # Day of week pattern (if multiple submissions available)
        df_temp['submission_day_of_week'] = df_temp['last_submission_date'].dt.dayofweek
        
        # Weekend submission flag
        df_temp['weekend_submission'] = df_temp['submission_day_of_week'].isin([5, 6]).astype(int)
        
        # Submission recency score (more recent is better)
        max_hours = df_temp['hours_since_last_submission'].max()
        if max_hours > 0:
            df_temp['submission_recency_score'] = 1 - (
                df_temp['hours_since_last_submission'] / max_hours
            )
        
        return df_temp

class EnhancedStudentPerformancePredictor:
    def __init__(self, config: ModelConfig = None):
        self.config = config or ModelConfig()
        
        # Initialize base models with class imbalance handling
        self.models = {
            'random_forest': RandomForestClassifier(
                n_estimators=self.config.n_estimators,
                max_depth=self.config.max_depth,
                min_samples_split=self.config.min_samples_split,
                min_samples_leaf=self.config.min_samples_leaf,
                random_state=self.config.random_state,
                n_jobs=self.config.n_jobs,
                class_weight='balanced'
            ),
            'gradient_boosting': GradientBoostingClassifier(
                n_estimators=self.config.n_estimators,
                max_depth=self.config.max_depth,
                random_state=self.config.random_state
            ),
            'xgboost': xgb.XGBClassifier(
                n_estimators=self.config.n_estimators,
                max_depth=self.config.max_depth,
                learning_rate=0.1,
                random_state=self.config.random_state,
                n_jobs=self.config.n_jobs,
                scale_pos_weight=2
            )
        }
        
        # Initialize ensemble model
        self.ensemble_model = None
        self.feature_selector = None
        
        self.active_model = 'ensemble'
        self.scaler = RobustScaler()
        self.feature_imputer = SimpleImputer(strategy='median')
        self.feature_engineer = FeatureEngineer()
        
        # Training state
        self.is_trained = False
        self.is_fitted = False
        self.feature_importance = None
        self.model_metrics = {}
        self.training_history = []
        
        # Model metadata for versioning
        self.model_metadata = {
            'version': '1.0.0',
            'trained_at': None,
            'data_hash': None,
            'metrics': {},
            'feature_names': FEATURE_CONFIG['all']()
        }
        
        # Monitoring variables
        self.prediction_count = 0
        self.recent_confidences = []
        self.drift_status = False
        
        # SHAP explainer (initialized after training)
        self.shap_explainer = None
        
    def fit_feature_pipeline(self, X_train):
        """Fit imputer and scaler on training data"""
        self.feature_imputer.fit(X_train)
        self.scaler.fit(X_train)
        self.is_fitted = True
        logger.info("✅ Feature pipeline fitted successfully")
        
    def prepare_features(self, data: pd.DataFrame, fit: bool = False) -> np.ndarray:
        """Prepare enhanced features for ML model"""
        # Create advanced features
        data_enhanced = self.feature_engineer.create_advanced_features(data)
        data_enhanced = self.feature_engineer.engineer_temporal_features(data_enhanced)
        
        # Use centralized feature configuration
        all_features = FEATURE_CONFIG['all']()
        
        # Ensure all features exist (fill missing with 0)
        for feature in all_features:
            if feature not in data_enhanced.columns:
                data_enhanced[feature] = 0
        
        # Get feature array
        features_array = data_enhanced[all_features].values
        
        # Fit or transform imputer
        if fit:
            features_array = self.feature_imputer.fit_transform(features_array)
            logger.info("✅ Imputer fitted on training data")
        else:
            if not self.is_fitted:
                logger.warning("⚠️ Imputer not fitted! Fitting now on current data...")
                features_array = self.feature_imputer.fit_transform(features_array)
                self.is_fitted = True
            else:
                features_array = self.feature_imputer.transform(features_array)
        
        return features_array
        
    def handle_class_imbalance(self, X_train, y_train):
        """Apply SMOTE for class imbalance handling"""
        if not SMOTE_AVAILABLE:
            logger.warning("⚠️ SMOTE not available. Skipping class imbalance handling.")
            return X_train, y_train
            
        try:
            smote = SMOTE(random_state=self.config.random_state)
            X_resampled, y_resampled = smote.fit_resample(X_train, y_train)
            logger.info(f"✅ SMOTE applied. Original: {np.bincount(y_train)}, Resampled: {np.bincount(y_resampled)}")
            return X_resampled, y_resampled
        except Exception as e:
            logger.warning(f"⚠️ SMOTE failed: {e}. Using original data.")
            return X_train, y_train
            
    def apply_feature_selection(self, X_train, y_train):
        """Apply feature selection using SelectFromModel"""
        try:
            # Use Random Forest for feature selection
            selector = SelectFromModel(
                RandomForestClassifier(n_estimators=100, random_state=self.config.random_state),
                threshold='median'
            )
            X_selected = selector.fit_transform(X_train, y_train)
            self.feature_selector = selector
            
            # Get selected feature indices
            selected_features = selector.get_support()
            logger.info(f"✅ Feature selection applied. Selected {sum(selected_features)}/{len(selected_features)} features")
            
            return X_selected
        except Exception as e:
            logger.warning(f"⚠️ Feature selection failed: {e}. Using all features.")
            return X_train
            
    def create_ensemble(self):
        """Create voting ensemble from trained models"""
        try:
            ensemble = VotingClassifier([
                ('rf', self.models['random_forest']),
                ('gb', self.models['gradient_boosting']),
                ('xgb', self.models['xgboost'])
            ], voting='soft', weights=[0.4, 0.3, 0.3])
            
            self.ensemble_model = ensemble
            logger.info("✅ Ensemble model created successfully")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to create ensemble: {e}")
            return False
        
    def load_model(self, model_dir='ml_models'):
        """Load trained model and scaler from files"""
        try:
            model_path = os.path.join(model_dir, 'student_performance_model.joblib')
            scaler_path = os.path.join(model_dir, 'scaler.joblib')
            feature_path = os.path.join(model_dir, 'feature_importance.joblib')
            
            if all(os.path.exists(p) for p in [model_path, scaler_path, feature_path]):
                self.models['random_forest'] = joblib.load(model_path)
                self.scaler = joblib.load(scaler_path)
                self.feature_importance = joblib.load(feature_path)
                self.is_trained = True
                logger.info("✅ Model, scaler, and feature importance loaded successfully")
                return True
            else:
                logger.warning("⚠️ Model files not found. Please run training script first.")
                return False
        except Exception as e:
            logger.error(f"❌ Error loading model: {e}")
            return False
    
    def train_enhanced_ensemble(self, data: pd.DataFrame) -> Dict:
        """Enhanced training with ensemble, SMOTE, feature selection, and versioning"""
        if len(data) < 20:
            logger.error("Insufficient data for training!")
            return {}
        
        # Fit feature pipeline
        X = self.prepare_features(data, fit=True)
        y = data['performance_risk'].values
        
        logger.info(f"Training data shape: {X.shape}")
        logger.info(f"Class distribution: {np.bincount(y)}")
        
        # Split data with stratification
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, 
            test_size=self.config.test_size, 
            random_state=self.config.random_state,
            stratify=y
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        best_model = None
        best_score = 0
        model_results = {}
        
        # Train and evaluate each model
        for model_name, model in self.models.items():
            logger.info(f"Training {model_name}...")
            
            # Cross-validation
            cv_scores = cross_val_score(
                model, X_train_scaled, y_train, 
                cv=self.config.cv_folds, scoring='f1_weighted'
            )
            
            # Train on full training set
            model.fit(X_train_scaled, y_train)
            
            # Evaluate
            y_pred = model.predict(X_test_scaled)
            y_pred_proba = model.predict_proba(X_test_scaled)
            
            # Calculate metrics
            accuracy = accuracy_score(y_test, y_pred)
            f1 = f1_score(y_test, y_pred, average='weighted')
            roc_auc = roc_auc_score(y_test, y_pred_proba, multi_class='ovr')
            
            model_results[model_name] = {
                'cv_mean': cv_scores.mean(),
                'cv_std': cv_scores.std(),
                'accuracy': accuracy,
                'f1_score': f1,
                'roc_auc': roc_auc
            }
            
            logger.info(f"{model_name} - CV: {cv_scores.mean():.3f} (±{cv_scores.std():.3f}), "
                       f"Accuracy: {accuracy:.3f}, F1: {f1:.3f}")
            
            # Select best model based on F1 score
            if f1 > best_score:
                best_score = f1
                best_model = model_name
                self.active_model = model_name
        
        # Calibrate the best model for better probability estimates
        if best_model:
            logger.info(f"Selected {best_model} as active model")
            self.models[best_model] = CalibratedClassifierCV(
                self.models[best_model], 
                cv=3, 
                method='isotonic'
            )
            self.models[best_model].fit(X_train_scaled, y_train)
            
            # Store feature importance
            if hasattr(self.models[best_model].estimators_[0], 'feature_importances_'):
                self.feature_importance = self.models[best_model].estimators_[0].feature_importances_
        
        self.is_trained = True
        self.model_metrics = model_results
        
        # Save training history
        self.training_history.append({
            'timestamp': datetime.now(),
            'samples': len(data),
            'best_model': best_model,
            'metrics': model_results.get(best_model, {})
        })
        
        return model_results
    
    def predict_with_explanations(self, student_data: pd.DataFrame) -> Dict:
        """Predict performance risk with detailed explanations"""
        if not self.is_trained:
            return self._default_prediction()
        
        features = self.prepare_features(student_data)
        features_scaled = self.scaler.transform(features)
        
        model = self.models[self.active_model]
        predictions = model.predict_proba(features_scaled)
        risk_levels = ['low', 'medium', 'high']
        risk_index = np.argmax(predictions[0])
        confidence = predictions[0][risk_index]
        
        # Get SHAP-like explanations (simplified)
        explanations = self._generate_explanations(
            features_scaled[0], 
            student_data.iloc[0].to_dict()
        )
        
        # Calculate risk factors
        factors = self._identify_risk_factors(features_scaled[0])
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            risk_levels[risk_index], 
            factors, 
            student_data.iloc[0].to_dict()
        )
        
        # Calculate expected improvement with interventions
        expected_improvement = self._calculate_expected_improvement(
            features_scaled[0], 
            risk_levels[risk_index]
        )
        
        return {
            "risk": risk_levels[risk_index],
            "confidence": float(confidence),
            "probability_distribution": {
                'low': float(predictions[0][0]),
                'medium': float(predictions[0][1]),
                'high': float(predictions[0][2])
            },
            "factors": factors,
            "explanations": explanations,
            "recommendations": recommendations,
            "expected_improvement": expected_improvement,
            "model_used": self.active_model,
            "model_confidence": self.model_metrics.get(self.active_model, {}).get('cv_mean', 0.5)
        }
    
    def _generate_explanations(self, features: np.ndarray, student_data: Dict) -> List[Dict]:
        """Generate feature-based explanations for prediction"""
        feature_names = [
            'Attendance', 'CGPA', 'Fees Status', 'Assignment Completion',
            'Average Score', 'Class Participation', 'Previous GPA',
            'Study Hours', 'Extracurricular', 'Performance Trend',
            'Submission Consistency', 'Grade Variance',
            'Academic Score', 'Attendance Consistency',
            'Composite Risk', 'Attendance-CGPA Interaction'
        ]
        
        explanations = []
        if self.feature_importance is not None:
            for i, (name, importance) in enumerate(zip(feature_names, self.feature_importance)):
                if importance > 0.05:  # Only significant features
                    value = features[i]
                    impact = "positive" if value > 0 else "negative"
                    explanations.append({
                        'feature': name,
                        'importance': float(importance),
                        'value': float(value),
                        'impact': impact,
                        'contribution': float(importance * abs(value))
                    })
        
        # Sort by contribution
        explanations.sort(key=lambda x: x['contribution'], reverse=True)
        return explanations[:5]  # Top 5 explanations
    
    def _identify_risk_factors(self, features: np.ndarray) -> List[str]:
        """Identify specific risk factors"""
        factors = []
        feature_names = [
            'attendance', 'cgpa', 'fees_status', 'assignments_completion',
            'avg_score', 'participation', 'previous_gpa', 'study_hours',
            'extracurricular', 'performance_trend', 'submission_consistency',
            'grade_variance', 'academic_score', 'attendance_consistency',
            'composite_risk', 'attendance_cgpa_interaction'
        ]
        
        thresholds = {
            'attendance': -0.5,
            'cgpa': -0.5,
            'avg_score': -0.5,
            'submission_consistency': -0.5,
            'academic_score': -0.3,
            'attendance_consistency': -0.3
        }
        
        for i, name in enumerate(feature_names[:len(features)]):
            if name in thresholds and features[i] < thresholds[name]:
                if features[i] < -1.0:
                    factors.append(f"Very low {name.replace('_', ' ')}")
                else:
                    factors.append(f"Low {name.replace('_', ' ')}")
        
        return factors[:3]
    
    def _generate_recommendations(self, risk_level: str, factors: List[str], 
                                student_data: Dict) -> List[Dict]:
        """Generate personalized recommendations"""
        recommendations = []
        
        # Risk-level based recommendations
        base_recs = {
            'high': [
                {"action": "Schedule academic counseling", "priority": "high", "impact": "high"},
                {"action": "Assign peer tutor", "priority": "high", "impact": "medium"},
                {"action": "Create intervention plan", "priority": "high", "impact": "high"},
                {"action": "Weekly progress monitoring", "priority": "medium", "impact": "medium"}
            ],
            'medium': [
                {"action": "Academic skills workshop", "priority": "medium", "impact": "medium"},
                {"action": "Study group assignment", "priority": "medium", "impact": "medium"},
                {"action": "Regular check-ins", "priority": "low", "impact": "low"}
            ],
            'low': [
                {"action": "Advanced coursework", "priority": "low", "impact": "high"},
                {"action": "Leadership opportunities", "priority": "low", "impact": "medium"},
                {"action": "Mentor junior students", "priority": "low", "impact": "low"}
            ]
        }
        
        recommendations.extend(base_recs.get(risk_level, []))
        
        # Factor-specific recommendations
        factor_recs = {
            'attendance': [
                {"action": "Attendance improvement plan", "priority": "high", "impact": "high"},
                {"action": "Class participation goals", "priority": "medium", "impact": "medium"}
            ],
            'cgpa': [
                {"action": "Targeted tutoring", "priority": "high", "impact": "high"},
                {"action": "Exam preparation sessions", "priority": "medium", "impact": "medium"}
            ],
            'assignment': [
                {"action": "Assignment deadline reminders", "priority": "medium", "impact": "medium"},
                {"action": "Writing center support", "priority": "low", "impact": "medium"}
            ]
        }
        
        for factor in factors:
            key = next((k for k in factor_recs.keys() if k in factor.lower()), None)
            if key:
                recommendations.extend(factor_recs[key])
        
        # Remove duplicates
        seen = set()
        unique_recs = []
        for rec in recommendations:
            rec_tuple = tuple(rec.items())
            if rec_tuple not in seen:
                seen.add(rec_tuple)
                unique_recs.append(rec)
        
        return unique_recs[:5]
    
    def detect_data_drift(self, train_features, new_features):
        """Detect data drift using Kolmogorov-Smirnov test"""
        try:
            drift_detected = []
            feature_names = FEATURE_CONFIG['all']()
            
            for i in range(min(train_features.shape[1], new_features.shape[1])):
                stat, p_value = ks_2samp(train_features[:, i], new_features[:, i])
                if p_value < 0.05:  # Significant drift
                    drift_detected.append({
                        'feature': feature_names[i] if i < len(feature_names) else f'feature_{i}',
                        'ks_statistic': float(stat),
                        'p_value': float(p_value),
                        'drift_level': 'high' if p_value < 0.01 else 'medium'
                    })
            
            self.drift_status = len(drift_detected) > 0
            logger.info(f"🔍 Data drift detection: {len(drift_detected)} features with significant drift")
            
            return {
                'drift_detected': self.drift_status,
                'drifted_features': drift_detected,
                'drift_summary': {
                    'total_features': train_features.shape[1],
                    'drifted_count': len(drift_detected),
                    'drift_percentage': len(drift_detected) / train_features.shape[1] * 100
                }
            }
        except Exception as e:
            logger.error(f"❌ Data drift detection failed: {e}")
            return {'drift_detected': False, 'error': str(e)}
    
    def get_shap_explanations(self, student_data: pd.DataFrame):
        """Get SHAP explanations for predictions"""
        if not SHAP_AVAILABLE or not self.shap_explainer:
            return {'error': 'SHAP not available or explainer not initialized'}
        
        try:
            features = self.prepare_features(student_data)
            features_scaled = self.scaler.transform(features)
            
            # Calculate SHAP values
            shap_values = self.shap_explainer.shap_values(features_scaled)
            
            # Get feature names
            feature_names = FEATURE_CONFIG['all']()
            
            # Format explanations
            explanations = []
            if isinstance(shap_values, list):
                # Multi-class case
                shap_vals = shap_values[0]  # Use first class
            else:
                shap_vals = shap_values
            
            for i, (name, val) in enumerate(zip(feature_names, shap_vals[0])):
                explanations.append({
                    'feature': name,
                    'shap_value': float(val),
                    'impact': 'positive' if val > 0 else 'negative'
                })
            
            # Sort by absolute SHAP value
            explanations.sort(key=lambda x: abs(x['shap_value']), reverse=True)
            
            return {
                'explanations': explanations[:10],  # Top 10 features
                'base_value': float(self.shap_explainer.expected_value[0]) if hasattr(self.shap_explainer.expected_value, '__iter__') else float(self.shap_explainer.expected_value)
            }
        except Exception as e:
            logger.error(f"❌ SHAP explanation failed: {e}")
            return {'error': str(e)}
    
    def update_monitoring_metrics(self, prediction_confidence):
        """Update monitoring metrics"""
        self.prediction_count += 1
        self.recent_confidences.append(prediction_confidence)
        
        # Keep only last 100 confidences
        if len(self.recent_confidences) > 100:
            self.recent_confidences = self.recent_confidences[-100:]
    
    def get_model_health(self):
        """Get comprehensive model health metrics"""
        if not self.is_trained:
            return {'status': 'not_trained'}
        
        current_time = datetime.now()
        model_age = None
        if self.model_metadata['trained_at']:
            model_age = (current_time - self.model_metadata['trained_at']).days
        
        avg_confidence = np.mean(self.recent_confidences) if self.recent_confidences else 0
        
        health_status = {
            'model_version': self.model_metadata['version'],
            'model_age_days': model_age,
            'prediction_count': self.prediction_count,
            'avg_confidence': float(avg_confidence),
            'drift_status': self.drift_status,
            'last_trained': self.model_metadata['trained_at'].isoformat() if self.model_metadata['trained_at'] else None,
            'feature_count': len(FEATURE_CONFIG['all']()),
            'ensemble_active': self.ensemble_model is not None,
            'shap_available': SHAP_AVAILABLE and self.shap_explainer is not None,
            'smote_available': SMOTE_AVAILABLE,
            'model_metrics': self.model_metadata['metrics']
        }
        
        # Health score calculation
        health_score = 100
        if model_age and model_age > 30:  # Model older than 30 days
            health_score -= min(20, model_age / 30 * 10)
        if avg_confidence < 0.7:
            health_score -= (0.7 - avg_confidence) * 50
        if self.drift_status:
            health_score -= 15
        if self.prediction_count < 10:
            health_score -= 10
        
        health_status['health_score'] = max(0, health_score)
        health_status['status'] = 'healthy' if health_score > 80 else 'warning' if health_score > 60 else 'critical'
        
        return health_status
    
    def save_model_with_metadata(self, model_dir='ml_models'):
        """Save model with comprehensive metadata"""
        try:
            os.makedirs(model_dir, exist_ok=True)
            
            # Save ensemble model if available
            if self.ensemble_model:
                joblib.dump(self.ensemble_model, os.path.join(model_dir, 'ensemble_model.joblib'))
            
            # Save individual models
            for name, model in self.models.items():
                joblib.dump(model, os.path.join(model_dir, f'{name}_model.joblib'))
            
            # Save preprocessing components
            joblib.dump(self.scaler, os.path.join(model_dir, 'scaler.joblib'))
            joblib.dump(self.feature_imputer, os.path.join(model_dir, 'imputer.joblib'))
            
            if self.feature_selector:
                joblib.dump(self.feature_selector, os.path.join(model_dir, 'feature_selector.joblib'))
            
            # Save metadata
            metadata = {
                'version': self.model_metadata['version'],
                'trained_at': self.model_metadata['trained_at'],
                'data_hash': self.model_metadata['data_hash'],
                'metrics': self.model_metadata['metrics'],
                'feature_names': self.model_metadata['feature_names'],
                'config': {
                    'n_estimators': self.config.n_estimators,
                    'max_depth': self.config.max_depth,
                    'random_state': self.config.random_state
                },
                'model_info': {
                    'ensemble_active': self.ensemble_model is not None,
                    'feature_selection': self.feature_selector is not None,
                    'smote_used': SMOTE_AVAILABLE,
                    'shap_available': SHAP_AVAILABLE
                }
            }
            
            with open(os.path.join(model_dir, 'model_metadata.json'), 'w') as f:
                json.dump(metadata, f, indent=2, default=str)
            
            logger.info(f"✅ Model and metadata saved to {model_dir}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to save model: {e}")
            return False
    
    def _calculate_expected_improvement(self, features: np.ndarray, 
                                      current_risk: str) -> Dict:
        """Calculate expected improvement with interventions"""
        risk_scores = {'low': 0, 'medium': 1, 'high': 2}
        current_score = risk_scores[current_risk]
        
        # Simulate improvement scenarios
        improvements = []
        
        # Scenario 1: Improve attendance by 10%
        improvements.append({
            "intervention": "Improve attendance by 10%",
            "expected_risk_reduction": 0.3,
            "confidence": 0.7
        })
        
        # Scenario 2: Improve assignment completion
        if features[3] < 0:  # assignment completion
            improvements.append({
                "intervention": "Complete pending assignments",
                "expected_risk_reduction": 0.25,
                "confidence": 0.8
            })
        
        return {
            "current_risk_score": current_score,
            "possible_improvements": improvements,
            "best_case_risk": max(0, current_score - 1) if improvements else current_score
        }
    
    def _default_prediction(self) -> Dict:
        """Return default prediction when model not trained"""
        return {
            "risk": "medium",
            "confidence": 0.5,
            "probability_distribution": {"low": 0.33, "medium": 0.34, "high": 0.33},
            "factors": ["Model not trained"],
            "explanations": [],
            "recommendations": [{"action": "Retrain model with more data", "priority": "high", "impact": "high"}],
            "expected_improvement": {"current_risk_score": 1, "possible_improvements": [], "best_case_risk": 1},
            "model_used": "none",
            "model_confidence": 0.0
        }

class EnhancedAttendanceAnomalyDetector:
    def __init__(self, config: ModelConfig = None):
        self.config = config or ModelConfig()
        self.models = {
            'isolation_forest': IsolationForest(
                contamination=self.config.contamination,
                random_state=self.config.random_state,
                n_jobs=self.config.n_jobs
            ),
            'local_outlier_factor': None  # Could add LOF
        }
        self.scaler = RobustScaler()
        self.cluster_model = KMeans(n_clusters=3, random_state=self.config.random_state)
        self.pca = PCA(n_components=5)
        self.is_trained = False
        self.cluster_profiles = {}
        self.score_distribution = None
    
    def prepare_advanced_features(self, data: pd.DataFrame) -> np.ndarray:
        """Prepare advanced features for anomaly detection"""
        features = []
        
        for _, row in data.iterrows():
            attendance = row.get('attendance', 85)
            present = row.get('presentDays', 20)
            absent = row.get('absentDays', 5)
            late = row.get('lateDays', 2)
            total_days = present + absent + late
            
            feature_vector = [
                attendance / 100,  # Attendance rate
                present / max(total_days, 1),  # Present ratio
                absent / max(total_days, 1),   # Absent ratio
                late / max(total_days, 1),     # Late ratio
                row.get('cgpa', 7.5) / 10,     # Academic performance
                row.get('avg_submission_score', 80) / 100,  # Assignment performance
                # Advanced features
                (absent > 5) * 1.0,  # Frequent absences flag
                (late > 3) * 1.0,    # Frequent lateness flag
                attendance * (row.get('cgpa', 7.5) / 10),  # Attendance-performance interaction
                np.log1p(absent),    # Log of absences (handles skew)
                np.sqrt(late),       # Square root of lateness
                # Pattern features
                (attendance < 75) * 1.0,
                (attendance > 90) * 1.0,
                # Consistency score
                1 - (absent / max(total_days, 1)) if total_days > 0 else 1.0
            ]
            features.append(feature_vector)
        
        return np.array(features)
    
    def train_with_clustering(self, df: pd.DataFrame) -> bool:
        """Train anomaly detection with clustering"""
        if len(df) < 20:
            logger.warning("Insufficient data for anomaly detection training")
            return False
        
        try:
            # Prepare features
            features = self.prepare_advanced_features(df)
            
            # Scale features
            features_scaled = self.scaler.fit_transform(features)
            
            # Apply PCA for dimensionality reduction
            features_pca = self.pca.fit_transform(features_scaled)
            
            # Cluster students into profiles
            clusters = self.cluster_model.fit_predict(features_scaled)
            
            # Create cluster profiles
            self.cluster_profiles = {}
            for cluster_id in np.unique(clusters):
                cluster_mask = clusters == cluster_id
                cluster_data = features_scaled[cluster_mask]
                cluster_df = df.iloc[cluster_mask]
                
                self.cluster_profiles[cluster_id] = {
                    'size': len(cluster_data),
                    'centroid': np.mean(cluster_data, axis=0),
                    'avg_attendance': cluster_df['attendance'].mean() if 'attendance' in cluster_df.columns else 0,
                    'avg_cgpa': cluster_df['cgpa'].mean() if 'cgpa' in cluster_df.columns else 0,
                    'description': self._describe_cluster(cluster_df)
                }
            
            # Train anomaly detection within each cluster
            self.models['isolation_forest'].fit(features_scaled)
            
            # Store score distribution for quantile-based severity
            self.score_distribution = self.models['isolation_forest'].decision_function(features_scaled)
            
            self.is_trained = True
            
            logger.info(f"Anomaly detection model trained on {len(df)} students")
            logger.info(f"Clusters identified: {len(self.cluster_profiles)}")
            logger.info(f"Anomaly score range: {np.min(self.score_distribution):.3f} to {np.max(self.score_distribution):.3f}")
            
            return True
        except Exception as e:
            logger.error(f"Error training anomaly detection model: {e}")
            return False
    
    def _describe_cluster(self, cluster_df: pd.DataFrame) -> str:
        """Describe student cluster"""
        if len(cluster_df) == 0:
            return "Empty cluster"
        
        avg_attendance = cluster_df['attendance'].mean() if 'attendance' in cluster_df.columns else 0
        avg_cgpa = cluster_df['cgpa'].mean() if 'cgpa' in cluster_df.columns else 0
        
        if avg_attendance > 85 and avg_cgpa > 8.0:
            return "High performers"
        elif avg_attendance < 70 and avg_cgpa < 6.0:
            return "At-risk students"
        elif avg_attendance > 80 and avg_cgpa > 7.0:
            return "Regular performers"
        else:
            return "Mixed profile"
    
    def detect_anomaly_with_context(self, student_data: Dict) -> Dict:
        """Detect attendance anomaly with contextual information"""
        if not self.is_trained:
            return self._default_anomaly_result()
        
        try:
            # Prepare features
            features = self.prepare_advanced_features(pd.DataFrame([student_data]))
            features_scaled = self.scaler.transform(features)
            
            # Predict anomaly
            prediction = self.models['isolation_forest'].predict(features_scaled)[0]
            anomaly_score = self.models['isolation_forest'].decision_function(features_scaled)[0]
            
            is_anomaly = prediction == -1
            
            # Determine cluster membership
            cluster_id = self.cluster_model.predict(features_scaled)[0]
            cluster_info = self.cluster_profiles.get(cluster_id, {})
            
            # Calculate severity with cluster context
            severity, severity_score = self._calculate_severity(
                anomaly_score, 
                student_data,
                cluster_info
            )
            
            # Detect pattern
            pattern, pattern_details = self._detect_pattern(student_data)
            
            # Generate insights
            insights = self._generate_insights(student_data, is_anomaly, cluster_info)
            
            # Calculate confidence
            confidence = self._calculate_confidence(anomaly_score, severity_score)
            
            return {
                "anomaly": bool(is_anomaly),
                "severity": severity,
                "severity_score": float(severity_score),
                "pattern": pattern,
                "pattern_details": pattern_details,
                "cluster": int(cluster_id),
                "cluster_profile": cluster_info.get('description', 'Unknown'),
                "anomaly_score": float(anomaly_score),
                "confidence": float(confidence),
                "insights": insights,
                "recommendations": self._generate_anomaly_recommendations(
                    is_anomaly, severity, pattern, student_data
                ),
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error detecting anomaly: {e}")
            return self._default_anomaly_result()
    
    def _calculate_severity(self, anomaly_score: float, 
                          student_data: Dict, 
                          cluster_info: Dict) -> Tuple[str, float]:
        """Calculate anomaly severity using percentile-based approach"""
        if self.score_distribution is None or len(self.score_distribution) < 10:
            return "low", 0.3
        
        # Use percentiles for dynamic thresholding
        p10 = np.percentile(self.score_distribution, 10)
        p25 = np.percentile(self.score_distribution, 25)
        p75 = np.percentile(self.score_distribution, 75)
        
        # Debug info for monitoring
        logger.debug(f"Anomaly score: {anomaly_score:.4f}, P10: {p10:.4f}, P25: {p25:.4f}")
        
        # Adjust based on cluster (but don't invert the logic)
        cluster_adjustment = 1.0
        if cluster_info.get('description') == 'High performers':
            # Be more sensitive to anomalies in high performers
            cluster_adjustment = 0.9  # Make threshold slightly easier to reach
        elif cluster_info.get('description') == 'At-risk students':
            # Expect more anomalies in at-risk students
            cluster_adjustment = 1.1  # Make threshold slightly harder to reach
        
        adjusted_anomaly_score = anomaly_score * cluster_adjustment
        
        # Determine severity using percentiles (lower scores = more anomalous)
        if adjusted_anomaly_score <= p10:
            severity = "high"
        elif adjusted_anomaly_score <= p25:
            severity = "medium"
        else:
            severity = "low"
        
        # Calculate severity score for UI (0 = high severity, 1 = low severity)
        severity_score = (adjusted_anomaly_score - p10) / (p75 - p10) if p75 > p10 else 0.5
        severity_score = max(0, min(1, severity_score))  # Clamp to [0,1]
        
        logger.debug(f"Severity: {severity}, Score: {severity_score:.4f}")
        return severity, severity_score
    
    def _detect_pattern(self, student_data: Dict) -> Tuple[str, List[str]]:
        """Detect specific attendance patterns"""
        attendance = student_data.get('attendance', 0)
        late_days = student_data.get('lateDays', 0)
        absent_days = student_data.get('absentDays', 0)
        present_days = student_data.get('presentDays', 0)
        
        patterns = []
        details = []
        
        if attendance < 60:
            patterns.append("chronic_absence")
            details.append(f"Very low attendance ({attendance}%)")
        
        if late_days > 8:
            patterns.append("chronic_lateness")
            details.append(f"Frequent lateness ({late_days} days)")
        
        if absent_days > present_days * 0.3:  # More than 30% absence
            patterns.append("irregular_attendance")
            details.append("High absence ratio")
        
        if late_days > 0 and absent_days == 0:
            patterns.append("lateness_only")
            details.append("Always late but rarely absent")
        
        if not patterns:
            patterns.append("normal_pattern")
            details.append("No significant patterns detected")
        
        return patterns[0], details
    
    def _generate_insights(self, student_data: Dict, is_anomaly: bool, 
                         cluster_info: Dict) -> List[str]:
        """Generate insights about the student's attendance"""
        insights = []
        
        attendance = student_data.get('attendance', 0)
        cgpa = student_data.get('cgpa', 0)
        
        if is_anomaly:
            insights.append("Attendance pattern deviates from expected behavior")
        
        if attendance < 75 and cgpa < 6.0:
            insights.append("Poor attendance correlates with low academic performance")
        
        if attendance < cluster_info.get('avg_attendance', 80) - 15:
            insights.append(f"Attendance is significantly below cluster average ({cluster_info.get('avg_attendance', 80):.1f}%)")
        
        # Add trend insights if historical data available
        if 'attendance_trend' in student_data:
            trend = student_data['attendance_trend']
            if trend < -5:
                insights.append("Attendance shows declining trend")
        
        return insights
    
    def _calculate_confidence(self, anomaly_score: float, severity_score: float) -> float:
        """Calculate confidence in anomaly detection"""
        base_confidence = 0.5 + abs(anomaly_score) * 0.5
        severity_factor = 1.0 - severity_score  # Higher severity = lower confidence
        
        confidence = base_confidence * 0.7 + severity_factor * 0.3
        return min(0.95, max(0.5, confidence))
    
    def _generate_anomaly_recommendations(self, is_anomaly: bool, severity: str,
                                        pattern: str, student_data: Dict) -> List[Dict]:
        """Generate recommendations based on anomaly detection"""
        recommendations = []
        
        if not is_anomaly:
            recommendations.append({
                "action": "Continue monitoring",
                "priority": "low",
                "timeframe": "ongoing"
            })
            return recommendations
        
        # Severity-based recommendations
        if severity == "high":
            recommendations.extend([
                {
                    "action": "Immediate intervention required",
                    "priority": "critical",
                    "timeframe": "within 24 hours"
                },
                {
                    "action": "Contact student and parents",
                    "priority": "high",
                    "timeframe": "within 48 hours"
                }
            ])
        
        # Pattern-based recommendations
        if "chronic_absence" in pattern:
            recommendations.append({
                "action": "Develop attendance improvement plan",
                "priority": "high",
                "timeframe": "1 week"
            })
        
        if "chronic_lateness" in pattern:
            recommendations.append({
                "action": "Address punctuality issues",
                "priority": "medium",
                "timeframe": "2 weeks"
            })
        
        # Student-specific recommendations
        attendance = student_data.get('attendance', 0)
        if attendance < 70:
            recommendations.append({
                "action": f"Set attendance goal: {min(attendance + 15, 85)}%",
                "priority": "medium",
                "timeframe": "1 month"
            })
        
        return recommendations[:5]
    
    def _default_anomaly_result(self) -> Dict:
        """Return default anomaly result"""
        return {
            "anomaly": False,
            "severity": "low",
            "severity_score": 0.1,
            "pattern": "normal_pattern",
            "pattern_details": ["Model not trained"],
            "cluster": -1,
            "cluster_profile": "Unknown",
            "anomaly_score": 0.1,
            "confidence": 0.5,
            "insights": ["Model not available for analysis"],
            "recommendations": [
                {"action": "Train anomaly detection model", "priority": "high", "timeframe": "ASAP"}
            ],
            "timestamp": datetime.now().isoformat()
        }

# Initialize enhanced models
config = ModelConfig()
performance_predictor = EnhancedStudentPerformancePredictor(config)
anomaly_detector = EnhancedAttendanceAnomalyDetector(config)

# Database and data functions
def get_department_code(department):
    """Get department code for roll number generation"""
    dept_codes = {
        'Business Administration': 'BA',
        'Biology': 'BIO',
        'Civil Engineering': 'CE',
        'Chemistry': 'CHEM',
        'Computer Science': 'CS',
        'Electrical Engineering': 'EE',
        'Mathematics': 'MATH',
        'Mechanical Engineering': 'ME',
        'Physics': 'PHY'
    }
    return dept_codes.get(department, 'GEN')

def get_department_code(department: str) -> str:
    """Get department code for roll number generation"""
    codes = {
        'Computer Science': 'CS',
        'Physics': 'PHY', 
        'Mathematics': 'MATH',
        'Chemistry': 'CHEM',
        'Biology': 'BIO'
    }
    return codes.get(department, 'GEN')

def get_enhanced_student_data_from_db():
    """Fetch enhanced student data with real assignment grades from database"""
    try:
        conn = sqlite3.connect('../prisma/dev.db')
        
        # Enhanced query to get real assignment data
        query = """
        SELECT 
            s.id,
            s.name,
            s.rollNo,
            s.department,
            s.attendance,
            s.presentDays,
            s.absentDays,
            s.lateDays,
            s.cgpa,
            s.feesStatus,
            s.overallAssignmentScore,
            u.email,
            COUNT(sub.id) as total_submissions,
            AVG(sub.score) as avg_submission_score,
            MAX(sub.submittedAt) as last_submission_date
        FROM students s
        JOIN users u ON s.userId = u.id
        LEFT JOIN submissions sub ON s.id = sub.studentId
        LEFT JOIN assignments a ON sub.assignmentId = a.id
        GROUP BY s.id, s.name, s.rollNo, s.department, s.attendance, s.presentDays, s.absentDays, s.lateDays, s.cgpa, s.feesStatus, s.overallAssignmentScore, u.email
        """
        df = pd.read_sql_query(query, conn)
        conn.close()
        
        # If no data, generate synthetic data
        if df.empty:
            logger.info("No student data found in database, generating synthetic data...")
            df = generate_enhanced_synthetic_student_data()
        else:
            logger.info(f"Retrieved {len(df)} students with real assignment data")
        
        return df
    except Exception as e:
        logger.error(f"Error fetching enhanced data: {e}")
        # Generate synthetic data as fallback
        return generate_enhanced_synthetic_student_data()

def generate_enhanced_synthetic_student_data():
    """Generate enhanced synthetic student data with realistic bad students"""
    np.random.seed(42)
    departments = ['Computer Science', 'Physics', 'Mathematics', 'Chemistry', 'Biology']
    data = []
    
    for i in range(50):
        dept = np.random.choice(departments)
        
        # Create realistic mix: 70% good students, 30% problematic students
        is_problematic = np.random.random() < 0.3
        
        if is_problematic:
            # Bad students - realistic poor attendance patterns
            cgpa = np.random.uniform(4.0, 6.5)  # Lower CGPA
            attendance = np.random.uniform(45, 75)  # Poor attendance
            present_days = np.random.randint(12, 20)  # Few present days
            absent_days = np.random.randint(8, 18)  # Many absences
            late_days = np.random.randint(6, 15)  # Frequent lateness
        else:
            # Good students - normal patterns
            cgpa = np.random.uniform(6.5, 9.5)  # Better CGPA
            attendance = np.random.uniform(75, 98)  # Good attendance
            present_days = np.random.randint(22, 28)  # Regular attendance
            absent_days = np.random.randint(1, 6)  # Few absences
            late_days = np.random.randint(0, 4)  # Minimal lateness
        
        # Generate realistic assignment scores
        total_assignments = np.random.randint(5, 15)
        if is_problematic:
            completed_assignments = np.random.randint(int(total_assignments * 0.3), int(total_assignments * 0.7))
            avg_score = np.random.uniform(30, 65) if completed_assignments > 0 else 0
        else:
            completed_assignments = np.random.randint(int(total_assignments * 0.7), total_assignments + 1)
            avg_score = np.random.uniform(65, 95) if completed_assignments > 0 else 0
        
        data.append({
            'id': f'student_{i+1}',
            'name': f'Student {i+1}',
            'rollNo': f'ROLL{i+1:03d}',
            'department': dept,
            'attendance': attendance,
            'cgpa': cgpa,
            'feesStatus': np.random.choice(['Paid', 'Pending']),
            'overallAssignmentScore': avg_score,
            'email': f'student{i+1}@edunexus.com',
            'total_submissions': completed_assignments,
            'avg_submission_score': avg_score,
            'last_submission_date': datetime.now() - timedelta(days=np.random.randint(1, 30)),
            # Add attendance detail fields for anomaly detection
            'presentDays': present_days,
            'absentDays': absent_days,
            'lateDays': late_days
        })
    
    return pd.DataFrame(data)

def create_realistic_ml_training_data():
    """Create realistic ML training data with proper risk distribution"""
    logger.info("Creating realistic ML training data with proper risk distribution...")
    
    # Get student data
    df = get_enhanced_student_data_from_db()
    
    if df.empty:
        return pd.DataFrame()
    
    # Fill missing values
    df['avg_submission_score'] = df['avg_submission_score'].fillna(0)
    df['total_submissions'] = df['total_submissions'].fillna(0)
    
    # Create realistic risk distribution
    ml_data = []
    
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
        avg_score_norm = (student['avg_submission_score'] / 100) if student['avg_submission_score'] > 0 else 0
        
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
            'recent_performance_trend': recent_trend,
            'submission_consistency': submission_consistency,
            'grade_variance': grade_variance,
            'performance_risk': risk_category
        })
    
    training_df = pd.DataFrame(ml_data)
    
    # Display risk distribution
    risk_counts = training_df['performance_risk'].value_counts()
    logger.info(f"Training data risk distribution: Low={risk_counts.get(0,0)}, Medium={risk_counts.get(1,0)}, High={risk_counts.get(2,0)}")
    
    return training_df

# Thread pool for async operations
executor = ThreadPoolExecutor(max_workers=4)

@app.post("/api/train-advanced")
async def train_advanced_model(background_tasks: BackgroundTasks):
    """Train advanced model with comprehensive approach"""
    background_tasks.add_task(_train_advanced_model_task)
    return {"message": "Advanced model training started in background", "status": "processing"}

@app.post("/train-advanced-task")
async def _train_advanced_model_task():
    """Background task for training advanced model"""
    try:
        logger.info("Starting advanced model training...")
        
        # Get data
        df = get_enhanced_student_data_from_db()
        
        if df.empty:
            logger.error("No data available for training")
            return
        
        # Create ML training data
        ml_data = create_realistic_ml_training_data()
        
        if ml_data.empty:
            logger.error("Failed to create training data")
            return
        
        # Train performance predictor
        logger.info("Training performance predictor...")
        metrics = performance_predictor.train_ensemble(ml_data)
        
        # Train anomaly detector
        logger.info("Training anomaly detector...")
        anomaly_trained = anomaly_detector.train_with_clustering(df)
        
        # Save models
        _save_models()
        
        logger.info(f"Advanced model training complete. Best model: {performance_predictor.active_model}")
        logger.info(f"Performance metrics: {metrics}")
        
    except Exception as e:
        logger.error(f"Error in advanced model training: {e}")

def _save_models():
    """Save trained models"""
    try:
        model_dir = 'ml_models'
        os.makedirs(model_dir, exist_ok=True)
        
        # Save performance model
        joblib.dump(
            performance_predictor.models[performance_predictor.active_model],
            os.path.join(model_dir, 'student_performance_model.joblib')
        )
        
        # Save scaler
        joblib.dump(
            performance_predictor.scaler,
            os.path.join(model_dir, 'scaler.joblib')
        )
        
        # Save feature importance
        if performance_predictor.feature_importance is not None:
            joblib.dump(
                performance_predictor.feature_importance,
                os.path.join(model_dir, 'feature_importance.joblib')
            )
        
        logger.info("Models saved successfully")
    except Exception as e:
        logger.error(f"Error saving models: {e}")

@app.get("/api/model-metrics")
async def get_model_metrics():
    """Get metrics for all trained models"""
    return {
        "performance_model": {
            "is_trained": performance_predictor.is_trained,
            "active_model": performance_predictor.active_model,
            "metrics": performance_predictor.model_metrics,
            "training_history": [
                {
                    "timestamp": h['timestamp'].isoformat(),
                    "samples": h['samples'],
                    "best_model": h['best_model'],
                    "accuracy": h['metrics'].get('accuracy', 0)
                }
                for h in performance_predictor.training_history[-5:]  # Last 5 trainings
            ]
        },
        "anomaly_detector": {
            "is_trained": anomaly_detector.is_trained,
            "clusters": anomaly_detector.cluster_profiles,
            "score_range": {
                "min": float(np.min(anomaly_detector.score_distribution)) if anomaly_detector.score_distribution is not None else 0,
                "max": float(np.max(anomaly_detector.score_distribution)) if anomaly_detector.score_distribution is not None else 0
            }
        }
    }

@app.get("/api/student-risk-advanced/{student_id}")
async def get_student_risk_advanced(student_id: str):
    """Get advanced risk assessment for a specific student"""
    try:
        df = get_enhanced_student_data_from_db()
        student = df[df['id'] == student_id]
        
        if student.empty:
            raise HTTPException(status_code=404, detail="Student not found")
        
        # Get basic prediction
        prediction = performance_predictor.predict_with_explanations(student)
        
        # Get anomaly detection
        student_data = student.iloc[0].to_dict()
        anomaly = anomaly_detector.detect_anomaly_with_context(student_data)
        
        # Calculate overall risk score
        risk_scores = {'low': 0, 'medium': 1, 'high': 2}
        performance_risk = risk_scores[prediction['risk']]
        anomaly_risk = 2 if anomaly['severity'] == 'high' else 1 if anomaly['severity'] == 'medium' else 0
        
        overall_risk_score = (performance_risk * 0.7 + anomaly_risk * 0.3)
        overall_risk = 'high' if overall_risk_score > 1.5 else 'medium' if overall_risk_score > 0.5 else 'low'
        
        # Generate comprehensive report
        report = {
            "student_info": {
                "id": student_id,
                "name": str(student_data['name']),
                "department": str(student_data.get('department', 'Unknown')),
                "cgpa": float(student_data['cgpa']),
                "attendance": float(student_data['attendance']),
                "assignment_score": float(student_data.get('avg_submission_score', 0)),
                "total_submissions": int(student_data.get('total_submissions', 0))
            },
            "performance_analysis": prediction,
            "attendance_analysis": anomaly,
            "overall_assessment": {
                "risk_level": overall_risk,
                "risk_score": float(overall_risk_score),
                "confidence": float((prediction['confidence'] + anomaly['confidence']) / 2),
                "priority": "high" if overall_risk == 'high' else "medium" if overall_risk == 'medium' else "low",
                "summary": _generate_summary(prediction, anomaly)
            },
            "intervention_plan": _create_intervention_plan(prediction, anomaly),
            "monitoring_schedule": _create_monitoring_schedule(overall_risk)
        }
        
        return report
    except Exception as e:
        logger.error(f"Error in advanced risk assessment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def _generate_summary(performance: Dict, anomaly: Dict) -> str:
    """Generate summary of student's situation"""
    if performance['risk'] == 'high' or anomaly['severity'] == 'high':
        return "Critical attention needed. Student shows multiple risk factors requiring immediate intervention."
    elif performance['risk'] == 'medium' or anomaly['severity'] == 'medium':
        return "Moderate concern. Student shows some risk factors that should be addressed proactively."
    else:
        return "Good standing. Student performance is within expected ranges."

def _create_intervention_plan(performance: Dict, anomaly: Dict) -> List[Dict]:
    """Create comprehensive intervention plan"""
    interventions = []
    
    # Add performance interventions
    for rec in performance.get('recommendations', []):
        interventions.append({
            "type": "performance",
            "action": rec['action'],
            "priority": rec['priority'],
            "impact": rec.get('impact', 'medium'),
            "timeframe": "1-2 weeks"
        })
    
    # Add attendance interventions
    for rec in anomaly.get('recommendations', []):
        if rec['priority'] != 'low':  # Only include significant recommendations
            interventions.append({
                "type": "attendance",
                "action": rec['action'],
                "priority": rec['priority'],
                "timeframe": rec['timeframe']
            })
    
    # Sort by priority
    priority_order = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}
    interventions.sort(key=lambda x: priority_order.get(x['priority'], 4))
    
    return interventions[:5]

def _create_monitoring_schedule(risk_level: str) -> Dict:
    """Create monitoring schedule based on risk level"""
    schedules = {
        'high': {
            "frequency": "daily",
            "checkpoints": ["Morning attendance", "Assignment submissions", "Weekly progress review"],
            "stakeholders": ["Academic advisor", "Department head", "Parents"],
            "duration": "Until significant improvement shown"
        },
        'medium': {
            "frequency": "weekly",
            "checkpoints": ["Weekly attendance review", "Assignment completion", "Monthly progress meeting"],
            "stakeholders": ["Academic advisor", "Mentor"],
            "duration": "4-6 weeks"
        },
        'low': {
            "frequency": "monthly",
            "checkpoints": ["Monthly performance review", "Semester progress"],
            "stakeholders": ["Academic advisor"],
            "duration": "Ongoing"
        }
    }
    
    return schedules.get(risk_level, schedules['low'])

@app.get("/monitoring/health")
async def model_health():
    """Comprehensive model health monitoring endpoint"""
    return performance_predictor.get_model_health()

@app.get("/monitoring/drift")
async def check_data_drift():
    """Check for data drift in the model"""
    if not performance_predictor.is_trained:
        raise HTTPException(status_code=400, detail="Model not trained")
    
    # Get recent data for drift detection
    try:
        recent_data = get_enhanced_student_data_from_db(limit=50)
        if len(recent_data) < 10:
            return {"drift_detected": False, "message": "Insufficient data for drift detection"}
        
        # Prepare features
        recent_features = performance_predictor.prepare_features(recent_data)
        
        # For this example, we'll use synthetic training data features
        # In production, you'd store the original training features
        from sklearn.datasets import make_classification
        X_train, _ = make_classification(n_samples=100, n_features=recent_features.shape[1], 
                                       n_classes=3, random_state=42)
        
        drift_result = performance_predictor.detect_data_drift(X_train, recent_features)
        return drift_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Drift detection failed: {str(e)}")

@app.get("/explain/{student_id}")
async def get_student_explanations(student_id: str):
    """Get SHAP explanations for a specific student"""
    if not performance_predictor.is_trained:
        raise HTTPException(status_code=400, detail="Model not trained")
    
    try:
        student_data = get_enhanced_student_data_from_db(student_id)
        if student_data.empty:
            raise HTTPException(status_code=404, detail="Student not found")
        
        explanations = performance_predictor.get_shap_explanations(student_data)
        return explanations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Explanation failed: {str(e)}")

@app.post("/train-enhanced")
async def train_enhanced_models():
    """Train enhanced models with all improvements"""
    try:
        # Get training data
        training_data = get_enhanced_student_data_from_db()
        
        if len(training_data) < 20:
            # Generate synthetic data if insufficient
            synthetic_data = generate_enhanced_synthetic_data(200)
            training_data = pd.concat([training_data, synthetic_data], ignore_index=True)
        
        # Train enhanced ensemble
        metrics = performance_predictor.train_enhanced_ensemble(training_data)
        
        # Train anomaly detector
        anomaly_trained = anomaly_detector.train_with_clustering(training_data)
        
        # Save models with metadata
        performance_predictor.save_model_with_metadata()
        
        return {
            "status": "success",
            "performance_metrics": metrics,
            "anomaly_detector_trained": anomaly_trained,
            "model_version": performance_predictor.model_metadata['version'],
            "features_used": len(FEATURE_CONFIG['all']()),
            "ensemble_active": performance_predictor.ensemble_model is not None,
            "feature_selection": performance_predictor.feature_selector is not None,
            "shap_available": SHAP_AVAILABLE and performance_predictor.shap_explainer is not None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Enhanced Student Performance ML API is running", "version": "2.0.0"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "performance_model_trained": performance_predictor.is_trained,
        "anomaly_model_trained": anomaly_detector.is_trained,
        "features": {
            "smote_available": SMOTE_AVAILABLE,
            "shap_available": SHAP_AVAILABLE,
            "ensemble_active": performance_predictor.ensemble_model is not None,
            "feature_selection": performance_predictor.feature_selector is not None
        }
    }

@app.get("/analytics/overview")
async def get_analytics_overview():
    """Get analytics overview for dashboard"""
    try:
        df = get_enhanced_student_data_from_db()
        
        if df.empty:
            return {
                "totalStudents": 0,
                "avgAttendance": 0,
                "avgCGPA": 0,
                "riskDistribution": {"low": 0, "medium": 0, "high": 0},
                "performanceTrends": [],
                "departmentStats": []
            }
        
        # Calculate basic statistics
        total_students = len(df)
        avg_attendance = df['attendance'].mean() if 'attendance' in df.columns else 75
        avg_cgpa = df['cgpa'].mean() if 'cgpa' in df.columns else 6.0
        avg_assignment_score = df['avg_submission_score'].mean() if 'avg_submission_score' in df.columns else 60
        
        # Get risk distribution from training data
        ml_data = create_realistic_ml_training_data()
        risk_counts = {"low": 0, "medium": 0, "high": 0}
        
        if not ml_data.empty and performance_predictor.is_trained:
            risk_distribution = ml_data['performance_risk'].value_counts()
            risk_counts["low"] = int(risk_distribution.get(0, 0))
            risk_counts["medium"] = int(risk_distribution.get(1, 0))
            risk_counts["high"] = int(risk_distribution.get(2, 0))
        
        # Generate performance trends (mock data for demonstration)
        performance_trends = [
            {"month": "Jan", "avgScore": avg_cgpa - 0.2, "attendance": avg_attendance - 3},
            {"month": "Feb", "avgScore": avg_cgpa - 0.1, "attendance": avg_attendance - 2},
            {"month": "Mar", "avgScore": avg_cgpa, "attendance": avg_attendance - 1},
            {"month": "Apr", "avgScore": avg_cgpa + 0.1, "attendance": avg_attendance},
            {"month": "May", "avgScore": avg_cgpa + 0.2, "attendance": avg_attendance + 1},
            {"month": "Jun", "avgScore": avg_cgpa + 0.3, "attendance": avg_attendance + 2}
        ]
        
        # Department statistics
        if 'department' in df.columns:
            dept_stats = df.groupby('department').agg({
                'cgpa': 'mean',
                'attendance': 'mean',
                'avg_submission_score': 'mean'
            }).reset_index()
            
            department_stats = []
            for _, dept in dept_stats.iterrows():
                department_stats.append({
                    "department": dept['department'],
                    "avgCGPA": round(dept['cgpa'], 2),
                    "avgAttendance": round(dept['attendance'], 2),
                    "avgAssignmentScore": round(dept['avg_submission_score'], 2),
                    "studentCount": len(df[df['department'] == dept['department']])
                })
        else:
            department_stats = []
        
        return {
            "totalStudents": total_students,
            "avgAttendance": round(avg_attendance, 2),
            "avgCGPA": round(avg_cgpa, 2),
            "avgAssignmentScore": round(avg_assignment_score, 2),
            "riskDistribution": risk_counts,
            "performanceTrends": performance_trends,
            "departmentStats": department_stats,
            "modelTrained": performance_predictor.is_trained
        }
    except Exception as e:
        logger.error(f"Error in analytics overview: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/department-stats")
async def get_department_stats():
    """Get statistics by department"""
    try:
        df = get_enhanced_student_data_from_db()
        
        if df.empty or 'department' not in df.columns:
            return {"departments": []}
        
        # Fill missing values
        df['avg_submission_score'] = df['avg_submission_score'].fillna(0)
        
        departments = []
        for dept_name in df['department'].unique():
            dept_students = df[df['department'] == dept_name]
            
            # Calculate statistics
            avg_cgpa = dept_students['cgpa'].mean()
            avg_attendance = dept_students['attendance'].mean()
            avg_assignment_score = dept_students['avg_submission_score'].mean()
            
            # Calculate risk distribution with updated criteria - balanced approach
            high_risk = len(dept_students[
                (dept_students['cgpa'] < 6.0) & (dept_students['attendance'] < 75) |  # Both poor
                (dept_students['cgpa'] < 5.0) |                                      # Extremely low CGPA
                (dept_students['attendance'] < 60)                                    # Extremely poor attendance
            ])
            medium_risk = len(dept_students[
                (dept_students['cgpa'] >= 6.0) & (dept_students['cgpa'] < 7.5) & (dept_students['attendance'] >= 75) |
                (dept_students['cgpa'] >= 6.0) & (dept_students['attendance'] >= 60) & (dept_students['attendance'] < 75)
            ])
            low_risk = len(dept_students) - high_risk - medium_risk
            
            # Get ALL students for this department
            all_dept_students = dept_students[['id', 'name', 'rollNo', 'cgpa', 'attendance', 'avg_submission_score']].to_dict('records')
            
            # Sort by CGPA for consistent ordering
            all_dept_students.sort(key=lambda x: x['cgpa'], reverse=True)
            
            departments.append({
                "department": dept_name,
                "studentCount": len(dept_students),
                "avgCGPA": round(avg_cgpa, 2),
                "avgAttendance": round(avg_attendance, 2),
                "avgAssignmentScore": round(avg_assignment_score, 2),
                "riskDistribution": {
                    "low": low_risk,
                    "medium": medium_risk,
                    "high": high_risk
                },
                "topStudents": [
                    {
                        "id": student["id"],
                        "name": student["name"],
                        "rollNo": student.get("rollNo") if pd.notna(student.get("rollNo")) else f"{get_department_code(dept_name)}{str(i+1).zfill(3)}",
                        "cgpa": round(student["cgpa"], 2),
                        "attendance": round(student["attendance"], 2),
                        "avgAssignmentScore": round(student["avg_submission_score"], 2)
                    } for i, student in enumerate(all_dept_students[:10])  # Top 10 by CGPA
                ],
                "atRiskStudents": [
                    {
                        "id": student["id"],
                        "name": student["name"],
                        "rollNo": student.get("rollNo") if pd.notna(student.get("rollNo")) else f"{get_department_code(dept_name)}{str(i+1).zfill(3)}",
                        "cgpa": round(student["cgpa"], 2),
                        "attendance": round(student["attendance"], 2),
                        "avgAssignmentScore": round(student["avg_submission_score"], 2)
                    } for i, student in enumerate(all_dept_students[-10:])  # Bottom 10 by CGPA
                ],
                "allStudents": [
                    {
                        "id": student["id"],
                        "name": student["name"],
                        "rollNo": student.get("rollNo") if pd.notna(student.get("rollNo")) else f"{get_department_code(dept_name)}{str(i+1).zfill(3)}",
                        "cgpa": round(student["cgpa"], 2),
                        "attendance": round(student["attendance"], 2),
                        "avgAssignmentScore": round(student["avg_submission_score"], 2)
                    } for i, student in enumerate(all_dept_students)
                ]
            })
        
        return {"departments": departments}
    except Exception as e:
        logger.error(f"Error in department stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/student-performance-stats")
async def get_performance_stats():
    """Get overall student performance statistics"""
    try:
        df = get_enhanced_student_data_from_db()
        
        if df.empty:
            return {"message": "No student data available"}
        
        # Calculate basic statistics
        total_students = len(df)
        avg_attendance = df['attendance'].mean() if 'attendance' in df.columns else 75
        avg_cgpa = df['cgpa'].mean() if 'cgpa' in df.columns else 6.0
        avg_assignment_score = df['avg_submission_score'].mean() if 'avg_submission_score' in df.columns else 60
        
        # Get risk distribution from training data
        ml_data = create_realistic_ml_training_data()
        risk_counts = {"low": 0, "medium": 0, "high": 0}
        
        if not ml_data.empty and performance_predictor.is_trained:
            risk_distribution = ml_data['performance_risk'].value_counts()
            risk_counts["low"] = int(risk_distribution.get(0, 0))
            risk_counts["medium"] = int(risk_distribution.get(1, 0))
            risk_counts["high"] = int(risk_distribution.get(2, 0))
        
        return {
            "total_students": total_students,
            "avg_attendance": round(avg_attendance, 2),
            "avg_cgpa": round(avg_cgpa, 2),
            "avg_assignment_score": round(avg_assignment_score, 2),
            "risk_distribution": risk_counts,
            "model_trained": performance_predictor.is_trained
        }
    except Exception as e:
        logger.error(f"Error in performance stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/student-clusters")
async def get_student_clusters():
    """Get student clusters identified by the anomaly detector"""
    if not anomaly_detector.is_trained:
        return {"clusters": [], "message": "Model not trained"}
    
    clusters = []
    for cluster_id, profile in anomaly_detector.cluster_profiles.items():
        clusters.append({
            "cluster_id": int(cluster_id),
            "size": profile['size'],
            "description": profile['description'],
            "avg_attendance": float(profile['avg_attendance']),
            "avg_cgpa": float(profile['avg_cgpa']),
            "anomaly_rate": profile['size'] / sum(p['size'] for p in anomaly_detector.cluster_profiles.values())
        })
    
    return {"clusters": clusters}

@app.get("/analytics/feature-importance")
async def get_feature_importance():
    """Get feature importance from the trained model"""
    if not performance_predictor.is_trained or performance_predictor.feature_importance is None:
        return {"features": [], "message": "Model not trained"}
    
    feature_names = [
        'Attendance', 'CGPA', 'Fees Status', 'Assignment Completion',
        'Average Score', 'Class Participation', 'Previous GPA',
        'Study Hours', 'Extracurricular', 'Performance Trend',
        'Submission Consistency', 'Grade Variance',
        'Academic Score', 'Attendance Consistency',
        'Composite Risk', 'Attendance-CGPA Interaction'
    ]
    
    features = []
    for i, (name, importance) in enumerate(zip(feature_names, performance_predictor.feature_importance)):
        features.append({
            "feature": name,
            "importance": float(importance),
            "rank": i + 1
        })
    
    # Sort by importance
    features.sort(key=lambda x: x['importance'], reverse=True)
    
    return {"features": features}

@app.get("/analytics/attendance-anomaly/{student_id}")
async def get_attendance_anomaly(student_id: str):
    """Get attendance anomaly analysis for a specific student"""
    try:
        # Get student data from database
        df = get_enhanced_student_data_from_db()
        student_data = df[df['id'] == student_id]
        
        if student_data.empty:
            raise HTTPException(status_code=404, detail="Student not found")
        
        # Convert to dict for anomaly detection
        student_dict = student_data.iloc[0].to_dict()
        
        # Detect anomaly with context
        anomaly_result = anomaly_detector.detect_anomaly_with_context(student_dict)
        
        return anomaly_result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in attendance anomaly detection: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Load models on startup
print("🔄 Loading enhanced ML models...")
performance_predictor.load_model()

# Train models in background
@app.on_event("startup")
async def startup_event():
    """Initialize models on startup"""
    print("🚀 Starting enhanced ML service initialization...")
    
    # Load existing models
    model_loaded = performance_predictor.load_model()
    
    if not model_loaded:
        print("⚡ No pre-trained model found, training new model...")
        # Start training in background
        asyncio.create_task(_train_advanced_model_task())
    else:
        print("✅ Pre-trained model loaded successfully")
        
        # Train anomaly detector with current data
        try:
            df = get_enhanced_student_data_from_db()
            if not df.empty:
                print("🔍 Training anomaly detector...")
                trained = anomaly_detector.train_with_clustering(df)
                print(f"✅ Anomaly detector trained: {trained}")
        except Exception as e:
            print(f"❌ Failed to train anomaly detector: {e}")

print("🚀 Enhanced ML service ready!")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)