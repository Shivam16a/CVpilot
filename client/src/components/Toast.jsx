// client/src/components/Toast.jsx
import React, { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [message, duration, onClose]);

    if (!message) return null;

    const isSuccess = type === 'success';

    return (
        <div
            className="position-fixed bottom-0 end-0 p-3 z-3 animate-fade-in"
            style={{ zIndex: 9999 }}
        >
            <div
                className={`d-flex align-items-center gap-3 px-3 py-2.5 rounded-3 shadow-lg border ${isSuccess
                        ? 'bg-dark text-white border-success'
                        : 'bg-dark text-white border-danger'
                    }`}
                style={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(12px)',
                    minWidth: '280px',
                    maxWidth: '400px',
                    boxShadow: isSuccess
                        ? '0 10px 30px rgba(34, 197, 94, 0.25)'
                        : '0 10px 30px rgba(239, 68, 68, 0.25)'
                }}
            >
                {/* Icon */}
                <div style={{ fontSize: '1.2rem' }}>
                    {isSuccess ? '✅' : '❌'}
                </div>

                {/* Message Body */}
                <div className="flex-grow-1 small fw-medium" style={{ fontSize: '0.88rem' }}>
                    {message}
                </div>

                {/* Close Button (✕) */}
                <button
                    type="button"
                    onClick={onClose}
                    className="btn-close btn-close-white small ms-auto p-1"
                    style={{ fontSize: '0.7rem' }}
                    aria-label="Close"
                ></button>
            </div>
        </div>
    );
}