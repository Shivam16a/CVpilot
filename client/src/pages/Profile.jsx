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

    // Settings Modal & Profile Edit State
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(localStorage.getItem('user_avatar') || '');
    const [profileForm, setProfileForm] = useState({
        username: '',
        email: '',
        phone: '',
        bio: '',
        linkedin: '',
        github: '',
        portfolio: '',
        instagram: '',
        youtube: ''
    });

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
                const fetchedUser = res.data.user;
                setUser(fetchedUser);
                setResumes(res.data.resumes || []);

                // Load saved profile fields or fallback to localStorage
                const savedSocials = JSON.parse(localStorage.getItem('user_socials') || '{}');
                setProfileForm({
                    username: fetchedUser?.username || '',
                    email: fetchedUser?.email || '',
                    phone: fetchedUser?.phone || savedSocials.phone || '',
                    bio: savedSocials.bio || '',
                    linkedin: savedSocials.linkedin || '',
                    github: savedSocials.github || '',
                    portfolio: savedSocials.portfolio || '',
                    instagram: savedSocials.instagram || '',
                    youtube: savedSocials.youtube || ''
                });
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

    // 3. Delete Resume Handler
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

    // 5. Profile Picture Base64 Encoder & LocalStorage Sync
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            showToast("Image size must be less than 2MB", "danger");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result;
            setAvatarPreview(base64String);
            localStorage.setItem('user_avatar', base64String);
            showToast("Profile avatar updated & cached!", "success");
        };
        reader.readAsDataURL(file);
    };

    // Remove Profile Photo
    const handleRemoveImage = () => {
        setAvatarPreview('');
        localStorage.removeItem('user_avatar');
        showToast("Profile picture removed", "info");
    };

    // 6. Save Profile & Social Details Handler
    const handleSaveProfileSettings = (e) => {
        e.preventDefault();

        const socialsData = {
            phone: profileForm.phone,
            bio: profileForm.bio,
            linkedin: profileForm.linkedin,
            github: profileForm.github,
            portfolio: profileForm.portfolio,
            instagram: profileForm.instagram,
            youtube: profileForm.youtube
        };
        localStorage.setItem('user_socials', JSON.stringify(socialsData));

        setUser(prev => ({
            ...prev,
            username: profileForm.username,
            phone: profileForm.phone
        }));

        setShowSettingsModal(false);
        showToast("Profile updated successfully!", "success");
    };

    return (
        <div className="container py-4 py-md-5 text-white" style={{ maxWidth: '1200px' }}>
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

            {/* ==================== 1. EXECUTIVE PROFILE HERO BANNER ==================== */}
            <div
                className="p-4 p-lg-5 rounded-4 position-relative overflow-hidden mb-5 border border-secondary border-opacity-25 shadow-lg"
                style={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 100%)',
                    backdropFilter: 'blur(20px)'
                }}
            >
                {/* Background ambient lighting */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-50px',
                        right: '-50px',
                        width: '280px',
                        height: '280px',
                        background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)',
                        pointerEvents: 'none'
                    }}
                />

                <div className="row align-items-center g-4">

                    {/* Left: Interactive Avatar & Bio Details */}
                    <div className="col-12 col-lg-8">
                        <div className="d-flex flex-column flex-sm-row align-items-center align-items-sm-start text-center text-sm-start gap-3 gap-md-4">

                            {/* Avatar with Quick Upload Hover Overlay */}
                            <div className="position-relative flex-shrink-0">
                                <div
                                    className="rounded-circle overflow-hidden border border-2 border-info shadow-lg d-flex align-items-center justify-content-center bg-dark"
                                    style={{ width: '96px', height: '96px' }}
                                >
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="User Avatar" className="w-100 h-100 object-fit-cover" />
                                    ) : (
                                        <span className="fs-1 fw-bold text-info">
                                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    )}
                                </div>

                                <label
                                    className="position-absolute bottom-0 end-0 bg-info text-dark rounded-circle p-1.5 shadow border border-dark d-flex align-items-center justify-content-center cursor-pointer"
                                    style={{ width: '30px', height: '30px', cursor: 'pointer' }}
                                    title="Upload Photo"
                                >
                                    <span style={{ fontSize: '0.85rem' }}>📷</span>
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="d-none" />
                                </label>
                            </div>

                            {/* User Text Info */}
                            <div className="flex-grow-1">
                                <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-sm-start gap-2 mb-1">
                                    <h3 className="fw-extrabold text-white mb-0">{user?.username || 'Candidate Profile'}</h3>
                                    <span className="badge bg-success bg-opacity-15 text-white border border-success border-opacity-30 rounded-pill px-2.5 py-1 extra-small">
                                        ● Active Member
                                    </span>
                                </div>

                                <p className="text-info text-opacity-80 small mb-2 fw-medium">
                                    {profileForm.bio || "Career Professional | ATS Optimization Active"}
                                </p>

                                <div className="text-white-50 extra-small d-flex flex-wrap justify-content-center justify-content-sm-start gap-3 mb-3">
                                    <span>✉️ {user?.email}</span>
                                    <span>📞 {profileForm.phone || user?.phone || 'Add phone'}</span>
                                </div>

                                {/* Dynamic Social Badges */}
                                <div className="d-flex flex-wrap justify-content-center justify-content-sm-start gap-2">
                                    {profileForm.linkedin && (
                                        <a href={profileForm.linkedin} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary py-1 px-2.5 rounded-pill extra-small d-flex align-items-center gap-1.5" style={{ fontSize: '0.74rem' }}>
                                            <span>🔗</span> LinkedIn
                                        </a>
                                    )}
                                    {profileForm.github && (
                                        <a href={profileForm.github} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-light py-1 px-2.5 rounded-pill extra-small d-flex align-items-center gap-1.5" style={{ fontSize: '0.74rem' }}>
                                            <span>🐙</span> GitHub
                                        </a>
                                    )}
                                    {profileForm.portfolio && (
                                        <a href={profileForm.portfolio} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-info py-1 px-2.5 rounded-pill extra-small d-flex align-items-center gap-1.5" style={{ fontSize: '0.74rem' }}>
                                            <span>🌐</span> Portfolio
                                        </a>
                                    )}
                                    {profileForm.instagram && (
                                        <a href={profileForm.instagram} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-danger py-1 px-2.5 rounded-pill extra-small d-flex align-items-center gap-1.5" style={{ fontSize: '0.74rem' }}>
                                            <span>📸</span> Instagram
                                        </a>
                                    )}
                                    {profileForm.youtube && (
                                        <a href={profileForm.youtube} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-danger py-1 px-2.5 rounded-pill extra-small d-flex align-items-center gap-1.5" style={{ fontSize: '0.74rem' }}>
                                            <span>▶️</span> YouTube
                                        </a>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Right: Metric Counters & Settings Action */}
                    <div className="col-12 col-lg-4 text-center text-lg-end pt-3 pt-lg-0 border-top border-lg-0 border-secondary border-opacity-25">
                        <div className="d-flex justify-content-center justify-content-lg-end gap-3 mb-3">
                            <div className="bg-black bg-opacity-30 p-2.5 px-3.5 rounded-3 border border-secondary border-opacity-30 text-center">
                                <h4 className="fw-extrabold text-info mb-0">{resumes.length}</h4>
                                <span className="text-white-50 extra-small">Resumes Built</span>
                            </div>
                            <div className="bg-black bg-opacity-30 p-2.5 px-3.5 rounded-3 border border-secondary border-opacity-30 text-center">
                                <h4 className="fw-extrabold text-success mb-0">100%</h4>
                                <span className="text-white-50 extra-small">Cloud Parsed</span>
                            </div>
                        </div>

                        <div className="d-flex flex-wrap justify-content-center justify-content-lg-end gap-2">
                            <button
                                onClick={() => setShowSettingsModal(true)}
                                className="btn btn-outline-light btn-sm py-2 px-3 fw-medium rounded-3 d-flex align-items-center gap-1.5"
                                style={{ fontSize: '0.82rem' }}
                            >
                                <span>⚙️</span> Edit Profile Details
                            </button>
                            <button
                                onClick={handleCreateNew}
                                className="btn btn-info text-dark fw-bold btn-sm py-2 px-3 rounded-3 shadow d-flex align-items-center gap-1.5"
                                style={{ fontSize: '0.82rem' }}
                            >
                                <span>➕</span> New Resume
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* ==================== 2. SAVED RESUMES LISTING SECTION ==================== */}
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div>
                    <h5 className="fw-bold mb-0 text-white d-flex align-items-center gap-2">
                        <span>📑</span> Your Saved Resumes ({resumes.length})
                    </h5>
                    <span className="text-white-50 extra-small">Cloud-synced and ready for ATS export anytime.</span>
                </div>
                {resumes.length > 0 && (
                    <button
                        onClick={handleCreateNew}
                        className="btn btn-outline-info btn-sm py-1 px-3 rounded-pill extra-small"
                    >
                        + Create Another
                    </button>
                )}
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-info mb-3" role="status"></div>
                    <p className="text-white-50 small">Loading your dashboard resumes...</p>
                </div>
            ) : resumes.length === 0 ? (
                <div className="text-center py-5 border border-dashed border-secondary border-opacity-50 rounded-4 bg-dark bg-opacity-25 p-4">
                    <div className="fs-1 mb-2">📂</div>
                    <h6 className="fw-bold text-white mb-1">No Saved Resumes Yet</h6>
                    <p className="text-white-50 small mb-3 max-w-sm mx-auto">
                        You haven't generated or saved any resume versions. Pick an ATS-ready layout to launch your career.
                    </p>
                    <button onClick={handleCreateNew} className="btn btn-info text-dark fw-bold btn-sm py-2 px-4 rounded-pill shadow">
                        🚀 Choose Layout & Start
                    </button>
                </div>
            ) : (
                <div className="row g-3 g-md-4">
                    {resumes.map((item) => {
                        const templateTag = (item.templateId || item.template || 'STANDARD ATS').replace('template-', '').toUpperCase();
                        const updateDate = new Date(item.updatedAt || item.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        });

                        return (
                            <div key={item._id} className="col-12 col-md-6 col-lg-4">
                                <div
                                    className="card h-100 border-0 rounded-4 overflow-hidden position-relative shadow-lg"
                                    style={{
                                        backgroundColor: '#0f172a',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        transition: 'transform 0.25s ease, box-shadow 0.25s ease'
                                    }}
                                >
                                    {/* Accent Top Strip */}
                                    <div style={{ height: '5px', background: 'linear-gradient(90deg, #38bdf8 0%, #0284c7 100%)' }}></div>

                                    <div className="card-body p-3.5 d-flex flex-column justify-content-between">
                                        <div>
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="badge bg-info bg-opacity-15 text-white border border-info border-opacity-25 rounded-pill px-2.5 py-1 extra-small">
                                                    {templateTag}
                                                </span>
                                                <span className="text-white-50 extra-small" style={{ fontSize: '0.72rem' }}>
                                                    🕒 {updateDate}
                                                </span>
                                            </div>

                                            <h6 className="fw-bold text-white mb-1 text-truncate" title={item.resumeTitle}>
                                                {item.resumeTitle || 'Untitled Candidate CV'}
                                            </h6>
                                            <p className="text-white-50 extra-small mb-3">
                                                Target: <strong className="text-info">{item.personalInfo?.fullName || user?.username}</strong>
                                            </p>

                                            {/* Resume Specs Grid */}
                                            <div className="p-2.5 rounded-3 bg-black bg-opacity-30 border border-secondary border-opacity-20 d-flex justify-content-around text-center mb-3">
                                                <div>
                                                    <span className="d-block text-white fw-bold small">
                                                        {item.skills?.skillsList?.length || item.skills?.length || 0}
                                                    </span>
                                                    <span className="text-white-50 extra-small" style={{ fontSize: '0.68rem' }}>Skills</span>
                                                </div>
                                                <div className="border-end border-secondary border-opacity-25"></div>
                                                <div>
                                                    <span className="d-block text-white fw-bold small">
                                                        {item.experience?.length || 0}
                                                    </span>
                                                    <span className="text-white-50 extra-small" style={{ fontSize: '0.68rem' }}>Roles</span>
                                                </div>
                                                <div className="border-end border-secondary border-opacity-25"></div>
                                                <div>
                                                    <span className="d-block text-white fw-bold small">
                                                        {item.education?.length || 0}
                                                    </span>
                                                    <span className="text-white-50 extra-small" style={{ fontSize: '0.68rem' }}>Degrees</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Bar */}
                                        <div className="d-flex gap-2 pt-2 border-top border-secondary border-opacity-20">
                                            <button
                                                onClick={() => handleEditResume(item)}
                                                className="btn btn-outline-info btn-sm flex-grow-1 py-1.5 fw-semibold d-flex align-items-center justify-content-center gap-1"
                                                style={{ borderRadius: '8px', fontSize: '0.8rem' }}
                                            >
                                                <span>✏️</span> Edit / Export
                                            </button>

                                            <button
                                                disabled={deletingId === item._id}
                                                onClick={() => handleDeleteResume(item._id, item.resumeTitle)}
                                                className="btn btn-outline-danger btn-sm py-1.5 px-3 d-flex align-items-center justify-content-center"
                                                style={{ borderRadius: '8px', fontSize: '0.8rem' }}
                                                title="Delete this resume"
                                            >
                                                {deletingId === item._id ? (
                                                    <span className="spinner-border spinner-border-sm" role="status"></span>
                                                ) : (
                                                    <span>🗑️</span>
                                                )}
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ==================== 3. MULTI-FIELD PROFILE & SOCIAL SETTINGS MODAL ==================== */}
            {showSettingsModal && (
                <div
                    className="modal show d-block"
                    style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1050 }}
                    onClick={() => setShowSettingsModal(false)}
                >
                    <div
                        className="modal-dialog modal-dialog-centered modal-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content bg-dark text-white border border-secondary border-opacity-30 rounded-4 overflow-hidden shadow-2xl">

                            <div className="modal-header border-secondary border-opacity-25 py-3 px-4 bg-black bg-opacity-40">
                                <h5 className="modal-title fw-bold text-white d-flex align-items-center gap-2 m-0" style={{ fontSize: '1.05rem' }}>
                                    <span className="text-info">⚙️</span> Edit Profile & Online Presence
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowSettingsModal(false)}></button>
                            </div>

                            <form onSubmit={handleSaveProfileSettings}>
                                <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>

                                    {/* Avatar Controls Box */}
                                    <div className="d-flex flex-column flex-sm-row align-items-center gap-3 p-3 rounded-3 border border-secondary border-opacity-25 bg-secondary bg-opacity-10 mb-4 text-center text-sm-start">
                                        <div
                                            className="rounded-circle overflow-hidden border border-2 border-info d-flex align-items-center justify-content-center bg-dark"
                                            style={{ width: '75px', height: '75px', flexShrink: 0 }}
                                        >
                                            {avatarPreview ? (
                                                <img src={avatarPreview} alt="Preview" className="w-100 h-100 object-fit-cover" />
                                            ) : (
                                                <span className="fs-2 text-info">👤</span>
                                            )}
                                        </div>

                                        <div className="flex-grow-1">
                                            <span className="text-white-50 extra-small fw-bold text-uppercase d-block mb-1">
                                                Profile Picture (Auto-Encodes to Base64)
                                            </span>
                                            <div className="d-flex flex-wrap justify-content-center justify-content-sm-start gap-2">
                                                <label className="btn btn-info text-dark btn-sm py-1 px-3 mb-0 fw-semibold cursor-pointer" style={{ cursor: 'pointer', fontSize: '0.8rem' }}>
                                                    Upload New Photo
                                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="d-none" />
                                                </label>
                                                {avatarPreview && (
                                                    <button type="button" onClick={handleRemoveImage} className="btn btn-outline-danger btn-sm py-1 px-2.5 extra-small">
                                                        Remove Photo
                                                    </button>
                                                )}
                                            </div>
                                            <span className="extra-small text-white-50 d-block mt-1" style={{ fontSize: '0.68rem' }}>
                                                PNG, JPG, or WEBP supported (Max 2MB). Cached automatically for resume header tags.
                                            </span>
                                        </div>
                                    </div>

                                    {/* Section 1: Basic Credentials */}
                                    <h6 className="fw-bold text-info mb-2 small text-uppercase tracking-wider">
                                        1. Personal Credentials
                                    </h6>
                                    <div className="row g-2.5 mb-4">
                                        <div className="col-12 col-md-6">
                                            <label className="form-label text-white-50 extra-small mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                value={profileForm.username}
                                                onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                                                className="form-control form-control-sm glass-input text-white"
                                                required
                                            />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label text-white-50 extra-small mb-1">Contact Phone</label>
                                            <input
                                                type="text"
                                                value={profileForm.phone}
                                                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                placeholder="+91 9876543210"
                                                className="form-control form-control-sm glass-input text-white"
                                            />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label text-white-50 extra-small mb-1">Professional Title / Headline</label>
                                            <input
                                                type="text"
                                                value={profileForm.bio}
                                                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                                                placeholder="e.g. Lead Software Engineer | React, Node.js & System Architecture"
                                                className="form-control form-control-sm glass-input text-white"
                                            />
                                        </div>
                                    </div>

                                    {/* Section 2: Social & Developer Channels */}
                                    <h6 className="fw-bold text-info mb-2 small text-uppercase tracking-wider">
                                        2. Developer & Social Portfolios
                                    </h6>
                                    <div className="row g-2.5">
                                        <div className="col-12 col-md-6">
                                            <label className="form-label text-white-50 extra-small mb-1">LinkedIn Profile</label>
                                            <input
                                                type="url"
                                                value={profileForm.linkedin}
                                                onChange={(e) => setProfileForm({ ...profileForm, linkedin: e.target.value })}
                                                placeholder="https://linkedin.com/in/username"
                                                className="form-control form-control-sm glass-input text-white"
                                            />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label text-white-50 extra-small mb-1">GitHub Profile</label>
                                            <input
                                                type="url"
                                                value={profileForm.github}
                                                onChange={(e) => setProfileForm({ ...profileForm, github: e.target.value })}
                                                placeholder="https://github.com/username"
                                                className="form-control form-control-sm glass-input text-white"
                                            />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label text-white-50 extra-small mb-1">Personal Portfolio / Website</label>
                                            <input
                                                type="url"
                                                value={profileForm.portfolio}
                                                onChange={(e) => setProfileForm({ ...profileForm, portfolio: e.target.value })}
                                                placeholder="https://myportfolio.dev"
                                                className="form-control form-control-sm glass-input text-white"
                                            />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label text-white-50 extra-small mb-1">Instagram URL</label>
                                            <input
                                                type="url"
                                                value={profileForm.instagram}
                                                onChange={(e) => setProfileForm({ ...profileForm, instagram: e.target.value })}
                                                placeholder="https://instagram.com/username"
                                                className="form-control form-control-sm glass-input text-white"
                                            />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label text-white-50 extra-small mb-1">YouTube Channel URL</label>
                                            <input
                                                type="url"
                                                value={profileForm.youtube}
                                                onChange={(e) => setProfileForm({ ...profileForm, youtube: e.target.value })}
                                                placeholder="https://youtube.com/@channel"
                                                className="form-control form-control-sm glass-input text-white"
                                            />
                                        </div>
                                    </div>

                                </div>

                                <div className="modal-footer border-secondary border-opacity-25 py-2.5 px-4 bg-black bg-opacity-40 d-flex justify-content-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowSettingsModal(false)}
                                        className="btn btn-outline-secondary btn-sm px-3"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-info text-dark fw-bold btn-sm px-4 shadow"
                                    >
                                        💾 Save Changes
                                    </button>
                                </div>
                            </form>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}