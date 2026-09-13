import React, { useState } from 'react';
import { useRole } from '../context/RoleContext';

const Appointments = () => {
  const { appointments, addAppointment, rescheduleAppointment, cancelAppointment, deleteAppointment } = useRole();
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modals & Active Selections
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const [detailsTarget, setDetailsTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [inVideoSession, setInVideoSession] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);

  // In-app Toast System
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

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
      room: formData.mode.includes('Virtual') || formData.mode.includes('Tele')
        ? 'Virtual Room #82 (Encrypted WebRTC)'
        : 'Hospital OPD Room Suite 4B'
    });
    setShowModal(false);
    showToast(`Consultation successfully booked with ${formData.doctorName}!`, 'success');
  };

  const handleOpenReschedule = (appt) => {
    setRescheduleTarget(appt);
    setNewDate(appt.date);
    setNewNotes(appt.notes || '');
  };

  const handleConfirmReschedule = (e) => {
    e.preventDefault();
    if (!rescheduleTarget) return;
    rescheduleAppointment(rescheduleTarget.id, newDate, newNotes);
    showToast(`Appointment rescheduled to "${newDate}"`, 'info');
    setRescheduleTarget(null);
  };

  const handleConfirmCancel = () => {
    if (!cancelTarget) return;
    cancelAppointment(cancelTarget.id);
    showToast(`Consultation with ${cancelTarget.doctorName} marked as cancelled.`, 'warning');
    setCancelTarget(null);
  };

  const handleDelete = (id) => {
    deleteAppointment(id);
    showToast(`Consultation record removed.`, 'info');
  };

  const filteredAppointments = appointments.filter(a => {
    if (filterStatus === 'ALL') return true;
    return a.status?.toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <div className="koshika-animate-fadein pb-5">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`position-fixed bottom-0 end-0 m-4 p-3 rounded-4 shadow-lg text-white d-flex align-items-center gap-3 animate__animated animate__fadeInUp ${
            toast.type === 'danger'
              ? 'bg-danger'
              : toast.type === 'warning'
              ? 'bg-warning text-dark'
              : toast.type === 'info'
              ? 'bg-info text-dark'
              : 'bg-success'
          }`}
          style={{ maxWidth: '420px', zIndex: 9999 }}
        >
          <i
            className={`bi fs-4 ${
              toast.type === 'danger'
                ? 'bi-exclamation-octagon-fill'
                : toast.type === 'warning'
                ? 'bi-exclamation-triangle-fill'
                : toast.type === 'info'
                ? 'bi-info-circle-fill'
                : 'bi-check-circle-fill'
            }`}
          ></i>
          <div className="small flex-grow-1">{toast.message}</div>
          <button
            type="button"
            className="btn-close btn-close-white ms-auto"
            onClick={() => setToast(null)}
          ></button>
        </div>
      )}

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

      {/* Filter Tabs */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="d-flex flex-wrap gap-2">
          {['ALL', 'Confirmed', 'Rescheduled', 'Cancelled'].map(st => (
            <button
              key={st}
              type="button"
              className={`btn btn-sm rounded-pill px-3 ${filterStatus === st ? 'btn-primary' : 'btn-light border text-secondary'}`}
              onClick={() => setFilterStatus(st)}
            >
              {st === 'ALL' ? `All Consultations (${appointments.length})` : `${st} (${appointments.filter(a => a.status?.toLowerCase() === st.toLowerCase()).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      <div className="d-flex flex-column gap-3">
        {filteredAppointments.map((appt) => {
          const isCancelled = appt.status?.toLowerCase() === 'cancelled';
          const isRescheduled = appt.status?.toLowerCase() === 'rescheduled';

          return (
            <div
              key={appt.id}
              className={`card border-0 shadow-sm rounded-4 p-4 bg-white transition-all ${
                isCancelled ? 'opacity-75 bg-light' : ''
              }`}
            >
              <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
                <div className="d-flex align-items-start gap-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-xs flex-shrink-0"
                    style={{
                      width: '52px',
                      height: '52px',
                      background: isCancelled
                        ? '#94a3b8'
                        : isRescheduled
                        ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                        : 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'
                    }}
                  >
                    <i className={`bi ${isCancelled ? 'bi-calendar-x' : 'bi-person-badge'} fs-4`}></i>
                  </div>
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                      <h5 className={`fw-bold mb-0 ${isCancelled ? 'text-muted text-decoration-line-through' : 'text-dark'}`}>
                        {appt.doctorName}
                      </h5>
                      <span
                        className={`badge rounded-pill px-2 py-1 small ${
                          isCancelled
                            ? 'bg-danger-subtle text-danger'
                            : isRescheduled
                            ? 'bg-info-subtle text-info'
                            : 'bg-success-subtle text-success'
                        }`}
                      >
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
                  <div className="d-flex gap-2 flex-wrap">
                    {!isCancelled && (
                      <>
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                          onClick={() => handleOpenReschedule(appt)}
                        >
                          <i className="bi bi-calendar2-range me-1"></i>
                          Reschedule
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm rounded-pill px-3 shadow-xs"
                          onClick={() => {
                            setDetailsTarget(appt);
                            setInVideoSession(false);
                          }}
                        >
                          <i className="bi bi-camera-video me-1"></i>
                          Join / Details
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm rounded-pill px-2"
                          onClick={() => setCancelTarget(appt)}
                          title="Cancel appointment"
                        >
                          <i className="bi bi-x-circle"></i>
                        </button>
                      </>
                    )}
                    {isCancelled && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                        onClick={() => handleDelete(appt.id)}
                      >
                        <i className="bi bi-trash me-1"></i>
                        Delete Record
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredAppointments.length === 0 && (
          <div className="card border-0 shadow-sm rounded-4 p-5 text-center text-muted bg-white">
            <i className="bi bi-calendar-x fs-1 text-secondary mb-2 d-block"></i>
            <h5 className="fw-bold text-dark mb-1">No Consultations Found</h5>
            <p className="small text-secondary mb-3">
              {filterStatus === 'ALL'
                ? 'You have not scheduled any clinical consultations yet.'
                : `No appointments with status "${filterStatus}".`}
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm rounded-pill px-4 mx-auto"
              onClick={() => setShowModal(true)}
            >
              Book First Consultation
            </button>
          </div>
        )}
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

      {/* 2. RESCHEDULE MODAL */}
      {rescheduleTarget && (
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
                <h5 className="modal-title fw-bold text-dark">
                  Reschedule Consultation
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setRescheduleTarget(null)}
                ></button>
              </div>
              <form onSubmit={handleConfirmReschedule}>
                <div className="modal-body px-4 py-3">
                  <div className="p-3 bg-light rounded-3 mb-3 border">
                    <div className="fw-bold text-dark">{rescheduleTarget.doctorName}</div>
                    <div className="small text-secondary">{rescheduleTarget.specialty}</div>
                    <div className="small text-muted">{rescheduleTarget.hospital}</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">New Date &amp; Time</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      placeholder="e.g. Wednesday, Oct 14, 03:00 PM"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Updated Clinical Notes</label>
                    <textarea
                      rows="3"
                      className="form-control"
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      placeholder="Notes for the specialist..."
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-top px-4 py-3 d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-3"
                    onClick={() => setRescheduleTarget(null)}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4"
                  >
                    Save Rescheduled Time
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 3. CONSULTATION DETAILS & VIDEO TELE-CONSULTATION MODAL */}
      {detailsTarget && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(5px)', zIndex: 1060 }}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header border-bottom px-4 py-3 bg-light">
                <div>
                  <h5 className="modal-title fw-bold text-dark mb-0">
                    Clinical Consultation Session
                  </h5>
                  <small className="text-muted">
                    Session ID: KSH-CONF-{detailsTarget.id} &bull; {detailsTarget.mode}
                  </small>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setDetailsTarget(null);
                    setInVideoSession(false);
                  }}
                ></button>
              </div>

              <div className="modal-body p-4">
                {/* If Tele-consultation and In-Video Session */}
                {inVideoSession ? (
                  <div className="rounded-4 bg-dark text-white p-4 text-center mb-4 position-relative">
                    <div className="position-absolute top-0 start-0 m-3 badge bg-danger d-flex align-items-center gap-1">
                      <span className="spinner-grow spinner-grow-sm" role="status"></span>
                      <span>LIVE ENCRYPTED WebRTC</span>
                    </div>

                    <div className="py-5">
                      <div
                        className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center text-white fw-bold shadow-lg"
                        style={{ width: '96px', height: '96px', background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)', fontSize: '2.5rem' }}
                      >
                        {detailsTarget.doctorName.replace('Dr. ', '').slice(0, 2).toUpperCase()}
                      </div>
                      <h4 className="fw-bold mb-1">{detailsTarget.doctorName}</h4>
                      <p className="text-secondary small mb-3">Connecting encrypted media stream with attending specialist...</p>

                      <div className="d-flex justify-content-center gap-2">
                        <button
                          type="button"
                          className={`btn rounded-circle p-3 ${micMuted ? 'btn-danger' : 'btn-secondary'}`}
                          style={{ width: '48px', height: '48px' }}
                          onClick={() => setMicMuted(!micMuted)}
                          title={micMuted ? 'Unmute microphone' : 'Mute microphone'}
                        >
                          <i className={`bi ${micMuted ? 'bi-mic-mute-fill' : 'bi-mic-fill'}`}></i>
                        </button>
                        <button
                          type="button"
                          className={`btn rounded-circle p-3 ${camOff ? 'btn-danger' : 'btn-secondary'}`}
                          style={{ width: '48px', height: '48px' }}
                          onClick={() => setCamOff(!camOff)}
                          title={camOff ? 'Turn camera on' : 'Turn camera off'}
                        >
                          <i className={`bi ${camOff ? 'bi-camera-video-off-fill' : 'bi-camera-video-fill'}`}></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger rounded-pill px-4"
                          onClick={() => {
                            setInVideoSession(false);
                            showToast('Disconnected from video consultation.', 'info');
                          }}
                        >
                          <i className="bi bi-telephone-x-fill me-2"></i>
                          End Call
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="row g-3 mb-4">
                      <div className="col-12 col-md-7">
                        <div className="p-3 border rounded-4 bg-light h-100">
                          <h6 className="fw-bold text-dark mb-2">Specialist &amp; Facility Details</h6>
                          <div className="fs-5 fw-bold text-primary mb-1">{detailsTarget.doctorName}</div>
                          <div className="small text-secondary mb-2">{detailsTarget.specialty}</div>
                          <div className="small text-muted mb-2">
                            <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                            {detailsTarget.hospital}
                          </div>
                          <div className="small text-muted">
                            <i className="bi bi-door-open-fill text-info me-1"></i>
                            Location: <strong>{detailsTarget.room || 'Main OPD Suite'}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="col-12 col-md-5">
                        <div className="p-3 border rounded-4 bg-light h-100">
                          <h6 className="fw-bold text-dark mb-2">Schedule Time &amp; Status</h6>
                          <div className="badge bg-white border text-dark fs-6 px-3 py-2 fw-semibold mb-2">
                            <i className="bi bi-clock-fill text-primary me-1"></i>
                            {detailsTarget.date}
                          </div>
                          <div className="small text-secondary mb-1">
                            Status: <span className="badge bg-success-subtle text-success">{detailsTarget.status}</span>
                          </div>
                          <div className="small text-secondary">
                            Mode: <span className="badge bg-purple-subtle text-purple" style={{ color: '#7c3aed', backgroundColor: '#ede9fe' }}>{detailsTarget.mode}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pre-Consultation Checklist */}
                    <div className="card border p-3 rounded-4 mb-3 bg-white">
                      <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
                        <i className="bi bi-card-checklist text-success"></i>
                        Pre-Consultation Clinical Checklist
                      </h6>
                      <ul className="small text-secondary mb-0 ps-3">
                        <li className="mb-1">Bring latest Complete Blood Count (CBC) and recent high-resolution HLA typing reports.</li>
                        <li className="mb-1">Keep current medication dosages (immunosuppressants, antivirals, antibiotics) handy.</li>
                        <li className="mb-1">Prepare any questions regarding donor matching, graft conditioning, or CD34+ cell harvest.</li>
                        <li>Arrive 15 minutes prior to appointment time or ensure high-speed internet connection for tele-consultation.</li>
                      </ul>
                    </div>

                    {/* Action trigger button */}
                    <div className="d-flex gap-2 justify-content-end">
                      {detailsTarget.mode.toLowerCase().includes('tele') || detailsTarget.mode.toLowerCase().includes('video') ? (
                        <button
                          type="button"
                          className="btn btn-primary rounded-pill px-4 shadow-xs"
                          onClick={() => setInVideoSession(true)}
                        >
                          <i className="bi bi-camera-video-fill me-2"></i>
                          Launch Encrypted Video Room
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-primary rounded-pill px-4 shadow-xs"
                          onClick={() => {
                            showToast(`Directions to ${detailsTarget.hospital} sent to your profile SMS!`, 'info');
                          }}
                        >
                          <i className="bi bi-geo-alt-fill me-2"></i>
                          Get Hospital Directions
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="modal-footer border-top px-4 py-3 bg-light">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-4"
                  onClick={() => {
                    setDetailsTarget(null);
                    setInVideoSession(false);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. CANCEL CONFIRMATION MODAL */}
      {cancelTarget && (
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
                <h5 className="modal-title fw-bold text-dark">Cancel Consultation</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setCancelTarget(null)}
                ></button>
              </div>
              <div className="modal-body px-4 py-3">
                <p className="text-secondary small mb-2">
                  Are you sure you want to cancel your consultation with <strong>{cancelTarget.doctorName}</strong> scheduled for <strong>{cancelTarget.date}</strong>?
                </p>
                <div className="p-3 bg-light rounded-3 border small text-muted">
                  The appointment slot will be released back to the clinic registry. You may rebook at any time.
                </div>
              </div>
              <div className="modal-footer border-top px-4 py-3 d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-light rounded-pill px-3"
                  onClick={() => setCancelTarget(null)}
                >
                  Keep Appointment
                </button>
                <button
                  type="button"
                  className="btn btn-danger rounded-pill px-4"
                  onClick={handleConfirmCancel}
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
