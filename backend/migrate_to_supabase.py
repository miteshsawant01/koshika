"""
STEMBRIDGE AI - Automated Supabase Migration Tool
Transfers all tables and 100-item dataset from local SQLite into Supabase PostgreSQL.

Usage:
    python migrate_to_supabase.py
"""

import os
import sys
import json
import sqlite3
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / '.env')
load_dotenv(BASE_DIR.parent / '.env')

def run_migration():
    print("=" * 65)
    print("  STEMBRIDGE AI -> SUPABASE MIGRATION & DATA TRANSFER")
    print("=" * 65)

    db_url = os.getenv('DATABASE_URL')
    if not db_url and os.getenv('SUPABASE_DB_HOST'):
        sb_user = os.getenv('SUPABASE_DB_USER', 'postgres')
        sb_pass = os.getenv('SUPABASE_DB_PASSWORD', '')
        sb_host = os.getenv('SUPABASE_DB_HOST')
        sb_port = os.getenv('SUPABASE_DB_PORT', '5432')
        sb_name = os.getenv('SUPABASE_DB_NAME', 'postgres')
        db_url = f"postgresql://{sb_user}:{sb_pass}@{sb_host}:{sb_port}/{sb_name}"
        os.environ['DATABASE_URL'] = db_url

    if not db_url:
        print("[!] Error: DATABASE_URL is not set.")
        print("    Please set DATABASE_URL in backend/.env with your Supabase URI.")
        print("    Example:")
        print("    DATABASE_URL=postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres")
        print("=" * 65)
        sys.exit(1)

    if '[YOUR-PASSWORD]' in db_url or '[PASSWORD]' in db_url:
        print("[!] Error: Found placeholder '[YOUR-PASSWORD]' in DATABASE_URL.")
        print("    Please replace [YOUR-PASSWORD] in backend/.env with your actual database password.")
        print("=" * 65)
        sys.exit(1)

    print("\n[Step 1/4] Initializing Django with Supabase PostgreSQL...")
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    import django
    from django.core.management import call_command
    from django.db import connection
    django.setup()

    print("[Step 2/4] Applying Django database migrations on Supabase...")
    try:
        call_command('migrate', interactive=False)
        print("[OK] All database migrations applied successfully on Supabase!")
    except Exception as e:
        print(f"[ERROR] Migration failed: {e}")
        sys.exit(1)

    print("\n[Step 3/4] Transferring data from local database to Supabase...")
    sqlite_path = BASE_DIR / 'db.sqlite3'
    if not sqlite_path.exists():
        print(f"[!] Local database {sqlite_path} not found. Running seed script...")
        import seed_100_items
        print("[OK] Seed data generated directly on Supabase.")
        return

    # Connect to SQLite source
    sq_conn = sqlite3.connect(sqlite_path)
    sq_conn.row_factory = sqlite3.Row
    sq_cur = sq_conn.cursor()

    from stemcell_core.models import Patient, Donor, Storage, Staff, Research, Inventory, AuditLog, StemCellBank

    tables_config = [
        ('patients', Patient, 'patient_id', [
            'patient_id', 'name', 'age', 'blood_group', 'contact', 'disease', 'created_at'
        ]),
        ('donors', Donor, 'donor_id', [
            'donor_id', 'name', 'age', 'blood_group', 'contact', 'donation_date', 'notes', 'patient_id', 'created_at'
        ]),
        ('storage', Storage, 'storage_id', [
            'storage_id', 'donor_id', 'storage_location', 'collected_date', 'expiry_date', 'units'
        ]),
        ('staff', Staff, 'staff_id', [
            'staff_id', 'name', 'role', 'department', 'created_at'
        ]),
        ('research', Research, 'research_id', [
            'research_id', 'project_name', 'lead_scientist', 'start_date', 'status', 'summary', 'created_at'
        ]),
        ('inventory', Inventory, 'item_id', [
            'item_id', 'item_name', 'quantity', 'unit', 'last_updated'
        ]),
        ('audit_logs', AuditLog, 'id', [
            'id', 'table_name', 'operation', 'record_id', 'changed_at', 'changed_by', 'old_values', 'new_values'
        ]),
        ('stem_cell_banks', StemCellBank, 'id', [
            'id', 'bank_name', 'location'
        ]),
    ]

    report = []

    with connection.cursor() as pg_cur:
        for tbl_name, model_cls, pk_col, cols in tables_config:
            # Check SQLite rows
            sq_cur.execute(f'SELECT count(*) FROM "{tbl_name}"')
            sq_count = sq_cur.fetchone()[0]

            # Check if Supabase already has records
            pg_cur.execute(f'SELECT count(*) FROM "{tbl_name}"')
            pg_initial_count = pg_cur.fetchone()[0]

            if pg_initial_count == 0 and sq_count > 0:
                print(f"  -> Migrating {sq_count} records to '{tbl_name}'...")
                sq_cur.execute(f'SELECT * FROM "{tbl_name}" ORDER BY "{pk_col}" ASC')
                rows = sq_cur.fetchall()

                col_names_str = ', '.join([f'"{c}"' for c in cols])
                placeholders = ', '.join(['%s'] * len(cols))
                insert_sql = f'INSERT INTO "{tbl_name}" ({col_names_str}) VALUES ({placeholders}) ON CONFLICT DO NOTHING'

                batch_data = []
                for r in rows:
                    row_dict = dict(r)
                    row_vals = []
                    for c in cols:
                        val = row_dict.get(c)
                        # Parse JSON fields if string
                        if c in ('old_values', 'new_values') and isinstance(val, str) and val:
                            try:
                                val = json.loads(val)
                            except Exception:
                                pass
                        row_vals.append(val)
                    batch_data.append(row_vals)

                pg_cur.executemany(insert_sql, batch_data)
                connection.connection.commit()

            # Synchronize PostgreSQL sequence to avoid duplicate ID errors on subsequent inserts
            try:
                pg_cur.execute(f"""
                    SELECT setval(
                        pg_get_serial_sequence('{tbl_name}', '{pk_col}'),
                        COALESCE((SELECT MAX("{pk_col}") FROM "{tbl_name}"), 1) + 1,
                        false
                    );
                """)
                connection.connection.commit()
            except Exception as seq_err:
                pass

            # Final count
            pg_cur.execute(f'SELECT count(*) FROM "{tbl_name}"')
            pg_final_count = pg_cur.fetchone()[0]
            report.append((tbl_name, sq_count, pg_final_count))

    sq_conn.close()

    print("\n[Step 4/4] Verification Summary:")
    print("-" * 65)
    print(f" {'Table Name':<20} | {'SQLite Rows':<15} | {'Supabase Rows':<15} | Status")
    print("-" * 65)
    all_matched = True
    for tbl, sq_cnt, pg_cnt in report:
        status = "[OK] Synced" if pg_cnt >= sq_cnt and pg_cnt > 0 else "[!] Check"
        if status != "[OK] Synced":
            all_matched = False
        print(f" {tbl:<20} | {sq_cnt:<15} | {pg_cnt:<15} | {status}")
    print("-" * 65)

    if all_matched:
        print("\n[SUCCESS] All data has been transferred to Supabase successfully!")
        print("Your Django backend is now fully connected to Supabase PostgreSQL.")
    else:
        print("\n[i] Migration finished. Verify table counts above.")

    print("=" * 65)

if __name__ == '__main__':
    run_migration()
