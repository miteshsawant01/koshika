# STEMBRIDGE AI - Complete Application Information

## 1. Product Overview

STEMBRIDGE AI is a stem-cell care, donor coordination, biobank operations, research, and clinical intelligence platform.

The application is designed to connect:

- Patients and families seeking stem-cell care
- Doctors and transplant specialists
- Hospitals, transplant centres, and stem-cell banks
- Donor registries and HLA compatibility workflows
- Cryogenic storage and inventory operations
- Clinical report OCR and AI-assisted interpretation
- Preliminary ML-assisted assessment
- Research and clinical-trial operations
- Regulatory audit and operational reporting

The current product name shown in the frontend is **KOSHIKA - Stem Cell Care Platform**. The repository and deployment identity use **STEMBRIDGE AI**.

This software provides operational support and informational assistance. It must not be treated as an autonomous diagnostic, treatment, transplant-eligibility, or donor-selection system. A qualified clinician must review clinical decisions.

## 2. Repository Structure

```text
STEMBRIDGE AI/
|-- APP_INFORMATION.md                 This document
|-- package.json                        Root build command
|-- start_app.bat                       Local startup helper
|-- DEPLOYMENT_GUIDE.md                 Render + Vercel deployment guide
|-- SUPABASE_SETUP_GUIDE.md             Supabase database setup guide
|-- pyproject.toml                      Python project configuration
|-- vercel.json                         Root deployment configuration
|
|-- frontend/                          React 19 + Vite application
|   |-- package.json
|   |-- index.html
|   |-- vite.config.js
|   |-- public/
|   `-- src/
|       |-- App.jsx                     Router and application shell
|       |-- main.jsx                    Frontend entry point
|       |-- api/client.js               API and Supabase data access
|       |-- context/RoleContext.jsx     Role, profile, appointments, notifications
|       |-- components/                 Navbar, sidebar, AI assistant, footer
|       |-- pages/                      User-facing screens
|       |-- styles/                     Application styles
|       `-- utils/                      Supabase and utility helpers
|
|-- backend/                            Django 5 + Django REST Framework
|   |-- manage.py
|   |-- requirements.txt
|   |-- build.sh
|   |-- Procfile
|   |-- backend/                        Django settings, URLs, WSGI, ASGI
|   |-- stemcell_core/                  Core operational models and APIs
|   |-- ml_engine/                      Compatibility prediction module
|   |-- ocr_engine/                     Medical report OCR module
|   |-- ai_assistant/                   Gemini-backed assistant and interpretation
|   `-- reports/                        Dashboard statistics and PDF reports
|
|-- db/                                 SQL schemas, triggers, seeds, and RLS files
|-- dataset/                            CSV, JSON, and SQL datasets
|-- medical_reports_pdf/                Report assets and generated report material
`-- skills/                             Supabase-related project guidance
```

## 3. Technology Stack

### Frontend

- React 19
- Vite 8
- React Router 7
- Bootstrap 5
- Bootstrap Icons
- Axios compatibility layer
- Supabase JavaScript client
- Chart.js and `react-chartjs-2`

### Backend

- Python 3.12 recommended
- Django 5+
- Django REST Framework
- PostgreSQL through `psycopg2-binary` and `dj-database-url`
- SQLite fallback for local development
- MySQL compatibility for supported local environments
- Gunicorn for production serving
- WhiteNoise for static files
- `django-cors-headers` for frontend/backend communication

### AI and data processing

- Google Gemini integration for assistant and report interpretation
- Tesseract and Pillow for OCR workflows
- scikit-learn, pandas, and NumPy for ML workflows
- ReportLab for generated PDF reports

### Hosting target

- Frontend: Vercel
- Backend: Render or another WSGI-compatible host
- Database: Supabase PostgreSQL, Render PostgreSQL, or compatible PostgreSQL

## 4. Application Roles

The current frontend exposes three product perspectives through the role context:

### Patient

Patient-facing capabilities include:

- Personal health profile
- Medical history
- Medical report upload and OCR
- AI report insights
- Preliminary assessment
- Stem-cell compatibility view
- Doctor and centre discovery
- Stem-cell bank discovery
- Appointment tracking
- Notifications
- Patient AI assistant

### Doctor

Doctor-facing capabilities include:

- Clinician dashboard
- Patient and report review surfaces
- Preliminary assessment review
- Consultations and appointments
- Clinical report workflows
- AI assistant support

### Admin / Provider

Provider-facing capabilities include:

- Biobank operations dashboard
- Patient registry
- Donor registry
- Cryogenic storage records
- Inventory
- Staff directory
- Research projects
- Stem-cell banks
- Audit trail
- PDF and operational reporting

Important: the current role switcher is a frontend demonstration mechanism. It is not an authentication or authorization boundary. Real deployments require server-enforced identity, permissions, tenant isolation, and audit attribution.

## 5. Frontend Routes

Routes are registered in [frontend/src/App.jsx](frontend/src/App.jsx).

### Patient routes

| Route | Screen | Purpose |
|---|---|---|
| `/` | Dashboard | Patient overview, actions, health summary, reports, appointments |
| `/my-health/profile` | Patient Profile | Personal and clinical profile |
| `/my-health/history` | Medical History | Historical health information |
| `/ocr-reports` | Medical Report OCR | Upload, OCR, analysis, and report insights |
| `/preliminary-assessment` | Preliminary Assessment | ML-assisted initial assessment workflow |
| `/ml-match` | ML Compatibility | Donor/stem-cell compatibility view |
| `/awareness` | Awareness | Stem-cell education and safety information |
| `/find-care/doctors` | Find Doctors | Specialist discovery |
| `/find-care/centres` | Hospitals/Centres | Care-centre discovery |
| `/bank` | Bank Hub | Stem-cell bank and biobank discovery |
| `/appointments` | Appointments | Appointment list and scheduling surface |
| `/notifications` | Notifications | Notification centre |
| `/ai-assistant` | AI Chatbot | Full-page AI assistant |

### Doctor and provider routes

| Route | Screen | Purpose |
|---|---|---|
| `/doctor` | Doctor Dashboard | Clinician view |
| `/admin` | Admin Dashboard | Provider and biobank telemetry |
| `/patients` | Patients | Patient registry CRUD |
| `/donors` | Donors | Donor registry CRUD |
| `/storage` | Storage | Cryogenic storage records |
| `/inventory` | Inventory | Supplies and stock records |
| `/research` | Research | Research projects and studies |
| `/staff` | Staff | Team and specialist records |
| `/reports` | Reports | PDF reporting and audit trail |

## 6. Backend API Surface

The Django URL configuration exposes APIs under `/api/` and compatibility routes without the prefix.

### Core REST resources

Base URL: `/api/`

| Endpoint | Methods | Resource |
|---|---|---|
| `/api/patients/` | GET, POST, PUT/PATCH, DELETE | Patient records |
| `/api/donors/` | GET, POST, PUT/PATCH, DELETE | Donor records |
| `/api/storage/` | GET, POST, PUT/PATCH, DELETE | Cryogenic storage records |
| `/api/staff/` | GET, POST, PUT/PATCH, DELETE | Staff records |
| `/api/research/` | GET, POST, PUT/PATCH, DELETE | Research records |
| `/api/inventory/` | GET, POST, PUT/PATCH, DELETE | Inventory records |
| `/api/stem-cell-banks/` | GET, POST, PUT/PATCH, DELETE | Bank records |
| `/api/audit-logs/` | GET | Read-only audit records |

The core viewsets support pagination. Patient, donor, storage, staff, research, and bank resources support selected search and filtering query parameters.

### Reporting APIs

| Endpoint | Purpose |
|---|---|
| `/api/dashboard/stats/` | Totals, blood-group breakdowns, research status, inventory, and recent records |
| `/api/reports/download/` | Generates a clinical operations PDF report |

### OCR APIs

Mounted under `/api/ocr/`. The OCR module handles uploaded medical documents, text extraction, and OCR result processing. Exact endpoint details are maintained in [backend/ocr_engine/urls.py](backend/ocr_engine/urls.py).

### AI APIs

Mounted under `/api/ai/`:

| Endpoint | Purpose |
|---|---|
| `/api/ai/chat/` | AI assistant conversation |
| `/api/ai/interpret-report/` | AI-assisted report interpretation |

### ML APIs

Mounted under `/api/ml/`. The module exposes compatibility and prediction workflows defined in [backend/ml_engine/urls.py](backend/ml_engine/urls.py).

### Health checks

| Endpoint | Purpose |
|---|---|
| `/health/` | Backend and database health information |
| `/api/health/` | API-compatible health check |

## 7. Core Data Model

The principal Django models are in [backend/stemcell_core/models.py](backend/stemcell_core/models.py).

### Patient

Stores patient identity and basic clinical registry information:

- Patient ID
- Name
- Age
- Blood group
- Contact information
- Disease or condition
- Creation timestamp

### Donor

Stores donor registry information:

- Donor ID
- Name
- Age
- Blood group
- Contact information
- Donation date
- Notes
- Optional linked patient
- Creation timestamp

### Storage

Stores cryogenic unit records:

- Storage ID
- Linked donor
- Storage location
- Collection date
- Expiry date
- Unit count

### Staff

Stores operational and clinical team information:

- Staff ID
- Name
- Role
- Department
- Creation timestamp

### Research

Stores research and trial information:

- Research ID
- Project name
- Lead scientist
- Start date
- Status
- Summary
- Creation timestamp

### Inventory

Stores supplies and materials:

- Item ID
- Item name
- Quantity
- Unit
- Last updated timestamp

### AuditLog

Stores operational mutation history:

- Table name
- Operation: CREATE, UPDATE, or DELETE
- Record ID
- Timestamp
- Actor identity
- Previous values
- New values

All core CRUD viewsets now create audit records for mutations. The audit snapshot normalizes dates and other model values into JSON-safe data.

### StemCellBank

Stores registered stem-cell bank information:

- Bank ID
- Bank name
- Location

## 8. Data and Integration Flow

```text
Browser
  |
  | React Router, role context, page components
  v
Frontend API/Supabase client
  |
  | VITE_SUPABASE_URL and Supabase tables, or backend-compatible calls
  v
Supabase PostgreSQL / Django REST API
  |
  +--> stemcell_core: registries, storage, staff, inventory, research, audit
  +--> ocr_engine: document upload and text extraction
  +--> ml_engine: compatibility and assessment prediction
  +--> ai_assistant: Gemini chat and report interpretation
  `--> reports: statistics and PDF generation
```

The repository contains both Django REST resources and Supabase-oriented frontend access. Before production, choose and document one authoritative data path per workflow. Avoid allowing two clients to write the same record through different authorization models.

## 9. Local Development

### Prerequisites

- Node.js 18+ recommended
- npm
- Python 3.12 recommended
- Tesseract installed if OCR is required
- PostgreSQL/Supabase credentials for cloud database use
- Gemini API key for live AI features

### Install frontend dependencies

```powershell
npm --prefix frontend install
```

### Install backend dependencies

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
```

### Configure backend environment

Create `backend/.env`:

```ini
DJANGO_DEBUG=True
DJANGO_SECRET_KEY=local-development-secret
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOW_ALL=True
DATABASE_URL=
GEMINI_API_KEY=your-gemini-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-key
TESSERACT_CMD=
```

For production, `DJANGO_DEBUG=False` requires an explicit strong `DJANGO_SECRET_KEY`.

### Apply migrations

```powershell
cd backend
python manage.py migrate
```

### Start backend

```powershell
cd backend
python manage.py runserver 127.0.0.1:8000
```

### Start frontend

In a second terminal:

```powershell
cd frontend
npm run dev
```

Default local URLs:

- Frontend: `http://127.0.0.1:5173`
- Backend: `http://127.0.0.1:8000`
- Backend API: `http://127.0.0.1:8000/api/`
- Health check: `http://127.0.0.1:8000/api/health/`

The repository also includes `start_app.bat` for the local startup flow.

## 10. Build, Test, and Quality Checks

### Frontend production build

```powershell
npm run build
```

This runs the root build script, installs frontend dependencies, and produces `frontend/dist`.

### Frontend lint

```powershell
cd frontend
npm run lint
```

### Django checks

```powershell
cd backend
python manage.py check
```

### Production deployment checks

```powershell
$env:DJANGO_DEBUG='False'
$env:DJANGO_SECRET_KEY='use-a-long-random-validation-secret'
$env:DJANGO_ALLOWED_HOSTS='localhost'
python manage.py check --deploy
```

### Backend tests

```powershell
cd backend
python manage.py test
```

The core audit regression test verifies patient create, update, and delete events in [backend/stemcell_core/tests.py](backend/stemcell_core/tests.py).

## 11. Deployment

### Backend

The backend can run on Render, a standard Linux host, or another WSGI-compatible platform.

Typical commands:

```text
Build: ./build.sh
Start: gunicorn backend.wsgi:application
```

Required production environment variables:

```ini
DJANGO_DEBUG=False
DJANGO_SECRET_KEY=<long-random-secret>
DJANGO_ALLOWED_HOSTS=your-backend-domain.com
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
DATABASE_URL=postgresql://...
GEMINI_API_KEY=<server-side-key>
```

### Frontend

Build and deploy `frontend` as a Vite application.

Typical settings:

```text
Root directory: frontend
Build command: npm run build
Output directory: dist
```

Configure the frontend environment according to the selected data path. Do not expose service-role database credentials or private AI credentials in Vite environment variables.

### Database

Recommended production database: Supabase PostgreSQL or managed PostgreSQL.

Available database resources include:

- `db/supabase_schema.sql`
- `db/create_supabase_medical_reports.sql`
- `db/triggers_and_procedures.sql`
- `db/fix_staff_rls.sql`
- `backend/migrate_to_supabase.py`
- `backend/test_supabase_connection.py`

Run migrations before seeding data. Validate row counts and sequences after migration.

## 12. Security and Compliance Requirements

The current codebase includes initial deployment hardening and audit logging, but it is not automatically compliant with HIPAA, GDPR, DPDP, NABH, FACT, or any other regulatory framework.

Before real clinical use, implement and verify:

1. Server-side authentication using a managed identity provider or Django authentication.
2. Role-based access control enforced in backend permissions, not only in React.
3. Patient consent capture, revocation, and versioned consent records.
4. Tenant and facility isolation for providers and hospitals.
5. Encryption in transit and at rest.
6. Secrets stored only in the deployment secret manager.
7. No clinical or personal data in browser local storage unless explicitly justified and protected.
8. Secure upload validation, malware scanning, file size limits, and private object storage.
9. Immutable or append-only audit storage with restricted deletion.
10. Audit actor identity from authenticated accounts.
11. Data retention, deletion, export, and correction workflows.
12. Backup, restore, disaster recovery, and incident response procedures.
13. Rate limiting and abuse protection for AI, OCR, login, and upload endpoints.
14. Human review gates for AI and ML outputs.
15. Clinical validation, bias testing, model versioning, and rollback controls.
16. Monitoring, structured logs, alerts, and uptime checks.
17. Dependency scanning, secret scanning, SAST, DAST, and regular penetration testing.
18. Access reviews and separation of duties for administrators.

## 13. AI, OCR, and ML Safety

### AI assistant

The assistant should:

- Clearly identify itself as an assistive system.
- Avoid diagnosis or definitive treatment instructions.
- Encourage clinician review.
- Cite or link approved clinical guidance where appropriate.
- Avoid exposing private patient data to unauthorized users.
- Store prompts and outputs only when there is a documented clinical and privacy reason.

### OCR

OCR output is an extraction aid. It can contain errors from scan quality, layout, handwriting, or terminology. All extracted values must be visibly marked as unverified until checked against the source document.

### ML compatibility and assessment

Compatibility and assessment results must include:

- Model name and version
- Input data timestamp
- Feature completeness
- Confidence or uncertainty
- Explanation appropriate for the user role
- Clinician review state
- Final human decision

No model result should independently authorize a transplant, treatment, donor rejection, or patient exclusion.

## 14. Current Known Limitations

The current repository is a strong prototype and operations demonstrator, but the following work is still required for a complete industry deployment:

- Role switching is not real authentication.
- Some profile, appointment, notification, and dashboard values are frontend-managed or demo data.
- Backend CRUD endpoints need authenticated permissions and facility scoping.
- Clinical records need richer normalized models and relationships.
- Patient identity, consent, document ownership, and care-team assignment need formal workflows.
- Scheduling needs availability, conflict checking, reminders, cancellation, and timezone handling.
- Donor matching needs validated HLA data structures, eligibility workflow, and clinician approval.
- Storage needs tank/rack/box/position hierarchy, alarms, temperature telemetry, chain of custody, and incident workflows.
- Inventory needs lot numbers, expiry alerts, minimum levels, purchase orders, and stock movements.
- Research needs study governance, protocol versions, approvals, enrollment, and outcomes.
- AI/OCR services need provider abstraction, retries, queues, quotas, and redaction.
- Frontend bundle splitting and performance optimization are still needed.
- Automated end-to-end, accessibility, security, and integration tests need expansion.
- The deprecated `google.generativeai` package should be migrated to the supported Google GenAI SDK.

## 15. Recommended Product Roadmap

### Phase 1 - Identity and privacy

- Add Supabase Auth or Django authentication.
- Add organization, facility, and membership models.
- Enforce backend permissions on every resource.
- Add consent and document ownership.
- Remove demo role switching from production.

### Phase 2 - Clinical operations

- Add care episodes and clinical encounters.
- Add appointments with real scheduling rules.
- Add clinician review queues.
- Add report versioning and verification status.
- Add patient-provider communication records.

### Phase 3 - Biobank operations

- Add specimen, collection, processing, release, transport, and chain-of-custody workflows.
- Add tank telemetry and threshold alerts.
- Add inventory lots and stock movement history.
- Add controlled SOP and incident management.

### Phase 4 - AI governance

- Add asynchronous job processing.
- Add model registry and versioned outputs.
- Add redaction and prompt security.
- Add reviewer sign-off and AI output audit events.
- Add model performance monitoring and clinical validation evidence.

### Phase 5 - Enterprise readiness

- Add multi-tenant reporting.
- Add SSO, MFA, and enterprise identity integration.
- Add observability and alerting.
- Add backup/restore automation.
- Add full compliance evidence and external security review.

## 16. Important Source Files

- [frontend/src/App.jsx](frontend/src/App.jsx) - Frontend routes and shell
- [frontend/src/context/RoleContext.jsx](frontend/src/context/RoleContext.jsx) - Current role and demo session state
- [frontend/src/api/client.js](frontend/src/api/client.js) - Frontend data access layer
- [backend/backend/settings.py](backend/backend/settings.py) - Environment, database, CORS, and security configuration
- [backend/backend/urls.py](backend/backend/urls.py) - Backend route registration
- [backend/stemcell_core/models.py](backend/stemcell_core/models.py) - Core data model
- [backend/stemcell_core/views.py](backend/stemcell_core/views.py) - Core REST viewsets and audit behavior
- [backend/stemcell_core/serializers.py](backend/stemcell_core/serializers.py) - REST serialization
- [backend/reports/views.py](backend/reports/views.py) - Dashboard statistics and PDF reports
- [backend/ocr_engine/](backend/ocr_engine/) - OCR implementation
- [backend/ml_engine/](backend/ml_engine/) - ML implementation
- [backend/ai_assistant/](backend/ai_assistant/) - AI assistant implementation
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Deployment instructions
- [SUPABASE_SETUP_GUIDE.md](SUPABASE_SETUP_GUIDE.md) - Supabase setup and migration

## 17. Operational Principle

STEMBRIDGE AI should be operated as a governed clinical and biobank operations system, not as an autonomous medical decision-maker. Every high-impact workflow should have authenticated ownership, traceable changes, human review, recoverable data, and clear separation between generated assistance and approved clinical action.

## 18. Complete Industry Feature Blueprint

This section is the target feature inventory for a mature release. Features marked **Current** exist in some form in this repository. Features marked **Required** are the capabilities that should be implemented before an enterprise or clinical launch.

### 18.1 Identity, access, and organizations

| Feature | Status | Industry requirement |
|---|---|---|
| Patient, doctor, provider, and admin roles | Current prototype | Replace frontend role switching with server-enforced permissions. |
| Email/password sign-in | Required | Verified email, password policy, lockout, reset, and recovery. |
| MFA | Required | TOTP, passkeys, or enterprise identity provider. |
| SSO | Required | SAML/OIDC for hospitals, laboratories, and institutions. |
| Organization management | Required | Hospitals, banks, labs, research groups, and vendors. |
| Facility management | Required | Facility address, departments, operating hours, licenses, and contacts. |
| Memberships | Required | User-to-organization and user-to-facility assignments. |
| Fine-grained permissions | Required | Separate view, create, edit, approve, export, and delete privileges. |
| Temporary access | Required | Time-limited access for referrals, auditors, and external specialists. |
| Break-glass access | Required | Emergency access with mandatory reason and enhanced audit. |
| Session management | Required | Device list, revocation, idle timeout, and concurrent-session policy. |
| Delegation | Required | Controlled cover for clinicians and operations staff. |
| Separation of duties | Required | Independent approval for release, destruction, and critical changes. |
| Tenant isolation | Required | Database and API isolation between organizations and facilities. |
| User lifecycle | Required | Invite, activate, suspend, deactivate, archive, and periodic access review. |

### 18.2 Patient and caregiver experience

| Feature | Status | Industry requirement |
|---|---|---|
| Patient profile | Current prototype | Add verified identity, demographics, language, accessibility, and contact preferences. |
| Caregiver and proxy access | Required | Consent-based access for parents, guardians, and caregivers. |
| Patient registration | Required | Duplicate detection, identity verification, referral source, and intake checklist. |
| Patient timeline | Required | Unified view of encounters, reports, specimens, appointments, and decisions. |
| Conditions and diagnoses | Required | Structured coding, onset, status, certainty, and clinician attribution. |
| Allergies and alerts | Required | Severity, reaction, verification state, and prominent safety alerts. |
| Medication list | Required | Active, historical, dose, route, prescribing clinician, and reconciliation. |
| Family history | Required | Structured hereditary and transplant-relevant history. |
| Social and consent history | Required | Communication preferences, language, consent, and support needs. |
| Patient questionnaires | Required | Configurable forms, scoring, signatures, and versioning. |
| Patient portal messaging | Required | Secure asynchronous messaging with routing and response targets. |
| Patient task list | Required | Outstanding documents, consent, appointments, tests, and follow-ups. |
| Patient notifications | Current prototype | Add templates, delivery status, preferences, escalation, and quiet hours. |
| Multilingual UI | Required | Localized content and medically reviewed translations. |
| Accessibility | Required | WCAG 2.2 AA keyboard, contrast, labels, focus, screen-reader, and motion support. |

### 18.3 Clinical care and transplant coordination

| Feature | Status | Industry requirement |
|---|---|---|
| Care episode | Required | Referral-to-discharge episode with status and responsible team. |
| Clinical encounter | Required | Date, type, participants, notes, diagnoses, plan, and signature. |
| Referral management | Required | Referral intake, triage, acceptance, rejection reason, and SLA tracking. |
| Clinical work queues | Required | Role-specific queues for unreviewed, urgent, overdue, and blocked work. |
| Clinical note templates | Required | Versioned specialty templates with required fields. |
| Problem list | Required | Longitudinal active and resolved conditions. |
| Vitals and observations | Required | Structured values, units, reference ranges, and provenance. |
| Lab orders and results | Required | Order, collection, result, verification, amendment, and critical-value workflow. |
| HLA typing | Required | High-resolution loci, allele notation, laboratory provenance, and verification. |
| Blood group and antibody data | Required | ABO/Rh, antibody screen, transfusion history, and verification. |
| Transplant assessment | Required | Structured clinical review with evidence, reviewer, decision, and date. |
| Donor search case | Required | Search strategy, registry requests, family typing, and outcome tracking. |
| Conditioning plan | Required | Versioned plan, review, consent, medications, and schedule. |
| Transplant episode | Required | Admission, conditioning, infusion, engraftment, complications, and discharge. |
| Post-transplant follow-up | Required | Scheduled assessments, labs, complications, and survivorship plan. |
| Clinical escalation | Required | Critical result routing, acknowledgement, escalation, and closure. |
| Multidisciplinary review | Required | Case conference agenda, attendees, decisions, and sign-off. |
| Clinical decision support | Required | Rules with source, version, override reason, and human approval. |

### 18.4 Medical documents, OCR, and records

| Feature | Status | Industry requirement |
|---|---|---|
| Report upload | Current prototype | Add private storage, malware scanning, file limits, and ownership. |
| OCR extraction | Current prototype | Store source, engine version, confidence, regions, and corrections. |
| Document classification | Required | CBC, HLA, pathology, imaging, consent, referral, and other categories. |
| Document metadata | Required | Patient, encounter, author, facility, specimen date, received date, and source. |
| Human verification | Required | Field-level review and final verified state. |
| Document versioning | Required | Original, amended, corrected, superseded, and retracted versions. |
| Digital signatures | Required | Signer identity, timestamp, certificate, and signature meaning. |
| Document search | Required | Permission-aware full-text and metadata search. |
| Redaction | Required | Permanent redaction for exports and external sharing. |
| Secure sharing | Required | Expiring links, recipient identity, access log, and revocation. |
| Retention policy | Required | Retention period by record type and legal hold support. |
| Export package | Required | Patient-authorized or regulated export with manifest and checksum. |

### 18.5 Donor registry and matching

| Feature | Status | Industry requirement |
|---|---|---|
| Donor registration | Current prototype | Add identity verification, eligibility, consent, and contact preferences. |
| Donor eligibility | Required | Medical questionnaire, risk screening, deferral, re-entry, and reviewer. |
| HLA profile | Required | Structured class I/II alleles, resolution, source, and verification. |
| Donor availability | Required | Available, reserved, contacted, deferred, unavailable, and withdrawn. |
| Donor consent | Required | Collection consent, research consent, storage consent, and withdrawal. |
| Match scoring | Current prototype | Add explainable algorithm version, missing data, and confidence. |
| Match review | Required | Clinician approval, alternatives, conflict handling, and decision history. |
| Search requests | Required | Registry request, response SLA, documentation, and closure. |
| Donor communication | Required | Consent-aware contact workflow and communication history. |
| Collection scheduling | Required | Apheresis/marrow appointment, readiness checks, and cancellation. |
| Donor safety | Required | Mobilization, adverse events, follow-up, and recovery tracking. |
| Donor privacy | Required | Restricted access, pseudonymization, and withdrawal handling. |

### 18.6 Specimen, laboratory, and chain of custody

| Feature | Status | Industry requirement |
|---|---|---|
| Specimen registration | Required | Unique accession, specimen type, source, collection time, and collector. |
| Barcode and label printing | Required | GS1-compatible or validated internal labels and scan history. |
| Collection workflow | Required | Checklist, kit, deviations, temperature, and transport handoff. |
| Processing workflow | Required | Protocol, operator, equipment, reagents, lot numbers, and timestamps. |
| Cell count and viability | Required | Results, method, units, reference thresholds, and reviewer. |
| CD34+ results | Required | Count, dose calculation, target comparison, and verification. |
| Sterility and release testing | Required | Test result, laboratory, method, status, and release approval. |
| Cryopreservation | Required | Cryoprotectant, controlled-rate freezing, operator, and protocol version. |
| Aliquot management | Required | Parent-child specimen relationships and unit-level tracking. |
| Chain of custody | Required | Every handoff, location, actor, timestamp, and reason. |
| Transport | Required | Courier, packaging, temperature, route, departure, receipt, and exception. |
| Deviation management | Required | Deviation, risk, CAPA, approval, and disposition. |
| Specimen release | Required | Request, authorization, picking, double-check, dispatch, and receipt. |
| Specimen destruction | Required | Approval, reason, witness, method, certificate, and audit. |

### 18.7 Biobank, cryogenic storage, and telemetry

| Feature | Status | Industry requirement |
|---|---|---|
| Storage records | Current prototype | Extend to facility, room, tank, rack, box, position, and unit. |
| Tank hierarchy | Required | Facility > room > tank > canister > rack > box > position. |
| Temperature telemetry | Required | Sensor ingestion, thresholds, calibration, graphing, and retention. |
| Alarm management | Required | Alarm acknowledgement, escalation, maintenance, and closure. |
| LN2 monitoring | Required | Level, refill schedule, supplier, and safety inspection. |
| Location scans | Required | Barcode/RFID scans for every movement. |
| Capacity planning | Required | Occupancy, reserved positions, forecast, and utilization. |
| Access control | Required | Restricted storage access with entry and action logs. |
| Equipment maintenance | Required | Preventive maintenance, calibration, service records, and downtime. |
| Disaster recovery | Required | Backup storage location, emergency transfer, and recovery drill. |
| Quarantine | Required | Quarantine location, reason, review, and release/disposition. |
| Expiry and review alerts | Required | Configurable alerts, acknowledgement, and escalation. |

### 18.8 Inventory, procurement, and suppliers

| Feature | Status | Industry requirement |
|---|---|---|
| Inventory items | Current prototype | Add category, lot, serial, expiry, supplier, and storage location. |
| Stock movements | Required | Receive, issue, transfer, adjust, return, and destroy. |
| Lot traceability | Required | Link lot to procedure, specimen, patient, and supplier. |
| Minimum stock levels | Required | Reorder threshold, safety stock, and lead time. |
| Purchase requests | Required | Request, approval, quote, order, receipt, and invoice match. |
| Supplier management | Required | Qualification, contract, contacts, risk, and review date. |
| Expiry control | Required | FEFO picking, expiry alerts, quarantine, and disposal. |
| Temperature-sensitive goods | Required | Receipt condition, logger data, excursion, and disposition. |
| Stocktake | Required | Scheduled count, variance, approval, and investigation. |
| Cost tracking | Required | Unit cost, budget, purchase history, and valuation. |

### 18.9 Appointments, communication, and service operations

| Feature | Status | Industry requirement |
|---|---|---|
| Appointment list | Current prototype | Add real calendar, availability, and conflict checking. |
| Provider calendars | Required | Working hours, leave, rooms, equipment, and resource capacity. |
| Appointment types | Required | Consultation, collection, infusion, lab, telehealth, and follow-up. |
| Booking workflow | Required | Request, triage, confirmation, reschedule, cancellation, and waitlist. |
| Reminders | Required | Email, SMS, push, WhatsApp where lawful, and delivery tracking. |
| Telehealth | Required | Secure video link, consent, waiting room, and session record. |
| Check-in | Required | QR/kiosk/manual check-in, queue, and arrival status. |
| No-show workflow | Required | Reason, follow-up, risk flag, and rescheduling. |
| Secure messaging | Required | Thread, participants, attachments, response SLA, and retention. |
| Call centre | Required | Contact history, callback task, disposition, and escalation. |

### 18.10 Research and clinical trials

| Feature | Status | Industry requirement |
|---|---|---|
| Research projects | Current prototype | Add protocol, sponsor, funding, sites, and governance. |
| Study registry | Required | Study ID, phase, intervention, eligibility, and status. |
| Ethics approval | Required | Committee, approval number, version, dates, and conditions. |
| Protocol versioning | Required | Version comparison, effective date, and investigator sign-off. |
| Participant screening | Required | Criteria, screen result, reason, and reviewer. |
| Informed consent | Required | Study-specific consent, signatures, witness, and re-consent. |
| Study visits | Required | Visit schedule, assessments, deviations, and completion. |
| Adverse events | Required | Severity, seriousness, causality, action, and reporting. |
| Data capture | Required | Validated forms, edit checks, query management, and freeze. |
| Study exports | Required | De-identified, versioned, approved, and logged exports. |

### 18.11 AI, automation, and analytics

| Feature | Status | Industry requirement |
|---|---|---|
| AI assistant | Current prototype | Add tenant isolation, redaction, quotas, and review policy. |
| Report interpretation | Current prototype | Display source evidence, confidence, and clinician verification. |
| ML compatibility | Current prototype | Version model, features, calibration, bias, and approval. |
| Workflow automation | Required | Rules engine for reminders, routing, alerts, and escalations. |
| Background jobs | Required | Queue OCR, AI, exports, notifications, and integrations. |
| Prompt management | Required | Versioned prompts, approved templates, and change review. |
| AI evaluation | Required | Golden datasets, hallucination tests, safety tests, and monitoring. |
| Model registry | Required | Model artifacts, version, training data, metrics, and owner. |
| Human review | Required | Accept, amend, reject, escalate, and reason. |
| Operational dashboards | Current prototype | Add filters, saved views, drill-down, and permission-aware metrics. |
| KPI library | Required | Defined formulas, owner, source, refresh time, and data quality. |
| Forecasting | Required | Capacity, inventory, donor search, and appointment demand. |
| Data quality | Required | Completeness, duplicates, invalid values, and remediation queues. |

### 18.12 Billing, contracts, and finance

| Feature | Status | Industry requirement |
|---|---|---|
| Service catalogue | Required | Consultation, processing, storage, testing, and transport services. |
| Estimates | Required | Itemized estimate, validity, approval, and revision history. |
| Payers | Required | Patient, insurer, hospital, sponsor, or research funder. |
| Invoices | Required | Tax, currency, adjustments, payment state, and receipt. |
| Insurance authorization | Required | Request, documents, response, expiry, and denial reason. |
| Refunds and credits | Required | Approval, reason, accounting reference, and audit. |
| Contract management | Required | Supplier, facility, SLA, renewal, and obligations. |

### 18.13 Quality, governance, and regulatory operations

| Feature | Status | Industry requirement |
|---|---|---|
| Audit logs | Current | Add immutable storage, actor identity, export, and retention controls. |
| SOP management | Required | Controlled documents, version, approval, training, and acknowledgement. |
| CAPA | Required | Corrective/preventive action, owner, due date, evidence, and effectiveness. |
| Incident management | Required | Safety, privacy, quality, equipment, and operational incidents. |
| Risk register | Required | Risk, likelihood, impact, control, owner, and review. |
| Change control | Required | Request, impact, testing, approval, release, and rollback. |
| Training records | Required | Course, role, completion, expiry, assessment, and evidence. |
| Internal audits | Required | Plan, scope, findings, response, and closure. |
| External audits | Required | Auditor access, evidence room, findings, and remediation. |
| Accreditation evidence | Required | Traceable evidence for applicable clinical and biobank standards. |
| Legal holds | Required | Prevent deletion while a matter or investigation is active. |
| Policy acceptance | Required | Versioned acknowledgement and re-acknowledgement. |

### 18.14 Interoperability and integrations

| Integration | Status | Industry requirement |
|---|---|---|
| PostgreSQL/Supabase | Current | Managed database, RLS, backups, migrations, and monitoring. |
| REST API | Current | Versioned, documented, authenticated, rate-limited API. |
| FHIR | Required | Patient, Practitioner, Organization, Observation, DiagnosticReport, DocumentReference, ServiceRequest, Appointment, and Consent. |
| HL7 v2 | Required | ADT, ORM, ORU, and result acknowledgements where needed. |
| Laboratory systems | Required | Orders, results, accession, and specimen reconciliation. |
| Hospital information systems | Required | Referrals, encounters, demographics, and discharge data. |
| Identity providers | Required | OIDC/SAML, SCIM, and group-to-role mapping. |
| Email/SMS provider | Required | Templates, delivery status, opt-out, and provider failover. |
| Payment provider | Required | PCI-aware tokenized payment integration. |
| Barcode/RFID devices | Required | Validated scan events and device assignment. |
| IoT sensors | Required | Signed telemetry, offline buffering, alerting, and calibration. |
| Object storage | Required | Private buckets, signed URLs, lifecycle rules, and encryption. |
| Data warehouse | Required | Governed analytics replica with de-identification. |

### 18.15 Platform engineering and operations

| Feature | Status | Industry requirement |
|---|---|---|
| Health endpoint | Current | Add dependency checks, readiness, liveness, and version. |
| Structured logging | Required | JSON logs with correlation ID and privacy filtering. |
| Error tracking | Required | Stack traces, release, user context, and alert routing. |
| Metrics | Required | Latency, errors, queue depth, storage, alerts, and business KPIs. |
| Tracing | Required | Request tracing across frontend, API, jobs, AI, and integrations. |
| Backups | Required | Encrypted scheduled backups with restore verification. |
| Disaster recovery | Required | RPO/RTO targets, failover plan, and regular drills. |
| Feature flags | Required | Controlled rollout, tenant targeting, and emergency disable. |
| CI/CD | Required | Tests, lint, security scans, migrations, deploy approvals, and rollback. |
| Infrastructure as code | Required | Reproducible environments and reviewed configuration. |
| Dependency updates | Required | Automated update review and vulnerability response. |
| Performance budgets | Required | Page, API, job, and export latency targets. |
| Offline resilience | Required | Safe retry, idempotency, queueing, and conflict handling. |
| Status page | Required | Service health and incident communication. |

## 19. Definition of Industry Readiness

The platform should not be considered production-ready for real clinical data until all of the following are true:

- Every user action is tied to an authenticated identity.
- Every record is scoped to an authorized organization and facility.
- Every clinical decision has a responsible human reviewer.
- Every specimen can be traced from collection through storage, movement, release, or destruction.
- Every document has ownership, version, provenance, retention, and access history.
- Every AI or ML output includes model version, confidence, evidence, and review state.
- Every critical alert has acknowledgement, escalation, and closure.
- Every deployment has automated tests, security checks, backups, monitoring, and rollback.
- Every regulatory requirement applicable to the operating jurisdiction has an owner and evidence record.
- A restore drill, access review, incident drill, and disaster-recovery drill have been completed successfully.

## 20. Recommended Delivery Order

1. Authentication, MFA, organizations, facility scoping, and backend permissions.
2. Consent, patient identity, document ownership, and secure file storage.
3. Patient timeline, clinical encounters, referral queue, and clinician review.
4. Structured HLA, donor eligibility, matching review, and decision audit.
5. Specimen lifecycle, chain of custody, cryogenic location hierarchy, and telemetry.
6. Inventory lots, procurement, expiry, supplier, and stock movement workflows.
7. Scheduling, secure messaging, reminders, and telehealth.
8. AI governance, background jobs, redaction, model registry, and human sign-off.
9. FHIR/HL7 integrations and validated external data exchange.
10. Quality management, CAPA, SOPs, training, audit evidence, and accreditation readiness.
11. Observability, backup/restore, disaster recovery, penetration testing, and launch certification.
