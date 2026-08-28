// client/src/components/JobBoardModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useResumeStore } from '../store/useResumeStore';

export default function JobBoardModal({ isOpen, onClose, showToast }) {
    const { resumeData, setFullResume } = useResumeStore();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [insertingId, setInsertingId] = useState(null);

    const targetRole = resumeData?.personalInfo?.title || 'Software Engineer';

    useEffect(() => {
        if (!isOpen) return;
        const fetchJobs = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:6050/api/jobs/live-jobs?role=${encodeURIComponent(targetRole)}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) setJobs(res.data.jobs);
            } catch (err) {
                showToast("Failed to load live jobs.", "danger");
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, [isOpen, targetRole]);

    // Handle Auto Keyword Insertion directly into Resume Store
    const handleAutoInsert = async (job) => {
        setInsertingId(job.id);
        try {
            const token = localStorage.getItem('token');
            const currentSkills = Array.isArray(resumeData.skills)
                ? resumeData.skills
                : (resumeData.skills?.skillsList || []);

            const res = await axios.post(
                'http://localhost:6050/api/jobs/auto-insert-keywords',
                { currentSkills, jobKeywords: job.skillsRequired },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                // Update Zustand store live
                setFullResume({
                    ...resumeData,
                    skills: res.data.updatedSkills
                });
                showToast(`✨ ${res.data.insertedKeywords.join(', ')} inserted into skills!`, "success");
            }
        } catch (err) {
            showToast("Failed to auto-insert keywords.", "danger");
        } finally {
            setInsertingId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content bg-dark text-white border border-secondary rounded-4">
                    <div className="modal-header border-secondary pb-2">
                        <h5 className="modal-title fw-bold text-info d-flex align-items-center gap-2">
                            💼 Live Target Jobs & Auto Keyword Synchronizer
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    <div className="modal-body p-4 text-start">
                        <p className="text-white-50 small mb-3">
                            Showing live openings matching your role: <span className="text-info fw-bold">{targetRole}</span>
                        </p>

                        {loading ? (
                            <div className="text-center py-4">
                                <div className="spinner-border text-info mb-2" role="status"></div>
                                <p className="text-white-50 small">Searching live market job boards...</p>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {jobs.map((job) => (
                                    <div key={job.id} className="p-3 border border-secondary border-opacity-25 rounded-3 bg-secondary bg-opacity-10">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div>
                                                <h6 className="fw-bold text-white mb-0">{job.title}</h6>
                                                <span className="text-info extra-small">{job.company} • {job.location} ({job.salary})</span>
                                            </div>
                                            <a href={job.redirectUrl} target="_blank" rel="noreferrer" className="btn btn-outline-light btn-xs px-2 py-1" style={{ fontSize: '0.75rem' }}>
                                                Apply Link ↗
                                            </a>
                                        </div>

                                        <p className="extra-small text-white-50 mb-2">{job.description}</p>

                                        {/* Required Skills & Auto-Insert CTA */}
                                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-2 border-top border-secondary border-opacity-25">
                                            <div className="d-flex flex-wrap gap-1">
                                                {job.skillsRequired.map((sk, idx) => (
                                                    <span key={idx} className="badge bg-dark text-info border border-info border-opacity-25 extra-small">
                                                        {sk}
                                                    </span>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => handleAutoInsert(job)}
                                                disabled={insertingId === job.id}
                                                className="btn btn-warning text-dark fw-bold btn-xs py-1 px-2.5"
                                                style={{ fontSize: '0.75rem', borderRadius: '6px' }}
                                            >
                                                {insertingId === job.id ? 'Inserting...' : '⚡ Auto-Insert Keywords'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="modal-footer border-secondary pt-2">
                        <button onClick={onClose} className="btn btn-outline-light btn-sm px-4">Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
}