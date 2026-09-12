import React from 'react';
import { Link } from 'react-router-dom';

const MedicalHistory = () => {
  const timeline = [
    {
      date: 'Aug 24, 2026',
      title: 'ML-Assisted Preliminary Assessment Completed',
      category: 'Assessment',
      badge: 'bg-info-subtle text-info',
      icon: 'bi-shield-check',
      doctor: 'Dr. Sharat Damodar, MD',
      description: 'Candidate scored 89% for allogeneic stem cell transplantation. Recommended initiation of matched unrelated donor (MUD) registry search.',
    },
    {
      date: 'Aug 18, 2026',
      title: 'High-Resolution HLA Tissue Typing Panel',
      category: 'Lab Diagnostics',
      badge: 'bg-primary-subtle text-primary',
      icon: 'bi-dna',
      doctor: 'Dr. Sunil Bhat, MD',
      description: 'High-resolution NGS sequencing performed for HLA-A, B, C, DRB1, DQB1 loci. Ready for automated ML donor matching.',
    },
    {
      date: 'Jul 29, 2026',
      title: 'Flow Cytometry & CD34+ Cell Viability Test',
      category: 'OCR Report',
      badge: 'bg-warning-subtle text-warning-emphasis',
      icon: 'bi-file-earmark-medical',
      doctor: 'Metro Diagnostic Bio-Center',
      description: 'Report uploaded & parsed via Tesseract OCR. CD34 count: 5.8 x10^6 cells/kg, cell viability: 95.2%.',
    },
    {
      date: 'Jun 12, 2026',
      title: 'Post-Induction Bone Marrow Biopsy',
      category: 'Clinical Biopsy',
      badge: 'bg-secondary-subtle text-secondary',
      icon: 'bi-hospital',
      doctor: 'National Stem Cell Institute',
      description: 'Biopsy confirmed First Complete Remission (CR1) with blast clearance < 5%. Cytogenetics normal diploid karyotype.',
    },
    {
      date: 'Apr 04, 2026',
      title: 'Initial Diagnosis & Induction Chemotherapy',
      category: 'Hospital Intake',
      badge: 'bg-danger-subtle text-danger',
      icon: 'bi-heart-pulse',
      doctor: 'Hematology Inpatient Service',
      description: 'Admitted for standard 7+3 cytarabine and daunorubicin induction chemotherapy.',
    }
  ];

  return (
    <div className="koshika-animate-fadein pb-5">
      {/* Header */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-danger-subtle text-danger fw-bold px-3 py-1 rounded-pill small">
                <i className="bi bi-clock-history me-1"></i> MY HEALTH
              </span>
              <span className="badge bg-light text-secondary border px-2 py-1 rounded-pill small">
                5 Recorded Milestones
              </span>
            </div>
            <h2 className="fw-bold text-dark mb-1">
              Medical History &amp; Timeline
            </h2>
            <p className="text-secondary mb-0 small">
              Chronological clinical trajectory from initial diagnosis through remission, HLA testing, and stem cell triage
            </p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/my-health/profile" className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-2">
              <i className="bi bi-person-circle me-1"></i>
              <span>Patient Profile</span>
            </Link>
            <Link to="/ocr-reports" className="btn btn-primary btn-sm rounded-pill px-3 py-2">
              <i className="bi bi-plus-lg me-1"></i>
              <span>Upload New Event</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Timeline List */}
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
        <div className="position-relative ps-4" style={{ borderLeft: '2px solid #e2e8f0', marginLeft: '1rem' }}>
          {timeline.map((item, idx) => (
            <div key={idx} className="position-relative mb-4 pb-2">
              {/* Bullet Node */}
              <div
                className="position-absolute rounded-circle d-flex align-items-center justify-content-center bg-white shadow-xs"
                style={{
                  width: '32px',
                  height: '32px',
                  left: '-33px',
                  top: '0px',
                  border: '2px solid #0284c7'
                }}
              >
                <i className={`bi ${item.icon} text-primary`} style={{ fontSize: '0.85rem' }}></i>
              </div>

              {/* Event Content Box */}
              <div className="card border p-3 rounded-4 bg-light shadow-xs ms-2">
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-2 gap-1">
                  <span className={`badge ${item.badge} rounded-pill px-2 py-1 small`}>
                    {item.category}
                  </span>
                  <small className="text-muted fw-semibold">
                    <i className="bi bi-calendar3 me-1"></i>{item.date}
                  </small>
                </div>
                <h5 className="fw-bold text-dark mb-1">{item.title}</h5>
                <p className="small text-secondary mb-2">{item.description}</p>
                <div className="small text-muted d-flex align-items-center gap-1">
                  <i className="bi bi-person-check-fill text-success"></i>
                  <span>Attending: <strong>{item.doctor}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MedicalHistory;
