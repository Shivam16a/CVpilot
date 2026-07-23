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
                <div className="text-center mb-5">
                    <h2 className="fw-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Select a Professional Layout
                    </h2>
                    <p className="text-white-50 small">Choose a design that best suits your profession. You can edit details anytime.</p>
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