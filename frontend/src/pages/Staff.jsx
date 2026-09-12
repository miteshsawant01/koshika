import React, { useState, useEffect } from 'react';
import api from '../api/client';

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', role: 'Doctor', department: '' });

  useEffect(() => {
    fetchStaff();
  }, [search]);

  const fetchStaff = async () => {
    try {
      const res = await api.get('/staff/', { params: { search } });
      setStaff(res.data.results || res.data);
    } catch (err) {
      console.error('Error fetching staff', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/staff/', {
        name: formData.name.trim(),
        role: formData.role.trim() || 'Doctor',
        department: formData.department.trim() || 'Haemato-Oncology & BMT'
      });
      setShowModal(false);
      setFormData({ name: '', role: 'Doctor', department: '' });
      fetchStaff();
    } catch (err) {
      alert('Error adding staff: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete staff member #${id}?`)) return;
    try {
      await api.delete(`/staff/${id}/`);
      fetchStaff();
    } catch (err) {
      alert('Error deleting staff: ' + err.message);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'DR';
    const clean = name.replace(/^Dr\.\s*/i, '').trim();
    const parts = clean.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return clean.slice(0, 2).toUpperCase() || 'DR';
  };

  const getDeptBadge = (dept) => {
    if (!dept) return 'bg-light text-dark border';
    if (dept.includes('Paediatric')) return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
    if (dept.includes('Adult') || dept.includes('Haemato') || dept.includes('Hematolog')) return 'bg-danger-subtle text-danger border border-danger-subtle';
    if (dept.includes('CAR-T') || dept.includes('cellular') || dept.includes('Cellular')) return 'bg-primary-subtle text-primary border border-primary-subtle';
    if (dept.includes('Haploidentical') || dept.includes('Director') || dept.includes('HOD')) return 'bg-info-subtle text-info border border-info-subtle';
    if (dept.includes('Cryo') || dept.includes('Storage')) return 'bg-info-subtle text-info border border-info-subtle';
    return 'bg-secondary-subtle text-secondary border';
  };

  return (
    <div className="koshika-animate-fadein">
      {/* Modern Page Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-secondary-subtle text-secondary koshika-page-title-badge">
              <i className="bi bi-person-badge me-1"></i> DOCTORS &amp; SPECIALISTS
            </span>
            <span className="badge bg-light text-muted border rounded-pill small">
              {staff.length} Doctors &amp; Specialists
            </span>
          </div>
          <h3 className="fw-bold mb-1 text-dark">Doctors &amp; Specialists Directory</h3>
          <p className="text-secondary mb-0 small">
            Directory of Haemato-Oncologists, Bone Marrow Transplant (BMT) specialists, and cellular therapy consultants
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2 rounded-pill shadow-xs"
        >
          <i className="bi bi-plus-circle-fill"></i>
          <span>Add Specialist</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="card border-0 shadow-sm p-3 mb-4 rounded-4">
        <div className="input-group koshika-search-box border rounded-3 p-0">
          <span className="input-group-text bg-transparent border-0 text-muted ps-3">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control border-0 shadow-none ps-2"
            placeholder="Search specialists by name, role (e.g. Doctor), department (e.g. BMT, CAR-T, Paediatric)..."
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

      {/* Table Card */}
      <div className="koshika-table-card">
        <div className="table-responsive">
          <table className="table koshika-table align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: '70px' }}>Staff</th>
                <th>Specialist Name</th>
                <th>Role</th>
                <th>Department &amp; Clinical Focus</th>
                <th>Joined</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-secondary me-2"></div>
                    <span className="text-muted">Loading specialists directory...</span>
                  </td>
                </tr>
              ) : staff.length > 0 ? (
                staff.map(s => (
                  <tr key={s.staff_id}>
                    <td>
                      <span className="koshika-avatar-initials koshika-avatar-staff">
                        {getInitials(s.name)}
                      </span>
                    </td>
                    <td>
                      <div className="fw-bold text-dark">{s.name}</div>
                      <small className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>ID: #{s.staff_id}</small>
                    </td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 rounded-pill small">
                        {s.role || 'Doctor'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge rounded-3 text-wrap px-2 py-1 lh-base ${getDeptBadge(s.department)}`}
                        style={{ maxWidth: '360px', textAlign: 'left', fontWeight: 500, display: 'inline-block' }}
                      >
                        {s.department || 'Haemato-Oncology & BMT'}
                      </span>
                    </td>
                    <td>
                      <span className="small text-muted font-monospace">
                        {s.created_at ? new Date(s.created_at).toLocaleDateString() : 'Active'}
                      </span>
                    </td>
                    <td className="text-end pe-3">
                      <button
                        onClick={() => handleDelete(s.staff_id)}
                        className="btn btn-sm btn-light border text-danger rounded-3 px-2 py-1"
                        title="Delete Specialist"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center text-muted py-5">No specialist records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content border-0 shadow">
              <form onSubmit={handleSubmit}>
                <div className="modal-header bg-light">
                  <h5 className="modal-title">Add Doctor / Specialist</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Dr. Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Clinical Role</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Doctor, Senior Consultant"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Department / Specialization</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="e.g. Adult Haemato-Oncology & BMT; cellular therapy; CAR-T"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Specialist</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;
