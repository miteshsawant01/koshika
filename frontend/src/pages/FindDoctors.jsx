import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const ACCREDITED_DOCTORS = [
  {
    id: 1,
    name: 'Dr. Aris Thorne, MD, DM',
    specialty: 'Clinical Hematology & Bone Marrow Transplant',
    department: 'Hematology & BMT',
    hospital: 'National Stem Cell Institute & Research Centre',
    experience: '18 Years Experience',
    qualification: 'MD, DM (Clinical Hematology), Fellowship BMT (Seattle)',
    rating: 4.9,
    reviews: 142,
    availableDays: 'Mon, Wed, Fri',
    fee: '₹1,500 ($25)',
    contact: '+91 22 6100 4501'
  },
  {
    id: 2,
    name: 'Dr. Evelyn Vance, PhD, MD',
    specialty: 'Immunogenomics & HLA Tissue Typing',
    department: 'Immunology & Genetics',
    hospital: 'Metro Biobank & Regenerative Health',
    experience: '14 Years Experience',
    qualification: 'MD, PhD (Human Genetics), EFI Certified HLA Director',
    rating: 4.8,
    reviews: 98,
    availableDays: 'Tue, Thu, Sat',
    fee: '₹1,800 ($30)',
    contact: '+91 22 6100 4502'
  },
  {
    id: 3,
    name: 'Dr. Vikram Malhotra, MBBS, DNB',
    specialty: 'Pediatric Hematology & Stem Cell Transplant',
    department: 'Pediatric Oncology',
    hospital: 'Apollo Children\'s Hospital & Stem Cell Center',
    experience: '16 Years Experience',
    qualification: 'MBBS, DNB (Pediatrics), Fellowship in Pediatric BMT (UK)',
    rating: 4.9,
    reviews: 165,
    availableDays: 'Mon, Tue, Thu',
    fee: '₹1,600 ($26)',
    contact: '+91 22 6100 4503'
  },
  {
    id: 4,
    name: 'Dr. Sunita Deshmukh, MD',
    specialty: 'Cellular Therapy & Apheresis Medicine',
    department: 'Transfusion Medicine & Cryo Vault',
    hospital: 'Tata Memorial Centre & ACTREC Bio-Repository',
    experience: '20 Years Experience',
    qualification: 'MD (Transfusion Medicine), FACT-JACIE Inspector',
    rating: 5.0,
    reviews: 210,
    availableDays: 'Wed, Fri, Sat',
    fee: '₹2,000 ($32)',
    contact: '+91 22 6100 4504'
  }
];

const FindDoctors = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [doctors, setDoctors] = useState(ACCREDITED_DOCTORS);
  const [bookingDoc, setBookingDoc] = useState(null);
  const [bookingDate, setBookingDate] = useState('Tomorrow, 10:30 AM');
  const [bookingMode, setBookingMode] = useState('In-Person Consultation');

  useEffect(() => {
    // Optionally augment with backend staff if available
    api.get('/staff/')
      .then(res => {
        const backendStaff = res.data.results || res.data || [];
        if (backendStaff.length > 0) {
          const mapped = backendStaff.map((s, idx) => ({
            id: s.staff_id || (idx + 10),
            name: s.name.startsWith('Dr.') ? s.name : `Dr. ${s.name}`,
            specialty: s.role || 'Transplant Specialist',
            department: s.department || 'Clinical Care',
            hospital: 'KOSHIKA Network Partner Hospital',
            experience: '12+ Years Experience',
            qualification: 'Certified Stem Cell Clinician',
            rating: 4.8,
            reviews: 64,
            availableDays: 'Mon - Fri',
            fee: 'Standard Consultation',
            contact: s.contact || 'Registered Clinic'
          }));
          // Merge avoiding exact name duplicates
          const names = new Set(ACCREDITED_DOCTORS.map(d => d.name.toLowerCase()));
          const combined = [...ACCREDITED_DOCTORS];
          mapped.forEach(m => {
            if (!names.has(m.name.toLowerCase())) {
              combined.push(m);
            }
          });
          setDoctors(combined);
        }
      })
      .catch(() => {});
  }, []);

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(search.toLowerCase()) ||
      doc.hospital.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || doc.department.includes(selectedDept);
    return matchesSearch && matchesDept;
  });

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    alert(`Consultation booked successfully with ${bookingDoc.name} for ${bookingDate} (${bookingMode})!`);
    setBookingDoc(null);
    navigate('/appointments');
  };

  return (
    <div className="koshika-animate-fadein pb-5">
      {/* Header */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-success-subtle text-success fw-bold px-3 py-1 rounded-pill small">
                <i className="bi bi-hospital me-1"></i> FIND CARE
              </span>
              <span className="badge bg-light text-secondary border px-2 py-1 rounded-pill small">
                Verified Stem Cell Specialists
              </span>
            </div>
            <h2 className="fw-bold text-dark mb-1">
              Find Doctors &amp; Specialists
            </h2>
            <p className="text-secondary mb-0 small">
              Connect with leading hematologists, bone marrow transplant surgeons, and HLA geneticists for expert clinical guidance
            </p>
          </div>
          <div className="d-flex gap-2">
            <button
              onClick={() => navigate('/find-care/centres')}
              className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-2"
            >
              <i className="bi bi-building me-1"></i>
              <span>View Hospitals</span>
            </button>
            <button
              onClick={() => navigate('/bank')}
              className="btn btn-outline-primary btn-sm rounded-pill px-3 py-2"
            >
              <i className="bi bi-safe2-fill me-1"></i>
              <span>Stem Cell Banks</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search by doctor name, specialty, hospital..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-6 d-flex flex-wrap gap-1 justify-content-md-end">
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 ${selectedDept === 'ALL' ? 'btn-primary' : 'btn-light border'}`}
              onClick={() => setSelectedDept('ALL')}
            >
              All Specialties
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 ${selectedDept === 'Hematology' ? 'btn-primary' : 'btn-light border'}`}
              onClick={() => setSelectedDept('Hematology')}
            >
              Hematology / BMT
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 ${selectedDept === 'Immunology' ? 'btn-primary' : 'btn-light border'}`}
              onClick={() => setSelectedDept('Immunology')}
            >
              HLA &amp; Genetics
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 ${selectedDept === 'Pediatric' ? 'btn-primary' : 'btn-light border'}`}
              onClick={() => setSelectedDept('Pediatric')}
            >
              Pediatric
            </button>
          </div>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="row g-4">
        {filteredDoctors.map((doc) => (
          <div key={doc.id} className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-xs"
                      style={{
                        width: '56px',
                        height: '56px',
                        background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
                        fontSize: '1.25rem'
                      }}
                    >
                      {doc.name.replace('Dr. ', '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h5 className="fw-bold text-dark mb-0">{doc.name}</h5>
                      <span className="text-primary fw-semibold small d-block">{doc.specialty}</span>
                      <small className="text-muted">{doc.qualification}</small>
                    </div>
                  </div>
                  <span className="badge bg-success-subtle text-success rounded-pill px-2 py-1 small">
                    ★ {doc.rating} ({doc.reviews})
                  </span>
                </div>

                <div className="p-3 bg-light rounded-3 mb-3 small">
                  <div className="mb-1 text-dark">
                    <i className="bi bi-hospital-fill text-secondary me-2"></i>
                    <strong>{doc.hospital}</strong>
                  </div>
                  <div className="text-muted mb-1">
                    <i className="bi bi-award-fill text-warning me-2"></i>
                    <span>{doc.experience}</span>
                  </div>
                  <div className="text-muted">
                    <i className="bi bi-calendar-check me-2 text-success"></i>
                    <span>Available: {doc.availableDays}</span>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                <span className="small text-secondary">
                  Consultation Fee: <strong className="text-dark">{doc.fee}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setBookingDoc(doc)}
                  className="btn btn-primary btn-sm rounded-pill px-4 shadow-xs"
                >
                  Book Consultation
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {bookingDoc && (
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
                <h5 className="modal-title fw-bold text-dark">Book Consultation</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setBookingDoc(null)}
                  aria-label="Close"
                ></button>
              </div>
              <form onSubmit={handleConfirmBooking}>
                <div className="modal-body px-4 py-3">
                  <div className="p-3 bg-light rounded-3 mb-3">
                    <h6 className="fw-bold text-dark mb-1">{bookingDoc.name}</h6>
                    <small className="text-primary d-block">{bookingDoc.specialty}</small>
                    <small className="text-secondary">{bookingDoc.hospital}</small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Consultation Mode</label>
                    <select
                      className="form-select"
                      value={bookingMode}
                      onChange={(e) => setBookingMode(e.target.value)}
                    >
                      <option value="In-Person Consultation">In-Person Consultation (Hospital OPD)</option>
                      <option value="Tele-Consultation (Video)">Tele-Consultation (Online Video Call)</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Preferred Date &amp; Time Slot</label>
                    <select
                      className="form-select"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                    >
                      <option value="Tomorrow, 10:30 AM">Tomorrow, 10:30 AM</option>
                      <option value="Tomorrow, 3:00 PM">Tomorrow, 3:00 PM</option>
                      <option value="Friday, 11:00 AM">Friday, 11:00 AM</option>
                      <option value="Saturday, 2:30 PM">Saturday, 2:30 PM</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-top px-4 py-3 d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-3"
                    onClick={() => setBookingDoc(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4"
                  >
                    Confirm Booking
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

export default FindDoctors;
