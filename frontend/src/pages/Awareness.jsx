import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StemCellAwarenessSection from '../components/StemCellAwarenessSection';
import StemCellBankInfo from '../components/StemCellBankInfo';
import TopTabBar from '../components/TopTabBar';

const Awareness = () => {
  const [activeTab, setActiveTab] = useState('awareness');

  const awarenessTabs = [
    { id: 'awareness', label: 'Cell Biology & Therapy', icon: 'bi-info-circle-fill', badge: 'Guide' },
    { id: 'bank', label: 'Stem Cell Bank & Cryo', icon: 'bi-hospital-fill', badge: 'Biobank' },
  ];

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <i className="bi bi-heart-pulse-fill text-primary"></i>
            Stem Cell Awareness &amp; Clinical Knowledge Center
          </h3>
          <p className="text-secondary mb-0">
            Comprehensive clinical overview of stem cell biology, regenerative therapies, donor registries, and biobanking
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <TopTabBar
        activeTab={activeTab}
        onSelectTab={(id) => setActiveTab(id)}
        onResetTab={() => setActiveTab('awareness')}
        tabs={awarenessTabs}
      />

      {activeTab === 'awareness' && <StemCellAwarenessSection />}
      {activeTab === 'bank' && <StemCellBankInfo />}
    </div>
  );
};

export default Awareness;

