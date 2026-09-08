import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ACCREDITED_CENTRES = [
  {
    id: 1,
    name: 'National Stem Cell Institute & Research Centre',
    city: 'Mumbai, Maharashtra',
    type: 'Apex Government / Autonomous Tertiary Hospital',
    accreditation: 'FACT-JACIE Accredited, NABH Digital, CDSCO Approved',
    bmtBeds: '28 HEPA-Filtered Positive Pressure BMT Suites',
    services: 'Allogeneic MUD Transplants, Haploidentical BMT, Autologous Rescue, Cryo Banking',
    contact: '+91 22 6100 4000 | bmt-admissions@nscirc.gov.in',
    website: 'https://nscirc.gov.in',
    highlights: 'Over 1,200 successful stem cell transplants with 92% overall survival rate.'
  },
  {
    id: 2,
    name: 'Tata Memorial Hospital & ACTREC Cell Therapy Centre',
    city: 'Navi Mumbai, Maharashtra',
    type: 'Comprehensive Cancer Care & Cellular Therapy Centre',
    accreditation: 'FACT Accredited, ISO 9001, WMDA Qualified',
    bmtBeds: '34 Cryo-Protected Isolation Units',
    services: 'Pediatric & Adult Leukemia BMT, CAR-T Cell Clinical Trials, Cord Blood Banking',
    contact: '+91 22 2740 5000 | actrec-bmt@tmc.gov.in',
    website: 'https://tmc.gov.in',
    highlights: 'Pioneer of indigenous CAR-T therapies and regional public umbilical cord bio-repository.'
  },
  {
    id: 3,
    name: 'Apollo Institute of Colorectal & Stem Cell Transplant',
    city: 'Chennai, Tamil Nadu',
    type: 'Private Multi-Specialty Quaternary Centre',
    accreditation: 'JCI Accredited, AABB Certified, NABH',
    bmtBeds: '20 Clean Room Positive-Pressure Rooms',
    services: 'Unrelated Donor Stem Cell Matching, Gene Therapy for Thalassemia Major',
    contact: '+91 44 2829 0200 | stemcell@apollohospitals.com',
    website: 'https://apollohospitals.com',
    highlights: 'Advanced apheresis harvesting suite and international donor procurement protocols.'
  },
  {
    id: 4,
    name: 'Christian Medical College (CMC) Hematology & BMT Dept',
    city: 'Vellore, Tamil Nadu',
    type: 'Charitable Teaching Hospital & Research Foundation',
    accreditation: 'NABH, CDSCO, WMDA Participating Member',
    bmtBeds: '24 Dedicated Bone Marrow Transplant Units',
    services: 'Aplastic Anemia Allografts, Cord Blood Transplantation, Microchimerism Monitoring',
    contact: '+91 416 228 1000 | hematology@cmcvellore.ac.in',
    website: 'https://cmch-vellore.edu',
    highlights: 'First center in South Asia to perform allogeneic bone marrow transplantation.'
  }
];

const HospitalsCentres = () => {
  const [search, setSearch] = useState('');

  const filteredCentres = ACCREDITED_CENTRES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase()) ||
    c.services.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="koshika-animate-fadein pb-5">
      {/* Header */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-success-subtle text-success fw-bold px-3 py-1 rounded-pill small">
                <i className="bi bi-building-check me-1"></i> FIND CARE
              </span>
              <span className="badge bg-light text-secondary border px-2 py-1 rounded-pill small">
                FACT &amp; NABH Certified Institutions
              </span>
            </div>
            <h2 className="fw-bold text-dark mb-1">
              Transplant Hospitals &amp; Certified Centres
            </h2>
            <p className="text-secondary mb-0 small">
              Accredited medical institutes equipped with positive-pressure HEPA filtration suites, apheresis units, and cryogenic storage
            </p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/find-care/doctors" className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-2">
              <i className="bi bi-person-badge me-1"></i>
              <span>Find Doctors</span>
            </Link>
            <Link to="/bank" className="btn btn-primary btn-sm rounded-pill px-3 py-2">
              <i className="bi bi-safe2-fill me-1"></i>
              <span>Stem Cell Banks</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="input-group">
          <span className="input-group-text bg-light border-end-0">
            <i className="bi bi-search text-muted"></i>
          </span>
          <input
            type="text"
            className="form-control bg-light border-start-0"
            placeholder="Search hospitals by name, city, services (e.g. Mumbai, Thalassemia, CAR-T)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Centres List */}
      <div className="row g-4">
        {filteredCentres.map((centre) => (
          <div key={centre.id} className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1 small">
                    <i className="bi bi-geo-alt-fill me-1"></i>{centre.city}
                  </span>
                  <span className="badge bg-success-subtle text-success small">Accredited</span>
                </div>
                <h5 className="fw-bold text-dark mb-1">{centre.name}</h5>
                <small className="text-muted d-block mb-3">{centre.type}</small>

                <div className="p-3 bg-light rounded-3 mb-3 small">
                  <div className="mb-2">
                    <strong className="text-dark d-block">Standards &amp; Accreditation:</strong>
                    <span className="text-secondary">{centre.accreditation}</span>
                  </div>
                  <div className="mb-2">
                    <strong className="text-dark d-block">Transplant Infrastructure:</strong>
                    <span className="text-secondary">{centre.bmtBeds}</span>
                  </div>
                  <div>
                    <strong className="text-dark d-block">Clinical Services:</strong>
                    <span className="text-secondary">{centre.services}</span>
                  </div>
                </div>

                <p className="text-secondary small mb-3">
                  <i className="bi bi-info-circle-fill text-info me-1"></i>
                  {centre.highlights}
                </p>
              </div>

              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center pt-3 border-top gap-2">
                <span className="small text-muted">{centre.contact}</span>
                <Link to="/appointments" className="btn btn-sm btn-outline-primary rounded-pill px-3">
                  Request Referral
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HospitalsCentres;
