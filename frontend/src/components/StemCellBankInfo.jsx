import React, { useState } from 'react';

const StemCellBankInfo = () => {
  const [bankSearch, setBankSearch] = useState('');
  const [bankTypeFilter, setBankTypeFilter] = useState('all');
  const [selectedStorageSample, setSelectedStorageSample] = useState('cord_blood');

  const certifiedBanks = [
    {
      id: 1,
      name: 'DATRI Blood Stem Cell Donors Registry',
      country: 'India (National Registry)',
      type: 'Public / Registry',
      accreditation: 'WMDA Qualified, ISO 9001',
      storageTemp: '-196°C Liquid Nitrogen',
      capacity: '500,000+ Donors Registered',
      contact: 'info@datri.org | 1800-300-32874',
      website: 'datri.org',
      highlight: 'Largest voluntary unrelated stem cell donor registry in India'
    },
    {
      id: 2,
      name: 'NMDP / Be The Match',
      country: 'USA / International',
      type: 'Public / Registry',
      accreditation: 'FACT, AABB, CLIA Certified',
      storageTemp: '-196°C Liquid Nitrogen Vapor',
      capacity: '41,000,000+ Global Donors',
      contact: 'support@nmdp.org | 1-800-627-7692',
      website: 'bethematch.org',
      highlight: 'Operates the world\'s most diverse donor registry and cord blood repository'
    },
    {
      id: 3,
      name: 'LifeCell International',
      country: 'India & South Asia',
      type: 'Community & Private Biobank',
      accreditation: 'AABB, FACT, CAP, ISO Accredited',
      storageTemp: '-196°C Cryotanks',
      capacity: '400,000+ Units Banked',
      contact: 'care@lifecell.in | 1800-266-5533',
      website: 'lifecell.in',
      highlight: 'Pioneer of community stem cell banking with shared family inventory access'
    },
    {
      id: 4,
      name: 'Cordlife Group Ltd',
      country: 'Singapore & Asia-Pacific',
      type: 'Private Biobank',
      accreditation: 'AABB Accredited, ISO 9001',
      storageTemp: '-196°C MVE Cryosystems',
      capacity: '600,000+ Family Clients',
      contact: 'info@cordlife.com',
      website: 'cordlife.com',
      highlight: 'Dual-location storage with international biomedical standards'
    },
    {
      id: 5,
      name: 'Cryo-Cell International',
      country: 'USA (Florida)',
      type: 'Private Biobank',
      accreditation: 'FACT, AABB, FDA Registered',
      storageTemp: '-196°C Vapor Phase',
      capacity: '500,000+ Samples Worldwide',
      contact: 'clientcare@cryo-cell.com',
      website: 'cryo-cell.com',
      highlight: 'World’s first private cord blood bank operating continuously since 1989'
    },
    {
      id: 6,
      name: 'Anthony Nolan Trust',
      country: 'United Kingdom',
      type: 'Public / Registry & Cord Bank',
      accreditation: 'WMDA, JACIE Accredited, HTA',
      storageTemp: '-196°C Cryogenic Bio-repository',
      capacity: '900,000+ Registry Members',
      contact: 'register@anthonynolan.org',
      website: 'anthonynolan.org',
      highlight: 'First stem cell registry in the world, pioneering cord blood research since 1974'
    },
    {
      id: 7,
      name: 'DKMS Blood Stem Cell Registry',
      country: 'Germany / Poland / India / USA',
      type: 'Public / International Registry',
      accreditation: 'WMDA, EFI, FACT Accredited',
      storageTemp: '-196°C Certified Freezers',
      capacity: '11,500,000+ Registered Donors',
      contact: 'donor@dkms.org',
      website: 'dkms.org',
      highlight: 'World\'s largest donor center, facilitated over 105,000 stem cell transplants'
    }
  ];

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

  const filteredBanks = certifiedBanks.filter((bank) => {
    const matchesSearch =
      bank.name.toLowerCase().includes(bankSearch.toLowerCase()) ||
      bank.country.toLowerCase().includes(bankSearch.toLowerCase()) ||
      bank.accreditation.toLowerCase().includes(bankSearch.toLowerCase());
    const matchesType =
      bankTypeFilter === 'all' ||
      (bankTypeFilter === 'public' && bank.type.toLowerCase().includes('public')) ||
      (bankTypeFilter === 'private' && (bank.type.toLowerCase().includes('private') || bank.type.toLowerCase().includes('community')));
    return matchesSearch && matchesType;
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
            <h4 className="fw-bold mb-1 d-flex align-items-center gap-2">
              <i className="bi bi-building-check text-primary"></i>
              Certified Global &amp; National Stem Cell Banks Directory
            </h4>
            <p className="text-secondary small mb-0">Accredited registries and repositories adhering to FACT-JACIE, AABB, and WMDA standards</p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <div className="input-group input-group-sm" style={{ width: '220px' }}>
              <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search bank or city..."
                value={bankSearch}
                onChange={(e) => setBankSearch(e.target.value)}
              />
            </div>
            <select
              className="form-select form-select-sm"
              style={{ width: '130px' }}
              value={bankTypeFilter}
              onChange={(e) => setBankTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Bank &amp; Registry Name</th>
                <th>Location / Jurisdiction</th>
                <th>Type</th>
                <th>Accreditation</th>
                <th>Registered Capacity</th>
                <th>Key Highlights</th>
              </tr>
            </thead>
            <tbody>
              {filteredBanks.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div className="fw-bold text-dark">{b.name}</div>
                    <small className="text-muted"><i className="bi bi-globe me-1"></i>{b.website}</small>
                  </td>
                  <td>{b.country}</td>
                  <td>
                    <span className={`badge ${b.type.includes('Public') ? 'bg-primary-subtle text-primary' : 'bg-success-subtle text-success'} rounded-pill`}>
                      {b.type}
                    </span>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark border">
                      <i className="bi bi-shield-check text-success me-1"></i>
                      {b.accreditation}
                    </span>
                  </td>
                  <td className="small fw-semibold">{b.capacity}</td>
                  <td><small className="text-secondary">{b.highlight}</small></td>
                </tr>
              ))}
              {filteredBanks.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">No banks matched your search criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StemCellBankInfo;
