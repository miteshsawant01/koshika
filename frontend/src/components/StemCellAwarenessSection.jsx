import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import KoshikaAwarenessPillars from './KoshikaAwarenessPillars';

const StemCellAwarenessSection = () => {
  const [selectedCellType, setSelectedCellType] = useState('hsc');

  // Eligibility quiz state
  const [quizAge, setQuizAge] = useState(true);
  const [quizWeight, setQuizWeight] = useState(true);
  const [quizHealth, setQuizHealth] = useState(true);
  const [quizInfection, setQuizInfection] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const cellTypes = {
    hsc: {
      name: 'Hematopoietic Stem Cells (HSCs)',
      badge: 'Blood & Immune System',
      color: '#0284c7',
      origin: 'Bone marrow, peripheral blood (mobilized), and umbilical cord blood',
      capabilities: 'Generate all human red blood cells, white blood cells, and platelets. Used in curative bone marrow transplants.',
      approvedUses: 'Acute & Chronic Leukemia, Lymphoma, Aplastic Anemia, Sickle Cell Disease, Severe Immunodeficiencies (SCID).',
      icon: 'bi-droplet-half'
    },
    msc: {
      name: 'Mesenchymal Stem Cells (MSCs)',
      badge: 'Structural & Regenerative',
      color: '#10b981',
      origin: 'Umbilical cord tissue (Wharton\'s jelly), bone marrow stroma, and adipose fat tissue',
      capabilities: 'Differentiate into osteoblasts (bone), chondrocytes (cartilage), myocytes (muscle), and adipocytes. Possess potent anti-inflammatory immunomodulation.',
      approvedUses: 'Graft-versus-Host Disease (GVHD) suppression, osteoarthritis cartilage repair, Crohn\'s fistulas, and ischemic wound healing.',
      icon: 'bi-grid-3x3-gap-fill'
    },
    ipsc: {
      name: 'Induced Pluripotent Stem Cells (iPSCs)',
      badge: 'Nobel Prize Technology',
      color: '#8b5cf6',
      origin: 'Reprogrammed adult somatic cells (e.g. skin fibroblasts) via Yamanaka factors (Oct4, Sox2, Klf4, c-Myc)',
      capabilities: 'Pluripotent cells capable of forming any cell type in the human body without using embryonic material.',
      approvedUses: 'Patient-specific disease modeling, drug toxicity screening, macular degeneration retinal repair, Parkinson\'s dopaminergic neuron replacement.',
      icon: 'bi-cpu-fill'
    },
    esc: {
      name: 'Embryonic Stem Cells (ESCs)',
      badge: 'Pluripotent Benchmark',
      color: '#f59e0b',
      origin: 'Inner cell mass of 5-day pre-implantation blastocysts in IVF facilities',
      capabilities: 'Total pluripotency; highest proliferative capacity; foundational for understanding human organogenesis.',
      approvedUses: 'Translational biology, developmental toxicology, spinal cord injury regeneration trials, and beta-islet cell replacement for Type 1 Diabetes.',
      icon: 'bi-stars'
    }
  };

  const mythsFacts = [
    {
      myth: 'Donating stem cells requires painful surgery and drilling into the spine.',
      fact: '90% of donations are done via PBSC (Peripheral Blood Stem Cell donation) using apheresis. It is a painless outpatient procedure similar to platelet donation. There is no surgery or spine contact.',
      icon: 'bi-shield-check',
      accent: 'primary'
    },
    {
      myth: 'Donating will deplete my body’s stem cell reserves permanently.',
      fact: 'Your body completely regenerates its stem cells back to normal levels within 4 to 6 weeks. There is no permanent reduction in your immune system or health.',
      icon: 'bi-arrow-repeat',
      accent: 'success'
    },
    {
      myth: 'Only immediate family members can be matching donors.',
      fact: '70% of patients do not have a fully compatible match in their family. They rely entirely on unrelated volunteer registries like KOSHIKA to survive.',
      icon: 'bi-people-fill',
      accent: 'info'
    },
    {
      myth: 'Stem cell therapy is only for elderly people.',
      fact: 'Stem cell transplants cure infants with severe immunodeficiency, young children with thalassemia, and adolescents with leukemia. Biobanking protects all generations.',
      icon: 'bi-heart-pulse-fill',
      accent: 'warning'
    }
  ];

  const isEligible = quizAge && quizWeight && quizHealth && !quizInfection;

  return (
    <div className="stem-cell-awareness-container mb-4">
      {/* KOSHIKA Core Awareness & Patient Guidance */}
      <KoshikaAwarenessPillars showHero={false} />

      {/* Interactive Cell Type Explorer */}
      <div id="cell-explorer" className="card border-0 shadow-sm p-4 mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-2">
          <div>
            <h4 className="fw-bold mb-1 d-flex align-items-center gap-2">
              <i className="bi bi-layers-fill text-primary"></i>
              Interactive Stem Cell Biology Explorer
            </h4>
            <p className="text-secondary small mb-0">Select a cellular category to explore origins, differentiation potency, and therapeutic applications</p>
          </div>
          <div className="btn-group btn-group-sm p-1 bg-light rounded-pill border" role="group">
            {Object.entries(cellTypes).map(([key]) => (
              <button
                key={key}
                type="button"
                className={`btn rounded-pill px-3 py-1 ${selectedCellType === key ? 'btn-primary shadow-sm fw-semibold' : 'btn-light text-secondary border-0'}`}
                onClick={() => setSelectedCellType(key)}
              >
                {key.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Cell Detail Card */}
        {(() => {
          const current = cellTypes[selectedCellType];
          return (
            <div className="p-3 p-md-4 rounded-3 border" style={{ backgroundColor: '#f8fafc' }}>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center"
                  style={{ width: '48px', height: '48px', background: `${current.color}15`, color: current.color, fontSize: '1.5rem' }}
                >
                  <i className={`bi ${current.icon}`}></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-0 text-dark">{current.name}</h5>
                  <span className="badge rounded-pill" style={{ backgroundColor: `${current.color}25`, color: current.color, fontWeight: 600 }}>
                    {current.badge}
                  </span>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-4">
                  <div className="p-3 bg-white rounded-3 border h-100">
                    <span className="text-muted small fw-bold text-uppercase d-block mb-1">
                      <i className="bi bi-geo-alt-fill me-1 text-primary"></i> Biological Origin
                    </span>
                    <p className="mb-0 text-dark small">{current.origin}</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 bg-white rounded-3 border h-100">
                    <span className="text-muted small fw-bold text-uppercase d-block mb-1">
                      <i className="bi bi-magic me-1 text-success"></i> Differentiation Power
                    </span>
                    <p className="mb-0 text-dark small">{current.capabilities}</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 bg-white rounded-3 border h-100">
                    <span className="text-muted small fw-bold text-uppercase d-block mb-1">
                      <i className="bi bi-check2-circle me-1 text-info"></i> Clinical Cures &amp; Therapies
                    </span>
                    <p className="mb-0 text-dark small">{current.approvedUses}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* The 4-Step Donor Journey */}
      <div className="card border-0 shadow-sm p-4 mb-4">
        <h4 className="fw-bold mb-1 d-flex align-items-center gap-2">
          <i className="bi bi-signpost-2-fill text-info"></i>
          The Life-Saving Stem Cell Donor Journey
        </h4>
        <p className="text-secondary small mb-4">From painless cheek swab to saving a cancer patient's life: how easy it is to become a hero</p>

        <div className="row g-3">
          <div className="col-md-3">
            <div className="p-3 rounded-3 border bg-white h-100 position-relative">
              <span className="badge bg-primary text-white rounded-circle p-2 mb-2">1</span>
              <h6 className="fw-bold mb-1">Free Cheek Swab</h6>
              <p className="text-secondary small mb-0">
                Register online. Receive a sterile cotton swab kit at your doorstep. Swab inside cheeks and mail back in prepaid envelope.
              </p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-3 rounded-3 border bg-white h-100 position-relative">
              <span className="badge bg-info text-white rounded-circle p-2 mb-2">2</span>
              <h6 className="fw-bold mb-1">HLA Database Match</h6>
              <p className="text-secondary small mb-0">
                Your high-resolution HLA markers (A, B, C, DRB1) are entered into the secure national &amp; global registry database.
              </p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-3 rounded-3 border bg-white h-100 position-relative">
              <span className="badge bg-warning text-white rounded-circle p-2 mb-2">3</span>
              <h6 className="fw-bold mb-1">Confirmation &amp; Prep</h6>
              <p className="text-secondary small mb-0">
                If a patient matches, undergo a routine health checkup. Receive a brief filgrastim boost to mobilize stem cells into bloodstream.
              </p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-3 rounded-3 border bg-white h-100 position-relative">
              <span className="badge bg-success text-white rounded-circle p-2 mb-2">4</span>
              <h6 className="fw-bold mb-1">Painless PBSC Donation</h6>
              <p className="text-secondary small mb-0">
                Relax in a comfortable recliner watching Netflix while an apheresis machine gently collects stem cells and returns your blood.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Two Columns: Interactive Eligibility Quiz & Myths vs Facts */}
      <div className="row g-4 mb-4">
        {/* Donor Eligibility Screener */}
        <div className="col-lg-6" id="donor-eligibility">
          <div className="card border-0 shadow-sm p-4 h-100">
            <h5 className="fw-bold mb-2 d-flex align-items-center gap-2">
              <i className="bi bi-clipboard2-check-fill text-success"></i>
              Interactive Donor Eligibility Screener
            </h5>
            <p className="text-secondary small mb-3">
              Take this quick 30-second assessment to see if you qualify to join the life-saving registry pool.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); setQuizSubmitted(true); }}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">1. Are you between 18 and 50 years of age?</label>
                <div className="d-flex gap-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="ageQuiz"
                      id="ageYes"
                      checked={quizAge === true}
                      onChange={() => setQuizAge(true)}
                    />
                    <label className="form-check-label small" htmlFor="ageYes">Yes (18-50)</label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="ageQuiz"
                      id="ageNo"
                      checked={quizAge === false}
                      onChange={() => setQuizAge(false)}
                    />
                    <label className="form-check-label small" htmlFor="ageNo">No (&lt;18 or &gt;50)</label>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">2. Do you weigh at least 50 kg (110 lbs)?</label>
                <div className="d-flex gap-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="weightQuiz"
                      id="wtYes"
                      checked={quizWeight === true}
                      onChange={() => setQuizWeight(true)}
                    />
                    <label className="form-check-label small" htmlFor="wtYes">Yes (≥ 50 kg)</label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="weightQuiz"
                      id="wtNo"
                      checked={quizWeight === false}
                      onChange={() => setQuizWeight(false)}
                    />
                    <label className="form-check-label small" htmlFor="wtNo">No (&lt; 50 kg)</label>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">3. Are you free from chronic heart, kidney, or lung diseases?</label>
                <div className="d-flex gap-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="healthQuiz"
                      id="hlthYes"
                      checked={quizHealth === true}
                      onChange={() => setQuizHealth(true)}
                    />
                    <label className="form-check-label small" htmlFor="hlthYes">Yes (Healthy)</label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="healthQuiz"
                      id="hlthNo"
                      checked={quizHealth === false}
                      onChange={() => setQuizHealth(false)}
                    />
                    <label className="form-check-label small" htmlFor="hlthNo">No (Chronic disease)</label>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">4. Any history of Hepatitis B/C, HIV, or Blood Cancers?</label>
                <div className="d-flex gap-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="infQuiz"
                      id="infNo"
                      checked={quizInfection === false}
                      onChange={() => setQuizInfection(false)}
                    />
                    <label className="form-check-label small" htmlFor="infNo">No (Negative)</label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="infQuiz"
                      id="infYes"
                      checked={quizInfection === true}
                      onChange={() => setQuizInfection(true)}
                    />
                    <label className="form-check-label small" htmlFor="infYes">Yes (Positive)</label>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-sm px-4 rounded-pill">
                Check My Result
              </button>
            </form>

            {quizSubmitted && (
              <div className={`mt-3 p-3 rounded-3 ${isEligible ? 'bg-success-subtle border border-success' : 'bg-warning-subtle border border-warning'}`}>
                {isEligible ? (
                  <div>
                    <div className="d-flex align-items-center gap-2 text-success fw-bold">
                      <i className="bi bi-check-circle-fill fs-5"></i>
                      <span>Congratulations! You are Prime Eligible to Donate!</span>
                    </div>
                    <p className="small text-secondary mb-2 mt-1">
                      You meet all primary criteria to register as a stem cell donor and give someone with leukemia a second chance at life.
                    </p>
                    <Link to="/donors" className="btn btn-sm btn-success rounded-pill px-3">
                      <i className="bi bi-person-plus-fill me-1"></i> Register as Volunteer Donor
                    </Link>
                  </div>
                ) : (
                  <div>
                    <div className="d-flex align-items-center gap-2 text-warning-emphasis fw-bold">
                      <i className="bi bi-info-circle-fill fs-5"></i>
                      <span>Clinical Review Required</span>
                    </div>
                    <p className="small text-secondary mb-0 mt-1">
                      Based on criteria guidelines, standard donor registration may have restrictions. However, you can still support biobanking awareness, family cord blood storage, or patient advocacy!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Myths vs Facts Cards */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm p-4 h-100">
            <h5 className="fw-bold mb-2 d-flex align-items-center gap-2">
              <i className="bi bi-patch-question-fill text-warning"></i>
              Busting Common Stem Cell Myths
            </h5>
            <p className="text-secondary small mb-3">Evidence-based facts addressing fears and common misconceptions about stem cell donation</p>

            <div className="d-flex flex-column gap-2">
              {mythsFacts.map((item, idx) => (
                <div key={idx} className="p-3 bg-light rounded-3 border">
                  <div className="d-flex align-items-center gap-2 text-danger fw-semibold small mb-1">
                    <i className="bi bi-x-circle-fill"></i>
                    <span>MYTH: "{item.myth}"</span>
                  </div>
                  <div className="d-flex align-items-start gap-2 text-dark small">
                    <i className="bi bi-check-circle-fill text-success mt-1"></i>
                    <span><strong>FACT:</strong> {item.fact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StemCellAwarenessSection;
