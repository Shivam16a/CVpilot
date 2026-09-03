// client/src/components/JobBoardModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useResumeStore } from '../store/useResumeStore';

export default function JobBoardModal({ isOpen, onClose, showToast }) {
    const { resumeData, setFullResume } = useResumeStore();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [insertingId, setInsertingId] = useState(null);

    // Active resume role se title pick karo
    const currentResumeTitle = resumeData?.personalInfo?.title?.trim() || 'Software Engineer';
    const [searchRole, setSearchRole] = useState(currentResumeTitle);

    const fetchJobs = async (queryRole) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(
                `http://localhost:6050/api/jobs/live-jobs?role=${encodeURIComponent(queryRole)}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                setJobs(res.data.jobs || []);
            }
        } catch (err) {
            console.error("Job load error:", err);
            showToast("Failed to load live jobs.", "danger");
        } finally {
            setLoading(false);
        }
    };

    // Jab modal open ho ya user dusra resume switch kare, fresh fetch trigger ho
    useEffect(() => {
        if (isOpen) {
            const role = resumeData?.personalInfo?.title?.trim() || 'Software Engineer';
            setSearchRole(role);
            fetchJobs(role);
        }
    }, [isOpen, resumeData?.personalInfo?.title]);

    // Manual search handler (User role badal kar search kar sake)
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchRole.trim()) {
            fetchJobs(searchRole.trim());
        }
    };

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
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content bg-dark text-white border border-secondary border-opacity-30 rounded-4 shadow-2xl overflow-hidden">

                    {/* Header */}
                    <div className="modal-header border-secondary border-opacity-25 py-3 px-4 bg-black bg-opacity-40">
                        <div>
                            <h5 className="modal-title fw-bold text-info d-flex align-items-center gap-2 mb-0">
                                💼 Live Target Jobs & Auto Keyword Synchronizer
                            </h5>
                            <span className="text-white-50 extra-small">
                                Real-time openings matched against your resume title & skills.
                            </span>
                        </div>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    {/* Interactive Role Search & Filter Bar */}
                    <div className="p-3 border-bottom border-secondary border-opacity-20 bg-black bg-opacity-20">
                        <form onSubmit={handleSearchSubmit} className="d-flex gap-2">
                            <input
                                type="text"
                                value={searchRole}
                                onChange={(e) => setSearchRole(e.target.value)}
                                placeholder="Search by role or tech (e.g. MERN, Security Analyst, DevOps)..."
                                className="form-control form-control-sm glass-input text-white"
                                style={{ fontSize: '0.82rem' }}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-info text-dark fw-bold btn-sm px-3 flex-shrink-0"
                                style={{ fontSize: '0.8rem' }}
                            >
                                {loading ? 'Searching...' : '🔍 Search'}
                            </button>
                        </form>
                    </div>

                    {/* Jobs List Body */}
                    <div className="modal-body p-3 p-md-4 text-start" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border spinner-border-sm text-info mb-2" role="status"></div>
                                <p className="text-white-50 small mb-0">Fetching live openings for <strong>"{searchRole}"</strong>...</p>
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="text-center py-5 border border-dashed border-secondary border-opacity-25 rounded-3">
                                <span className="fs-3 mb-1 d-block">📭</span>
                                <p className="text-white-50 small mb-0">No jobs found for "{searchRole}". Try searching with a broader title.</p>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {jobs.map((job) => (
                                    <div key={job.id} className="p-3 border border-secondary border-opacity-25 rounded-3 bg-secondary bg-opacity-10 hover-border-info transition-all">
                                        <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
                                            <div>
                                                <h6 className="fw-bold text-white mb-0">{job.title}</h6>
                                                <span className="text-info extra-small">
                                                    {job.company} • {job.location} ({job.salary})
                                                </span>
                                            </div>
                                            <a
                                                href={job.redirectUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="btn btn-outline-light btn-xs px-2.5 py-1 extra-small rounded-pill flex-shrink-0"
                                                style={{ fontSize: '0.72rem' }}
                                            >
                                                Apply Link ↗
                                            </a>
                                        </div>

                                        <p className="extra-small text-white-50 mb-2.5 lh-sm">{job.description}</p>

                                        {/* Required Skills & Auto-Insert CTA */}
                                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-2 border-top border-secondary border-opacity-25">
                                            <div className="d-flex flex-wrap gap-1">
                                                {job.skillsRequired?.map((sk, idx) => (
                                                    <span key={idx} className="badge bg-dark text-info border border-info border-opacity-25 extra-small" style={{ fontSize: '0.68rem' }}>
                                                        {sk}
                                                    </span>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => handleAutoInsert(job)}
                                                disabled={insertingId === job.id}
                                                className="btn btn-warning text-dark fw-bold btn-xs py-1 px-2.5"
                                                style={{ fontSize: '0.72rem', borderRadius: '6px' }}
                                            >
                                                {insertingId === job.id ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm text-dark me-1"></span>
                                                        Inserting...
                                                    </>
                                                ) : (
                                                    '⚡ Auto-Insert Keywords'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="modal-footer border-secondary border-opacity-25 py-2.5 px-4 bg-black bg-opacity-40">
                        <button onClick={onClose} className="btn btn-outline-secondary btn-sm px-4 rounded-pill">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}