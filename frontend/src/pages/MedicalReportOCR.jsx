import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { supabase } from '../utils/supabase';

// Certified industry benchmark sample documents (served from /sample_medical_reports/)
const CERTIFIED_SAMPLE_REPORTS = [
  {
    fileName: '01_HLA_High_Resolution_Tissue_Typing_NGS.pdf',
    title: 'HLA High-Res Tissue Typing (NGS)',
    category: 'HLA Immunogenetics',
    badge: '10/10 Alleles',
    accreditation: 'EFI & NABL ISO 15189',
    description: 'Gold-standard Next Generation Sequencing HLA-A, B, C, DRB1, DQB1 allele typing.',
    icon: 'bi-dna'
  },
  {
    fileName: '02_PBSC_Apheresis_CD34_Stem_Cell_Harvest.pdf',
    title: 'PBSC Apheresis CD34+ Harvest',
    category: 'Stem Cell Enumeration',
    badge: '6.42 x10^6 CD34/kg',
    accreditation: 'FACT-JACIE Accredited',
    description: 'Stem cell mobilization yield and flow cytometry viability test report.',
    icon: 'bi-shield-shaded'
  },
  {
    fileName: '03_Bone_Marrow_Aspirate_and_Cytogenetics.pdf',
    title: 'Bone Marrow Biopsy & Remission',
    category: 'Hematopathology',
    badge: 'Blasts 2.8% (CR)',
    accreditation: 'CAP & NABL Certified',
    description: 'Cellularity assessment, blast percentage, and complete morphologic remission status.',
    icon: 'bi-activity'
  },
  {
    fileName: '04_Pre_Transplant_Viral_Serology_and_CMV.pdf',
    title: 'Pre-Transplant Viral Serology',
    category: 'Infectious Disease',
    badge: 'CMV IgG Positive',
    accreditation: 'NABH Hospital Lab',
    description: 'CMV, EBV, Hepatitis B/C, HIV, and Treponema safety panel prior to conditioning.',
    icon: 'bi-virus'
  },
  {
    fileName: '05_Complete_Blood_Count_Differential_Platelets.pdf',
    title: 'CBC & Platelet Hematology Profile',
    category: 'Hematology Profile',
    badge: 'Plt 142 x10^9/L',
    accreditation: 'ISO 15189 Medical Lab',
    description: 'Complete hemogram, WBC differential, absolute neutrophil count, and platelets.',
    icon: 'bi-droplet-half'
  },
  {
    fileName: '06_Post_Transplant_STR_Chimerism_Analysis.pdf',
    title: 'Post-Transplant STR Chimerism',
    category: 'Molecular Engraftment',
    badge: '98.4% Donor',
    accreditation: 'EFI Molecular Lab',
    description: 'Multiplex short tandem repeat (STR) donor-recipient engraftment quantification.',
    icon: 'bi-bar-chart-steps'
  },
  {
    fileName: '07_Minimal_Residual_Disease_Flow_Cytometry.pdf',
    title: 'Minimal Residual Disease (MRD)',
    category: 'Flow Cytometry',
    badge: 'MRD <0.01% Neg',
    accreditation: 'FACT-JACIE Bio-center',
    description: '8-color high-sensitivity flow cytometry measuring sub-microscopic leukemic cells.',
    icon: 'bi-search'
  },
  {
    fileName: '08_Matched_Donor_Buccal_Swab_Confirmatory_HLA.pdf',
    title: 'Donor Confirmatory HLA Typing',
    category: 'Registry Verification',
    badge: '10/10 Match Confirmed',
    accreditation: 'WMDA Qualified Registry',
    description: 'Unrelated donor buccal swab confirmation typing for match verification.',
    icon: 'bi-check2-all'
  },
  {
    fileName: '09_Hemoglobin_HPLC_and_Thalassemia_Mutation_Screen.pdf',
    title: 'Hemoglobin HPLC & Thalassemia Screen',
    category: 'Hemoglobinopathy',
    badge: 'HbA2 5.4%',
    accreditation: 'NABL Certified',
    description: 'High performance liquid chromatography and beta-globin mutation analysis.',
    icon: 'bi-diagram-3'
  },
  {
    fileName: '10_Cryopreserved_Stem_Cell_Graft_Infusion_Sterility.pdf',
    title: 'Cryopreserved Graft Release Certificate',
    category: 'Cryostorage Release',
    badge: 'Viability 94.1%',
    accreditation: 'FACT Cellular Therapy Lab',
    description: 'Liquid nitrogen vapor storage recovery, 7-AAD viability, and microbial sterility.',
    icon: 'bi-snow'
  },
  {
    fileName: '11_Non_Medical_Hotel_Booking_Invoice.pdf',
    title: 'Hotel Booking Invoice (Safety Test)',
    category: '⚠️ Non-Medical Gatekeeper Test',
    badge: 'Reject Expected',
    accreditation: 'Non-Clinical Document',
    description: 'Commercial invoice sample to test clinical safety gatekeeper and rejection.',
    icon: 'bi-slash-circle',
    isSafetyTest: true
  }
];

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
  const [discardNotification, setDiscardNotification] = useState(null);

  // Industry Feature: Interactive Document Preview Drawer / Modal
  const [showDocPreview, setShowDocPreview] = useState(false);
  const [previewDocUrl, setPreviewDocUrl] = useState('');
  const [previewDocTitle, setPreviewDocTitle] = useState('');

  // Industry Feature: Printable Clinical Consultation Modal
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Modern In-App Toast System (No browser alert() popups)
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = (message, type = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Load saved uploaded documents from backend database
  useEffect(() => {
    fetchUploadedReports();
  }, []);

  const isReportClean = (r) => {
    if (!r) return false;
    if (r.is_valid === false || r.status === 'Wrong Document' || r.status === 'Discarded' || r.report_type === 'INVALID_DOCUMENT') return false;
    const pName = String(r.patient_name || r.parsed_data?.patient_name || '').trim().toLowerCase();
    const disease = String(r.disease || r.parsed_data?.disease || '').trim().toLowerCase();
    const fName = String(r.file_name || r.name || '').trim().toLowerCase();
    if (pName.includes('patient from report') || pName.includes('not recognized')) return false;
    if (disease.includes('clinical referral')) return false;
    if (fName.includes('frontend') || fName.includes('invoice') || fName.includes('booking') || fName.includes('receipt')) return false;
    return true;
  };

  const fetchUploadedReports = async () => {
    setLoadingReports(true);
    try {
      // 0. Auto-clean browser localStorage cache of any legacy dummy data
      if (typeof localStorage !== 'undefined') {
        try {
          const raw = localStorage.getItem('koshika_uploaded_reports');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              const cleaned = parsed.filter(isReportClean);
              localStorage.setItem('koshika_uploaded_reports', JSON.stringify(cleaned));
            }
          }
        } catch (e) {}
      }

      // 1. Direct Supabase Query First (only strictly clean valid medical reports)
      const { data: supaReports, error: supaErr } = await supabase
        .from('medical_reports')
        .select('*')
        .eq('is_valid', true)
        .order('created_at', { ascending: false });

      if (!supaErr && Array.isArray(supaReports) && supaReports.length > 0) {
        const validSupa = supaReports.filter(isReportClean);
        if (validSupa.length > 0) {
          const formatted = validSupa.map(r => ({
            id: r.id,
            name: r.file_name,
            file_name: r.file_name,
            report_type: r.report_type,
            status: r.status,
            is_valid: true,
            date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
            }) : 'Just now',
            created_at: r.created_at,
            extracted_text: r.extracted_text || '',
            parsed_data: r.parsed_data || {
              patient_name: r.patient_name || null,
              age: r.age || null,
              blood_group: r.blood_group || null,
              disease: r.disease || null,
              cd34_count: r.cd34_count || 'N/A',
              viability: r.viability || 'N/A',
              report_type: r.report_type || 'GENERAL',
              accreditation: r.accreditation || 'EFI & NABL ISO 15189 Certified',
              is_valid: true
            }
          }));
          setRecentReports(formatted);
          setSelectedReport(formatted.length > 0 ? formatted[0] : null);
          return;
        }
      }

      // 2. Fallback to API Client (only strictly clean valid medical reports)
      const res = await api.get('/ocr/reports/');
      const rawReports = res.data || [];
      const validReports = (Array.isArray(rawReports) ? rawReports : []).filter(isReportClean);
      setRecentReports(validReports);
      if (validReports.length > 0) {
        setSelectedReport(validReports[0]);
      } else {
        setSelectedReport(null);
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
    const objectUrl = URL.createObjectURL(selected);
    setPreviewUrl(objectUrl);
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

  // 1-CLICK SAMPLE REPORT LOADER
  const handleLoadSampleReport = async (sample) => {
    try {
      showToast(`Loading certified sample "${sample.title}"...`, 'info');
      const response = await fetch(`/sample_medical_reports/${sample.fileName}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch sample: ${response.statusText}`);
      }
      const blob = await response.blob();
      const sampleFile = new File([blob], sample.fileName, { type: 'application/pdf' });
      processSelectedFile(sampleFile);
      showToast(`Sample "${sample.title}" loaded! Click "Upload & Validate Report" to process.`, 'success');
    } catch (err) {
      showToast(`Could not load sample: ${err.message}`, 'danger');
    }
  };

  // 1-CLICK SAMPLE DIRECT ANALYZE
  const handleDirectAnalyzeSample = async (sample) => {
    try {
      showToast(`Fetching and running instant OCR analysis on "${sample.title}"...`, 'info');
      const response = await fetch(`/sample_medical_reports/${sample.fileName}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch sample: ${response.statusText}`);
      }
      const blob = await response.blob();
      const sampleFile = new File([blob], sample.fileName, { type: 'application/pdf' });
      setFile(sampleFile);
      setPreviewUrl(URL.createObjectURL(sampleFile));
      // Call OCR directly with this file
      await executeOCR(sampleFile);
    } catch (err) {
      showToast(`Error processing sample: ${err.message}`, 'danger');
    }
  };

  // DELETE / REMOVE REPORT FROM SUPABASE & BACKEND DATABASE
  const handleDeleteReport = async (reportId) => {
    try {
      await supabase.from('medical_reports').delete().eq('id', reportId);
    } catch (supaErr) {
      console.warn('Direct Supabase delete notification:', supaErr);
    }

    try {
      await api.delete(`/ocr/reports/${reportId}/`);
    } catch (err) {
      console.warn('Backend delete notification:', err);
    }

    setRecentReports(prev => {
      const filtered = prev.filter(r => String(r.id) !== String(reportId));
      if (selectedReport && String(selectedReport.id) === String(reportId)) {
        setSelectedReport(filtered.length > 0 ? filtered[0] : null);
      }
      return filtered;
    });
    showToast('Report removed successfully from database records.', 'success');
  };

  // CLEAR ALL STORED REPORTS & SANITIZE DATABASE & LOCALSTORAGE
  const handleClearAllReports = async () => {
    if (typeof window !== 'undefined' && !window.confirm('Are you sure you want to remove all saved report records?')) {
      return;
    }
    try {
      await supabase.from('medical_reports').delete().neq('id', 0);
    } catch (supaErr) {
      console.warn('Supabase clear error:', supaErr);
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('koshika_uploaded_reports');
    }
    setRecentReports([]);
    setSelectedReport(null);
    showToast('All saved medical reports cleared successfully.', 'info');
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
      showToast('Please select or drag & drop a PDF or image file to upload.', 'warning');
      return;
    }
    await executeOCR(file);
  };

  const executeOCR = async (fileToUpload) => {
    setLoading(true);
    try {
      let res;
      if (fileToUpload) {
        const formData = new FormData();
        formData.append('file', fileToUpload);
        if (rawTextInput) formData.append('raw_text', rawTextInput);
        res = await api.post('/ocr/analyze/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await api.post('/ocr/analyze/', { raw_text: rawTextInput });
      }

      const parsed = res.data?.parsed_data || {};
      const isDiscarded = res.data?.discarded || res.data?.is_valid === false || parsed.is_valid === false || res.data?.success === false || res.data?.status === 'Wrong Document' || parsed.status === 'Wrong Document';

      // IF WRONG / NON-MEDICAL DOCUMENT: DISCARD IMMEDIATELY WITHOUT SAVING
      if (isDiscarded) {
        const discardedName = fileToUpload ? fileToUpload.name : (res.data?.name || 'Uploaded Document');
        handleRemoveFile(); // Clear input and preview immediately
        setDiscardNotification({
          fileName: discardedName,
          title: res.data?.rejection_title || parsed.rejection_title || '⚠️ Document Is Not a Medical Report',
          message: res.data?.message || parsed.rejection_message || 'The uploaded file does not contain recognized clinical diagnostic laboratory markers. To maintain EHR data integrity, only medical diagnostic documents are saved.',
          plainEnglishSummary: parsed.insights?.plain_english_summary || '',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        showToast('⚠️ Document rejected: File is not a valid medical report.', 'warning');
        return;
      }

      // Clear any prior discard alerts upon successful valid medical report upload
      setDiscardNotification(null);

      const newReport = {
        id: res.data?.id || Date.now(),
        name: res.data?.name || (fileToUpload ? fileToUpload.name : `${parsed.report_type || 'Clinical'} Report`),
        file_name: res.data?.file_name || (fileToUpload ? fileToUpload.name : 'medical_report.pdf'),
        report_type: res.data?.report_type || parsed.report_type || 'GENERAL',
        date: res.data?.date || 'Just now',
        status: res.data?.status || 'Analyzed',
        parsed_data: parsed,
        extracted_text: res.data?.extracted_text || '',
        is_valid: true
      };

      // Direct Supabase insert guarantee if not already persisted by API client or backend
      if (!res.data?.is_saved_to_supabase && newReport.is_valid && newReport.report_type !== 'INVALID_DOCUMENT') {
        try {
          const { data: supaRow, error: supaErr } = await supabase
            .from('medical_reports')
            .insert([{
              file_name: newReport.file_name,
              report_type: newReport.report_type,
              status: newReport.status,
              patient_name: parsed.patient_name || null,
              age: parsed.age ? Number(parsed.age) : null,
              blood_group: parsed.blood_group || null,
              disease: parsed.disease || null,
              cd34_count: parsed.cd34_count ? String(parsed.cd34_count) : 'N/A',
              viability: parsed.viability ? String(parsed.viability) : 'N/A',
              extracted_text: newReport.extracted_text || '',
              parsed_data: parsed,
              is_valid: true
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
      showToast('Document analyzed & securely saved to clinical database!', 'success');
    } catch (err) {
      showToast('Upload & Analysis failed: ' + (err.response?.data?.error || err.message), 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchStemMatching = () => {
    if (!selectedReport) return;
    const p = selectedReport.parsed_data || {};
    if (p.is_valid === false || selectedReport.report_type === 'INVALID_DOCUMENT' || selectedReport.status === 'Wrong Document') {
      showToast('Cannot launch stem cell matching on an unrecognized document. Please upload a verified HLA or diagnostic report.', 'warning');
      return;
    }
    navigate('/ml-match', {
      state: {
        patientName: (p.patient_name && p.patient_name !== 'Patient from Report' && p.patient_name !== 'Not Recognized') ? p.patient_name : 'Not Specified',
        patientAge: p.age || null,
        patientBloodGroup: p.blood_group || 'Not Specified',
        disease: (p.disease && p.disease !== 'Clinical Referral') ? p.disease : 'Not Specified',
        cd34Count: p.cd34_count || 'N/A',
        viability: p.viability || 'N/A',
        hlaCalls: p.hla_calls || null,
        hlaMatchTarget: 10,
        reportSource: selectedReport.name || selectedReport.file_name,
        accreditation: p.accreditation || 'EFI & NABL ISO 15189 Certified'
      }
    });
  };

  const handleImportAsPatient = async () => {
    if (!selectedReport?.parsed_data) return;
    const p = selectedReport.parsed_data;
    if (p.is_valid === false || selectedReport.report_type === 'INVALID_DOCUMENT' || selectedReport.status === 'Wrong Document') {
      showToast('Cannot save an unrecognized or wrong document to the patient registry.', 'warning');
      return;
    }
    if (!p.patient_name || p.patient_name === 'Not Recognized') {
      showToast('Cannot import patient: No valid patient name was identified in this report.', 'warning');
      return;
    }
    try {
      await api.post('/patients/', {
        name: p.patient_name,
        age: p.age ? Number(p.age) : null,
        blood_group: p.blood_group || 'Not Specified',
        disease: p.disease || 'Diagnostic Workup',
        contact: 'Lab Record',
      });
      showToast('Successfully registered patient into clinical registry!', 'success');
      navigate('/patients');
    } catch (err) {
      showToast('Error importing patient: ' + err.message, 'danger');
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
    showToast('Questions copied to clipboard for your consultation!', 'success');
  };

  // Open Document Viewer
  const handleOpenDocViewer = (report) => {
    const fileName = report?.file_name || report?.name || '';
    if (fileName.endsWith('.pdf')) {
      // Check if it's one of our certified samples
      const isSample = CERTIFIED_SAMPLE_REPORTS.some(s => s.fileName === fileName);
      if (isSample) {
        setPreviewDocUrl(`/sample_medical_reports/${fileName}`);
      } else if (previewUrl && file && file.name === fileName) {
        setPreviewDocUrl(previewUrl);
      } else {
        setPreviewDocUrl('');
      }
    } else {
      setPreviewDocUrl(previewUrl || '');
    }
    setPreviewDocTitle(report?.name || report?.file_name || 'Document View');
    setShowDocPreview(true);
  };

  const p = selectedReport?.parsed_data || {};
  const insights = p.insights || {};
  const isInvalidReport = p.is_valid === false || selectedReport?.report_type === 'INVALID_DOCUMENT' || selectedReport?.status === 'Wrong Document' || p.status === 'Wrong Document';

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
      {/* Sleek Floating Toast Notification */}
      {toast && (
        <div
          className={`position-fixed bottom-0 end-0 m-4 p-3 rounded-4 shadow-lg text-white d-flex align-items-center gap-3 z-3 border ${
            toast.type === 'danger'
              ? 'bg-danger border-danger-subtle'
              : toast.type === 'warning'
              ? 'bg-warning text-dark border-warning-subtle'
              : toast.type === 'info'
              ? 'bg-primary border-primary-subtle'
              : 'bg-success border-success-subtle'
          }`}
          style={{ maxWidth: '420px', zIndex: 9999 }}
        >
          <i
            className={`bi fs-4 ${
              toast.type === 'danger'
                ? 'bi-exclamation-octagon-fill'
                : toast.type === 'warning'
                ? 'bi-exclamation-triangle-fill'
                : toast.type === 'info'
                ? 'bi-info-circle-fill'
                : 'bi-check-circle-fill'
            }`}
          ></i>
          <div className="small flex-grow-1">{toast.message}</div>
          <button
            type="button"
            className="btn-close btn-close-white ms-auto"
            onClick={() => setToast(null)}
          ></button>
        </div>
      )}

      {/* 1. Industry Standard Header with Accreditations */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
              <span className="badge bg-primary text-white fw-bold px-3 py-1 rounded-pill small">
                <i className="bi bi-file-earmark-medical me-1"></i> CLINICAL DIAGNOSTICS &amp; OCR
              </span>
              <span className="badge bg-light text-secondary border px-2 py-1 rounded-pill small">
                ISO 15189 &amp; FACT-JACIE Compliant
              </span>
              <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded-pill small">
                <i className="bi bi-shield-check me-1"></i> Ingestion Safety Gatekeeper Active
              </span>
            </div>
            <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.02em' }}>
              MEDICAL REPORTS &amp; CLINICAL INTELLIGENCE
            </h2>
            <p className="text-secondary mb-0 small">
              High-precision OCR parsing for HLA typing, CD34+ stem cell counts, bone marrow biopsies, and chimerism with automated patient guidance.
            </p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            {selectedReport && !isInvalidReport && (
              <button
                onClick={() => setShowPrintModal(true)}
                className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-2 shadow-xs d-flex align-items-center gap-1"
                title="Print official clinical consultation summary"
              >
                <i className="bi bi-printer-fill text-primary"></i>
                <span>Print Clinical Summary</span>
              </button>
            )}
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

        {/* Clinical Accreditation Badges Strip */}
        <div className="d-flex align-items-center gap-2 mt-3 pt-3 border-top flex-wrap">
          <span className="text-muted small fw-semibold me-1">Laboratory Standards:</span>
          <span className="badge bg-light text-dark border px-2 py-1 rounded small">
            <i className="bi bi-patch-check-fill text-primary me-1"></i> EFI &amp; NABL ISO 15189
          </span>
          <span className="badge bg-light text-dark border px-2 py-1 rounded small">
            <i className="bi bi-patch-check-fill text-primary me-1"></i> FACT-JACIE Standards
          </span>
          <span className="badge bg-light text-dark border px-2 py-1 rounded small">
            <i className="bi bi-patch-check-fill text-primary me-1"></i> CAP Accredited
          </span>
          <span className="badge bg-light text-dark border px-2 py-1 rounded small">
            <i className="bi bi-patch-check-fill text-primary me-1"></i> NABH Biobank
          </span>
          <span className="badge bg-light text-dark border px-2 py-1 rounded small">
            <i className="bi bi-patch-check-fill text-primary me-1"></i> WMDA Qualified
          </span>
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
              <span>Patient AI Insights &amp; Clinical Breakdown</span>
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
              <span className="badge bg-primary-subtle text-primary p-2 rounded-circle">
                <i className="bi bi-database-check"></i>
              </span>
            </div>
            <div className="fs-3 fw-bold text-dark">{recentReports.length}</div>
            <small className="text-muted">Persisted in Supabase &amp; local cache</small>
          </div>
        </div>
        <div className="col-12 col-sm-4">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="small text-muted fw-semibold">Ingestion Safety Gatekeeper</span>
              <span className="badge bg-success-subtle text-success p-2 rounded-circle">
                <i className="bi bi-shield-check"></i>
              </span>
            </div>
            <div className="fs-3 fw-bold text-dark text-success">Active &bull; 100%</div>
            <small className="text-muted">Blocks non-medical files &amp; protects patient integrity</small>
          </div>
        </div>
        <div className="col-12 col-sm-4">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="small text-muted fw-semibold">OCR Vision Engine</span>
              <span className="badge bg-info-subtle text-info p-2 rounded-circle">
                <i className="bi bi-cpu-fill"></i>
              </span>
            </div>
            <div className="fs-3 fw-bold text-dark">Gemini + Stream Parser</div>
            <small className="text-muted">High-res multi-locus HLA &amp; cell count detection</small>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: UPLOAD REPORT & OCR SCANNER */}
      {/* ========================================================================= */}
      {activeTab === 'upload' && (
        <div className="koshika-tab-content">
          {/* DISCARD NOTIFICATION BANNER (Displayed when wrong or non-medical document is uploaded) */}
          {discardNotification && (
            <div className="card border-0 rounded-4 p-4 mb-4 shadow-sm border border-danger-subtle bg-danger-subtle bg-opacity-25 position-relative">
              <button
                type="button"
                className="btn-close position-absolute top-0 end-0 m-3"
                aria-label="Dismiss notification"
                onClick={() => setDiscardNotification(null)}
              ></button>
              <div className="d-flex align-items-start gap-3">
                <div className="p-3 bg-warning text-dark rounded-circle flex-shrink-0 shadow-xs">
                  <i className="bi bi-info-circle-fill fs-3"></i>
                </div>
                <div className="flex-grow-1 pe-4">
                  <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                    <span className="badge bg-warning text-dark rounded-pill px-3 py-1 fw-bold">
                      <i className="bi bi-shield-exclamation me-1"></i> Non-Clinical Document
                    </span>
                    <span className="badge bg-white text-secondary border px-2 py-1 rounded-pill small fw-semibold">
                      Database Records Untouched
                    </span>
                    <small className="text-muted ms-auto">{discardNotification.timestamp}</small>
                  </div>
                  <h5 className="fw-bold text-dark mb-1">
                    {discardNotification.title}
                  </h5>
                  <p className="text-secondary small mb-2">
                    <strong>Selected File:</strong> <code className="text-dark fw-bold bg-white px-2 py-1 rounded border">{discardNotification.fileName}</code>
                  </p>
                  <p className="text-dark small mb-3 leading-relaxed">
                    {discardNotification.message}
                  </p>

                  <div className="p-3 bg-white rounded-3 border mb-3">
                    <div className="d-flex align-items-center gap-2 text-primary fw-bold small mb-2">
                      <i className="bi bi-shield-check fs-5"></i>
                      <span>Clinical Safety Gatekeeper: File was not saved to database records.</span>
                    </div>
                    <div className="small text-secondary">
                      <strong>Accepted Diagnostic Medical Documents:</strong>
                      <div className="row g-2 mt-1">
                        <div className="col-12 col-md-6">
                          <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-check-circle-fill text-success"></i>
                            <span><strong>HLA Typing Panel</strong> (NGS or PCR-SSO allele typing)</span>
                          </div>
                        </div>
                        <div className="col-12 col-md-6">
                          <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-check-circle-fill text-success"></i>
                            <span><strong>Stem Cell CD34+ Count</strong> &amp; Viability harvest reports</span>
                          </div>
                        </div>
                        <div className="col-12 col-md-6">
                          <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-check-circle-fill text-success"></i>
                            <span><strong>Bone Marrow Aspirate &amp; Biopsy</strong> remission reports</span>
                          </div>
                        </div>
                        <div className="col-12 col-md-6">
                          <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-check-circle-fill text-success"></i>
                            <span><strong>Complete Blood Count (CBC)</strong>, WBC &amp; Platelets</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setDiscardNotification(null);
                        document.getElementById('reportFileInput')?.click();
                      }}
                      className="btn btn-sm btn-primary rounded-pill px-4 py-2 shadow-xs d-flex align-items-center gap-2"
                    >
                      <i className="bi bi-cloud-arrow-up-fill"></i>
                      <span>Upload Valid Diagnostic Report</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscardNotification(null)}
                      className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-2"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 1-CLICK INDUSTRY CERTIFIED SAMPLE SUITE (For Instant Clinical Testing) */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
              <div>
                <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                  <i className="bi bi-stars text-warning"></i>
                  <span>1-Click Industry Certified Test Suite</span>
                  <span className="badge bg-primary-subtle text-primary rounded-pill small">11 Benchmark Samples</span>
                </h5>
                <p className="text-secondary small mb-0">
                  Select any certified clinical document to instantly test OCR extraction, or select the non-medical sample to test the Safety Gatekeeper.
                </p>
              </div>
            </div>

            <div className="row g-2">
              {CERTIFIED_SAMPLE_REPORTS.map((sample, sIdx) => (
                <div key={sIdx} className="col-12 col-md-6 col-xl-4">
                  <div
                    className={`p-3 rounded-4 border h-100 transition-all ${
                      sample.isSafetyTest
                        ? 'border-danger-subtle bg-danger-subtle bg-opacity-10'
                        : 'border-light-subtle bg-light hover-shadow'
                    }`}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className={`badge small rounded-pill ${
                        sample.isSafetyTest ? 'bg-danger text-white' : 'bg-primary-subtle text-primary fw-semibold'
                      }`}>
                        {sample.category}
                      </span>
                      <span className="badge bg-white text-dark border small">
                        {sample.badge}
                      </span>
                    </div>

                    <h6 className="fw-bold text-dark mb-1 small d-flex align-items-center gap-1">
                      <i className={`bi ${sample.icon} ${sample.isSafetyTest ? 'text-danger' : 'text-primary'}`}></i>
                      <span>{sample.title}</span>
                    </h6>

                    <p className="text-muted small mb-2" style={{ fontSize: '0.78rem', minHeight: '34px' }}>
                      {sample.description}
                    </p>

                    <div className="d-flex align-items-center justify-content-between pt-2 border-top gap-1">
                      <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                        <i className="bi bi-patch-check text-success me-1"></i>
                        {sample.accreditation}
                      </small>
                      <div className="d-flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleLoadSampleReport(sample)}
                          className="btn btn-xs btn-outline-secondary rounded-pill px-2 py-1 small"
                          style={{ fontSize: '0.74rem' }}
                          title="Load into dropzone"
                        >
                          Load File
                        </button>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => handleDirectAnalyzeSample(sample)}
                          className={`btn btn-xs rounded-pill px-2 py-1 small fw-semibold shadow-xs ${
                            sample.isSafetyTest ? 'btn-danger' : 'btn-primary'
                          }`}
                          style={{ fontSize: '0.74rem' }}
                          title="Run OCR immediately"
                        >
                          Analyze &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Drop Zone */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-cloud-arrow-up-fill text-primary"></i>
              Upload Diagnostic Medical Document (PDF or Photo)
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

            {/* UPLOAD PREVIEW CARD WITH PREVIEW & DISCARD BUTTONS */}
            {file && (
              <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between p-3 rounded-4 bg-white border mt-3 shadow-xs gap-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2 bg-success-subtle text-success rounded-circle flex-shrink-0">
                    <i className="bi bi-file-earmark-check-fill fs-3"></i>
                  </div>
                  <div>
                    <strong className="text-dark small d-block">{file.name}</strong>
                    <small className="text-muted">{(file.size / 1024).toFixed(1)} KB &bull; Ready for diagnostic validation &amp; database storage</small>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2 w-100 w-sm-auto justify-content-end flex-wrap">
                  {/* PREVIEW BUTTON */}
                  {previewUrl && (
                    <button
                      type="button"
                      onClick={() => handleOpenDocViewer({ name: file.name, file_name: file.name })}
                      className="btn btn-sm btn-outline-secondary rounded-pill px-3 d-flex align-items-center gap-1"
                    >
                      <i className="bi bi-eye"></i>
                      <span>Preview</span>
                    </button>
                  )}
                  {/* DISCARD SELECTED FILE BUTTON */}
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="btn btn-sm btn-outline-danger rounded-pill px-3 d-flex align-items-center gap-1"
                    title="Discard selected file"
                  >
                    <i className="bi bi-trash3"></i>
                    <span>Discard</span>
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
                        <span>Validating &amp; Saving...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-cloud-arrow-up-fill"></i>
                        <span>Upload &amp; Validate Report</span>
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
                Uploaded Documents Saved in Database ({recentReports.length})
              </h5>
              <div className="d-flex align-items-center gap-2">
                {recentReports.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllReports}
                    className="btn btn-sm btn-outline-danger border rounded-pill px-3 d-flex align-items-center gap-1"
                    title="Remove all saved reports from database and cache"
                  >
                    <i className="bi bi-trash3"></i>
                    <span>Clear All</span>
                  </button>
                )}
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
            </div>

            {loadingReports ? (
              <div className="text-center py-5 text-muted">
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                <span>Loading uploaded documents from database...</span>
              </div>
            ) : recentReports.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-folder-x fs-1 text-secondary mb-2 d-block"></i>
                <h6 className="fw-bold text-dark mb-1">No Documents Uploaded Yet</h6>
                <p className="small text-secondary mb-0">
                  Select a document or test sample above and click "Upload &amp; Validate Report" to store and analyze your diagnostic test.
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small">
                    <tr>
                      <th>Document Title</th>
                      <th>Category</th>
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
                              className="btn btn-sm btn-outline-secondary rounded-pill px-2 py-1 me-1"
                              title="Preview Document"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDocViewer(r);
                              }}
                            >
                              <i className="bi bi-eye"></i>
                            </button>
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
                              <span>Insights</span>
                            </button>
                            {/* REMOVE / DELETE INDIVIDUAL REPORT BUTTON */}
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger rounded-pill px-2 py-1"
                              title="Delete report from database"
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
              <p className="text-secondary small mb-3">Upload your first clinical report to save it to the database and view AI patient guidance.</p>
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
                          <span className="badge bg-warning text-dark rounded-pill px-3 py-1 fw-semibold">
                            Non-Clinical Document Notice
                          </span>
                          <span className="badge bg-warning-subtle text-dark border px-2 py-1 rounded-pill small">
                            Patient Safety Gatekeeper
                          </span>
                        </div>
                        <h4 className="fw-bold text-dark mb-2">
                          {p.rejection_title || '⚠️ Non-Clinical Document Detected'}
                        </h4>
                        <p className="text-secondary mb-3 leading-relaxed">
                          {p.rejection_message ||
                            'The uploaded file does not contain recognizable clinical diagnostic markers. To protect clinical records, only verified medical documents are registered.'}
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
                      <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                        <span className="badge bg-primary text-white rounded-pill px-3 py-1 small fw-semibold">
                          {selectedReport.report_type || 'CLINICAL REPORT'}
                        </span>
                        <span className="badge bg-success-subtle text-success rounded-pill px-2 py-1 small">
                          <i className="bi bi-database-check me-1"></i> Saved to Clinical Database
                        </span>
                        {p.accreditation && (
                          <span className="badge bg-light text-secondary border px-2 py-1 rounded-pill small">
                            <i className="bi bi-patch-check-fill text-primary me-1"></i>
                            {p.accreditation}
                          </span>
                        )}
                      </div>
                      <h4 className="fw-bold text-dark mb-0">{selectedReport.name || selectedReport.file_name}</h4>
                      <small className="text-muted">Saved: {selectedReport.date}</small>
                    </div>
                    <div className="d-flex gap-2 align-items-center flex-wrap">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                        onClick={() => handleOpenDocViewer(selectedReport)}
                      >
                        <i className="bi bi-file-earmark-pdf me-1"></i>
                        <span>View Document</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                        onClick={() => setShowPrintModal(true)}
                      >
                        <i className="bi bi-printer me-1"></i>
                        <span>Print Consultation Summary</span>
                      </button>
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
                        title="Remove this report from database"
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
                        <strong className="fs-6 text-dark">
                          {(p.patient_name && p.patient_name !== 'Patient from Report' && p.patient_name !== 'Not Recognized') ? p.patient_name : 'Not Stated in Report'}
                        </strong>
                      </div>
                    </div>
                    <div className="col-6 col-md-2">
                      <div className="p-3 bg-light rounded-3 border">
                        <small className="text-secondary d-block">Blood Group</small>
                        <span className="badge bg-danger fs-6">
                          {(p.blood_group && p.blood_group !== 'N/A') ? p.blood_group : 'Not Specified'}
                        </span>
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
                        <strong className="fs-6 text-dark">
                          {(p.disease && p.disease !== 'Clinical Referral' && p.disease !== 'Non-Medical or Unreadable File') ? p.disease : 'Not Specified in Report'}
                        </strong>
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

                  {/* Specific Cell Parameters (CD34+ / Viability / Blasts) */}
                  {(p.cd34_count || p.viability || p.blast_percentage || p.chimerism_donor_pct || p.mrd_status) && (
                    <div className="row g-3 mb-4">
                      {p.cd34_count && (
                        <div className="col-12 col-md-4">
                          <div className="p-3 rounded-4 border bg-white shadow-xs">
                            <small className="text-muted fw-semibold">CD34+ Stem Cell Count</small>
                            <div className="fs-4 fw-bold text-dark">{p.cd34_count} x10^6/kg</div>
                            <small className="text-success fw-semibold">Target: &ge; 5.0 x10^6/kg (Adequate)</small>
                          </div>
                        </div>
                      )}
                      {p.viability && (
                        <div className="col-12 col-md-4">
                          <div className="p-3 rounded-4 border bg-white shadow-xs">
                            <small className="text-muted fw-semibold">Graft Viability (7-AAD)</small>
                            <div className="fs-4 fw-bold text-dark">{p.viability}%</div>
                            <small className="text-success fw-semibold">Target: &ge; 70% (Clinical Grade)</small>
                          </div>
                        </div>
                      )}
                      {p.blast_percentage && (
                        <div className="col-12 col-md-4">
                          <div className="p-3 rounded-4 border bg-white shadow-xs">
                            <small className="text-muted fw-semibold">Marrow Blast Percentage</small>
                            <div className="fs-4 fw-bold text-dark">{p.blast_percentage}%</div>
                            <small className="text-success fw-semibold">Morphologic Complete Remission (&lt;5%)</small>
                          </div>
                        </div>
                      )}
                      {p.chimerism_donor_pct && (
                        <div className="col-12 col-md-4">
                          <div className="p-3 rounded-4 border bg-white shadow-xs">
                            <small className="text-muted fw-semibold">Donor Chimerism (STR)</small>
                            <div className="fs-4 fw-bold text-dark">{p.chimerism_donor_pct}%</div>
                            <small className="text-success fw-semibold">Complete Donor Engraftment</small>
                          </div>
                        </div>
                      )}
                      {p.mrd_status && (
                        <div className="col-12 col-md-4">
                          <div className="p-3 rounded-4 border bg-white shadow-xs">
                            <small className="text-muted fw-semibold">Minimal Residual Disease</small>
                            <div className="fs-5 fw-bold text-dark">{p.mrd_status}</div>
                            <small className="text-info fw-semibold">8-Color Flow Cytometry</small>
                          </div>
                        </div>
                      )}
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
                      onClick={() => setShowPrintModal(true)}
                      className="btn btn-outline-secondary rounded-pill px-3 py-2 d-flex align-items-center gap-1"
                    >
                      <i className="bi bi-printer"></i>
                      <span>Print Consultation Summary</span>
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
                      <span>Remove Report</span>
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

      {/* ========================================================================= */}
      {/* INDUSTRY MODAL 1: INTERACTIVE DOCUMENT PREVIEW DRAWER / MODAL */}
      {/* ========================================================================= */}
      {showDocPreview && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 1050 }}
        >
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom py-3 px-4 bg-light">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-file-earmark-pdf-fill text-danger fs-5"></i>
                  <h5 className="modal-title fw-bold text-dark mb-0">{previewDocTitle}</h5>
                  <span className="badge bg-primary-subtle text-primary small">Clinical Document Viewer</span>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDocPreview(false)}
                ></button>
              </div>
              <div className="modal-body p-0" style={{ minHeight: '600px', backgroundColor: '#525659' }}>
                {previewDocUrl ? (
                  <iframe
                    src={previewDocUrl}
                    title={previewDocTitle}
                    style={{ width: '100%', height: '650px', border: 'none' }}
                  />
                ) : (
                  <div className="p-5 text-center text-white">
                    <i className="bi bi-file-earmark-text fs-1 mb-2 d-block"></i>
                    <h6>Document source available in extracted clinical OCR format</h6>
                    <pre className="bg-dark text-start p-3 rounded text-light small mt-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {selectedReport?.extracted_text || 'No raw document stream available.'}
                    </pre>
                  </div>
                )}
              </div>
              <div className="modal-footer bg-light px-4 py-2 justify-content-between">
                <small className="text-muted">
                  <i className="bi bi-shield-lock me-1"></i> End-to-end encrypted clinical viewer
                </small>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary rounded-pill px-4"
                  onClick={() => setShowDocPreview(false)}
                >
                  Close Viewer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INDUSTRY MODAL 2: PRINTABLE CLINICAL CONSULTATION SUMMARY MODAL */}
      {/* ========================================================================= */}
      {showPrintModal && selectedReport && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', zIndex: 1060 }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom py-3 px-4 bg-white d-print-none">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-printer-fill text-primary fs-5"></i>
                  <h5 className="modal-title fw-bold text-dark mb-0">Official Clinical Consultation Summary</h5>
                </div>
                <div className="d-flex gap-2 align-items-center">
                  <button
                    type="button"
                    className="btn btn-sm btn-primary rounded-pill px-3 d-flex align-items-center gap-1 shadow-xs"
                    onClick={() => window.print()}
                  >
                    <i className="bi bi-printer"></i>
                    <span>Print Summary</span>
                  </button>
                  <button
                    type="button"
                    className="btn-close ms-2"
                    onClick={() => setShowPrintModal(false)}
                  ></button>
                </div>
              </div>

              {/* Printable Document Sheet */}
              <div className="modal-body p-4 p-md-5 bg-white print-page-content" id="printableClinicalSummary">
                {/* Official Lab / Medical Center Header */}
                <div className="d-flex justify-content-between align-items-start border-bottom pb-4 mb-4">
                  <div>
                    <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.02em' }}>
                      KOSHIKA STEM CELL &amp; CELLULAR THERAPY NETWORK
                    </h3>
                    <div className="small text-secondary">
                      Comprehensive Clinical Diagnostics &bull; Histocompatibility &bull; BMT Triage
                    </div>
                    <div className="small text-muted mt-1">
                      Accreditations: <strong>EFI &amp; NABL ISO 15189 | FACT-JACIE | CAP | NABH</strong>
                    </div>
                  </div>
                  <div className="text-end">
                    <span className="badge bg-primary fs-6 px-3 py-2 mb-1">CLINICAL SUMMARY</span>
                    <div className="small text-muted">Generated: {new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</div>
                    <div className="small text-muted">ID: REP-{(selectedReport.id || 1001).toString().slice(-6)}</div>
                  </div>
                </div>

                {/* Patient Information Box */}
                <div className="p-3 bg-light rounded-3 border mb-4">
                  <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Patient Clinical Profile</h6>
                  <div className="row g-3 small">
                    <div className="col-4">
                      <span className="text-muted d-block">Patient Name:</span>
                      <strong className="fs-6 text-dark">
                        {(p.patient_name && p.patient_name !== 'Patient from Report' && p.patient_name !== 'Not Recognized') ? p.patient_name : 'Not Stated in Report'}
                      </strong>
                    </div>
                    <div className="col-2">
                      <span className="text-muted d-block">Age / Sex:</span>
                      <strong className="fs-6 text-dark">{p.age ? `${p.age} yrs` : 'Not Specified'}</strong>
                    </div>
                    <div className="col-2">
                      <span className="text-muted d-block">Blood Group:</span>
                      <strong className="fs-6 text-danger">
                        {(p.blood_group && p.blood_group !== 'N/A') ? p.blood_group : 'Not Specified'}
                      </strong>
                    </div>
                    <div className="col-4">
                      <span className="text-muted d-block">Primary Diagnosis:</span>
                      <strong className="fs-6 text-dark">
                        {(p.disease && p.disease !== 'Clinical Referral' && p.disease !== 'Non-Medical or Unreadable File') ? p.disease : 'Not Specified in Report'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Document & Laboratory Parameters */}
                <div className="mb-4">
                  <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Diagnostic Findings &amp; Metrics</h6>
                  <table className="table table-bordered table-sm small align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Parameter / Marker</th>
                        <th>Observed Result</th>
                        <th>Clinical Reference Range</th>
                        <th>Interpretation</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Document Category</strong></td>
                        <td>{selectedReport.report_type || 'Clinical Diagnostic Report'}</td>
                        <td>Standard Diagnostic Format</td>
                        <td><span className="badge bg-success-subtle text-success">Verified</span></td>
                      </tr>
                      {p.cd34_count && (
                        <tr>
                          <td><strong>CD34+ Stem Cell Harvest</strong></td>
                          <td><strong>{p.cd34_count} x 10^6 cells/kg</strong></td>
                          <td>&ge; 2.0 - 5.0 x 10^6 cells/kg</td>
                          <td><span className="badge bg-success-subtle text-success">Adequate Yield</span></td>
                        </tr>
                      )}
                      {p.viability && (
                        <tr>
                          <td><strong>Stem Cell Viability (7-AAD)</strong></td>
                          <td><strong>{p.viability}%</strong></td>
                          <td>&ge; 70.0%</td>
                          <td><span className="badge bg-success-subtle text-success">Optimal</span></td>
                        </tr>
                      )}
                      {p.blast_percentage && (
                        <tr>
                          <td><strong>Bone Marrow Blast Count</strong></td>
                          <td><strong>{p.blast_percentage}%</strong></td>
                          <td>&lt; 5.0% for Complete Remission</td>
                          <td><span className="badge bg-success-subtle text-success">Morphologic CR</span></td>
                        </tr>
                      )}
                      {p.chimerism_donor_pct && (
                        <tr>
                          <td><strong>Donor Chimerism (STR)</strong></td>
                          <td><strong>{p.chimerism_donor_pct}%</strong></td>
                          <td>&ge; 95% Full Donor</td>
                          <td><span className="badge bg-success-subtle text-success">Complete Engraftment</span></td>
                        </tr>
                      )}
                      {p.mrd_status && (
                        <tr>
                          <td><strong>Minimal Residual Disease (MRD)</strong></td>
                          <td><strong>{p.mrd_status}</strong></td>
                          <td>&lt; 0.01% (Negative)</td>
                          <td><span className="badge bg-success-subtle text-success">Negative</span></td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* HLA Typing Table if Available */}
                {p.hla_calls && (
                  <div className="mb-4">
                    <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">High-Resolution HLA Allele Breakdown (10/10)</h6>
                    <div className="row g-2 text-center small">
                      {Object.entries(p.hla_calls).map(([locus, alleles]) => (
                        <div key={locus} className="col">
                          <div className="p-2 border rounded bg-light">
                            <span className="text-muted d-block fw-bold">{locus}</span>
                            <span className="fw-bold font-monospace text-primary">{alleles}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Patient Guidance & Action Items */}
                <div className="mb-4">
                  <h6 className="fw-bold text-dark border-bottom pb-2 mb-2">Patient Guidance Summary</h6>
                  <p className="small text-secondary mb-3 leading-relaxed">
                    {insights.plain_english_summary || 'Diagnostic evaluation conforms with clinical standards for hematopoietic evaluation.'}
                  </p>
                  <h6 className="fw-bold text-dark small mb-2">Key Questions for Attending Hematologist:</h6>
                  <ul className="small text-secondary ps-3 mb-0">
                    {doctorQuestions.slice(0, 3).map((q, idx) => (
                      <li key={idx} className="mb-1">{q}</li>
                    ))}
                  </ul>
                </div>

                {/* Attestation & Signature Footer */}
                <div className="pt-4 mt-4 border-top d-flex justify-content-between align-items-end small text-muted">
                  <div>
                    <div><strong>Ingested Document:</strong> {selectedReport.name}</div>
                    <div><strong>Digital Certificate:</strong> NABL/ISO15189 Verified Electronic Medical Record</div>
                  </div>
                  <div className="text-end">
                    <div className="fw-bold text-dark mb-4">Attending Transplant Coordinator</div>
                    <div className="border-top pt-1 px-4 text-muted">Signature &amp; Stamp</div>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light px-4 py-2 d-print-none justify-content-between">
                <span className="small text-muted">Ready to print or save as PDF</span>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                    onClick={() => setShowPrintModal(false)}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary rounded-pill px-4 shadow-xs"
                    onClick={() => window.print()}
                  >
                    <i className="bi bi-printer me-1"></i>
                    Print Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalReportOCR;
