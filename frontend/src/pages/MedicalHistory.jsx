import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DEFAULT_TIMELINE = [
  {
    id: 1,
    date: 'Aug 24, 2026',
    title: 'ML-Assisted Preliminary Assessment Completed',
    category: 'Assessment',
    badge: 'bg-info-subtle text-info',
    icon: 'bi-shield-check',
    doctor: 'Dr. Sharat Damodar, MD',
    description: 'Candidate scored 89% for allogeneic stem cell transplantation. Recommended initiation of matched unrelated donor (MUD) registry search.',
  },
  {
    id: 2,
    date: 'Aug 18, 2026',
    title: 'High-Resolution HLA Tissue Typing Panel',
    category: 'Lab Diagnostics',
    badge: 'bg-primary-subtle text-primary',
    icon: 'bi-dna',
    doctor: 'Dr. Sunil Bhat, MD',
    description: 'High-resolution NGS sequencing performed for HLA-A, B, C, DRB1, DQB1 loci. Ready for automated ML donor matching.',
  },
  {
    id: 3,
    date: 'Jul 29, 2026',
    title: 'Flow Cytometry & CD34+ Cell Viability Test',
    category: 'OCR Report',
    badge: 'bg-warning-subtle text-warning-emphasis',
    icon: 'bi-file-earmark-medical',
    doctor: 'Metro Diagnostic Bio-Center',
    description: 'Report uploaded & parsed via Tesseract OCR. CD34 count: 5.8 x10^6 cells/kg, cell viability: 95.2%.',
  },
  {
    id: 4,
    date: 'Jun 12, 2026',
    title: 'Post-Induction Bone Marrow Biopsy',
    category: 'Clinical Biopsy',
    badge: 'bg-secondary-subtle text-secondary',
    icon: 'bi-hospital',
    doctor: 'National Stem Cell Institute',
    description: 'Biopsy confirmed First Complete Remission (CR1) with blast clearance < 5%. Cytogenetics normal diploid karyotype.',
  },
  {
    id: 5,
    date: 'Apr 04, 2026',
    title: 'Initial Diagnosis & Induction Chemotherapy',
    category: 'Hospital Intake',
    badge: 'bg-danger-subtle text-danger',
    icon: 'bi-heart-pulse',
    doctor: 'Hematology Inpatient Service',
    description: 'Admitted for standard 7+3 cytarabine and daunorubicin induction chemotherapy.',
  }
];

const MedicalHistory = () => {
  const [timeline, setTimeline] = useState(() => {
    try {
      const saved = localStorage.getItem('koshika_medical_timeline');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_TIMELINE;
  });

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Lab Diagnostics',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    doctor: 'Dr. Sharat Damodar, MD',
    description: ''
  });

  // In-App Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    try {
      localStorage.setItem('koshika_medical_timeline', JSON.stringify(timeline));
    } catch (e) {}
  }, [timeline]);

  const handleAddMilestone = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    let badge = 'bg-primary-subtle text-primary';
    let icon = 'bi-file-medical';
    if (formData.category === 'Assessment') {
      badge = 'bg-info-subtle text-info';
      icon = 'bi-shield-check';
    } else if (formData.category === 'Clinical Biopsy') {
      badge = 'bg-secondary-subtle text-secondary';
      icon = 'bi-hospital';
    } else if (formData.category === 'Hospital Intake') {
      badge = 'bg-danger-subtle text-danger';
      icon = 'bi-heart-pulse';
    } else if (formData.category === 'Stem Cell Infusion') {
      badge = 'bg-success-subtle text-success';
      icon = 'bi-droplet-fill';
    }

    const newEntry = {
      id: Date.now(),
      ...formData,
      badge,
      icon
    };

    setTimeline([newEntry, ...timeline]);
    setShowModal(false);
    setFormData({
      title: '',
      category: 'Lab Diagnostics',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      doctor: 'Dr. Sharat Damodar, MD',
      description: ''
    });
    showToast(`Logged clinical milestone "${formData.title}"`, 'success');
  };

  const handleDelete = (id) => {
    setTimeline(timeline.filter(t => t.id !== id));
    showToast('Milestone removed from timeline.', 'info');
  };

  return (
    <div className="koshika-animate-fadein pb-5">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`position-fixed bottom-0 end-0 m-4 p-3 rounded-4 shadow-lg text-white d-flex align-items-center gap-3 animate__animated animate__fadeInUp ${
            toast.type === 'danger'
              ? 'bg-danger'
              : toast.type === 'warning'
              ? 'bg-warning text-dark'
              : toast.type === 'info'
              ? 'bg-info text-dark'
              : 'bg-success'
          }`}
          style={{ maxWidth: '420px', zIndex: 9999 }}
        >
          <i
            className={`bi fs-4 ${
              toast.type === 'danger'
                ? 'bi-exclamation-octagon-fill'
                : toast.type === 'warning'
                ? 'bi-exclamation-triangle-fill'
                : toast.type === 'info'
                ? 'bi-info-circle-fill'
                : 'bi-check-circle-fill'
            }`}
          ></i>
          <div className="small flex-grow-1">{toast.message}</div>
          <button
            type="button"
            className="btn-close btn-close-white ms-auto"
            onClick={() => setToast(null)}
          ></button>
        </div>
      )}

      {/* Header */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-danger-subtle text-danger fw-bold px-3 py-1 rounded-pill small">
                <i className="bi bi-clock-history me-1"></i> MY HEALTH
              </span>
              <span className="badge bg-light text-secondary border px-2 py-1 rounded-pill small">
                {timeline.length} Recorded Milestones
              </span>
            </div>
            <h2 className="fw-bold text-dark mb-1">
              Medical History &amp; Timeline
            </h2>
            <p className="text-secondary mb-0 small">
              Chronological clinical trajectory from initial diagnosis through remission, HLA testing, and stem cell triage
            </p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <Link to="/my-health/profile" className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-2">
              <i className="bi bi-person-circle me-1"></i>
              <span>Patient Profile</span>
            </Link>
            <button
              type="button"
              className="btn btn-primary btn-sm rounded-pill px-3 py-2 shadow-xs"
              onClick={() => setShowModal(true)}
            >
              <i className="bi bi-plus-circle-fill me-1"></i>
              <span>Log Milestone</span>
            </button>
            <Link to="/ocr-reports" className="btn btn-outline-primary btn-sm rounded-pill px-3 py-2">
              <i className="bi bi-file-earmark-medical me-1"></i>
              <span>Upload OCR Report</span>
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
                <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                  <div className="small text-muted d-flex align-items-center gap-1">
                    <i className="bi bi-person-check-fill text-success"></i>
                    <span>Attending: <strong>{item.doctor}</strong></span>
                  </div>
                  {item.id && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-xs rounded-pill px-2 py-0"
                      style={{ fontSize: '0.7rem' }}
                      onClick={() => handleDelete(item.id)}
                      title="Remove milestone"
                    >
                      <i className="bi bi-trash me-1"></i> Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {timeline.length === 0 && (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-journal-x fs-1 text-secondary mb-2 d-block"></i>
              <h5 className="fw-bold text-dark mb-1">No Clinical Milestones Recorded</h5>
              <p className="small text-secondary mb-3">
                Click "Log Milestone" or upload an OCR laboratory report to build your clinical care trajectory.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm rounded-pill px-4"
                onClick={() => setShowModal(true)}
              >
                Log First Milestone
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Log Milestone Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom px-4 py-3">
                <h5 className="modal-title fw-bold text-dark">Log Clinical Milestone</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleAddMilestone}>
                <div className="modal-body px-4 py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Event / Milestone Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Bone Marrow Harvest or Day 0 Stem Cell Infusion"
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Category</label>
                      <select
                        className="form-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="Lab Diagnostics">Lab Diagnostics</option>
                        <option value="Assessment">Assessment</option>
                        <option value="Clinical Biopsy">Clinical Biopsy</option>
                        <option value="Stem Cell Infusion">Stem Cell Infusion</option>
                        <option value="Hospital Intake">Hospital Intake</option>
                        <option value="Medication">Medication &amp; Therapy</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Date</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        placeholder="e.g. Sep 14, 2026"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Attending Doctor / Lab</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.doctor}
                      onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                      placeholder="e.g. Dr. Sharat Damodar, MD or Metro Pathology"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Clinical Summary / Outcome Notes</label>
                    <textarea
                      rows="3"
                      className="form-control"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Key findings, dosage, engraftment markers, or physician comments..."
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-top px-4 py-3 d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-3"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4"
                  >
                    Save Milestone
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalHistory;
