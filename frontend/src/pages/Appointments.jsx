import React, { useState } from 'react';
import { useRole } from '../context/RoleContext';

const Appointments = () => {
  const { appointments, addAppointment } = useRole();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    doctorName: 'Dr. Sharat Damodar, MD',
    specialty: 'Adult Haemato-Oncology & BMT; Cellular Therapy; CAR-T',
    hospital: 'Narayana Health & Mazumdar Shaw Cancer Centre, Bengaluru',
    date: 'Upcoming Friday, 11:00 AM',
    mode: 'In-Person Consultation',
    notes: 'Follow-up discussion on donor HLA compatibility report and conditioning protocol.'
  });


  const handleSubmit = (e) => {
    e.preventDefault();
    addAppointment({
      ...formData,
      room: formData.mode.includes('Virtual') ? 'Virtual Meeting Link will be sent' : 'Hospital OPD Room 3'
    });
    setShowModal(false);
  };

  return (
    <div className="koshika-animate-fadein pb-5">
      {/* Header */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-purple-subtle text-purple fw-bold px-3 py-1 rounded-pill small" style={{ color: '#7c3aed', backgroundColor: '#ede9fe' }}>
                <i className="bi bi-calendar2-check-fill me-1"></i> CARE SCHEDULE
              </span>
              <span className="badge bg-light text-secondary border px-2 py-1 rounded-pill small">
                {appointments.length} Consultations Booked
              </span>
            </div>
            <h2 className="fw-bold text-dark mb-1">
              Appointments &amp; Clinical Consultations
            </h2>
            <p className="text-secondary mb-0 small">
              Manage your upcoming hospital appointments, video tele-consultations, and specialist follow-up reviews
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-xs"
            onClick={() => setShowModal(true)}
          >
            <i className="bi bi-calendar-plus-fill"></i>
            <span>Request New Consultation</span>
          </button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="d-flex flex-column gap-3">
        {appointments.map((appt) => (
          <div key={appt.id} className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
              <div className="d-flex align-items-start gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-xs flex-shrink-0"
                  style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}
                >
                  <i className="bi bi-person-badge fs-4"></i>
                </div>
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                    <h5 className="fw-bold text-dark mb-0">{appt.doctorName}</h5>
                    <span className="badge bg-success-subtle text-success rounded-pill px-2 py-1 small">
                      {appt.status}
                    </span>
                    <span className="badge bg-purple-subtle text-purple rounded-pill px-2 py-1 small" style={{ color: '#7c3aed', backgroundColor: '#ede9fe' }}>
                      {appt.mode}
                    </span>
                  </div>
                  <div className="text-secondary small fw-medium">{appt.specialty}</div>
                  <div className="text-muted small">{appt.hospital} • {appt.room}</div>
                  {appt.notes && (
                    <div className="p-2 rounded bg-light border mt-2 small text-dark">
                      <i className="bi bi-chat-left-text me-1 text-primary"></i>
                      <span>{appt.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="d-flex flex-column align-items-start align-items-lg-end gap-2 flex-shrink-0">
                <div className="badge bg-light text-dark border px-3 py-2 fs-6 fw-semibold">
                  <i className="bi bi-clock me-1 text-primary"></i>
                  {appt.date}
                </div>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                    onClick={() => alert(`Reschedule request sent for appointment with ${appt.doctorName}.`)}
                  >
                    Reschedule
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm rounded-pill px-3"
                    onClick={() => alert(`Opening consultation session details for ${appt.doctorName}...`)}
                  >
                    Join / Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {showModal && (
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
                <h5 className="modal-title fw-bold text-dark">Request New Consultation</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body px-4 py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Select Specialist</label>
                    <select
                      className="form-select"
                      value={formData.doctorName}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.includes('Sharat')) {
                          setFormData({ ...formData, doctorName: val, specialty: 'Adult Haemato-Oncology & BMT; Cellular Therapy; CAR-T', hospital: 'Narayana Health & Mazumdar Shaw Cancer Centre, Bengaluru' });
                        } else if (val.includes('Sunil')) {
                          setFormData({ ...formData, doctorName: val, specialty: 'Paediatric Haemato-Oncology & BMT; Stem-Cell Transplantation', hospital: 'Narayana Health & Mazumdar Shaw Cancer Centre, Bengaluru' });
                        } else if (val.includes('Suparno')) {
                          setFormData({ ...formData, doctorName: val, specialty: 'Senior Consultant & HOD, Haemato-Oncology & BMT', hospital: 'Dharamshila Narayana Super Speciality Hospital, New Delhi' });
                        } else if (val.includes('Ashish')) {
                          setFormData({ ...formData, doctorName: val, specialty: 'Clinical Haematology; Blood & Marrow Transplant', hospital: 'Manipal Hospital Old Airport Road, Bengaluru' });
                        } else {
                          setFormData({ ...formData, doctorName: val, specialty: 'Haematology and Bone Marrow Transplant', hospital: 'Sanar International Hospital, Delhi NCR' });
                        }
                      }}
                    >
                      <option value="Dr. Sharat Damodar, MD">Dr. Sharat Damodar, MD (Adult Haemato-Oncology &amp; BMT)</option>
                      <option value="Dr. Sunil Bhat, MD">Dr. Sunil Bhat, MD (Paediatric Haemato-Oncology &amp; BMT)</option>
                      <option value="Dr. Suparno Chakrabarti, MD">Dr. Suparno Chakrabarti, MD (Senior Consultant &amp; HOD, BMT)</option>
                      <option value="Dr. Ashish Dixit, MD">Dr. Ashish Dixit, MD (Clinical Haematology &amp; BMT)</option>
                      <option value="Dr. Dharma Choudhary, MD">Dr. Dharma Choudhary, MD (Haematology &amp; BMT)</option>
                    </select>
                  </div>


                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Consultation Mode</label>
                    <select
                      className="form-select"
                      value={formData.mode}
                      onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                    >
                      <option value="In-Person Consultation">In-Person Consultation (Hospital OPD)</option>
                      <option value="Tele-Consultation (Video)">Tele-Consultation (Online Video Call)</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Preferred Date &amp; Time</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      placeholder="e.g. Next Monday, 11:30 AM"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Reason / Clinical Notes</label>
                    <textarea
                      rows="3"
                      className="form-control"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Brief description of symptoms or test reports to discuss..."
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-top px-4 py-3 d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-3"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4"
                  >
                    Confirm Consultation
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

export default Appointments;
