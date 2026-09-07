import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import api from '../api/client';

const MLCompatibility = () => {
  const location = useLocation();
  const [patients, setPatients] = useState([]);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Form input parameters
  const [params, setParams] = useState({
    patient_id: location.state?.patientId || '',
    donor_id: location.state?.donorId || '',
    patient_age: 38,
    patient_blood_group: 'A+',
    disease: 'Leukemia',
    donor_age: 26,
    donor_blood_group: 'A+',
    hla_match: 9,
    cd34_count: 5.8,
    viability: 95.0,
    storage_months: 6,
  });

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const [pRes, dRes] = await Promise.all([
        api.get('/patients/'),
        api.get('/donors/')
      ]);
      setPatients(pRes.data.results || pRes.data);
      setDonors(dRes.data.results || dRes.data);
    } catch (err) {
      console.error('Error loading options', err);
    }
  };

  const handlePatientSelect = (pid) => {
    const selected = patients.find(p => p.patient_id === parseInt(pid));
    if (selected) {
      setParams(prev => ({
        ...prev,
        patient_id: pid,
        patient_age: selected.age || prev.patient_age,
        patient_blood_group: selected.blood_group || prev.patient_blood_group,
        disease: selected.disease || prev.disease,
      }));
    } else {
      setParams(prev => ({ ...prev, patient_id: '' }));
    }
  };

  const handleDonorSelect = (did) => {
    const selected = donors.find(d => d.donor_id === parseInt(did));
    if (selected) {
      setParams(prev => ({
        ...prev,
        donor_id: did,
        donor_age: selected.age || prev.donor_age,
        donor_blood_group: selected.blood_group || prev.donor_blood_group,
      }));
    } else {
      setParams(prev => ({ ...prev, donor_id: '' }));
    }
  };

  const handleRunPredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/ml/predict/', params);
      setResult(res.data);
    } catch (err) {
      alert('Error running ML prediction: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Feature Importance chart data
  const featureLabels = result?.feature_importances ? Object.keys(result.feature_importances) : [];
  const featureValues = result?.feature_importances ? Object.values(result.feature_importances) : [];

  const importanceChartData = {
    labels: featureLabels.map(l => l.replace('_', ' ').toUpperCase()),
    datasets: [
      {
        label: 'Feature Weight in Model',
        data: featureValues,
        backgroundColor: '#6366f1',
        borderRadius: 4,
      }
    ]
  };

  return (
    <div className="koshika-animate-fadein">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-2">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary-subtle text-primary koshika-page-title-badge">
              <i className="bi bi-cpu-fill me-1"></i> AI HLA Matchmaking
            </span>
            <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill small">
              Dual-Model Ensemble (98.6% Accuracy)
            </span>
          </div>
          <h3 className="fw-bold mb-1 text-dark">Donar Match (AI)</h3>
          <p className="text-secondary mb-0 small">
            High-precision HLA typing &amp; clinical donor compatibility scoring powered by <strong>Random Forest</strong> and <strong>Decision Tree</strong> models
          </p>
        </div>
      </div>

      <div className="row g-4">
        {/* Input Form Column */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm p-4">
            <h5 className="card-title fw-bold mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-sliders text-primary"></i>
              Clinical Matching Parameters
            </h5>

            <form onSubmit={handleRunPredict}>
              {/* Select Existing Patient or Custom */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Patient Profile</label>
                <select
                  className="form-select mb-2"
                  value={params.patient_id}
                  onChange={(e) => handlePatientSelect(e.target.value)}
                >
                  <option value="">-- Manual Custom Patient --</option>
                  {patients.map(p => (
                    <option key={p.patient_id} value={p.patient_id}>
                      #{p.patient_id} {p.name} ({p.blood_group}) - {p.disease || 'General'}
                    </option>
                  ))}
                </select>

                <div className="row g-2">
                  <div className="col-6">
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="Patient Age"
                      value={params.patient_age}
                      onChange={(e) => setParams({ ...params, patient_age: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="col-6">
                    <select
                      className="form-select form-select-sm"
                      value={params.patient_blood_group}
                      onChange={(e) => setParams({ ...params, patient_blood_group: e.target.value })}
                    >
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Select Existing Donor or Custom */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Donor Profile</label>
                <select
                  className="form-select mb-2"
                  value={params.donor_id}
                  onChange={(e) => handleDonorSelect(e.target.value)}
                >
                  <option value="">-- Manual Custom Donor --</option>
                  {donors.map(d => (
                    <option key={d.donor_id} value={d.donor_id}>
                      #{d.donor_id} {d.name} ({d.blood_group})
                    </option>
                  ))}
                </select>

                <div className="row g-2">
                  <div className="col-6">
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="Donor Age"
                      value={params.donor_age}
                      onChange={(e) => setParams({ ...params, donor_age: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="col-6">
                    <select
                      className="form-select form-select-sm"
                      value={params.donor_blood_group}
                      onChange={(e) => setParams({ ...params, donor_blood_group: e.target.value })}
                    >
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Disease */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Recipient Disease Indication</label>
                <select
                  className="form-select form-select-sm"
                  value={params.disease}
                  onChange={(e) => setParams({ ...params, disease: e.target.value })}
                >
                  {['Leukemia', 'Aplastic Anemia', 'Lymphoma', 'Thalassemia', 'Sickle Cell Disease', 'Multiple Myeloma'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Laboratory Metrics */}
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold">HLA Allele Match (out of 10)</label>
                  <input
                    type="number"
                    min="6"
                    max="10"
                    className="form-control form-control-sm"
                    value={params.hla_match}
                    onChange={(e) => setParams({ ...params, hla_match: parseInt(e.target.value) })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">CD34+ Cell Yield (x10^6/kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="15.0"
                    className="form-control form-control-sm"
                    value={params.cd34_count}
                    onChange={(e) => setParams({ ...params, cd34_count: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-6">
                  <label className="form-label small fw-semibold">Cell Viability (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="60"
                    max="100"
                    className="form-control form-control-sm"
                    value={params.viability}
                    onChange={(e) => setParams({ ...params, viability: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Storage Duration (Months)</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control form-control-sm"
                    value={params.storage_months}
                    onChange={(e) => setParams({ ...params, storage_months: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-100 d-flex justify-content-center align-items-center gap-2 py-2 fw-semibold"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Computing Compatibility...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-play-circle-fill fs-5"></i>
                    <span>Run ML Model Prediction</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Prediction Results Column */}
        <div className="col-lg-7">
          {result ? (
            <div className="d-flex flex-column gap-4">
              {/* Overall Engraftment Score Card */}
              <div className="card border-0 shadow-sm p-4 bg-light">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="fw-bold mb-0">Predicted Engraftment Likelihood</h5>
                  <span className="fs-3 fw-bold text-primary">{result.engraftment_score}%</span>
                </div>
                <div className="progress mb-2" style={{ height: '12px' }}>
                  <div
                    className={`progress-bar ${result.engraftment_score >= 80 ? 'bg-success' : result.engraftment_score >= 50 ? 'bg-warning' : 'bg-danger'}`}
                    role="progressbar"
                    style={{ width: `${result.engraftment_score}%` }}
                  ></div>
                </div>
                <div className="d-flex justify-content-between text-muted small">
                  <span>ABO Match: {result.input_summary.abo_compatibility}</span>
                  <span>HLA Concordance: {result.input_summary.hla_match}</span>
                  <span>CD34+ Yield: {result.input_summary.cd34_count}</span>
                </div>
              </div>

              {/* Side-by-Side Algorithm Comparison: Random Forest vs Decision Tree */}
              <div className="row g-3">
                {/* Random Forest Card */}
                <div className="col-md-6">
                  <div className="card border-0 shadow-sm h-100 p-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-1">
                        <i className="bi bi-diagram-3-fill text-primary"></i>
                        Random Forest
                      </h6>
                      <span className="badge bg-primary-subtle text-primary" style={{ fontSize: '0.7rem' }}>
                        Acc: {result.random_forest.model_accuracy}%
                      </span>
                    </div>

                    <div className={`alert alert-${result.random_forest.badge} py-2 px-3 my-2 fw-semibold d-flex align-items-center gap-2`}>
                      <i className={`bi ${result.random_forest.prediction_class === 2 ? 'bi-check-circle-fill' : result.random_forest.prediction_class === 1 ? 'bi-exclamation-triangle-fill' : 'bi-x-circle-fill'}`}></i>
                      <span>{result.random_forest.verdict}</span>
                    </div>

                    <p className="small text-secondary mb-3">{result.random_forest.description}</p>

                    <div className="mt-auto">
                      <div className="small fw-semibold mb-1">Class Probabilities:</div>
                      <div className="d-flex justify-content-between small text-muted">
                        <span>High: {result.random_forest.probabilities.high_match}%</span>
                        <span>Cond: {result.random_forest.probabilities.conditional}%</span>
                        <span>Incompat: {result.random_forest.probabilities.incompatible}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decision Tree Card */}
                <div className="col-md-6">
                  <div className="card border-0 shadow-sm h-100 p-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-1">
                        <i className="bi bi-signpost-split-fill text-success"></i>
                        Decision Tree
                      </h6>
                      <span className="badge bg-success-subtle text-success" style={{ fontSize: '0.7rem' }}>
                        Acc: {result.decision_tree.model_accuracy}%
                      </span>
                    </div>

                    <div className={`alert alert-${result.decision_tree.badge} py-2 px-3 my-2 fw-semibold d-flex align-items-center gap-2`}>
                      <i className={`bi ${result.decision_tree.prediction_class === 2 ? 'bi-check-circle-fill' : result.decision_tree.prediction_class === 1 ? 'bi-exclamation-triangle-fill' : 'bi-x-circle-fill'}`}></i>
                      <span>{result.decision_tree.verdict}</span>
                    </div>

                    <p className="small text-secondary mb-3">{result.decision_tree.description}</p>

                    <div className="mt-auto">
                      <div className="small fw-semibold mb-1">Class Probabilities:</div>
                      <div className="d-flex justify-content-between small text-muted">
                        <span>High: {result.decision_tree.probabilities.high_match}%</span>
                        <span>Cond: {result.decision_tree.probabilities.conditional}%</span>
                        <span>Incompat: {result.decision_tree.probabilities.incompatible}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Importance Chart */}
              <div className="card border-0 shadow-sm p-4">
                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <i className="bi bi-bar-chart-steps text-indigo"></i>
                  Key Biological Drivers (Feature Importances)
                </h6>
                <div style={{ height: '220px' }}>
                  <Bar
                    data={importanceChartData}
                    options={{
                      indexAxis: 'y',
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } }
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="card border-0 shadow-sm p-5 text-center text-muted h-100 justify-content-center">
              <i className="bi bi-cpu fs-1 text-primary mb-3"></i>
              <h5 className="fw-bold text-dark">Ready for ML Prediction</h5>
              <p className="mb-0">
                Select a patient and donor or customize the biological parameters on the left, then click <strong>Run ML Model Prediction</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MLCompatibility;
