// client/src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useResumeStore } from '../store/useResumeStore';
import ResumeDropzoneModal from './ResumeDropzoneModal';
import BrandLogo from './BrandLogo';
import Toast from './Toast';

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { startNewResume } = useResumeStore();

    // 📱 Responsive Mobile & Tablet State
    const [isOpen, setIsOpen] = useState(false);

    // 📥 Drag & Drop Resume Modal State
    const [showDropzone, setShowDropzone] = useState(false);
    const [toast, setToast] = useState({ message: '', type: 'success' });
    const showToast = (message, type = 'success') => setToast({ message, type });

    // 🔍 Get Logged-in User Data from Local Storage
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    // 🔒 Check Privileges
    const isAdmin = token && user && (user.isAdmin === true);

    // Auto-close menu on route navigation
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            startNewResume();
            setIsOpen(false);
            navigate('/login');
        }
    };

    const handleOpenDropzone = () => {
        setIsOpen(false);
        if (!token) {
            showToast("Please login first to import your resume.", "danger");
            setTimeout(() => navigate('/login'), 1200);
            return;
        }
        setShowDropzone(true);
    };

    return (
        <>
            <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ message: '', type: 'success' })}
            />

            {/* Drag & Drop Resume Parser Modal */}
            <ResumeDropzoneModal
                isOpen={showDropzone}
                onClose={() => setShowDropzone(false)}
                showToast={showToast}
            />

            <nav className="navbar navbar-expand-lg navbar-dark bg-dark bg-opacity-75 border-bottom border-secondary border-opacity-25 px-3 py-2 sticky-top backdrop-blur">
                <div className="container-fluid">

                    {/* Brand Logo */}
                    <BrandLogo size={50} showText={true} />

                    {/* Hamburger Toggler for Mobile & Tablet */}
                    <button
                        className="navbar-toggler border-secondary"
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    {/* Responsive Collapsible Area */}
                    <div className={`collapse navbar-collapse ${isOpen ? 'show mt-3 mt-lg-0' : ''}`} id="navbarContent">
                        <ul className="navbar-nav me-auto mb-3 mb-lg-0 ms-lg-4 gap-1">
                            <li className="nav-item">
                                <Link to="/select-template" className="nav-link text-white-50 hover-white">
                                    🎨 Templates
                                </Link>
                            </li>

                            <li className="nav-item">
                                <Link to="/build-resume" className="nav-link text-white-50 hover-white">
                                    📝 Build Resume
                                </Link>
                            </li>

                            {/* 🚀 1-Click Drag & Drop Resume Import Button */}
                            <li className="nav-item">
                                <button
                                    type="button"
                                    onClick={handleOpenDropzone}
                                    className="nav-link btn btn-link text-info text-decoration-none d-flex align-items-center gap-1"
                                    style={{ fontSize: '0.9rem' }}
                                >
                                    <span>📥</span>
                                    <span>Import PDF</span>
                                </button>
                            </li>

                            {/* Upgrade Plan link */}
                            <li className="nav-item">
                                <Link to="/upgrade-plan" className="nav-link text-warning text-opacity-90 hover-white d-flex align-items-center gap-1">
                                    <span>👑</span>
                                    <span>Upgrade Plan</span>
                                </Link>
                            </li>

                            {token && (
                                <li className="nav-item">
                                    <Link to="/profile" className="nav-link text-white-50 hover-white">
                                        👤 Profile
                                    </Link>
                                </li>
                            )}

                            {/* 🚀 ADMIN ONLY BUTTON */}
                            {isAdmin && (
                                <li className="nav-item ms-lg-2">
                                    <Link
                                        to="/admin"
                                        className="nav-link badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50 px-2.5 py-1.5 mt-1 d-inline-flex align-items-center gap-1"
                                        style={{ fontSize: '0.8rem', borderRadius: '6px' }}
                                    >
                                        🛡️ Admin Panel
                                    </Link>
                                </li>
                            )}
                        </ul>

                        {/* Auth Action Buttons (Desktop Inline, Mobile/Tablet Friendly) */}
                        <div className="d-flex align-items-center gap-2 flex-wrap pt-2 pt-lg-0 border-top border-secondary border-opacity-25 border-top-0-lg">
                            {token ? (
                                <div className="d-flex align-items-center justify-content-between w-100 w-lg-auto gap-3">
                                    <span className="small text-white-50">
                                        Hi, <span className="text-white fw-medium">{user?.username || 'User'}</span>
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="btn btn-outline-danger btn-sm py-1 px-3"
                                        style={{ fontSize: '0.8rem', borderRadius: '8px' }}
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="d-flex align-items-center gap-2 w-100 w-lg-auto">
                                    <Link to="/login" className="btn btn-outline-light btn-sm py-1 px-3 flex-grow-1 flex-lg-grow-0 text-center">
                                        Login
                                    </Link>
                                    <Link to="/register" className="btn btn-info text-dark fw-bold btn-sm py-1 px-3 flex-grow-1 flex-lg-grow-0 text-center">
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </nav>
        </>
    );
}