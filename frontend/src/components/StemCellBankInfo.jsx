import React, { useState, useEffect } from 'react';
import api from '../api/client';

export const DEFAULT_STEM_CELL_BANKS = [
  { id: 1, bank_name: 'LifeCell International Pvt. Ltd.', location: 'Chennai, Tamil Nadu; storage facility also in Gurugram, Haryana' },
  { id: 2, bank_name: 'CryoViva Biotech India Pvt. Ltd.', location: 'Gurugram, Haryana' },
  { id: 3, bank_name: 'Cordlife Sciences India Pvt. Ltd.', location: 'Kolkata / Bishnupur, West Bengal' },
  { id: 4, bank_name: 'BioCell / Regrow Biosciences Pvt. Ltd.', location: 'Maharashtra' },
  { id: 5, bank_name: 'Cryo StemCell', location: 'Bengaluru, Karnataka' },
  { id: 6, bank_name: 'Cryovault Biotech Pvt. Ltd.', location: 'Bengaluru, Karnataka' },
  { id: 7, bank_name: 'Novacord / Totipotent RX Cell Therapy Pvt. Ltd.', location: 'Gurugram, Haryana' },
  { id: 8, bank_name: 'ReeLabs Pvt. Ltd.', location: 'Mumbai' },
  { id: 9, bank_name: 'Reliance Life Sciences Pvt. Ltd.', location: 'Navi Mumbai, Maharashtra' },
  { id: 10, bank_name: 'StemPlus Cryopreservation Pvt. Ltd.', location: 'Sangli, Maharashtra' },
  { id: 11, bank_name: 'StemCyte India Therapeutics Pvt. Ltd.', location: 'Gandhinagar, Gujarat' },
  { id: 12, bank_name: 'Narayana Hrudayalaya Tissue Bank & Stem Cells Research Centre', location: 'Bengaluru, Karnataka' },
  { id: 13, bank_name: 'Cryo Save (India) Pvt. Ltd.', location: 'Bengaluru, Karnataka' },
  { id: 14, bank_name: 'International Stem Cell Services Ltd. (ISSL)', location: 'Bengaluru, Karnataka' },
  { id: 15, bank_name: 'Unistem Bio Sciences Pvt. Ltd.', location: 'Gurugram, Haryana' },
  { id: 16, bank_name: 'Best Wellcare Management Services Pvt. Ltd. (Indu Stem Cell Bank)', location: 'Vadodara, Gujarat' },
  { id: 17, bank_name: 'Path Care Labs Pvt. Ltd.', location: 'Ranga Reddy district, Andhra Pradesh in the government record' },
  { id: 18, bank_name: 'Cryobanks International India Pvt. Ltd.', location: 'Gurugram, Haryana' }
];

const StemCellBankInfo = () => {
  const [banks, setBanks] = useState(DEFAULT_STEM_CELL_BANKS);
  const [loading, setLoading] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [selectedStorageSample, setSelectedStorageSample] = useState('cord_blood');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ bank_name: '', location: '' });

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/stem-cell-banks/');
      const data = res.data.results || res.data;
      if (Array.isArray(data) && data.length > 0) {
        setBanks(data);
      }
    } catch (e) {
      console.warn('Using default certified stem cell banks:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBank = async (e) => {
    e.preventDefault();
    if (!formData.bank_name.trim() || !formData.location.trim()) return;
    try {
      await api.post('/stem-cell-banks/', {
        bank_name: formData.bank_name.trim(),
        location: formData.location.trim()
      });
      setShowModal(false);
      setFormData({ bank_name: '', location: '' });
      fetchBanks();
    } catch (err) {
      alert('Error adding bank: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteBank = async (id) => {
    if (!window.confirm(`Remove stem cell bank entry #${id}?`)) return;
    try {
      await api.delete(`/stem-cell-banks/${id}/`);
      fetchBanks();
    } catch (err) {
      alert('Error deleting bank: ' + err.message);
    }
  };

  const sampleTypes = {
    cord_blood: {
      name: 'Umbilical Cord Blood',
      cells: 'Hematopoietic Stem Cells (HSCs) & Progenitors',
      collection: 'Collected from umbilical cord immediately after delivery (zero risk to mother or newborn).',
      temp: '-196°C Liquid Nitrogen Vapor',
      viability: '25+ Years Proven Viability (indefinite under cryogenic equilibrium)',
      approvedIndications: 'Leukemia, Thalassemia Major, Sickle Cell Disease, Severe Combined Immunodeficiency (SCID).'
    },
    cord_tissue: {
      name: 'Umbilical Cord Tissue (Wharton\'s Jelly)',
      cells: 'Mesenchymal Stem Cells (MSCs)',
      collection: 'Section of postpartum umbilical cord processed for cellular isolation.',
      temp: '-196°C Vapor Phase',
      viability: '25+ Years with DMSO cryoprotectant',
      approvedIndications: 'Regenerative orthopedics, GVHD treatment, autoimmune clinical trials, heart muscle repair.'
    },
    bone_marrow: {
      name: 'Bone Marrow Aspirate',
      cells: 'HSCs, MSCs & Stromal Microenvironment',
      collection: 'Aspirated from posterior iliac crest under local/general anesthesia in surgical theater.',
      temp: '-196°C Controlled-Rate Frozen',
      viability: '20+ Years in Cryo Storage',
      approvedIndications: 'Allogeneic and autologous bone marrow transplants for hematologic malignancies.'
    },
    pbsc: {
      name: 'Peripheral Blood Stem Cells (PBSC)',
      cells: 'Mobilized CD34+ Hematopoietic Cells',
      collection: 'Non-surgical outpatient apheresis following G-CSF/filgrastim mobilization.',
      temp: '-196°C Liquid Nitrogen',
      viability: '20+ Years',
      approvedIndications: 'Standard of care for 90% of adult stem cell transplantations.'
    }
  };

  const getStateBadge = (loc) => {
    if (!loc) return 'bg-secondary-subtle text-secondary border';
    if (loc.includes('Karnataka') || loc.includes('Bengaluru')) return 'bg-primary-subtle text-primary border border-primary-subtle';
    if (loc.includes('Maharashtra') || loc.includes('Mumbai') || loc.includes('Sangli')) return 'bg-danger-subtle text-danger border border-danger-subtle';
    if (loc.includes('Haryana') || loc.includes('Gurugram')) return 'bg-success-subtle text-success border border-success-subtle';
    if (loc.includes('Gujarat') || loc.includes('Gandhinagar') || loc.includes('Vadodara')) return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
    if (loc.includes('Tamil Nadu') || loc.includes('Chennai')) return 'bg-info-subtle text-info border border-info-subtle';
    if (loc.includes('West Bengal') || loc.includes('Kolkata')) return 'bg-purple-subtle text-purple border border-purple-subtle';
    if (loc.includes('Andhra Pradesh')) return 'bg-secondary-subtle text-dark border';
    return 'bg-light text-secondary border';
  };

  const extractState = (loc) => {
    if (!loc) return 'India';
    if (loc.includes('Karnataka')) return 'Karnataka';
    if (loc.includes('Maharashtra')) return 'Maharashtra';
    if (loc.includes('Haryana')) return 'Haryana';
    if (loc.includes('Gujarat')) return 'Gujarat';
    if (loc.includes('Tamil Nadu')) return 'Tamil Nadu';
    if (loc.includes('West Bengal')) return 'West Bengal';
    if (loc.includes('Andhra Pradesh')) return 'Andhra Pradesh';
    return 'India';
  };

  const filteredBanks = banks.filter((bank) => {
    const name = bank.bank_name || bank.name || '';
    const loc = bank.location || bank.country || '';
    const matchesSearch =
      name.toLowerCase().includes(bankSearch.toLowerCase()) ||
      loc.toLowerCase().includes(bankSearch.toLowerCase());
    const matchesState = stateFilter === 'ALL' || loc.includes(stateFilter);
    return matchesSearch && matchesState;
  });

  const activeSample = sampleTypes[selectedStorageSample];

  return (
    <div className="stem-cell-bank-container mb-4">
      {/* Biobank Header Card */}
      <div className="card border-0 shadow-sm p-4 mb-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0284c7 100%)', color: 'white' }}>
        <div className="row align-items-center">
          <div className="col-lg-8">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-info text-dark fw-bold px-3 py-1 rounded-pill">
                <i className="bi bi-snow2 me-1"></i> Cryobiology &amp; Biobanking
              </span>
              <span className="badge bg-white bg-opacity-20 text-white rounded-pill px-2 py-1 small">
                FACT-JACIE &amp; AABB Standards
              </span>
            </div>
            <h2 className="fw-extrabold mb-3 text-white">
              Stem Cell Biobanks: Preserving the Blueprint of Life
            </h2>
            <p className="text-white text-opacity-90 mb-0" style={{ fontSize: '1.02rem', lineHeight: '1.65' }}>
              A Stem Cell Bank is an ultra-high-security cryo-facility that processes, tests, and stores human cellular therapies in liquid nitrogen vapor at -196°C. Banking stem cells preserves healthy, pristine cells with zero age degradation for future life-saving interventions.
            </p>
          </div>
          <div className="col-lg-4 text-center mt-3 mt-lg-0">
            <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div className="d-flex justify-content-around text-center">
                <div>
                  <div className="display-6 fw-bold text-info">-196°C</div>
                  <div className="text-white-50 small">Storage Temp</div>
                </div>
                <div className="vr border-white border-opacity-25 mx-2"></div>
                <div>
                  <div className="display-6 fw-bold text-success">25+ Yrs</div>
                  <div className="text-white-50 small">Viability Period</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Public vs Private Banking Comparison Matrix */}
      <div className="card border-0 shadow-sm p-4 mb-4">
        <div className="d-flex align-items-center gap-3 mb-3">
          <div className="stat-icon bg-primary-subtle text-primary">
            <i className="bi bi-arrow-left-right"></i>
          </div>
          <div>
            <h4 className="fw-bold mb-0">Public vs. Private Stem Cell Banking</h4>
            <p className="text-secondary small mb-0">Understanding the core differences between altruistic public donation and family private banking</p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: '22%' }}>Dimension</th>
                <th style={{ width: '39%' }} className="text-primary">
                  <i className="bi bi-people-fill me-1"></i> Public Stem Cell Bank (e.g. DATRI, Be The Match)
                </th>
                <th style={{ width: '39%' }} className="text-success">
                  <i className="bi bi-shield-lock-fill me-1"></i> Private / Family Bank (e.g. LifeCell, Cryo-Cell)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="fw-semibold">Cost to Donor / Family</td>
                <td><span className="badge bg-success-subtle text-success fw-bold">100% Free</span> (Covered by registry/philanthropy)</td>
                <td>Initial processing fee (~$1,000–$2,000) + annual storage maintenance fee</td>
              </tr>
              <tr>
                <td className="fw-semibold">Who Can Use the Cells?</td>
                <td>Any matching patient worldwide in need of a life-saving transplant</td>
                <td>Exclusively reserved for the donor child or matched biological siblings/parents</td>
              </tr>
              <tr>
                <td className="fw-semibold">Clinical Utilization Rate</td>
                <td><strong>High</strong>: Regularly matched and shipped to patients fighting acute leukemia</td>
                <td><strong>Low</strong>: Statistical probability of autologous cord blood use is ~1 in 2,500</td>
              </tr>
              <tr>
                <td className="fw-semibold">Release Governance</td>
                <td>Controlled by international bone marrow registry &amp; transplant physician</td>
                <td>Released only upon written authorization of the biological family/guardians</td>
              </tr>
              <tr>
                <td className="fw-semibold">Accreditation Standards</td>
                <td>World Marrow Donor Association (WMDA), FACT, JACIE accredited</td>
                <td>AABB, FACT accredited, FDA registered</td>
              </tr>
              <tr>
                <td className="fw-semibold">Recommendation</td>
                <td><span className="text-primary fw-semibold">Highly recommended by medical academies</span> as an altruistic life gift</td>
                <td>Valuable for families with existing genetic conditions treatable by stem cells</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* The 5-Stage Cryopreservation Process */}
      <div className="card border-0 shadow-sm p-4 mb-4">
        <h4 className="fw-bold mb-1 d-flex align-items-center gap-2">
          <i className="bi bi-snow text-info"></i>
          The Biobanking Cryopreservation Journey
        </h4>
        <p className="text-secondary small mb-4">How cells are protected from cellular apoptosis and preserved in time for decades</p>

        <div className="row g-3">
          <div className="col-md-2dot4 col-sm-6">
            <div className="p-3 bg-light rounded-3 border h-100">
              <span className="badge bg-primary mb-2">Stage 1</span>
              <h6 className="fw-bold mb-1">Safe Collection</h6>
              <p className="text-secondary small mb-0">Collected immediately after birth or via sterile apheresis in anticoagulated bags.</p>
            </div>
          </div>
          <div className="col-md-2dot4 col-sm-6">
            <div className="p-3 bg-light rounded-3 border h-100">
              <span className="badge bg-info mb-2">Stage 2</span>
              <h6 className="fw-bold mb-1">Cold-Chain Transit</h6>
              <p className="text-secondary small mb-0">Expedited courier transport within 24–48 hours with continuous temperature dataloggers.</p>
            </div>
          </div>
          <div className="col-md-2dot4 col-sm-6">
            <div className="p-3 bg-light rounded-3 border h-100">
              <span className="badge bg-warning mb-2">Stage 3</span>
              <h6 className="fw-bold mb-1">Cell QC &amp; Typing</h6>
              <p className="text-secondary small mb-0">Volume reduction, CD34+ enumeration via flow cytometry, microbial testing, and HLA typing.</p>
            </div>
          </div>
          <div className="col-md-2dot4 col-sm-6">
            <div className="p-3 bg-light rounded-3 border h-100">
              <span className="badge bg-purple mb-2" style={{ backgroundColor: '#8b5cf6', color: 'white' }}>Stage 4</span>
              <h6 className="fw-bold mb-1">Rate Freezing</h6>
              <p className="text-secondary small mb-0">Cryoprotectant (DMSO) added; cooled at computer-controlled 1°C per minute rate.</p>
            </div>
          </div>
          <div className="col-md-2dot4 col-sm-6">
            <div className="p-3 bg-light rounded-3 border h-100">
              <span className="badge bg-success mb-2">Stage 5</span>
              <h6 className="fw-bold mb-1">-196°C Storage</h6>
              <p className="text-secondary small mb-0">Immersed in liquid nitrogen vapor phase with uninterruptible telemetry and backup tanks.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Sample Storage Explorer */}
      <div className="card border-0 shadow-sm p-4 mb-4">
        <h4 className="fw-bold mb-1 d-flex align-items-center gap-2">
          <i className="bi bi-box2-heart-fill text-danger"></i>
          What Cellular Materials Can Be Stored in a Biobank?
        </h4>
        <p className="text-secondary small mb-3">Click on a sample type to view stem cell composition, longevity, and clinical utility</p>

        <div className="d-flex flex-wrap gap-2 mb-3">
          {Object.entries(sampleTypes).map(([key, item]) => (
            <button
              key={key}
              type="button"
              className={`btn btn-sm rounded-pill px-3 py-2 ${selectedStorageSample === key ? 'btn-primary fw-bold shadow-sm' : 'btn-outline-secondary'}`}
              onClick={() => setSelectedStorageSample(key)}
            >
              {item.name}
            </button>
          ))}
        </div>

        <div className="p-3 rounded-3 bg-light border">
          <div className="row g-3">
            <div className="col-md-6">
              <h5 className="fw-bold text-primary mb-2">{activeSample.name}</h5>
              <div className="mb-2">
                <span className="text-muted small fw-bold">Primary Cells:</span>
                <div className="fw-semibold text-dark">{activeSample.cells}</div>
              </div>
              <div className="mb-2">
                <span className="text-muted small fw-bold">Collection Procedure:</span>
                <div className="text-secondary small">{activeSample.collection}</div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-2">
                <span className="text-muted small fw-bold">Cryogenic Temperature:</span>
                <div><span className="badge bg-info-subtle text-info fw-bold">{activeSample.temp}</span></div>
              </div>
              <div className="mb-2">
                <span className="text-muted small fw-bold">Viability Guarantee:</span>
                <div className="text-success fw-bold small">{activeSample.viability}</div>
              </div>
              <div>
                <span className="text-muted small fw-bold">Approved Clinical Indications:</span>
                <div className="text-secondary small">{activeSample.approvedIndications}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Certified Stem Cell Banks Directory */}
      <div className="card border-0 shadow-sm p-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-primary-subtle text-primary fw-semibold px-2 py-1 rounded-pill small">
                <i className="bi bi-shield-check me-1"></i> GOVERNMENT &amp; CLINICAL DIRECTORY
              </span>
              <span className="badge bg-light text-muted border rounded-pill small">
                {banks.length} Licensed Indian Biobanks
              </span>
            </div>
            <h4 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
              <i className="bi bi-building-check text-primary"></i>
              Certified Stem Cell Banks &amp; Repositories Directory
            </h4>
            <p className="text-secondary small mb-0">
              Authorized cord blood and stem cell banking organizations across India
            </p>
          </div>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <div className="input-group input-group-sm" style={{ width: '240px' }}>
              <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search bank name or city..."
                value={bankSearch}
                onChange={(e) => setBankSearch(e.target.value)}
              />
              {bankSearch && (
                <button className="btn btn-sm btn-link text-muted pe-2" onClick={() => setBankSearch('')}>
                  <i className="bi bi-x-circle-fill"></i>
                </button>
              )}
            </div>
            <select
              className="form-select form-select-sm"
              style={{ width: '160px' }}
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
            >
              <option value="ALL">All States / UTs</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Haryana">Haryana</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="West Bengal">West Bengal</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
            </select>
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-sm btn-primary rounded-pill px-3 py-1 shadow-xs d-flex align-items-center gap-1"
            >
              <i className="bi bi-plus-circle-fill"></i>
              <span>Add Bank</span>
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: '60px' }}>#</th>
                <th>Stem Cell Bank Name</th>
                <th>Location / Storage Facility</th>
                <th>State / Region</th>
                <th>Accreditation Status</th>
                <th className="text-end pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-secondary me-2"></div>
                    <span className="text-muted">Loading stem cell bank directory...</span>
                  </td>
                </tr>
              ) : filteredBanks.length > 0 ? (
                filteredBanks.map((b) => (
                  <tr key={b.id}>
                    <td className="text-muted font-monospace small">#{b.id}</td>
                    <td>
                      <div className="fw-bold text-dark">{b.bank_name || b.name}</div>
                    </td>
                    <td>
                      <span className="small text-secondary">{b.location || b.country}</span>
                    </td>
                    <td>
                      <span className={`badge rounded-pill px-2 py-1 ${getStateBadge(b.location || b.country)}`}>
                        {extractState(b.location || b.country)}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        <i className="bi bi-patch-check-fill text-primary me-1"></i>
                        Licensed Biobank
                      </span>
                    </td>
                    <td className="text-end pe-3">
                      <button
                        onClick={() => handleDeleteBank(b.id)}
                        className="btn btn-sm btn-light border text-danger rounded-3 px-2 py-1"
                        title="Delete Bank Entry"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">No banks matched your search criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content border-0 shadow">
              <form onSubmit={handleAddBank}>
                <div className="modal-header bg-light">
                  <h5 className="modal-title">Add Stem Cell Bank</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Bank Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. LifeCell International Pvt. Ltd."
                      value={formData.bank_name}
                      onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Location / Storage Facility *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Chennai, Tamil Nadu; Gurugram, Haryana"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Bank</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StemCellBankInfo;
