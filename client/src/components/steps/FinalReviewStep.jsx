// client/src/components/steps/FinalReviewStep.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useResumeStore } from '../../store/useResumeStore';
import { generateResumePDF } from '../../utils/pdfGenerator';
import Toast from '../Toast';
import JobBoardModal from '../JobBoardModal';

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
    const [coverLetterInput, setCoverLetterInput] = useState({ jobTitle: '', companyName: '', jobDescription: '' });
    const [coverLetterText, setCoverLetterText] = useState('');
    const [coverLoading, setCoverLoading] = useState(false);
    const [showCoverModal, setShowCoverModal] = useState(false);

    const [resumeTitle, setResumeTitle] = useState(resumeData.resumeTitle || 'My FullStack Resume');
    const [toast, setToast] = useState({ message: '', type: 'success' });

    const showToast = (message, type = 'success') => setToast({ message, type });

    // PDF Download Handler
    const handleDownloadPDF = () => {
        try {
            generateResumePDF(resumeData, resumeTitle || 'Resume', selectedTemplate || 'template-ats');
            showToast("PDF Downloaded in selected template style!", "success");
        } catch (error) {
            console.error("PDF Error:", error);
            showToast("Failed to generate PDF.", "danger");
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

    // Cover Letter Handler
    const handleGenerateCoverLetter = async () => {
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
                showToast("Cover Letter generated successfully!", "success");
            }
        } catch (error) {
            showToast("Failed to generate Cover Letter.", "danger");
        } finally {
            setCoverLoading(false);
        }
    };

    // Copy Cover Letter Text
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

                    <div className="d-flex flex-wrap align-items-center justify-content-start gap-2 border-bottom border-secondary border-opacity-25 pb-3">

                        {/* Resume Title Input */}
                        <div className="d-flex align-items-center gap-1.5">
                            <span className="small text-white-50 fw-medium">Title:</span>
                            <input
                                type="text"
                                value={resumeTitle}
                                onChange={(e) => setResumeTitle(e.target.value)}
                                className="form-control form-control-sm glass-input text-white py-1"
                                placeholder="e.g. React Developer CV"
                                style={{ width: '160px', fontSize: '0.8rem' }}
                            />
                        </div>

                        {/* Template Switcher */}
                        <select
                            value={selectedTemplate || 'template-ats'}
                            onChange={(e) => setTemplate(e.target.value)}
                            className="form-select form-select-sm bg-dark text-white border-secondary py-1.5"
                            style={{ fontSize: '0.8rem', width: '145px', borderRadius: '8px' }}
                        >
                            <option value="template-ats">Standard ATS</option>
                            <option value="template-sidebar">Modern Sidebar</option>
                            <option value="template-corporate">Clean Corporate</option>
                            <option value="template-header-banner">Executive Banner</option>
                            <option value="template-classic-table">Classic Academic</option>
                        </select>

                        {/* Edit Button */}
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="btn btn-outline-light btn-sm py-1.5 px-3 fw-medium"
                            style={{ borderRadius: '8px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                        >
                            ✏️ Edit
                        </button>

                        {/* Save Action */}
                        <button
                            type="button"
                            disabled={dbLoading}
                            onClick={handleSaveToProfile}
                            className="btn btn-info text-dark btn-sm py-1.5 px-3 fw-semibold"
                            style={{ borderRadius: '8px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                        >
                            {dbLoading ? 'Saving...' : '☁️ Save to Profile'}
                        </button>

                        {/* ANALYZE ATS BUTTON */}
                        <button
                            type="button"
                            onClick={handleAnalyzeAts}
                            className="btn btn-warning text-dark btn-sm py-1.5 px-3 fw-bold"
                            style={{ borderRadius: '8px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                        >
                            🚀 Analyze ATS
                        </button>

                        {/* MATCH TARGET JD BUTTON */}
                        <button
                            type="button"
                            onClick={() => setShowJdModal(true)}
                            className="btn btn-primary btn-sm py-1.5 px-3 fw-bold"
                            style={{ borderRadius: '8px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                        >
                            🎯 Match Target JD
                        </button>

                        {/* AI COVER LETTER BUTTON */}
                        <button
                            type="button"
                            onClick={() => setShowCoverModal(true)}
                            className="btn btn-outline-info btn-sm py-1.5 px-3 fw-bold"
                            style={{ borderRadius: '8px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                        >
                            ✉️ AI Cover Letter
                        </button>

                        {/* LIVE JOBS BUTTON */}
                        <button
                            type="button"
                            onClick={() => setShowJobBoard(true)}
                            className="btn btn-outline-warning btn-sm py-1.5 px-3 fw-bold"
                            style={{ borderRadius: '8px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                        >
                            💼 Live Jobs & Keywords
                        </button>

                        {/* New Resume Action */}
                        <button
                            type="button"
                            onClick={handleCreateNewResume}
                            className="btn btn-success btn-sm py-1.5 px-3 fw-semibold"
                            style={{ borderRadius: '8px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                        >
                            ➕ New Resume
                        </button>

                        {/* Download PDF Button */}
                        <button
                            type="button"
                            onClick={handleDownloadPDF}
                            className="btn btn-premium btn-sm py-1.5 px-3 fw-semibold"
                            style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                        >
                            📥 Download PDF
                        </button>

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

            {/* LIVE JOBS MODAL (Placed outside button group layout) */}
            <JobBoardModal
                isOpen={showJobBoard}
                onClose={() => setShowJobBoard(false)}
                showToast={showToast}
            />

            {/* ATS SCORE MODAL */}
            {showAtsModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }}>
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
                                <textarea rows={4} value={jdText} onChange={(e) => setJdText(e.target.value)} className="form-control glass-input text-white small mb-3" placeholder="Paste full JD here..." />
                                <button onClick={handleMatchJd} disabled={jdLoading || !jdText.trim()} className="btn btn-primary fw-bold btn-sm w-100 mb-3">
                                    {jdLoading ? "Analyzing Match..." : "⚡ Compare Resume with JD"}
                                </button>
                                {jdResult && (
                                    <div className="p-3 border border-secondary border-opacity-25 rounded-3 bg-secondary bg-opacity-10">
                                        <div className="d-flex justify-content-between align-items-center mb-2"><span className="fw-bold">Target Alignment:</span><span className="fs-5 fw-bold text-info">{jdResult.matchPercentage}% Match</span></div>
                                        <div className="mb-2"><h6 className="fw-bold text-warning small mb-1">Missing Keywords:</h6>{jdResult.missingKeywords?.map((kw, i) => <span key={i} className="badge bg-danger bg-opacity-25 text-danger border border-danger me-1">{kw}</span>)}</div>
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

            {/* AI COVER LETTER POPUP MODAL */}
            {showCoverModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content bg-dark text-white border border-secondary shadow-lg rounded-4">
                            <div className="modal-header border-secondary pb-2">
                                <h5 className="modal-title fw-bold text-info d-flex align-items-center gap-2">
                                    ✉️ AI Cover Letter Generator
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCoverModal(false)}></button>
                            </div>

                            <div className="modal-body p-4 text-start">
                                <div className="row g-2 mb-3">
                                    <div className="col-12 col-md-6">
                                        <label className="form-label text-white-50 small mb-1">Target Job Title:</label>
                                        <input
                                            type="text"
                                            value={coverLetterInput.jobTitle}
                                            onChange={(e) => setCoverLetterInput({ ...coverLetterInput, jobTitle: e.target.value })}
                                            placeholder="e.g. Senior Frontend Engineer"
                                            className="form-control glass-input text-white small"
                                        />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label text-white-50 small mb-1">Company Name:</label>
                                        <input
                                            type="text"
                                            value={coverLetterInput.companyName}
                                            onChange={(e) => setCoverLetterInput({ ...coverLetterInput, companyName: e.target.value })}
                                            placeholder="e.g. Google / Microsoft"
                                            className="form-control glass-input text-white small"
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label text-white-50 small mb-1">Optional JD Context:</label>
                                    <textarea
                                        rows={3}
                                        value={coverLetterInput.jobDescription}
                                        onChange={(e) => setCoverLetterInput({ ...coverLetterInput, jobDescription: e.target.value })}
                                        placeholder="Paste short JD requirements or company description for better tailoring..."
                                        className="form-control glass-input text-white small"
                                    />
                                </div>

                                <button
                                    onClick={handleGenerateCoverLetter}
                                    disabled={coverLoading}
                                    className="btn btn-info text-dark fw-bold btn-sm w-100 py-2 mb-4"
                                >
                                    {coverLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Writing Tailored Cover Letter...
                                        </>
                                    ) : (
                                        "✨ Generate Cover Letter with AI"
                                    )}
                                </button>

                                {/* Cover Letter Output Display */}
                                {coverLetterText && (
                                    <div className="p-3 border border-info border-opacity-25 rounded-3 bg-dark">
                                        <div className="d-flex justify-content-between align-items-center mb-2 border-bottom border-secondary pb-2">
                                            <span className="fw-bold text-info small">Generated Cover Letter:</span>
                                            <button
                                                onClick={handleCopyCoverLetter}
                                                className="btn btn-outline-info btn-xs py-1 px-2.5"
                                                style={{ fontSize: '0.75rem' }}
                                            >
                                                📋 Copy to Clipboard
                                            </button>
                                        </div>
                                        <textarea
                                            rows={10}
                                            value={coverLetterText}
                                            onChange={(e) => setCoverLetterText(e.target.value)}
                                            className="form-control glass-input text-white small border-0"
                                            style={{ fontSize: '0.85rem', lineHeight: '1.5' }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer border-secondary pt-2">
                                <button onClick={() => setShowCoverModal(false)} className="btn btn-outline-light btn-sm px-4">
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