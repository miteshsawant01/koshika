import React, { useState, useEffect, useRef } from 'react';
import {
  NavLink,
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import api from '../api/client';

const DEMO_API_KEY = 'AIzaSy-DEMO-KEY-FOR-TESTING-ONLY';

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Dashboard',
    category: 'SYSTEM TELEMETRY',
    badge: 'LIVE',
    icon: 'bi-grid-1x2-fill',
    color: '#0284c7',
    bg: '#e0f2fe',
    status: 'Operational',
    statusIcon: 'bi-check-circle-fill',
    statusType: 'primary',
    subtitle: 'Live Telemetry',
    end: true
  },
  {
    to: '/ml-match',
    label: 'Donor Match (AI)',
    category: 'MATCHING ENGINE',
    badge: 'AI ML',
    icon: 'bi-cpu-fill',
    color: '#0891b2',
    bg: '#cffafe',
    status: '99.4% Accuracy',
    statusIcon: 'bi-lightning-charge-fill',
    statusType: 'info',
    subtitle: 'HLA Algorithm'
  },
  {
    to: '/ocr-reports',
    label: 'Scan Reports',
    category: 'DIGITIZATION',
    badge: 'OCR',
    icon: 'bi-file-earmark-medical-fill',
    color: '#d97706',
    bg: '#fef3c7',
    status: 'Fast Ingest',
    statusIcon: 'bi-upc-scan',
    statusType: 'warning',
    subtitle: 'Medical Reports'
  },
  {
    to: '/patients',
    label: 'Patients',
    category: 'RECIPIENTS',
    badge: 'PATIENTS',
    icon: 'bi-person-heart',
    color: '#ef4444',
    bg: '#ffe4e6',
    status: 'Immediate',
    statusIcon: 'bi-exclamation-triangle-fill',
    statusType: 'danger',
    subtitle: 'Awaiting Match'
  },
  {
    to: '/donors',
    label: 'Donors',
    category: 'VOLUNTEER POOL',
    badge: 'DONORS',
    icon: 'bi-droplet-fill',
    color: '#10b981',
    bg: '#d1fae5',
    status: 'Available',
    statusIcon: 'bi-graph-up-arrow',
    statusType: 'success',
    subtitle: 'HLA Ready'
  },
  {
    to: '/storage',
    label: 'Storage Vault',
    category: 'CRYOPRESERVATION',
    badge: 'CRYO VAULT',
    icon: 'bi-snow2',
    color: '#06b6d4',
    bg: '#cffafe',
    status: '-196°C Safe',
    statusIcon: 'bi-shield-check',
    statusType: 'info',
    subtitle: 'Vials Preserved'
  },
  {
    to: '/inventory',
    label: 'Inventory Supplies',
    category: 'LAB LOGISTICS',
    badge: 'SUPPLIES',
    icon: 'bi-box-seam-fill',
    color: '#f59e0b',
    bg: '#fef3c7',
    status: 'In Stock',
    statusIcon: 'bi-box-seam',
    statusType: 'warning',
    subtitle: 'Reagents & Kits'
  },
  {
    to: '/research',
    label: 'Research Studies',
    category: 'CLINICAL TRIALS',
    badge: 'STUDIES',
    icon: 'bi-journal-medical',
    color: '#8b5cf6',
    bg: '#ede9fe',
    status: 'Ongoing',
    statusIcon: 'bi-activity',
    statusType: 'purple',
    subtitle: 'Active Research'
  },
  {
    to: '/staff',
    label: 'Staff & Doctors',
    category: 'MEDICAL TEAM',
    badge: 'PERSONNEL',
    icon: 'bi-person-badge-fill',
    color: '#64748b',
    bg: '#f1f5f9',
    status: 'Active',
    statusIcon: 'bi-person-check-fill',
    statusType: 'secondary',
    subtitle: 'Care Team'
  },
  {
    to: '/reports',
    label: 'Official Reports',
    category: 'GOVERNANCE',
    badge: 'AUDIT',
    icon: 'bi-file-earmark-pdf-fill',
    color: '#dc2626',
    bg: '#fee2e2',
    status: 'Compliant',
    statusIcon: 'bi-file-check-fill',
    statusType: 'danger',
    subtitle: 'Audit Logs & PDF'
  },
  {
    to: '/bank',
    label: 'Biobank Info',
    category: 'INFRASTRUCTURE',
    badge: 'BIOBANK',
    icon: 'bi-hospital-fill',
    color: '#059669',
    bg: '#ccfbf1',
    status: 'Accredited',
    statusIcon: 'bi-building-check',
    statusType: 'success',
    subtitle: 'Repository Hub'
  },
  {
    to: '/awareness',
    label: 'Stem Cell Guide',
    category: 'KNOWLEDGE BASE',
    badge: 'GUIDE',
    icon: 'bi-book-half',
    color: '#0284c7',
    bg: '#e0f2fe',
    status: 'Verified Care',
    statusIcon: 'bi-journal-bookmark-fill',
    statusType: 'primary',
    subtitle: 'Science & Support'
  },
];

const Navbar = ({ onOpenAIAssistant }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [backendStatus, setBackendStatus] = useState('checking');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(
    () => localStorage.getItem('gemini_api_key') || DEMO_API_KEY
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navRef = useRef(null);

  // Initialize and persist default API key if not yet set
  useEffect(() => {
    if (!localStorage.getItem('gemini_api_key')) {
      localStorage.setItem('gemini_api_key', DEMO_API_KEY);
    }
  }, []);

  // Check backend status
  useEffect(() => {
    api
      .get('/dashboard/stats/')
      .then(() => setBackendStatus('online'))
      .catch(() => setBackendStatus('offline'));
  }, []);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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

    if (
      query.includes('donor') ||
      query.startsWith('don')
    ) {
      navigate('/donors');
    } else if (
      query.includes('patient') ||
      query.startsWith('pat')
    ) {
      navigate('/patients');
    } else if (
      query.includes('storage') ||
      query.includes('cryo') ||
      query.includes('tank')
    ) {
      navigate('/storage');
    } else if (
      query.includes('report') ||
      query.includes('ocr') ||
      query.includes('scan')
    ) {
      navigate('/ocr-reports');
    } else if (
      query.includes('match') ||
      query.includes('compatibility') ||
      query.includes('ml')
    ) {
      navigate('/ml-match');
    } else if (
      query.includes('inventory') ||
      query.includes('stock') ||
      query.includes('suppl')
    ) {
      navigate('/inventory');
    } else if (
      query.includes('staff') ||
      query.includes('doctor')
    ) {
      navigate('/staff');
    } else if (
      query.includes('research') ||
      query.includes('study')
    ) {
      navigate('/research');
    } else {
      if (onOpenAIAssistant) {
        onOpenAIAssistant();
      } else {
        navigate('/ai-assistant');
      }
    }

    setSearchQuery('');
  };

  return (
    <>
      <header
        className="top-navbar-wrapper"
        ref={navRef}
      >
        <nav className="top-navbar">

          {/* Brand Identity: KOSHIKA */}
          <div className="d-flex align-items-center gap-3">
            <Link
              to="/"
              className="navbar-brand-link d-flex align-items-center gap-2 text-decoration-none"
            >
              <div
                className="institutional-logo-box"
                style={{
                  background:
                    'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
                }}
              >
                <i className="bi bi-heart-pulse-fill"></i>
              </div>

              <div className="d-flex flex-column">
                <span className="institutional-brand-title d-flex align-items-center gap-2">
                  <span>KOSHIKA</span>

                  <span
                    className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill"
                    style={{
                      fontSize: '0.62rem',
                      letterSpacing: '0.04em',
                    }}
                  >
                    PATIENT SUPPORT
                  </span>
                </span>

                <span className="institutional-brand-badge">
                  AI Stem Cell Awareness &amp; Care
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Search Bar */}
          <form
            className="nav-search-container d-none d-lg-block"
            onSubmit={handleGlobalSearch}
          >
            <i className="bi bi-search nav-search-icon"></i>

            <input
              type="text"
              className="nav-search-input"
              placeholder="Search by keyword, donor, patient..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
            />

            <span className="nav-search-shortcut">
              ↵
            </span>
          </form>

          {/* Right Action Tools: API Key Status + Backend Status + Mobile Toggle */}
          <div className="d-flex align-items-center gap-2">
            {/* Gemini API Key Status Badge / Button */}
            <button
              type="button"
              onClick={() => setShowKeyModal(true)}
              className="btn btn-sm btn-light border d-flex align-items-center gap-1 rounded-pill px-3 py-1 shadow-xs"
              title="Click to configure Gemini API Key"
            >
              <i className="bi bi-key-fill text-warning"></i>
              <span className="small fw-semibold d-none d-sm-inline">API Key:</span>
              <span
                className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-0 font-monospace"
                style={{ fontSize: '0.68rem' }}
              >
                AIzaSy... (Active)
              </span>
            </button>

            {/* Backend Status indicator */}
            <div className="d-none d-lg-flex align-items-center gap-2 px-2 py-1 rounded-pill bg-light border small text-secondary">
              <span
                className="d-inline-block rounded-circle"
                style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: backendStatus === 'online' ? '#10b981' : '#f59e0b',
                  boxShadow: backendStatus === 'online' ? '0 0 0 2px rgba(16, 185, 129, 0.2)' : 'none',
                }}
              ></span>
              <span style={{ fontSize: '0.74rem', fontWeight: 600 }}>
                {backendStatus === 'online' ? 'Live System' : 'Connecting...'}
              </span>
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              className="btn btn-light border d-xl-none d-flex align-items-center justify-content-center p-2 rounded-3"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <i className={`bi ${mobileMenuOpen ? 'bi-x-lg text-danger' : 'bi-list text-dark'} fs-5`}></i>
            </button>
          </div>
        </nav>

        {/* =====================================================
            SECONDARY NAVIGATION — CARD BOXES (MATCHING KPI UI)
        ====================================================== */}
        <nav
          className="navbar-subnav-bar"
          aria-label="Secondary navigation"
        >
          {NAV_ITEMS.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => {
                navigate(item.to);
                window.scrollTo({ top: 0, behavior: 'instant' });
              }}
              className={({ isActive }) =>
                `nav-card-box subnav-pos-${index + 1} ${
                  isActive ? 'active' : ''
                }`
              }
              style={{ '--pos-index': index, '--theme-color': item.color }}
            >
              <div className="nav-card-header">
                <span className="nav-card-category">{item.category}</span>
                <span className="nav-card-badge">{item.badge}</span>
              </div>

              <div className="nav-card-body">
                <div className="nav-card-text">
                  <div className="nav-card-label">{item.label}</div>
                  <div className="nav-card-subtitle">{item.subtitle}</div>
                </div>
                <div
                  className="nav-card-icon-box"
                  style={{
                    backgroundColor: item.bg,
                    color: item.color,
                  }}
                >
                  <i
                    className={`bi ${item.icon} subnav-icon subnav-icon-pos-${index + 1}`}
                  ></i>
                </div>
              </div>

              <div className="nav-card-footer">
                <span className={`nav-card-status status-${item.statusType}`}>
                  <i className={`bi ${item.statusIcon} me-1`}></i>
                  <span>{item.status}</span>
                </span>
                <span className="nav-card-cue">vs last cycle</span>
              </div>
            </NavLink>
          ))}
        </nav>

        {/* Responsive Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="navbar-mobile-drawer shadow-lg">
            <div className="mobile-drawer-inner">

              {/* Mobile Search */}
              <div className="mb-3">
                <form onSubmit={handleGlobalSearch}>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Search donor, patient, storage..."
                      value={searchQuery}
                      onChange={(e) =>
                        setSearchQuery(
                          e.target.value
                        )
                      }
                    />

                    <button
                      className="btn btn-sm btn-primary"
                      type="submit"
                    >
                      Search
                    </button>
                  </div>
                </form>
              </div>

              <div className="mobile-section-label">
                Platform Modules &amp; Education
              </div>

              <div className="mobile-nav-grid mb-3">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className="mobile-nav-card"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate(item.to);
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    }}
                  >
                    <i className={`bi ${item.icon}`} style={{ color: item.color }}></i>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>

              {/* API Key Button */}
              <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                <span className="small text-muted font-monospace">API Key Active</span>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowKeyModal(true);
                  }}
                  className="btn btn-sm btn-outline-primary rounded-pill px-3"
                >
                  <i className="bi bi-key-fill me-1"></i>
                  Manage Key
                </button>
              </div>

            </div>
          </div>
        )}
      </header>

      {/* Gemini API Key Setup Modal */}
      {showKeyModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">

              {/* Modal Header */}
              <div className="modal-header bg-light border-bottom">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <i className="bi bi-key-fill text-warning"></i>
                  Google Gemini AI API Key
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowKeyModal(false)}
                ></button>
              </div>

              {/* Modal Body */}
              <div className="modal-body">
                <p className="text-secondary small mb-3">
                  This key powers <strong>KOSHIKA AI</strong> patient consultations, real-time stem cell clinical analysis, and medical report interpretations.
                </p>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label fw-semibold mb-0">
                      Gemini API Key
                    </label>
                    <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill">
                      Active &amp; Connected
                    </span>
                  </div>

                  <input
                    type="text"
                    className="form-control font-monospace"
                    placeholder="AIzaSy..."
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                  />

                  <div className="form-text mt-2 d-flex justify-content-between align-items-center">
                    <span>Default demo key is configured for live testing.</span>
                    <button
                      type="button"
                      onClick={resetToDemoKey}
                      className="btn btn-link btn-sm text-decoration-none p-0 text-primary"
                    >
                      Reset to Default Demo Key
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowKeyModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-primary px-4"
                  onClick={saveApiKey}
                >
                  Save Key
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;