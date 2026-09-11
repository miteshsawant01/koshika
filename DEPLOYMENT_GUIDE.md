# STEMBRIDGE AI — Zero-Cost Production Deployment Guide
### Architecture: Vercel (Frontend) + Render (Backend & Database)

This full-stack application is pre-configured for free deployment:
- **Frontend (Vite + React 19):** Hosted on **Vercel** with global CDN and automatic SPA routing.
- **Backend (Django 5 + REST):** Hosted on **Render** (Free Web Service) with Gunicorn & WhiteNoise.
- **Database:** Supabase PostgreSQL (Permanent Free Tier - Recommended), Render PostgreSQL, or Cloud MySQL.

---

## Part 1: Push Code to GitHub

1. Open your terminal in the project root:
   `ash
   cd "c:\Users\MITESH SAWANT\Downloads\STEMBRIDGE AI"
   git init
   git add .
   git commit -m "Configure production deployment for Vercel and Render"
   `
2. Create a new repository on [GitHub](https://github.com/new) (e.g. stembridge-ai).
3. Push your code:
   `ash
   git remote add origin https://github.com/YOUR_USERNAME/stembridge-ai.git
   git branch -M main
   git push -u origin main
   `

---

## Part 2: Deploy Backend on Render (Free)

### Option A: Automatic via Render Blueprint (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com/) -> Click **New +** -> **Blueprint**.
2. Connect your GitHub repository stembridge-ai.
3. Render will read [render.yaml](file:///c:/Users/MITESH%20SAWANT/Downloads/STEMBRIDGE%20AI/render.yaml) and automatically create:
   - **Database:** Free PostgreSQL instance (stemcelldb).
   - **Web Service:** Free Python service with gunicorn.
4. Click **Apply**.

---

### Option B: Manual Setup on Render
1. **Create Free Database (PostgreSQL):**
   - Click **New +** -> **PostgreSQL**.
   - Name: stembridge-db
   - Database: stemcelldb
   - Plan: **Free**
   - Click **Create Database**.
   - Copy the **Internal Database URL** (or External Database URL).

2. **Create Web Service:**
   - Click **New +** -> **Web Service**.
   - Connect your GitHub repository.
   - **Name:** stembridge-backend
   - **Root Directory:** ackend
   - **Runtime:** Python 3
   - **Build Command:** ./build.sh
   - **Start Command:** gunicorn backend.wsgi:application
   - **Plan:** Free

3. **Configure Environment Variables in Render:**
   Under **Environment Variables**, add:
   - PYTHON_VERSION = 3.12.0
   - DEBUG = False
   - SECRET_KEY = (Click Generate or provide random string)
   - DATABASE_URL = (Paste your Render PostgreSQL connection string)
   - GEMINI_API_KEY = (Your Gemini API Key)

4. **Seed Database on Render (One-Time):**
   Once the service is deployed, open the **Shell** tab in Render:
   `ash
   python seed_100_items.py
   `
   This populates the 100 patient, donor, and cryo vault records.

5. **Copy Your Live Backend URL:**
   Your backend URL will look like:
   https://stembridge-backend.onrender.com

---

## Part 3: Deploy Frontend on Vercel (Free)

1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Click **Import** next to your stembridge-ai repository.
3. Configure Project Settings:
   - **Framework Preset:** Vite
   - **Root Directory:** Click **Edit** and select rontend.
   - **Build Command:** 
pm run build
   - **Output Directory:** dist
4. Add **Environment Variable**:
   - **Key:** VITE_API_BASE_URL
   - **Value:** https://stembridge-backend.onrender.com/api *(replace with your actual Render URL)*
5. Click **Deploy**.

---

## Pre-Configured Production Enhancements in Codebase

1. [frontend/vercel.json](file:///c:/Users/MITESH%20SAWANT/Downloads/STEMBRIDGE%20AI/frontend/vercel.json):
   Configured with SPA rewrite rules (/index.html) to prevent 404 errors on browser page reloads.

2. [frontend/src/api/client.js](file:///c:/Users/MITESH%20SAWANT/Downloads/STEMBRIDGE%20AI/frontend/src/api/client.js):
   Dynamic VITE_API_BASE_URL with automatic slash trimming and fallback to localhost.

3. [backend/build.sh](file:///c:/Users/MITESH%20SAWANT/Downloads/STEMBRIDGE%20AI/backend/build.sh):
   Automates dependency installation, static asset collection, and database migrations.

4. [backend/backend/settings.py](file:///c:/Users/MITESH%20SAWANT/Downloads/STEMBRIDGE%20AI/backend/backend/settings.py):
   - Integrated **WhiteNoise** for instant, high-speed static asset serving directly through Django.
   - Dynamic database resolution via dj-database-url (supports PostgreSQL on Render, MySQL locally).
   - Global CORS headers allowing cross-origin API calls from Vercel.

5. [render.yaml](file:///c:/Users/MITESH%20SAWANT/Downloads/STEMBRIDGE%20AI/render.yaml):
   Infrastructure-as-Code blueprint for 1-click backend and database provisioning.
