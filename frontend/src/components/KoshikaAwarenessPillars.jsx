import React from 'react';
import { Link } from 'react-router-dom';

const KoshikaAwarenessPillars = ({ showHero = true, onAskAI }) => {
  const handleTriggerAI = (query) => {
    if (onAskAI) {
      onAskAI(query);
    } else {
      window.dispatchEvent(new CustomEvent('open-koshika-ai', { detail: { query } }));
    }
  };

  return (
    <div className="koshika-awareness-wrapper mb-4">
      {/* 1. Main Hero Presentation Banner */}
      {showHero && (
        <div className="koshika-hero-card mb-4">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                <span className="badge bg-white text-primary fw-bold px-3 py-1 rounded-pill shadow-xs">
                  🧬 KOSHIKA
                </span>
                <span className="badge bg-info-subtle text-dark border border-white border-opacity-30 px-3 py-1 rounded-pill">
                  AI-Assisted Patient Support
                </span>
              </div>
              <h2 className="fw-extrabold text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
                AI-Assisted Stem Cell Awareness &amp; Patient Support
              </h2>
              <div className="koshika-tagline text-cyan fw-bold mb-3" style={{ color: '#7dd3fc', fontSize: '1.08rem' }}>
                Learn. Understand. Make Informed Decisions.
              </div>
              <p className="text-white text-opacity-90 mb-4" style={{ fontSize: '0.98rem', lineHeight: '1.65', maxWidth: '720px' }}>
                <strong>KOSHIKA</strong> is a patient-friendly platform that provides simple and reliable information about stem cells, stem cell transplantation, donor matching, treatment options, risks, and patient support.
              </p>

              <div className="d-flex flex-wrap gap-2">
                <Link to="/awareness" className="btn btn-light fw-bold text-primary px-4 py-2 rounded-pill shadow-sm">
                  <i className="bi bi-book-half me-1"></i> Learn More
                </Link>
                <Link to="/ml-match" className="btn btn-outline-light fw-semibold px-4 py-2 rounded-pill">
                  <i className="bi bi-heart-pulse me-1"></i> Check Donor Match
                </Link>
                <button
                  type="button"
                  onClick={() => handleTriggerAI('What are stem cells and where are they used in simple words?')}
                  className="btn btn-primary text-white fw-bold px-4 py-2 rounded-pill shadow-sm border border-white border-opacity-25"
                  style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)' }}
                >
                  <i className="bi bi-robot me-1"></i> Ask KOSHIKA AI
                </button>
              </div>
            </div>

            <div className="col-lg-4 mt-4 mt-lg-0 text-center text-lg-end">
              <div className="koshika-highlight-box p-4 rounded-4 shadow-sm text-start">
                <div className="d-flex align-items-center gap-2 mb-2 text-primary fw-bold small">
                  <i className="bi bi-shield-check fs-5 text-success"></i>
                  <span>Patient-First Science</span>
                </div>
                <h5 className="fw-bold text-dark mb-2">Evidence-Based Medicine</h5>
                <p className="text-secondary small mb-3">
                  Every guide on KOSHIKA is verified against scientific hematology protocols, clinical registry registries, and ethical medical care.
                </p>
                <div className="pt-2 border-top d-flex justify-content-between text-muted small">
                  <span>Transparency</span>
                  <span className="text-success fw-semibold">✓ Verified Facts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SECTION: What are Stem Cells? */}
      <div className="card border-0 shadow-sm p-4 mb-4 koshika-def-card">
        <div className="koshika-section-title-wrap">
          <div>
            <span className="badge bg-primary-subtle text-primary koshika-badge-pill mb-2">
              <i className="bi bi-info-circle-fill"></i> Fundamentals of Biology
            </span>
            <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              <span>🧬 What Are Stem Cells?</span>
            </h4>
            <p className="text-secondary small mb-0">
              Understanding the body's foundational master cells and their unique regenerative capabilities
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleTriggerAI('Can you explain what stem cells are and their difference from normal cells in simple terms?')}
            className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1"
          >
            <i className="bi bi-chat-dots-fill me-1"></i> Ask AI Definition
          </button>
        </div>

        {/* Simple Definition Box */}
        <div className="p-3 rounded-3 bg-light border-start border-4 border-primary mb-3">
          <div className="fw-bold text-dark mb-1">
            <i className="bi bi-lightbulb-fill text-warning me-1"></i> Simple Definition:
          </div>
          <p className="text-secondary small mb-0" style={{ fontSize: '0.92rem', lineHeight: '1.6' }}>
            <strong>Stem cells</strong> are special unspecialized cells that serve as the body's raw materials. Unlike any other cell in the human body, stem cells possess two extraordinary properties: <strong>self-renewal</strong> (the ability to divide repeatedly to produce more stem cells) and <strong>differentiation</strong> (the ability to mature into specialized cells like blood, muscle, or nerve cells).
          </p>
        </div>

        {/* Side-by-Side: Normal Cells vs Stem Cells */}
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <div className="koshika-compare-box koshika-compare-normal">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="fw-bold text-dark">Normal Specialized Cells</span>
                <span className="badge bg-secondary-subtle text-secondary small">Fixed Function</span>
              </div>
              <ul className="list-unstyled small text-secondary mb-0" style={{ lineHeight: '1.65' }}>
                <li className="mb-2">
                  <i className="bi bi-dash-circle text-muted me-2"></i>
                  <strong>Dedicated Structure:</strong> Skin, muscle, or red blood cells have a fixed shape designed for one specific function.
                </li>
                <li className="mb-2">
                  <i className="bi bi-dash-circle text-muted me-2"></i>
                  <strong>Cannot Change:</strong> A mature skin cell cannot become a muscle cell or a blood cell.
                </li>
                <li>
                  <i className="bi bi-dash-circle text-muted me-2"></i>
                  <strong>Limited Division:</strong> Most differentiated cells have a finite lifespan and cannot self-renew indefinitely.
                </li>
              </ul>
            </div>
          </div>

          <div className="col-md-6">
            <div className="koshika-compare-box koshika-compare-stem">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="fw-bold text-success">Stem Cells (Master Cells)</span>
                <span className="badge bg-success text-white small">Pluripotent &amp; Multipotent</span>
              </div>
              <ul className="list-unstyled small text-secondary mb-0" style={{ lineHeight: '1.65' }}>
                <li className="mb-2">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  <strong>Unspecialized:</strong> Start with no specific tissue architecture and can remain unspecialized for long periods.
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  <strong>Ability to Specialize:</strong> Given the correct biological signals, they develop into various specific cell types.
                </li>
                <li>
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  <strong>Self-Renewal:</strong> Capable of dividing and creating exact copies of themselves indefinitely.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Ability to Develop into Different Cell Types (Potency) */}
        <div className="p-3 bg-white rounded-3 border">
          <div className="fw-bold text-dark small mb-2 d-flex align-items-center gap-2">
            <i className="bi bi-diagram-3-fill text-primary"></i>
            Their Ability to Develop into Different Cell Types:
          </div>
          <div className="row g-2 text-center">
            <div className="col-6 col-md-3">
              <div className="p-2 rounded bg-light border">
                <div className="fs-5 text-danger mb-1">🩸</div>
                <div className="fw-bold small text-dark">Red Blood Cells</div>
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>Oxygen Delivery</small>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="p-2 rounded bg-light border">
                <div className="fs-5 text-primary mb-1">🛡️</div>
                <div className="fw-bold small text-dark">White Blood Cells</div>
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>Immune Defense</small>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="p-2 rounded bg-light border">
                <div className="fs-5 text-warning mb-1">🩹</div>
                <div className="fw-bold small text-dark">Platelets</div>
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>Blood Clotting</small>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="p-2 rounded bg-light border">
                <div className="fs-5 text-success mb-1">⚡</div>
                <div className="fw-bold small text-dark">Muscle &amp; Nerve Cells</div>
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>Tissue Regeneration</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECTION: Types of Stem Cells (4 Major Types) */}
      <div className="mb-4">
        <div className="koshika-section-title-wrap">
          <div>
            <span className="badge bg-info-subtle text-info-emphasis koshika-badge-pill mb-2">
              <i className="bi bi-collection-fill"></i> Classification
            </span>
            <h4 className="fw-bold text-dark mb-1">
              <span>🔬 Types of Stem Cells</span>
            </h4>
            <p className="text-secondary small mb-0">
              The four major categories of stem cells, their origins, and their biological capabilities
            </p>
          </div>
        </div>

        <div className="row g-3">
          {/* 1. Embryonic stem cells */}
          <div className="col-12 col-md-6 col-xl-3">
            <div className="koshika-type-card">
              <div>
                <div className="koshika-type-icon bg-warning-subtle text-warning">
                  <i className="bi bi-stars"></i>
                </div>
                <span className="badge bg-warning text-dark mb-2 small fw-bold">Pluripotent</span>
                <h5 className="fw-bold text-dark mb-2">Embryonic Stem Cells</h5>
                <p className="text-secondary small mb-3" style={{ lineHeight: '1.6' }}>
                  Derived from early-stage pre-implantation embryos (blastocysts). They are <strong>pluripotent</strong>, meaning they possess the extraordinary ability to differentiate into virtually every cell type in the human body.
                </p>
              </div>
              <div className="pt-2 border-top">
                <small className="text-muted d-block mb-2"><strong>Primary Value:</strong> Groundwork for developmental biology &amp; regenerative research.</small>
                <button
                  type="button"
                  onClick={() => handleTriggerAI('Explain embryonic stem cells and their role in research')}
                  className="btn btn-link text-warning text-decoration-none p-0 small fw-semibold"
                >
                  Learn about ESCs &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* 2. Adult stem cells */}
          <div className="col-12 col-md-6 col-xl-3">
            <div className="koshika-type-card">
              <div>
                <div className="koshika-type-icon bg-success-subtle text-success">
                  <i className="bi bi-person-fill"></i>
                </div>
                <span className="badge bg-success text-white mb-2 small fw-bold">Multipotent</span>
                <h5 className="fw-bold text-dark mb-2">Adult Stem Cells</h5>
                <p className="text-secondary small mb-3" style={{ lineHeight: '1.6' }}>
                  Also called <em>somatic stem cells</em>. Undifferentiated cells found residing in specific adult tissues like bone marrow, adipose tissue, and liver. They primarily repair and replenish the specific tissue they occupy.
                </p>
              </div>
              <div className="pt-2 border-top">
                <small className="text-muted d-block mb-2"><strong>Primary Value:</strong> Natural tissue maintenance, healing, and routine cellular turnover.</small>
                <button
                  type="button"
                  onClick={() => handleTriggerAI('Explain adult stem cells and where they are found in the body')}
                  className="btn btn-link text-success text-decoration-none p-0 small fw-semibold"
                >
                  Learn about Adult Cells &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* 3. Induced pluripotent stem cells (iPSCs) */}
          <div className="col-12 col-md-6 col-xl-3">
            <div className="koshika-type-card">
              <div>
                <div className="koshika-type-icon" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
                  <i className="bi bi-cpu-fill"></i>
                </div>
                <span className="badge text-white mb-2 small fw-bold" style={{ backgroundColor: '#9333ea' }}>Nobel Discovery</span>
                <h5 className="fw-bold text-dark mb-2">iPSCs</h5>
                <p className="text-secondary small mb-3" style={{ lineHeight: '1.6' }}>
                  <strong>Induced Pluripotent Stem Cells</strong>. Normal adult cells (such as skin or blood) genetically reprogrammed in the laboratory to regain embryonic-like pluripotency without requiring embryonic tissue.
                </p>
              </div>
              <div className="pt-2 border-top">
                <small className="text-muted d-block mb-2"><strong>Primary Value:</strong> Disease modeling, drug screening, and patient-specific cellular therapy.</small>
                <button
                  type="button"
                  onClick={() => handleTriggerAI('What are induced pluripotent stem cells (iPSCs) and how are they created?')}
                  className="btn btn-link text-decoration-none p-0 small fw-semibold"
                  style={{ color: '#9333ea' }}
                >
                  Learn about iPSCs &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* 4. Hematopoietic stem cells */}
          <div className="col-12 col-md-6 col-xl-3">
            <div className="koshika-type-card">
              <div>
                <div className="koshika-type-icon bg-danger-subtle text-danger">
                  <i className="bi bi-droplet-half"></i>
                </div>
                <span className="badge bg-danger text-white mb-2 small fw-bold">Blood-Forming</span>
                <h5 className="fw-bold text-dark mb-2">Hematopoietic Cells (HSCs)</h5>
                <p className="text-secondary small mb-3" style={{ lineHeight: '1.6' }}>
                  Found in bone marrow, peripheral blood, and umbilical cord blood. HSCs are the master builders of all human blood cells (erythrocytes, leukocytes, and thrombocytes) and power curative bone marrow transplants.
                </p>
              </div>
              <div className="pt-2 border-top">
                <small className="text-muted d-block mb-2"><strong>Primary Value:</strong> Routine established clinical transplantation for leukemia &amp; blood disorders.</small>
                <button
                  type="button"
                  onClick={() => handleTriggerAI('What are hematopoietic stem cells and how do bone marrow transplants work?')}
                  className="btn btn-link text-danger text-decoration-none p-0 small fw-semibold"
                >
                  Learn about HSCs &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SECTION: Uses of Stem Cell Therapy */}
      <div className="mb-4">
        <div className="koshika-section-title-wrap">
          <div>
            <span className="badge bg-success-subtle text-success koshika-badge-pill mb-2">
              <i className="bi bi-shield-plus"></i> Clinical Applications
            </span>
            <h4 className="fw-bold text-dark mb-1">
              <span>🩺 Uses of Stem Cell Therapy</span>
            </h4>
            <p className="text-secondary small mb-0">
              Established and evidence-based clinical indications where stem cell transplantation saves lives
            </p>
          </div>
        </div>

        <div className="row g-3">
          {/* Blood disorders such as leukemia */}
          <div className="col-12 col-md-6 col-xl-3">
            <div className="koshika-use-card border-start border-4 border-danger">
              <span className="koshika-use-badge bg-danger-subtle text-danger">Blood Cancer</span>
              <h5 className="fw-bold text-dark mb-2">Leukemia</h5>
              <p className="text-secondary small mb-3" style={{ lineHeight: '1.6' }}>
                Stem cell transplantation replaces diseased, cancerous bone marrow cells with healthy donor cells for conditions including Acute Lymphoblastic Leukemia (ALL), Acute Myeloid Leukemia (AML), and Chronic Myeloid Leukemia (CML).
              </p>
              <div className="small text-muted border-top pt-2">
                <i className="bi bi-check2 text-success me-1"></i> Established Clinical Standard
              </div>
            </div>
          </div>

          {/* Lymphoma */}
          <div className="col-12 col-md-6 col-xl-3">
            <div className="koshika-use-card border-start border-4 border-primary">
              <span className="koshika-use-badge bg-primary-subtle text-primary">Lymphatic Cancer</span>
              <h5 className="fw-bold text-dark mb-2">Lymphoma</h5>
              <p className="text-secondary small mb-3" style={{ lineHeight: '1.6' }}>
                For patients suffering from Hodgkin and Non-Hodgkin Lymphoma, autologous or allogeneic stem cell transplantation allows patients to receive high-dose chemotherapy to eliminate lymphoma cells, followed by immune rescue.
              </p>
              <div className="small text-muted border-top pt-2">
                <i className="bi bi-check2 text-success me-1"></i> Standard Curative Regimen
              </div>
            </div>
          </div>

          {/* Some immune-system disorders */}
          <div className="col-12 col-md-6 col-xl-3">
            <div className="koshika-use-card border-start border-4 border-info">
              <span className="koshika-use-badge bg-info-subtle text-info-emphasis">Immune Rebuilding</span>
              <h5 className="fw-bold text-dark mb-2">Immune-System Disorders</h5>
              <p className="text-secondary small mb-3" style={{ lineHeight: '1.6' }}>
                Corrects severe immune dysfunctions including Severe Combined Immunodeficiency (SCID, "bubble boy disease"), Wiskott-Aldrich syndrome, and severe Aplastic Anemia by providing a new, fully functional immune system.
              </p>
              <div className="small text-muted border-top pt-2">
                <i className="bi bi-check2 text-success me-1"></i> Life-Saving Immune Restoration
              </div>
            </div>
          </div>

          {/* Certain inherited blood disorders */}
          <div className="col-12 col-md-6 col-xl-3">
            <div className="koshika-use-card border-start border-4 border-success">
              <span className="koshika-use-badge bg-success-subtle text-success">Genetic Conditions</span>
              <h5 className="fw-bold text-dark mb-2">Inherited Blood Disorders</h5>
              <p className="text-secondary small mb-3" style={{ lineHeight: '1.6' }}>
                Offers permanent cures for inherited hemoglobinopathies such as <strong>Sickle Cell Disease</strong> and <strong>Thalassemia Major</strong> by introducing stem cells with the correct genetic instructions for hemoglobin production.
              </p>
              <div className="small text-muted border-top pt-2">
                <i className="bi bi-check2 text-success me-1"></i> Permanent Genetic Resolution
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. SECTION: Benefits of Stem Cells */}
      <div className="mb-4">
        <div className="koshika-section-title-wrap">
          <div>
            <span className="badge bg-primary-subtle text-primary koshika-badge-pill mb-2">
              <i className="bi bi-stars"></i> Transformative Potential
            </span>
            <h4 className="fw-bold text-dark mb-1">
              <span>🌟 Benefits of Stem Cells</span>
            </h4>
            <p className="text-secondary small mb-0">
              How stem cells provide immediate patient cures and drive future regenerative medicine
            </p>
          </div>
        </div>

        <div className="row g-3">
          {/* Benefit 1 */}
          <div className="col-12 col-md-4">
            <div className="koshika-benefit-card">
              <div className="koshika-benefit-num">01</div>
              <div className="koshika-benefit-icon bg-primary-subtle text-primary">
                <i className="bi bi-heart-pulse-fill"></i>
              </div>
              <h5 className="fw-bold text-dark mb-2">Replace Damaged or Diseased Cells</h5>
              <p className="text-secondary small mb-0" style={{ lineHeight: '1.65' }}>
                Stem cells can directly regenerate healthy cells to replace those destroyed by disease, intensive chemotherapy, or radiation therapy. In bone marrow transplants, healthy donor stem cells take root and rebuild the patient's entire blood supply.
              </p>
            </div>
          </div>

          {/* Benefit 2 */}
          <div className="col-12 col-md-4">
            <div className="koshika-benefit-card">
              <div className="koshika-benefit-num">02</div>
              <div className="koshika-benefit-icon bg-success-subtle text-success">
                <i className="bi bi-activity"></i>
              </div>
              <h5 className="fw-bold text-dark mb-2">Transplantation &amp; Regenerative Medicine</h5>
              <p className="text-secondary small mb-0" style={{ lineHeight: '1.65' }}>
                Stem cells form the core foundation of regenerative medicine. Beyond blood transplants, scientists are actively developing methods to generate heart muscle cells, insulin-producing pancreatic cells, and neurons to repair injured organs.
              </p>
            </div>
          </div>

          {/* Benefit 3 */}
          <div className="col-12 col-md-4">
            <div className="koshika-benefit-card">
              <div className="koshika-benefit-num">03</div>
              <div className="koshika-benefit-icon bg-info-subtle text-info-emphasis">
                <i className="bi bi-journal-medical"></i>
              </div>
              <h5 className="fw-bold text-dark mb-2">Disease Modeling &amp; Drug Development</h5>
              <p className="text-secondary small mb-0" style={{ lineHeight: '1.65' }}>
                By differentiating stem cells into diseased human tissues in laboratory dishes, researchers can study disease mechanisms directly at the molecular level, screen thousands of therapeutic compounds safely, and develop breakthrough treatments faster.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Real-World Impact: Emily Whitehead */}
      <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '16px', background: 'linear-gradient(145deg, #ffffff 0%, #f0fdfa 100%)', border: '1px solid #ccfbf1' }}>
        <div className="row align-items-center">
          <div className="col-lg-8">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-danger-subtle text-danger fw-bold px-3 py-1 rounded-pill">
                ❤️ Real-World Patient Impact
              </span>
              <span className="text-secondary small">Case Study in Cellular Innovation</span>
            </div>
            <h5 className="fw-bold text-dark mb-2">
              Emily Whitehead: Cellular Therapy Remission Story
            </h5>
            <p className="text-secondary small mb-3" style={{ lineHeight: '1.65' }}>
              <strong>Emily Whitehead</strong>, diagnosed with relapsed Acute Lymphoblastic Leukemia (ALL) at age five with no remaining treatment options, became the first pediatric patient in the world to receive experimental CAR-T cell therapy (an advanced genetically engineered cellular treatment). She achieved complete remission and remains cancer-free over a decade later. Her story demonstrates the real, scientifically validated potential of cell-based medicine.
            </p>
            <div className="d-flex align-items-center gap-3">
              <button
                type="button"
                onClick={() => handleTriggerAI('Explain Emily Whitehead story and how CAR-T cellular therapy works')}
                className="btn btn-sm btn-outline-danger rounded-pill px-3"
              >
                <i className="bi bi-chat-quote me-1"></i> Ask AI about Emily Whitehead
              </button>
              <Link to="/ml-match" className="btn btn-sm btn-link text-decoration-none text-primary fw-semibold p-0">
                Check HLA Donor Compatibility &rarr;
              </Link>
            </div>
          </div>

          <div className="col-lg-4 mt-3 mt-lg-0 text-center">
            <div className="p-3 bg-white rounded-3 border shadow-2xs text-start">
              <div className="d-flex align-items-center gap-2 mb-2 text-success fw-bold small">
                <i className="bi bi-check-circle-fill"></i>
                <span>Proven Scientific Remission</span>
              </div>
              <div className="text-dark small mb-1">
                <strong>Diagnosis:</strong> Relapsed ALL
              </div>
              <div className="text-dark small mb-1">
                <strong>Therapy:</strong> CD19-Targeted CAR-T Cell Infusion
              </div>
              <div className="text-dark small">
                <strong>Outcome:</strong> Complete Continuous Remission (12+ Years)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Patient Protection Banner: Stay Informed. Stay Safe. */}
      <div className="card border-0 shadow-sm p-4 mb-4 koshika-safety-banner">
        <div className="row align-items-center">
          <div className="col-lg-7">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-warning text-dark fw-bold px-3 py-1 rounded-pill">
                <i className="bi bi-exclamation-triangle-fill me-1"></i> Patient Advisory
              </span>
              <span className="fw-bold text-danger">⚠️ Stay Informed. Stay Safe.</span>
            </div>
            <h5 className="fw-bold text-dark mb-2">
              Be Careful of False or Unproven Medical Claims
            </h5>
            <p className="text-secondary small mb-3" style={{ lineHeight: 1.6 }}>
              Predatory clinics often make misleading promises that risk patient health and finances. Always verify the scientific evidence and consult a qualified healthcare professional before considering treatment.
            </p>

            <div className="d-flex flex-wrap gap-2">
              <div className="koshika-warning-tag">
                <span className="text-danger fw-bold">❌</span> “Guaranteed cure”
              </div>
              <div className="koshika-warning-tag">
                <span className="text-danger fw-bold">❌</span> “No side effects”
              </div>
              <div className="koshika-warning-tag">
                <span className="text-danger fw-bold">❌</span> “Works for every disease”
              </div>
            </div>
          </div>

          <div className="col-lg-5 mt-3 mt-lg-0">
            <div className="p-3 bg-white rounded-3 border shadow-2xs">
              <div className="fw-bold text-dark small mb-1 d-flex align-items-center gap-1">
                <i className="bi bi-clipboard2-check text-primary"></i>
                Clinical Safety Checklist
              </div>
              <ul className="list-unstyled small text-secondary mb-0" style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
                <li className="mb-1">✓ Only pursue transplants approved by official regulatory authorities.</li>
                <li className="mb-1">✓ Confirm your donor center is certified (e.g. WMDA / FACT accredited).</li>
                <li>✓ Seek a second opinion from a licensed board-certified hematologist.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Meet KOSHIKA AI Card & Educational Topics */}
      <div className="card border-0 shadow-sm p-4 mb-4 koshika-ai-cta-card">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <div className="d-flex align-items-center gap-2 mb-2">
              <div className="koshika-ai-badge">
                <i className="bi bi-robot"></i>
              </div>
              <h5 className="fw-bold text-dark mb-0">🤖 Meet KOSHIKA AI</h5>
            </div>
            <p className="text-secondary small mb-3">
              KOSHIKA provides educational support to help you understand medical reports, donor matching concepts, and treatment realities. It is free, simple, and accessible 24/7.
            </p>
            <div className="p-2 rounded-2 bg-light border small text-muted mb-3" style={{ fontSize: '0.78rem' }}>
              <i className="bi bi-info-circle text-primary me-1"></i>
              <strong>Medical Notice:</strong> KOSHIKA provides educational support and does not replace professional medical advice.
            </div>
            <div className="fw-bold text-success small">
              🌱 Learn. Verify. Consult.
              <span className="text-muted fw-normal ms-1">Better information leads to better healthcare conversations.</span>
            </div>
          </div>

          <div className="col-lg-6 mt-3 mt-lg-0">
            <div className="fw-semibold text-dark small mb-2">Click any topic to ask KOSHIKA AI:</div>
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm rounded-pill px-3 py-1"
                onClick={() => handleTriggerAI('Tell me about stem cells and their role in the body')}
              >
                🧬 Stem cells
              </button>
              <button
                type="button"
                className="btn btn-outline-success btn-sm rounded-pill px-3 py-1"
                onClick={() => handleTriggerAI('How does stem cell transplantation work and who is it for?')}
              >
                🏥 Transplantation
              </button>
              <button
                type="button"
                className="btn btn-outline-info btn-sm rounded-pill px-3 py-1"
                onClick={() => handleTriggerAI('How does HLA matching work and why is it important for donors?')}
              >
                🤝 HLA matching
              </button>
              <button
                type="button"
                className="btn btn-outline-warning btn-sm rounded-pill px-3 py-1 text-dark"
                onClick={() => handleTriggerAI('What are the risks, limitations, and side effects of stem cell therapies?')}
              >
                ⚠️ Risks &amp; limitations
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1"
                onClick={() => handleTriggerAI('What are the biggest myths and facts about stem cell donation?')}
              >
                📚 Myths &amp; facts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KoshikaAwarenessPillars;
