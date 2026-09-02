import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const DashboardLayout = ({ children, title, subtitle }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine current workspace step for dynamic visual feedback
    const isTemplateSelection = location.pathname.includes('select-template');
    const isBuilder = location.pathname.includes('build-resume');

    return (
        <div className="container-fluid p-0 min-vh-100 auth-bg overflow-x-hidden" style={{ backgroundColor: '#070a12' }}>
            <div className="row g-0 min-vh-100">

                {/* 🚀 LEFT SIDE WORKSPACE DECORATION & PROGRESS DOCK */}
                <div
                    className="d-none d-lg-flex col-lg-4 col-xl-3 position-relative overflow-hidden border-end border-secondary border-opacity-15 min-vh-100 flex-column"
                    style={{
                        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(11, 15, 25, 0.98) 100%)',
                        backdropFilter: 'blur(20px)'
                    }}
                >
                    {/* Ambient Glow Accents */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '-60px',
                            left: '-60px',
                            width: '280px',
                            height: '280px',
                            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)',
                            pointerEvents: 'none'
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '10%',
                            right: '-80px',
                            width: '240px',
                            height: '240px',
                            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
                            pointerEvents: 'none'
                        }}
                    />

                    {/* Fixed Left Sidebar Content */}
                    <div className="position-relative text-white p-4 p-xl-5 d-flex flex-column justify-content-between h-100 w-100" style={{ zIndex: 3 }}>

                        {/* Top Branding & Workspace Status */}
                        <div>
                            <div
                                onClick={() => navigate('/')}
                                className="d-inline-flex align-items-center gap-2 mb-3 cursor-pointer"
                                style={{ cursor: 'pointer' }}
                            >
                                <span className="p-1.5 rounded-3 bg-info bg-opacity-10 border border-info border-opacity-25 text-info d-flex align-items-center justify-content-center">
                                    ⚡
                                </span>
                                <h3 className="fw-extrabold tracking-wider text-white m-0" style={{ letterSpacing: '0.5px' }}>
                                    CV<span className="text-info">Pilot</span>
                                </h3>
                            </div>

                            <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-dark border border-secondary border-opacity-30 text-white-50 py-1 px-2 rounded-pill font-monospace" style={{ fontSize: '0.7rem' }}>
                                    v1.0 Production
                                </span>
                                <span className="d-inline-flex align-items-center gap-1.5 px-2 py-0.5 rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-20 extra-small" style={{ fontSize: '0.68rem' }}>
                                    <span className="spinner-grow spinner-grow-sm text-success" style={{ width: '6px', height: '6px' }}></span>
                                    Cloud Engine Active
                                </span>
                            </div>
                        </div>

                        {/* Mid Section: Dynamic Context & Realtime Validation Metrics */}
                        <div className="my-auto py-4">
                            <span className="text-info fw-bold extra-small text-uppercase tracking-wider d-block mb-1" style={{ fontSize: '0.72rem' }}>
                                {isTemplateSelection ? 'Step 01 / Format Architecture' : isBuilder ? 'Step 02 / Data & ATS Tuning' : 'Workspace Engine'}
                            </span>

                            <h2 className="fw-bold text-white mb-2" style={{ fontSize: '1.45rem', lineHeight: '1.3' }}>
                                {title || "Structured Resume Engine"}
                            </h2>

                            <p className="text-white-50 small mb-4" style={{ lineHeight: '1.55', fontSize: '0.82rem' }}>
                                {subtitle || "Structured data schema designed to maximize parsing readability across modern recruiting platforms."}
                            </p>

                            {/* Active Pipeline Status Cards */}
                            <div className="d-flex flex-column gap-2.5 p-3 rounded-3 border border-secondary border-opacity-25" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                                <div className="d-flex align-items-center justify-content-between">
                                    <span className="text-white-50 extra-small" style={{ fontSize: '0.75rem' }}>Schema Validator</span>
                                    <span className="badge bg-success bg-opacity-15 text-success border border-success border-opacity-25" style={{ fontSize: '0.68rem' }}>Strict ATS Standard</span>
                                </div>
                                <div className="d-flex align-items-center justify-content-between">
                                    <span className="text-white-50 extra-small" style={{ fontSize: '0.75rem' }}>Storage Persistence</span>
                                    <span className="badge bg-info bg-opacity-15 text-info border border-info border-opacity-25" style={{ fontSize: '0.68rem' }}>Local & Cloud Cache</span>
                                </div>
                                <div className="d-flex align-items-center justify-content-between">
                                    <span className="text-white-50 extra-small" style={{ fontSize: '0.75rem' }}>AI Copilot Guard</span>
                                    <span className="badge bg-warning bg-opacity-15 text-warning border border-warning border-opacity-25" style={{ fontSize: '0.68rem' }}>Enabled</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Workspace Navigation & Copyright */}
                        <div className="pt-3 border-top border-secondary border-opacity-20 d-flex justify-content-between align-items-center text-white-50 extra-small" style={{ fontSize: '0.72rem' }}>
                            <span>© 2026 CVPilot Inc.</span>
                            <div className="d-flex gap-2">
                                <span className="cursor-pointer text-white-50 hover-text-white" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>Profile</span>
                                <span>•</span>
                                <span className="cursor-pointer text-info" onClick={() => navigate('/select-template')} style={{ cursor: 'pointer' }}>Templates</span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* 🚀 RIGHT SIDE (Expanded Widescreen Workspace Canvas) */}
                <div className="col-12 col-lg-8 col-xl-9 d-flex flex-column align-items-center justify-content-start p-3 p-md-4 p-xl-5 overflow-y-auto min-vh-100">

                    {/* Responsive Canvas Container (Extended to 1100px for comfortable multi-column layout rendering) */}
                    <div className="w-100 my-2 my-md-0" style={{ maxWidth: "1150px" }}>

                        {/* Mobile & Tablet Header Variant */}
                        <div className="d-block d-lg-none mb-4 text-start text-white p-3 rounded-3 border border-secondary border-opacity-25" style={{ background: '#0f172a' }}>
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="text-info fw-bold">⚡</span>
                                    <h5 className="fw-extrabold tracking-wider text-white m-0">CV<span className="text-info">Pilot</span></h5>
                                </div>
                                <span className="badge bg-dark border border-secondary border-opacity-30 text-white-50 py-1 px-2.5 rounded-pill font-monospace" style={{ fontSize: '0.68rem' }}>
                                    v1.0
                                </span>
                            </div>
                            <h6 className="fw-bold text-white mt-2.5 mb-1">{title || "Resume Engine"}</h6>
                            <p className="text-white-50 extra-small mb-0" style={{ fontSize: '0.72rem' }}>
                                {subtitle || "Structured data schema for ATS parsing."}
                            </p>
                        </div>

                        {/* Injected Content Body */}
                        {children}

                    </div>

                </div>

            </div>
        </div>
    );
};

export default DashboardLayout;