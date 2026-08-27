import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useResumeStore } from '../store/useResumeStore';

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { resetForm } = useResumeStore();

    const token = localStorage.getItem('token');

    // SECURITY CHECK: Logged-out users aur Auth Pages (/login, /register) par navbar chhup jayega
    const authPages = ['/login', '/register', '/'];
    if (!token || authPages.includes(location.pathname)) {
        return null;
    }

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            localStorage.removeItem('token');
            resetForm(); // Clear Zustand Store State
            navigate('/login');
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark bg-opacity-75 border-bottom border-secondary border-opacity-25 sticky-top backdrop-blur" style={{ backdropFilter: 'blur(10px)' }}>
            <div className="container">
                {/* Brand Logo */}
                <Link className="navbar-brand text-decoration-none" to="/select-template">
                    <h2 className="glow-title mb-0 d-inline-block" style={{ fontSize: '1.4rem' }}>
                        CV<span className="text-white">Pilot</span>
                    </h2>
                </Link>

                {/* Mobile Toggle Button */}
                <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Nav Links */}
                <div className="collapse navbar-collapse" id="navbarContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-lg-2">
                        <li className="nav-item">
                            <Link
                                className={`nav-link px-3 rounded ${location.pathname === '/select-template' ? 'active bg-secondary bg-opacity-25 text-info fw-semibold' : 'text-white-50'}`}
                                to="/select-template"
                            >
                                🎨 Templates
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link
                                className={`nav-link px-3 rounded ${location.pathname === '/build-resume' ? 'active bg-secondary bg-opacity-25 text-info fw-semibold' : 'text-white-50'}`}
                                to="/build-resume"
                            >
                                📝 Build Resume
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link
                                className={`nav-link px-3 rounded ${location.pathname === '/profile' ? 'active bg-secondary bg-opacity-25 text-info fw-semibold' : 'text-white-50'}`}
                                to="/profile"
                            >
                                👤 Profile
                            </Link>
                        </li>
                    </ul>

                    {/* Right Action Controls */}
                    <div className="d-flex align-items-center gap-2 mt-2 mt-lg-0">
                        <button
                            onClick={handleLogout}
                            className="btn btn-outline-danger btn-sm px-3 py-1.5"
                            style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                        >
                            🚪 Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}