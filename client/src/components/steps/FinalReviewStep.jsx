// client/src/components/steps/FinalReviewStep.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResumeStore } from '../../store/useResumeStore';
import { generateResumePDF } from '../../utils/pdfGenerator'; // 🚀 Import PDF Generator
import Toast from '../Toast';

export default function FinalReviewStep() {
    const navigate = useNavigate();
    const { resumeData, setStep, selectedTemplate, setTemplate, setFullResume, startNewResume } = useResumeStore();
    const [dbLoading, setDbLoading] = useState(false);

    const [resumeTitle, setResumeTitle] = useState(resumeData.resumeTitle || 'My FullStack Resume');
    const [toast, setToast] = useState({ message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    // 🚀 FIXED: Generates & Downloads PDF directly using jsPDF
    const handleDownloadPDF = () => {
        try {
            // 🚀 Selected Template passing directly
            generateResumePDF(resumeData, resumeTitle || 'Resume', selectedTemplate || 'template-ats');
            showToast("PDF Downloaded in selected template style!", "success");
        } catch (error) {
            console.error("PDF Error:", error);
            showToast("Failed to generate PDF.", "danger");
        }
    };

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

                        {/* New Resume Action */}
                        <button
                            type="button"
                            onClick={handleCreateNewResume}
                            className="btn btn-success btn-sm py-1.5 px-3 fw-semibold"
                            style={{ borderRadius: '8px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                        >
                            ➕ New Resume
                        </button>

                        {/* 🚀 DOWNLOAD PDF BUTTON */}
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
                            Name your resume document, download a high-quality ATS PDF, and save to your cloud profile.
                        </p>
                    </div>

                </div>
            </div>
        </>
    );
}