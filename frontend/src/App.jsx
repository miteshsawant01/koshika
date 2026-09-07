import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import FloatingAIAssistant from './components/FloatingAIAssistant';
import Dashboard from './pages/Dashboard';
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
import Footer from './components/Footer';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="app-container">
        <div className="main-content d-flex flex-column min-vh-100">
          <Navbar />
          <main className="content-body flex-grow-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/donors" element={<Donors />} />
              <Route path="/storage" element={<Storage />} />
              <Route path="/ml-match" element={<MLCompatibility />} />
              <Route path="/ocr-reports" element={<MedicalReportOCR />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/research" element={<Research />} />
              <Route path="/staff" element={<Staff />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/bank" element={<BankHub />} />
              <Route path="/awareness" element={<Awareness />} />
              <Route path="/ai-assistant" element={<AIChatbot />} />
            </Routes>
          </main>

          {/* Clean Institutional Footer */}
          <Footer />

          {/* Floating AI Assistant (Bottom-Right Button + Sliding Drawer) */}
          <FloatingAIAssistant />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
