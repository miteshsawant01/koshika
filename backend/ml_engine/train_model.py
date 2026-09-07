import os
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, classification_report

MODEL_DIR = Path(__file__).resolve().parent / 'saved_models'
MODEL_DIR.mkdir(parents=True, exist_ok=True)

# Blood group compatibility matrix (Donor -> Recipient)
# 1.0 = identical, 0.8 = compatible, 0.0 = incompatible
ABO_COMPAT = {
    ('O-', 'O-'): 1.0, ('O-', 'O+'): 0.8, ('O-', 'A-'): 0.8, ('O-', 'A+'): 0.8,
    ('O-', 'B-'): 0.8, ('O-', 'B+'): 0.8, ('O-', 'AB-'): 0.8, ('O-', 'AB+'): 0.8,
    ('O+', 'O+'): 1.0, ('O+', 'A+'): 0.8, ('O+', 'B+'): 0.8, ('O+', 'AB+'): 0.8,
    ('A-', 'A-'): 1.0, ('A-', 'A+'): 0.8, ('A-', 'AB-'): 0.8, ('A-', 'AB+'): 0.8,
    ('A+', 'A+'): 1.0, ('A+', 'AB+'): 0.8,
    ('B-', 'B-'): 1.0, ('B-', 'B+'): 0.8, ('B-', 'AB-'): 0.8, ('B-', 'AB+'): 0.8,
    ('B+', 'B+'): 1.0, ('B+', 'AB+'): 0.8,
    ('AB-', 'AB-'): 1.0, ('AB-', 'AB+'): 0.8,
    ('AB+', 'AB+'): 1.0,
}

def get_abo_score(donor_bg, patient_bg):
    d = donor_bg.strip().upper()
    p = patient_bg.strip().upper()
    return ABO_COMPAT.get((d, p), 0.1)

def generate_synthetic_dataset(n_samples=2500, random_state=42):
    np.random.seed(random_state)
    blood_groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    diseases = ['Leukemia', 'Aplastic Anemia', 'Lymphoma', 'Thalassemia', 'Sickle Cell Disease', 'Multiple Myeloma']

    records = []
    for _ in range(n_samples):
        p_age = np.random.randint(5, 75)
        d_age = np.random.randint(18, 55)
        age_diff = abs(p_age - d_age)
        
        p_bg = np.random.choice(blood_groups)
        d_bg = np.random.choice(blood_groups)
        abo_score = get_abo_score(d_bg, p_bg)
        
        # HLA match out of 10 (8, 9, or 10 are common in clinical trials)
        hla_match = np.random.choice([6, 7, 8, 9, 10], p=[0.05, 0.15, 0.3, 0.3, 0.2])
        hla_score = hla_match / 10.0
        
        # Stem cell CD34+ count (x10^6 cells/kg)
        cd34_count = np.random.uniform(2.0, 10.0)
        
        # Cell viability percentage (75% - 99%)
        viability = np.random.uniform(75.0, 99.0)
        
        # Storage duration in months (1 - 60)
        storage_months = np.random.randint(1, 60)
        
        # Disease category index
        disease = np.random.choice(diseases)
        disease_idx = diseases.index(disease)
        
        # Calculate composite clinical match score
        composite = (
            (hla_score * 0.40) +
            (abo_score * 0.25) +
            (min(cd34_count / 5.0, 1.0) * 0.15) +
            ((viability / 100.0) * 0.15) -
            (min(age_diff / 50.0, 0.5) * 0.05)
        )
        
        # Determine label: 2 = High Match, 1 = Conditional / Moderate, 0 = Incompatible
        if composite >= 0.72 and hla_match >= 8 and abo_score >= 0.8:
            label = 2  # High
        elif composite >= 0.50 and hla_match >= 7:
            label = 1  # Conditional
        else:
            label = 0  # Incompatible
            
        records.append({
            'patient_age': p_age,
            'donor_age': d_age,
            'age_diff': age_diff,
            'abo_score': abo_score,
            'hla_match': hla_match,
            'cd34_count': round(cd34_count, 2),
            'viability': round(viability, 2),
            'storage_months': storage_months,
            'disease_idx': disease_idx,
            'label': label
        })
        
    return pd.DataFrame(records)

def train_and_save():
    df = generate_synthetic_dataset()
    features = ['patient_age', 'donor_age', 'age_diff', 'abo_score', 'hla_match', 'cd34_count', 'viability', 'storage_months', 'disease_idx']
    X = df[features]
    y = df['label']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # 1. Random Forest Classifier
    rf = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
    rf.fit(X_train, y_train)
    rf_acc = accuracy_score(y_test, rf.predict(X_test))
    
    # 2. Decision Tree Classifier
    dt = DecisionTreeClassifier(max_depth=6, random_state=42)
    dt.fit(X_train, y_train)
    dt_acc = accuracy_score(y_test, dt.predict(X_test))
    
    print(f'Random Forest Accuracy: {rf_acc * 100:.2f}%')
    print(f'Decision Tree Accuracy: {dt_acc * 100:.2f}%')
    
    # Save models and metadata
    joblib.dump(rf, MODEL_DIR / 'random_forest_model.joblib')
    joblib.dump(dt, MODEL_DIR / 'decision_tree_model.joblib')
    
    metadata = {
        'features': features,
        'rf_accuracy': round(float(rf_acc), 4),
        'dt_accuracy': round(float(dt_acc), 4),
        'rf_importances': dict(zip(features, [round(float(v), 4) for v in rf.feature_importances_])),
        'dt_importances': dict(zip(features, [round(float(v), 4) for v in dt.feature_importances_])),
        'classes': {0: 'Incompatible (High Graft Failure Risk)', 1: 'Conditional Match (Monitor Closely)', 2: 'High Compatibility (Recommended)'}
    }
    joblib.dump(metadata, MODEL_DIR / 'model_metadata.joblib')
    print('Models saved successfully to', MODEL_DIR)

if __name__ == '__main__':
    train_and_save()
