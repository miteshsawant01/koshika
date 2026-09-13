-- =============================================================
-- STEMBRIDGE AI / KOSHIKA - Fix Staff Table Row Level Security (RLS)
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hytzgimcitwdvsdzgjxz/sql
-- =============================================================

-- Option 1: Enable RLS and grant full read/write access to public & anon users
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access for staff" ON staff;
DROP POLICY IF EXISTS "Enable read access for all users" ON staff;
DROP POLICY IF EXISTS "Enable insert for authenticated and anon" ON staff;

CREATE POLICY "Allow full access for staff" 
ON staff 
FOR ALL 
TO public 
USING (true) 
WITH CHECK (true);

-- Option 2 (Alternative): If you prefer to disable RLS completely on staff:
-- ALTER TABLE staff DISABLE ROW LEVEL SECURITY;

-- Verify policy status
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename = 'staff';
