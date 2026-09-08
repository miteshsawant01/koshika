import React, { createContext, useContext, useState, useEffect } from 'react';

const RoleContext = createContext();

export const ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  ADMIN: 'admin',
};

export const RoleProvider = ({ children }) => {
  const [role, setRole] = useState(() => {
    return localStorage.getItem('koshika_user_role') || ROLES.PATIENT;
  });

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Medical Report Analyzed',
      message: 'Your recent CBC & CD34+ flow cytometry report has been processed by AI.',
      time: '15 mins ago',
      type: 'report',
      read: false,
      link: '/ocr-reports'
    },
    {
      id: 2,
      title: 'Preliminary Assessment Updated',
      message: 'ML-Assisted Preliminary Assessment is ready for clinical review.',
      time: '1 hour ago',
      type: 'assessment',
      read: false,
      link: '/preliminary-assessment'
    },
    {
      id: 3,
      title: 'Upcoming Consultation',
      message: 'Consultation with Dr. Aris Thorne (Hematology) scheduled for tomorrow at 10:30 AM.',
      time: '3 hours ago',
      type: 'appointment',
      read: true,
      link: '/appointments'
    },
    {
      id: 4,
      title: 'Potential Donor Match Found',
      message: 'A 9/10 HLA-compatible volunteer donor has been identified in the registry.',
      time: '1 day ago',
      type: 'match',
      read: true,
      link: '/ml-match'
    }
  ]);

  const [appointments, setAppointments] = useState([
    {
      id: 101,
      doctorName: 'Dr. Aris Thorne, MD',
      specialty: 'Clinical Hematology & Bone Marrow Transplant',
      hospital: 'National Stem Cell Institute & Research Centre',
      date: 'Tomorrow, 10:30 AM',
      mode: 'In-Person Consultation',
      status: 'Confirmed',
      room: 'OPD Suite 4B',
      notes: 'Initial evaluation for allogeneic stem cell compatibility and conditioning regimen.'
    },
    {
      id: 102,
      doctorName: 'Dr. Evelyn Vance, PhD',
      specialty: 'Immunogenomics & HLA Matching',
      hospital: 'Metro Biobank & Regenerative Health',
      date: 'Next Tuesday, 2:00 PM',
      mode: 'Tele-Consultation (Video)',
      status: 'Confirmed',
      room: 'Virtual Room #82',
      notes: 'Review of secondary HLA alleles and preliminary donor panel.'
    }
  ]);

  const [patientProfile, setPatientProfile] = useState({
    name: 'Mitesh Sawant',
    patientId: 'PT-9042',
    age: 32,
    bloodGroup: 'B+',
    condition: 'Acute Myeloid Leukemia (AML)',
    remissionStatus: 'First Complete Remission (CR1)',
    hlaStatus: 'HLA-A, B, C, DRB1 Typed',
    primaryDoctor: 'Dr. Aris Thorne, MD',
    hospital: 'National Stem Cell Institute',
    emergencyContact: '+91 98200 12345',
    reportsCount: 3,
    assessmentStatus: 'ML Assessment Completed'
  });

  useEffect(() => {
    localStorage.setItem('koshika_user_role', role);
  }, [role]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markNotificationAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addAppointment = (newAppt) => {
    setAppointments(prev => [
      { id: Date.now(), status: 'Confirmed', ...newAppt },
      ...prev
    ]);
  };

  const openChatWithQuery = (query = '') => {
    window.dispatchEvent(new CustomEvent('open-koshika-ai', { detail: { query } }));
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        notifications,
        unreadCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        appointments,
        addAppointment,
        patientProfile,
        setPatientProfile,
        openChatWithQuery
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
export default RoleContext;
