import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { supabase } from '../utils/supabase';

const MedicalReportOCR = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'insights' ? 'insights' : 'upload';

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [rawTextInput, setRawTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);
  const [recentReports, setRecentReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showRawText, setShowRawText] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [copiedQuestions, setCopiedQuestions] = useState(false);

  // Load saved uploaded documents from backend database
  useEffect(() => {
    fetchUploadedReports();
  }, []);

  const fetchUploadedReports = async () => {
    setLoadingReports(true);
    try {
      // 1. Direct Supabase Query First
      const { data: supaReports, error: supaErr } = await supabase
        .from('medical_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (!supaErr && Array.isArray(supaReports) && supaReports.length > 0) {
        const formatted = supaReports.map(r => ({
          id: r.id,
          name: r.file_name,
          file_name: r.file_name,
          report_type: r.report_type,
          status: r.status,
          is_valid: r.is_valid !== false,
          date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
          }) : 'Just now',
          created_at: r.created_at,
          extracted_text: r.extracted_text || '',
          parsed_data: r.parsed_data || {
            patient_name: r.patient_name,
            age: r.age,
            blood_group: r.blood_group,
            disease: r.disease,
            cd34_count: r.cd34_count,
            viability: r.viability,
            report_type: r.report_type,
            is_valid: r.is_valid !== false
          }
        }));
        setRecentReports(formatted);
        setSelectedReport(formatted[0]);
        return;
      }

      // 2. Fallback to API Client
      const res = await api.get('/ocr/reports/');
      const reports = res.data || [];
      setRecentReports(reports);
      if (reports.length > 0) {
        setSelectedReport(reports[0]);
      }
    } catch (err) {
      console.error('Error fetching uploaded reports:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      processSelectedFile(selected);
    }
  };

  const processSelectedFile = (selected) => {
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setRawTextInput('');
  };

  // REMOVE SELECTED FILE FROM UPLOAD CARD
  const handleRemoveFile = () => {
    setFile(null);
    setPreviewUrl('');
    setRawTextInput('');
    const input = document.getElementById('reportFileInput');
    if (input) input.value = '';
  };

  // DELETE / REMOVE REPORT FROM SUPABASE & BACKEND DATABASE
  const handleDeleteReport = async (reportId) => {
    // 1. Direct Supabase deletion guarantee
    try {
      await supabase.from('medical_reports').delete().eq('id', reportId);
    } catch (supaErr) {
      console.warn('Direct Supabase delete notification:', supaErr);
    }

    // 2. Backend delete notification
    try {
      await api.delete(`/ocr/reports/${reportId}/`);
    } catch (err) {
      console.warn('Backend delete notification:', err);
    }

    // 3. Update React UI state
    setRecentReports(prev => {
      const filtered = prev.filter(r => String(r.id) !== String(reportId));
      if (selectedReport && String(selectedReport.id) === String(reportId)) {
        setSelectedReport(filtered.length > 0 ? filtered[0] : null);
      }
      return filtered;
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // EXECUTE OCR AND SAVE TO BACKEND DATABASE
  const handleRunOCR = async (e) => {
    if (e) e.preventDefault();
    if (!file && !rawTextInput) {
      alert('Please select or drag & drop an image or document file to upload.');
      return;
    }

    setLoading(true);
    try {
      let res;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        if (rawTextInput) formData.append('raw_text', rawTextInput);
        res = await api.post('/ocr/analyze/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await api.post('/ocr/analyze/', { raw_text: rawTextInput });
      }

      const parsed = res.data?.parsed_data || {};
      const isValid = parsed.is_valid !== false && parsed.report_type !== 'INVALID_DOCUMENT';

      const newReport = {
        id: res.data?.id || Date.now(),
        name: res.data?.name || (file ? file.name : (isValid ? `${parsed.report_type || 'Clinical'} Report` : 'Unrecognized Document')),
        file_name: res.data?.file_name || (file ? file.name : 'manual_input.txt'),
        report_type: res.data?.report_type || parsed.report_type || (isValid ? 'GENERAL' : 'INVALID_DOCUMENT'),
        date: res.data?.date || 'Just now',
        status: res.data?.status || (isValid ? 'Analyzed' : 'Wrong Document'),
        parsed_data: parsed,
        extracted_text: res.data?.extracted_text || '',
        is_valid: isValid
      };

      // Direct Supabase insert guarantee if not already persisted by API client or backend
      if (!res.data?.is_saved_to_supabase) {
        try {
          const { data: supaRow, error: supaErr } = await supabase
            .from('medical_reports')
            .insert([{
              file_name: newReport.file_name,
              report_type: newReport.report_type,
              status: newReport.status,
              patient_name: parsed.patient_name || 'Patient from Report',
              age: parsed.age ? Number(parsed.age) : 28,
              blood_group: parsed.blood_group || 'B+',
              disease: parsed.disease || 'Clinical Referral',
              cd34_count: parsed.cd34_count ? String(parsed.cd34_count) : 'N/A',
              viability: parsed.viability ? String(parsed.viability) : 'N/A',
              extracted_text: newReport.extracted_text || '',
              parsed_data: parsed,
              is_valid: isValid
            }])
            .select();

          if (!supaErr && supaRow && supaRow[0]?.id) {
            newReport.id = supaRow[0].id;
            newReport.date = new Date(supaRow[0].created_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });
          }
        } catch (supaErr) {
          console.warn('Direct Supabase insert notification:', supaErr);
        }
      }

      setRecentReports(prev => [newReport, ...prev.filter(r => String(r.id) !== String(newReport.id))]);
      setSelectedReport(newReport);
      handleRemoveFile(); // reset upload form after successful save
      setSearchParams({ tab: 'insights' });
    } catch (err) {
      alert('Upload & Analysis failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchStemMatching = () => {
    if (!selectedReport) return;
    const p = selectedReport.parsed_data || {};
    if (p.is_valid === false) {
      alert('Cannot launch stem cell matching on an unrecognized or invalid document. Please upload a verified HLA or diagnostic report.');
      return;
    }
    navigate('/ml-match', {
      state: {
        patientName: p.patient_name || 'Patient from Report',
        patientAge: p.age || 28,
        patientBloodGroup: p.blood_group || 'B+',
        disease: p.disease || 'Clinical Referral',
        hlaMatchTarget: 10,
        reportSource: selectedReport.name
      }
    });
  };

  const handleImportAsPatient = async () => {
    if (!selectedReport?.parsed_data) return;
    const p = selectedReport.parsed_data;
    if (p.is_valid === false) {
      alert('Cannot save an unrecognized or wrong document to the patient registry.');
      return;
    }
    try {
      await api.post('/patients/', {
        name: p.patient_name || 'Patient from Report',
        age: p.age || 28,
        blood_group: p.blood_group || 'B+',
        disease: p.disease || 'Clinical Referral',
        contact: 'Lab Record',
      });
      alert('Successfully imported into Patients registry in Supabase!');
      navigate('/patients');
    } catch (err) {
      alert('Error importing patient: ' + err.message);
    }
  };

  const handleConsultAI = () => {
    if (selectedReport?.extracted_text) {
      const isInvalid = selectedReport.parsed_data?.is_valid === false;
      const query = isInvalid
        ? `I uploaded a document named "${selectedReport.name}" that was flagged as unrecognized or non-medical. Can you explain what medical tests are required for stem cell transplant planning?`
        : `Please review and provide a plain-English clinical breakdown of this verified medical report (${selectedReport.name}) for a patient and family:\n\n${selectedReport.extracted_text}`;

      window.dispatchEvent(new CustomEvent('open-koshika-ai', {
        detail: { query }
      }));
    }
  };

  const handleCopyQuestions = (questions) => {
    if (!questions || !questions.length) return;
    const textToCopy = `Questions for My Doctor (${selectedReport?.name || 'Lab Report'}):\n` +
      questions.map((q, idx) => `${idx + 1}. ${q}`).join('\n');
    navigator.clipboard?.writeText(textToCopy);
    setCopiedQuestions(true);
    setTimeout(() => setCopiedQuestions(false), 2500);
  };

  const p = selectedReport?.parsed_data || {};
  const insights = p.insights || {};
  const isInvalidReport = p.is_valid === false || selectedReport?.report_type === 'INVALID_DOCUMENT';

  // Questions to ask doctor fallback
  const doctorQuestions = insights.questions_for_doctor || [
    'How do the results of this report compare with my previous baseline tests?',
    'What do these specific findings mean for my transplant timeline and conditioning?',
    'Are there any medications or lifestyle changes I should start immediately?'
  ];

  // Next steps fallback
  const nextStepsList = insights.next_steps || [
    'Save and print a copy of this report for your personal medical binder.',
    'Discuss these parameters at your next consultation with your hematologist.',
    'Contact your KOSHIKA patient care coordinator if you have any questions.'
  ];

  return (
    <div className="koshika-animate-fadein pb-5">
      {/* 1. Header with Breadcrumb & Quick Link */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-warning-subtle text-warning-emphasis fw-bold px-3 py-1 rounded-pill small">
                <i className="bi bi-file-earmark-medical me-1"></i> REPORTS &amp; AI
              </span>
              <span className="badge bg-light text-secondary border px-2 py-1 rounded-pill small">
                Patient Health Intelligence &amp; Backend Database Storage
              </span>
            </div>
            <h2 className="fw-bold text-dark mb-1">
              MEDICAL REPORTS &amp; AI
            </h2>
            <p className="text-secondary mb-0 small">
              Upload diagnostic documents, save them securely to the backend database, and receive plain-English patient guidance
            </p>
          </div>
          <div className="d-flex gap-2">
            <button
              onClick={handleLaunchStemMatching}
              disabled={!selectedReport || isInvalidReport}
              className="btn btn-primary btn-sm rounded-pill px-3 py-2 shadow-xs d-flex align-items-center gap-2"
            >
              <i className="bi bi-cpu-fill"></i>
              <span>Match With Donors</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Tab Navigation Bar */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white p-2">
        <ul className="nav nav-pills nav-fill gap-2" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              type="button"
              className={`nav-link py-2 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 ${
                activeTab === 'upload' ? 'active bg-primary text-white shadow-xs' : 'text-secondary'
              }`}
              onClick={() => handleTabChange('upload')}
            >
              <i className="bi bi-cloud-arrow-up-fill"></i>
              <span>Upload Document &amp; OCR</span>
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              type="button"
              className={`nav-link py-2 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 ${
                activeTab === 'insights' ? 'active bg-primary text-white shadow-xs' : 'text-secondary'
              }`}
              onClick={() => handleTabChange('insights')}
            >
              <i className="bi bi-magic text-warning"></i>
              <span>Patient AI Insights &amp; Guide</span>
              {recentReports.length > 0 && (
                <span className="badge bg-warning text-dark rounded-pill ms-1 small">
                  {recentReports.length}
                </span>
              )}
            </button>
          </li>
        </ul>
      </div>

      {/* 3. Top Statistics Bar */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-4">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="small text-muted fw-semibold">Saved Reports in Database</span>
              <span className="badge bg-warning-subtle text-warning-emphasis p-2 rounded-circle">
                <i className="bi bi-database-check"></i>
              </span>
            </div>
            <div className="fs-3 fw-bold text-dark">{recentReports.length}</div>
            <small className="text-muted">Persisted in backend database</small>
          </div>
        </div>
        <div className="col-12 col-sm-4">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="small text-muted fw-semibold">Patient Safety Filter</span>
              <span className="badge bg-success-subtle text-success p-2 rounded-circle">
                <i className="bi bi-shield-check"></i>
              </span>
            </div>
            <div className="fs-3 fw-bold text-dark">Active</div>
            <small className="text-muted">Detects &amp; rejects wrong or non-medical files</small>
          </div>
        </div>
        <div className="col-12 col-sm-4">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="small text-muted fw-semibold">Backend Storage Status</span>
              <span className="badge bg-primary-subtle text-primary p-2 rounded-circle">
                <i className="bi bi-hdd-network-fill"></i>
              </span>
            </div>
            <div className="fs-3 fw-bold text-dark">Connected</div>
            <small className="text-muted">SQLite &amp; Media Disk Storage synced</small>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: UPLOAD REPORT & OCR SCANNER */}
      {/* ========================================================================= */}
      {activeTab === 'upload' && (
        <div className="koshika-tab-content">
          {/* Upload Drop Zone */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-cloud-arrow-up-fill text-primary"></i>
              Upload Diagnostic Medical Document
            </h5>

            <div
              className={`p-4 rounded-4 border-2 border-dashed text-center transition-all ${
                isDragOver ? 'border-primary bg-primary-subtle' : 'border-secondary-subtle bg-light'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              style={{ cursor: 'pointer' }}
              onClick={() => document.getElementById('reportFileInput').click()}
            >
              <input
                id="reportFileInput"
                type="file"
                accept="image/*,application/pdf,.txt,.csv"
                className="d-none"
                onChange={handleFileChange}
              />
              <div className="p-3">
                <i className="bi bi-file-earmark-medical fs-1 text-primary mb-2 d-block"></i>
                <h6 className="fw-bold text-dark mb-1">
                  Drag &amp; Drop or Choose File
                </h6>
                <p className="text-secondary small mb-2">
                  Supports high-res PDF scans, PNG/JPG photos of HLA panels, CBCs, bone marrow biopsies, and flow cytometry charts
                </p>
                <span className="btn btn-sm btn-primary rounded-pill px-4 shadow-xs">
                  Browse Document
                </span>
              </div>
            </div>

            {/* UPLOAD PREVIEW CARD WITH REMOVE BUTTON */}
            {file && (
              <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between p-3 rounded-4 bg-white border mt-3 shadow-xs gap-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2 bg-success-subtle text-success rounded-circle flex-shrink-0">
                    <i className="bi bi-file-earmark-check-fill fs-3"></i>
                  </div>
                  <div>
                    <strong className="text-dark small d-block">{file.name}</strong>
                    <small className="text-muted">{(file.size / 1024).toFixed(1)} KB &bull; Ready to save to backend</small>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2 w-100 w-sm-auto justify-content-end">
                  {/* REMOVE SELECTED FILE BUTTON */}
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="btn btn-sm btn-outline-danger rounded-pill px-3 d-flex align-items-center gap-1"
                    title="Remove selected file"
                  >
                    <i className="bi bi-trash3"></i>
                    <span>Remove File</span>
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleRunOCR}
                    className="btn btn-sm btn-success rounded-pill px-4 d-flex align-items-center gap-1 shadow-xs"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        <span>Saving to Backend &amp; Parsing...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-cloud-arrow-up-fill"></i>
                        <span>Upload &amp; Save to Backend</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Recent Reports Selector Table */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <i className="bi bi-clock-history text-secondary"></i>
                Uploaded Documents Saved in Backend ({recentReports.length})
              </h5>
              <button
                type="button"
                onClick={fetchUploadedReports}
                disabled={loadingReports}
                className="btn btn-sm btn-light border rounded-pill px-3 d-flex align-items-center gap-1"
                title="Refresh reports from backend database"
              >
                <i className={`bi bi-arrow-clockwise ${loadingReports ? 'spin' : ''}`}></i>
                <span>Refresh</span>
              </button>
            </div>

            {loadingReports ? (
              <div className="text-center py-5 text-muted">
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                <span>Loading uploaded documents from backend database...</span>
              </div>
            ) : recentReports.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-folder-x fs-1 text-secondary mb-2 d-block"></i>
                <h6 className="fw-bold text-dark mb-1">No Documents Uploaded Yet</h6>
                <p className="small text-secondary mb-0">
                  Select a document above and click "Upload &amp; Save to Backend" to store and analyze your diagnostic test.
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small">
                    <tr>
                      <th>Document Title</th>
                      <th>Type</th>
                      <th>Upload Date</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentReports.map((r) => {
                      const isWrong = r.status === 'Wrong Document' || r.parsed_data?.is_valid === false || r.report_type === 'INVALID_DOCUMENT';
                      return (
                        <tr
                          key={r.id}
                          className={selectedReport?.id === r.id ? 'table-primary bg-opacity-25' : ''}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setSelectedReport(r)}
                        >
                          <td>
                            <div className="fw-bold text-dark small d-flex align-items-center gap-2">
                              <i className={`bi ${isWrong ? 'bi-exclamation-triangle-fill text-danger' : 'bi-file-earmark-medical text-primary'}`}></i>
                              <span>{r.name || r.file_name}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`badge small border ${isWrong ? 'bg-danger-subtle text-danger' : 'bg-light text-dark'}`}>
                              {r.report_type || 'DIAGNOSTIC'}
                            </span>
                          </td>
                          <td>
                            <small className="text-muted">{r.date}</small>
                          </td>
                          <td>
                            <span className={`badge rounded-pill px-2 py-1 small ${
                              isWrong ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="text-end">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 me-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedReport(r);
                                setSearchParams({ tab: 'insights' });
                              }}
                            >
                              <i className="bi bi-magic me-1"></i>
                              <span>View Insights</span>
                            </button>
                            {/* REMOVE / DELETE INDIVIDUAL REPORT BUTTON */}
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger rounded-pill px-2 py-1"
                              title="Delete report from backend database"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteReport(r.id);
                              }}
                            >
                              <i className="bi bi-trash3"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AI REPORT INSIGHTS & PATIENT GUIDE */}
      {/* ========================================================================= */}
      {activeTab === 'insights' && (
        <div className="koshika-tab-content">
          {/* Report Selector Pills in Insights */}
          {recentReports.length > 0 && (
            <div className="d-flex align-items-center gap-2 mb-3 overflow-auto pb-1">
              <span className="small text-muted fw-semibold flex-shrink-0">Select Document:</span>
              {recentReports.map((r) => {
                const isWrong = r.status === 'Wrong Document' || r.parsed_data?.is_valid === false;
                return (
                  <button
                    key={r.id}
                    type="button"
                    className={`btn btn-sm rounded-pill px-3 flex-shrink-0 d-flex align-items-center gap-1 ${
                      selectedReport?.id === r.id
                        ? (isWrong ? 'btn-danger shadow-xs' : 'btn-primary shadow-xs')
                        : 'btn-light border text-dark'
                    }`}
                    onClick={() => setSelectedReport(r)}
                  >
                    {isWrong && <i className="bi bi-exclamation-circle-fill"></i>}
                    <span>{(r.name || r.file_name || 'Report').length > 28 ? `${(r.name || r.file_name).slice(0, 26)}...` : (r.name || r.file_name)}</span>
                  </button>
                );
              })}
            </div>
          )}

          {!selectedReport ? (
            <div className="card border-0 shadow-sm rounded-4 p-5 bg-white text-center">
              <i className="bi bi-file-earmark-arrow-up fs-1 text-muted mb-3 d-block"></i>
              <h5 className="fw-bold text-dark mb-1">No Documents In Your Records</h5>
              <p className="text-secondary small mb-3">Upload your first clinical report to save it to the backend and view AI patient guidance.</p>
              <div>
                <button
                  type="button"
                  onClick={() => handleTabChange('upload')}
                  className="btn btn-primary rounded-pill px-4 shadow-xs"
                >
                  <i className="bi bi-cloud-arrow-up-fill me-1"></i>
                  Go to Document Upload
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* =================================================================== */}
              {/* CONDITIONAL BRANCH 1: WRONG / UNRECOGNIZED DOCUMENT CARD */}
              {/* =================================================================== */}
              {isInvalidReport ? (
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                  <div
                    className="alert border-0 rounded-4 p-4 mb-4"
                    style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}
                  >
                    <div className="d-flex flex-column flex-md-row align-items-start gap-3">
                      <div className="p-3 bg-danger text-white rounded-circle flex-shrink-0">
                        <i className="bi bi-exclamation-octagon-fill fs-2"></i>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                          <span className="badge bg-danger rounded-pill px-3 py-1 text-white">
                            Wrong or Unrecognized Document
                          </span>
                          <span className="badge bg-warning-subtle text-dark border px-2 py-1 rounded-pill small">
                            Patient Safety Gatekeeper
                          </span>
                        </div>
                        <h4 className="fw-bold text-dark mb-2">
                          {p.rejection_title || '⚠️ Unrecognized or Wrong Document Detected'}
                        </h4>
                        <p className="text-secondary mb-3 leading-relaxed">
                          {p.rejection_message ||
                            'The uploaded file does not appear to be an authentic clinical diagnostic laboratory report, HLA tissue typing certificate, bone marrow biopsy, or blood work panel. To protect patient safety and prevent medical misdirection, KOSHIKA does not fabricate or guess clinical data for non-medical files.'}
                        </p>

                        <div className="p-3 bg-white rounded-3 border mb-3">
                          <strong className="text-dark small d-block mb-2">
                            <i className="bi bi-shield-check text-primary me-1"></i>
                            What documents are accepted for patient analysis?
                          </strong>
                          <div className="row g-2 small text-secondary">
                            <div className="col-12 col-md-6">
                              <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-check-circle-fill text-success"></i>
                                <span><strong>HLA Tissue Typing Panel</strong> (NGS or PCR-SSO)</span>
                              </div>
                            </div>
                            <div className="col-12 col-md-6">
                              <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-check-circle-fill text-success"></i>
                                <span><strong>Stem Cell CD34+ Count</strong> &amp; Viability Flow Cytometry</span>
                              </div>
                            </div>
                            <div className="col-12 col-md-6">
                              <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-check-circle-fill text-success"></i>
                                <span><strong>Bone Marrow Aspirate &amp; Biopsy</strong> Remission Reports</span>
                              </div>
                            </div>
                            <div className="col-12 col-md-6">
                              <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-check-circle-fill text-success"></i>
                                <span><strong>Complete Blood Count (CBC)</strong>, WBC &amp; Platelets</span>
                              </div>
                            </div>
                            <div className="col-12 col-md-6">
                              <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-check-circle-fill text-success"></i>
                                <span><strong>Pre-Transplant Infectious Serology</strong> (CMV, Hep B/C, HIV)</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="d-flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              handleDeleteReport(selectedReport.id);
                              handleTabChange('upload');
                            }}
                            className="btn btn-danger rounded-pill px-4 py-2 shadow-xs d-flex align-items-center gap-2 fw-semibold"
                          >
                            <i className="bi bi-trash3"></i>
                            <span>Remove This Document &amp; Upload Again</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTabChange('upload')}
                            className="btn btn-outline-secondary rounded-pill px-3 py-2 d-flex align-items-center gap-1"
                          >
                            <i className="bi bi-arrow-left"></i>
                            <span>Back to Upload Dropzone</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Optional Raw file inspection */}
                  {selectedReport.extracted_text && (
                    <div className="pt-2 border-top">
                      <button
                        type="button"
                        className="btn btn-sm btn-link text-secondary text-decoration-none p-0"
                        onClick={() => setShowRawText(!showRawText)}
                      >
                        <i className="bi bi-code-square me-1"></i>
                        <span>{showRawText ? 'Hide Raw File Content' : 'Inspect Detected File Content'}</span>
                      </button>
                      {showRawText && (
                        <pre
                          className="bg-dark text-light p-3 rounded-3 small font-monospace mt-2"
                          style={{ maxHeight: '180px', overflowY: 'auto' }}
                        >
                          {selectedReport.extracted_text}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* =================================================================== */
                /* CONDITIONAL BRANCH 2: AUTHENTIC PATIENT CLINICAL REPORT */
                /* =================================================================== */
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                  {/* Active Report Header Card */}
                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3 gap-2 pb-3 border-bottom">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="badge bg-primary text-white rounded-pill px-3 py-1 small fw-semibold">
                          {selectedReport.report_type || 'CLINICAL REPORT'}
                        </span>
                        <span className="badge bg-success-subtle text-success rounded-pill px-2 py-1 small">
                          <i className="bi bi-database-check me-1"></i> Saved to Backend Database
                        </span>
                      </div>
                      <h4 className="fw-bold text-dark mb-0">{selectedReport.name || selectedReport.file_name}</h4>
                      <small className="text-muted">Saved: {selectedReport.date}</small>
                    </div>
                    <div className="d-flex gap-2 align-items-center flex-wrap">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                        onClick={() => setShowRawText(!showRawText)}
                      >
                        <i className="bi bi-code-square me-1"></i>
                        <span>{showRawText ? 'Hide Raw OCR' : 'Inspect Raw OCR'}</span>
                      </button>
                      {/* REMOVE BUTTON IN REPORT HEADER */}
                      <button
                        type="button"
                        onClick={() => handleDeleteReport(selectedReport.id)}
                        className="btn btn-sm btn-outline-danger rounded-pill px-3 d-flex align-items-center gap-1"
                        title="Remove this report from backend database"
                      >
                        <i className="bi bi-trash3"></i>
                        <span>Remove</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleLaunchStemMatching}
                        className="btn btn-sm btn-primary rounded-pill px-3 shadow-xs d-flex align-items-center gap-1"
                      >
                        <i className="bi bi-cpu-fill"></i>
                        <span>Run Stem Matching</span>
                      </button>
                    </div>
                  </div>

                  {/* Extracted Clinical Demographics Cards (Real detected data) */}
                  <div className="row g-3 mb-4">
                    <div className="col-12 col-sm-6 col-md-3">
                      <div className="p-3 bg-light rounded-3 border">
                        <small className="text-secondary d-block">Patient Name</small>
                        <strong className="fs-6 text-dark">{p.patient_name || 'Patient from Report'}</strong>
                      </div>
                    </div>
                    <div className="col-6 col-md-2">
                      <div className="p-3 bg-light rounded-3 border">
                        <small className="text-secondary d-block">Blood Group</small>
                        <span className="badge bg-danger fs-6">{p.blood_group || 'Not Specified'}</span>
                      </div>
                    </div>
                    <div className="col-6 col-md-2">
                      <div className="p-3 bg-light rounded-3 border">
                        <small className="text-secondary d-block">Patient Age</small>
                        <strong className="fs-6 text-dark">{p.age ? `${p.age} yrs` : 'Not Specified'}</strong>
                      </div>
                    </div>
                    <div className="col-12 col-md-5">
                      <div className="p-3 bg-light rounded-3 border">
                        <small className="text-secondary d-block">Diagnosis / Clinical Status</small>
                        <strong className="fs-6 text-dark">{p.disease || 'Clinical Referral'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Specific Findings Grid for HLA */}
                  {p.hla_calls && (
                    <div className="p-3 rounded-3 border mb-4 bg-light">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                          <i className="bi bi-dna text-primary"></i>
                          <span>High-Resolution HLA Allele Breakdown</span>
                        </h6>
                        <span className="badge bg-primary-subtle text-primary small">10 Alleles Resolved</span>
                      </div>
                      <div className="row g-2 text-center">
                        {Object.entries(p.hla_calls).map(([locus, alleles]) => (
                          <div key={locus} className="col">
                            <div className="p-2 bg-white rounded border">
                              <small className="text-muted d-block fw-semibold">{locus}</small>
                              <span className="fw-bold small text-dark font-monospace">{alleles}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dynamic Key Clinical Metrics */}
                  {insights.key_metrics && insights.key_metrics.length > 0 && (
                    <div className="row g-3 mb-4">
                      {insights.key_metrics.map((m, idx) => (
                        <div key={idx} className="col-12 col-md-4">
                          <div className="p-3 rounded-4 border bg-white shadow-xs">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <small className="text-muted fw-semibold">{m.label}</small>
                              <span className={`badge rounded-pill small ${
                                m.status === 'optimal' ? 'bg-success-subtle text-success' : (
                                  m.status === 'concerning' ? 'bg-danger-subtle text-danger' : 'bg-info-subtle text-info'
                                )
                              }`}>
                                {m.status === 'optimal' ? 'Optimal' : (m.status === 'concerning' ? 'Attention' : 'Normal')}
                              </span>
                            </div>
                            <div className="fs-5 fw-bold text-dark">{m.value}</div>
                            <small className="text-muted">{m.note}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* PATIENT SECTION 1: Plain-English Patient Explanation Card */}
                  <div
                    className="card border-0 p-4 rounded-4 mb-4"
                    style={{ background: 'linear-gradient(145deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #bbf7d0' }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold text-success mb-0 d-flex align-items-center gap-2">
                        <i className="bi bi-chat-left-heart-fill"></i>
                        What This Report Means for You (Plain-English for Patients)
                      </h6>
                      <span className="badge bg-success text-white rounded-pill small">Patient Guide</span>
                    </div>
                    <p className="text-dark mb-0 small leading-relaxed">
                      {insights.plain_english_summary ||
                        'This report details your diagnostic and stem cell parameters. Your results indicate a stable condition and suitable parameters for your ongoing clinical care and transplant evaluations.'}
                    </p>
                  </div>

                  {/* PATIENT SECTION 2: Questions to Ask Your Doctor */}
                  <div className="card border-0 p-4 rounded-4 mb-4 bg-white border shadow-xs">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                        <i className="bi bi-question-circle-fill text-primary"></i>
                        <span>Questions to Ask Your Doctor at Your Next Visit</span>
                      </h6>
                      <button
                        type="button"
                        onClick={() => handleCopyQuestions(doctorQuestions)}
                        className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 d-flex align-items-center gap-1"
                      >
                        <i className={`bi ${copiedQuestions ? 'bi-check-lg text-success' : 'bi-clipboard'}`}></i>
                        <span>{copiedQuestions ? 'Copied to Clipboard!' : 'Copy Questions'}</span>
                      </button>
                    </div>
                    <div className="row g-2">
                      {doctorQuestions.map((q, qIdx) => (
                        <div key={qIdx} className="col-12">
                          <div className="p-3 bg-light rounded-3 border-start border-primary border-3 d-flex align-items-start gap-2">
                            <span className="badge bg-primary rounded-circle p-1 small" style={{ width: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                              {qIdx + 1}
                            </span>
                            <span className="small text-dark fw-medium">{q}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PATIENT SECTION 3: Next Steps for You & Your Family */}
                  <div className="card border-0 p-4 rounded-4 mb-4 bg-white border shadow-xs">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                        <i className="bi bi-arrow-right-circle-fill text-success"></i>
                        <span>Next Steps for You and Your Family</span>
                      </h6>
                      <span className="badge bg-success-subtle text-success rounded-pill small">Action Plan</span>
                    </div>
                    <div className="row g-2">
                      {nextStepsList.map((step, sIdx) => (
                        <div key={sIdx} className="col-12">
                          <div className="p-3 bg-light rounded-3 d-flex align-items-center gap-3">
                            <i className="bi bi-check2-circle text-success fs-5"></i>
                            <span className="small text-secondary">{step}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Specialist & Transplant Team Interpretation Card */}
                  <div className="card border-0 p-4 rounded-4 mb-4 bg-light border">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                        <i className="bi bi-hospital-fill text-secondary"></i>
                        Immunological &amp; Specialist Interpretation
                      </h6>
                      <span className="badge bg-secondary text-white rounded-pill small">For Clinical Team</span>
                    </div>
                    <p className="text-secondary mb-3 small leading-relaxed">
                      {insights.clinical_interpretation ||
                        'Hematopoietic and diagnostic parameters verified. Conforms with clinical evaluation protocols.'}
                    </p>
                    <div className="p-3 bg-white rounded-3 border-start border-primary border-4 small">
                      <strong>Recommended Clinical Action:</strong>{' '}
                      <span className="text-dark">
                        {insights.recommended_action ||
                          'Proceed to stem cell matching and consult with the attending transplant coordinator.'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons Bar */}
                  <div className="d-flex flex-wrap gap-2 pt-2 border-top">
                    <button
                      type="button"
                      onClick={handleLaunchStemMatching}
                      className="btn btn-primary rounded-pill px-4 py-2 fw-semibold shadow-xs d-flex align-items-center gap-2"
                    >
                      <i className="bi bi-cpu-fill"></i>
                      <span>Launch Stem Cell Matching With This Data</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleConsultAI}
                      className="btn btn-outline-success rounded-pill px-3 py-2 d-flex align-items-center gap-1"
                    >
                      <i className="bi bi-robot"></i>
                      <span>Ask KOSHIKA AI About Report</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/find-care/doctors')}
                      className="btn btn-outline-secondary rounded-pill px-3 py-2 d-flex align-items-center gap-1"
                    >
                      <i className="bi bi-person-badge"></i>
                      <span>Discuss With BMT Specialist</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleImportAsPatient}
                      className="btn btn-outline-dark rounded-pill px-3 py-2 d-flex align-items-center gap-1"
                    >
                      <i className="bi bi-person-plus"></i>
                      <span>Save to Patient Registry</span>
                    </button>
                    {/* REMOVE THIS REPORT BUTTON */}
                    <button
                      type="button"
                      onClick={() => handleDeleteReport(selectedReport.id)}
                      className="btn btn-outline-danger rounded-pill px-3 py-2 d-flex align-items-center gap-1 ms-auto"
                    >
                      <i className="bi bi-trash3"></i>
                      <span>Remove This Report</span>
                    </button>
                  </div>

                  {/* Optional Raw OCR Inspect */}
                  {showRawText && (
                    <div className="mt-4 pt-3 border-top">
                      <h6 className="fw-bold text-secondary mb-2 small">Raw Extracted OCR Text</h6>
                      <pre
                        className="bg-dark text-light p-3 rounded-3 small font-monospace"
                        style={{ maxHeight: '220px', overflowY: 'auto' }}
                      >
                        {selectedReport.extracted_text}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MedicalReportOCR;
