import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const Patients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterBg, setFilterBg] = useState('');

  // Modal form state
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    blood_group: 'A+',
    contact: '',
    disease: '',
  });

  useEffect(() => {
    fetchPatients();
  }, [search, filterBg]);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients/', {
        params: { search, blood_group: filterBg }
      });
      setPatients(res.data.results || res.data);
    } catch (err) {
      console.error('Error loading patients', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingPatient(null);
    setFormData({ name: '', age: '', blood_group: 'A+', contact: '', disease: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditingPatient(p);
    setFormData({
      name: p.name || '',
      age: p.age || '',
      blood_group: p.blood_group || 'A+',
      contact: p.contact || '',
      disease: p.disease || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPatient) {
        await api.put(`/patients/${editingPatient.patient_id}/`, formData);
      } else {
        await api.post('/patients/', formData);
      }
      setShowModal(false);
      fetchPatients();
    } catch (err) {
      alert('Error saving patient: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete patient #${id}?`)) return;
    try {
      await api.delete(`/patients/${id}/`);
      fetchPatients();
    } catch (err) {
      alert('Error deleting patient: ' + err.message);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'PT';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getBgClass = (bg) => {
    if (!bg) return 'koshika-badge-a';
    if (bg.startsWith('AB')) return 'koshika-badge-ab';
    if (bg.startsWith('A')) return 'koshika-badge-a';
    if (bg.startsWith('B')) return 'koshika-badge-b';
    if (bg.startsWith('O')) return 'koshika-badge-o';
    return 'koshika-badge-a';
  };

  return (
    <div className="koshika-animate-fadein">
      {/* Modern Page Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary-subtle text-primary koshika-page-title-badge">
              <i className="bi bi-person-heart me-1"></i> Recipient Registry
            </span>
            <span className="badge bg-light text-muted border rounded-pill small">
              {patients.length} Active Records
            </span>
          </div>
          <h3 className="fw-bold mb-1 text-dark">Patients Registry</h3>
          <p className="text-secondary mb-0 small">
            Clinical recipient records, diagnostic profiles, HLA compatibility status, and matched donor linkages
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2 rounded-pill shadow-xs"
        >
          <i className="bi bi-plus-circle-fill"></i>
          <span className="fw-semibold">Register Patient</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="card border-0 shadow-sm p-3 mb-4 rounded-4">
        <div className="row g-3">
          <div className="col-md-8">
            <div className="input-group koshika-search-box border rounded-3 p-0">
              <span className="input-group-text bg-transparent border-0 text-muted ps-3">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-0 shadow-none ps-2"
                placeholder="Search recipient by name, disease, contact, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="btn btn-link text-muted pe-3 text-decoration-none"
                  onClick={() => setSearch('')}
                >
                  <i className="bi bi-x-circle-fill"></i>
                </button>
              )}
            </div>
          </div>
          <div className="col-md-4">
            <select
              className="form-select rounded-3 py-2"
              value={filterBg}
              onChange={(e) => setFilterBg(e.target.value)}
            >
              <option value="">All Blood Groups ({patients.length})</option>
              <option value="A+">Blood Group A+</option>
              <option value="A-">Blood Group A-</option>
              <option value="B+">Blood Group B+</option>
              <option value="B-">Blood Group B-</option>
              <option value="O+">Blood Group O+</option>
              <option value="O-">Blood Group O-</option>
              <option value="AB+">Blood Group AB+</option>
              <option value="AB-">Blood Group AB-</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patients Table Card */}
      <div className="koshika-table-card">
        <div className="table-responsive">
          <table className="table koshika-table align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Patient</th>
                <th>Full Name &amp; Details</th>
                <th>Age</th>
                <th>Blood Group</th>
                <th>Contact</th>
                <th>Clinical Diagnosis</th>
                <th>Matched Donors</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    <span className="text-muted">Loading clinical patient records...</span>
                  </td>
                </tr>
              ) : patients.length > 0 ? (
                patients.map((p) => (
                  <tr key={p.patient_id}>
                    <td>
                      <span className="koshika-avatar-initials">
                        {getInitials(p.name)}
                      </span>
                    </td>
                    <td>
                      <div className="fw-bold text-dark">{p.name}</div>
                      <small className="text-muted" style={{ fontSize: '0.75rem' }}>ID: #{p.patient_id}</small>
                    </td>
                    <td>
                      <span className="fw-semibold text-secondary">{p.age ? `${p.age} yrs` : '-'}</span>
                    </td>
                    <td>
                      <span className={`koshika-badge-blood ${getBgClass(p.blood_group)}`}>
                        🩸 {p.blood_group}
                      </span>
                    </td>
                    <td>
                      <span className="small text-muted font-monospace">{p.contact || 'Not provided'}</span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border px-2 py-1 small">
                        {p.disease || 'General Evaluation'}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-info-subtle text-info border border-info-subtle rounded-pill px-2 py-1 small">
                        {p.donor_count || 0} Linked Donors
                      </span>
                    </td>
                    <td className="text-end pe-3">
                      <div className="d-inline-flex gap-1">
                        <button
                          onClick={() => navigate('/ml-match', { state: { patientId: p.patient_id } })}
                          className="btn btn-sm btn-outline-primary rounded-pill px-2 py-1"
                          title="Run AI HLA Compatibility Match"
                          style={{ fontSize: '0.78rem' }}
                        >
                          <i className="bi bi-cpu me-1"></i> Match
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="btn btn-sm btn-light border text-secondary rounded-3 px-2 py-1"
                          title="Edit Patient"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(p.patient_id)}
                          className="btn btn-sm btn-light border text-danger rounded-3 px-2 py-1"
                          title="Delete Patient"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="8" className="text-center text-muted py-4">No patients found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Patient Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content border-0 shadow">
              <form onSubmit={handleSubmit}>
                <div className="modal-header bg-light">
                  <h5 className="modal-title">{editingPatient ? 'Edit Patient' : 'Add New Patient'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Age</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Blood Group</label>
                      <select
                        className="form-select"
                        value={formData.blood_group}
                        onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Contact / Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Clinical Disease / Diagnosis</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Acute Myeloid Leukemia"
                      value={formData.disease}
                      onChange={(e) => setFormData({ ...formData, disease: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editingPatient ? 'Save Changes' : 'Create Patient'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
