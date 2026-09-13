-- =============================================================================
-- KOSHIKA (STEMBRIDGE AI) - Supabase Medical Reports Table Schema
-- =============================================================================
-- Run this SQL in your Supabase Web Dashboard:
-- 1. Open your Supabase Project Dashboard: https://supabase.com/dashboard/project/hytzgimcitwdvsdzgjxz
-- 2. Click "SQL Editor" on the left navigation menu.
-- 3. Click "New query".
-- 4. Paste this entire script and click "Run".
-- =============================================================================

-- 1. Create the medical_reports table
CREATE TABLE IF NOT EXISTS medical_reports (
    id SERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) DEFAULT 'GENERAL',
    status VARCHAR(50) DEFAULT 'Analyzed',
    patient_name VARCHAR(150),
    age INT,
    blood_group VARCHAR(10),
    disease VARCHAR(255),
    cd34_count VARCHAR(50),
    viability VARCHAR(50),
    extracted_text TEXT,
    parsed_data JSONB,
    is_valid BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Enable Indexes for fast searching
CREATE INDEX IF NOT EXISTS idx_medical_reports_patient ON medical_reports(patient_name);
CREATE INDEX IF NOT EXISTS idx_medical_reports_type ON medical_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_medical_reports_created ON medical_reports(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE medical_reports ENABLE ROW LEVEL SECURITY;

-- 4. Create permissive policies for application read/write/delete access
DROP POLICY IF EXISTS "Allow public read access to medical_reports" ON medical_reports;
CREATE POLICY "Allow public read access to medical_reports" 
ON medical_reports FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access to medical_reports" ON medical_reports;
CREATE POLICY "Allow public insert access to medical_reports" 
ON medical_reports FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access to medical_reports" ON medical_reports;
CREATE POLICY "Allow public update access to medical_reports" 
ON medical_reports FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete access to medical_reports" ON medical_reports;
CREATE POLICY "Allow public delete access to medical_reports" 
ON medical_reports FOR DELETE USING (true);

-- Confirmation message
COMMENT ON TABLE medical_reports IS 'Stores uploaded diagnostic and laboratory documents, HLA typing panels, CBCs, and flow cytometry charts in KOSHIKA';
