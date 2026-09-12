import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import api from '../api/client';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { appointments } = useRole();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const fetchDoctorData = async () => {
    try {
      const res = await api.get('/patients/');
      setPatients(res.data.results || res.data || []);
    } catch (err) {
      console.error('Failed to load patient records', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="koshika-animate-fadein pb-5">
      {/* Clinician Welcome Header */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-success-subtle text-success fw-bold px-3 py-1 rounded-pill small">
                <i className="bi bi-shield-check me-1"></i> CLINICIAN CONSOLE
              </span>
              <span className="badge bg-light text-secondary border px-2 py-1 rounded-pill small">
                Dept. of Clinical Hematology &amp; BMT
              </span>
            </div>
            <h2 className="fw-bold text-dark mb-1">
              Welcome, Dr. Sharat Damodar, MD
            </h2>
            <p className="text-secondary mb-0 small">
              Manage patient candidates for hematopoietic stem cell transplant, review clinical reports, and evaluate HLA compatibility.
            </p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/appointments" className="btn btn-outline-purple btn-sm rounded-pill px-3 py-2 d-flex align-items-center gap-1 shadow-xs" style={{ borderColor: '#8b5cf6', color: '#7c3aed' }}>
              <i className="bi bi-calendar-plus"></i>
              <span>Schedule Consult</span>
            </Link>
            <Link to="/ml-match" className="btn btn-primary btn-sm rounded-pill px-3 py-2 d-flex align-items-center gap-1 shadow-xs">
              <i className="bi bi-cpu-fill"></i>
              <span>Run HLA Matching</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Clinical Metrics Overview */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="small text-muted fw-semibold">Assigned Patients</span>
              <span className="badge bg-primary-subtle text-primary p-2 rounded-circle"><i className="bi bi-people-fill"></i></span>
            </div>
            <div className="fs-3 fw-bold text-dark">{patients.length || 18}</div>
            <small className="text-muted">Under active BMT evaluation</small>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="small text-muted fw-semibold">Consultations Today</span>
              <span className="badge bg-purple-subtle text-purple p-2 rounded-circle" style={{ color: '#8b5cf6', backgroundColor: '#ede9fe' }}><i className="bi bi-calendar2-check-fill"></i></span>
            </div>
            <div className="fs-3 fw-bold text-dark">{appointments.length || 4}</div>
            <small className="text-muted">2 In-Person • 2 Virtual</small>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="small text-muted fw-semibold">Pending Reports</span>
              <span className="badge bg-warning-subtle text-warning p-2 rounded-circle"><i className="bi bi-file-earmark-text-fill"></i></span>
            </div>
            <div className="fs-3 fw-bold text-dark">5</div>
            <small className="text-muted">Flow cytometry &amp; HLA typing</small>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="small text-muted fw-semibold">Potential Matches</span>
              <span className="badge bg-success-subtle text-success p-2 rounded-circle"><i className="bi bi-heart-pulse-fill"></i></span>
            </div>
            <div className="fs-3 fw-bold text-dark">7</div>
            <small className="text-muted">&gt; 90% compatibility score</small>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Today's Consultations List */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                <i className="bi bi-calendar2-week-fill text-purple" style={{ color: '#8b5cf6' }}></i>
                Today's Consultations
              </h5>
              <Link to="/appointments" className="text-primary small fw-semibold text-decoration-none">
                View All &rarr;
              </Link>
            </div>

            <div className="d-flex flex-column gap-3">
              {appointments.map((appt) => (
                <div key={appt.id} className="p-3 rounded-3 border bg-light d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-bold text-dark">{appt.doctorName}</div>
                    <div className="small text-secondary">{appt.specialty}</div>
                    <div className="small text-muted mt-1">
                      <i className="bi bi-clock me-1"></i>{appt.date} • <span className="badge bg-primary-subtle text-primary">{appt.mode}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/appointments')}
                    className="btn btn-sm btn-outline-primary rounded-pill px-3"
                  >
                    Open Session
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Patients Needing Urgent Match */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                <i className="bi bi-person-heart text-danger"></i>
                Patient Triage Queue
              </h5>
              <Link to="/patients" className="text-primary small fw-semibold text-decoration-none">
                Patient Registry &rarr;
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small">
                  <tr>
                    <th>Patient</th>
                    <th>Blood</th>
                    <th>Diagnosis</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.slice(0, 4).map((p) => (
                    <tr key={p.patient_id}>
                      <td>
                        <div className="fw-bold text-dark small">{p.name}</div>
                        <small className="text-muted">#{p.patient_id}</small>
                      </td>
                      <td>
                        <span className="badge bg-danger-subtle text-danger">{p.blood_group}</span>
                      </td>
                      <td>
                        <span className="small text-secondary">{p.disease || 'Leukemia'}</span>
                      </td>
                      <td className="text-end">
                        <button
                          onClick={() => navigate('/ml-match', { state: { patientId: p.patient_id } })}
                          className="btn btn-sm btn-primary rounded-pill py-1 px-3 shadow-xs"
                          style={{ fontSize: '0.78rem' }}
                        >
                          Match
                        </button>
                      </td>
                    </tr>
                  ))}
                  {patients.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-3 text-muted small">
                        No active triage patients currently.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
