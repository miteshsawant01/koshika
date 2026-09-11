# STEMBRIDGE AI - Supabase Database Integration Guide

This guide walks you through connecting the entire STEMBRIDGE AI platform (Django Backend, React UI, AI Assistant, and Database Models) to **Supabase (PostgreSQL)**.

---

## Why Supabase?
- **Cloud-Native PostgreSQL:** Fast, reliable, enterprise-grade database.
- **Permanent Free Tier:** Unlike Render's free PostgreSQL (which expires after 30 days), Supabase free tier remains active.
- **Built-in Dashboard:** Visual table editor, SQL runner, and automatic backups.
- **Real-Time & Auth Ready:** Ready for Supabase Auth and Realtime subscriptions if needed.

---

## Step 1: Get Your Supabase Database Connection URI

1. Log in to [Supabase Dashboard](https://supabase.com/dashboard).
2. Create a new project (or select an existing project, e.g. `stembridge-ai`).
3. Note your **Database Password** (created during project setup).
4. Go to **Project Settings** (gear icon in the left sidebar) -> **Database**.
5. Scroll down to **Connection parameters** -> **Connection string** -> select the **URI** tab.
6. Choose one of the two recommended connection modes:
   - **Session Pooler (Port 5432) — RECOMMENDED:**
     ```
     postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
     ```
   - **Direct Connection (Port 5432):**
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
     ```

> [!TIP]
> Always replace `[YOUR-PASSWORD]` with your actual database password.
> If your password contains special characters (like `@`, `#`, `%`, `&`), make sure they are URL-encoded (e.g. `@` becomes `%40`).

---

## Step 2: Configure Your `.env` File

Open `backend/.env` (or copy from `backend/.env.example`) and paste your connection string:

```ini
# backend/.env
DATABASE_URL=postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres

# (Optional) Supabase API credentials for direct client access
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_KEY=your-anon-or-service-role-key

DEBUG=True
SECRET_KEY=django-insecure-stembridge-supabase-ai-secret-key-2026
GEMINI_API_KEY=your-gemini-api-key
```

---

## Step 3: Verify Connection

In your terminal, test the connection to ensure your password and network credentials are valid:

```powershell
cd backend
python test_supabase_connection.py
```

You should see:
```text
[OK] Successfully connected to PostgreSQL!
     Version: PostgreSQL 15...
```

---

## Step 4: Migrate Tables and Data to Supabase

Run the automated one-command migration script:

```powershell
cd backend
python migrate_to_supabase.py
```

### What this script automatically does:
1. Runs Django migrations (`call_command('migrate')`) on Supabase to create all system tables and core models.
2. Migrates all **100 records** from each table (`patients`, `donors`, `storage`, `staff`, `research`, `inventory`, `audit_logs`).
3. Automatically updates PostgreSQL sequences (`setval`) so that future records added via the app seamlessly increment without ID collision.
4. Outputs a verification table comparing SQLite vs Supabase row counts.

---

## Step 5: (Alternative) Run SQL Directly in Supabase Dashboard

If you prefer to initialize tables directly from the browser:
1. In your Supabase Dashboard, click **SQL Editor** in the left menu.
2. Click **New query**.
3. Open [`db/supabase_schema.sql`](file:///c:/Users/MITESH%20SAWANT/Downloads/STEMBRIDGE%20AI/db/supabase_schema.sql) from this repository, copy the entire content, and paste it into the editor.
4. Click **Run**.
5. All 7 tables, PostgreSQL PL/pgSQL audit triggers, indexes, and Row Level Security (RLS) policies will be created immediately!

---

## Step 6: Start Your Application

Once migrated, start your full-stack app as normal:

Double-click:
```powershell
start_app.bat
```
Or manually:
```powershell
# Terminal 1 (Django Backend connected to Supabase):
cd backend
python manage.py runserver 127.0.0.1:8000

# Terminal 2 (React Frontend UI):
cd frontend
npm run dev
```

- **Frontend UI:** http://127.0.0.1:5173
- **Backend API:** http://127.0.0.1:8000/api/

---

## Deploying with Supabase on Render

When deploying your backend to Render:
1. In the **Render Dashboard**, open your web service (`stembridge-backend`).
2. Go to **Environment**.
3. Add or update the variable:
   - **Key:** `DATABASE_URL`
   - **Value:** Paste your Supabase **Session Pooler URI** (`aws-0-[REGION].pooler.supabase.com:5432`).
4. Click **Save Changes**. Render will automatically redeploy and point all queries directly to your Supabase PostgreSQL cluster!
