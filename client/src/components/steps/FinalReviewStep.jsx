// client/src/components/steps/FinalReviewStep.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useResumeStore } from '../../store/useResumeStore';
import { generateResumePDF } from '../../utils/pdfGenerator';
import Toast from '../Toast';
import JobBoardModal from '../JobBoardModal';
import { generateCoverLetterPDF } from '../../utils/coverLetterPDF';

export default function FinalReviewStep() {
    const navigate = useNavigate();
    const { resumeData, setStep, selectedTemplate, setTemplate, setFullResume, startNewResume } = useResumeStore();
    const [dbLoading, setDbLoading] = useState(false);
    const [showJobBoard, setShowJobBoard] = useState(false);

    // ATS Analyzer States
    const [atsLoading, setAtsLoading] = useState(false);
    const [atsResult, setAtsResult] = useState(null);
    const [showAtsModal, setShowAtsModal] = useState(false);

    // JD Matcher States
    const [jdText, setJdText] = useState('');
    const [jdLoading, setJdLoading] = useState(false);
    const [jdResult, setJdResult] = useState(null);
    const [showJdModal, setShowJdModal] = useState(false);

    // Cover Letter States
    const [coverLetterInput, setCoverLetterInput] = useState({
        jobTitle: '',
        companyName: '',
        jobDescription: ''
    });
    const [coverLetterText, setCoverLetterText] = useState('');
    const [coverLoading, setCoverLoading] = useState(false);
    const [showCoverModal, setShowCoverModal] = useState(false);

    const [resumeTitle, setResumeTitle] = useState(resumeData.resumeTitle || 'My FullStack Resume');
    const [toast, setToast] = useState({ message: '', type: 'success' });

    const showToast = (message, type = 'success') => setToast({ message, type });

    // Resume PDF Download Handler
    const handleDownloadPDF = () => {
        try {
            generateResumePDF(resumeData, resumeTitle || 'Resume', selectedTemplate || 'template-ats');
            showToast("PDF Downloaded in selected template style!", "success");
        } catch (error) {
            console.error("PDF Error:", error);
            showToast("Failed to generate PDF.", "danger");
        }
    };

    // 🚀 Professional Cover Letter Download Handler (With Full Metadata)
    const handleDownloadCoverLetterPDF = () => {
        try {
            generateCoverLetterPDF(
                coverLetterText,
                resumeData?.personalInfo || {},
                {
                    companyName: coverLetterInput.companyName,
                    jobTitle: coverLetterInput.jobTitle
                }
            );
            showToast("Professional Cover Letter PDF generated! 📄", "success");
        } catch (error) {
            console.error("Cover Letter PDF Error:", error);
            showToast(error.message || "Failed to generate Cover Letter PDF.", "danger");
        }
    };

    // Save to Profile
    const handleSaveToProfile = async () => {
        if (!resumeTitle.trim()) {
            showToast("Please enter a name for your resume file.", "danger");
            return;
        }

        setDbLoading(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...resumeData,
                template: selectedTemplate,
                resumeTitle: resumeTitle.trim()
            };

            const response = await fetch('http://localhost:6050/api/resume/save-master', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const resData = await response.json();
            if (resData.success) {
                if (resData.resume) setFullResume(resData.resume);
                showToast(`"${resumeTitle}" saved to your profile!`, "success");
            } else {
                showToast(resData.message || "Failed to save resume.", "danger");
            }
        } catch (error) {
            console.error("Save Error:", error);
            showToast("Network connection error.", "danger");
        } finally {
            setDbLoading(false);
        }
    };

    // ATS Score Handler
    const handleAnalyzeAts = async () => {
        setAtsLoading(true);
        setShowAtsModal(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                'http://localhost:6050/api/ai/analyze-ats',
                resumeData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                setAtsResult(res.data);
            }
        } catch (error) {
            showToast("Failed to connect to ATS AI service.", "danger");
        } finally {
            setAtsLoading(false);
        }
    };

    // JD Matcher Handler
    const handleMatchJd = async () => {
        if (!jdText.trim()) {
            showToast("Please paste Job Description text first.", "danger");
            return;
        }
        setJdLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                'http://localhost:6050/api/ai/match-jd',
                { resumeData, jobDescription: jdText },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                setJdResult(res.data.data);
                showToast("JD Match analysis complete!", "success");
            }
        } catch (error) {
            showToast("Failed to run JD Matcher.", "danger");
        } finally {
            setJdLoading(false);
        }
    };

    // 🚀 High-Impact AI Cover Letter Generator Handler
    const handleGenerateCoverLetter = async () => {
        if (!coverLetterInput.jobTitle.trim()) {
            showToast("Target Job Title is required.", "danger");
            return;
        }

        setCoverLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                'http://localhost:6050/api/ai/cover-letter',
                {
                    resumeData,
                    ...coverLetterInput
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                setCoverLetterText(res.data.coverLetter);
                showToast("Cover Letter tailored & generated!", "success");
            }
        } catch (error) {
            showToast("Failed to generate Cover Letter.", "danger");
        } finally {
            setCoverLoading(false);
        }
    };

    const handleCopyCoverLetter = () => {
        navigator.clipboard.writeText(coverLetterText);
        showToast("Cover Letter copied to clipboard! 📋", "success");
    };

    const handleCreateNewResume = () => {
        if (window.confirm("Create a new blank resume? Unsaved changes will be cleared.")) {
            startNewResume();
            navigate('/select-template');
        }
    };

    return (
        <>
            <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ message: '', type: 'success' })}
            />

            <div className="glass-card p-3 p-md-4 text-white border-0 shadow-lg mb-4">
                <div className="d-flex flex-column gap-3">

                    {/* CONTROL & ACTION MATRIX */}
                    <div className="border-bottom border-secondary border-opacity-25 pb-3">

                        {/* 1. DOCUMENT CONFIGURATION ROW */}
                        <div className="row g-2 align-items-center mb-3">
                            <div className="col-12 col-sm-6 col-md-5 col-lg-4">
                                <div className="input-group input-group-sm">
                                    <span className="input-group-text bg-dark text-white-50 border-secondary">
                                        📄 Title
                                    </span>
                                    <input
                                        type="text"
                                        value={resumeTitle}
                                        onChange={(e) => setResumeTitle(e.target.value)}
                                        className="form-control glass-input text-white"
                                        placeholder="e.g. FullStack CV"
                                        style={{ fontSize: '0.82rem' }}
                                    />
                                </div>
                            </div>

                            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                <select
                                    value={selectedTemplate || 'template-ats'}
                                    onChange={(e) => setTemplate(e.target.value)}
                                    className="form-select form-select-sm bg-dark text-white border-secondary"
                                    style={{ fontSize: '0.82rem', height: '31px' }}
                                >
                                    <option value="template-ats">Standard ATS Layout</option>
                                    <option value="template-sidebar">Modern Sidebar Layout</option>
                                    <option value="template-corporate">Clean Corporate Layout</option>
                                    <option value="template-header-banner">Executive Banner Layout</option>
                                    <option value="template-classic-table">Classic Academic Layout</option>
                                </select>
                            </div>

                            <div className="col-12 col-sm-12 col-md-3 col-lg-auto ms-lg-auto d-flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="btn btn-outline-light btn-sm py-1.5 w-100 fw-medium"
                                    style={{ borderRadius: '8px', fontSize: '0.8rem', minWidth: '90px' }}
                                >
                                    ✏️ Edit Details
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCreateNewResume}
                                    className="btn btn-outline-danger btn-sm py-1.5 w-100 fw-medium"
                                    style={{ borderRadius: '8px', fontSize: '0.8rem', minWidth: '95px' }}
                                >
                                    ➕ New Blank
                                </button>
                            </div>
                        </div>

                        {/* 2. AI SUITE (Responsive Grid) */}
                        <div className="row g-2 mb-3">
                            <div className="col-12 col-sm-6 col-md-3">
                                <button
                                    type="button"
                                    onClick={handleAnalyzeAts}
                                    className="btn btn-warning text-dark btn-sm py-2 w-100 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-1.5"
                                    style={{ borderRadius: '8px', fontSize: '0.8rem' }}
                                >
                                    <span>🚀</span>
                                    <span>Analyze ATS Score</span>
                                </button>
                            </div>

                            <div className="col-12 col-sm-6 col-md-3">
                                <button
                                    type="button"
                                    onClick={() => setShowJdModal(true)}
                                    className="btn btn-primary btn-sm py-2 w-100 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-1.5"
                                    style={{ borderRadius: '8px', fontSize: '0.8rem' }}
                                >
                                    <span>🎯</span>
                                    <span>Match Target JD</span>
                                </button>
                            </div>

                            <div className="col-12 col-sm-6 col-md-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCoverModal(true)}
                                    className="btn btn-outline-info btn-sm py-2 w-100 fw-bold d-flex align-items-center justify-content-center gap-1.5"
                                    style={{ borderRadius: '8px', fontSize: '0.8rem' }}
                                >
                                    <span>✉️</span>
                                    <span>AI Cover Letter</span>
                                </button>
                            </div>

                            <div className="col-12 col-sm-6 col-md-3">
                                <button
                                    type="button"
                                    onClick={() => setShowJobBoard(true)}
                                    className="btn btn-outline-warning btn-sm py-2 w-100 fw-bold d-flex align-items-center justify-content-center gap-1.5"
                                    style={{ borderRadius: '8px', fontSize: '0.8rem' }}
                                >
                                    <span>💼</span>
                                    <span>Live Job Matching</span>
                                </button>
                            </div>
                        </div>

                        {/* 3. PRIMARY ACTIONS */}
                        <div className="row g-2 pt-2 border-top border-secondary border-opacity-10">
                            <div className="col-12 col-sm-6 ms-sm-auto col-md-4 col-lg-3">
                                <button
                                    type="button"
                                    disabled={dbLoading}
                                    onClick={handleSaveToProfile}
                                    className="btn btn-info text-dark btn-sm py-2 w-100 fw-semibold d-flex align-items-center justify-content-center gap-1"
                                    style={{ borderRadius: '8px', fontSize: '0.82rem' }}
                                >
                                    {dbLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-1"></span>
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>☁️</span>
                                            <span>Save to Profile</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                <button
                                    type="button"
                                    onClick={handleDownloadPDF}
                                    className="btn btn-premium btn-sm py-2 w-100 fw-bold shadow-lg d-flex align-items-center justify-content-center gap-1"
                                    style={{ borderRadius: '8px', fontSize: '0.82rem' }}
                                >
                                    <span>📥</span>
                                    <span>Download Ready PDF</span>
                                </button>
                            </div>
                        </div>

                    </div>

                    <div>
                        <h4 className="glow-title mb-1 d-flex align-items-center gap-2" style={{ fontSize: '1.35rem' }}>
                            🎉 Review & Download
                        </h4>
                        <p className="text-info text-opacity-75 small mb-0 fw-medium">
                            Name your resume, analyze ATS compliance, match target JDs, generate AI cover letters, and export PDF.
                        </p>
                    </div>

                </div>
            </div>

            {/* LIVE JOBS MODAL */}
            <JobBoardModal
                isOpen={showJobBoard}
                onClose={() => setShowJobBoard(false)}
                showToast={showToast}
            />

            {/* ATS SCORE MODAL */}
            {showAtsModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content bg-dark text-white border border-secondary shadow-lg rounded-4">
                            <div className="modal-header border-secondary pb-2">
                                <h5 className="modal-title fw-bold text-info">📊 ATS Resume Score & Analysis</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAtsModal(false)}></button>
                            </div>
                            <div className="modal-body text-center py-4">
                                {atsLoading ? (
                                    <div className="py-4">
                                        <div className="spinner-border text-info mb-3" role="status"></div>
                                        <h6 className="fw-semibold text-white">Scanning keywords & ATS compliance...</h6>
                                    </div>
                                ) : atsResult && (
                                    <div>
                                        <div className="display-2 fw-bold text-info mb-0">{atsResult.score}<span className="fs-4 text-white-50">/100</span></div>
                                        <span className="badge bg-info bg-opacity-25 text-info border border-info px-3 py-1 mt-1 mb-3">{atsResult.summaryRating}</span>
                                        <div className="text-start bg-secondary bg-opacity-10 p-3 rounded-3 border border-secondary border-opacity-25">
                                            <h6 className="fw-bold text-warning mb-2">💡 Recommended Improvements:</h6>
                                            <ul className="small text-white-50 mb-0 ps-3">
                                                {atsResult.feedback?.map((item, idx) => <li key={idx} className="mb-1">{item}</li>)}
                                                {atsResult.criticalFixes?.map((item, idx) => <li key={idx} className="text-danger mb-1 font-monospace">{item}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer border-secondary pt-2">
                                <button onClick={() => setShowAtsModal(false)} className="btn btn-outline-light btn-sm px-4">Close Analysis</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* JD MATCHER MODAL */}
            {showJdModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content bg-dark text-white border border-secondary shadow-lg rounded-4">
                            <div className="modal-header border-secondary pb-2">
                                <h5 className="modal-title fw-bold text-primary">🎯 Job Description (JD) Matcher</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowJdModal(false)}></button>
                            </div>
                            <div className="modal-body p-4 text-start">
                                <textarea
                                    rows={4}
                                    value={jdText}
                                    onChange={(e) => setJdText(e.target.value)}
                                    className="form-control glass-input text-white small mb-3"
                                    placeholder="Paste full JD here..."
                                />
                                <button
                                    onClick={handleMatchJd}
                                    disabled={jdLoading || !jdText.trim()}
                                    className="btn btn-primary fw-bold btn-sm w-100 mb-3"
                                >
                                    {jdLoading ? "Analyzing Match..." : "⚡ Compare Resume with JD"}
                                </button>
                                {jdResult && (
                                    <div className="p-3 border border-secondary border-opacity-25 rounded-3 bg-secondary bg-opacity-10">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="fw-bold">Target Alignment:</span>
                                            <span className="fs-5 fw-bold text-info">{jdResult.matchPercentage}% Match</span>
                                        </div>
                                        <div className="mb-2">
                                            <h6 className="fw-bold text-warning small mb-1">Missing Keywords:</h6>
                                            {jdResult.missingKeywords?.map((kw, i) => (
                                                <span key={i} className="badge bg-danger bg-opacity-25 text-danger border border-danger me-1 mb-1">
                                                    {kw}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer border-secondary pt-2">
                                <button onClick={() => setShowJdModal(false)} className="btn btn-outline-light btn-sm px-4">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 🚀 EXECUTIVE AI COVER LETTER MODAL */}
            {showCoverModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content bg-dark text-white border border-secondary border-opacity-30 shadow-2xl rounded-4 overflow-hidden">

                            {/* Modal Header */}
                            <div className="modal-header border-secondary border-opacity-25 py-3 px-4 bg-black bg-opacity-40">
                                <div>
                                    <h5 className="modal-title fw-bold text-info d-flex align-items-center gap-2 mb-0">
                                        ✉️ Executive Cover Letter Suite
                                    </h5>
                                    <span className="text-white-50 extra-small">
                                        Generates tailored, corporate-ready pitch letters using candidate resume data & target JD.
                                    </span>
                                </div>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCoverModal(false)}></button>
                            </div>

                            {/* Modal Body */}
                            <div className="modal-body p-4 text-start" style={{ maxHeight: '72vh', overflowY: 'auto' }}>

                                {/* Target Input Controls */}
                                <div className="row g-2.5 mb-3">
                                    <div className="col-12 col-md-6">
                                        <label className="form-label text-white-50 extra-small mb-1 fw-bold text-uppercase">Target Job Role *</label>
                                        <input
                                            type="text"
                                            value={coverLetterInput.jobTitle}
                                            onChange={(e) => setCoverLetterInput({ ...coverLetterInput, jobTitle: e.target.value })}
                                            placeholder="e.g. Senior Full Stack Engineer"
                                            className="form-control form-control-sm glass-input text-white"
                                            required
                                        />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label text-white-50 extra-small mb-1 fw-bold text-uppercase">Company Name</label>
                                        <input
                                            type="text"
                                            value={coverLetterInput.companyName}
                                            onChange={(e) => setCoverLetterInput({ ...coverLetterInput, companyName: e.target.value })}
                                            placeholder="e.g. Google / Microsoft / Acme Corp"
                                            className="form-control form-control-sm glass-input text-white"
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label text-white-50 extra-small mb-1 fw-bold text-uppercase">
                                        Optional Job Requirements & Culture Context
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={coverLetterInput.jobDescription}
                                        onChange={(e) => setCoverLetterInput({ ...coverLetterInput, jobDescription: e.target.value })}
                                        placeholder="Paste target JD requirements, core deliverables, or company vision to tailor specific technical impact..."
                                        className="form-control glass-input text-white small"
                                        style={{ fontSize: '0.8rem' }}
                                    />
                                </div>

                                <button
                                    onClick={handleGenerateCoverLetter}
                                    disabled={coverLoading || !coverLetterInput.jobTitle.trim()}
                                    className="btn btn-info text-dark fw-bold btn-sm w-100 py-2.5 mb-4 shadow"
                                >
                                    {coverLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Analyzing Candidate Experience & Tailoring Letter...
                                        </>
                                    ) : (
                                        "✨ Write Targeted Professional Cover Letter"
                                    )}
                                </button>

                                {/* 🚀 Formatted Cover Letter Output Area */}
                                {coverLetterText && (
                                    <div className="p-3 border border-info border-opacity-30 rounded-3 bg-black bg-opacity-40 shadow-inner">
                                        <div className="d-flex flex-wrap justify-content-between align-items-center mb-2.5 pb-2 border-bottom border-secondary border-opacity-25 gap-2">
                                            <div>
                                                <span className="fw-bold text-info small d-block">Tailored Cover Letter Preview</span>
                                                <span className="text-white-50 extra-small" style={{ fontSize: '0.7rem' }}>
                                                    Words: {coverLetterText.trim().split(/\s+/).length} | PDF outputs with candidate letterhead
                                                </span>
                                            </div>

                                            {/* Action Buttons: Copy Text + Download PDF */}
                                            <div className="d-flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={handleCopyCoverLetter}
                                                    className="btn btn-outline-info btn-xs py-1.5 px-3 d-flex align-items-center gap-1.5"
                                                    style={{ fontSize: '0.76rem', borderRadius: '6px' }}
                                                >
                                                    <span>📋</span>
                                                    <span>Copy Text</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={handleDownloadCoverLetterPDF}
                                                    className="btn btn-info text-dark fw-bold btn-xs py-1.5 px-3.5 d-flex align-items-center gap-1.5 shadow"
                                                    style={{ fontSize: '0.76rem', borderRadius: '6px' }}
                                                >
                                                    <span>📥</span>
                                                    <span>Download PDF Letter</span>
                                                </button>
                                            </div>
                                        </div>

                                        <textarea
                                            rows={12}
                                            value={coverLetterText}
                                            onChange={(e) => setCoverLetterText(e.target.value)}
                                            className="form-control glass-input text-white small border-0 p-2"
                                            style={{
                                                fontSize: '0.84rem',
                                                lineHeight: '1.6',
                                                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                                                borderRadius: '8px'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer border-secondary border-opacity-25 py-2.5 px-4 bg-black bg-opacity-40">
                                <button onClick={() => setShowCoverModal(false)} className="btn btn-outline-secondary btn-sm px-4 rounded-pill">
                                    Close
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </>
    );
}