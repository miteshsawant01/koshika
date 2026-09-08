import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRole } from '../context/RoleContext';

const PatientProfile = () => {
  const { patientProfile, setPatientProfile } = useRole();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...patientProfile });

  const handleSave = (e) => {
    e.preventDefault();
    setPatientProfile(formData);
    setIsEditing(false);
  };

  return (
    <div className="koshika-animate-fadein pb-5">
      {/* Header */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-danger-subtle text-danger fw-bold px-3 py-1 rounded-pill small">
                <i className="bi bi-person-heart me-1"></i> MY HEALTH
              </span>
              <span className="badge bg-light text-secondary border px-2 py-1 rounded-pill small">
                Patient Identifier: {patientProfile.patientId}
              </span>
            </div>
            <h2 className="fw-bold text-dark mb-1">
              Patient Health Profile
            </h2>
            <p className="text-secondary mb-0 small">
              Manage personal demographics, clinical condition, registered blood group, and HLA status
            </p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/my-health/history" className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-2">
              <i className="bi bi-clock-history me-1"></i>
              <span>Medical History</span>
            </Link>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-4 py-2 ${isEditing ? 'btn-outline-danger' : 'btn-primary'}`}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="row g-4">
        <div className="col-12 col-lg-4">
          {/* Summary Card */}
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white text-center mb-4">
            <div
              className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold mx-auto mb-3"
              style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
                fontSize: '2rem'
              }}
            >
              {patientProfile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <h4 className="fw-bold text-dark mb-1">{patientProfile.name}</h4>
            <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1 mb-3">
              {patientProfile.condition}
            </span>

            <div className="border-top pt-3 text-start small">
              <div className="d-flex justify-content-between py-1">
                <span className="text-muted">Blood Group:</span>
                <strong className="text-danger">{patientProfile.bloodGroup}</strong>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span className="text-muted">Age:</span>
                <strong className="text-dark">{patientProfile.age} yrs</strong>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span className="text-muted">HLA Status:</span>
                <strong className="text-success">{patientProfile.hlaStatus}</strong>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span className="text-muted">Assigned Doctor:</span>
                <strong className="text-dark">{patientProfile.primaryDoctor}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold text-dark mb-3">Clinical &amp; Contact Information</h5>

            {isEditing ? (
              <form onSubmit={handleSave}>
                <div className="row g-3">
                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold">Patient ID</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.patientId}
                      disabled
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold">Age</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold">Blood Group</label>
                    <select
                      className="form-select"
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    >
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Diagnosis / Condition</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold">Remission Status</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.remissionStatus}
                      onChange={(e) => setFormData({ ...formData, remissionStatus: e.target.value })}
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold">Emergency Contact</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-3"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <div className="p-3 rounded bg-light border">
                    <small className="text-secondary d-block">Condition / Diagnosis</small>
                    <strong className="fs-6 text-dark">{patientProfile.condition}</strong>
                  </div>
                </div>
                <div className="col-12 col-sm-6">
                  <div className="p-3 rounded bg-light border">
                    <small className="text-secondary d-block">Remission Stage</small>
                    <strong className="fs-6 text-dark">{patientProfile.remissionStatus}</strong>
                  </div>
                </div>
                <div className="col-12 col-sm-6">
                  <div className="p-3 rounded bg-light border">
                    <small className="text-secondary d-block">Assigned Center</small>
                    <strong className="fs-6 text-dark">{patientProfile.hospital}</strong>
                  </div>
                </div>
                <div className="col-12 col-sm-6">
                  <div className="p-3 rounded bg-light border">
                    <small className="text-secondary d-block">Emergency Contact</small>
                    <strong className="fs-6 text-dark">{patientProfile.emergencyContact}</strong>
                  </div>
                </div>
                <div className="col-12">
                  <div className="p-3 rounded bg-light border">
                    <small className="text-secondary d-block">Preliminary Assessment Status</small>
                    <strong className="fs-6 text-primary">{patientProfile.assessmentStatus}</strong>
                    <div className="mt-2">
                      <Link to="/preliminary-assessment" className="btn btn-sm btn-outline-primary rounded-pill px-3">
                        Re-evaluate Assessment &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
