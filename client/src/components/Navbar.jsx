// client/src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useResumeStore } from '../store/useResumeStore';

export default function Navbar() {
    const navigate = useNavigate();
    const { startNewResume } = useResumeStore();

    // 🔍 Get Logged-in User Data from Local Storage
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    // 🔒 Check if user is logged in AND has Admin privileges
    const isAdmin = token && user && (user.isAdmin === true);

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            startNewResume();
            navigate('/login');
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark bg-opacity-75 border-bottom border-secondary border-opacity-25 px-3 py-2 sticky-top backdrop-blur">
            <div className="container-fluid">

                {/* Brand Logo */}
                <Link to="/" className="navbar-brand fw-bold fs-4 glow-title d-flex align-items-center gap-2">
                    ⚡ CVPilot
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarContent"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-md-4 gap-1">
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
                        {token && (
                            <li className="nav-item">
                                <Link to="/profile" className="nav-link text-white-50 hover-white">
                                    👤 Profile
                                </Link>
                            </li>
                        )}

                        {/* 🚀 ADMIN ONLY BUTTON (Hidden for Normal Users) */}
                        {isAdmin && (
                            <li className="nav-item ms-md-2">
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

                    {/* Auth Action Buttons */}
                    <div className="d-flex align-items-center gap-2">
                        {token ? (
                            <div className="d-flex align-items-center gap-2">
                                <span className="small text-white-50 d-none d-sm-inline">
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
                            <>
                                <Link to="/login" className="btn btn-outline-light btn-sm py-1 px-3">
                                    Login
                                </Link>
                                <Link to="/register" className="btn btn-info text-dark fw-bold btn-sm py-1 px-3">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                </div>
            </div>
        </nav>
    );
}