import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { RoleProvider } from './context/RoleContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import FloatingAIAssistant from './components/FloatingAIAssistant';
import Footer from './components/Footer';

// Pages
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PreliminaryAssessment from './pages/PreliminaryAssessment';
import PatientProfile from './pages/PatientProfile';
import MedicalHistory from './pages/MedicalHistory';
import FindDoctors from './pages/FindDoctors';
import HospitalsCentres from './pages/HospitalsCentres';
import Appointments from './pages/Appointments';
import Notifications from './pages/Notifications';
import Patients from './pages/Patients';
import Donors from './pages/Donors';
import Storage from './pages/Storage';
import Staff from './pages/Staff';
import Research from './pages/Research';
import Inventory from './pages/Inventory';
import MLCompatibility from './pages/MLCompatibility';
import MedicalReportOCR from './pages/MedicalReportOCR';
import AIChatbot from './pages/AIChatbot';
import Reports from './pages/Reports';
import Awareness from './pages/Awareness';
import BankHub from './pages/BankHub';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function MainLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)} />

      {/* Main Layout Body: Left Sidebar + Content Body */}
      <div className="app-layout-body d-flex flex-grow-1">
        {/* Left Sidebar */}
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Content Body Area */}
        <div className="main-content-wrapper d-flex flex-column flex-grow-1 min-vh-100">
          <main className="content-body flex-grow-1">
            <Routes>
              {/* Patient Core Routes */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/my-health/profile" element={<PatientProfile />} />
              <Route path="/my-health/history" element={<MedicalHistory />} />
              <Route path="/ocr-reports" element={<MedicalReportOCR />} />
              <Route path="/preliminary-assessment" element={<PreliminaryAssessment />} />
              <Route path="/ml-match" element={<MLCompatibility />} />
              <Route path="/awareness" element={<Awareness />} />
              <Route path="/find-care/doctors" element={<FindDoctors />} />
              <Route path="/find-care/centres" element={<HospitalsCentres />} />
              <Route path="/bank" element={<BankHub />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/notifications" element={<Notifications />} />

              {/* Role Dashboards */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/doctor" element={<DoctorDashboard />} />

              {/* Admin & Operations Routes */}
              <Route path="/patients" element={<Patients />} />
              <Route path="/donors" element={<Donors />} />
              <Route path="/storage" element={<Storage />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/research" element={<Research />} />
              <Route path="/staff" element={<Staff />} />
              <Route path="/reports" element={<Reports />} />

              {/* Full Chatbot Page */}
              <Route path="/ai-assistant" element={<AIChatbot />} />
            </Routes>
          </main>

          {/* Institutional Footer */}
          <Footer />
        </div>
      </div>

      {/* Single Floating AI Assistant Button (Bottom-Right) */}
      <FloatingAIAssistant />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <RoleProvider>
        <ScrollToTop />
        <MainLayout />
      </RoleProvider>
    </BrowserRouter>
  );
}

export default App;
