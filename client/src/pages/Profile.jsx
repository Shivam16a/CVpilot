// client/src/pages/Profile.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResumeStore } from '../store/useResumeStore';
import Toast from '../components/Toast';

export default function Profile() {
    const navigate = useNavigate();
    const { loadSavedResume } = useResumeStore();
    const [userData, setUserData] = useState(null);
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ message: '', type: 'success' });

    const fetchProfileData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch('http://localhost:6050/api/resume/user-dashboard', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                setUserData(data.user);
                setResumes(data.resumes || []);
            } else {
                setToast({ message: data.message || "Failed to fetch profile.", type: 'danger' });
            }
        } catch (error) {
            console.error("Profile Fetch Error:", error);
            setToast({ message: "Network connection error.", type: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

    const handleOpenResume = (resume) => {
        loadSavedResume(resume);
        navigate('/build-resume');
    };

    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center text-white">
                <div className="spinner-border text-info" role="status"></div>
                <span className="ms-2">Loading Profile Dashboard...</span>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ message: '', type: 'success' })}
            />

            {/* Profile Header Stats Card */}
            <div className="glass-card p-4 mb-4">
                <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
                    <div className="d-flex align-items-center gap-3">
                        <div className="rounded-circle bg-info bg-opacity-25 text-info d-flex align-items-center justify-content-center fw-bold" style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>
                            {userData?.username ? userData.username.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                            <h3 className="glow-title mb-1" style={{ fontSize: '1.5rem' }}>
                                {userData?.username || 'User Profile'}
                            </h3>
                            <p className="text-white-50 small mb-0">
                                ✉️ {userData?.email} | 📞 {userData?.phone || 'N/A'}
                            </p>
                        </div>
                    </div>

                    <div className="d-flex gap-3">
                        <div className="bg-dark bg-opacity-50 px-3 py-2 rounded-3 text-center border border-secondary border-opacity-25">
                            <span className="d-block text-info fw-bold" style={{ fontSize: '1.2rem' }}>{resumes.length}</span>
                            <span className="text-white-50 x-small" style={{ fontSize: '0.75rem' }}>Total Resumes</span>
                        </div>
                        <button
                            onClick={() => navigate('/select-template')}
                            className="btn btn-premium px-3 py-2 fw-semibold d-flex align-items-center gap-1"
                            style={{ fontSize: '0.85rem' }}
                        >
                            ➕ Create New Resume
                        </button>
                    </div>
                </div>
            </div>

            {/* Resumes Collection Section */}
            <div className="mb-3">
                <h5 className="fw-bold text-white mb-1">Your Saved Resumes</h5>
                <p className="text-white-50 small">Manage, edit, or preview all your created master resumes.</p>
            </div>

            {resumes.length === 0 ? (
                <div className="glass-card p-5 text-center text-white-50">
                    <h5>No Resumes Found 📄</h5>
                    <p className="small mb-3">You haven't saved any resume documents yet.</p>
                    <button onClick={() => navigate('/select-template')} className="btn btn-info text-dark fw-bold btn-sm px-4 py-2">
                        Create Your First Resume
                    </button>
                </div>
            ) : (
                <div className="row g-3">
                    {resumes.map((res, index) => (
                        <div key={res._id || index} className="col-12 col-md-6 col-lg-4">
                            <div className="glass-card p-3 h-100 d-flex flex-column justify-content-between border-secondary border-opacity-25">
                                <div>
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 small">
                                            {res.template ? res.template.replace('template-', '').toUpperCase() : 'STANDARD ATS'}
                                        </span>
                                        <span className="text-white-50 x-small" style={{ fontSize: '0.7rem' }}>
                                            {res.updatedAt ? new Date(res.updatedAt).toLocaleDateString() : 'Recent'}
                                        </span>
                                    </div>

                                    <h6 className="fw-bold text-white mb-1">
                                        {res.personalInfo?.fullName || 'Untitled Resume'}
                                    </h6>
                                    <p className="text-info text-opacity-75 small mb-2" style={{ fontSize: '0.8rem' }}>
                                        {res.personalInfo?.title || 'No Title Specified'}
                                    </p>

                                    <div className="text-white-50 small mb-3" style={{ fontSize: '0.75rem' }}>
                                        <div>Skills: {res.skills?.length || 0} Listed</div>
                                        <div>Experience: {res.experience?.length || 0} Items</div>
                                    </div>
                                </div>

                                <div className="d-flex gap-2 pt-2 border-top border-secondary border-opacity-25">
                                    <button
                                        onClick={() => handleOpenResume(res)}
                                        className="btn btn-outline-info btn-sm w-100 fw-medium"
                                        style={{ fontSize: '0.8rem' }}
                                    >
                                        ✏️ Edit & Preview
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