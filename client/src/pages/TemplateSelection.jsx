// client/src/pages/TemplateSelection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useResumeStore } from '../store/useResumeStore';
import DashboardLayout from '../components/DashboardLayout';

const templates = [
    {
        id: 'template-ats', // Default Standard ATS Format
        name: 'Standard ATS Layout (Default)',
        badge: '100% ATS Safe',
        desc: 'Clean, single-column traditional format optimized for ATS scanners.',
        bgColor: 'linear-gradient(135deg, #0f172a, #1e293b)'
    },
    {
        id: 'template-sidebar',
        name: 'Modern Sidebar (Two Column)',
        badge: 'Popular',
        desc: 'Left dark sidebar with profile contact & right timeline setup.',
        bgColor: 'linear-gradient(135deg, #1e293b, #334155)'
    },
    {
        id: 'template-corporate',
        name: 'Clean Corporate (Minimalist)',
        badge: 'ATS Favorite',
        desc: 'Top header border with single column standard layout.',
        bgColor: 'linear-gradient(135deg, #334155, #1e293b)'
    },
    {
        id: 'template-header-banner',
        name: 'Executive Grey Header',
        badge: 'Executive',
        desc: 'Full-width grey info block with structured section dividers.',
        bgColor: 'linear-gradient(135deg, #0284c7, #0369a1)'
    },
    {
        id: 'template-classic-table',
        name: 'Classic Academic (Table Style)',
        badge: 'Fresher Special',
        desc: 'Traditional table grid layout for educational qualifications.',
        bgColor: 'linear-gradient(135deg, #475569, #334155)'
    }
];

export default function TemplateSelection() {
    const navigate = useNavigate();
    const { selectedTemplate, setTemplate, setStep } = useResumeStore();

    const handleSelectAndProceed = (templateId) => {
        setTemplate(templateId);
        setStep(1); // Resume wizard Step 1 se start hoga
        navigate('/build-resume');
    };

    return (
        <DashboardLayout title="Choose Your Resume Template">
            <div className="container py-3 text-white">
                {/* 🚀 IMPACTFUL INTERACTIVE TEMPLATE SHOWCASE HEADER */}
                <div
                    className="p-4 p-md-5 mb-5 rounded-4 position-relative overflow-hidden shadow-lg border border-secondary border-opacity-25"
                    style={{
                        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%)',
                        backdropFilter: 'blur(16px)'
                    }}
                >
                    {/* Subtle Glow Background Circles */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '-40px',
                            right: '10%',
                            width: '240px',
                            height: '240px',
                            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)',
                            pointerEvents: 'none'
                        }}
                    />

                    <div className="row align-items-center g-4">

                        {/* Left: Punchy Copy & Live Trust Metrics */}
                        <div className="col-12 col-lg-7 text-start">
                            <div className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill bg-info bg-opacity-10 border border-info border-opacity-25 mb-3">
                                <span className="badge bg-info text-dark rounded-circle p-1">✓</span>
                                <span className="text-info fw-semibold extra-small" style={{ fontSize: '0.78rem', letterSpacing: '0.5px' }}>
                                    ATS TESTED & RECRUITER VERIFIED LAYOUTS
                                </span>
                            </div>

                            <h1 className="display-6 fw-extrabold text-white mb-3 lh-sm">
                                Pick a Format That Gets You <br />
                                <span style={{
                                    background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                    3x More Interview Calls
                                </span>
                            </h1>

                            <p className="text-white-50 small mb-4 pe-lg-4" style={{ lineHeight: '1.6', fontSize: '0.92rem' }}>
                                Applicant Tracking Systems filter out 75% of unformatted resumes before a recruiter ever reads them. Every template below is structurally optimized for Greenhouse, Workday, and Taleo parsing.
                            </p>

                            {/* Micro Badges */}
                            <div className="d-flex flex-wrap gap-3 pt-2 border-top border-secondary border-opacity-25">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="text-success fs-6">●</span>
                                    <span className="text-white-50 extra-small" style={{ fontSize: '0.78rem' }}>100% Parsing Accuracy</span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <span className="text-info fs-6">●</span>
                                    <span className="text-white-50 extra-small" style={{ fontSize: '0.78rem' }}>Clean Typographic Hierarchy</span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <span className="text-warning fs-6">●</span>
                                    <span className="text-white-50 extra-small" style={{ fontSize: '0.78rem' }}>Instant Template Switching</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Modern Visual Graphic Showcase */}
                        <div className="col-12 col-lg-5 text-center position-relative">
                            <div
                                className="p-2 rounded-4 shadow-2xl border border-secondary border-opacity-50 position-relative"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    transform: 'perspective(1000px) rotateY(-4deg) rotateX(2deg)',
                                    transition: 'transform 0.3s ease'
                                }}
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80"
                                    alt="Resume Template Showcase"
                                    className="img-fluid rounded-3 w-100"
                                    style={{
                                        height: '220px',
                                        objectFit: 'cover',
                                        filter: 'contrast(1.05) brightness(0.95)'
                                    }}
                                />

                                {/* Floating Recruiter Pass Badge */}
                                <div
                                    className="position-absolute bottom-0 start-0 m-3 px-3 py-2 rounded-3 shadow-lg d-flex align-items-center gap-2 border border-info border-opacity-30"
                                    style={{
                                        background: 'rgba(15, 23, 42, 0.88)',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                >
                                    <span className="fs-5">🎯</span>
                                    <div className="text-start">
                                        <span className="d-block text-white fw-bold" style={{ fontSize: '0.75rem' }}>98.8% ATS Score</span>
                                        <span className="d-block text-white-50 extra-small" style={{ fontSize: '0.65rem' }}>Recruiter-Ready Standard</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="row g-4 justify-content-center">
                    {templates.map((tpl) => {
                        const isSelected = selectedTemplate === tpl.id || (!selectedTemplate && tpl.id === 'template-ats');
                        return (
                            <div key={tpl.id} className="col-12 col-md-6 col-lg-4">
                                <div
                                    className={`card h-100 bg-dark border-secondary border-opacity-25 shadow-lg position-relative overflow-hidden ${isSelected ? 'border-info' : ''}`}
                                    style={{ borderRadius: '16px', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(10px)' }}
                                >
                                    <div
                                        className="p-4 text-center d-flex flex-column align-items-center justify-content-center"
                                        style={{ height: '180px', background: tpl.bgColor, borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                                    >
                                        <span className="badge bg-info text-dark mb-2 px-3 py-1" style={{ borderRadius: '12px' }}>{tpl.badge}</span>
                                        <h6 className="fw-bold mb-1 text-white">{tpl.name}</h6>
                                    </div>

                                    <div className="card-body d-flex flex-column justify-content-between p-3">
                                        <p className="text-muted small mb-3" style={{ fontSize: '0.8rem' }}>{tpl.desc}</p>
                                        <button
                                            onClick={() => handleSelectAndProceed(tpl.id)}
                                            className={`btn w-100 py-2 ${isSelected ? 'btn-info text-dark fw-bold' : 'btn-outline-info'}`}
                                            style={{ borderRadius: '10px', fontSize: '0.85rem' }}
                                        >
                                            {isSelected ? '✓ Selected — Start Building' : 'Use This Template'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </DashboardLayout>
    );
}