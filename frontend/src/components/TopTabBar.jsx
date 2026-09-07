import React from 'react';

const TopTabBar = ({ activeTab, onSelectTab, onResetTab, tabs }) => {
  const defaultTabs = [
    { id: 'home', label: 'Overview & Numbers', icon: 'bi-grid-fill', badge: 'Live' },
    { id: 'donor', label: 'Volunteer Donors', icon: 'bi-droplet-fill', badge: 'Ready to Help' },
    { id: 'user', label: 'Patients in Need', icon: 'bi-person-heart', badge: 'Needs Match' },
    { id: 'bank', label: 'Stem Cell Bank & Storage', icon: 'bi-hospital-fill', badge: 'Safe Vault' },
    { id: 'awareness', label: 'Simple Guide to Stem Cells', icon: 'bi-book-half' },
  ];

  const currentTabs = tabs || defaultTabs;

  return (
    <div className="top-tabs-bar" role="navigation" aria-label="Easy navigation tabs">
      <div className="top-tabs-list" role="tablist">
        {currentTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              className={`tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(tab.id)}
            >
              <i className={`bi ${tab.icon}`}></i>
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`badge rounded-pill ${
                    isActive ? 'bg-white text-primary' : 'bg-light text-secondary border'
                  }`}
                  style={{ fontSize: '0.68rem', fontWeight: 700 }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Reset button */}
      <button
        type="button"
        className="tab-close-btn"
        title="Go back to Overview"
        aria-label="Go back to Overview"
        onClick={() => onResetTab ? onResetTab() : onSelectTab('home')}
      >
        <i className="bi bi-arrow-counterclockwise"></i>
      </button>
    </div>
  );
};

export default TopTabBar;
