// client/src/pages/Profile.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useResumeStore } from '../store/useResumeStore';
import Toast from '../components/Toast';

export default function Profile() {
    const navigate = useNavigate();
    const { setResumeData, startNewResume } = useResumeStore();

    const [user, setUser] = useState(null);
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [toast, setToast] = useState({ message: '', type: 'success' });

    const showToast = (message, type = 'success') => setToast({ message, type });

    // 1. Fetch User Dashboard Data (Profile + All Resumes)
    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const res = await axios.get('http://localhost:6050/api/resume/user-dashboard', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setUser(res.data.user);
                setResumes(res.data.resumes || []);
            }
        } catch (err) {
            console.error("Dashboard Fetch Error:", err);
            showToast("Failed to load profile data", "danger");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // 2. Edit Handler
    const handleEditResume = (resumeItem) => {
        if (setResumeData) {
            setResumeData(resumeItem);
        }
        navigate(`/build-resume?id=${resumeItem._id}`);
    };

    // 🚀 3. NEW: Delete Resume Handler
    const handleDeleteResume = async (resumeId, resumeTitle) => {
        if (!window.confirm(`Are you sure you want to delete "${resumeTitle || 'Untitled Resume'}"?`)) {
            return;
        }

        setDeletingId(resumeId);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.delete(`http://localhost:6050/api/resume/delete/${resumeId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                showToast("Resume deleted successfully!", "success");
                // Local state update without page reload
                setResumes(prev => prev.filter(r => r._id !== resumeId));
            } else {
                showToast(res.data.message || "Failed to delete resume.", "danger");
            }
        } catch (err) {
            console.error("Delete Resume Error:", err);
            showToast("Network error deleting resume.", "danger");
        } finally {
            setDeletingId(null);
        }
    };

    // 4. Create New Fresh Resume Action
    const handleCreateNew = () => {
        startNewResume();
        navigate('/select-template');
    };

    return (
        <div className="container py-4 text-white">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

            {/* Profile Header */}
            <div className="p-4 border border-secondary border-opacity-25 rounded-3 bg-dark bg-opacity-50 mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div className="d-flex align-items-center gap-3">
                    <div className="avatar-circle bg-info text-dark fw-bold fs-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', borderRadius: '50%' }}>
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                        <h4 className="fw-bold mb-1 text-white">{user?.username || 'User Profile'}</h4>
                        <p className="text-white-50 small mb-0">✉️ {user?.email} | 📞 {user?.phone || 'N/A'}</p>
                    </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                    <div className="text-center px-3 border-end border-secondary">
                        <h3 className="fw-bold text-info mb-0">{resumes.length}</h3>
                        <span className="text-white-50 extra-small">Total Resumes</span>
                    </div>
                    <button onClick={handleCreateNew} className="btn btn-info text-dark fw-bold btn-sm py-2 px-3">
                        ➕ Create New Resume
                    </button>
                </div>
            </div>

            {/* Saved Resumes Section */}
            <h5 className="fw-bold mb-3 text-info">Your Saved Resumes</h5>

            {loading ? (
                <div className="text-center py-5 text-white-50">Loading saved resumes...</div>
            ) : resumes.length === 0 ? (
                <div className="text-center py-5 border border-dashed border-secondary rounded-3">
                    <p className="text-white-50 mb-3">No saved resumes found in your account.</p>
                    <button onClick={handleCreateNew} className="btn btn-outline-info btn-sm">Start Building Now</button>
                </div>
            ) : (
                <div className="row g-3">
                    {resumes.map((item) => (
                        <div key={item._id} className="col-12 col-md-6 col-lg-4">
                            <div className="p-3 border border-secondary border-opacity-25 rounded-3 bg-dark bg-opacity-50 h-100 d-flex flex-column justify-content-between">
                                <div>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25" style={{ fontSize: '0.7rem' }}>
                                            {item.templateId || item.template || 'STANDARD ATS'}
                                        </span>
                                        <span className="text-white-50 extra-small" style={{ fontSize: '0.75rem' }}>
                                            {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h6 className="fw-bold text-white mb-1">{item.personalInfo?.fullName || item.resumeTitle || 'Untitled Resume'}</h6>
                                    <p className="text-info small mb-2">{item.resumeTitle || 'No Title'}</p>

                                    <div className="text-white-50 extra-small mb-3" style={{ fontSize: '0.8rem' }}>
                                        <div>Skills: {item.skills?.skillsList?.length || item.skills?.length || 0} Listed</div>
                                        <div>Experience: {item.experience?.length || 0} Items</div>
                                    </div>
                                </div>

                                {/* 🚀 ACTION BUTTONS (Preview + Delete) */}
                                <div className="d-flex gap-2">
                                    <button
                                        onClick={() => handleEditResume(item)}
                                        className="btn btn-outline-info btn-sm w-100 py-1.5"
                                        style={{ borderRadius: '6px' }}
                                    >
                                        ✏️ Preview / Edit
                                    </button>

                                    <button
                                        disabled={deletingId === item._id}
                                        onClick={() => handleDeleteResume(item._id, item.resumeTitle)}
                                        className="btn btn-outline-danger btn-sm py-1.5 px-3"
                                        style={{ borderRadius: '6px' }}
                                        title="Delete Resume"
                                    >
                                        {deletingId === item._id ? '...' : '🗑️'}
                                    </button>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}