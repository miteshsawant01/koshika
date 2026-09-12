import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export const CERTIFIED_SPECIALISTS = [
  {
    id: 1,
    name: 'Dr. Sharat Damodar',
    specialty: 'Adult Haemato-Oncology & BMT; Cellular Therapy; CAR-T',
    department: 'Adult Haemato-Oncology & BMT',
    hospital: 'Narayana Health & Mazumdar Shaw Cancer Centre, Bengaluru',
    experience: '24+ Years Experience',
    qualification: 'MD, Fellowship in BMT & Cellular Therapy (USA)',
    rating: 4.9,
    reviews: 184,
    availableDays: 'Mon, Wed, Fri',
    fee: '₹1,800 ($22)',
    contact: '080-6750 6800'
  },
  {
    id: 2,
    name: 'Dr. Shilpa Prabhu',
    specialty: 'Adult Haemato-Oncology & BMT; Cellular Therapy; CAR-T',
    department: 'Adult Haemato-Oncology & BMT',
    hospital: 'Mazumdar Shaw Medical Center, Bengaluru',
    experience: '16+ Years Experience',
    qualification: 'MBBS, MD, Fellowship in Haematology & BMT',
    rating: 4.9,
    reviews: 142,
    availableDays: 'Tue, Thu, Sat',
    fee: '₹1,500 ($18)',
    contact: '080-6750 6801'
  },
  {
    id: 3,
    name: 'Dr. Sunil Bhat',
    specialty: 'Paediatric Haemato-Oncology & BMT; Stem-Cell Transplantation; CAR-T',
    department: 'Paediatric Haemato-Oncology & BMT',
    hospital: 'Narayana Health & Mazumdar Shaw Cancer Centre, Bengaluru',
    experience: '22+ Years Experience',
    qualification: 'MBBS, MD (Paediatrics), Fellowship in Paediatric BMT & CAR-T',
    rating: 5.0,
    reviews: 215,
    availableDays: 'Mon, Tue, Thu',
    fee: '₹1,800 ($22)',
    contact: '080-6750 6802'
  },
  {
    id: 4,
    name: 'Dr. Pooja P. Mallya',
    specialty: 'Paediatric Haemato-Oncology & BMT; Cellular Therapy',
    department: 'Paediatric Haemato-Oncology & BMT',
    hospital: 'Mazumdar Shaw Cancer Centre, Bengaluru',
    experience: '14+ Years Experience',
    qualification: 'MBBS, DNB (Paediatrics), Fellowship in Paediatric BMT',
    rating: 4.8,
    reviews: 96,
    availableDays: 'Wed, Fri, Sat',
    fee: '₹1,500 ($18)',
    contact: '080-6750 6803'
  },
  {
    id: 5,
    name: 'Dr. Shobha B',
    specialty: 'Paediatric Haemato-Oncology & BMT; Cellular Therapy',
    department: 'Paediatric Haemato-Oncology & BMT',
    hospital: 'Narayana Health City, Bengaluru',
    experience: '15+ Years Experience',
    qualification: 'MBBS, MD, Fellowship in Paediatric BMT',
    rating: 4.8,
    reviews: 110,
    availableDays: 'Mon, Wed, Sat',
    fee: '₹1,500 ($18)',
    contact: '080-6750 6804'
  },
  {
    id: 6,
    name: 'Dr. Suparno Chakrabarti',
    specialty: 'Senior Consultant & HOD, Haemato-Oncology & Bone Marrow Transplant',
    department: 'Senior Consultant & HOD, BMT',
    hospital: 'Dharamshila Narayana Super Speciality Hospital, New Delhi',
    experience: '26+ Years Experience',
    qualification: 'MD, FRCPath, Post-Doctoral Fellowship in BMT (UK)',
    rating: 5.0,
    reviews: 248,
    availableDays: 'Mon, Tue, Thu, Fri',
    fee: '₹2,000 ($25)',
    contact: '011-4306 6666'
  },
  {
    id: 7,
    name: 'Dr. Sarita Rani Jaiswal',
    specialty: 'Program Director, Haploidentical BMT; BMT & Haematology',
    department: 'Haploidentical BMT & Haematology',
    hospital: 'Dharamshila Narayana Super Speciality Hospital, New Delhi',
    experience: '18+ Years Experience',
    qualification: 'MBBS, MD, Fellowship in Haploidentical BMT',
    rating: 4.9,
    reviews: 172,
    availableDays: 'Tue, Thu, Sat',
    fee: '₹1,800 ($22)',
    contact: '011-4306 6667'
  },
  {
    id: 8,
    name: 'Dr. Megha Saroha',
    specialty: 'Paediatric Haemato-Oncology & Bone Marrow Transplant',
    department: 'Paediatric Haemato-Oncology & BMT',
    hospital: 'Dharamshila Narayana Super Speciality Hospital, New Delhi',
    experience: '12+ Years Experience',
    qualification: 'MBBS, DNB (Paediatrics), Fellowship in Paediatric BMT',
    rating: 4.8,
    reviews: 88,
    availableDays: 'Mon, Wed, Fri',
    fee: '₹1,500 ($18)',
    contact: '011-4306 6668'
  },
  {
    id: 9,
    name: 'Dr. Ashish Dixit',
    specialty: 'Clinical Haematology; Blood & Marrow Transplant',
    department: 'Clinical Haematology & BMT',
    hospital: 'Manipal Hospital Old Airport Road, Bengaluru',
    experience: '20+ Years Experience',
    qualification: 'MBBS, MD, DM (Clinical Haematology)',
    rating: 4.9,
    reviews: 195,
    availableDays: 'Mon, Wed, Fri',
    fee: '₹1,800 ($22)',
    contact: '080-2502 4444'
  },
  {
    id: 10,
    name: 'Dr. Dharma Choudhary',
    specialty: 'Haematology and Bone Marrow Transplant',
    department: 'Haematology & BMT',
    hospital: 'Sanar International Hospital & BLK-Max Super Speciality Hospital, Delhi NCR',
    experience: '25+ Years Experience',
    qualification: 'MBBS, MD, DM (Clinical Haematology)',
    rating: 5.0,
    reviews: 280,
    availableDays: 'Tue, Thu, Sat',
    fee: '₹2,200 ($27)',
    contact: '0124-382 8888'
  },
  {
    id: 11,
    name: 'Dr. Lalit Kumar',
    specialty: 'Haematology/Oncology; Blood Stem-Cell/Bone-Marrow Transplantation',
    department: 'Haematology & Medical Oncology',
    hospital: 'Artemis Hospitals, Gurugram (Former Head of Medical Oncology, AIIMS New Delhi)',
    experience: '32+ Years Experience',
    qualification: 'MBBS, MD, DM (Medical Oncology), Padma Shri Awardee',
    rating: 5.0,
    reviews: 340,
    availableDays: 'Mon, Wed, Fri',
    fee: '₹2,500 ($30)',
    contact: '0124-451 1111'
  },
  {
    id: 12,
    name: 'Dr. Ashray Kole',
    specialty: 'Haematology & BMT; Haemato-Oncology and Stem-Cell Transplantation',
    department: 'Haematology & BMT',
    hospital: 'Ruby Hall Clinic & Jupiter Hospital, Pune',
    experience: '14+ Years Experience',
    qualification: 'MBBS, MD, DM (Clinical Haematology)',
    rating: 4.8,
    reviews: 104,
    availableDays: 'Tue, Thu, Sat',
    fee: '₹1,600 ($20)',
    contact: '020-6645 5100'
  },
  {
    id: 13,
    name: 'Dr. Shyam Rathi',
    specialty: 'Haematology and Bone Marrow Transplant',
    department: 'Haematology & BMT',
    hospital: 'Kokilaben Dhirubhai Ambani Hospital & Medical Research Institute, Mumbai',
    experience: '16+ Years Experience',
    qualification: 'MBBS, MD, DM (Clinical Haematology), Fellowship BMT',
    rating: 4.9,
    reviews: 138,
    availableDays: 'Mon, Wed, Fri',
    fee: '₹1,800 ($22)',
    contact: '022-4269 6969'
  },
  {
    id: 14,
    name: 'Dr. Prathamesh Kulkarni',
    specialty: 'Haematology, Haemato-Oncology & Stem-Cell Transplantation',
    department: 'Haematology & Stem-Cell Transplantation',
    hospital: 'Deenanath Mangeshkar Hospital and Research Center, Pune',
    experience: '15+ Years Experience',
    qualification: 'MBBS, MD, DM (Haematology), Fellowship in BMT',
    rating: 4.8,
    reviews: 118,
    availableDays: 'Mon, Tue, Thu',
    fee: '₹1,600 ($20)',
    contact: '020-4015 1000'
  },
  {
    id: 15,
    name: 'Dr. Santanu Sen',
    specialty: 'Paediatric Haematology, Oncology, BMT & Cellular Therapy',
    department: 'Paediatric Haematology & BMT',
    hospital: 'Kokilaben Dhirubhai Ambani Hospital, Mumbai',
    experience: '20+ Years Experience',
    qualification: 'MBBS, MD (Paediatrics), MRCPCH (UK), Fellowship BMT (UK)',
    rating: 4.9,
    reviews: 180,
    availableDays: 'Wed, Fri, Sat',
    fee: '₹2,000 ($25)',
    contact: '022-4269 6970'
  },
  {
    id: 16,
    name: 'Dr. Shrinath Kshirsagar',
    specialty: 'Haematology, Haemato-Oncology & BMT',
    department: 'Haematology & BMT',
    hospital: 'Apollo Hospitals, Navi Mumbai',
    experience: '13+ Years Experience',
    qualification: 'MBBS, MD, DM (Clinical Haematology)',
    rating: 4.8,
    reviews: 92,
    availableDays: 'Tue, Thu, Sat',
    fee: '₹1,600 ($20)',
    contact: '022-3350 3350'
  },
  {
    id: 17,
    name: 'Dr. Lalit Raut',
    specialty: 'Haematology & Bone Marrow Transplant',
    department: 'Haematology & BMT',
    hospital: 'Sahyadri Super Speciality Hospitals, Pune',
    experience: '17+ Years Experience',
    qualification: 'MBBS, MD, DM (Clinical Haematology)',
    rating: 4.9,
    reviews: 145,
    availableDays: 'Mon, Wed, Fri',
    fee: '₹1,700 ($21)',
    contact: '020-6721 3000'
  }
];

const FindDoctors = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [doctors, setDoctors] = useState(CERTIFIED_SPECIALISTS);
  const [bookingDoc, setBookingDoc] = useState(null);
  const [bookingDate, setBookingDate] = useState('Tomorrow, 10:30 AM');
  const [bookingMode, setBookingMode] = useState('In-Person Consultation');

  useEffect(() => {
    // Augment with backend staff if available
    api.get('/staff/')
      .then(res => {
        const backendStaff = res.data?.results || res.data || [];
        if (backendStaff.length > 0) {
          const namesMap = new Map();
          CERTIFIED_SPECIALISTS.forEach(d => namesMap.set(d.name.toLowerCase().trim(), d));

          // Merge any custom added doctors
          const merged = [...CERTIFIED_SPECIALISTS];
          backendStaff.forEach((s, idx) => {
            const cleanName = s.name.startsWith('Dr.') ? s.name : `Dr. ${s.name}`;
            const key = cleanName.toLowerCase().trim();
            if (!namesMap.has(key)) {
              const newEntry = {
                id: s.staff_id || (idx + 100),
                name: cleanName,
                specialty: s.role || 'Haemato-Oncology & BMT Specialist',
                department: s.department || 'Haemato-Oncology & BMT',
                hospital: 'KOSHIKA Network Partner BMT Centre',
                experience: '15+ Years Experience',
                qualification: 'Certified Bone Marrow Transplant Specialist',
                rating: 4.9,
                reviews: 50,
                availableDays: 'Mon - Fri',
                fee: '₹1,600 ($20)',
                contact: 'Registered via KOSHIKA Registry'
              };
              namesMap.set(key, newEntry);
              merged.push(newEntry);
            }
          });
          setDoctors(merged);
        }
      })
      .catch(() => {});
  }, []);

  const filteredDoctors = doctors.filter(doc => {
    const s = search.toLowerCase().trim();
    const matchesSearch = !s ||
      doc.name.toLowerCase().includes(s) ||
      (doc.specialty && doc.specialty.toLowerCase().includes(s)) ||
      (doc.department && doc.department.toLowerCase().includes(s)) ||
      (doc.hospital && doc.hospital.toLowerCase().includes(s)) ||
      (doc.qualification && doc.qualification.toLowerCase().includes(s));

    let matchesDept = true;
    if (selectedDept !== 'ALL') {
      const dept = selectedDept.toLowerCase();
      const docDept = ((doc.department || '') + ' ' + (doc.specialty || '')).toLowerCase();
      if (dept === 'paediatric') {
        matchesDept = docDept.includes('paediatric') || docDept.includes('pediatric');
      } else if (dept === 'adult') {
        matchesDept = docDept.includes('adult') || (docDept.includes('haemato') && !docDept.includes('paediatric') && !docDept.includes('pediatric'));
      } else if (dept === 'car-t') {
        matchesDept = docDept.includes('car-t') || docDept.includes('cellular');
      } else if (dept === 'haploidentical') {
        matchesDept = docDept.includes('haploidentical');
      } else {
        matchesDept = docDept.includes(dept);
      }
    }
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
                {doctors.length} Verified Stem Cell Specialists
              </span>
            </div>
            <h2 className="fw-bold text-dark mb-1">
              Find Doctors &amp; Specialists
            </h2>
            <p className="text-secondary mb-0 small">
              Connect with leading haemato-oncologists, bone marrow transplant surgeons, and cellular therapy consultants across India
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
          <div className="col-12 col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search by doctor name, specialty, city, hospital..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="btn btn-light border-start-0 text-muted"
                  onClick={() => setSearch('')}
                >
                  <i className="bi bi-x-circle-fill"></i>
                </button>
              )}
            </div>
          </div>
          <div className="col-12 col-md-7 d-flex flex-wrap gap-1 justify-content-md-end">
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 ${selectedDept === 'ALL' ? 'btn-primary' : 'btn-light border'}`}
              onClick={() => setSelectedDept('ALL')}
            >
              All Specialists ({doctors.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 ${selectedDept === 'Adult' ? 'btn-primary' : 'btn-light border'}`}
              onClick={() => setSelectedDept('Adult')}
            >
              Adult BMT
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 ${selectedDept === 'Paediatric' ? 'btn-primary' : 'btn-light border'}`}
              onClick={() => setSelectedDept('Paediatric')}
            >
              Paediatric BMT
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 ${selectedDept === 'CAR-T' ? 'btn-primary' : 'btn-light border'}`}
              onClick={() => setSelectedDept('CAR-T')}
            >
              CAR-T &amp; Cellular
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 ${selectedDept === 'Haploidentical' ? 'btn-primary' : 'btn-light border'}`}
              onClick={() => setSelectedDept('Haploidentical')}
            >
              Haploidentical BMT
            </button>
          </div>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="row g-4">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doc) => (
            <div key={doc.id} className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-xs flex-shrink-0"
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
                    <span className="badge bg-success-subtle text-success rounded-pill px-2 py-1 small flex-shrink-0">
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
          ))
        ) : (
          <div className="col-12 text-center py-5">
            <i className="bi bi-person-x text-muted fs-1 d-block mb-2"></i>
            <h5 className="text-secondary">No specialists matching your criteria</h5>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm rounded-pill mt-2 px-3"
              onClick={() => { setSearch(''); setSelectedDept('ALL'); }}
            >
              Reset Filters
            </button>
          </div>
        )}
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
