// client/src/pages/NotFound.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center text-center p-4 position-relative overflow-hidden" style={{ backgroundColor: '#070a12' }}>

            {/* Ambient Background Glow Effect */}
            <div className="glow-bg" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}></div>

            <div className="glass-card-hover p-4 p-md-5 rounded-4 border border-secondary border-opacity-25 shadow-lg position-relative z-1" style={{ maxWidth: '550px', width: '100%' }}>

                {/* 404 Large Glitch-style Badge */}
                <div className="mb-3">
                    <span className="display-1 fw-extrabold gradient-text-main d-block font-monospace" style={{ fontSize: '6rem', letterSpacing: '2px' }}>
                        404
                    </span>
                    <span className="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50 px-3 py-1.5 rounded-pill small fw-bold">
                        ⚠️ Page Not Found
                    </span>
                </div>

                <h3 className="fw-bold text-white mb-2">Lost in the Cloud Space?</h3>
                <p className="text-white-50 small mb-4" style={{ lineHeight: '1.6' }}>
                    The URL path you are trying to access doesn't exist or might have been moved to a new route. Don't worry, your resume data is safe!
                </p>

                {/* Navigation CTA Buttons */}
                <div className="d-flex flex-wrap justify-content-center gap-3">
                    <button
                        onClick={() => navigate('/')}
                        className="btn btn-info text-dark fw-bold btn-sm py-2 px-4 shadow-sm"
                        style={{ borderRadius: '8px' }}
                    >
                        🏠 Return to Home
                    </button>

                    <button
                        onClick={() => navigate('/select-template')}
                        className="btn btn-outline-light btn-sm py-2 px-4"
                        style={{ borderRadius: '8px' }}
                    >
                        📄 Resume Builder
                    </button>
                </div>

            </div>
        </div>
    );
}