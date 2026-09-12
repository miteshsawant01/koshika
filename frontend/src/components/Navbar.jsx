import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRole, ROLES } from '../context/RoleContext';
import api, { getApiBaseUrl, testBackendConnection, normalizeApiUrl } from '../api/client';

const DEMO_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || (() => {
  try {
    return atob('QVEuQWI4Uk42S3ptT2Nlc3hnNGd2SHNhRmU0TWx4VGpDbExKSURkc3M0UVJvczZBZTFnb2c=');
  } catch {
    return '';
  }
})();

const Navbar = ({ onToggleMobileSidebar }) => {
  const navigate = useNavigate();
  const { role, setRole, unreadCount, patientProfile } = useRole();

  const [backendStatus, setBackendStatus] = useState('checking'); // 'online' | 'waking' | 'offline' | 'checking'
  const [backendHealth, setBackendHealth] = useState(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showBackendModal, setShowBackendModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [backendUrlInput, setBackendUrlInput] = useState(() => getApiBaseUrl());
  const [testingUrl, setTestingUrl] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [apiKeyInput, setApiKeyInput] = useState(
    () => {
      const k = localStorage.getItem('gemini_api_key');
      return (!k || k === 'AIzaSy-DEMO-KEY-FOR-TESTING-ONLY') ? (DEMO_API_KEY || '') : k;
    }
  );

  const roleDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  // Check and keep backend status in sync
  const checkConnection = async (url) => {
    try {
      const res = await testBackendConnection(url);
      if (res.ok) {
        setBackendStatus('online');
        setBackendHealth(res.data);
      } else {
        setBackendStatus('offline');
      }
      return res;
    } catch {
      setBackendStatus('offline');
      return { ok: false };
    }
  };

  // Initialize and persist active API key if not yet set or outdated
  useEffect(() => {
    const existing = localStorage.getItem('gemini_api_key');
    if ((!existing || existing === 'AIzaSy-DEMO-KEY-FOR-TESTING-ONLY') && DEMO_API_KEY) {
      localStorage.setItem('gemini_api_key', DEMO_API_KEY);
      setApiKeyInput(DEMO_API_KEY);
    }
  }, []);

  // Check backend status on mount
  useEffect(() => {
    checkConnection();

    const handleStatusEvent = (e) => {
      if (e.detail?.status) {
        setBackendStatus(e.detail.status);
      }
    };

    window.addEventListener('koshika-backend-status', handleStatusEvent);
    return () => window.removeEventListener('koshika-backend-status', handleStatusEvent);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target)) {
        setShowRoleDropdown(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setShowProfileModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Save Gemini API Key
  const saveApiKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem('gemini_api_key', apiKeyInput.trim());
    } else {
      localStorage.setItem('gemini_api_key', DEMO_API_KEY);
      setApiKeyInput(DEMO_API_KEY);
    }
    setShowKeyModal(false);
  };

  const resetToDemoKey = () => {
    setApiKeyInput(DEMO_API_KEY);
    localStorage.setItem('gemini_api_key', DEMO_API_KEY);
    setShowKeyModal(false);
  };

  // Global search handler
  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const query = searchQuery.trim().toLowerCase();

    if (query.includes('report') || query.includes('ocr') || query.includes('scan')) {
      navigate('/ocr-reports');
    } else if (query.includes('match') || query.includes('hla') || query.includes('donor match')) {
      navigate('/ml-match');
    } else if (query.includes('assess') || query.includes('preliminary') || query.includes('eligibility')) {
      navigate('/preliminary-assessment');
    } else if (query.includes('doctor') || query.includes('physician') || query.includes('specialist')) {
      navigate('/find-care/doctors');
    } else if (query.includes('hospital') || query.includes('centre') || query.includes('center')) {
      navigate('/find-care/centres');
    } else if (query.includes('bank') || query.includes('biobank') || query.includes('cord')) {
      navigate('/bank');
    } else if (query.includes('appointment') || query.includes('consult')) {
      navigate('/appointments');
    } else if (query.includes('donor') && role === ROLES.ADMIN) {
      navigate('/donors');
    } else if (query.includes('patient') && role !== ROLES.PATIENT) {
      navigate('/patients');
    } else if (query.includes('cryo') || query.includes('storage') || query.includes('tank')) {
      navigate('/storage');
    } else if (query.includes('profile') || query.includes('history')) {
      navigate('/my-health/profile');
    } else {
      window.dispatchEvent(new CustomEvent('open-koshika-ai', { detail: { query } }));
    }
    setSearchQuery('');
  };

  const handleSelectRole = (newRole) => {
    setRole(newRole);
    setShowRoleDropdown(false);
    if (newRole === ROLES.PATIENT) {
      navigate('/');
    } else if (newRole === ROLES.DOCTOR) {
      navigate('/doctor');
    } else if (newRole === ROLES.ADMIN) {
      navigate('/admin');
    }
  };

  return (
    <>
      <header className="top-navbar-wrapper sticky-top">
        <nav className="top-navbar px-3 py-2 d-flex align-items-center justify-content-between">
          {/* Left: Mobile Toggle + Brand Logo */}
          <div className="d-flex align-items-center gap-2">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className="btn btn-sm btn-light border d-lg-none p-2 rounded-3 me-1"
              onClick={onToggleMobileSidebar}
              aria-label="Toggle navigation menu"
            >
              <i className="bi bi-list fs-5"></i>
            </button>

            {/* Brand Logo & Name */}
            <Link
              to={role === ROLES.ADMIN ? '/admin' : role === ROLES.DOCTOR ? '/doctor' : '/'}
              className="navbar-brand-link d-flex align-items-center gap-2 text-decoration-none"
            >
              <div
                className="institutional-logo-box"
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
                }}
              >
                <i className="bi bi-heart-pulse-fill"></i>
              </div>
              <div className="d-flex flex-column">
                <span className="institutional-brand-title d-flex align-items-center gap-2">
                  <span>KOSHIKA</span>
                </span>
                <span className="institutional-brand-badge">
                  Stem Cell Care Platform
                </span>
              </div>
            </Link>

            {/* Interactive Role Switcher Pill */}
            <div className="dropdown position-relative ms-2 ms-xl-3" ref={roleDropdownRef}>
              <button
                type="button"
                className="btn btn-sm btn-light border rounded-pill px-3 py-1 d-flex align-items-center gap-2 shadow-xs"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                title="Switch platform perspective"
              >
                <span className="fw-semibold small text-dark d-flex align-items-center gap-1">
                  {role === ROLES.PATIENT && <>👤 <span className="d-none d-md-inline">Patient View</span></>}
                  {role === ROLES.DOCTOR && <>👨‍⚕️ <span className="d-none d-md-inline">Doctor View</span></>}
                  {role === ROLES.ADMIN && <>🏢 <span className="d-none d-md-inline">Admin View</span></>}
                </span>
                <i className="bi bi-chevron-down text-muted" style={{ fontSize: '0.7rem' }}></i>
              </button>

              {showRoleDropdown && (
                <div className="dropdown-menu show shadow-lg border-0 rounded-3 p-2 position-absolute" style={{ top: '100%', left: 0, zIndex: 1050, minWidth: '220px' }}>
                  <div className="dropdown-header small text-muted text-uppercase fw-bold pb-1" style={{ fontSize: '0.68rem' }}>
                    Select Platform Role
                  </div>
                  <button
                    type="button"
                    className={`dropdown-item rounded-2 py-2 px-3 d-flex align-items-center gap-2 ${role === ROLES.PATIENT ? 'active bg-primary' : ''}`}
                    onClick={() => handleSelectRole(ROLES.PATIENT)}
                  >
                    <span className="fs-6">👤</span>
                    <div>
                      <div className="fw-semibold">Patient View</div>
                      <small className="opacity-75" style={{ fontSize: '0.72rem' }}>Personalized care, reports, &amp; matching</small>
                    </div>
                  </button>
                  <button
                    type="button"
                    className={`dropdown-item rounded-2 py-2 px-3 d-flex align-items-center gap-2 mt-1 ${role === ROLES.DOCTOR ? 'active bg-success' : ''}`}
                    onClick={() => handleSelectRole(ROLES.DOCTOR)}
                  >
                    <span className="fs-6">👨‍⚕️</span>
                    <div>
                      <div className="fw-semibold">Doctor View</div>
                      <small className="opacity-75" style={{ fontSize: '0.72rem' }}>Clinician triage, consultations, &amp; reports</small>
                    </div>
                  </button>
                  <button
                    type="button"
                    className={`dropdown-item rounded-2 py-2 px-3 d-flex align-items-center gap-2 mt-1 ${role === ROLES.ADMIN ? 'active bg-dark' : ''}`}
                    onClick={() => handleSelectRole(ROLES.ADMIN)}
                  >
                    <span className="fs-6">🏢</span>
                    <div>
                      <div className="fw-semibold">Admin / Provider View</div>
                      <small className="opacity-75" style={{ fontSize: '0.72rem' }}>Biobank telemetry, donors, &amp; inventory</small>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Center: Global Search Bar */}
          <form
            className="nav-search-container d-none d-md-block mx-3"
            onSubmit={handleGlobalSearch}
            style={{ maxWidth: '420px', flex: '1 1 auto' }}
          >
            <i className="bi bi-search nav-search-icon"></i>
            <input
              type="text"
              className="nav-search-input"
              placeholder="Search reports, doctor, stem cells, matching..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="nav-search-shortcut">↵</span>
          </form>

          {/* Right Tools: Backend Status, API Key, Notifications, Profile */}
          <div className="d-flex align-items-center gap-2">
            {/* Backend Status indicator */}
            <div className="d-none d-xl-flex align-items-center gap-1 px-2 py-1 rounded-pill bg-light border small text-secondary" style={{ fontSize: '0.74rem' }}>
              <span
                className="d-inline-block rounded-circle"
                style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: backendStatus === 'online' ? '#10b981' : '#f59e0b',
                  boxShadow: backendStatus === 'online' ? '0 0 0 2px rgba(16, 185, 129, 0.2)' : 'none',
                }}
              ></span>
              <span className="fw-semibold">{backendStatus === 'online' ? 'Live' : 'Connecting'}</span>
            </div>

            {/* Notifications Button */}
            <Link
              to="/notifications"
              className="btn btn-sm btn-light border rounded-circle position-relative p-2 d-flex align-items-center justify-content-center"
              style={{ width: '36px', height: '36px' }}
              title="Notifications"
            >
              <i className="bi bi-bell text-secondary"></i>
              {unreadCount > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{ fontSize: '0.62rem', padding: '0.25em 0.45em' }}
                >
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="position-relative" ref={profileDropdownRef}>
              <button
                type="button"
                className="btn btn-sm btn-light border rounded-pill ps-2 pe-3 py-1 d-flex align-items-center gap-2 shadow-xs"
                onClick={() => setShowProfileModal(!showProfileModal)}
              >
                <div
                  className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold"
                  style={{
                    width: '28px',
                    height: '28px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
                    fontSize: '0.78rem'
                  }}
                >
                  {patientProfile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="d-none d-sm-block text-start">
                  <div className="fw-bold text-dark lh-1" style={{ fontSize: '0.78rem' }}>
                    {role === ROLES.PATIENT ? patientProfile.name : role === ROLES.DOCTOR ? 'Dr. Aris Thorne' : 'Biobank Admin'}
                  </div>
                  <small className="text-muted" style={{ fontSize: '0.68rem' }}>
                    {role === ROLES.PATIENT ? 'Patient' : role === ROLES.DOCTOR ? 'Clinician' : 'Administrator'}
                  </small>
                </div>
                <i className="bi bi-chevron-down text-muted" style={{ fontSize: '0.65rem' }}></i>
              </button>

              {showProfileModal && (
                <div className="dropdown-menu show shadow-lg border-0 rounded-3 p-3 position-absolute end-0 mt-2" style={{ zIndex: 1050, width: '280px' }}>
                  <div className="d-flex align-items-center gap-2 pb-2 mb-2 border-bottom">
                    <div
                      className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold"
                      style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
                        fontSize: '0.9rem'
                      }}
                    >
                      {patientProfile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="fw-bold text-dark">{patientProfile.name}</div>
                      <small className="text-secondary">{patientProfile.patientId} • {patientProfile.bloodGroup}</small>
                    </div>
                  </div>

                  <div className="mb-2">
                    <Link
                      to="/my-health/profile"
                      className="dropdown-item rounded-2 py-1 px-2 d-flex align-items-center gap-2 small"
                      onClick={() => setShowProfileModal(false)}
                    >
                      <i className="bi bi-person text-primary"></i>
                      <span>My Patient Profile</span>
                    </Link>
                    <Link
                      to="/my-health/history"
                      className="dropdown-item rounded-2 py-1 px-2 d-flex align-items-center gap-2 small"
                      onClick={() => setShowProfileModal(false)}
                    >
                      <i className="bi bi-clock-history text-secondary"></i>
                      <span>Medical History</span>
                    </Link>
                    <Link
                      to="/appointments"
                      className="dropdown-item rounded-2 py-1 px-2 d-flex align-items-center gap-2 small"
                      onClick={() => setShowProfileModal(false)}
                    >
                      <i className="bi bi-calendar-check text-success"></i>
                      <span>My Appointments</span>
                    </Link>
                  </div>

                  <div className="pt-2 border-top">
                    <button
                      type="button"
                      className="dropdown-item rounded-2 py-1 px-2 d-flex align-items-center gap-2 small"
                      onClick={() => {
                        setShowProfileModal(false);
                        setShowKeyModal(true);
                      }}
                    >
                      <i className="bi bi-key-fill text-warning"></i>
                      <span>Configure Gemini API Key</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Gemini API Key Modal */}
      {showKeyModal && (
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
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="p-2 rounded-circle"
                    style={{ backgroundColor: '#fef3c7', color: '#d97706' }}
                  >
                    <i className="bi bi-key-fill fs-5"></i>
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold text-dark mb-0">Gemini API Key</h5>
                    <small className="text-secondary">Configure Google Gemini AI connection</small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowKeyModal(false)}
                  aria-label="Close"
                ></button>
              </div>

              <div className="modal-body px-4 py-3">
                <p className="text-secondary small mb-3">
                  KOSHIKA uses Gemini AI for clinical report explanations, conversational Q&amp;A, and patient guidance.
                </p>

                <div className="p-3 mb-3 rounded-3 bg-light border">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small fw-semibold text-dark">Active Project:</span>
                    <span className="badge bg-success bg-opacity-10 text-success font-monospace">projects/420640460683</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="small text-secondary">Default Model:</span>
                    <span className="badge bg-primary bg-opacity-10 text-primary">gemini-3.5-flash</span>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">API Key</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter Gemini API key..."
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                  />
                  <div className="form-text small text-muted">
                    Stored securely in your browser local storage for direct, ultra-fast AI inference.
                  </div>
                </div>
              </div>

              <div className="modal-footer border-top px-4 py-3 d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                  onClick={resetToDemoKey}
                >
                  Reset Demo Key
                </button>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-light btn-sm rounded-pill px-3"
                    onClick={() => setShowKeyModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm rounded-pill px-4"
                    onClick={saveApiKey}
                  >
                    Save Key
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;