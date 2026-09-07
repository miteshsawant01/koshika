import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const MedicalReportOCR = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [rawTextInput, setRawTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [samples, setSamples] = useState([]);

  useEffect(() => {
    fetchSamples();
  }, []);

  const fetchSamples = async () => {
    try {
      const res = await api.get('/ocr/samples/');
      setSamples(res.data);
    } catch (err) {
      console.error('Error fetching OCR samples', err);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setRawTextInput('');
    }
  };

  const handleSampleSelect = (sample) => {
    setFile(null);
    setPreviewUrl('');
    setRawTextInput(sample.text);
  };

  const handleRunOCR = async (e) => {
    e.preventDefault();
    if (!file && !rawTextInput) {
      alert('Please select an image file or choose a sample report.');
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
      setOcrResult(res.data);
    } catch (err) {
      alert('OCR Analysis failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleImportAsPatient = async () => {
    if (!ocrResult?.parsed_data) return;
    const p = ocrResult.parsed_data;
    try {
      await api.post('/patients/', {
        name: p.patient_name || 'Patient from Report',
        age: p.age || 30,
        blood_group: p.blood_group || 'O+',
        disease: p.disease || 'Referral',
        contact: 'Lab Record',
      });
      alert('Successfully imported into Patients registry!');
      navigate('/patients');
    } catch (err) {
      alert('Error importing patient: ' + err.message);
    }
  };

  const handleImportAsDonor = async () => {
    if (!ocrResult?.parsed_data) return;
    const p = ocrResult.parsed_data;
    try {
      await api.post('/donors/', {
        name: p.patient_name || 'Donor from Report',
        age: p.age || 28,
        blood_group: p.blood_group || 'O+',
        donation_date: new Date().toISOString().split('T')[0],
        notes: `OCR Import: Viability ${p.viability || 'N/A'}%, CD34+ ${p.cd34_count || 'N/A'}`,
      });
      alert('Successfully imported into Donors registry!');
      navigate('/donors');
    } catch (err) {
      alert('Error importing donor: ' + err.message);
    }
  };

  const handleConsultAI = () => {
    if (ocrResult?.extracted_text) {
      navigate('/ai-assistant', { state: { initialQuery: `Please analyze this medical report:\n\n${ocrResult.extracted_text}` } });
    }
  };

  return (
    <div className="koshika-animate-fadein">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-2">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-warning-subtle text-warning-emphasis koshika-page-title-badge">
              <i className="bi bi-file-earmark-medical me-1"></i> Medical Intake
            </span>
            <span className="badge bg-light text-muted border rounded-pill small">
              Automated Diagnostic Extraction
            </span>
          </div>
          <h3 className="fw-bold mb-1 text-dark">Medical Lab Report </h3>
          <p className="text-secondary mb-0 small">
            High-accuracy OCR text extraction and clinical entity parsing for blood tests, biopsies, and HLA reports
          </p>
        </div>
      </div>

      <div className="row g-4">
        {/* Left: Upload & Input */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm p-4 mb-4">
            <h5 className="card-title fw-bold mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-upload text-primary"></i>
              Upload Medical Report
            </h5>

            <form onSubmit={handleRunOCR}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Report Document Scan (Image)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={handleFileChange}
                />
                <div className="form-text">Supports JPG, PNG, TIFF lab report scans.</div>
              </div>

              {previewUrl && (
                <div className="mb-3 text-center">
                  <img
                    src={previewUrl}
                    alt="Report Preview"
                    className="img-fluid rounded border shadow-sm"
                    style={{ maxHeight: '200px' }}
                  />
                </div>
              )}

              {/* Sample Quick Load */}
              <div className="mb-3">
                <label className="form-label fw-semibold d-flex justify-content-between">
                  <span>Or Test with Clinical Sample:</span>
                </label>
                <div className="d-flex flex-column gap-2">
                  {samples.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSampleSelect(s)}
                      className="btn btn-sm btn-outline-secondary text-start d-flex justify-content-between align-items-center"
                    >
                      <span><i className="bi bi-file-text me-2 text-primary"></i>{s.title}</span>
                      <i className="bi bi-arrow-right-short"></i>
                    </button>
                  ))}
                </div>
              </div>

              {rawTextInput && (
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Report Text to Process</label>
                  <textarea
                    rows="4"
                    className="form-control font-monospace small"
                    value={rawTextInput}
                    onChange={(e) => setRawTextInput(e.target.value)}
                  ></textarea>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-100 py-2 fw-semibold d-flex justify-content-center align-items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    <span>Extracting Text with Tesseract...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-eye-fill"></i>
                    <span>Execute Tesseract OCR</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Extracted Entities & Auto-Fill */}
        <div className="col-lg-7">
          {ocrResult ? (
            <div className="d-flex flex-column gap-4">
              {/* Parsed Medical Entities Card */}
              <div className="card border-0 shadow-sm p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0 text-success d-flex align-items-center gap-2">
                    <i className="bi bi-check-circle-fill"></i>
                    Auto-Parsed Clinical Entities
                  </h5>
                  <span className="badge bg-success-subtle text-success">Extraction Complete</span>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded">
                      <small className="text-secondary d-block">Identified Name</small>
                      <strong className="fs-6">{ocrResult.parsed_data.patient_name || 'Not detected'}</strong>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3 bg-light rounded">
                      <small className="text-secondary d-block">Blood Group</small>
                      <span className="badge bg-primary fs-6">{ocrResult.parsed_data.blood_group || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3 bg-light rounded">
                      <small className="text-secondary d-block">Age</small>
                      <strong className="fs-6">{ocrResult.parsed_data.age ? `${ocrResult.parsed_data.age} yrs` : 'N/A'}</strong>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded">
                      <small className="text-secondary d-block">Stem Cell CD34+ Count</small>
                      <strong className="fs-6 text-primary">
                        {ocrResult.parsed_data.cd34_count ? `${ocrResult.parsed_data.cd34_count} x10^6 cells/kg` : 'N/A'}
                      </strong>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded">
                      <small className="text-secondary d-block">Cell Viability</small>
                      <strong className="fs-6 text-success">
                        {ocrResult.parsed_data.viability ? `${ocrResult.parsed_data.viability}%` : 'N/A'}
                      </strong>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="p-3 bg-light rounded">
                      <small className="text-secondary d-block">Diagnosis / Indication</small>
                      <strong className="fs-6">{ocrResult.parsed_data.disease || 'General / Unspecified'}</strong>
                    </div>
                  </div>
                </div>

                {/* Quick Action Intake Buttons */}
                <div className="d-flex flex-wrap gap-2">
                  <button onClick={handleImportAsPatient} className="btn btn-outline-primary d-flex align-items-center gap-2">
                    <i className="bi bi-person-plus-fill"></i>
                    <span>Register as Patient</span>
                  </button>
                  <button onClick={handleImportAsDonor} className="btn btn-outline-success d-flex align-items-center gap-2">
                    <i className="bi bi-droplet-fill"></i>
                    <span>Register as Donor</span>
                  </button>
                  <button onClick={handleConsultAI} className="btn btn-outline-indigo d-flex align-items-center gap-2 badge-ai">
                    <i className="bi bi-robot"></i>
                    <span>Interpret with Gemini AI</span>
                  </button>
                </div>
              </div>

              {/* Raw Extracted Text Viewer */}
              <div className="card border-0 shadow-sm p-4">
                <h6 className="fw-bold mb-2">Raw OCR Text Output</h6>
                <pre className="bg-dark text-light p-3 rounded small" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  {ocrResult.extracted_text}
                </pre>
              </div>
            </div>
          ) : (
            <div className="card border-0 shadow-sm p-5 text-center text-muted h-100 justify-content-center">
              <i className="bi bi-file-earmark-text fs-1 text-primary mb-3"></i>
              <h5 className="fw-bold text-dark">No Report Scanned Yet</h5>
              <p className="mb-0">Upload a lab scan image or pick a clinical report sample on the left to extract metrics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalReportOCR;
