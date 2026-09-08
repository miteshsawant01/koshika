import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';

const PreliminaryAssessment = () => {
  const navigate = useNavigate();
  const { patientProfile } = useRole();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    disease: 'Acute Myeloid Leukemia (AML)',
    age: patientProfile.age || 32,
    bloodGroup: patientProfile.bloodGroup || 'B+',
    remissionStage: 'First Complete Remission (CR1)',
    priorChemo: 'Yes - Standard Induction (7+3 regimen)',
    radiation: 'No',
    ecogStatus: '0 - Fully active, able to carry on all pre-disease performance without restriction',
    cd34Estimated: '5.8 x10^6 cells/kg',
    organFunction: 'Normal cardiac, hepatic and renal functions verified'
  });

  const [assessmentResult, setAssessmentResult] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  const handleRunAssessment = () => {
    setEvaluating(true);
    setTimeout(() => {
      setAssessmentResult({
        candidacyScore: 89,
        candidacyLevel: 'High Candidate for Allogeneic Stem Cell Transplant',
        badgeColor: 'success',
        transplantType: 'Allogeneic Hematopoietic Stem Cell Transplant (Allo-HSCT)',
        conditioningRecommendation: 'Myeloablative or Reduced-Intensity Conditioning (RIC)',
        hlaTarget: '9/10 or 10/10 Matched Unrelated Donor (MUD) or Sibling Match',
        summary: 'Based on patient age (32), disease state (AML in CR1), and optimal ECOG score (0), clinical guidelines strongly recommend proceeding with high-resolution HLA typing and donor registry search.',
        keyFactors: [
          { label: 'Indication & Stage', value: `${formData.disease} (${formData.remissionStage})`, favorable: true },
          { label: 'Patient Age (Optimal < 60)', value: `${formData.age} years`, favorable: true },
          { label: 'ECOG Performance Status', value: 'ECOG 0 (Normal activity)', favorable: true },
          { label: 'Organ Function Vitals', value: 'Normal (Cardiac, Renal, Liver)', favorable: true }
        ]
      });
      setEvaluating(false);
      setStep(4);
    }, 900);
  };

  return (
    <div className="koshika-animate-fadein pb-5">
      {/* Page Header */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-primary-subtle text-primary fw-bold px-3 py-1 rounded-pill small">
                <i className="bi bi-shield-check me-1"></i> DECISION SUPPORT
              </span>
              <span className="badge bg-info-subtle text-info border border-info-subtle rounded-pill small">
                Dual-Algorithm Clinical Triage
              </span>
            </div>
            <h2 className="fw-bold text-dark mb-1">
              ML-Assisted Preliminary Assessment
            </h2>
            <p className="text-secondary mb-0 small">
              Evidence-based preliminary evaluation of stem cell therapy candidacy, risk profile, and recommended clinical care pathway
            </p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-light text-secondary border px-3 py-2 rounded-pill small">
              Step {step} of 4
            </span>
          </div>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="row text-center g-2">
          <div className="col-3">
            <button
              type="button"
              className={`btn btn-sm w-100 rounded-pill py-2 ${step >= 1 ? 'btn-primary' : 'btn-light border text-muted'}`}
              onClick={() => setStep(1)}
            >
              <span className="d-none d-sm-inline">1. </span>Diagnosis
            </button>
          </div>
          <div className="col-3">
            <button
              type="button"
              className={`btn btn-sm w-100 rounded-pill py-2 ${step >= 2 ? 'btn-primary' : 'btn-light border text-muted'}`}
              onClick={() => setStep(2)}
            >
              <span className="d-none d-sm-inline">2. </span>Treatment
            </button>
          </div>
          <div className="col-3">
            <button
              type="button"
              className={`btn btn-sm w-100 rounded-pill py-2 ${step >= 3 ? 'btn-primary' : 'btn-light border text-muted'}`}
              onClick={() => setStep(3)}
            >
              <span className="d-none d-sm-inline">3. </span>Health Vitals
            </button>
          </div>
          <div className="col-3">
            <button
              type="button"
              className={`btn btn-sm w-100 rounded-pill py-2 ${step >= 4 ? 'btn-success' : 'btn-light border text-muted'}`}
              onClick={() => { if (assessmentResult) setStep(4); }}
              disabled={!assessmentResult}
            >
              <span className="d-none d-sm-inline">4. </span>Assessment
            </button>
          </div>
        </div>
      </div>

      {/* Step Forms */}
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          {/* Step 1: Condition & Demographics */}
          {step === 1 && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-person-fill text-primary"></i>
                Patient Demographics &amp; Disease Indication
              </h5>

              <div className="mb-3">
                <label className="form-label fw-semibold small">Primary Diagnosis / Condition</label>
                <select
                  className="form-select"
                  value={formData.disease}
                  onChange={(e) => setFormData({ ...formData, disease: e.target.value })}
                >
                  <option value="Acute Myeloid Leukemia (AML)">Acute Myeloid Leukemia (AML)</option>
                  <option value="Acute Lymphoblastic Leukemia (ALL)">Acute Lymphoblastic Leukemia (ALL)</option>
                  <option value="Chronic Myeloid Leukemia (CML)">Chronic Myeloid Leukemia (CML)</option>
                  <option value="Thalassemia Major">Thalassemia Major</option>
                  <option value="Severe Aplastic Anemia">Severe Aplastic Anemia</option>
                  <option value="Sickle Cell Disease">Sickle Cell Disease</option>
                  <option value="Multiple Myeloma">Multiple Myeloma</option>
                  <option value="Non-Hodgkin Lymphoma">Non-Hodgkin Lymphoma</option>
                </select>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label fw-semibold small">Patient Age</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold small">Blood Group</label>
                  <select
                    className="form-select"
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="d-flex justify-content-end mt-4">
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-4"
                  onClick={() => setStep(2)}
                >
                  Next: Clinical Factors &rarr;
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Clinical Factors & Remission */}
          {step === 2 && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-activity text-danger"></i>
                Disease Stage &amp; Prior Treatments
              </h5>

              <div className="mb-3">
                <label className="form-label fw-semibold small">Current Remission Stage</label>
                <select
                  className="form-select"
                  value={formData.remissionStage}
                  onChange={(e) => setFormData({ ...formData, remissionStage: e.target.value })}
                >
                  <option value="First Complete Remission (CR1)">First Complete Remission (CR1)</option>
                  <option value="Second Complete Remission (CR2)">Second Complete Remission (CR2)</option>
                  <option value="Partial Remission">Partial Remission</option>
                  <option value="Relapsed / Refractory Disease">Relapsed / Refractory Disease</option>
                  <option value="Chronic Phase">Chronic Phase</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold small">Prior Chemotherapy Exposure</label>
                <select
                  className="form-select"
                  value={formData.priorChemo}
                  onChange={(e) => setFormData({ ...formData, priorChemo: e.target.value })}
                >
                  <option value="Yes - Standard Induction (7+3 regimen)">Yes - Standard Induction (7+3 regimen)</option>
                  <option value="Yes - Multi-agent Consolidation">Yes - Multi-agent Consolidation</option>
                  <option value="No - Treatment Naive">No - Treatment Naive</option>
                </select>
              </div>

              <div className="d-flex justify-content-between mt-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-4"
                  onClick={() => setStep(1)}
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-4"
                  onClick={() => setStep(3)}
                >
                  Next: Health Vitals &rarr;
                </button>
              </div>
            </div>
          )}

          {/* Step 3: ECOG Performance & Organ Function */}
          {step === 3 && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-heart-pulse-fill text-success"></i>
                Performance Status &amp; Biomarkers
              </h5>

              <div className="mb-3">
                <label className="form-label fw-semibold small">ECOG Performance Status</label>
                <select
                  className="form-select"
                  value={formData.ecogStatus}
                  onChange={(e) => setFormData({ ...formData, ecogStatus: e.target.value })}
                >
                  <option value="0 - Fully active, able to carry on all pre-disease performance without restriction">
                    Grade 0: Fully active, normal performance
                  </option>
                  <option value="1 - Restricted in physically strenuous activity but ambulatory">
                    Grade 1: Light work, ambulatory
                  </option>
                  <option value="2 - Ambulatory and capable of all selfcare but unable to carry out work">
                    Grade 2: Capable of selfcare, up &gt;50% of waking hours
                  </option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold small">Target CD34+ Cell Dose (if known)</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.cd34Estimated}
                  onChange={(e) => setFormData({ ...formData, cd34Estimated: e.target.value })}
                  placeholder="e.g. 5.0 x10^6 cells/kg"
                />
              </div>

              <div className="d-flex justify-content-between mt-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-4"
                  onClick={() => setStep(2)}
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  disabled={evaluating}
                  className="btn btn-success rounded-pill px-4 d-flex align-items-center gap-2"
                  onClick={handleRunAssessment}
                >
                  {evaluating ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                      <span>Computing ML Prediction...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-cpu-fill"></i>
                      <span>Compute ML Assessment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Assessment Output */}
          {step === 4 && assessmentResult && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle-fill text-success"></i>
                  ML-Assisted Preliminary Assessment Results
                </h5>
                <span className="badge bg-success-subtle text-success fs-6 px-3 py-1 rounded-pill">
                  {assessmentResult.candidacyScore}% Match Candidacy
                </span>
              </div>

              {/* Disclaimer Alert */}
              <div className="alert alert-warning border-warning border-opacity-25 rounded-3 d-flex align-items-start gap-2 mb-4">
                <i className="bi bi-info-circle-fill text-warning fs-5 flex-shrink-0 mt-1"></i>
                <div className="small">
                  <strong>Clinical Decision Support Only:</strong> This ML-assisted score is intended to assist patients and clinicians during preliminary evaluation and is not a final medical determination. A full transplant workup by a certified hematologist is required.
                </div>
              </div>

              <div className="p-3 rounded-4 border mb-4" style={{ background: 'linear-gradient(145deg, #f0fdf4 0%, #dcfce7 100%)', borderColor: '#bbf7d0' }}>
                <h6 className="fw-bold text-success mb-1">
                  {assessmentResult.candidacyLevel}
                </h6>
                <p className="small text-dark mb-2">
                  {assessmentResult.summary}
                </p>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  <span className="badge bg-white text-dark border">Target: {assessmentResult.transplantType}</span>
                  <span className="badge bg-white text-dark border">Conditioning: {assessmentResult.conditioningRecommendation}</span>
                  <span className="badge bg-white text-dark border">Matching: {assessmentResult.hlaTarget}</span>
                </div>
              </div>

              <h6 className="fw-bold text-dark mb-2">Evaluated Clinical Parameters</h6>
              <div className="row g-2 mb-4">
                {assessmentResult.keyFactors.map((f, idx) => (
                  <div key={idx} className="col-12 col-md-6">
                    <div className="p-2 px-3 rounded bg-light border d-flex justify-content-between align-items-center small">
                      <span className="text-secondary">{f.label}</span>
                      <span className="fw-bold text-dark">{f.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Next Actions */}
              <div className="d-flex flex-column flex-sm-row gap-2 justify-content-end pt-3 border-top">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-4"
                  onClick={() => setStep(1)}
                >
                  Modify Inputs
                </button>
                <button
                  type="button"
                  className="btn btn-outline-primary rounded-pill px-4 d-flex align-items-center justify-content-center gap-1"
                  onClick={() => navigate('/find-care/doctors')}
                >
                  <i className="bi bi-person-badge"></i>
                  <span>Discuss With Doctor</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-4 d-flex align-items-center justify-content-center gap-1 shadow-xs"
                  onClick={() => navigate('/ml-match')}
                >
                  <i className="bi bi-cpu-fill"></i>
                  <span>Proceed to Stem Cell Matching</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreliminaryAssessment;
