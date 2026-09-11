import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="koshika-footer mt-auto py-4 bg-white border-top">
      <div className="container-fluid px-4">
        <div className="row g-4 justify-content-between align-items-center">
          <div className="col-12 col-md-6 col-lg-5">
            <div className="d-flex align-items-center gap-2 mb-2">
              <div className="institutional-logo-box" style={{ width: '32px', height: '32px', fontSize: '1rem', background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)' }}>
                <i className="bi bi-heart-pulse-fill"></i>
              </div>
              <span className="fw-bold text-dark fs-5" style={{ letterSpacing: '-0.02em' }}>KOSHIKA</span>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill small">
                Patient Support
              </span>
            </div>
            <div className="text-secondary small mb-2" style={{ lineHeight: '1.5' }}>
              <strong>AI-Assisted Stem Cell Awareness &amp; Patient Support</strong>
              <div className="text-primary fw-semibold">Learn. Understand. Make Informed Decisions.</div>
            </div>
            <p className="text-muted small mb-0" style={{ fontSize: '0.78rem' }}>
              A patient-friendly platform providing simple, reliable information about stem cells, transplantation, HLA matching, and clinical safety.
            </p>
          </div>

          <div className="col-12 col-md-6 col-lg-4 text-md-end">
            <div className="d-flex flex-wrap gap-3 justify-content-md-end mb-2">
              <Link to="/awareness" className="text-decoration-none text-secondary small hover-primary">
                Stem Cell Guide
              </Link>
              <Link to="/ml-match" className="text-decoration-none text-secondary small hover-primary">
                Donor Matching
              </Link>
              <Link to="/storage" className="text-decoration-none text-secondary small hover-primary">
                Storage Vault
              </Link>
              <Link to="/ocr-reports" className="text-decoration-none text-secondary small hover-primary">
                Report Scan
              </Link>
            </div>
            <div className="p-2 bg-light rounded-2 border text-start d-inline-block text-secondary small" style={{ fontSize: '0.75rem', maxWidth: '420px' }}>
              <i className="bi bi-shield-check text-success me-1"></i>
              <strong>Notice:</strong> KOSHIKA provides educational support and does not replace professional medical advice. Always consult a licensed doctor.
            </div>
          </div>
        </div>

        <div className="border-top mt-3 pt-3 text-center text-muted small d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
          <span>&copy; {new Date().getFullYear()} KOSHIKA — Evidence-Based Stem Cell Awareness.</span>
          <span className="text-success fw-semibold d-flex align-items-center gap-1">
            <i className="bi bi-check-circle-fill"></i>
            Verified Medical Knowledge &amp; Secure Biobank
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
