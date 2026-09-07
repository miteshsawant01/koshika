import React from 'react';

const StatCard = ({ title, value, icon, color = 'primary', subtitle, code, trend, trendType = 'positive', className = '' }) => {
  return (
    <div className={`stat-card ${className}`}>
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {code && <span className="stat-card-code">{code}</span>}
      </div>

      <div className="d-flex justify-content-between align-items-center">
        <div>
          <div className="stat-card-value num-tabular">{value}</div>
          {subtitle && <small className="text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>{subtitle}</small>}
        </div>
        <div className={`stat-icon-wrapper bg-${color}-subtle text-${color}`}>
          <i className={`bi ${icon}`}></i>
        </div>
      </div>

      {trend && (
        <div className="stat-card-footer">
          <span className={`trend-indicator ${trendType}`}>
            <i className={`bi ${trendType === 'positive' ? 'bi-graph-up-arrow' : trendType === 'warning' ? 'bi-exclamation-triangle' : 'bi-dash-lg'}`}></i>
            <span>{trend}</span>
          </span>
          <small className="text-muted" style={{ fontSize: '0.72rem' }}>vs last cycle</small>
        </div>
      )}
    </div>
  );
};

export default StatCard;
