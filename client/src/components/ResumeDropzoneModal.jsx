// client/src/components/ResumeDropzoneModal.jsx
import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useResumeStore } from '../store/useResumeStore';

export default function ResumeDropzoneModal({ isOpen, onClose, showToast }) {
    const navigate = useNavigate();
    const { setFullResume, setStep } = useResumeStore();
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === 'application/pdf') {
                setFile(droppedFile);
            } else {
                showToast("Please upload a PDF file only.", "danger");
            }
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUploadAndAnalyze = async () => {
        if (!file) {
            showToast("Please select or drag a resume PDF first.", "danger");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('resumePdf', file);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:6050/api/resume/upload-parse', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.data.success) {
                // 🚀 State Store me pura resume set karein
                setFullResume(res.data.resumeData);
                showToast("Resume parsed successfully with AI! 🚀", "success");
                onClose();
                // Final Review step (Step 8) par direct bhej dein jahan ATS score, template change aur download available hain
                setStep(8);
                navigate('/build-resume');
            }
        } catch (error) {
            console.error("Upload parse error:", error);
            showToast(error.response?.data?.message || "Failed to analyze uploaded resume.", "danger");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)', zIndex: 1070 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content bg-dark text-white border border-info border-opacity-30 rounded-4 shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="modal-header border-secondary border-opacity-25 py-3 px-4 bg-black bg-opacity-40">
                        <div>
                            <h5 className="modal-title fw-bold text-info d-flex align-items-center gap-2 mb-0">
                                📤 Instant Resume Import & AI Audit
                            </h5>
                            <span className="text-white-50 extra-small">
                                Drag & drop your PDF resume to auto-fill templates, audit ATS scores, or fit into 1 page.
                            </span>
                        </div>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    {/* Body Drop Area */}
                    <div className="modal-body p-4 text-center">
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`p-5 rounded-4 border-2 border-dashed cursor-pointer transition-all ${isDragging ? 'border-info bg-info bg-opacity-10' : 'border-secondary border-opacity-40 bg-black bg-opacity-20'
                                }`}
                            style={{ cursor: 'pointer' }}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf"
                                className="d-none"
                                onChange={handleFileSelect}
                            />
                            <div className="fs-1 mb-2">📄</div>
                            <h5 className="fw-bold text-white mb-1">
                                {file ? file.name : "Drag and drop your PDF resume here"}
                            </h5>
                            <p className="text-white-50 small mb-3">
                                {file ? `${(file.size / 1024).toFixed(1)} KB selected` : "or click to browse from your computer (Max 5MB)"}
                            </p>
                            <span className="badge bg-info bg-opacity-20 text-white border border-info border-opacity-30 px-3 py-1 rounded-pill extra-small">
                                Auto-parses Personal Info, Experience, Skills & Projects
                            </span>
                        </div>

                        {/* Action buttons */}
                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <button type="button" onClick={onClose} className="btn btn-outline-secondary btn-sm px-4 rounded-pill">
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={loading || !file}
                                onClick={handleUploadAndAnalyze}
                                className="btn btn-info text-dark fw-bold btn-sm px-4 py-2 rounded-pill shadow d-flex align-items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm text-dark"></span>
                                        <span>AI Parsing Resume Content...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>⚡</span>
                                        <span>Import & Open in Suite</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}