import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useRole, ROLES } from '../context/RoleContext';

const Sidebar = ({ mobileOpen, onCloseMobile }) => {
  const { role, unreadCount, openChatWithQuery } = useRole();

  // Collapsible sub-groups state
  const [openGroups, setOpenGroups] = useState({
    myHealth: true,
    reportsAI: true,
    stemCellCare: true,
    findCare: true,
  });

  const toggleGroup = (group) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const handleLinkClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleOpenAIChat = () => {
    openChatWithQuery('');
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop d-lg-none"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside className={`koshika-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Sidebar Header: Brand & Active Perspective */}
        <div className="sidebar-header d-flex flex-column gap-2 p-3 border-bottom">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <div className="sidebar-logo-icon">
                <i className="bi bi-heart-pulse-fill text-white"></i>
              </div>
              <div>
                <span className="sidebar-brand-text fw-bold">KOSHIKA</span>
                <span className="sidebar-brand-sub text-muted d-block small">Stem Cell Platform</span>
              </div>
            </div>
            {onCloseMobile && (
              <button
                type="button"
                className="btn btn-sm btn-light d-lg-none p-1 rounded-circle"
                onClick={onCloseMobile}
                aria-label="Close sidebar"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>

          {/* Role Indicator Badge */}
          <div className="sidebar-role-banner px-2 py-1 rounded-2 d-flex align-items-center justify-content-between">
            <span className="small text-muted fw-semibold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}>
              Perspective
            </span>
            <span className={`badge rounded-pill ${
              role === ROLES.PATIENT ? 'bg-primary-subtle text-primary' :
              role === ROLES.DOCTOR ? 'bg-success-subtle text-success' : 'bg-dark text-white'
            }`} style={{ fontSize: '0.72rem' }}>
              {role === ROLES.PATIENT && '👤 Patient'}
              {role === ROLES.DOCTOR && '👨‍⚕️ Clinician'}
              {role === ROLES.ADMIN && '🏢 Admin / Provider'}
            </span>
          </div>
        </div>

        {/* Navigation Menus based on Role */}
        <div className="sidebar-scrollable flex-grow-1 p-2">
          {/* =========================================================
              1. PATIENT NAVIGATION (PRIMARY / DEFAULT)
          ========================================================== */}
          {role === ROLES.PATIENT && (
            <ul className="sidebar-menu list-unstyled mb-0">
              {/* Dashboard */}
              <li className="sidebar-item">
                <NavLink
                  to="/"
                  end
                  onClick={handleLinkClick}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <i className="bi bi-house-door-fill sidebar-icon text-primary"></i>
                  <span className="sidebar-label">Dashboard</span>
                </NavLink>
              </li>

              {/* My Health Group */}
              <li className="sidebar-group">
                <button
                  type="button"
                  className="sidebar-group-toggle d-flex align-items-center justify-content-between w-100"
                  onClick={() => toggleGroup('myHealth')}
                >
                  <span className="d-flex align-items-center gap-2">
                    <i className="bi bi-person-heart sidebar-icon text-danger"></i>
                    <span className="sidebar-group-title">My Health</span>
                  </span>
                  <i className={`bi bi-chevron-${openGroups.myHealth ? 'down' : 'right'} small text-muted`}></i>
                </button>
                {openGroups.myHealth && (
                  <ul className="sidebar-sub-menu list-unstyled">
                    <li>
                      <NavLink
                        to="/my-health/profile"
                        onClick={handleLinkClick}
                        className={({ isActive }) => `sidebar-sub-link ${isActive ? 'active' : ''}`}
                      >
                        <i className="bi bi-person-badge me-2"></i>
                        <span>Patient Profile</span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/my-health/history"
                        onClick={handleLinkClick}
                        className={({ isActive }) => `sidebar-sub-link ${isActive ? 'active' : ''}`}
                      >
                        <i className="bi bi-clock-history me-2"></i>
                        <span>Medical History</span>
                      </NavLink>
                    </li>
                  </ul>
                )}
              </li>

              {/* Reports & AI Group */}
              <li className="sidebar-group">
                <button
                  type="button"
                  className="sidebar-group-toggle d-flex align-items-center justify-content-between w-100"
                  onClick={() => toggleGroup('reportsAI')}
                >
                  <span className="d-flex align-items-center gap-2">
                    <i className="bi bi-file-earmark-medical-fill sidebar-icon text-warning"></i>
                    <span className="sidebar-group-title">Reports &amp; AI</span>
                  </span>
                  <i className={`bi bi-chevron-${openGroups.reportsAI ? 'down' : 'right'} small text-muted`}></i>
                </button>
                {openGroups.reportsAI && (
                  <ul className="sidebar-sub-menu list-unstyled">
                    <li>
                      <NavLink
                        to="/ocr-reports"
                        onClick={handleLinkClick}
                        className={({ isActive }) => `sidebar-sub-link ${isActive ? 'active' : ''}`}
                      >
                        <i className="bi bi-cloud-arrow-up-fill me-2"></i>
                        <span>Upload Report</span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/ocr-reports?tab=insights"
                        onClick={handleLinkClick}
                        className={({ isActive }) => `sidebar-sub-link ${isActive ? 'active' : ''}`}
                      >
                        <i className="bi bi-magic me-2"></i>
                        <span>AI Report Insights</span>
                      </NavLink>
                    </li>
                  </ul>
                )}
              </li>

              {/* Stem Cell Care Group */}
              <li className="sidebar-group">
                <button
                  type="button"
                  className="sidebar-group-toggle d-flex align-items-center justify-content-between w-100"
                  onClick={() => toggleGroup('stemCellCare')}
                >
                  <span className="d-flex align-items-center gap-2">
                    <i className="bi bi-dna sidebar-icon text-info"></i>
                    <span className="sidebar-group-title">Stem Cell Care</span>
                  </span>
                  <i className={`bi bi-chevron-${openGroups.stemCellCare ? 'down' : 'right'} small text-muted`}></i>
                </button>
                {openGroups.stemCellCare && (
                  <ul className="sidebar-sub-menu list-unstyled">
                    <li>
                      <NavLink
                        to="/ml-match"
                        onClick={handleLinkClick}
                        className={({ isActive }) => `sidebar-sub-link ${isActive ? 'active' : ''}`}
                      >
                        <i className="bi bi-cpu-fill me-2"></i>
                        <span>Stem Cell Matching</span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/preliminary-assessment"
                        onClick={handleLinkClick}
                        className={({ isActive }) => `sidebar-sub-link ${isActive ? 'active' : ''}`}
                      >
                        <i className="bi bi-shield-check me-2"></i>
                        <span>Preliminary Assessment</span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/awareness"
                        onClick={handleLinkClick}
                        className={({ isActive }) => `sidebar-sub-link ${isActive ? 'active' : ''}`}
                      >
                        <i className="bi bi-book-half me-2"></i>
                        <span>Stem Cell Information</span>
                      </NavLink>
                    </li>
                  </ul>
                )}
              </li>

              {/* Find Care Group */}
              <li className="sidebar-group">
                <button
                  type="button"
                  className="sidebar-group-toggle d-flex align-items-center justify-content-between w-100"
                  onClick={() => toggleGroup('findCare')}
                >
                  <span className="d-flex align-items-center gap-2">
                    <i className="bi bi-hospital sidebar-icon text-success"></i>
                    <span className="sidebar-group-title">Find Care</span>
                  </span>
                  <i className={`bi bi-chevron-${openGroups.findCare ? 'down' : 'right'} small text-muted`}></i>
                </button>
                {openGroups.findCare && (
                  <ul className="sidebar-sub-menu list-unstyled">
                    <li>
                      <NavLink
                        to="/find-care/doctors"
                        onClick={handleLinkClick}
                        className={({ isActive }) => `sidebar-sub-link ${isActive ? 'active' : ''}`}
                      >
                        <i className="bi bi-person-badge-fill me-2"></i>
                        <span>Doctors</span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/find-care/centres"
                        onClick={handleLinkClick}
                        className={({ isActive }) => `sidebar-sub-link ${isActive ? 'active' : ''}`}
                      >
                        <i className="bi bi-building-check me-2"></i>
                        <span>Hospitals / Centres</span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/bank"
                        onClick={handleLinkClick}
                        className={({ isActive }) => `sidebar-sub-link ${isActive ? 'active' : ''}`}
                      >
                        <i className="bi bi-safe2-fill me-2"></i>
                        <span>Stem Cell Banks</span>
                      </NavLink>
                    </li>
                  </ul>
                )}
              </li>

              {/* Appointments */}
              <li className="sidebar-item">
                <NavLink
                  to="/appointments"
                  onClick={handleLinkClick}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <i className="bi bi-calendar2-check-fill sidebar-icon text-purple" style={{ color: '#8b5cf6' }}></i>
                  <span className="sidebar-label">Appointments</span>
                </NavLink>
              </li>

              {/* Notifications */}
              <li className="sidebar-item">
                <NavLink
                  to="/notifications"
                  onClick={handleLinkClick}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <i className="bi bi-bell-fill sidebar-icon text-amber" style={{ color: '#f59e0b' }}></i>
                  <span className="sidebar-label">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="badge bg-danger rounded-pill ms-auto" style={{ fontSize: '0.7rem' }}>
                      {unreadCount}
                    </span>
                  )}
                </NavLink>
              </li>
            </ul>
          )}

          {/* =========================================================
              2. DOCTOR NAVIGATION
          ========================================================== */}
          {role === ROLES.DOCTOR && (
            <ul className="sidebar-menu list-unstyled mb-0">
              <li className="sidebar-item">
                <NavLink
                  to="/doctor"
                  end
                  onClick={handleLinkClick}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <i className="bi bi-speedometer2 sidebar-icon text-success"></i>
                  <span className="sidebar-label">Doctor Dashboard</span>
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink
                  to="/patients"
                  onClick={handleLinkClick}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <i className="bi bi-people-fill sidebar-icon text-danger"></i>
                  <span className="sidebar-label">Patients Registry</span>
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink
                  to="/ocr-reports"
                  onClick={handleLinkClick}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <i className="bi bi-file-earmark-medical sidebar-icon text-warning"></i>
                  <span className="sidebar-label">Medical Reports</span>
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink
                  to="/appointments"
                  onClick={handleLinkClick}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <i className="bi bi-calendar2-week-fill sidebar-icon text-purple" style={{ color: '#8b5cf6' }}></i>
                  <span className="sidebar-label">Consultations</span>
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink
                  to="/ml-match"
                  onClick={handleLinkClick}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <i className="bi bi-cpu-fill sidebar-icon text-info"></i>
                  <span className="sidebar-label">HLA Matching Engine</span>
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink
                  to="/awareness"
                  onClick={handleLinkClick}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <i className="bi bi-journal-medical sidebar-icon text-primary"></i>
                  <span className="sidebar-label">Clinical Information</span>
                </NavLink>
              </li>
            </ul>
          )}

          {/* =========================================================
              3. ADMIN / STEM-CELL PROVIDER NAVIGATION
          ========================================================== */}
          {role === ROLES.ADMIN && (
            <ul className="sidebar-menu list-unstyled mb-0">
              <li className="sidebar-item">
                <NavLink
                  to="/admin"
                  end
                  onClick={handleLinkClick}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <i className="bi bi-graph-up-arrow sidebar-icon text-primary"></i>
                  <span className="sidebar-label">Admin Dashboard</span>
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink
                  to="/donors"
                  onClick={handleLinkClick}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <i className="bi bi-droplet-fill sidebar-icon text-success"></i>
                  <span className="sidebar-label">Donor Registry</span>
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink
                  to="/bank"
                  onClick={handleLinkClick}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <i className="bi bi-safe2-fill sidebar-icon text-teal" style={{ color: '#0d9488' }}></i>
                  <span className="sidebar-label">Stem Cell Banks</span>
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink
                  to="/storage"
                  onClick={handleLinkClick}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <i className="bi bi-snow2 sidebar-icon text-info"></i>
                  <span className="sidebar-label">Cryo Storage</span>
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink
                  to="/inventory"
                  onClick={handleLinkClick}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <i className="bi bi-box-seam-fill sidebar-icon text-warning"></i>
                  <span className="sidebar-label">Lab Inventory</span>
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink
                  to="/staff"
                  onClick={handleLinkClick}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <i className="bi bi-person-badge-fill sidebar-icon text-secondary"></i>
                  <span className="sidebar-label">Staff &amp; Doctors</span>
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink
                  to="/research"
                  onClick={handleLinkClick}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <i className="bi bi-journal-medical sidebar-icon text-purple" style={{ color: '#8b5cf6' }}></i>
                  <span className="sidebar-label">Research Studies</span>
                </NavLink>
              </li>
              <li className="sidebar-item">
                <NavLink
                  to="/reports"
                  onClick={handleLinkClick}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <i className="bi bi-file-earmark-pdf-fill sidebar-icon text-danger"></i>
                  <span className="sidebar-label">Official Reports</span>
                </NavLink>
              </li>
            </ul>
          )}
        </div>

        {/* Sidebar Footer: Ask KOSHIKA AI Button */}
        <div className="sidebar-footer p-3 border-top">
          <button
            type="button"
            className="btn btn-koshika-ai-sidebar w-100 d-flex align-items-center justify-content-center gap-2 py-2"
            onClick={handleOpenAIChat}
          >
            <i className="bi bi-robot"></i>
            <span className="fw-semibold">Ask KOSHIKA AI</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
