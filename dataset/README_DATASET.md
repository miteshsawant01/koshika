# STEMBRIDGE AI — Complete Dataset Documentation

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
- `name`: Healthcare professional / specialist name
- `role`: Role title (e.g. Doctor, Senior Consultant)
- `department`: Department / Clinical focus
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
print(f"Loaded ML dataset with shape: {ml_df.shape}")

# Load Patients and Donors
patients_df = pd.read_csv('dataset/patients.csv')
donors_df = pd.read_csv('dataset/donors.csv')

# Load Consolidated Master JSON
with open('dataset/stembridge_master_dataset.json', 'r') as f:
    master_data = json.load(f)

print(f"Project: {master_data['project_name']}")
print(f"Summary counts: {master_data['summary']}")
```
