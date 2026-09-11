-- =============================================================
-- STEMBRIDGE AI - Supabase PostgreSQL Schema & Triggers
-- =============================================================
-- You can run this entire script directly in the Supabase Web Dashboard:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run.
-- =============================================================

-- Enable UUID extension (if needed for future auth/tokens)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------
-- 1. Table: patients
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS patients (
    patient_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    age INT,
    blood_group VARCHAR(10),
    contact VARCHAR(50),
    disease VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------
-- 2. Table: donors
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS donors (
    donor_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    age INT,
    blood_group VARCHAR(10),
    contact VARCHAR(50),
    donation_date DATE,
    notes TEXT,
    patient_id INT REFERENCES patients(patient_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------
-- 3. Table: storage (Cryo Vault)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS storage (
    storage_id SERIAL PRIMARY KEY,
    donor_id INT REFERENCES donors(donor_id) ON DELETE SET NULL,
    storage_location VARCHAR(100),
    collected_date DATE,
    expiry_date DATE,
    units INT DEFAULT 1
);

-- -------------------------------------------------------------
-- 4. Table: staff
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS staff (
    staff_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    role VARCHAR(100),
    department VARCHAR(100),
    contact VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------
-- 5. Table: research
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS research (
    research_id SERIAL PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    lead_scientist VARCHAR(150),
    start_date DATE,
    status VARCHAR(50) DEFAULT 'Active',
    summary TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------
-- 6. Table: inventory
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory (
    item_id SERIAL PRIMARY KEY,
    item_name VARCHAR(150) NOT NULL,
    quantity INT DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'pcs',
    last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------
-- 7. Table: audit_logs
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(128) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    record_id BIGINT,
    changed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    changed_by VARCHAR(128),
    old_values JSONB,
    new_values JSONB
);

-- -------------------------------------------------------------
-- Indexes for High Performance
-- -------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_patients_blood_group ON patients(blood_group);
CREATE INDEX IF NOT EXISTS idx_donors_blood_group ON donors(blood_group);
CREATE INDEX IF NOT EXISTS idx_donors_patient_id ON donors(patient_id);
CREATE INDEX IF NOT EXISTS idx_storage_donor_id ON storage(donor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_at ON audit_logs(changed_at DESC);

-- -------------------------------------------------------------
-- PostgreSQL Triggers for Audit Logging
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION audit_log_changes()
RETURNS TRIGGER AS $$
DECLARE
    pk_column TEXT;
    rec_id BIGINT;
BEGIN
    pk_column := TG_ARGV[0];

    IF (TG_OP = 'INSERT') THEN
        EXECUTE format('SELECT ($1).%I', pk_column) INTO rec_id USING NEW;
        INSERT INTO audit_logs (table_name, operation, record_id, new_values, changed_at)
        VALUES (TG_TABLE_NAME, 'INSERT', rec_id, to_jsonb(NEW), NOW());
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        EXECUTE format('SELECT ($1).%I', pk_column) INTO rec_id USING NEW;
        INSERT INTO audit_logs (table_name, operation, record_id, old_values, new_values, changed_at)
        VALUES (TG_TABLE_NAME, 'UPDATE', rec_id, to_jsonb(OLD), to_jsonb(NEW), NOW());
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        EXECUTE format('SELECT ($1).%I', pk_column) INTO rec_id USING OLD;
        INSERT INTO audit_logs (table_name, operation, record_id, old_values, changed_at)
        VALUES (TG_TABLE_NAME, 'DELETE', rec_id, to_jsonb(OLD), NOW());
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Attach audit triggers to all core tables
DROP TRIGGER IF EXISTS trg_patients_audit ON patients;
CREATE TRIGGER trg_patients_audit
AFTER INSERT OR UPDATE OR DELETE ON patients
FOR EACH ROW EXECUTE FUNCTION audit_log_changes('patient_id');

DROP TRIGGER IF EXISTS trg_donors_audit ON donors;
CREATE TRIGGER trg_donors_audit
AFTER INSERT OR UPDATE OR DELETE ON donors
FOR EACH ROW EXECUTE FUNCTION audit_log_changes('donor_id');

DROP TRIGGER IF EXISTS trg_storage_audit ON storage;
CREATE TRIGGER trg_storage_audit
AFTER INSERT OR UPDATE OR DELETE ON storage
FOR EACH ROW EXECUTE FUNCTION audit_log_changes('storage_id');

DROP TRIGGER IF EXISTS trg_staff_audit ON staff;
CREATE TRIGGER trg_staff_audit
AFTER INSERT OR UPDATE OR DELETE ON staff
FOR EACH ROW EXECUTE FUNCTION audit_log_changes('staff_id');

DROP TRIGGER IF EXISTS trg_research_audit ON research;
CREATE TRIGGER trg_research_audit
AFTER INSERT OR UPDATE OR DELETE ON research
FOR EACH ROW EXECUTE FUNCTION audit_log_changes('research_id');

DROP TRIGGER IF EXISTS trg_inventory_audit ON inventory;
CREATE TRIGGER trg_inventory_audit
AFTER INSERT OR UPDATE OR DELETE ON inventory
FOR EACH ROW EXECUTE FUNCTION audit_log_changes('item_id');

-- -------------------------------------------------------------
-- Supabase Row Level Security (RLS)
-- -------------------------------------------------------------
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE research ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow full access for backend service role and authenticated app requests
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['patients', 'donors', 'storage', 'staff', 'research', 'inventory', 'audit_logs'])
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Allow full access for %I" ON %I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Allow full access for %I" ON %I FOR ALL USING (true) WITH CHECK (true);', tbl, tbl);
    END LOOP;
END;
$$;


-- =============================================================
-- SEED DATA (All 100 Records per table)
-- =============================================================

-- Patients
INSERT INTO patients (patient_id, name, age, blood_group, contact, disease, created_at) VALUES
(1, 'Ravi Sharma', 39, 'O+', '+91 914988 8092', 'Severe Aplastic Anemia', '2026-09-10 06:15:47.818320'),
(2, 'Meera Nair', 22, 'B+', '+91 967000 3718', 'Sickle Cell Anemia', '2026-09-10 06:15:47.818320'),
(3, 'Arjun Gupta', 10, 'O+', '+91 870321 4868', 'Hodgkin Lymphoma', '2026-09-10 06:15:47.818320'),
(4, 'Gaurav Patel', 40, 'A+', '+91 978971 0006', 'Severe Combined Immunodeficiency (SCID)', '2026-09-10 06:15:47.818320'),
(5, 'Aparna Banerjee', 42, 'A-', '+91 700359 6316', 'Acute Myeloid Leukemia (AML)', '2026-09-10 06:15:47.818320'),
(6, 'Rashmi Joshi', 21, 'A+', '+91 966936 8498', 'Severe Aplastic Anemia', '2026-09-10 06:15:47.818320'),
(7, 'Radha Saxena', 32, 'B+', '+91 944245 8492', 'Pure Red Cell Aplasia', '2026-09-10 06:15:47.818320'),
(8, 'Ananya Bhardwaj', 24, 'O+', '+91 886094 1669', 'Severe Aplastic Anemia', '2026-09-10 06:15:47.818320'),
(9, 'Shalini Joshi', 63, 'A+', '+91 919096 8724', 'Severe Combined Immunodeficiency (SCID)', '2026-09-10 06:15:47.818320'),
(10, 'Komal Malhotra', 72, 'A+', '+91 996483 6811', 'Wiskott-Aldrich Syndrome', '2026-09-10 06:15:47.818320'),
(11, 'Smita Sharma', 7, 'B+', '+91 974380 2904', 'Primary Myelofibrosis', '2026-09-10 06:15:47.818320'),
(12, 'Arjun Mishra', 19, 'A+', '+91 979526 7693', 'Acute Lymphoblastic Leukemia (ALL)', '2026-09-10 06:15:47.818320'),
(13, 'Prakash Chopra', 48, 'B+', '+91 705305 0449', 'Hodgkin Lymphoma', '2026-09-10 06:15:47.818320'),
(14, 'Deepak Trivedi', 51, 'A+', '+91 801373 0630', 'Wiskott-Aldrich Syndrome', '2026-09-10 06:15:47.818320'),
(15, 'Archana Mehta', 34, 'A+', '+91 960601 5890', 'Beta Thalassemia Major', '2026-09-10 06:15:47.818320'),
(16, 'Varun Chopra', 42, 'A+', '+91 911165 6179', 'Primary Myelofibrosis', '2026-09-10 06:15:47.818320'),
(17, 'Tushar Shah', 55, 'O+', '+91 999629 6600', 'Multiple Myeloma', '2026-09-10 06:15:47.818320'),
(18, 'Mohan Mehta', 39, 'B+', '+91 994045 5120', 'Juvenile Myelomonocytic Leukemia', '2026-09-10 06:15:47.818320'),
(19, 'Pooja Mukherjee', 39, 'O+', '+91 901055 7245', 'Myelodysplastic Syndrome (MDS)', '2026-09-10 06:15:47.818320'),
(20, 'Karthik Bose', 68, 'B+', '+91 977843 0713', 'Severe Combined Immunodeficiency (SCID)', '2026-09-10 06:15:47.818320'),
(21, 'Naveen Bose', 48, 'B+', '+91 889598 3479', 'Wiskott-Aldrich Syndrome', '2026-09-10 06:15:47.818320'),
(22, 'Malini Shukla', 51, 'B+', '+91 907788 4614', 'Non-Hodgkin Lymphoma', '2026-09-10 06:15:47.818320'),
(23, 'Vidya Banerjee', 72, 'B+', '+91 998537 7246', 'Chronic Myeloid Leukemia (CML)', '2026-09-10 06:15:47.818320'),
(24, 'Priya Kulkarni', 40, 'A+', '+91 885375 2781', 'Multiple Myeloma', '2026-09-10 06:15:47.818320'),
(25, 'Swati Chatterjee', 66, 'B+', '+91 804606 7557', 'Primary Myelofibrosis', '2026-09-10 06:15:47.818320'),
(26, 'Sunil Sharma', 9, 'B+', '+91 947446 3826', 'Sickle Cell Anemia', '2026-09-10 06:15:47.818320'),
(27, 'Rashmi Sen', 58, 'O+', '+91 935510 3539', 'Fanconi Anemia', '2026-09-10 06:15:47.818320'),
(28, 'Sunita Gupta', 10, 'AB+', '+91 986457 8309', 'Fanconi Anemia', '2026-09-10 06:15:47.818320'),
(29, 'Akash Mukherjee', 38, 'B+', '+91 985306 1634', 'Severe Aplastic Anemia', '2026-09-10 06:15:47.818320'),
(30, 'Vivek Joshi', 26, 'B+', '+91 709740 7791', 'Hemophagocytic Lymphohistiocytosis (HLH)', '2026-09-10 06:15:47.818320'),
(31, 'Sita Das', 58, 'AB-', '+91 903088 7948', 'Acute Myeloid Leukemia (AML)', '2026-09-10 06:15:47.818320'),
(32, 'Sunita Mehta', 28, 'A+', '+91 944289 3028', 'Wiskott-Aldrich Syndrome', '2026-09-10 06:15:47.818320'),
(33, 'Rashmi Kapoor', 32, 'O+', '+91 873006 7940', 'Non-Hodgkin Lymphoma', '2026-09-10 06:15:47.818320'),
(34, 'Deepak Mishra', 46, 'A-', '+91 884624 8523', 'Paroxysmal Nocturnal Hemoglobinuria (PNH)', '2026-09-10 06:15:47.818320'),
(35, 'Suresh Das', 47, 'B+', '+91 989323 5990', 'Wiskott-Aldrich Syndrome', '2026-09-10 06:15:47.818320'),
(36, 'Ramesh Chopra', 56, 'O+', '+91 874102 1299', 'Severe Aplastic Anemia', '2026-09-10 06:15:47.818320'),
(37, 'Komal Kulkarni', 59, 'A+', '+91 804682 6932', 'Severe Combined Immunodeficiency (SCID)', '2026-09-10 06:15:47.818320'),
(38, 'Karthik Kulkarni', 64, 'A-', '+91 704350 7384', 'Fanconi Anemia', '2026-09-10 06:15:47.818320'),
(39, 'Sunita Verma', 38, 'B+', '+91 941380 0495', 'Paroxysmal Nocturnal Hemoglobinuria (PNH)', '2026-09-10 06:15:47.818320'),
(40, 'Karthik Banerjee', 16, 'B+', '+91 914123 3574', 'Non-Hodgkin Lymphoma', '2026-09-10 06:15:47.818320'),
(41, 'Naveen Trivedi', 34, 'B-', '+91 805741 5729', 'Acute Lymphoblastic Leukemia (ALL)', '2026-09-10 06:15:47.818320'),
(42, 'Radha Verma', 7, 'A+', '+91 992924 4462', 'Juvenile Myelomonocytic Leukemia', '2026-09-10 06:15:47.818320'),
(43, 'Deepak Reddy', 40, 'B+', '+91 943833 7074', 'Multiple Myeloma', '2026-09-10 06:15:47.818320'),
(44, 'Pooja Pillai', 71, 'A-', '+91 915421 8305', 'Severe Aplastic Anemia', '2026-09-10 06:15:47.818320'),
(45, 'Sneha Chatterjee', 45, 'A+', '+91 949039 6307', 'Primary Myelofibrosis', '2026-09-10 06:15:47.818320'),
(46, 'Prakash Rao', 70, 'B+', '+91 878435 5804', 'Chronic Myeloid Leukemia (CML)', '2026-09-10 06:15:47.818320'),
(47, 'Malini Iyer', 67, 'B+', '+91 879112 7416', 'Acute Myeloid Leukemia (AML)', '2026-09-10 06:15:47.818320'),
(48, 'Priya Malhotra', 52, 'A+', '+91 802472 9655', 'Beta Thalassemia Major', '2026-09-10 06:15:47.818320'),
(49, 'Sangeeta Nair', 59, 'O+', '+91 947503 3882', 'Hodgkin Lymphoma', '2026-09-10 06:15:47.818320'),
(50, 'Naveen Trivedi', 67, 'O-', '+91 961443 7107', 'Wiskott-Aldrich Syndrome', '2026-09-10 06:15:47.818320'),
(51, 'Rahul Shukla', 60, 'B+', '+91 809473 9749', 'Hemophagocytic Lymphohistiocytosis (HLH)', '2026-09-10 06:15:47.818320'),
(52, 'Priya Chopra', 46, 'B+', '+91 885822 5998', 'Paroxysmal Nocturnal Hemoglobinuria (PNH)', '2026-09-10 06:15:47.818320'),
(53, 'Abhishek Bhatt', 61, 'B-', '+91 915963 7105', 'Acute Myeloid Leukemia (AML)', '2026-09-10 06:15:47.818320'),
(54, 'Gaurav Deshmukh', 39, 'A+', '+91 875563 4506', 'Severe Aplastic Anemia', '2026-09-10 06:15:47.818320'),
(55, 'Anita Sen', 6, 'O+', '+91 709456 4365', 'Severe Combined Immunodeficiency (SCID)', '2026-09-10 06:15:47.818320'),
(56, 'Shalini Patil', 31, 'B+', '+91 967752 8413', 'Non-Hodgkin Lymphoma', '2026-09-10 06:15:47.818320'),
(57, 'Vivek Saxena', 24, 'O-', '+91 983919 9498', 'Paroxysmal Nocturnal Hemoglobinuria (PNH)', '2026-09-10 06:15:47.818320'),
(58, 'Anita Bhatia', 16, 'B-', '+91 965165 6302', 'Acute Myeloid Leukemia (AML)', '2026-09-10 06:15:47.818320'),
(59, 'Rajesh Joshi', 39, 'A+', '+91 987246 3989', 'Acute Myeloid Leukemia (AML)', '2026-09-10 06:15:47.818320'),
(60, 'Dev Agarwal', 55, 'O+', '+91 708707 6318', 'Chronic Myeloid Leukemia (CML)', '2026-09-10 06:15:47.818320'),
(61, 'Vinay Reddy', 67, 'A-', '+91 986628 5572', 'Hemophagocytic Lymphohistiocytosis (HLH)', '2026-09-10 06:15:47.818320'),
(62, 'Sunita Reddy', 37, 'AB+', '+91 945440 1614', 'Chronic Myeloid Leukemia (CML)', '2026-09-10 06:15:47.818320'),
(63, 'Payal Kapoor', 52, 'B+', '+91 900630 4345', 'Sickle Cell Anemia', '2026-09-10 06:15:47.818320'),
(64, 'Rohan Patil', 9, 'A+', '+91 804109 5699', 'Severe Aplastic Anemia', '2026-09-10 06:15:47.818320'),
(65, 'Sameer Rao', 17, 'O-', '+91 984011 3127', 'Sickle Cell Anemia', '2026-09-10 06:15:47.818320'),
(66, 'Vikram Bhatia', 71, 'A-', '+91 919911 2943', 'Pure Red Cell Aplasia', '2026-09-10 06:15:47.818320'),
(67, 'Usha Banerjee', 43, 'O+', '+91 702950 1289', 'Hodgkin Lymphoma', '2026-09-10 06:15:47.818320'),
(68, 'Isha Mishra', 56, 'B+', '+91 701652 7830', 'Primary Myelofibrosis', '2026-09-10 06:15:47.818320'),
(69, 'Deepak Deshmukh', 24, 'O+', '+91 965166 1401', 'Primary Myelofibrosis', '2026-09-10 06:15:47.818320'),
(70, 'Varun Iyer', 72, 'B+', '+91 947775 0813', 'Severe Combined Immunodeficiency (SCID)', '2026-09-10 06:15:47.818320'),
(71, 'Ananya Jain', 22, 'A+', '+91 988282 9957', 'Acute Lymphoblastic Leukemia (ALL)', '2026-09-10 06:15:47.818320'),
(72, 'Rashmi Das', 8, 'A-', '+91 802981 0243', 'Acute Lymphoblastic Leukemia (ALL)', '2026-09-10 06:15:47.819317'),
(73, 'Shreya Yadav', 56, 'B+', '+91 807883 6559', 'Wiskott-Aldrich Syndrome', '2026-09-10 06:15:47.819317'),
(74, 'Abhishek Menon', 25, 'B+', '+91 905690 6202', 'Acute Myeloid Leukemia (AML)', '2026-09-10 06:15:47.819317'),
(75, 'Sneha Saxena', 71, 'A+', '+91 917600 9222', 'Fanconi Anemia', '2026-09-10 06:15:47.819317'),
(76, 'Jyoti Yadav', 53, 'B+', '+91 931425 6324', 'Hodgkin Lymphoma', '2026-09-10 06:15:47.819317'),
(77, 'Aarav Patil', 51, 'B+', '+91 975540 6989', 'Multiple Myeloma', '2026-09-10 06:15:47.819317'),
(78, 'Sita Jain', 6, 'A+', '+91 989696 8974', 'Multiple Myeloma', '2026-09-10 06:15:47.819317'),
(79, 'Meera Verma', 70, 'A+', '+91 941416 7763', 'Paroxysmal Nocturnal Hemoglobinuria (PNH)', '2026-09-10 06:15:47.819317'),
(80, 'Abhishek Gupta', 46, 'A+', '+91 803437 4796', 'Pure Red Cell Aplasia', '2026-09-10 06:15:47.819317'),
(81, 'Dev Trivedi', 65, 'B+', '+91 969354 5202', 'Myelodysplastic Syndrome (MDS)', '2026-09-10 06:15:47.819317'),
(82, 'Karthik Menon', 22, 'A+', '+91 992981 5351', 'Fanconi Anemia', '2026-09-10 06:15:47.819317'),
(83, 'Ravi Chatterjee', 27, 'O+', '+91 991622 1865', 'Myelodysplastic Syndrome (MDS)', '2026-09-10 06:15:47.819317'),
(84, 'Meera Kapoor', 21, 'B+', '+91 880780 7957', 'Fanconi Anemia', '2026-09-10 06:15:47.819317'),
(85, 'Ananya Shukla', 15, 'A+', '+91 906367 4859', 'Juvenile Myelomonocytic Leukemia', '2026-09-10 06:15:47.819317'),
(86, 'Aarav Saxena', 19, 'B+', '+91 702749 2818', 'Hodgkin Lymphoma', '2026-09-10 06:15:47.819317'),
(87, 'Archana Chatterjee', 22, 'B+', '+91 878632 0818', 'Wiskott-Aldrich Syndrome', '2026-09-10 06:15:47.819317'),
(88, 'Sangeeta Sharma', 68, 'O-', '+91 937885 5016', 'Primary Myelofibrosis', '2026-09-10 06:15:47.819317'),
(89, 'Deepak Iyer', 11, 'O+', '+91 807973 4816', 'Hemophagocytic Lymphohistiocytosis (HLH)', '2026-09-10 06:15:47.819317'),
(90, 'Gaurav Deshmukh', 46, 'B+', '+91 960657 3163', 'Juvenile Myelomonocytic Leukemia', '2026-09-10 06:15:47.819317'),
(91, 'Anita Patel', 41, 'O+', '+91 888768 9498', 'Wiskott-Aldrich Syndrome', '2026-09-10 06:15:47.819317'),
(92, 'Priya Patel', 59, 'B+', '+91 881862 9243', 'Primary Myelofibrosis', '2026-09-10 06:15:47.819317'),
(93, 'Varun Das', 46, 'AB+', '+91 888364 1720', 'Non-Hodgkin Lymphoma', '2026-09-10 06:15:47.819317'),
(94, 'Manoj Pillai', 14, 'O-', '+91 999216 4571', 'Wiskott-Aldrich Syndrome', '2026-09-10 06:15:47.819317'),
(95, 'Aarti Bhatia', 57, 'A+', '+91 802283 6033', 'Myelodysplastic Syndrome (MDS)', '2026-09-10 06:15:47.819317'),
(96, 'Vikram Iyer', 7, 'A+', '+91 993431 1794', 'Pure Red Cell Aplasia', '2026-09-10 06:15:47.819317'),
(97, 'Pallavi Gupta', 52, 'AB-', '+91 975015 8747', 'Myelodysplastic Syndrome (MDS)', '2026-09-10 06:15:47.819317'),
(98, 'Bhavna Kapoor', 46, 'B-', '+91 883523 9615', 'Non-Hodgkin Lymphoma', '2026-09-10 06:15:47.819317'),
(99, 'Abhishek Pillai', 50, 'O+', '+91 995193 7292', 'Myelodysplastic Syndrome (MDS)', '2026-09-10 06:15:47.819317'),
(100, 'Archana Chopra', 26, 'B+', '+91 949148 8095', 'Beta Thalassemia Major', '2026-09-10 06:15:47.819317')
ON CONFLICT (patient_id) DO NOTHING;

SELECT setval('patients_patient_id_seq', (SELECT MAX(patient_id) FROM patients));

-- Donors
INSERT INTO donors (donor_id, name, age, blood_group, contact, donation_date, notes, patient_id, created_at) VALUES
(1, 'Manish Das', 33, 'B+', '+91 905138 0730', '2025-06-19', 'High CD34+ cell count: 7.4 x 10^6 cells/kg. Excellent candidate for AML recipient.', NULL, '2026-09-10 06:15:47.847158'),
(2, 'Suresh Bhardwaj', 40, 'A+', '+91 981078 0446', '2026-01-12', 'High CD34+ cell count: 7.4 x 10^6 cells/kg. Excellent candidate for AML recipient.', NULL, '2026-09-10 06:15:47.847158'),
(3, 'Rajesh Mukherjee', 49, 'O+', '+91 939779 7081', '2025-06-22', 'Active voluntary donor. Weight 68kg, hemoglobin 14.8 g/dL. Ready on 48hr notice.', NULL, '2026-09-10 06:15:47.847158'),
(4, 'Malini Gupta', 34, 'O+', '+91 931787 2524', '2026-05-30', 'Repeat voluntary donor. PBSC mobilization completed with excellent tolerability.', 10, '2026-09-10 06:15:47.847158'),
(5, 'Aarav Deshmukh', 21, 'B+', '+91 960535 6374', '2025-06-20', 'Peripheral Blood Stem Cell (PBSC) registry member. Ready for apheresis collection.', 28, '2026-09-10 06:15:47.847158'),
(6, 'Varun Sen', 35, 'B+', '+91 968520 3790', '2025-08-16', 'Peripheral Blood Stem Cell (PBSC) registry member. Ready for apheresis collection.', NULL, '2026-09-10 06:15:47.847158'),
(7, 'Rashmi Joshi', 19, 'B+', '+91 932022 3002', '2026-02-22', 'Cord blood donor unit. Total Nucleated Cell Count: 1.8 x 10^9, Sterility Neg.', NULL, '2026-09-10 06:15:47.847158'),
(8, 'Kishore Gupta', 40, 'B+', '+91 943044 0430', '2026-07-13', 'CMV Negative, EBV Negative, Hepatitis Panel Clear. Prime candidate for pediatric graft.', NULL, '2026-09-10 06:15:47.847158'),
(9, 'Sameer Das', 21, 'B+', '+91 999855 5334', '2025-06-30', 'Bone Marrow donor volunteer. Complete health clearance from hematology panel.', 52, '2026-09-10 06:15:47.847158'),
(10, 'Hemant Jain', 46, 'A+', '+91 993988 6918', '2026-05-01', 'Bone Marrow donor volunteer. Complete health clearance from hematology panel.', NULL, '2026-09-10 06:15:47.847158'),
(11, 'Archana Jain', 20, 'A+', '+91 984315 2714', '2025-09-14', 'Cord tissue MSC donor candidate. Verified sterile collection with 98.5% post-thaw viability.', 25, '2026-09-10 06:15:47.847158'),
(12, 'Pranav Malhotra', 46, 'B+', '+91 801313 6091', '2026-06-30', 'Repeat voluntary donor. PBSC mobilization completed with excellent tolerability.', 9, '2026-09-10 06:15:47.847158'),
(13, 'Vidya Banerjee', 27, 'O+', '+91 885991 3375', '2026-07-28', 'High CD34+ cell count: 7.4 x 10^6 cells/kg. Excellent candidate for AML recipient.', NULL, '2026-09-10 06:15:47.847158'),
(14, 'Ritu Singh', 25, 'B+', '+91 941155 4471', '2026-07-27', 'Repeat voluntary donor. PBSC mobilization completed with excellent tolerability.', 28, '2026-09-10 06:15:47.847158'),
(15, 'Bhavna Deshmukh', 24, 'O+', '+91 900450 4937', '2025-09-12', 'Cord blood donor unit. Total Nucleated Cell Count: 1.8 x 10^9, Sterility Neg.', 99, '2026-09-10 06:15:47.847158'),
(16, 'Suraj Iyer', 48, 'O+', '+91 995825 4774', '2025-10-31', 'HLA-A*02:01, B*44:02, C*05:01, DRB1*04:01 verified. 10/10 High Resolution Match.', 28, '2026-09-10 06:15:47.847158'),
(17, 'Rohan Patel', 41, 'B+', '+91 910096 0901', '2026-04-16', 'CMV Negative, EBV Negative, Hepatitis Panel Clear. Prime candidate for pediatric graft.', NULL, '2026-09-10 06:15:47.847158'),
(18, 'Ravi Kulkarni', 49, 'O+', '+91 988739 6878', '2025-07-19', 'Cord blood donor unit. Total Nucleated Cell Count: 1.8 x 10^9, Sterility Neg.', 94, '2026-09-10 06:15:47.847158'),
(19, 'Aditya Reddy', 42, 'B+', '+91 808377 7597', '2026-08-02', 'CMV Negative, EBV Negative, Hepatitis Panel Clear. Prime candidate for pediatric graft.', 50, '2026-09-10 06:15:47.847158'),
(20, 'Pallavi Yadav', 23, 'O+', '+91 879518 2320', '2025-10-13', 'Bone Marrow donor volunteer. Complete health clearance from hematology panel.', NULL, '2026-09-10 06:15:47.847158'),
(21, 'Anand Kapoor', 19, 'O+', '+91 975054 6555', '2025-11-07', 'Young healthy donor. 9/10 HLA match recorded. Fully screened for infectious disease markers.', NULL, '2026-09-10 06:15:47.847158'),
(22, 'Rajesh Bhatt', 21, 'O+', '+91 934256 5154', '2025-07-22', 'Bone Marrow donor volunteer. Complete health clearance from hematology panel.', NULL, '2026-09-10 06:15:47.847158'),
(23, 'Shruti Yadav', 33, 'A+', '+91 801526 3310', '2026-08-18', 'Young healthy donor. 9/10 HLA match recorded. Fully screened for infectious disease markers.', 93, '2026-09-10 06:15:47.847158'),
(24, 'Kishore Joshi', 31, 'AB+', '+91 805381 9909', '2026-08-03', 'Repeat voluntary donor. PBSC mobilization completed with excellent tolerability.', 94, '2026-09-10 06:15:47.847158'),
(25, 'Kishore Saxena', 41, 'O+', '+91 948675 9792', '2026-06-13', 'High CD34+ cell count: 7.4 x 10^6 cells/kg. Excellent candidate for AML recipient.', NULL, '2026-09-10 06:15:47.847158'),
(26, 'Tushar Saxena', 26, 'AB+', '+91 882360 7250', '2026-06-10', 'Bone Marrow donor volunteer. Complete health clearance from hematology panel.', 47, '2026-09-10 06:15:47.847158'),
(27, 'Shruti Reddy', 23, 'A+', '+91 916281 7664', '2026-01-25', 'High CD34+ cell count: 7.4 x 10^6 cells/kg. Excellent candidate for AML recipient.', NULL, '2026-09-10 06:15:47.847158'),
(28, 'Akash Mehta', 48, 'B+', '+91 874645 3976', '2025-07-20', 'Young healthy donor. 9/10 HLA match recorded. Fully screened for infectious disease markers.', NULL, '2026-09-10 06:15:47.847158'),
(29, 'Sunil Agarwal', 34, 'A+', '+91 800504 0572', '2026-02-12', 'CMV Negative, EBV Negative, Hepatitis Panel Clear. Prime candidate for pediatric graft.', NULL, '2026-09-10 06:15:47.847158'),
(30, 'Archana Saxena', 34, 'O+', '+91 976868 7758', '2026-03-14', 'Cord blood donor unit. Total Nucleated Cell Count: 1.8 x 10^9, Sterility Neg.', NULL, '2026-09-10 06:15:47.847158'),
(31, 'Akash Mukherjee', 43, 'A+', '+91 980016 5047', '2025-08-01', 'Cord tissue MSC donor candidate. Verified sterile collection with 98.5% post-thaw viability.', 95, '2026-09-10 06:15:47.847158'),
(32, 'Suresh Menon', 43, 'A+', '+91 934668 3423', '2026-07-07', 'CMV Negative, EBV Negative, Hepatitis Panel Clear. Prime candidate for pediatric graft.', 29, '2026-09-10 06:15:47.847158'),
(33, 'Bhavna Gupta', 31, 'O+', '+91 908263 3014', '2026-06-17', 'High CD34+ cell count: 7.4 x 10^6 cells/kg. Excellent candidate for AML recipient.', NULL, '2026-09-10 06:15:47.847158'),
(34, 'Deepak Dubey', 43, 'B+', '+91 878703 2253', '2026-05-10', 'High CD34+ cell count: 7.4 x 10^6 cells/kg. Excellent candidate for AML recipient.', 11, '2026-09-10 06:15:47.847158'),
(35, 'Archana Banerjee', 25, 'B+', '+91 901487 0430', '2025-11-10', 'CMV Negative, EBV Negative, Hepatitis Panel Clear. Prime candidate for pediatric graft.', NULL, '2026-09-10 06:15:47.847158'),
(36, 'Nikhil Rao', 29, 'B-', '+91 905312 1480', '2026-05-16', 'Cord tissue MSC donor candidate. Verified sterile collection with 98.5% post-thaw viability.', NULL, '2026-09-10 06:15:47.847158'),
(37, 'Deepak Nair', 28, 'O+', '+91 965177 5315', '2026-04-15', 'Cord tissue MSC donor candidate. Verified sterile collection with 98.5% post-thaw viability.', 98, '2026-09-10 06:15:47.847666'),
(38, 'Deepa Yadav', 41, 'A+', '+91 900308 0004', '2026-01-02', 'Cord blood donor unit. Total Nucleated Cell Count: 1.8 x 10^9, Sterility Neg.', 28, '2026-09-10 06:15:47.847666'),
(39, 'Nandini Bhatia', 34, 'B-', '+91 705225 5005', '2026-07-07', 'Cord tissue MSC donor candidate. Verified sterile collection with 98.5% post-thaw viability.', NULL, '2026-09-10 06:15:47.847666'),
(40, 'Ashok Bhatia', 31, 'B+', '+91 936387 7229', '2025-06-28', 'Young healthy donor. 9/10 HLA match recorded. Fully screened for infectious disease markers.', 98, '2026-09-10 06:15:47.847666'),
(41, 'Deepa Verma', 44, 'B+', '+91 884520 6282', '2025-11-13', 'CMV Negative, EBV Negative, Hepatitis Panel Clear. Prime candidate for pediatric graft.', 76, '2026-09-10 06:15:47.847666'),
(42, 'Suresh Kulkarni', 20, 'B+', '+91 806779 6791', '2025-07-20', 'Cord tissue MSC donor candidate. Verified sterile collection with 98.5% post-thaw viability.', 61, '2026-09-10 06:15:47.847666'),
(43, 'Preeti Bhatia', 32, 'A+', '+91 988271 6653', '2026-06-24', 'Young healthy donor. 9/10 HLA match recorded. Fully screened for infectious disease markers.', 39, '2026-09-10 06:15:47.847666'),
(44, 'Vidya Yadav', 39, 'B+', '+91 947585 8948', '2025-12-28', 'HLA-A*02:01, B*44:02, C*05:01, DRB1*04:01 verified. 10/10 High Resolution Match.', NULL, '2026-09-10 06:15:47.847666'),
(45, 'Anand Pandey', 44, 'A+', '+91 874927 8277', '2026-06-29', 'CMV Negative, EBV Negative, Hepatitis Panel Clear. Prime candidate for pediatric graft.', NULL, '2026-09-10 06:15:47.847666'),
(46, 'Dev Thakur', 41, 'B+', '+91 935856 0185', '2026-02-28', 'HLA-A*02:01, B*44:02, C*05:01, DRB1*04:01 verified. 10/10 High Resolution Match.', 89, '2026-09-10 06:15:47.847666'),
(47, 'Pallavi Shukla', 29, 'A+', '+91 701812 3334', '2026-06-05', 'Active voluntary donor. Weight 68kg, hemoglobin 14.8 g/dL. Ready on 48hr notice.', 21, '2026-09-10 06:15:47.847666'),
(48, 'Divya Verma', 29, 'O+', '+91 700858 4610', '2026-05-10', 'Cord blood donor unit. Total Nucleated Cell Count: 1.8 x 10^9, Sterility Neg.', 48, '2026-09-10 06:15:47.847666'),
(49, 'Vivek Menon', 23, 'B+', '+91 889200 4049', '2025-11-30', 'CMV Negative, EBV Negative, Hepatitis Panel Clear. Prime candidate for pediatric graft.', NULL, '2026-09-10 06:15:47.847666'),
(50, 'Sanjay Singh', 37, 'B+', '+91 918698 9170', '2025-06-27', 'HLA-A*02:01, B*44:02, C*05:01, DRB1*04:01 verified. 10/10 High Resolution Match.', NULL, '2026-09-10 06:15:47.847666'),
(51, 'Anita Rao', 33, 'A+', '+91 964098 6075', '2026-08-05', 'Bone Marrow donor volunteer. Complete health clearance from hematology panel.', 3, '2026-09-10 06:15:47.847666'),
(52, 'Akash Gupta', 41, 'O+', '+91 918213 5005', '2025-11-30', 'Bone Marrow donor volunteer. Complete health clearance from hematology panel.', 21, '2026-09-10 06:15:47.847666'),
(53, 'Sunita Gowda', 33, 'A+', '+91 909897 5914', '2026-07-10', 'Active voluntary donor. Weight 68kg, hemoglobin 14.8 g/dL. Ready on 48hr notice.', 12, '2026-09-10 06:15:47.847666'),
(54, 'Bhavna Kulkarni', 33, 'A+', '+91 885955 6811', '2025-09-04', 'Cord blood donor unit. Total Nucleated Cell Count: 1.8 x 10^9, Sterility Neg.', NULL, '2026-09-10 06:15:47.847666'),
(55, 'Ravi Chopra', 32, 'O+', '+91 962972 8134', '2026-01-26', 'High CD34+ cell count: 7.4 x 10^6 cells/kg. Excellent candidate for AML recipient.', NULL, '2026-09-10 06:15:47.847666'),
(56, 'Abhishek Dubey', 39, 'B+', '+91 961847 4479', '2025-06-24', 'Bone Marrow donor volunteer. Complete health clearance from hematology panel.', NULL, '2026-09-10 06:15:47.847666'),
(57, 'Ramesh Shukla', 27, 'A+', '+91 938787 3471', '2026-01-13', 'Active voluntary donor. Weight 68kg, hemoglobin 14.8 g/dL. Ready on 48hr notice.', NULL, '2026-09-10 06:15:47.847666'),
(58, 'Sita Thakur', 31, 'A+', '+91 949848 4346', '2026-08-15', 'Repeat voluntary donor. PBSC mobilization completed with excellent tolerability.', NULL, '2026-09-10 06:15:47.847666'),
(59, 'Girish Malhotra', 48, 'B+', '+91 972845 9782', '2026-06-01', 'Cord tissue MSC donor candidate. Verified sterile collection with 98.5% post-thaw viability.', NULL, '2026-09-10 06:15:47.847666'),
(60, 'Sunita Jain', 24, 'A+', '+91 984701 9505', '2025-06-20', 'Cord tissue MSC donor candidate. Verified sterile collection with 98.5% post-thaw viability.', NULL, '2026-09-10 06:15:47.847666'),
(61, 'Nikhil Gupta', 23, 'B+', '+91 988960 0453', '2025-06-30', 'High CD34+ cell count: 7.4 x 10^6 cells/kg. Excellent candidate for AML recipient.', 96, '2026-09-10 06:15:47.847666'),
(62, 'Komal Patil', 20, 'A+', '+91 880664 6839', '2025-08-03', 'Cord tissue MSC donor candidate. Verified sterile collection with 98.5% post-thaw viability.', 45, '2026-09-10 06:15:47.847666'),
(63, 'Komal Kulkarni', 35, 'O+', '+91 708968 9044', '2025-08-08', 'Cord tissue MSC donor candidate. Verified sterile collection with 98.5% post-thaw viability.', 39, '2026-09-10 06:15:47.847666'),
(64, 'Aarti Kapoor', 31, 'A-', '+91 802801 7290', '2025-09-22', 'High CD34+ cell count: 7.4 x 10^6 cells/kg. Excellent candidate for AML recipient.', NULL, '2026-09-10 06:15:47.847666'),
(65, 'Akash Thakur', 34, 'B-', '+91 982598 8873', '2025-11-21', 'High CD34+ cell count: 7.4 x 10^6 cells/kg. Excellent candidate for AML recipient.', 52, '2026-09-10 06:15:47.847666'),
(66, 'Vivek Menon', 26, 'A+', '+91 870228 0158', '2025-12-09', 'Cord blood donor unit. Total Nucleated Cell Count: 1.8 x 10^9, Sterility Neg.', 54, '2026-09-10 06:15:47.847666'),
(67, 'Shreya Patil', 35, 'A-', '+91 988900 2078', '2026-03-12', 'Bone Marrow donor volunteer. Complete health clearance from hematology panel.', 75, '2026-09-10 06:15:47.847666'),
(68, 'Usha Joshi', 28, 'A+', '+91 807317 4312', '2026-03-11', 'Repeat voluntary donor. PBSC mobilization completed with excellent tolerability.', 91, '2026-09-10 06:15:47.847666'),
(69, 'Mohan Dubey', 24, 'AB-', '+91 984339 3971', '2025-12-05', 'Active voluntary donor. Weight 68kg, hemoglobin 14.8 g/dL. Ready on 48hr notice.', NULL, '2026-09-10 06:15:47.847666'),
(70, 'Manoj Mehta', 33, 'O-', '+91 945701 8122', '2026-04-11', 'Young healthy donor. 9/10 HLA match recorded. Fully screened for infectious disease markers.', 37, '2026-09-10 06:15:47.847666'),
(71, 'Vinay Rao', 22, 'O+', '+91 878843 5029', '2026-06-04', 'Cord blood donor unit. Total Nucleated Cell Count: 1.8 x 10^9, Sterility Neg.', 81, '2026-09-10 06:15:47.847666'),
(72, 'Ananya Jain', 43, 'O+', '+91 994885 2046', '2026-01-02', 'HLA-A*02:01, B*44:02, C*05:01, DRB1*04:01 verified. 10/10 High Resolution Match.', NULL, '2026-09-10 06:15:47.847666'),
(73, 'Karthik Agarwal', 38, 'A+', '+91 888428 7733', '2025-09-24', 'CMV Negative, EBV Negative, Hepatitis Panel Clear. Prime candidate for pediatric graft.', 68, '2026-09-10 06:15:47.847666'),
(74, 'Kavita Gupta', 29, 'A+', '+91 932975 7267', '2025-11-20', 'Active voluntary donor. Weight 68kg, hemoglobin 14.8 g/dL. Ready on 48hr notice.', NULL, '2026-09-10 06:15:47.847666'),
(75, 'Vidya Kulkarni', 35, 'A+', '+91 701630 4414', '2025-07-13', 'Repeat voluntary donor. PBSC mobilization completed with excellent tolerability.', 62, '2026-09-10 06:15:47.847666'),
(76, 'Tanvi Mishra', 32, 'O+', '+91 703893 2839', '2026-08-22', 'CMV Negative, EBV Negative, Hepatitis Panel Clear. Prime candidate for pediatric graft.', NULL, '2026-09-10 06:15:47.847666'),
(77, 'Vinay Iyer', 19, 'B+', '+91 903448 9836', '2026-05-10', 'Cord blood donor unit. Total Nucleated Cell Count: 1.8 x 10^9, Sterility Neg.', NULL, '2026-09-10 06:15:47.847666'),
(78, 'Ashok Bose', 42, 'B+', '+91 877815 2911', '2025-07-16', 'Active voluntary donor. Weight 68kg, hemoglobin 14.8 g/dL. Ready on 48hr notice.', 87, '2026-09-10 06:15:47.847666'),
(79, 'Kavita Agarwal', 24, 'B+', '+91 907097 9297', '2026-04-26', 'Cord tissue MSC donor candidate. Verified sterile collection with 98.5% post-thaw viability.', NULL, '2026-09-10 06:15:47.847666'),
(80, 'Manoj Malhotra', 34, 'B+', '+91 901501 5208', '2025-09-08', 'Bone Marrow donor volunteer. Complete health clearance from hematology panel.', 80, '2026-09-10 06:15:47.847666'),
(81, 'Mohan Kapoor', 25, 'O+', '+91 981837 8212', '2025-08-06', 'Repeat voluntary donor. PBSC mobilization completed with excellent tolerability.', NULL, '2026-09-10 06:15:47.847666'),
(82, 'Rekha Malhotra', 38, 'O+', '+91 907175 6978', '2025-08-20', 'HLA-A*02:01, B*44:02, C*05:01, DRB1*04:01 verified. 10/10 High Resolution Match.', NULL, '2026-09-10 06:15:47.847666'),
(83, 'Vikram Mishra', 49, 'B+', '+91 989075 2416', '2026-01-29', 'Bone Marrow donor volunteer. Complete health clearance from hematology panel.', NULL, '2026-09-10 06:15:47.847666'),
(84, 'Naveen Bhardwaj', 39, 'B+', '+91 941596 1811', '2026-03-12', 'CMV Negative, EBV Negative, Hepatitis Panel Clear. Prime candidate for pediatric graft.', 54, '2026-09-10 06:15:47.847666'),
(85, 'Aditya Shukla', 43, 'B+', '+91 935535 7834', '2026-08-13', 'Bone Marrow donor volunteer. Complete health clearance from hematology panel.', NULL, '2026-09-10 06:15:47.847666'),
(86, 'Pranav Saxena', 22, 'B+', '+91 883735 9113', '2026-04-02', 'Repeat voluntary donor. PBSC mobilization completed with excellent tolerability.', NULL, '2026-09-10 06:15:47.847666'),
(87, 'Tushar Joshi', 20, 'AB-', '+91 940108 0763', '2025-10-15', 'Cord blood donor unit. Total Nucleated Cell Count: 1.8 x 10^9, Sterility Neg.', NULL, '2026-09-10 06:15:47.847666'),
(88, 'Shreya Sen', 37, 'O+', '+91 881300 9307', '2026-08-05', 'Bone Marrow donor volunteer. Complete health clearance from hematology panel.', NULL, '2026-09-10 06:15:47.847666'),
(89, 'Sarita Deshmukh', 32, 'O-', '+91 808507 3727', '2025-10-10', 'Bone Marrow donor volunteer. Complete health clearance from hematology panel.', NULL, '2026-09-10 06:15:47.847666'),
(90, 'Suraj Bhatt', 31, 'A+', '+91 994673 6314', '2026-01-26', 'Repeat voluntary donor. PBSC mobilization completed with excellent tolerability.', NULL, '2026-09-10 06:15:47.847666'),
(91, 'Sanjay Nair', 40, 'AB+', '+91 872358 7654', '2026-07-05', 'CMV Negative, EBV Negative, Hepatitis Panel Clear. Prime candidate for pediatric graft.', 32, '2026-09-10 06:15:47.847666'),
(92, 'Deepa Sharma', 22, 'O+', '+91 911067 8001', '2025-09-16', 'Peripheral Blood Stem Cell (PBSC) registry member. Ready for apheresis collection.', 60, '2026-09-10 06:15:47.847666'),
(93, 'Aparna Joshi', 28, 'A+', '+91 971093 0697', '2025-07-24', 'Young healthy donor. 9/10 HLA match recorded. Fully screened for infectious disease markers.', NULL, '2026-09-10 06:15:47.847666'),
(94, 'Payal Bhatia', 20, 'AB+', '+91 919197 3563', '2025-12-26', 'Repeat voluntary donor. PBSC mobilization completed with excellent tolerability.', 77, '2026-09-10 06:15:47.847666'),
(95, 'Priya Shukla', 21, 'B+', '+91 709999 4436', '2025-08-29', 'HLA-A*02:01, B*44:02, C*05:01, DRB1*04:01 verified. 10/10 High Resolution Match.', 50, '2026-09-10 06:15:47.847666'),
(96, 'Divya Deshmukh', 30, 'O+', '+91 907756 3068', '2026-08-13', 'CMV Negative, EBV Negative, Hepatitis Panel Clear. Prime candidate for pediatric graft.', NULL, '2026-09-10 06:15:47.847666'),
(97, 'Abhishek Reddy', 46, 'A+', '+91 996191 4466', '2026-04-05', 'Young healthy donor. 9/10 HLA match recorded. Fully screened for infectious disease markers.', NULL, '2026-09-10 06:15:47.847666'),
(98, 'Kishore Dubey', 20, 'AB+', '+91 948033 2787', '2025-10-14', 'Bone Marrow donor volunteer. Complete health clearance from hematology panel.', NULL, '2026-09-10 06:15:47.847666'),
(99, 'Aparna Malhotra', 38, 'O-', '+91 886552 1414', '2026-05-16', 'Active voluntary donor. Weight 68kg, hemoglobin 14.8 g/dL. Ready on 48hr notice.', NULL, '2026-09-10 06:15:47.847666'),
(100, 'Ananya Deshmukh', 32, 'A+', '+91 933009 2660', '2026-05-30', 'Bone Marrow donor volunteer. Complete health clearance from hematology panel.', NULL, '2026-09-10 06:15:47.847666')
ON CONFLICT (donor_id) DO NOTHING;

SELECT setval('donors_donor_id_seq', (SELECT MAX(donor_id) FROM donors));

-- Storage
INSERT INTO storage (storage_id, donor_id, storage_location, collected_date, expiry_date, units) VALUES
(1, 16, 'CryoTank-C10-R3:B1', '2026-03-15', '2036-03-15', 1),
(2, 68, 'BioVault-Gamma-13-R2:B2', '2026-07-19', '2036-07-19', 6),
(3, 60, 'CryoTank-E15-R2:B3', '2025-01-26', '2035-01-26', 3),
(4, 54, 'BioVault-Alpha-16-R1:B2', '2026-05-01', '2036-05-01', 4),
(5, 98, 'BioVault-Gamma-06-R3:B2', '2026-06-09', '2036-06-09', 3),
(6, 39, 'LN2-VaporTank-09-R4:B5', '2026-01-02', '2036-01-02', 6),
(7, 51, 'BioVault-Alpha-07-R1:B4', '2025-08-26', '2035-08-26', 5),
(8, 86, 'CryoTank-A08-R1:B1', '2025-07-27', '2035-07-27', 2),
(9, 1, 'BioVault-Beta-25-R3:B1', '2026-04-18', '2036-04-18', 4),
(10, 65, 'CryoTank-A14-R2:B2', '2025-04-11', '2035-04-11', 4),
(11, 4, 'BioVault-Gamma-06-R4:B2', '2026-05-26', '2036-05-26', 3),
(12, 82, 'LN2-VaporTank-22-R1:B2', '2026-03-19', '2036-03-19', 4),
(13, 22, 'CryoTank-B01-R4:B2', '2025-08-14', '2035-08-14', 6),
(14, 28, 'BioVault-Alpha-02-R3:B4', '2026-03-31', '2036-03-31', 4),
(15, 98, 'LN2-VaporTank-04-R2:B4', '2025-09-11', '2035-09-11', 6),
(16, 21, 'CryoTank-C18-R4:B4', '2026-06-28', '2036-06-28', 5),
(17, 4, 'BioVault-Alpha-24-R1:B5', '2026-03-16', '2036-03-16', 1),
(18, 87, 'CryoTank-D18-R4:B4', '2025-11-21', '2035-11-21', 4),
(19, 53, 'CryoTank-E05-R3:B3', '2025-09-02', '2035-09-02', 5),
(20, 2, 'BioVault-Beta-11-R3:B1', '2024-11-13', '2034-11-13', 2),
(21, 16, 'CryoTank-E12-R2:B4', '2025-04-30', '2035-04-30', 2),
(22, 69, 'BioVault-Alpha-16-R4:B5', '2026-05-25', '2036-05-25', 6),
(23, 67, 'BioVault-Beta-19-R3:B1', '2024-12-21', '2034-12-21', 3),
(24, 23, 'BioVault-Gamma-16-R2:B3', '2025-06-30', '2035-06-30', 4),
(25, 43, 'CryoTank-E16-R1:B1', '2026-08-05', '2036-08-05', 4),
(26, 95, 'BioVault-Alpha-11-R4:B1', '2025-03-17', '2035-03-17', 5),
(27, 64, 'CryoTank-A04-R3:B1', '2026-02-22', '2036-02-22', 1),
(28, 41, 'BioVault-Alpha-11-R3:B5', '2025-08-30', '2035-08-30', 5),
(29, 75, 'BioVault-Gamma-13-R4:B3', '2025-01-25', '2035-01-25', 3),
(30, 30, 'BioVault-Gamma-18-R1:B4', '2026-03-05', '2036-03-05', 3),
(31, 67, 'LN2-VaporTank-09-R1:B1', '2026-01-03', '2036-01-03', 4),
(32, 21, 'BioVault-Alpha-03-R4:B1', '2026-01-28', '2036-01-28', 4),
(33, 18, 'BioVault-Alpha-25-R2:B4', '2025-03-13', '2035-03-13', 2),
(34, 28, 'CryoTank-C17-R4:B2', '2025-01-18', '2035-01-18', 6),
(35, 60, 'BioVault-Alpha-05-R1:B5', '2025-08-22', '2035-08-22', 4),
(36, 22, 'BioVault-Gamma-22-R3:B2', '2026-07-05', '2036-07-05', 4),
(37, 62, 'CryoTank-E06-R1:B4', '2025-08-26', '2035-08-26', 1),
(38, 74, 'BioVault-Alpha-13-R2:B5', '2026-05-02', '2036-05-02', 3),
(39, 79, 'CryoTank-C07-R4:B2', '2026-06-05', '2036-06-05', 5),
(40, 5, 'CryoTank-E11-R3:B1', '2025-02-04', '2035-02-04', 6),
(41, 56, 'CryoTank-E23-R4:B5', '2025-01-15', '2035-01-15', 1),
(42, 77, 'CryoTank-A02-R1:B3', '2026-06-06', '2036-06-06', 2),
(43, 16, 'LN2-VaporTank-13-R3:B2', '2025-08-05', '2035-08-05', 6),
(44, 48, 'LN2-VaporTank-07-R3:B3', '2024-12-22', '2034-12-22', 6),
(45, 5, 'CryoTank-A03-R1:B4', '2026-05-17', '2036-05-17', 1),
(46, 93, 'CryoTank-A14-R2:B5', '2025-12-06', '2035-12-06', 5),
(47, 40, 'BioVault-Beta-21-R2:B5', '2025-11-27', '2035-11-27', 3),
(48, 35, 'CryoTank-B24-R4:B2', '2026-02-16', '2036-02-16', 3),
(49, 50, 'CryoTank-D25-R4:B5', '2025-05-13', '2035-05-13', 1),
(50, 9, 'CryoTank-E04-R3:B1', '2025-08-26', '2035-08-26', 1),
(51, 7, 'CryoTank-A01-R2:B2', '2024-11-11', '2034-11-11', 4),
(52, 82, 'LN2-VaporTank-03-R1:B5', '2025-08-30', '2035-08-30', 5),
(53, 62, 'CryoTank-D06-R1:B3', '2025-08-02', '2035-08-02', 5),
(54, 96, 'LN2-VaporTank-08-R2:B1', '2026-06-02', '2036-06-02', 5),
(55, 81, 'CryoTank-C11-R4:B4', '2026-02-17', '2036-02-17', 3),
(56, 89, 'CryoTank-C16-R2:B2', '2025-01-20', '2035-01-20', 4),
(57, 28, 'BioVault-Beta-19-R2:B1', '2025-08-21', '2035-08-21', 4),
(58, 55, 'CryoTank-D15-R1:B1', '2025-07-12', '2035-07-12', 6),
(59, 96, 'CryoTank-B09-R4:B4', '2026-03-22', '2036-03-22', 4),
(60, 47, 'BioVault-Gamma-05-R2:B5', '2026-06-29', '2036-06-29', 6),
(61, 37, 'BioVault-Gamma-22-R1:B3', '2024-11-10', '2034-11-10', 2),
(62, 58, 'BioVault-Gamma-08-R3:B4', '2025-03-12', '2035-03-12', 6),
(63, 17, 'BioVault-Gamma-02-R1:B1', '2026-06-18', '2036-06-18', 4),
(64, 14, 'BioVault-Beta-18-R1:B1', '2025-07-31', '2035-07-31', 3),
(65, 54, 'BioVault-Alpha-21-R2:B5', '2025-04-19', '2035-04-19', 4),
(66, 3, 'LN2-VaporTank-09-R1:B3', '2025-04-03', '2035-04-03', 4),
(67, 62, 'BioVault-Alpha-22-R3:B3', '2026-05-23', '2036-05-23', 1),
(68, 25, 'LN2-VaporTank-06-R2:B2', '2026-06-07', '2036-06-07', 6),
(69, 98, 'CryoTank-A10-R4:B3', '2026-04-12', '2036-04-12', 6),
(70, 64, 'CryoTank-C22-R1:B1', '2025-02-07', '2035-02-07', 4),
(71, 72, 'CryoTank-E24-R3:B5', '2026-08-04', '2036-08-04', 4),
(72, 93, 'BioVault-Alpha-01-R1:B2', '2026-06-11', '2036-06-11', 5),
(73, 34, 'BioVault-Alpha-18-R3:B1', '2026-03-12', '2036-03-12', 5),
(74, 28, 'BioVault-Gamma-09-R1:B2', '2025-11-19', '2035-11-19', 4),
(75, 52, 'LN2-VaporTank-09-R2:B4', '2025-01-28', '2035-01-28', 5),
(76, 32, 'CryoTank-D05-R1:B1', '2025-10-26', '2035-10-26', 4),
(77, 89, 'LN2-VaporTank-15-R3:B5', '2025-03-09', '2035-03-09', 4),
(78, 63, 'CryoTank-E23-R1:B3', '2025-03-29', '2035-03-29', 5),
(79, 5, 'CryoTank-B02-R3:B1', '2025-12-25', '2035-12-25', 2),
(80, 20, 'CryoTank-E05-R3:B5', '2025-12-18', '2035-12-18', 3),
(81, 90, 'BioVault-Gamma-03-R2:B5', '2025-07-30', '2035-07-30', 2),
(82, 86, 'CryoTank-E03-R4:B1', '2026-04-02', '2036-04-02', 6),
(83, 93, 'CryoTank-D17-R4:B5', '2026-01-16', '2036-01-16', 3),
(84, 46, 'BioVault-Alpha-03-R1:B2', '2026-01-27', '2036-01-27', 5),
(85, 30, 'CryoTank-B17-R4:B2', '2024-12-05', '2034-12-05', 6),
(86, 74, 'BioVault-Gamma-24-R2:B3', '2026-08-08', '2036-08-08', 3),
(87, 55, 'BioVault-Alpha-22-R4:B3', '2025-11-06', '2035-11-06', 5),
(88, 75, 'BioVault-Beta-24-R4:B2', '2025-01-31', '2035-01-31', 2),
(89, 27, 'CryoTank-C09-R3:B2', '2026-01-22', '2036-01-22', 1),
(90, 68, 'CryoTank-D06-R3:B1', '2025-05-06', '2035-05-06', 2),
(91, 66, 'BioVault-Beta-23-R3:B5', '2025-04-13', '2035-04-13', 1),
(92, 58, 'BioVault-Gamma-03-R1:B4', '2026-02-23', '2036-02-23', 5),
(93, 22, 'BioVault-Gamma-23-R4:B1', '2026-01-08', '2036-01-08', 5),
(94, 36, 'CryoTank-C18-R3:B1', '2025-09-20', '2035-09-20', 1),
(95, 99, 'BioVault-Beta-05-R1:B5', '2025-05-31', '2035-05-31', 2),
(96, 17, 'BioVault-Beta-21-R4:B2', '2026-04-05', '2036-04-05', 1),
(97, 53, 'BioVault-Gamma-08-R2:B2', '2025-02-18', '2035-02-18', 3),
(98, 86, 'BioVault-Alpha-01-R3:B3', '2025-10-07', '2035-10-07', 2),
(99, 38, 'BioVault-Gamma-18-R1:B4', '2026-06-21', '2036-06-21', 5),
(100, 43, 'BioVault-Gamma-07-R1:B4', '2025-12-21', '2035-12-21', 5)
ON CONFLICT (storage_id) DO NOTHING;

SELECT setval('storage_storage_id_seq', (SELECT MAX(storage_id) FROM storage));

-- Staff
INSERT INTO staff (staff_id, name, role, department, contact, created_at) VALUES
(1, 'Komal Pillai', 'Head of Molecular Genetics & HLA', 'Molecular Genetics', '+91 878916 5136', '2026-09-10 06:15:47.894926'),
(2, 'Dr. Preeti Sen', 'Chief Medical Officer', 'Executive Leadership', '+91 995831 9291', '2026-09-10 06:15:47.894926'),
(3, 'Dr. Abhishek Deshmukh', 'Laboratory Safety & Biosafety Officer', 'EHS & Safety', '+91 807981 3438', '2026-09-10 06:15:47.894926'),
(4, 'Dr. Harish Trivedi', 'Chief Medical Officer', 'Executive Leadership', '+91 700469 0578', '2026-09-10 06:15:47.894926'),
(5, 'Gaurav Bhatt', 'Senior Flow Cytometry Analyst', 'Cellular Phenotyping', '+91 908772 5737', '2026-09-10 06:15:47.894926'),
(6, 'Archana Bhardwaj', 'Donor Recruitment & Care Coordinator', 'Donor Services', '+91 806752 2606', '2026-09-10 06:15:47.894926'),
(7, 'Dr. Meera Mukherjee', 'Senior Postdoctoral Research Fellow', 'Cellular Biology Research', '+91 805006 3013', '2026-09-10 06:15:47.894926'),
(8, 'Dr. Karthik Mishra', 'Postdoctoral Fellow - iPSC Modeling', 'Stem Cell Research', '+91 701003 7165', '2026-09-10 06:15:47.894926'),
(9, 'Dr. Aarav Malhotra', 'Lead Cryopreservation Scientist', 'Cryo Preservation Vault', '+91 913290 4434', '2026-09-10 06:15:47.894926'),
(10, 'Mohan Patil', 'Patient Care & BMT Coordinator', 'Patient Advocacy', '+91 977491 4254', '2026-09-10 06:15:47.894926'),
(11, 'Suresh Menon', 'Cryo Inventory & Distribution Lead', 'Biobank Logistics', '+91 806004 4941', '2026-09-10 06:15:47.894926'),
(12, 'Payal Nair', 'Senior Apheresis Specialist Nurse', 'Apheresis & Cell Collection', '+91 983167 4443', '2026-09-10 06:15:47.894926'),
(13, 'Dr. Aarti Mehta', 'Director of Biobanking & Cryogenics', 'Cryo Preservation Vault', '+91 916062 1788', '2026-09-10 06:15:47.894926'),
(14, 'Dr. Harish Mishra', 'BMT Transplant Specialist Physician', 'Bone Marrow Transplant', '+91 806592 8154', '2026-09-10 06:15:47.894926'),
(15, 'Dr. Suresh Kapoor', 'Director of Biobanking & Cryogenics', 'Cryo Preservation Vault', '+91 709564 5915', '2026-09-10 06:15:47.894926'),
(16, 'Dr. Ramesh Gupta', 'Chief Medical Officer', 'Executive Leadership', '+91 912378 9387', '2026-09-10 06:15:47.894926'),
(17, 'Ritu Yadav', 'HLA Typing Laboratory Specialist', 'HLA & Histocompatibility', '+91 800310 4806', '2026-09-10 06:15:47.894926'),
(18, 'Naveen Dubey', 'Quality Assurance & Compliance Manager', 'Quality Assurance', '+91 984776 6704', '2026-09-10 06:15:47.894926'),
(19, 'Manoj Bhatt', 'Cleanroom Operations Supervisor', 'Cleanroom Operations', '+91 949873 7368', '2026-09-10 06:15:47.894926'),
(20, 'Shalini Patil', 'Sterility & Microbial Quality Analyst', 'Microbiology QC', '+91 972747 8390', '2026-09-10 06:15:47.894926'),
(21, 'Pranav Pillai', 'Clinical Research Coordinator', 'Research & Trials', '+91 878303 9750', '2026-09-10 06:15:47.894926'),
(22, 'Dr. Aparna Agarwal', 'Laboratory Safety & Biosafety Officer', 'EHS & Safety', '+91 876040 9853', '2026-09-10 06:15:47.894926'),
(23, 'Sarita Bose', 'Sterility & Microbial Quality Analyst', 'Microbiology QC', '+91 932487 8606', '2026-09-10 06:15:47.894926'),
(24, 'Dr. Dev Shukla', 'Director of Biobanking & Cryogenics', 'Cryo Preservation Vault', '+91 963689 6919', '2026-09-10 06:15:47.894926'),
(25, 'Dr. Arjun Nair', 'Regulatory Affairs Officer', 'Regulatory Compliance', '+91 886678 3171', '2026-09-10 06:15:47.894926'),
(26, 'Pooja Sharma', 'Cryogenic Facility Engineer', 'Biomedical Engineering', '+91 937885 6024', '2026-09-10 06:15:47.894926'),
(27, 'Dr. Malini Das', 'Regulatory Affairs Officer', 'Regulatory Compliance', '+91 909605 6188', '2026-09-10 06:15:47.894926'),
(28, 'Pallavi Bhardwaj', 'Senior Apheresis Specialist Nurse', 'Apheresis & Cell Collection', '+91 912362 4354', '2026-09-10 06:15:47.894926'),
(29, 'Dr. Meera Bhatt', 'BMT Transplant Specialist Physician', 'Bone Marrow Transplant', '+91 962662 2038', '2026-09-10 06:15:47.894926'),
(30, 'Dr. Varun Dubey', 'Senior Medical Laboratory Scientist', 'Clinical Laboratory', '+91 961197 5411', '2026-09-10 06:15:47.894926'),
(31, 'Dr. Aparna Agarwal', 'Regulatory Affairs Officer', 'Regulatory Compliance', '+91 911755 5170', '2026-09-10 06:15:47.894926'),
(32, 'Girish Das', 'Senior Cell Processing Technologist', 'Cleanroom Cell Processing', '+91 978300 2808', '2026-09-10 06:15:47.894926'),
(33, 'Dr. Malini Banerjee', 'Director of Biobanking & Cryogenics', 'Cryo Preservation Vault', '+91 876402 4479', '2026-09-10 06:15:47.894926'),
(34, 'Karthik Patil', 'Cryogenic Facility Engineer', 'Biomedical Engineering', '+91 874818 5876', '2026-09-10 06:15:47.894926'),
(35, 'Suresh Pillai', 'Clinical Data Specialist', 'Health Informatics', '+91 972658 1314', '2026-09-10 06:15:47.894926'),
(36, 'Archana Patel', 'Cryo Inventory & Distribution Lead', 'Biobank Logistics', '+91 973661 8252', '2026-09-10 06:15:47.894926'),
(37, 'Deepa Rao', 'Senior Apheresis Specialist Nurse', 'Apheresis & Cell Collection', '+91 965174 0728', '2026-09-10 06:15:47.894926'),
(38, 'Dr. Divya Bhatia', 'Senior Hematologist & BMT Consultant', 'Bone Marrow Transplant', '+91 993585 2823', '2026-09-10 06:15:47.894926'),
(39, 'Dr. Neha Iyer', 'Postdoctoral Fellow - iPSC Modeling', 'Stem Cell Research', '+91 988015 8674', '2026-09-10 06:15:47.894926'),
(40, 'Arjun Agarwal', 'Donor Recruitment & Care Coordinator', 'Donor Services', '+91 961112 6517', '2026-09-10 06:15:47.894926'),
(41, 'Geeta Verma', 'Clinical Research Coordinator', 'Research & Trials', '+91 807303 1112', '2026-09-10 06:15:47.894926'),
(42, 'Mohan Joshi', 'Clinical Data Specialist', 'Health Informatics', '+91 999698 7522', '2026-09-10 06:15:47.894926'),
(43, 'Dr. Tushar Gowda', 'Senior Hematologist & BMT Consultant', 'Bone Marrow Transplant', '+91 936595 2117', '2026-09-10 06:15:47.894926'),
(44, 'Dr. Pallavi Singh', 'Laboratory Safety & Biosafety Officer', 'EHS & Safety', '+91 878650 2080', '2026-09-10 06:15:47.894926'),
(45, 'Dr. Sunil Rao', 'Postdoctoral Fellow - iPSC Modeling', 'Stem Cell Research', '+91 983066 8799', '2026-09-10 06:15:47.894926'),
(46, 'Dr. Komal Yadav', 'Director of Biobanking & Cryogenics', 'Cryo Preservation Vault', '+91 960486 9433', '2026-09-10 06:15:47.894926'),
(47, 'Tushar Nair', 'Bioinformatics & HLA Matching Lead', 'Computational Biology', '+91 983275 3918', '2026-09-10 06:15:47.894926'),
(48, 'Dr. Preeti Agarwal', 'Senior Postdoctoral Research Fellow', 'Cellular Biology Research', '+91 940341 3171', '2026-09-10 06:15:47.894926'),
(49, 'Isha Yadav', 'Senior Flow Cytometry Analyst', 'Cellular Phenotyping', '+91 940212 9073', '2026-09-10 06:15:47.894926'),
(50, 'Dr. Rahul Nair', 'Director of Biobanking & Cryogenics', 'Cryo Preservation Vault', '+91 979663 0945', '2026-09-10 06:15:47.894926'),
(51, 'Jyoti Banerjee', 'HLA Typing Laboratory Specialist', 'HLA & Histocompatibility', '+91 993559 9119', '2026-09-10 06:15:47.894926'),
(52, 'Aparna Jain', 'Clinical Research Coordinator', 'Research & Trials', '+91 974781 2384', '2026-09-10 06:15:47.894926'),
(53, 'Dr. Radha Pillai', 'Director of Biobanking & Cryogenics', 'Cryo Preservation Vault', '+91 887335 1428', '2026-09-10 06:15:47.894926'),
(54, 'Chetan Dubey', 'Senior Apheresis Specialist Nurse', 'Apheresis & Cell Collection', '+91 932468 9231', '2026-09-10 06:15:47.894926'),
(55, 'Aparna Mehta', 'Cryo Inventory & Distribution Lead', 'Biobank Logistics', '+91 807864 3976', '2026-09-10 06:15:47.894926'),
(56, 'Deepa Banerjee', 'Bioinformatics & HLA Matching Lead', 'Computational Biology', '+91 909554 0219', '2026-09-10 06:15:47.894926'),
(57, 'Nandini Menon', 'Senior Flow Cytometry Analyst', 'Cellular Phenotyping', '+91 973383 6206', '2026-09-10 06:15:47.894926'),
(58, 'Arjun Iyer', 'Apheresis Staff Nurse', 'Apheresis & Cell Collection', '+91 945520 2049', '2026-09-10 06:15:47.894926'),
(59, 'Dr. Vidya Reddy', 'Senior Medical Laboratory Scientist', 'Clinical Laboratory', '+91 902802 0692', '2026-09-10 06:15:47.894926'),
(60, 'Deepak Trivedi', 'Donor Recruitment & Care Coordinator', 'Donor Services', '+91 946371 7207', '2026-09-10 06:15:47.894926'),
(61, 'Sarita Iyer', 'Clinical Data Specialist', 'Health Informatics', '+91 909019 1060', '2026-09-10 06:15:47.894926'),
(62, 'Archana Das', 'Senior Flow Cytometry Analyst', 'Cellular Phenotyping', '+91 981504 7025', '2026-09-10 06:15:47.894926'),
(63, 'Rekha Rao', 'Donor Recruitment & Care Coordinator', 'Donor Services', '+91 872591 3394', '2026-09-10 06:15:47.894926'),
(64, 'Dr. Sneha Singh', 'BMT Transplant Specialist Physician', 'Bone Marrow Transplant', '+91 994338 9206', '2026-09-10 06:15:47.894926'),
(65, 'Pallavi Bhardwaj', 'Cryogenic Facility Engineer', 'Biomedical Engineering', '+91 984538 3484', '2026-09-10 06:15:47.894926'),
(66, 'Pooja Patil', 'Apheresis Staff Nurse', 'Apheresis & Cell Collection', '+91 986609 0494', '2026-09-10 06:15:47.894926'),
(67, 'Komal Agarwal', 'Cryogenic Facility Engineer', 'Biomedical Engineering', '+91 993984 9213', '2026-09-10 06:15:47.894926'),
(68, 'Sneha Reddy', 'Senior Flow Cytometry Analyst', 'Cellular Phenotyping', '+91 969697 7970', '2026-09-10 06:15:47.894926'),
(69, 'Dr. Malini Yadav', 'Director of Biobanking & Cryogenics', 'Cryo Preservation Vault', '+91 701207 2089', '2026-09-10 06:15:47.894926'),
(70, 'Vikram Deshmukh', 'Stem Cell Processing Technician', 'Cleanroom Cell Processing', '+91 948052 9101', '2026-09-10 06:15:47.894926'),
(71, 'Dr. Vivek Shukla', 'Senior Postdoctoral Research Fellow', 'Cellular Biology Research', '+91 990504 1999', '2026-09-10 06:15:47.894926'),
(72, 'Rekha Bhatia', 'Cleanroom Operations Supervisor', 'Cleanroom Operations', '+91 970938 3956', '2026-09-10 06:15:47.894926'),
(73, 'Dr. Ravi Malhotra', 'Senior Medical Laboratory Scientist', 'Clinical Laboratory', '+91 968992 6162', '2026-09-10 06:15:47.894926'),
(74, 'Rajesh Reddy', 'Donor Recruitment & Care Coordinator', 'Donor Services', '+91 919243 8655', '2026-09-10 06:15:47.894926'),
(75, 'Dr. Nandini Malhotra', 'Senior Hematologist & BMT Consultant', 'Bone Marrow Transplant', '+91 974399 2589', '2026-09-10 06:15:47.894926'),
(76, 'Rajesh Deshmukh', 'Clinical Data Specialist', 'Health Informatics', '+91 875293 1360', '2026-09-10 06:15:47.894926'),
(77, 'Suraj Chatterjee', 'Clinical Data Specialist', 'Health Informatics', '+91 945129 6493', '2026-09-10 06:15:47.894926'),
(78, 'Dr. Abhishek Gowda', 'Senior Hematologist & BMT Consultant', 'Bone Marrow Transplant', '+91 917648 7411', '2026-09-10 06:15:47.894926'),
(79, 'Dr. Rajesh Kulkarni', 'Director of Biobanking & Cryogenics', 'Cryo Preservation Vault', '+91 933918 4447', '2026-09-10 06:15:47.894926'),
(80, 'Suraj Sharma', 'Patient Care & BMT Coordinator', 'Patient Advocacy', '+91 989972 3981', '2026-09-10 06:15:47.894926'),
(81, 'Karthik Bhatt', 'Clinical Research Coordinator', 'Research & Trials', '+91 998434 6549', '2026-09-10 06:15:47.894926'),
(82, 'Girish Sen', 'Sterility & Microbial Quality Analyst', 'Microbiology QC', '+91 900693 0417', '2026-09-10 06:15:47.894926'),
(83, 'Akash Bhatia', 'Donor Recruitment & Care Coordinator', 'Donor Services', '+91 939032 5099', '2026-09-10 06:15:47.894926'),
(84, 'Dr. Arjun Bose', 'Lead Cryopreservation Scientist', 'Cryo Preservation Vault', '+91 906881 1662', '2026-09-10 06:15:47.894926'),
(85, 'Ravi Banerjee', 'Senior Flow Cytometry Analyst', 'Cellular Phenotyping', '+91 903248 6454', '2026-09-10 06:15:47.894926'),
(86, 'Shalini Malhotra', 'Head of Molecular Genetics & HLA', 'Molecular Genetics', '+91 961321 8624', '2026-09-10 06:15:47.894926'),
(87, 'Karthik Nair', 'Senior Apheresis Specialist Nurse', 'Apheresis & Cell Collection', '+91 963335 9557', '2026-09-10 06:15:47.894926'),
(88, 'Nikhil Iyer', 'Cleanroom Operations Supervisor', 'Cleanroom Operations', '+91 991471 9499', '2026-09-10 06:15:47.894926'),
(89, 'Swati Mukherjee', 'Clinical Data Specialist', 'Health Informatics', '+91 988519 7428', '2026-09-10 06:15:47.894926'),
(90, 'Suraj Bhatia', 'Clinical Data Specialist', 'Health Informatics', '+91 961855 4672', '2026-09-10 06:15:47.894926'),
(91, 'Arjun Shukla', 'Sterility & Microbial Quality Analyst', 'Microbiology QC', '+91 986872 2776', '2026-09-10 06:15:47.894926'),
(92, 'Deepa Sharma', 'Sterility & Microbial Quality Analyst', 'Microbiology QC', '+91 881968 2461', '2026-09-10 06:15:47.894926'),
(93, 'Rajesh Dubey', 'Clinical Data Specialist', 'Health Informatics', '+91 884377 5845', '2026-09-10 06:15:47.894926'),
(94, 'Priya Joshi', 'Donor Recruitment & Care Coordinator', 'Donor Services', '+91 961428 3805', '2026-09-10 06:15:47.894926'),
(95, 'Arjun Chopra', 'Senior Apheresis Specialist Nurse', 'Apheresis & Cell Collection', '+91 884810 0420', '2026-09-10 06:15:47.894926'),
(96, 'Namrata Chatterjee', 'Cryo Inventory & Distribution Lead', 'Biobank Logistics', '+91 939966 1077', '2026-09-10 06:15:47.894926'),
(97, 'Deepa Chopra', 'Cryo Inventory & Distribution Lead', 'Biobank Logistics', '+91 917202 2872', '2026-09-10 06:15:47.894926'),
(98, 'Dr. Aarti Bhatt', 'Lead Cryopreservation Scientist', 'Cryo Preservation Vault', '+91 931671 1002', '2026-09-10 06:15:47.894926'),
(99, 'Komal Sen', 'Cryogenic Facility Engineer', 'Biomedical Engineering', '+91 942110 5844', '2026-09-10 06:15:47.894926'),
(100, 'Dr. Ananya Saxena', 'Chief Medical Officer', 'Executive Leadership', '+91 914397 9336', '2026-09-10 06:15:47.894926')
ON CONFLICT (staff_id) DO NOTHING;

SELECT setval('staff_staff_id_seq', (SELECT MAX(staff_id) FROM staff));

-- Research
INSERT INTO research (research_id, project_name, lead_scientist, start_date, status, summary, created_at) VALUES
(1, 'Allogeneic HSC Engraftment Acceleration via Ex-Vivo Fucosylation', 'Dr. Deepak Sharma', '2025-06-28', 'Ongoing', 'Investigating enzymatic cell surface fucosylation to improve bone marrow homing velocity in cord blood grafts.', '2026-09-10 06:15:47.905438'),
(2, 'CRISPR-Cas9 BCL11A Enhancer Editing for Sickle Cell Disease', 'Dr. Deepak Sharma', '2026-01-23', 'Active', 'Autologous CD34+ editing inducing high fetal hemoglobin (HbF) expression to eliminate vaso-occlusive crises.', '2026-09-10 06:15:47.905438'),
(3, 'Mesenchymal Stem Cell Infusion for Steroid-Refractory Acute GVHD', 'Dr. Deepak Sharma', '2024-06-12', 'Ongoing', 'Phase II trial evaluating third-party umbilical cord MSCs for suppressing gut and liver graft-versus-host disease.', '2026-09-10 06:15:47.905438'),
(4, 'Automated Closed-System Processing Protocol for Cord Blood Units', 'Dr. Meera Joshi', '2025-11-12', 'Completed', 'Validation of closed centrifuge-based RBC depletion and volume reduction yielding >92% nucleated cell recovery.', '2026-09-10 06:15:47.905438'),
(5, '15-Year Cryopreservation Potency Evaluation of CD34+ Stem Cells', 'Dr. Sunita Balasubramanian', '2025-09-03', 'Completed', 'Long-term biobank stability study confirming cell membrane viability, colony forming units (CFU), and engraftment capacity.', '2026-09-10 06:15:47.905438'),
(6, 'Post-Transplant Cyclophosphamide in Haploidentical Stem Cell Transplants', 'Dr. Sanjay Verma', '2025-08-04', 'Active', 'Evaluating high-dose PTCy on days +3 and +4 to mitigate severe GVHD in half-matched familial donor recipients.', '2026-09-10 06:15:47.905438'),
(7, 'Induced Pluripotent Stem Cell (iPSC) Disease Modeling in AML', 'Dr. Sunita Balasubramanian', '2025-07-27', 'Ongoing', 'Deriving patient-specific iPSC lines harboring FLT3-ITD and NPM1 mutations to screen targeted small-molecule inhibitors.', '2026-09-10 06:15:47.905438'),
(8, 'Cord Blood Derived Allogeneic CAR-NK Cell Therapy for CD19+ Lymphoma', 'Dr. Kavita Deshmukh', '2024-08-13', 'Active', 'Off-the-shelf chimeric antigen receptor natural killer cells expanded from cryopreserved umbilical cord units.', '2026-09-10 06:15:47.905438'),
(9, 'Trehalose-Liposome Delivery as a Non-Toxic Alternative to DMSO', 'Dr. Priya Nambiar', '2024-07-24', 'In Review', 'Engineering cryoprotectant formulations reducing post-thaw DMSO toxicity in pediatric autologous transplantations.', '2026-09-10 06:15:47.905438'),
(10, 'Cord Blood Regulatory T-Cells (Tregs) for Solid Organ Tolerance', 'Dr. Anita Nair', '2025-05-17', 'Ongoing', 'Preclinical evaluation of ex-vivo expanded cord blood Tregs to prevent allograft rejection in pediatric kidney transplant.', '2026-09-10 06:15:47.905438'),
(11, 'Optimization of Granulocyte-Colony Stimulating Factor Mobilization Schedules', 'Dr. Meera Joshi', '2024-09-26', 'Completed', 'Prospective comparative study of 4-day vs 5-day G-CSF dosing regimens on total CD34+ apheresis collection efficiency.', '2026-09-10 06:15:47.905438'),
(12, 'Spatial Transcriptomics of Bone Marrow Niches Post-Engraftment', 'Dr. Kavita Deshmukh', '2025-06-23', 'Active', 'Single-cell spatial profiling mapping donor cell reconstitution dynamics across osteoblast and vascular niches.', '2026-09-10 06:15:47.905438'),
(13, 'Mitochondrial Transfer from MSCs to Injured Endothelial Tissues', 'Dr. Anita Nair', '2026-01-12', 'Ongoing', 'Investigating tunneling nanotube mediated organelle donation to reverse radiation-induced vascular damage.', '2026-09-10 06:15:47.905438'),
(14, 'Pre-Transplant NGS Chimerism Profiling for Minimal Residual Disease', 'Dr. Elena Rostova', '2025-03-05', 'Ongoing', 'Developing ultra-sensitive duplex sequencing tracking donor chimerism down to 0.001% sensitivity.', '2026-09-10 06:15:47.905438'),
(15, 'Hydrogel Scaffold 3D Culture of Wharton''s Jelly Mesenchymal Progenitors', 'Dr. Sunita Balasubramanian', '2024-11-15', 'Active', 'Biomimetic biomaterial matrices augmenting paracrine vascular endothelial growth factor (VEGF) secretion.', '2026-09-10 06:15:47.905438'),
(16, 'Cryopreservation of Whole Umbilical Cord Tissue for Bio-Repository Storage', 'Dr. Meera Joshi', '2024-04-26', 'In Review', 'Standardizing slow-cooling protocols with programmable rate freezers to ensure multi-lineage differentiation.', '2026-09-10 06:15:47.905438'),
(17, 'Microfluidic Droplet Sorting of Rare Hematopoietic Stem Cell Subsets', 'Dr. Rohan Bhattacharya', '2025-04-19', 'Ongoing', 'Acoustic microfluidics isolating CD34+ CD38- CD90+ CD45RA- long-term repopulating stem cells.', '2026-09-10 06:15:47.905438'),
(18, 'Immune Reconstitution Following CD34+ Selected Autologous Transplants', 'Dr. Kavita Deshmukh', '2025-10-31', 'Completed', 'Five-year longitudinal follow-up tracking thymic output and T-cell receptor repertoire diversification.', '2026-09-10 06:15:47.905438'),
(19, 'Targeting Senescence-Associated Secretory Phenotype in Aged Biobank Samples', 'Dr. Vikramaditya Roy', '2024-11-01', 'Active', 'Senolytic clearance of senescent stromal populations to restore juvenile proliferative potential in stored grafts.', '2026-09-10 06:15:47.905438'),
(20, 'Cold-Chain Continuous Temperature Telemetry across Air Transits', 'Dr. Elena Rostova', '2026-01-06', 'Completed', 'Validating multi-sensor IoT cryogenic dry shipper telemetry during international stem cell courier transfers.', '2026-09-10 06:15:47.905438'),
(21, 'Allogeneic HSC Engraftment Acceleration via Ex-Vivo Fucosylation (Cohort 2)', 'Dr. Rajesh Sengupta', '2025-11-16', 'Ongoing', 'Investigating enzymatic cell surface fucosylation to improve bone marrow homing velocity in cord blood grafts.', '2026-09-10 06:15:47.905438'),
(22, 'CRISPR-Cas9 BCL11A Enhancer Editing for Sickle Cell Disease (Cohort 2)', 'Dr. Elena Rostova', '2026-03-29', 'Active', 'Autologous CD34+ editing inducing high fetal hemoglobin (HbF) expression to eliminate vaso-occlusive crises.', '2026-09-10 06:15:47.905438'),
(23, 'Mesenchymal Stem Cell Infusion for Steroid-Refractory Acute GVHD (Cohort 2)', 'Dr. Anita Nair', '2026-01-10', 'Ongoing', 'Phase II trial evaluating third-party umbilical cord MSCs for suppressing gut and liver graft-versus-host disease.', '2026-09-10 06:15:47.905438'),
(24, 'Automated Closed-System Processing Protocol for Cord Blood Units (Cohort 2)', 'Dr. Deepak Sharma', '2024-05-07', 'Completed', 'Validation of closed centrifuge-based RBC depletion and volume reduction yielding >92% nucleated cell recovery.', '2026-09-10 06:15:47.905438'),
(25, '15-Year Cryopreservation Potency Evaluation of CD34+ Stem Cells (Cohort 2)', 'Dr. Priya Nambiar', '2026-06-03', 'Completed', 'Long-term biobank stability study confirming cell membrane viability, colony forming units (CFU), and engraftment capacity.', '2026-09-10 06:15:47.905438'),
(26, 'Post-Transplant Cyclophosphamide in Haploidentical Stem Cell Transplants (Cohort 2)', 'Dr. Rajesh Sengupta', '2025-09-24', 'Active', 'Evaluating high-dose PTCy on days +3 and +4 to mitigate severe GVHD in half-matched familial donor recipients.', '2026-09-10 06:15:47.905438'),
(27, 'Induced Pluripotent Stem Cell (iPSC) Disease Modeling in AML (Cohort 2)', 'Dr. Rajesh Sengupta', '2025-10-03', 'Ongoing', 'Deriving patient-specific iPSC lines harboring FLT3-ITD and NPM1 mutations to screen targeted small-molecule inhibitors.', '2026-09-10 06:15:47.905438'),
(28, 'Cord Blood Derived Allogeneic CAR-NK Cell Therapy for CD19+ Lymphoma (Cohort 2)', 'Dr. Meera Joshi', '2024-06-12', 'Active', 'Off-the-shelf chimeric antigen receptor natural killer cells expanded from cryopreserved umbilical cord units.', '2026-09-10 06:15:47.905438'),
(29, 'Trehalose-Liposome Delivery as a Non-Toxic Alternative to DMSO (Cohort 2)', 'Dr. Elena Rostova', '2024-04-10', 'In Review', 'Engineering cryoprotectant formulations reducing post-thaw DMSO toxicity in pediatric autologous transplantations.', '2026-09-10 06:15:47.905438'),
(30, 'Cord Blood Regulatory T-Cells (Tregs) for Solid Organ Tolerance (Cohort 2)', 'Dr. Priya Nambiar', '2024-09-29', 'Ongoing', 'Preclinical evaluation of ex-vivo expanded cord blood Tregs to prevent allograft rejection in pediatric kidney transplant.', '2026-09-10 06:15:47.905438'),
(31, 'Optimization of Granulocyte-Colony Stimulating Factor Mobilization Schedules (Cohort 2)', 'Dr. Sanjay Verma', '2026-05-20', 'Completed', 'Prospective comparative study of 4-day vs 5-day G-CSF dosing regimens on total CD34+ apheresis collection efficiency.', '2026-09-10 06:15:47.905438'),
(32, 'Spatial Transcriptomics of Bone Marrow Niches Post-Engraftment (Cohort 2)', 'Dr. Elena Rostova', '2026-01-09', 'Active', 'Single-cell spatial profiling mapping donor cell reconstitution dynamics across osteoblast and vascular niches.', '2026-09-10 06:15:47.905438'),
(33, 'Mitochondrial Transfer from MSCs to Injured Endothelial Tissues (Cohort 2)', 'Dr. Rajesh Sengupta', '2025-12-28', 'Ongoing', 'Investigating tunneling nanotube mediated organelle donation to reverse radiation-induced vascular damage.', '2026-09-10 06:15:47.905438'),
(34, 'Pre-Transplant NGS Chimerism Profiling for Minimal Residual Disease (Cohort 2)', 'Dr. Sanjay Verma', '2026-04-29', 'Ongoing', 'Developing ultra-sensitive duplex sequencing tracking donor chimerism down to 0.001% sensitivity.', '2026-09-10 06:15:47.905438'),
(35, 'Hydrogel Scaffold 3D Culture of Wharton''s Jelly Mesenchymal Progenitors (Cohort 2)', 'Dr. Kavita Deshmukh', '2025-03-04', 'Active', 'Biomimetic biomaterial matrices augmenting paracrine vascular endothelial growth factor (VEGF) secretion.', '2026-09-10 06:15:47.905438'),
(36, 'Cryopreservation of Whole Umbilical Cord Tissue for Bio-Repository Storage (Cohort 2)', 'Dr. Priya Nambiar', '2026-02-21', 'In Review', 'Standardizing slow-cooling protocols with programmable rate freezers to ensure multi-lineage differentiation.', '2026-09-10 06:15:47.905438'),
(37, 'Microfluidic Droplet Sorting of Rare Hematopoietic Stem Cell Subsets (Cohort 2)', 'Dr. Priya Nambiar', '2025-10-25', 'Ongoing', 'Acoustic microfluidics isolating CD34+ CD38- CD90+ CD45RA- long-term repopulating stem cells.', '2026-09-10 06:15:47.905438'),
(38, 'Immune Reconstitution Following CD34+ Selected Autologous Transplants (Cohort 2)', 'Dr. Anita Nair', '2024-05-12', 'Completed', 'Five-year longitudinal follow-up tracking thymic output and T-cell receptor repertoire diversification.', '2026-09-10 06:15:47.905438'),
(39, 'Targeting Senescence-Associated Secretory Phenotype in Aged Biobank Samples (Cohort 2)', 'Dr. Vikramaditya Roy', '2025-01-25', 'Active', 'Senolytic clearance of senescent stromal populations to restore juvenile proliferative potential in stored grafts.', '2026-09-10 06:15:47.905438'),
(40, 'Cold-Chain Continuous Temperature Telemetry across Air Transits (Cohort 2)', 'Dr. Sunita Balasubramanian', '2025-01-28', 'Completed', 'Validating multi-sensor IoT cryogenic dry shipper telemetry during international stem cell courier transfers.', '2026-09-10 06:15:47.905438'),
(41, 'Allogeneic HSC Engraftment Acceleration via Ex-Vivo Fucosylation (Cohort 3)', 'Dr. Deepak Sharma', '2025-08-19', 'Ongoing', 'Investigating enzymatic cell surface fucosylation to improve bone marrow homing velocity in cord blood grafts.', '2026-09-10 06:15:47.905438'),
(42, 'CRISPR-Cas9 BCL11A Enhancer Editing for Sickle Cell Disease (Cohort 3)', 'Dr. Sunita Balasubramanian', '2024-09-01', 'Active', 'Autologous CD34+ editing inducing high fetal hemoglobin (HbF) expression to eliminate vaso-occlusive crises.', '2026-09-10 06:15:47.905438'),
(43, 'Mesenchymal Stem Cell Infusion for Steroid-Refractory Acute GVHD (Cohort 3)', 'Dr. Arvind Swaminathan', '2026-05-25', 'Ongoing', 'Phase II trial evaluating third-party umbilical cord MSCs for suppressing gut and liver graft-versus-host disease.', '2026-09-10 06:15:47.905438'),
(44, 'Automated Closed-System Processing Protocol for Cord Blood Units (Cohort 3)', 'Dr. Rohan Bhattacharya', '2025-06-13', 'Completed', 'Validation of closed centrifuge-based RBC depletion and volume reduction yielding >92% nucleated cell recovery.', '2026-09-10 06:15:47.905438'),
(45, '15-Year Cryopreservation Potency Evaluation of CD34+ Stem Cells (Cohort 3)', 'Dr. Meera Joshi', '2026-05-07', 'Completed', 'Long-term biobank stability study confirming cell membrane viability, colony forming units (CFU), and engraftment capacity.', '2026-09-10 06:15:47.905438'),
(46, 'Post-Transplant Cyclophosphamide in Haploidentical Stem Cell Transplants (Cohort 3)', 'Dr. Meera Joshi', '2026-06-30', 'Active', 'Evaluating high-dose PTCy on days +3 and +4 to mitigate severe GVHD in half-matched familial donor recipients.', '2026-09-10 06:15:47.905438'),
(47, 'Induced Pluripotent Stem Cell (iPSC) Disease Modeling in AML (Cohort 3)', 'Dr. Elena Rostova', '2026-05-22', 'Ongoing', 'Deriving patient-specific iPSC lines harboring FLT3-ITD and NPM1 mutations to screen targeted small-molecule inhibitors.', '2026-09-10 06:15:47.905438'),
(48, 'Cord Blood Derived Allogeneic CAR-NK Cell Therapy for CD19+ Lymphoma (Cohort 3)', 'Dr. Rohan Bhattacharya', '2024-05-21', 'Active', 'Off-the-shelf chimeric antigen receptor natural killer cells expanded from cryopreserved umbilical cord units.', '2026-09-10 06:15:47.905438'),
(49, 'Trehalose-Liposome Delivery as a Non-Toxic Alternative to DMSO (Cohort 3)', 'Dr. Rajesh Sengupta', '2026-05-25', 'In Review', 'Engineering cryoprotectant formulations reducing post-thaw DMSO toxicity in pediatric autologous transplantations.', '2026-09-10 06:15:47.905438'),
(50, 'Cord Blood Regulatory T-Cells (Tregs) for Solid Organ Tolerance (Cohort 3)', 'Dr. Meera Joshi', '2024-07-27', 'Ongoing', 'Preclinical evaluation of ex-vivo expanded cord blood Tregs to prevent allograft rejection in pediatric kidney transplant.', '2026-09-10 06:15:47.905438'),
(51, 'Optimization of Granulocyte-Colony Stimulating Factor Mobilization Schedules (Cohort 3)', 'Dr. Elena Rostova', '2025-03-08', 'Completed', 'Prospective comparative study of 4-day vs 5-day G-CSF dosing regimens on total CD34+ apheresis collection efficiency.', '2026-09-10 06:15:47.905438'),
(52, 'Spatial Transcriptomics of Bone Marrow Niches Post-Engraftment (Cohort 3)', 'Dr. Kavita Deshmukh', '2024-05-22', 'Active', 'Single-cell spatial profiling mapping donor cell reconstitution dynamics across osteoblast and vascular niches.', '2026-09-10 06:15:47.905438'),
(53, 'Mitochondrial Transfer from MSCs to Injured Endothelial Tissues (Cohort 3)', 'Dr. Elena Rostova', '2025-02-17', 'Ongoing', 'Investigating tunneling nanotube mediated organelle donation to reverse radiation-induced vascular damage.', '2026-09-10 06:15:47.905438'),
(54, 'Pre-Transplant NGS Chimerism Profiling for Minimal Residual Disease (Cohort 3)', 'Dr. Anita Nair', '2025-05-05', 'Ongoing', 'Developing ultra-sensitive duplex sequencing tracking donor chimerism down to 0.001% sensitivity.', '2026-09-10 06:15:47.905438'),
(55, 'Hydrogel Scaffold 3D Culture of Wharton''s Jelly Mesenchymal Progenitors (Cohort 3)', 'Dr. Kavita Deshmukh', '2025-01-22', 'Active', 'Biomimetic biomaterial matrices augmenting paracrine vascular endothelial growth factor (VEGF) secretion.', '2026-09-10 06:15:47.905438'),
(56, 'Cryopreservation of Whole Umbilical Cord Tissue for Bio-Repository Storage (Cohort 3)', 'Dr. Sunita Balasubramanian', '2024-12-05', 'In Review', 'Standardizing slow-cooling protocols with programmable rate freezers to ensure multi-lineage differentiation.', '2026-09-10 06:15:47.905438'),
(57, 'Microfluidic Droplet Sorting of Rare Hematopoietic Stem Cell Subsets (Cohort 3)', 'Dr. Vikramaditya Roy', '2024-09-21', 'Ongoing', 'Acoustic microfluidics isolating CD34+ CD38- CD90+ CD45RA- long-term repopulating stem cells.', '2026-09-10 06:15:47.905438'),
(58, 'Immune Reconstitution Following CD34+ Selected Autologous Transplants (Cohort 3)', 'Dr. Meera Joshi', '2024-12-25', 'Completed', 'Five-year longitudinal follow-up tracking thymic output and T-cell receptor repertoire diversification.', '2026-09-10 06:15:47.905438'),
(59, 'Targeting Senescence-Associated Secretory Phenotype in Aged Biobank Samples (Cohort 3)', 'Dr. Kavita Deshmukh', '2025-11-29', 'Active', 'Senolytic clearance of senescent stromal populations to restore juvenile proliferative potential in stored grafts.', '2026-09-10 06:15:47.905438'),
(60, 'Cold-Chain Continuous Temperature Telemetry across Air Transits (Cohort 3)', 'Dr. Rohan Bhattacharya', '2025-12-16', 'Completed', 'Validating multi-sensor IoT cryogenic dry shipper telemetry during international stem cell courier transfers.', '2026-09-10 06:15:47.905438'),
(61, 'Allogeneic HSC Engraftment Acceleration via Ex-Vivo Fucosylation (Cohort 4)', 'Dr. Rohan Bhattacharya', '2025-03-27', 'Ongoing', 'Investigating enzymatic cell surface fucosylation to improve bone marrow homing velocity in cord blood grafts.', '2026-09-10 06:15:47.905438'),
(62, 'CRISPR-Cas9 BCL11A Enhancer Editing for Sickle Cell Disease (Cohort 4)', 'Dr. Elena Rostova', '2026-06-30', 'Active', 'Autologous CD34+ editing inducing high fetal hemoglobin (HbF) expression to eliminate vaso-occlusive crises.', '2026-09-10 06:15:47.905438'),
(63, 'Mesenchymal Stem Cell Infusion for Steroid-Refractory Acute GVHD (Cohort 4)', 'Dr. Sunita Balasubramanian', '2024-08-16', 'Ongoing', 'Phase II trial evaluating third-party umbilical cord MSCs for suppressing gut and liver graft-versus-host disease.', '2026-09-10 06:15:47.905438'),
(64, 'Automated Closed-System Processing Protocol for Cord Blood Units (Cohort 4)', 'Dr. Sanjay Verma', '2025-10-13', 'Completed', 'Validation of closed centrifuge-based RBC depletion and volume reduction yielding >92% nucleated cell recovery.', '2026-09-10 06:15:47.905438'),
(65, '15-Year Cryopreservation Potency Evaluation of CD34+ Stem Cells (Cohort 4)', 'Dr. Kavita Deshmukh', '2025-07-15', 'Completed', 'Long-term biobank stability study confirming cell membrane viability, colony forming units (CFU), and engraftment capacity.', '2026-09-10 06:15:47.905438'),
(66, 'Post-Transplant Cyclophosphamide in Haploidentical Stem Cell Transplants (Cohort 4)', 'Dr. Vikramaditya Roy', '2025-09-23', 'Active', 'Evaluating high-dose PTCy on days +3 and +4 to mitigate severe GVHD in half-matched familial donor recipients.', '2026-09-10 06:15:47.905438'),
(67, 'Induced Pluripotent Stem Cell (iPSC) Disease Modeling in AML (Cohort 4)', 'Dr. Rajesh Sengupta', '2024-08-06', 'Ongoing', 'Deriving patient-specific iPSC lines harboring FLT3-ITD and NPM1 mutations to screen targeted small-molecule inhibitors.', '2026-09-10 06:15:47.905438'),
(68, 'Cord Blood Derived Allogeneic CAR-NK Cell Therapy for CD19+ Lymphoma (Cohort 4)', 'Dr. Elena Rostova', '2024-11-27', 'Active', 'Off-the-shelf chimeric antigen receptor natural killer cells expanded from cryopreserved umbilical cord units.', '2026-09-10 06:15:47.905438'),
(69, 'Trehalose-Liposome Delivery as a Non-Toxic Alternative to DMSO (Cohort 4)', 'Dr. Rajesh Sengupta', '2024-11-01', 'In Review', 'Engineering cryoprotectant formulations reducing post-thaw DMSO toxicity in pediatric autologous transplantations.', '2026-09-10 06:15:47.905438'),
(70, 'Cord Blood Regulatory T-Cells (Tregs) for Solid Organ Tolerance (Cohort 4)', 'Dr. Deepak Sharma', '2025-08-29', 'Ongoing', 'Preclinical evaluation of ex-vivo expanded cord blood Tregs to prevent allograft rejection in pediatric kidney transplant.', '2026-09-10 06:15:47.905438'),
(71, 'Optimization of Granulocyte-Colony Stimulating Factor Mobilization Schedules (Cohort 4)', 'Dr. Sunita Balasubramanian', '2024-08-25', 'Completed', 'Prospective comparative study of 4-day vs 5-day G-CSF dosing regimens on total CD34+ apheresis collection efficiency.', '2026-09-10 06:15:47.905438'),
(72, 'Spatial Transcriptomics of Bone Marrow Niches Post-Engraftment (Cohort 4)', 'Dr. Priya Nambiar', '2024-05-18', 'Active', 'Single-cell spatial profiling mapping donor cell reconstitution dynamics across osteoblast and vascular niches.', '2026-09-10 06:15:47.905438'),
(73, 'Mitochondrial Transfer from MSCs to Injured Endothelial Tissues (Cohort 4)', 'Dr. Elena Rostova', '2025-01-08', 'Ongoing', 'Investigating tunneling nanotube mediated organelle donation to reverse radiation-induced vascular damage.', '2026-09-10 06:15:47.905438'),
(74, 'Pre-Transplant NGS Chimerism Profiling for Minimal Residual Disease (Cohort 4)', 'Dr. Deepak Sharma', '2024-12-28', 'Ongoing', 'Developing ultra-sensitive duplex sequencing tracking donor chimerism down to 0.001% sensitivity.', '2026-09-10 06:15:47.905438'),
(75, 'Hydrogel Scaffold 3D Culture of Wharton''s Jelly Mesenchymal Progenitors (Cohort 4)', 'Dr. Sunita Balasubramanian', '2025-11-04', 'Active', 'Biomimetic biomaterial matrices augmenting paracrine vascular endothelial growth factor (VEGF) secretion.', '2026-09-10 06:15:47.905438'),
(76, 'Cryopreservation of Whole Umbilical Cord Tissue for Bio-Repository Storage (Cohort 4)', 'Dr. Sanjay Verma', '2025-08-20', 'In Review', 'Standardizing slow-cooling protocols with programmable rate freezers to ensure multi-lineage differentiation.', '2026-09-10 06:15:47.905438'),
(77, 'Microfluidic Droplet Sorting of Rare Hematopoietic Stem Cell Subsets (Cohort 4)', 'Dr. Deepak Sharma', '2026-06-24', 'Ongoing', 'Acoustic microfluidics isolating CD34+ CD38- CD90+ CD45RA- long-term repopulating stem cells.', '2026-09-10 06:15:47.905438'),
(78, 'Immune Reconstitution Following CD34+ Selected Autologous Transplants (Cohort 4)', 'Dr. Arvind Swaminathan', '2025-09-13', 'Completed', 'Five-year longitudinal follow-up tracking thymic output and T-cell receptor repertoire diversification.', '2026-09-10 06:15:47.905438'),
(79, 'Targeting Senescence-Associated Secretory Phenotype in Aged Biobank Samples (Cohort 4)', 'Dr. Vikramaditya Roy', '2024-06-28', 'Active', 'Senolytic clearance of senescent stromal populations to restore juvenile proliferative potential in stored grafts.', '2026-09-10 06:15:47.905438'),
(80, 'Cold-Chain Continuous Temperature Telemetry across Air Transits (Cohort 4)', 'Dr. Kavita Deshmukh', '2026-04-24', 'Completed', 'Validating multi-sensor IoT cryogenic dry shipper telemetry during international stem cell courier transfers.', '2026-09-10 06:15:47.905438'),
(81, 'Allogeneic HSC Engraftment Acceleration via Ex-Vivo Fucosylation (Cohort 5)', 'Dr. Anita Nair', '2025-02-16', 'Ongoing', 'Investigating enzymatic cell surface fucosylation to improve bone marrow homing velocity in cord blood grafts.', '2026-09-10 06:15:47.905438'),
(82, 'CRISPR-Cas9 BCL11A Enhancer Editing for Sickle Cell Disease (Cohort 5)', 'Dr. Anita Nair', '2024-08-27', 'Active', 'Autologous CD34+ editing inducing high fetal hemoglobin (HbF) expression to eliminate vaso-occlusive crises.', '2026-09-10 06:15:47.905438'),
(83, 'Mesenchymal Stem Cell Infusion for Steroid-Refractory Acute GVHD (Cohort 5)', 'Dr. Vikramaditya Roy', '2025-07-19', 'Ongoing', 'Phase II trial evaluating third-party umbilical cord MSCs for suppressing gut and liver graft-versus-host disease.', '2026-09-10 06:15:47.905438'),
(84, 'Automated Closed-System Processing Protocol for Cord Blood Units (Cohort 5)', 'Dr. Sanjay Verma', '2026-07-06', 'Completed', 'Validation of closed centrifuge-based RBC depletion and volume reduction yielding >92% nucleated cell recovery.', '2026-09-10 06:15:47.905438'),
(85, '15-Year Cryopreservation Potency Evaluation of CD34+ Stem Cells (Cohort 5)', 'Dr. Elena Rostova', '2024-05-07', 'Completed', 'Long-term biobank stability study confirming cell membrane viability, colony forming units (CFU), and engraftment capacity.', '2026-09-10 06:15:47.905438'),
(86, 'Post-Transplant Cyclophosphamide in Haploidentical Stem Cell Transplants (Cohort 5)', 'Dr. Meera Joshi', '2026-03-27', 'Active', 'Evaluating high-dose PTCy on days +3 and +4 to mitigate severe GVHD in half-matched familial donor recipients.', '2026-09-10 06:15:47.905438'),
(87, 'Induced Pluripotent Stem Cell (iPSC) Disease Modeling in AML (Cohort 5)', 'Dr. Sanjay Verma', '2025-11-10', 'Ongoing', 'Deriving patient-specific iPSC lines harboring FLT3-ITD and NPM1 mutations to screen targeted small-molecule inhibitors.', '2026-09-10 06:15:47.905438'),
(88, 'Cord Blood Derived Allogeneic CAR-NK Cell Therapy for CD19+ Lymphoma (Cohort 5)', 'Dr. Rohan Bhattacharya', '2024-09-09', 'Active', 'Off-the-shelf chimeric antigen receptor natural killer cells expanded from cryopreserved umbilical cord units.', '2026-09-10 06:15:47.905438'),
(89, 'Trehalose-Liposome Delivery as a Non-Toxic Alternative to DMSO (Cohort 5)', 'Dr. Rajesh Sengupta', '2025-10-15', 'In Review', 'Engineering cryoprotectant formulations reducing post-thaw DMSO toxicity in pediatric autologous transplantations.', '2026-09-10 06:15:47.905438'),
(90, 'Cord Blood Regulatory T-Cells (Tregs) for Solid Organ Tolerance (Cohort 5)', 'Dr. Sanjay Verma', '2024-09-03', 'Ongoing', 'Preclinical evaluation of ex-vivo expanded cord blood Tregs to prevent allograft rejection in pediatric kidney transplant.', '2026-09-10 06:15:47.905438'),
(91, 'Optimization of Granulocyte-Colony Stimulating Factor Mobilization Schedules (Cohort 5)', 'Dr. Meera Joshi', '2025-02-22', 'Completed', 'Prospective comparative study of 4-day vs 5-day G-CSF dosing regimens on total CD34+ apheresis collection efficiency.', '2026-09-10 06:15:47.905438'),
(92, 'Spatial Transcriptomics of Bone Marrow Niches Post-Engraftment (Cohort 5)', 'Dr. Arvind Swaminathan', '2025-10-23', 'Active', 'Single-cell spatial profiling mapping donor cell reconstitution dynamics across osteoblast and vascular niches.', '2026-09-10 06:15:47.905438'),
(93, 'Mitochondrial Transfer from MSCs to Injured Endothelial Tissues (Cohort 5)', 'Dr. Rohan Bhattacharya', '2025-06-26', 'Ongoing', 'Investigating tunneling nanotube mediated organelle donation to reverse radiation-induced vascular damage.', '2026-09-10 06:15:47.905438'),
(94, 'Pre-Transplant NGS Chimerism Profiling for Minimal Residual Disease (Cohort 5)', 'Dr. Rajesh Sengupta', '2024-06-02', 'Ongoing', 'Developing ultra-sensitive duplex sequencing tracking donor chimerism down to 0.001% sensitivity.', '2026-09-10 06:15:47.905438'),
(95, 'Hydrogel Scaffold 3D Culture of Wharton''s Jelly Mesenchymal Progenitors (Cohort 5)', 'Dr. Elena Rostova', '2025-11-12', 'Active', 'Biomimetic biomaterial matrices augmenting paracrine vascular endothelial growth factor (VEGF) secretion.', '2026-09-10 06:15:47.905438'),
(96, 'Cryopreservation of Whole Umbilical Cord Tissue for Bio-Repository Storage (Cohort 5)', 'Dr. Arvind Swaminathan', '2026-06-09', 'In Review', 'Standardizing slow-cooling protocols with programmable rate freezers to ensure multi-lineage differentiation.', '2026-09-10 06:15:47.905438'),
(97, 'Microfluidic Droplet Sorting of Rare Hematopoietic Stem Cell Subsets (Cohort 5)', 'Dr. Arvind Swaminathan', '2025-11-26', 'Ongoing', 'Acoustic microfluidics isolating CD34+ CD38- CD90+ CD45RA- long-term repopulating stem cells.', '2026-09-10 06:15:47.905438'),
(98, 'Immune Reconstitution Following CD34+ Selected Autologous Transplants (Cohort 5)', 'Dr. Rajesh Sengupta', '2025-03-19', 'Completed', 'Five-year longitudinal follow-up tracking thymic output and T-cell receptor repertoire diversification.', '2026-09-10 06:15:47.905438'),
(99, 'Targeting Senescence-Associated Secretory Phenotype in Aged Biobank Samples (Cohort 5)', 'Dr. Deepak Sharma', '2025-01-16', 'Active', 'Senolytic clearance of senescent stromal populations to restore juvenile proliferative potential in stored grafts.', '2026-09-10 06:15:47.905438'),
(100, 'Cold-Chain Continuous Temperature Telemetry across Air Transits (Cohort 5)', 'Dr. Sanjay Verma', '2025-12-18', 'Completed', 'Validating multi-sensor IoT cryogenic dry shipper telemetry during international stem cell courier transfers.', '2026-09-10 06:15:47.905438')
ON CONFLICT (research_id) DO NOTHING;

SELECT setval('research_research_id_seq', (SELECT MAX(research_id) FROM research));

-- Inventory
INSERT INTO inventory (item_id, item_name, quantity, unit, last_updated) VALUES
(1, 'Cryogenic Vials 1.8 mL (Internal Thread)', 1178, 'vials', '2026-09-10 06:15:47.881921'),
(2, 'Cryogenic Vials 4.5 mL (External Thread)', 560, 'vials', '2026-09-10 06:15:47.881921'),
(3, 'Liquid Nitrogen (Medical Grade)', 625, 'litres', '2026-09-10 06:15:47.881921'),
(4, 'DMSO 99.9% USP Grade Cryoprotectant', 100, 'bottles', '2026-09-10 06:15:47.881921'),
(5, 'RPMI-1640 Medium w/ L-Glutamine (500 mL)', 98, 'bottles', '2026-09-10 06:15:47.881921'),
(6, 'Fetal Bovine Serum (Stem Cell Certified)', 37, 'bottles', '2026-09-10 06:15:47.881921'),
(7, 'Ficoll-Paque PLUS Density Gradient Media', 55, 'bottles', '2026-09-10 06:15:47.881921'),
(8, 'Apheresis Collection Kits (Single-Use Sterile)', 127, 'kits', '2026-09-10 06:15:47.881921'),
(9, 'CD34+ MicroBead Cell Separation Kits', 33, 'kits', '2026-09-10 06:15:47.881921'),
(10, 'StemSpan SFEM II Expansion Medium', 36, 'bottles', '2026-09-10 06:15:47.881921'),
(11, 'Cryo-Preservation Cassettes 25 mL', 400, 'pcs', '2026-09-10 06:15:47.881921'),
(12, 'Cryo-Preservation Cassettes 50 mL', 310, 'pcs', '2026-09-10 06:15:47.881921'),
(13, 'Liquid Nitrogen Cryo Gloves (Mid-Arm)', 29, 'pairs', '2026-09-10 06:15:47.881921'),
(14, 'Cryo Face Shields (UV & Splash Rated)', 16, 'pcs', '2026-09-10 06:15:47.881921'),
(15, 'Cryogenic Barcode Labels (Low-Temp Resistant)', 3042, 'labels', '2026-09-10 06:15:47.881921'),
(16, 'Thermal Transfer Ribbon for Cryo Printers', 12, 'rolls', '2026-09-10 06:15:47.881921'),
(17, 'Automated Cell Counter Chamber Slides', 259, 'slides', '2026-09-10 06:15:47.881921'),
(18, 'Trypan Blue Stain 0.4% Solution (100 mL)', 31, 'bottles', '2026-09-10 06:15:47.881921'),
(19, 'Sterile Filter Pipette Tips 1000 uL', 1506, 'tips', '2026-09-10 06:15:47.881921'),
(20, 'Sterile Filter Pipette Tips 200 uL', 1876, 'tips', '2026-09-10 06:15:47.881921'),
(21, 'Sterile Filter Pipette Tips 10 uL', 2321, 'tips', '2026-09-10 06:15:47.881921'),
(22, 'Conical Centrifuge Tubes 50 mL Sterile', 810, 'tubes', '2026-09-10 06:15:47.881921'),
(23, 'Conical Centrifuge Tubes 15 mL Sterile', 1244, 'tubes', '2026-09-10 06:15:47.881921'),
(24, 'Umbilical Cord Blood Collection Bags (CPD)', 124, 'bags', '2026-09-10 06:15:47.881921'),
(25, 'Bone Marrow Harvest Needles 11G Jamshidi', 87, 'needles', '2026-09-10 06:15:47.881921'),
(26, 'Heparin Sodium 5000 IU/mL Injection', 112, 'vials', '2026-09-10 06:15:47.881921'),
(27, 'Phosphate Buffered Saline (PBS 1X, pH 7.4)', 177, 'bottles', '2026-09-10 06:15:47.881921'),
(28, 'Flow Cytometry 7-Color Calibration Beads', 27, 'kits', '2026-09-10 06:15:47.881921'),
(29, 'CD45-FITC / CD34-PE Dual Antibody Cocktail', 31, 'vials', '2026-09-10 06:15:47.881921'),
(30, '7-AAD Cell Viability Dye Solution', 34, 'vials', '2026-09-10 06:15:47.881921'),
(31, 'Cryogenic Freezer Racks (100-Place Stainless)', 32, 'racks', '2026-09-10 06:15:47.881921'),
(32, 'LN2 Level Monitoring Wireless Sensors', 13, 'units', '2026-09-10 06:15:47.881921'),
(33, 'Oxygen Deficiency Room Safety Monitors', 9, 'units', '2026-09-10 06:15:47.881921'),
(34, 'Thermal Paper Rolls for Controlled Freezers', 76, 'rolls', '2026-09-10 06:15:47.881921'),
(35, 'CryoMACS 250 Stem Cell Freezing Bags', 213, 'bags', '2026-09-10 06:15:47.881921'),
(36, 'CryoMACS 50 Stem Cell Freezing Bags', 213, 'bags', '2026-09-10 06:15:47.881921'),
(37, 'Syringes 20 mL Luer-Lock Sterile', 857, 'pcs', '2026-09-10 06:15:47.881921'),
(38, 'Syringes 10 mL Luer-Lock Sterile', 736, 'pcs', '2026-09-10 06:15:47.881921'),
(39, 'Syringes 5 mL Luer-Lock Sterile', 1172, 'pcs', '2026-09-10 06:15:47.881921'),
(40, 'Microcentrifuge Tubes 1.5 mL Safe-Lock', 2962, 'tubes', '2026-09-10 06:15:47.881921'),
(41, 'Petri Dishes 100 mm (TC Treated)', 407, 'dishes', '2026-09-10 06:15:47.881921'),
(42, '6-Well Tissue Culture Plates', 171, 'plates', '2026-09-10 06:15:47.881921'),
(43, '96-Well Flat-Bottom Microplates', 348, 'plates', '2026-09-10 06:15:47.881921'),
(44, 'Serological Pipettes 25 mL Sterile', 440, 'pipettes', '2026-09-10 06:15:47.881921'),
(45, 'Serological Pipettes 10 mL Sterile', 1107, 'pipettes', '2026-09-10 06:15:47.881921'),
(46, 'Serological Pipettes 5 mL Sterile', 572, 'pipettes', '2026-09-10 06:15:47.881921'),
(47, 'Polycarbonate Cryo Boxes (81-Well 2-inch)', 144, 'boxes', '2026-09-10 06:15:47.881921'),
(48, 'LN2 Transfer Hose 6ft Vacuum Insulated', 8, 'hoses', '2026-09-10 06:15:47.881921'),
(49, 'Biohazard Autoclave Bags Heavy Duty', 418, 'bags', '2026-09-10 06:15:47.881921'),
(50, 'Nitrile Gloves Powder-Free Medium', 1004, 'pairs', '2026-09-10 06:15:47.881921'),
(51, 'Nitrile Gloves Powder-Free Large', 1437, 'pairs', '2026-09-10 06:15:47.881921'),
(52, 'Isopropanol 70% Disinfection Wipes Canister', 98, 'tubs', '2026-09-10 06:15:47.881921'),
(53, 'Ethanol 100% Molecular Biology Grade (4L)', 19, 'bottles', '2026-09-10 06:15:47.881921'),
(54, 'Parafilm M Sealing Film (4 in x 125 ft)', 28, 'rolls', '2026-09-10 06:15:47.881921'),
(55, 'Electronic Pipette Controllers (Cordless)', 9, 'units', '2026-09-10 06:15:47.881921'),
(56, 'Vortex Mixer Rubber Cup Replacements', 10, 'caps', '2026-09-10 06:15:47.881921'),
(57, 'Centrifuge Bucket Adapters 50 mL', 22, 'adapters', '2026-09-10 06:15:47.881921'),
(58, 'Cryo Marker Pens (Resistant to -196C)', 62, 'pens', '2026-09-10 06:15:47.881921'),
(59, 'Cryogenic Long Tongs Stainless Steel 45cm', 10, 'pcs', '2026-09-10 06:15:47.881921'),
(60, 'Dry Ice Vapor Shippers (IATA Compliant)', 8, 'shippers', '2026-09-10 06:15:47.881921'),
(61, 'NIST Traceable Ultra-Low Temp Loggers', 21, 'loggers', '2026-09-10 06:15:47.881921'),
(62, 'StemPro MSC SFM Medium (500 mL)', 41, 'bottles', '2026-09-10 06:15:47.881921'),
(63, 'Recombinant Human G-CSF (Filgrastim 300mcg)', 76, 'vials', '2026-09-10 06:15:47.882927'),
(64, 'MACS Separation Columns (Large Scale LS)', 202, 'columns', '2026-09-10 06:15:47.882927'),
(65, 'Pre-Separation Filters 30 um', 289, 'filters', '2026-09-10 06:15:47.882927'),
(66, 'Sterile Biopsy Punches 4 mm', 113, 'punches', '2026-09-10 06:15:47.882927'),
(67, 'Cryo-Sleeve Protective Shrink Wrap Rolls', 31, 'rolls', '2026-09-10 06:15:47.882927'),
(68, 'Cell Strainer 70 um Nylon Mesh', 477, 'strainers', '2026-09-10 06:15:47.882927'),
(69, 'Cell Strainer 40 um Nylon Mesh', 392, 'strainers', '2026-09-10 06:15:47.882927'),
(70, 'Cryopreservation Solution CS10 (100 mL)', 55, 'bottles', '2026-09-10 06:15:47.882927'),
(71, 'Cryopreservation Solution CS5 (100 mL)', 43, 'bottles', '2026-09-10 06:15:47.882927'),
(72, 'Methylcellulose Complete Media with Cytokines', 76, 'tubes', '2026-09-10 06:15:47.882927'),
(73, 'HSA 20% Human Serum Albumin Solution', 106, 'vials', '2026-09-10 06:15:47.882927'),
(74, 'Gentamicin Sulfate Reagent Solution (50 mg/mL)', 62, 'vials', '2026-09-10 06:15:47.882927'),
(75, 'Penicillin-Streptomycin Solution 100X', 80, 'bottles', '2026-09-10 06:15:47.882927'),
(76, 'Sterile Drape Sheets for Bone Marrow Harvest', 166, 'sheets', '2026-09-10 06:15:47.882927'),
(77, 'Bone Marrow Filter Units 200 um', 88, 'units', '2026-09-10 06:15:47.882927'),
(78, 'Sterile Tubing Welding Wafers (Terumo TSCD)', 692, 'wafers', '2026-09-10 06:15:47.882927'),
(79, 'Sterile Connection Devices Tubing Cartridges', 87, 'cartridges', '2026-09-10 06:15:47.882927'),
(80, 'LN2 Dipsticks for Liquid Level Measurement', 14, 'sticks', '2026-09-10 06:15:47.882927'),
(81, 'Cryo-Aprons (Waterproof Low-Temp Safe)', 7, 'aprons', '2026-09-10 06:15:47.882927'),
(82, 'Sterile Syringe Filters 0.22 um PES Membrane', 614, 'filters', '2026-09-10 06:15:47.882927'),
(83, 'Sterile Syringe Filters 0.45 um PES Membrane', 387, 'filters', '2026-09-10 06:15:47.882927'),
(84, 'Cryo-Vial Color Coders (Assorted Insert Caps)', 2001, 'caps', '2026-09-10 06:15:47.882927'),
(85, 'Specimen Transport Bags (95 kPa Certified)', 626, 'bags', '2026-09-10 06:15:47.882927'),
(86, 'Bleach 10% Hospital Grade Surface Cleaner', 65, 'bottles', '2026-09-10 06:15:47.882927'),
(87, 'Sterile Surgical Scalpels #11', 404, 'blades', '2026-09-10 06:15:47.882927'),
(88, 'Sterile Surgical Scalpels #15', 211, 'blades', '2026-09-10 06:15:47.882927'),
(89, 'ELISA Wash Buffer 10X Concentrate (1L)', 39, 'bottles', '2026-09-10 06:15:47.882927'),
(90, 'TMB Substrate Reagent Set for ELISA', 23, 'sets', '2026-09-10 06:15:47.882927'),
(91, 'Cryo-Grip Forceps 25 cm Insulated', 12, 'forceps', '2026-09-10 06:15:47.882927'),
(92, 'Sterile Gauze Swabs 10x10 cm (Pack of 5)', 806, 'packs', '2026-09-10 06:15:47.882927'),
(93, 'Chlorhexidine Gluconate 2% Skin Prep Swabs', 682, 'swabs', '2026-09-10 06:15:47.882927'),
(94, 'Adhesive Wound Dressing Sterile (Tegaderm)', 565, 'dressings', '2026-09-10 06:15:47.882927'),
(95, 'Endotoxin Detection LAL Reagent Kits', 16, 'kits', '2026-09-10 06:15:47.882927'),
(96, 'Mycoplasma PCR Detection Primers Kit', 13, 'kits', '2026-09-10 06:15:47.882927'),
(97, 'Bactec Blood Culture Bottles (Aerobic)', 139, 'bottles', '2026-09-10 06:15:47.882927'),
(98, 'Bactec Blood Culture Bottles (Anaerobic)', 160, 'bottles', '2026-09-10 06:15:47.882927'),
(99, 'LN2 Exhaust Ventilation Filter Cartridges', 14, 'cartridges', '2026-09-10 06:15:47.882927'),
(100, 'HEPA Air Filters for Class 100 Cleanroom', 10, 'filters', '2026-09-10 06:15:47.882927')
ON CONFLICT (item_id) DO NOTHING;

SELECT setval('inventory_item_id_seq', (SELECT MAX(item_id) FROM inventory));
