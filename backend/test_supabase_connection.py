"""
STEMBRIDGE AI - Supabase Connection Tester
Run this script to verify your database connection to Supabase:
    python test_supabase_connection.py
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load .env from current directory or backend directory
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / '.env')
load_dotenv(BASE_DIR.parent / '.env')

def test_connection():
    print("=" * 60)
    print("STEMBRIDGE AI - SUPABASE CONNECTION TEST")
    print("=" * 60)

    db_url = os.getenv('DATABASE_URL')
    
    # Fallback to individual SUPABASE_* vars if available
    if not db_url and os.getenv('SUPABASE_DB_HOST'):
        sb_user = os.getenv('SUPABASE_DB_USER', 'postgres')
        sb_pass = os.getenv('SUPABASE_DB_PASSWORD', '')
        sb_host = os.getenv('SUPABASE_DB_HOST')
        sb_port = os.getenv('SUPABASE_DB_PORT', '5432')
        sb_name = os.getenv('SUPABASE_DB_NAME', 'postgres')
        db_url = f"postgresql://{sb_user}:{sb_pass}@{sb_host}:{sb_port}/{sb_name}"

    if not db_url:
        print("[!] No DATABASE_URL found in environment or backend/.env file.")
        print()
        print("To connect your database to Supabase:")
        print("1. Go to https://supabase.com/dashboard")
        print("2. Open your project -> Project Settings -> Database")
        print("3. Under 'Connection string' -> Select 'URI'")
        print("   (Choose 'Session pooler' or 'Direct connection' on port 5432)")
        print("4. Copy the URI and paste it in backend/.env:")
        print("   DATABASE_URL=postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres")
        print("5. Re-run this script: python test_supabase_connection.py")
        print("=" * 60)
        return False

    if '[YOUR-PASSWORD]' in db_url or '[PASSWORD]' in db_url:
        print("[!] Found placeholder '[YOUR-PASSWORD]' in DATABASE_URL.")
        print("    Please replace [YOUR-PASSWORD] in backend/.env with your actual Supabase database password.")
        print("    (You set this password when creating the project 'hytzgimcitwdvsdzgjxz' in Supabase)")
        print("=" * 60)
        return False

    # Mask password for display
    try:
        from urllib.parse import urlparse
        parsed = urlparse(db_url)
        masked_netloc = f"{parsed.username}:****@{parsed.hostname}:{parsed.port}"
        masked_url = parsed._replace(netloc=masked_netloc).geturl()
        print(f"Target URL: {masked_url}")
        print(f"Host:       {parsed.hostname}")
        print(f"Port:       {parsed.port or 5432}")
        print(f"Database:   {parsed.path.lstrip('/')}")
        print(f"User:       {parsed.username}")
        
        is_supabase = 'supabase.co' in (parsed.hostname or '') or 'pooler.supabase.com' in (parsed.hostname or '')
        if is_supabase:
            print("[+] Supabase infrastructure detected.")
            if parsed.port == 6543:
                print("[i] Port 6543 (Transaction Pooler) detected.")
            elif parsed.port == 5432:
                print("[i] Port 5432 (Session Pooler / Direct) detected. (Recommended)")
    except Exception:
        print(f"Target URL: (Raw custom string)")

    print()
    print("Testing connection...")

    try:
        import psycopg2
        
        # Connect using psycopg2
        # Ensure sslmode is require for cloud / supabase
        conn_kwargs = {'sslmode': 'require'} if 'supabase' in db_url else {}
        conn = psycopg2.connect(db_url, **conn_kwargs)
        cur = conn.cursor()

        # Query PostgreSQL version
        cur.execute("SELECT version();")
        version = cur.fetchone()[0]
        print(f"[OK] Successfully connected to PostgreSQL!")
        print(f"     Version: {version[:50]}...")

        # Query public tables
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """)
        tables = [r[0] for r in cur.fetchall()]
        print(f"\nFound {len(tables)} table(s) in 'public' schema:")

        core_tables = ['patients', 'donors', 'storage', 'staff', 'research', 'inventory', 'audit_logs']
        found_core = []
        for tbl in tables:
            cur.execute(f'SELECT count(*) FROM "{tbl}"')
            cnt = cur.fetchone()[0]
            marker = " (Core App Table)" if tbl in core_tables else ""
            print(f"  - {tbl:<25}: {cnt:>6} rows{marker}")
            if tbl in core_tables:
                found_core.append(tbl)

        missing_core = set(core_tables) - set(found_core)
        print()
        if missing_core:
            print(f"[!] Note: The following core tables are not yet created in Supabase: {', '.join(missing_core)}")
            print("    Run 'python migrate_to_supabase.py' to create tables and import all data!")
        else:
            print("[SUCCESS] All core tables are present in Supabase!")

        cur.close()
        conn.close()
        print("=" * 60)
        return True

    except Exception as e:
        print(f"\n[ERROR] Connection failed: {e}")
        print()
        print("Troubleshooting Tips:")
        print("1. Password check: Ensure [YOUR-PASSWORD] in the URI was replaced with your actual database password.")
        print("2. Connection mode: If IPv4 network, use the 'Session Pooler' URI (aws-0-[region].pooler.supabase.com:5432).")
        print("3. Special characters in password: If your password contains '@', ':', '%', URL-encode them.")
        print("=" * 60)
        return False

if __name__ == '__main__':
    test_connection()
