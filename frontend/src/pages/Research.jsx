import React, { useState, useEffect } from 'react';
import api from '../api/client';

const Research = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    project_name: '',
    lead_scientist: '',
    start_date: new Date().toISOString().split('T')[0],
    status: 'Ongoing',
    summary: '',
  });

  useEffect(() => {
    fetchResearch();
  }, [search]);

  const fetchResearch = async () => {
    try {
      const res = await api.get('/research/', { params: { search } });
      setProjects(res.data.results || res.data);
    } catch (err) {
      console.error('Error fetching research', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/research/', formData);
      setShowModal(false);
      setFormData({
        project_name: '',
        lead_scientist: '',
        start_date: new Date().toISOString().split('T')[0],
        status: 'Ongoing',
        summary: '',
      });
      fetchResearch();
    } catch (err) {
      alert('Error adding project: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete research trial #${id}?`)) return;
    try {
      await api.delete(`/research/${id}/`);
      fetchResearch();
    } catch (err) {
      alert('Error deleting project: ' + err.message);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'DR';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getStatusBadge = (status) => {
    if (status === 'Completed') return 'bg-success-subtle text-success border border-success-subtle';
    if (status === 'Active' || status === 'Ongoing') return 'bg-primary-subtle text-primary border border-primary-subtle';
    if (status === 'In Review') return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
    return 'bg-secondary-subtle text-secondary border';
  };

  return (
    <div className="koshika-animate-fadein">
      {/* Modern Page Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-danger-subtle text-danger koshika-page-title-badge">
              <i className="bi bi-journal-medical me-1"></i> Scientific Evidence
            </span>
            <span className="badge bg-light text-muted border rounded-pill small">
              {projects.length} Clinical Trials
            </span>
          </div>
          <h3 className="fw-bold mb-1 text-dark">Clinical Trials &amp; Research</h3>
          <p className="text-secondary mb-0 small">
            Translational cellular medicine, bone marrow engraftment protocols, and advanced gene therapy trials
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2 rounded-pill shadow-xs"
        >
          <i className="bi bi-plus-circle-fill"></i>
          <span>New Research Trial</span>
        </button>
      </div>

      {/* Trial Status Summary */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="p-3 bg-white rounded-3 border shadow-2xs">
            <div className="text-muted small fw-bold text-uppercase d-flex align-items-center gap-1 mb-1">
              <i className="bi bi-journal-check text-primary"></i> Total Protocols
            </div>
            <div className="fs-4 fw-extrabold text-dark font-monospace">{projects.length}</div>
            <small className="text-muted">Registered clinical studies</small>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 bg-white rounded-3 border shadow-2xs">
            <div className="text-muted small fw-bold text-uppercase d-flex align-items-center gap-1 mb-1">
              <i className="bi bi-play-circle text-success"></i> Ongoing Trials
            </div>
            <div className="fs-4 fw-extrabold text-success font-monospace">
              {projects.filter(p => p.status === 'Ongoing' || p.status === 'Active').length}
            </div>
            <small className="text-success">Actively enrolling patients</small>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 bg-white rounded-3 border shadow-2xs">
            <div className="text-muted small fw-bold text-uppercase d-flex align-items-center gap-1 mb-1">
              <i className="bi bi-hourglass-split text-warning"></i> In Review
            </div>
            <div className="fs-4 fw-extrabold text-warning font-monospace">
              {projects.filter(p => p.status === 'In Review').length}
            </div>
            <small className="text-muted">Institutional ethics board</small>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 bg-white rounded-3 border shadow-2xs">
            <div className="text-muted small fw-bold text-uppercase d-flex align-items-center gap-1 mb-1">
              <i className="bi bi-check-circle-fill text-info"></i> Completed
            </div>
            <div className="fs-4 fw-extrabold text-info font-monospace">
              {projects.filter(p => p.status === 'Completed').length}
            </div>
            <small className="text-muted">Peer-reviewed findings</small>
          </div>
        </div>
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
            placeholder="Search trials by project title, lead scientist, or disease keyword..."
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
                <th style={{ width: '70px' }}>ID</th>
                <th>Project Title</th>
                <th>Lead Scientist</th>
                <th>Protocol Start</th>
                <th>Trial Status</th>
                <th>Clinical Abstract</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-danger me-2"></div>
                    <span className="text-muted">Loading research trials...</span>
                  </td>
                </tr>
              ) : projects.length > 0 ? (
                projects.map(r => (
                  <tr key={r.research_id}>
                    <td><span className="font-monospace text-muted">#{r.research_id}</span></td>
                    <td>
                      <div className="fw-bold text-dark">{r.project_name}</div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <span className="koshika-avatar-initials koshika-avatar-staff" style={{ width: '28px', height: '28px', fontSize: '0.72rem' }}>
                          {getInitials(r.lead_scientist)}
                        </span>
                        <span className="fw-semibold text-secondary small">{r.lead_scientist || 'Staff Scientist'}</span>
                      </div>
                    </td>
                    <td><span className="small text-muted font-monospace">{r.start_date || '-'}</span></td>
                    <td>
                      <span className={`badge rounded-pill px-2 py-1 ${getStatusBadge(r.status)}`}>
                        {r.status || 'Active'}
                      </span>
                    </td>
                    <td>
                      <small className="text-muted text-truncate d-inline-block" style={{ maxWidth: '240px' }}>
                        {r.summary || 'Phase II investigational cellular trial'}
                      </small>
                    </td>
                    <td className="text-end pe-3">
                      <button
                        onClick={() => handleDelete(r.research_id)}
                        className="btn btn-sm btn-light border text-danger rounded-3 px-2 py-1"
                        title="Delete Trial"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="text-center text-muted py-5">No research projects found</td></tr>
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
                  <h5 className="modal-title">Create Research Project</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Project Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Stem cell engraftment rate analysis"
                      value={formData.project_name}
                      onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                    />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Lead Scientist</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Dr. Meera Joshi"
                        value={formData.lead_scientist}
                        onChange={(e) => setFormData({ ...formData, lead_scientist: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="Ongoing">Ongoing</option>
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                        <option value="Pending Approval">Pending Approval</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Clinical Protocol Summary</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Objectives, study population, and endpoints..."
                      value={formData.summary}
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Start Project</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Research;
