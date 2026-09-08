import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { patientProfile, appointments } = useRole();

  const nextAppt = appointments && appointments.length > 0 ? appointments[0] : null;

  const recentReports = [
    {
      id: 'REP-2026-001',
      title: 'Peripheral Blood CBC & CD34+ Count',
      date: 'Yesterday, 3:15 PM',
      status: 'Analyzed',
      highlights: 'CD34+ 5.8 x10^6 cells/kg • Viability 95.2%'
    },
    {
      id: 'REP-2026-002',
      title: 'High-Resolution HLA Typing Panel',
      date: '4 days ago',
      status: 'Analyzed',
      highlights: 'HLA-A, B, C, DRB1 Typed • Grade A'
    },
    {
      id: 'REP-2026-003',
      title: 'Bone Marrow Biopsy & Cytogenetics',
      date: '10 days ago',
      status: 'Analyzed',
      highlights: 'Cellularity Normal • Blast count < 5%'
    }
  ];

  return (
    <div className="koshika-animate-fadein pb-5">
      {/* 1. Welcome Header */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-primary-subtle text-primary fw-bold px-3 py-1 rounded-pill small">
                <i className="bi bi-heart-pulse-fill me-1"></i> PATIENT CARE PORTAL
              </span>
              <span className="badge bg-light text-secondary border px-3 py-1 rounded-pill small">
                {patientProfile.condition}
              </span>
            </div>
            <h1 className="fw-bold text-dark mb-1" style={{ fontSize: '1.85rem', letterSpacing: '-0.02em' }}>
              WELCOME TO KOSHIKA
            </h1>
            <p className="text-secondary mb-0 fs-6">
              Your personalized stem-cell care support dashboard
            </p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Link
              to="/my-health/profile"
              className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-2 d-flex align-items-center gap-1 shadow-xs"
            >
              <i className="bi bi-person-circle"></i>
              <span>{patientProfile.name}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. 4 Primary Action Hero Cards */}
      <div className="row g-3 mb-4">
        {/* Card 1: Upload Report */}
        <div className="col-12 col-sm-6 col-lg-3">
          <Link
            to="/ocr-reports"
            className="patient-action-hero-card card border-0 shadow-sm p-4 rounded-4 text-decoration-none h-100 d-flex flex-column justify-content-between"
            style={{
              background: 'linear-gradient(145deg, #ffffff 0%, #fffbeb 100%)',
              border: '1px solid #fef3c7'
            }}
          >
            <div>
              <div
                className="patient-hero-icon-box rounded-3 p-3 mb-3 d-inline-flex"
                style={{ backgroundColor: '#fef3c7', color: '#d97706' }}
              >
                <i className="bi bi-file-earmark-medical fs-2"></i>
              </div>
              <h5 className="fw-bold text-dark mb-1">Upload Report</h5>
              <p className="text-secondary small mb-0">
                Scan or upload lab reports for instant OCR and plain-English AI insights.
              </p>
            </div>
            <div className="mt-3 text-warning-emphasis fw-semibold small d-flex align-items-center gap-1">
              <span>Scan Lab Report</span>
              <i className="bi bi-arrow-right"></i>
            </div>
          </Link>
        </div>

        {/* Card 2: Preliminary Assessment */}
        <div className="col-12 col-sm-6 col-lg-3">
          <Link
            to="/preliminary-assessment"
            className="patient-action-hero-card card border-0 shadow-sm p-4 rounded-4 text-decoration-none h-100 d-flex flex-column justify-content-between"
            style={{
              background: 'linear-gradient(145deg, #ffffff 0%, #eff6ff 100%)',
              border: '1px solid #dbeafe'
            }}
          >
            <div>
              <div
                className="patient-hero-icon-box rounded-3 p-3 mb-3 d-inline-flex"
                style={{ backgroundColor: '#dbeafe', color: '#0284c7' }}
              >
                <i className="bi bi-shield-check fs-2"></i>
              </div>
              <h5 className="fw-bold text-dark mb-1">Preliminary Assessment</h5>
              <p className="text-secondary small mb-0">
                ML-assisted triage to assess stem cell candidacy, indicators, and care path.
              </p>
            </div>
            <div className="mt-3 text-primary fw-semibold small d-flex align-items-center gap-1">
              <span>Check Eligibility</span>
              <i className="bi bi-arrow-right"></i>
            </div>
          </Link>
        </div>

        {/* Card 3: Find a Doctor */}
        <div className="col-12 col-sm-6 col-lg-3">
          <Link
            to="/find-care/doctors"
            className="patient-action-hero-card card border-0 shadow-sm p-4 rounded-4 text-decoration-none h-100 d-flex flex-column justify-content-between"
            style={{
              background: 'linear-gradient(145deg, #ffffff 0%, #f5f3ff 100%)',
              border: '1px solid #ede9fe'
            }}
          >
            <div>
              <div
                className="patient-hero-icon-box rounded-3 p-3 mb-3 d-inline-flex"
                style={{ backgroundColor: '#ede9fe', color: '#7c3aed' }}
              >
                <i className="bi bi-person-badge-fill fs-2"></i>
              </div>
              <h5 className="fw-bold text-dark mb-1">Find a Doctor</h5>
              <p className="text-secondary small mb-0">
                Connect with verified hematologists, oncologists, and transplant specialists.
              </p>
            </div>
            <div className="mt-3 fw-semibold small d-flex align-items-center gap-1" style={{ color: '#7c3aed' }}>
              <span>Browse Doctors</span>
              <i className="bi bi-arrow-right"></i>
            </div>
          </Link>
        </div>

        {/* Card 4: Find Stem Cell Bank / Centre */}
        <div className="col-12 col-sm-6 col-lg-3">
          <Link
            to="/bank"
            className="patient-action-hero-card card border-0 shadow-sm p-4 rounded-4 text-decoration-none h-100 d-flex flex-column justify-content-between"
            style={{
              background: 'linear-gradient(145deg, #ffffff 0%, #f0fdf4 100%)',
              border: '1px solid #dcfce7'
            }}
          >
            <div>
              <div
                className="patient-hero-icon-box rounded-3 p-3 mb-3 d-inline-flex"
                style={{ backgroundColor: '#dcfce7', color: '#059669' }}
              >
                <i className="bi bi-hospital-fill fs-2"></i>
              </div>
              <h5 className="fw-bold text-dark mb-1">Find Stem Cell Bank / Centre</h5>
              <p className="text-secondary small mb-0">
                Explore accredited cord blood repositories, biobanks, and clinical centres.
              </p>
            </div>
            <div className="mt-3 text-success fw-semibold small d-flex align-items-center gap-1">
              <span>Explore Biobanks</span>
              <i className="bi bi-arrow-right"></i>
            </div>
          </Link>
        </div>
      </div>

      {/* 3. YOUR HEALTH SUMMARY */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              <i className="bi bi-heart-pulse text-danger"></i>
              YOUR HEALTH SUMMARY
            </h5>
            <p className="text-secondary small mb-0">
              Overview of your registered clinical profile, uploaded reports, and preliminary assessment status
            </p>
          </div>
          <Link to="/my-health/profile" className="btn btn-sm btn-link text-primary text-decoration-none fw-semibold p-0">
            View Full Profile &rarr;
          </Link>
        </div>

        <div className="row g-3">
          <div className="col-12 col-md-4">
            <div className="p-3 rounded-3 border bg-light h-100">
              <div className="d-flex justify-content-between align-items-start mb-1">
                <span className="small text-muted fw-semibold">Medical Profile</span>
                <span className="badge bg-success-subtle text-success rounded-pill px-2 py-1">Complete</span>
              </div>
              <div className="fw-bold text-dark fs-6 mt-1">
                {patientProfile.condition}
              </div>
              <div className="small text-secondary mt-1">
                Blood Group: <strong className="text-danger">{patientProfile.bloodGroup}</strong> • {patientProfile.hlaStatus}
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="p-3 rounded-3 border bg-light h-100">
              <div className="d-flex justify-content-between align-items-start mb-1">
                <span className="small text-muted fw-semibold">Reports</span>
                <span className="badge bg-primary-subtle text-primary rounded-pill px-2 py-1">3 Reports</span>
              </div>
              <div className="fw-bold text-dark fs-6 mt-1">
                All Reports Analyzed by AI
              </div>
              <div className="small text-secondary mt-1">
                Flow cytometry, CBC, and cytogenetics verified
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="p-3 rounded-3 border bg-light h-100">
              <div className="d-flex justify-content-between align-items-start mb-1">
                <span className="small text-muted fw-semibold">Assessment</span>
                <span className="badge bg-warning-subtle text-warning rounded-pill px-2 py-1">Ready</span>
              </div>
              <div className="fw-bold text-dark fs-6 mt-1">
                ML-Assisted Preliminary Assessment
              </div>
              <div className="small text-secondary mt-1">
                High candidacy for allogeneic donor match evaluation
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. UPCOMING APPOINTMENT */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-calendar-event text-purple" style={{ color: '#8b5cf6' }}></i>
            UPCOMING APPOINTMENT
          </h5>
          <Link to="/appointments" className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1">
            All Appointments
          </Link>
        </div>

        {nextAppt ? (
          <div className="p-3 rounded-4 border d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3" style={{ background: 'linear-gradient(145deg, #fbfbfe 0%, #f5f3ff 100%)', borderColor: '#e9d5ff' }}>
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow-xs"
                style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}
              >
                <i className="bi bi-person-badge fs-4"></i>
              </div>
              <div>
                <div className="fw-bold text-dark fs-6">{nextAppt.doctorName}</div>
                <div className="small text-secondary">{nextAppt.specialty} • {nextAppt.hospital}</div>
                <div className="small text-muted mt-1">
                  <i className="bi bi-clock me-1"></i>
                  <strong>{nextAppt.date}</strong> &bull; <span className="badge bg-purple-subtle text-purple ms-1" style={{ color: '#7c3aed', backgroundColor: '#ede9fe' }}>{nextAppt.mode}</span>
                </div>
              </div>
            </div>

            <Link
              to="/appointments"
              className="btn btn-primary btn-sm rounded-pill px-4 py-2 shadow-xs fw-semibold"
            >
              View Appointment
            </Link>
          </div>
        ) : (
          <div className="p-4 text-center text-muted">
            <i className="bi bi-calendar-check fs-2 text-secondary mb-2 d-block"></i>
            <p className="mb-2">No upcoming consultations scheduled.</p>
            <Link to="/find-care/doctors" className="btn btn-sm btn-primary rounded-pill px-3">
              Book a Consultation
            </Link>
          </div>
        )}
      </div>

      {/* 5. RECENT REPORTS */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-file-earmark-medical text-warning"></i>
            RECENT REPORTS
          </h5>
          <Link to="/ocr-reports" className="btn btn-sm btn-link text-primary text-decoration-none fw-semibold p-0">
            Upload / View All &rarr;
          </Link>
        </div>

        <div className="row g-3">
          {recentReports.map((report) => (
            <div key={report.id} className="col-12 col-md-4">
              <div className="card border p-3 rounded-3 bg-light h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill px-2 py-1 small">
                      {report.id}
                    </span>
                    <span className="badge bg-success-subtle text-success small">{report.status}</span>
                  </div>
                  <h6 className="fw-bold text-dark mb-1">{report.title}</h6>
                  <p className="text-secondary small mb-2">{report.highlights}</p>
                  <small className="text-muted d-block mb-3">
                    <i className="bi bi-calendar3 me-1"></i>{report.date}
                  </small>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/ocr-reports')}
                  className="btn btn-sm btn-outline-primary rounded-pill w-100 py-1"
                >
                  View Report &amp; Insights
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. RECOMMENDED INFORMATION / LEARNING */}
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              <i className="bi bi-book-half text-primary"></i>
              RECOMMENDED INFORMATION &amp; LEARNING
            </h5>
            <p className="text-secondary small mb-0">
              Evidence-based educational guides on stem cell biology, transplantation processes, and patient safety
            </p>
          </div>
          <Link to="/awareness" className="btn btn-sm btn-link text-primary text-decoration-none fw-semibold p-0">
            Explore All Guides &rarr;
          </Link>
        </div>

        <div className="row g-3">
          <div className="col-12 col-md-4">
            <div className="card border p-3 rounded-3 h-100">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge bg-info-subtle text-info p-2 rounded-circle"><i className="bi bi-dna"></i></span>
                <span className="small text-muted fw-semibold">Cell Biology</span>
              </div>
              <h6 className="fw-bold text-dark mb-1">What are Stem Cells?</h6>
              <p className="text-secondary small mb-3">
                Understand how Hematopoietic Stem Cells (HSCs) rebuild the immune system after high-dose therapy.
              </p>
              <Link to="/awareness" className="btn btn-sm btn-outline-info rounded-pill py-1 mt-auto">
                Read Guide
              </Link>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card border p-3 rounded-3 h-100">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge bg-success-subtle text-success p-2 rounded-circle"><i className="bi bi-cpu"></i></span>
                <span className="small text-muted fw-semibold">Matching Science</span>
              </div>
              <h6 className="fw-bold text-dark mb-1">How HLA Matching Works</h6>
              <p className="text-secondary small mb-3">
                Learn why HLA tissue typing matters for finding a 9/10 or 10/10 compatible donor and preventing GVHD.
              </p>
              <Link to="/ml-match" className="btn btn-sm btn-outline-success rounded-pill py-1 mt-auto">
                Try Matching Engine
              </Link>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card border p-3 rounded-3 h-100">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge bg-danger-subtle text-danger p-2 rounded-circle"><i className="bi bi-shield-exclamation"></i></span>
                <span className="small text-muted fw-semibold">Patient Safety</span>
              </div>
              <h6 className="fw-bold text-dark mb-1">Myths vs. Evidence</h6>
              <p className="text-secondary small mb-3">
                Critical warnings against unproven regenerative therapies and regulatory standards approved by CDSCO &amp; FDA.
              </p>
              <Link to="/awareness" className="btn btn-sm btn-outline-danger rounded-pill py-1 mt-auto">
                Safety Checklist
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;