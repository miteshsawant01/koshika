import React from 'react';
import StemCellBankInfo from '../components/StemCellBankInfo';
import { Link } from 'react-router-dom';

const BankHub = () => {
  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <i className="bi bi-hospital-fill text-primary"></i>
            Stem Cell Biobanking &amp; Registries Information
          </h3>
          <p className="text-secondary mb-0">
            Guide to cryopreservation, public vs. private biobanking, quality standards, and certified banks directory
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/storage" className="btn btn-outline-primary d-flex align-items-center gap-2">
            <i className="bi bi-snow2"></i>
            <span>View Cryo Inventory</span>
          </Link>
        </div>
      </div>

      <StemCellBankInfo />
    </div>
  );
};

export default BankHub;
