// client/src/pages/NotFound.jsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { reportSuspiciousRouteApi } from '../services/adminService';

export default function NotFound() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const reportAccess = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                await reportSuspiciousRouteApi({
                    attemptedRoute: location.pathname,
                    userId: storedUser._id || null,
                    username: storedUser.username || 'Anonymous Guest',
                    email: storedUser.email || 'Unauthenticated'
                });
            } catch (err) {
                // Silently pass
            }
        };

        reportAccess();
    }, [location.pathname]);

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center text-center p-4" style={{ backgroundColor: '#070a12' }}>
            <div className="p-5 rounded-4 border border-danger border-opacity-30 shadow-lg text-white" style={{ maxWidth: '520px', background: 'rgba(15, 23, 42, 0.9)' }}>
                <span className="badge bg-danger bg-opacity-25 text-danger border border-danger mb-3 px-3 py-1 font-monospace">
                    SECURITY NOTICE: 404
                </span>
                <h2 className="fw-bold mb-2">Unrecognized Route Path</h2>
                <p className="text-white-50 small mb-4">
                    The path <code className="text-danger bg-black px-2 py-1 rounded">{location.pathname}</code> does not exist on CVPilot. This attempt has been logged for security.
                </p>
                <button onClick={() => navigate('/')} className="btn btn-info text-dark fw-bold btn-sm px-4">
                    Return to Platform Home
                </button>
            </div>
        </div>
    );
}