import os
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from .train_model import get_abo_score

MODEL_DIR = Path(__file__).resolve().parent / 'saved_models'

class StemCellPredictor:
    def __init__(self):
        self.rf_model = None
        self.dt_model = None
        self.metadata = None
        self.load_models()

    def load_models(self):
        rf_path = MODEL_DIR / 'random_forest_model.joblib'
        dt_path = MODEL_DIR / 'decision_tree_model.joblib'
        meta_path = MODEL_DIR / 'model_metadata.joblib'

        if rf_path.exists() and dt_path.exists() and meta_path.exists():
            self.rf_model = joblib.load(rf_path)
            self.dt_model = joblib.load(dt_path)
            self.metadata = joblib.load(meta_path)
        else:
            raise FileNotFoundError('Trained models not found. Please run train_model.py first.')

    def predict(self, p_age, d_age, p_bg, d_bg, hla_match, cd34_count, viability, storage_months=12, disease_str='Leukemia'):
        diseases = ['Leukemia', 'Aplastic Anemia', 'Lymphoma', 'Thalassemia', 'Sickle Cell Disease', 'Multiple Myeloma']
        disease_idx = diseases.index(disease_str) if disease_str in diseases else 0

        age_diff = abs(int(p_age) - int(d_age))
        abo_score = get_abo_score(d_bg, p_bg)
        hla_match = int(hla_match)
        cd34_count = float(cd34_count)
        viability = float(viability)
        storage_months = int(storage_months)

        feature_df = pd.DataFrame([{
            'patient_age': int(p_age),
            'donor_age': int(d_age),
            'age_diff': age_diff,
            'abo_score': abo_score,
            'hla_match': hla_match,
            'cd34_count': cd34_count,
            'viability': viability,
            'storage_months': storage_months,
            'disease_idx': disease_idx
        }])

        # Random Forest prediction
        rf_pred = int(self.rf_model.predict(feature_df)[0])
        rf_probs = self.rf_model.predict_proba(feature_df)[0].tolist()

        # Decision Tree prediction
        dt_pred = int(self.dt_model.predict(feature_df)[0])
        dt_probs = self.dt_model.predict_proba(feature_df)[0].tolist()

        classes = {
            0: {'title': 'Incompatible', 'badge': 'danger', 'desc': 'High risk of graft rejection or severe GVHD.'},
            1: {'title': 'Conditional Match', 'badge': 'warning', 'desc': 'Acceptable match. Requires immunosuppressive monitoring.'},
            2: {'title': 'High Compatibility', 'badge': 'success', 'desc': 'Optimal match. High likelihood of successful engraftment.'}
        }

        # Calculate engraftment probability
        engraftment_chance = round((rf_probs[2] * 0.7 + (hla_match / 10.0) * 0.3) * 100, 1)

        return {
            'random_forest': {
                'prediction_class': rf_pred,
                'verdict': classes[rf_pred]['title'],
                'badge': classes[rf_pred]['badge'],
                'description': classes[rf_pred]['desc'],
                'probabilities': {
                    'incompatible': round(rf_probs[0] * 100, 1),
                    'conditional': round(rf_probs[1] * 100, 1),
                    'high_match': round(rf_probs[2] * 100, 1),
                },
                'model_accuracy': round(self.metadata['rf_accuracy'] * 100, 1)
            },
            'decision_tree': {
                'prediction_class': dt_pred,
                'verdict': classes[dt_pred]['title'],
                'badge': classes[dt_pred]['badge'],
                'description': classes[dt_pred]['desc'],
                'probabilities': {
                    'incompatible': round(dt_probs[0] * 100, 1),
                    'conditional': round(dt_probs[1] * 100, 1),
                    'high_match': round(dt_probs[2] * 100, 1),
                },
                'model_accuracy': round(self.metadata['dt_accuracy'] * 100, 1)
            },
            'engraftment_score': engraftment_chance,
            'input_summary': {
                'patient_age': p_age,
                'donor_age': d_age,
                'age_diff': age_diff,
                'abo_compatibility': 'Compatible' if abo_score >= 0.8 else 'Incompatible',
                'hla_match': f'{hla_match}/10',
                'cd34_count': f'{cd34_count} x10^6 cells/kg',
                'viability': f'{viability}%',
                'disease': disease_str
            },
            'feature_importances': self.metadata['rf_importances']
        }

predictor = StemCellPredictor()
