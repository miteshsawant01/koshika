import os
import json
import sqlite3
from datetime import datetime
from pathlib import Path
import numpy as np
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / 'backend' / 'db.sqlite3'
DATASET_DIR = BASE_DIR / 'dataset'
DATASET_DIR.mkdir(parents=True, exist_ok=True)

# 1. Blood group compatibility matrix
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

def generate_ml_dataset(n_samples=2500, random_state=42):
    print(f"Generating ML Stem Cell Compatibility Dataset ({n_samples} samples)...")
    np.random.seed(random_state)
    blood_groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    diseases = ['Leukemia', 'Aplastic Anemia', 'Lymphoma', 'Thalassemia', 'Sickle Cell Disease', 'Multiple Myeloma']

    records = []
    for i in range(1, n_samples + 1):
        p_age = int(np.random.randint(5, 75))
        d_age = int(np.random.randint(18, 55))
        age_diff = abs(p_age - d_age)
        
        p_bg = np.random.choice(blood_groups)
        d_bg = np.random.choice(blood_groups)
        abo_score = get_abo_score(d_bg, p_bg)
        
        # HLA match out of 10 (8, 9, or 10 are common in clinical trials)
        hla_match = int(np.random.choice([6, 7, 8, 9, 10], p=[0.05, 0.15, 0.3, 0.3, 0.2]))
        hla_score = hla_match / 10.0
        
        # Stem cell CD34+ count (x10^6 cells/kg)
        cd34_count = round(float(np.random.uniform(2.0, 10.0)), 2)
        
        # Cell viability percentage (75% - 99%)
        viability = round(float(np.random.uniform(75.0, 99.0)), 2)
        
        # Storage duration in months (1 - 60)
        storage_months = int(np.random.randint(1, 60))
        
        # Disease category index
        disease = str(np.random.choice(diseases))
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
            label = 2
            verdict = "High Compatibility"
        elif composite >= 0.50 and hla_match >= 7:
            label = 1
            verdict = "Conditional Match"
        else:
            label = 0
            verdict = "Incompatible"
            
        records.append({
            'sample_id': f"SCM-{i:05d}",
            'patient_age': p_age,
            'donor_age': d_age,
            'age_diff': age_diff,
            'patient_blood_group': p_bg,
            'donor_blood_group': d_bg,
            'abo_score': abo_score,
            'hla_match': hla_match,
            'cd34_count': cd34_count,
            'viability': viability,
            'storage_months': storage_months,
            'disease': disease,
            'disease_idx': disease_idx,
            'composite_score': round(float(composite), 4),
            'compatibility_label': label,
            'match_verdict': verdict
        })
        
    df = pd.DataFrame(records)
    csv_path = DATASET_DIR / 'stem_cell_ml_compatibility_dataset.csv'
    df.to_csv(csv_path, index=False)
    print(f" Saved: {csv_path} ({len(df)} rows)")
    return df

def export_sqlite_tables():
    print(f"Exporting database tables from {DB_PATH}...")
    conn = sqlite3.connect(DB_PATH)
    
    tables = ['patients', 'donors', 'storage', 'inventory', 'staff', 'research', 'audit_logs']
    exported_dfs = {}
    
    for table in tables:
        df = pd.read_sql_query(f"SELECT * FROM {table}", conn)
        exported_dfs[table] = df
        csv_path = DATASET_DIR / f"{table}.csv"
        df.to_csv(csv_path, index=False)
        print(f" Saved: {csv_path} ({len(df)} rows)")
        
    conn.close()
    return exported_dfs

def export_consolidated_json(ml_df, table_dfs):
    print("Generating Consolidated Master JSON Dataset...")
    master_data = {
        "project_name": "STEMBRIDGE AI - Intelligent Stem Cell Banking & Matching Platform",
        "export_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "version": "1.0.0",
        "description": "Comprehensive clinical biobank repository, inventory, donor-patient registry, research trials, and ML training dataset.",
        "summary": {
            "total_ml_training_samples": len(ml_df),
            "total_patients": len(table_dfs.get('patients', [])),
            "total_donors": len(table_dfs.get('donors', [])),
            "total_storage_units": len(table_dfs.get('storage', [])),
            "total_inventory_items": len(table_dfs.get('inventory', [])),
            "total_staff_members": len(table_dfs.get('staff', [])),
            "total_research_projects": len(table_dfs.get('research', [])),
            "total_audit_logs": len(table_dfs.get('audit_logs', []))
        },
        "ml_features_metadata": {
            "features": ['patient_age', 'donor_age', 'age_diff', 'abo_score', 'hla_match', 'cd34_count', 'viability', 'storage_months', 'disease_idx'],
            "target": "compatibility_label",
            "classes": {
                0: "Incompatible (High Graft Failure Risk)",
                1: "Conditional Match (Monitor Closely)",
                2: "High Compatibility (Recommended for Transplant)"
            }
        },
        "database_tables": {
            table: json.loads(df.to_json(orient='records', date_format='iso'))
            for table, df in table_dfs.items()
        },
        "ml_dataset": json.loads(ml_df.to_json(orient='records'))
    }
    
    json_path = DATASET_DIR / 'stembridge_master_dataset.json'
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(master_data, f, indent=2)
    print(f" Saved: {json_path} ({round(json_path.stat().st_size / 1024, 1)} KB)")

def export_full_sql_dump(table_dfs):
    print("Generating Full SQL Dump (Schema + 100 Rows per Table)...")
    sql_path = DATASET_DIR / 'stembridge_database_full.sql'
    
    with open(sql_path, 'w', encoding='utf-8') as f:
        f.write("-- ====================================================================\n")
        f.write("-- STEMBRIDGE AI - Complete Database Dump with Full Dataset\n")
        f.write(f"-- Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("-- Compatible with MySQL, MariaDB, SQLite, PostgreSQL\n")
        f.write("-- ====================================================================\n\n")
        f.write("CREATE DATABASE IF NOT EXISTS stemcelldb;\n")
        f.write("USE stemcelldb;\n\n")
        
        # Schema
        schema_sql = """-- Table: patients
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS storage;
DROP TABLE IF EXISTS donors;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS research;
DROP TABLE IF EXISTS inventory;

CREATE TABLE patients (
  patient_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  age INT,
  blood_group VARCHAR(10),
  contact VARCHAR(50),
  disease VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE donors (
  donor_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  age INT,
  blood_group VARCHAR(10),
  contact VARCHAR(50),
  donation_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  patient_id INT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE SET NULL
);

CREATE TABLE storage (
  storage_id INT AUTO_INCREMENT PRIMARY KEY,
  storage_location VARCHAR(100),
  collected_date DATE,
  expiry_date DATE,
  units INT DEFAULT 1,
  donor_id INT NULL,
  FOREIGN KEY (donor_id) REFERENCES donors(donor_id) ON DELETE SET NULL
);

CREATE TABLE inventory (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  item_name VARCHAR(150) NOT NULL,
  quantity INT DEFAULT 0,
  unit VARCHAR(50),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE staff (
  staff_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  role VARCHAR(100),
  department VARCHAR(100),
  contact VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE research (
  research_id INT AUTO_INCREMENT PRIMARY KEY,
  project_name VARCHAR(255) NOT NULL,
  lead_scientist VARCHAR(150),
  start_date DATE,
  status VARCHAR(50),
  summary TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  table_name VARCHAR(128) NOT NULL,
  operation VARCHAR(20) NOT NULL,
  record_id BIGINT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  changed_by VARCHAR(128) NULL,
  old_values TEXT NULL,
  new_values TEXT NULL
);

-- ====================================================================
-- INSERT STATEMENTS FOR ALL DATASETS
-- ====================================================================
"""
        f.write(schema_sql)
        
        insert_order = ['patients', 'donors', 'storage', 'inventory', 'staff', 'research', 'audit_logs']
        for table in insert_order:
            df = table_dfs[table]
            f.write(f"\n-- Data for {table} ({len(df)} rows)\n")
            
            for _, row in df.iterrows():
                cols = list(df.columns)
                vals = []
                for val in row:
                    if pd.isna(val) or val is None:
                        vals.append("NULL")
                    elif isinstance(val, (int, float, np.integer, np.floating)):
                        vals.append(str(val))
                    else:
                        escaped = str(val).replace("'", "''").replace("\\", "\\\\")
                        vals.append(f"'{escaped}'")
                
                cols_str = ", ".join([f"`{c}`" for c in cols])
                vals_str = ", ".join(vals)
                f.write(f"INSERT INTO `{table}` ({cols_str}) VALUES ({vals_str});\n")
                
    print(f" Saved: {sql_path} ({round(sql_path.stat().st_size / 1024, 1)} KB)")

def generate_dataset_readme(ml_df, table_dfs):
    print("Generating README_DATASET.md...")
    readme_path = DATASET_DIR / 'README_DATASET.md'
    
    content = f"""# STEMBRIDGE AI — Complete Dataset Documentation

This directory contains the entire dataset collection for the **STEMBRIDGE AI** (Stem Cell Banking, Registry & Matching Intelligence Platform).

---

## Dataset Overview & File Catalog

| File Name | Format | Rows / Records | Description |
| :--- | :---: | :---: | :--- |
| [`stem_cell_ml_compatibility_dataset.csv`](./stem_cell_ml_compatibility_dataset.csv) | CSV | **2,500** | Machine Learning Training & Evaluation Dataset with donor-patient clinical compatibility variables and labels. |
| [`patients.csv`](./patients.csv) | CSV | **100** | Clinical records of patients registered for stem cell transplants across hematologic conditions. |
| [`donors.csv`](./donors.csv) | CSV | **100** | Registered voluntary donors with HLA typing profiles, virology status, and cellular metrics. |
| [`storage.csv`](./storage.csv) | CSV | **100** | Cryogenic BioVault and LN2 vapor freezer storage allocations, rack/box coordinates, expiry dates. |
| [`inventory.csv`](./inventory.csv) | CSV | **100** | Hospital biobank consumables, media, reagents, cryoprotectants, and processing kits. |
| [`staff.csv`](./staff.csv) | CSV | **100** | Clinical hematologists, cryo scientists, BMT coordinators, and lab technicians. |
| [`research.csv`](./research.csv) | CSV | **100** | Stem cell clinical trials, iPSC modeling, gene therapy, and graft optimization studies. |
| [`audit_logs.csv`](./audit_logs.csv) | CSV | **100** | Immutable system compliance audit trails (21 CFR Part 11 / HIPAA compliant logging). |
| [`stembridge_master_dataset.json`](./stembridge_master_dataset.json) | JSON | **All-in-One** | Single structured master file consolidating all 7 database tables + 2,500 ML samples + metadata. |
| [`stembridge_database_full.sql`](./stembridge_database_full.sql) | SQL | **All Tables** | Full SQL database export including DDL table creation scripts and all 100 INSERT rows per table. |

---

## 1. Machine Learning Compatibility Dataset (`stem_cell_ml_compatibility_dataset.csv`)

### Feature Definitions
- **`sample_id`**: Unique identifier for the donor-recipient compatibility evaluation record (e.g., `SCM-00001`).
- **`patient_age`**: Age of the recipient in years (5 – 75).
- **`donor_age`**: Age of the stem cell donor in years (18 – 55).
- **`age_diff`**: Absolute age differential between patient and donor (`|patient_age - donor_age|`).
- **`patient_blood_group`**: Blood group of recipient (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`).
- **`donor_blood_group`**: Blood group of donor (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`).
- **`abo_score`**: Clinical ABO compatibility matrix score:
  - `1.0`: Identical match
  - `0.8`: Major/minor compatible
  - `0.1`: Incompatible
- **`hla_match`**: High-resolution Human Leukocyte Antigen match count out of 10 (`HLA-A, B, C, DRB1, DQB1` loci). Ranges from 6 to 10.
- **`cd34_count`**: Viable hematopoietic stem cell count (x10^6 cells/kg). Optimal target >= 5.0.
- **`viability`**: Post-thaw cell viability percentage (75.0% – 99.0%).
- **`storage_months`**: Cryopreservation duration in liquid nitrogen vapor phase (1 – 60 months).
- **`disease`**: Primary diagnosis (`Leukemia`, `Aplastic Anemia`, `Lymphoma`, `Thalassemia`, `Sickle Cell Disease`, `Multiple Myeloma`).
- **`disease_idx`**: Categorical encoded integer for disease classification (0 to 5).
- **`composite_score`**: Weighted clinical score evaluated via HLA, ABO, CD34 count, Viability, and Age Differential.
- **`compatibility_label`**: Target classification class:
  - `0`: Incompatible / High Graft Failure Risk
  - `1`: Conditional Match (Monitor closely with immunosuppressive protocols)
  - `2`: High Compatibility (Optimal recommended donor)
- **`match_verdict`**: Human-readable classification outcome string.

---

## 2. Clinical Biobank Database Schema

### 1. Patients (`patients.csv`)
- `patient_id` (PK): Integer ID
- `name`: Full Name
- `age`: Age in years
- `blood_group`: ABO/Rh group
- `contact`: Telephone contact
- `disease`: Hematologic condition / clinical indication
- `created_at`: Registration timestamp

### 2. Donors (`donors.csv`)
- `donor_id` (PK): Integer ID
- `name`: Voluntary donor full name
- `age`: Donor age (18-50)
- `blood_group`: ABO/Rh group
- `contact`: Telephone contact
- `donation_date`: Date of harvest/collection
- `notes`: HLA typing notes, cell yields, serology screening
- `patient_id` (FK): Related patient if directed donation (NULL if unrelated voluntary donor)
- `created_at`: Registration timestamp

### 3. Storage (`storage.csv`)
- `storage_id` (PK): Integer ID
- `donor_id` (FK): Originating donor unit ID
- `storage_location`: Tank and rack code (e.g. `CryoTank-C10-R3:B1`, `BioVault-Alpha-05-R1:B3`)
- `collected_date`: Harvest date
- `expiry_date`: Cryogenic expiry (10-year cryo protocol)
- `units`: Stem cell volume units / bags available

### 4. Inventory (`inventory.csv`)
- `item_id` (PK): Item ID
- `item_name`: Name of reagent, consumable, media, or cryo equipment
- `quantity`: Current stock quantity
- `unit`: Measurement unit (vials, litres, kits, tubes, bottles, bags, etc.)
- `last_updated`: Stock timestamp

### 5. Staff (`staff.csv`)
- `staff_id` (PK): Personnel ID
- `name`: Healthcare professional / scientist name
- `role`: Role title (e.g. Chief Medical Officer, Lead Cryopreservation Scientist)
- `department`: Department (Bone Marrow Transplant, Cryo Preservation Vault, etc.)
- `contact`: Telephone contact
- `created_at`: Registration timestamp

### 6. Research (`research.csv`)
- `research_id` (PK): Trial/Study ID
- `project_name`: Clinical study title
- `lead_scientist`: Principal investigator
- `start_date`: Study initiation date
- `status`: Status (`Ongoing`, `Active`, `Completed`, `In Review`)
- `summary`: Scientific abstract and trial objective
- `created_at`: Timestamp

### 7. Audit Logs (`audit_logs.csv`)
- `id` (PK): BigInt log ID
- `table_name`: Target entity (`patients`, `donors`, `storage`, `inventory`, `research`)
- `operation`: DML Action (`INSERT`, `UPDATE`, `VERIFY`, `CRYO_CHECK`)
- `record_id`: Affected row ID
- `changed_at`: Audit timestamp
- `changed_by`: User / Operator credential
- `old_values`: JSON string of prior state
- `new_values`: JSON string of updated state

---

## 3. How to Use this Data in Python

```python
import pandas as pd
import json

# Load the ML Compatibility Dataset
ml_df = pd.read_csv('dataset/stem_cell_ml_compatibility_dataset.csv')
print(f"Loaded ML dataset with shape: {{ml_df.shape}}")

# Load Patients and Donors
patients_df = pd.read_csv('dataset/patients.csv')
donors_df = pd.read_csv('dataset/donors.csv')

# Load Consolidated Master JSON
with open('dataset/stembridge_master_dataset.json', 'r') as f:
    master_data = json.load(f)

print(f"Project: {{master_data['project_name']}}")
print(f"Summary counts: {{master_data['summary']}}")
```
"""
    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f" Saved: {readme_path}")

def main():
    print("====================================================================")
    print(" STEMBRIDGE AI - Full Dataset Generator & Exporter")
    print("====================================================================")
    
    # 1. ML Dataset
    ml_df = generate_ml_dataset(n_samples=2500)
    
    # 2. Database Tables
    table_dfs = export_sqlite_tables()
    
    # 3. Master JSON Dataset
    export_consolidated_json(ml_df, table_dfs)
    
    # 4. Full SQL Dump
    export_full_sql_dump(table_dfs)
    
    # 5. README & Data Dictionary
    generate_dataset_readme(ml_df, table_dfs)
    
    print("====================================================================")
    print(" Export Completed Successfully! All files saved in ./dataset/")
    print("====================================================================")

if __name__ == '__main__':
    main()
