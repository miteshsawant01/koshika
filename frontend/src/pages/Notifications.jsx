import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRole } from '../context/RoleContext';

const Notifications = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useRole();
  const [filter, setFilter] = useState('ALL');

  const filtered = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.read;
    if (filter === 'REPORTS') return n.type === 'report';
    if (filter === 'MATCHES') return n.type === 'match';
    return true;
  });

  return (
    <div className="koshika-animate-fadein pb-5">
      {/* Header */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-warning-subtle text-warning-emphasis fw-bold px-3 py-1 rounded-pill small">
                <i className="bi bi-bell-fill me-1"></i> COMMUNICATIONS
              </span>
              <span className="badge bg-light text-secondary border px-2 py-1 rounded-pill small">
                Clinical Alerts &amp; Updates
              </span>
            </div>
            <h2 className="fw-bold text-dark mb-1">
              Notifications &amp; Alerts
            </h2>
            <p className="text-secondary mb-0 small">
              Stay updated on medical report analyses, donor compatibility alerts, and consultation reminders
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-2"
            onClick={markAllNotificationsAsRead}
          >
            <i className="bi bi-check2-all me-1"></i>
            <span>Mark All as Read</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 ${filter === 'ALL' ? 'btn-primary' : 'btn-light border'}`}
            onClick={() => setFilter('ALL')}
          >
            All Alerts ({notifications.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 ${filter === 'UNREAD' ? 'btn-primary' : 'btn-light border'}`}
            onClick={() => setFilter('UNREAD')}
          >
            Unread ({notifications.filter(n => !n.read).length})
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 ${filter === 'REPORTS' ? 'btn-primary' : 'btn-light border'}`}
            onClick={() => setFilter('REPORTS')}
          >
            Reports
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 ${filter === 'MATCHES' ? 'btn-primary' : 'btn-light border'}`}
            onClick={() => setFilter('MATCHES')}
          >
            Matches
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="d-flex flex-column gap-3">
        {filtered.map((n) => (
          <div
            key={n.id}
            className={`card border-0 shadow-sm rounded-4 p-3 bg-white ${!n.read ? 'border-start border-4 border-primary' : ''}`}
            onClick={() => markNotificationAsRead(n.id)}
            style={{ cursor: 'pointer' }}
          >
            <div className="d-flex align-items-start justify-content-between gap-3">
              <div className="d-flex align-items-start gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center p-2 mt-1 shadow-xs"
                  style={{
                    backgroundColor: n.type === 'report' ? '#fef3c7' : n.type === 'match' ? '#d1fae5' : '#ede9fe',
                    color: n.type === 'report' ? '#d97706' : n.type === 'match' ? '#059669' : '#7c3aed',
                    width: '40px',
                    height: '40px'
                  }}
                >
                  <i className={`bi ${n.type === 'report' ? 'bi-file-earmark-medical-fill' : n.type === 'match' ? 'bi-heart-pulse-fill' : 'bi-calendar-check-fill'} fs-5`}></i>
                </div>
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <h6 className="fw-bold text-dark mb-0">{n.title}</h6>
                    {!n.read && (
                      <span className="badge bg-primary-subtle text-primary rounded-pill px-2 py-0" style={{ fontSize: '0.65rem' }}>
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="small text-secondary mb-1">{n.message}</p>
                  <small className="text-muted"><i className="bi bi-clock me-1"></i>{n.time}</small>
                </div>
              </div>

              {n.link && (
                <Link
                  to={n.link}
                  className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 flex-shrink-0"
                >
                  View Details &rarr;
                </Link>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="card border-0 shadow-sm rounded-4 p-5 text-center text-muted bg-white">
            <i className="bi bi-bell-slash fs-2 d-block mb-2 text-secondary"></i>
            <p className="mb-0">No notifications match this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
