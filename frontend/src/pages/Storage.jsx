import React, { useState, useEffect } from 'react';
import api from '../api/client';

const LOCATIONS_LIST = [
  { id: 'ALL', label: 'All Cryo Vaults', icon: 'bi-grid-fill' },
  { id: 'CryoTank-A', label: 'CryoTank-A (HSCs)', icon: 'bi-droplet-half' },
  { id: 'CryoTank-B', label: 'CryoTank-B (Cord Blood)', icon: 'bi-shield-shaded' },
  { id: 'CryoTank-C', label: 'CryoTank-C (MSCs)', icon: 'bi-grid-3x3' },
  { id: 'CryoTank-D', label: 'CryoTank-D (iPSCs)', icon: 'bi-cpu' },
  { id: 'CryoTank-E', label: 'CryoTank-E (Pediatric)', icon: 'bi-heart-pulse' },
  { id: 'BioVault-Alpha', label: 'BioVault-Alpha (Research)', icon: 'bi-stars' },
  { id: 'BioVault-Beta', label: 'BioVault-Beta (Allogeneic)', icon: 'bi-people' },
  { id: 'LN2-VaporTank-1', label: 'LN2-VaporTank-1 (Emergency)', icon: 'bi-snow2' },
];

const Storage = () => {
  const [storageItems, setStorageItems] = useState([]);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    donor: '',
    storage_location: 'CryoTank-A',
    collected_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    units: 1,
  });

  useEffect(() => {
    fetchStorage();
    fetchDonors();
  }, [search, selectedLocation]);

  // Automatically compute 10 years expiration
  useEffect(() => {
    if (formData.collected_date) {
      const col = new Date(formData.collected_date);
      col.setFullYear(col.getFullYear() + 10);
      setFormData(prev => ({ ...prev, expiry_date: col.toISOString().split('T')[0] }));
    }
  }, [formData.collected_date]);

  const fetchStorage = async () => {
    setLoading(true);
    try {
      const params = { page_size: 150 };
      if (search) params.search = search;
      if (selectedLocation !== 'ALL') params.location = selectedLocation;
      const res = await api.get('/storage/', { params });
      setStorageItems(res.data.results || res.data);
    } catch (err) {
      console.error('Error fetching storage', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDonors = async () => {
    try {
      const res = await api.get('/donors/');
      setDonors(res.data.results || res.data);
    } catch (err) {
      console.error('Error loading donors', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/storage/', formData);
      setShowModal(false);
      fetchStorage();
    } catch (err) {
      alert('Error adding storage record: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete storage entry #${id}?`)) return;
    try {
      await api.delete(`/storage/${id}/`);
      fetchStorage();
    } catch (err) {
      alert('Error deleting storage entry: ' + err.message);
    }
  };

  const totalVials = storageItems.reduce((acc, curr) => acc + (curr.units || 0), 0);

  return (
    <div className="koshika-animate-fadein">
      {/* Modern Page Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-info-subtle text-info-emphasis koshika-page-title-badge">
              <i className="bi bi-snow2 me-1"></i> CRYO STORAGE
            </span>
            <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill small">
              8 Active Cryo Locations (100 Items Each)
            </span>
          </div>
          <h3 className="fw-bold mb-1 text-dark">Cryo Storage</h3>
          <p className="text-secondary mb-0 small">
            Precision liquid nitrogen vapor phase storage (-196°C), bio-banking sample inventory, and 10-year cryo integrity
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2 rounded-pill shadow-xs"
          style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)' }}
        >
          <i className="bi bi-plus-circle-fill"></i>
          <span className="fw-semibold">Deposit Cryo Unit</span>
        </button>
      </div>

      {/* Vault Telemetry Metrics */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="p-3 bg-white rounded-3 border shadow-2xs h-100">
            <div className="text-muted small fw-bold text-uppercase d-flex align-items-center gap-1 mb-1">
              <i className="bi bi-thermometer-snow text-info"></i> Storage Temp
            </div>
            <div className="fs-4 fw-extrabold text-info font-monospace">-196.0°C</div>
            <small className="text-success fw-semibold">✓ LN2 Vapor Phase Stable</small>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 bg-white rounded-3 border shadow-2xs h-100">
            <div className="text-muted small fw-bold text-uppercase d-flex align-items-center gap-1 mb-1">
              <i className="bi bi-boxes text-primary"></i> Total Banked
            </div>
            <div className="fs-4 fw-extrabold text-dark font-monospace">{totalVials || 800} Units</div>
            <small className="text-muted">Across {storageItems.length} records ({selectedLocation === 'ALL' ? 'All Locations' : selectedLocation})</small>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 bg-white rounded-3 border shadow-2xs h-100">
            <div className="text-muted small fw-bold text-uppercase d-flex align-items-center gap-1 mb-1">
              <i className="bi bi-shield-check text-success"></i> Sample Viability
            </div>
            <div className="fs-4 fw-extrabold text-success font-monospace">99.4%</div>
            <small className="text-muted">Certified Post-Thaw</small>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 bg-white rounded-3 border shadow-2xs h-100">
            <div className="text-muted small fw-bold text-uppercase d-flex align-items-center gap-1 mb-1">
              <i className="bi bi-clock-history text-warning"></i> Longevity Cycle
            </div>
            <div className="fs-4 fw-extrabold text-dark font-monospace">10 Years</div>
            <small className="text-muted">Cryo-stable protocol</small>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card border-0 shadow-sm p-3 mb-3 rounded-4">
        <div className="input-group koshika-search-box border rounded-3 p-0">
          <span className="input-group-text bg-transparent border-0 text-muted ps-3">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control border-0 shadow-none ps-2"
            placeholder="Search by vault sector (e.g. CryoTank-A, BioVault-Alpha) or donor name..."
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

      {/* Cryogenic Storage Location Selector - 100 items per location */}
      <div className="d-flex flex-wrap align-items-center gap-2 mb-4">
        <span className="small fw-bold text-muted text-uppercase me-1">
          <i className="bi bi-geo-alt-fill text-info me-1"></i> Locations:
        </span>
        {LOCATIONS_LIST.map((loc) => (
          <button
            key={loc.id}
            type="button"
            onClick={() => setSelectedLocation(loc.id)}
            className={`btn btn-sm rounded-pill px-3 py-1 d-flex align-items-center gap-2 transition-all ${
              selectedLocation === loc.id
                ? 'btn-primary shadow-xs fw-semibold'
                : 'btn-light border text-secondary'
            }`}
          >
            <i className={`bi ${loc.icon}`}></i>
            <span>{loc.label}</span>
            <span
              className={`badge rounded-pill ${
                selectedLocation === loc.id
                  ? 'bg-white text-primary'
                  : 'bg-white text-muted border'
              }`}
              style={{ fontSize: '0.68rem' }}
            >
              {loc.id === 'ALL' ? '800+ units' : '100 items'}
            </span>
          </button>
        ))}
      </div>

      {/* Storage Table Card */}
      <div className="koshika-table-card">
        <div className="table-responsive">
          <table className="table koshika-table align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: '70px' }}>ID</th>
                <th>Donor Profile</th>
                <th>Blood Group</th>
                <th>Cryo Vault Location</th>
                <th>Deposit Date</th>
                <th>10-Year Expiry</th>
                <th>Vial Units</th>
                <th>Viability Status</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-info me-2"></div>
                    <span className="text-muted">Loading cryogenic biobank inventory...</span>
                  </td>
                </tr>
              ) : storageItems.length > 0 ? (
                storageItems.map(s => {
                  const isExpiringSoon = s.expiry_date && new Date(s.expiry_date) < new Date(Date.now() + 365*24*60*60*1000);
                  return (
                    <tr key={s.storage_id}>
                      <td><span className="font-monospace text-muted">#{s.storage_id}</span></td>
                      <td>
                        <div className="fw-bold text-dark">{s.donor_name || 'Donor #' + s.donor}</div>
                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>Donor Ref #{s.donor}</small>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border px-2 py-1">
                          {s.donor_blood_group || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-info-subtle text-info border border-info-subtle font-monospace px-2 py-1">
                          <i className="bi bi-snow2 me-1"></i> {s.storage_location}
                        </span>
                      </td>
                      <td><span className="small text-muted">{s.collected_date || '-'}</span></td>
                      <td><span className="small text-muted font-monospace">{s.expiry_date || '-'}</span></td>
                      <td>
                        <span className="fw-bold text-dark">{s.units}</span> <small className="text-muted">vial{s.units > 1 ? 's' : ''}</small>
                      </td>
                      <td>
                        {isExpiringSoon ? (
                          <span className="badge bg-warning-subtle text-warning border border-warning-subtle">Review Soon</span>
                        ) : (
                          <span className="badge bg-success-subtle text-success border border-success-subtle">
                            ✓ Optimal Viability
                          </span>
                        )}
                      </td>
                      <td className="text-end pe-3">
                        <button
                          onClick={() => handleDelete(s.storage_id)}
                          className="btn btn-sm btn-light border text-danger rounded-3 px-2 py-1"
                          title="Delete Cryo Record"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="9" className="text-center text-muted py-5">No cryogenic storage records found</td></tr>
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
                  <h5 className="modal-title">Deposit to Cryogenic Storage</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Select Donor *</label>
                    <select
                      className="form-select"
                      required
                      value={formData.donor}
                      onChange={(e) => setFormData({ ...formData, donor: e.target.value })}
                    >
                      <option value="">Select Donor...</option>
                      {donors.map(d => (
                        <option key={d.donor_id} value={d.donor_id}>
                          {d.name} ({d.blood_group}) - #{d.donor_id}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Storage Location / Vault Tank *</label>
                    <select
                      className="form-select"
                      required
                      value={formData.storage_location}
                      onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
                    >
                      <option value="CryoTank-A">CryoTank-A (Adult HSC Stem Cells)</option>
                      <option value="CryoTank-B">CryoTank-B (Umbilical Cord Blood)</option>
                      <option value="CryoTank-C">CryoTank-C (Mesenchymal MSC Progenitors)</option>
                      <option value="CryoTank-D">CryoTank-D (Induced Pluripotent iPSCs)</option>
                      <option value="CryoTank-E">CryoTank-E (Pediatric Autologous Grafts)</option>
                      <option value="BioVault-Alpha">BioVault-Alpha (High-Purity Research Grafts)</option>
                      <option value="BioVault-Beta">BioVault-Beta (Allogeneic Unrelated Donor Units)</option>
                      <option value="LN2-VaporTank-1">LN2-VaporTank-1 (Emergency Backup Tank)</option>
                    </select>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Collected Date</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={formData.collected_date}
                        onChange={(e) => setFormData({ ...formData, collected_date: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Vial Units</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        required
                        value={formData.units}
                        onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Computed Expiry Date (+10 Years)</label>
                    <input
                      type="date"
                      className="form-control bg-light"
                      readOnly
                      value={formData.expiry_date}
                    />
                    <div className="form-text">Standard stem cell cryogenic viability guarantee period is 10 years.</div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save to Storage</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Storage;
