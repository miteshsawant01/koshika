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
