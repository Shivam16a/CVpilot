// client/src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const navigate = useNavigate();

    // 🖱️ Interactive Mouse Movement Parallax State
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const x = (clientX / window.innerWidth - 0.5) * 30; // Max 30px tilt offset
            const y = (clientY / window.innerHeight - 0.5) * 30;
            setMousePos({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="bg-dark text-white overflow-hidden" style={{ backgroundColor: '#070a12' }}>

            {/* Ambient Mouse Glow Overlay */}
            <div
                className="glow-bg"
                style={{
                    left: `calc(50% + ${mousePos.x * 2}px - 175px)`,
                    top: `calc(20% + ${mousePos.y * 2}px - 175px)`
                }}
            />

            {/* ==================== 1. HERO SECTION ==================== */}
            <section className="min-vh-100 d-flex align-items-center position-relative py-5">
                <div className="container position-relative z-1">
                    <div className="row align-items-center g-5">

                        {/* Left Hero Text */}
                        <div className="col-12 col-lg-6 text-start">
                            <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-3 py-2 rounded-pill small fw-bold mb-3 d-inline-flex align-items-center gap-2">
                                <span className="spinner-grow spinner-grow-sm text-info" style={{ width: '8px', height: '8px' }}></span>
                                Next-Gen AI Resume & Career Copilot
                            </span>

                            <h1 className="display-3 fw-extrabold lh-sm mb-3">
                                Build <span className="gradient-text-main">ATS-Proof Resumes</span> 10x Faster with AI.
                            </h1>

                            <p className="lead text-white-50 mb-4" style={{ fontSize: '1.1rem' }}>
                                CVPilot isn't just a document editor. It's an intelligent career suite that scans job descriptions, optimizes keywords in real-time, generates tailored cover letters, and matches live hiring boards.
                            </p>

                            <div className="d-flex flex-wrap align-items-center gap-3">
                                

                                {/* 💎 Upgrade Plan Button */}
                                <button
                                    onClick={() => navigate('/upgrade-plan')}
                                    className="btn btn-warning text-dark fw-bold px-4 py-3 fs-6 rounded-3 shadow-sm d-flex align-items-center gap-2"
                                >
                                    <span>👑</span>
                                    <span>Upgrade Plan</span>
                                </button>

                                <button
                                    onClick={() => {
                                        const el = document.getElementById('features-deepdive');
                                        el?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="btn btn-outline-light px-4 py-3 fs-6 rounded-3"
                                >
                                    ⚡ Explore Features
                                </button>
                            </div>

                            {/* Trust Stats Counter */}
                            <div className="row g-3 mt-4 pt-3 border-top border-secondary border-opacity-25">
                                <div className="col-4">
                                    <h4 className="fw-bold text-info mb-0">98.4%</h4>
                                    <small className="text-white-50 extra-small">ATS Pass Rate</small>
                                </div>
                                <div className="col-4">
                                    <h4 className="fw-bold text-success mb-0">150K+</h4>
                                    <small className="text-white-50 extra-small">Resumes Built</small>
                                </div>
                                <div className="col-4">
                                    <h4 className="fw-bold text-warning mb-0">4.9/5 ★</h4>
                                    <small className="text-white-50 extra-small">Recruiter Trust Score</small>
                                </div>
                            </div>
                        </div>

                        {/* Right Hero Image (3D Interactive Tilt) */}
                        <div className="col-12 col-lg-6 text-center position-relative">
                            <div
                                className="position-relative float-animation"
                                style={{
                                    transform: `perspective(1000px) rotateY(${mousePos.x * 0.5}deg) rotateX(${-mousePos.y * 0.5}deg)`,
                                    transition: 'transform 0.1s ease-out'
                                }}
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1000&q=80"
                                    alt="CVPilot Dashboard Preview"
                                    className="img-fluid rounded-4 shadow-lg border border-secondary border-opacity-50"
                                    style={{ maxHeight: '480px', objectFit: 'cover' }}
                                />

                                {/* Floating Badge Overlay */}
                                <div className="position-absolute bottom-0 start-0 p-3 m-3 glass-card-hover rounded-3 text-start border border-info border-opacity-25 shadow-lg" style={{ maxWidth: '240px' }}>
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                        <span className="fs-5">🎯</span>
                                        <span className="fw-bold text-info small">Real-Time ATS Audit</span>
                                    </div>
                                    <small className="text-white-50 d-block extra-small">Instant keyword density & action verb optimization.</small>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>


            {/* ==================== 2. FEATURE 1 (LEFT IMAGE - RIGHT TEXT) ==================== */}
            <section id="features-deepdive" className="py-5 border-top border-secondary border-opacity-10 bg-black bg-opacity-20">
                <div className="container py-4">
                    <div className="row align-items-center g-5">

                        {/* Left Image */}
                        <div className="col-12 col-lg-6">
                            <div className="glass-card-hover p-2 rounded-4 border border-secondary border-opacity-25 shadow-lg">
                                <img
                                    src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=80"
                                    alt="ATS AI Score Analyzer"
                                    className="img-fluid rounded-3 w-100"
                                    style={{ height: '360px', objectFit: 'cover' }}
                                />
                            </div>
                        </div>

                        {/* Right Text */}
                        <div className="col-12 col-lg-6 text-start">
                            <span className="text-info fw-bold small text-uppercase tracking-wider">01. Intelligent Scanning</span>
                            <h2 className="fw-bold display-6 mt-1 mb-3">
                                Real AI ATS Score Inspector & Fixer.
                            </h2>
                            <p className="text-white-50 lead mb-4" style={{ fontSize: '1rem' }}>
                                Standard resume builders only format text. CVPilot's Gemini AI evaluates your content against top Applicant Tracking Systems (ATS) like Greenhouse, Lever, and Workday.
                            </p>

                            <ul className="list-unstyled text-white-50 d-flex flex-column gap-2.5">
                                <li className="d-flex align-items-start gap-2">
                                    <span className="text-info fw-bold">✓</span>
                                    <span><strong>Action Verb Scanner:</strong> Detects passive sentences and upgrades them to impactful metric statements.</span>
                                </li>
                                <li className="d-flex align-items-start gap-2">
                                    <span className="text-info fw-bold">✓</span>
                                    <span><strong>Missing Link & Section Alerts:</strong> Notifies you if critical links (LinkedIn, GitHub) or contact data are omitted.</span>
                                </li>
                                <li className="d-flex align-items-start gap-2">
                                    <span className="text-info fw-bold">✓</span>
                                    <span><strong>0-100 Score Breakdown:</strong> Gives actionable tips to push your resume above the 85+ score threshold.</span>
                                </li>
                            </ul>
                        </div>

                    </div>
                </div>
            </section>


            {/* ==================== 3. FEATURE 2 (RIGHT IMAGE - LEFT TEXT) ==================== */}
            <section className="py-5 border-top border-secondary border-opacity-10">
                <div className="container py-4">
                    <div className="row align-items-center g-5 flex-column-reverse flex-lg-row">

                        {/* Left Text */}
                        <div className="col-12 col-lg-6 text-start">
                            <span className="text-warning fw-bold small text-uppercase tracking-wider">02. Job Description Matcher</span>
                            <h2 className="fw-bold display-6 mt-1 mb-3">
                                Paste Target JD. Auto-Tailor Keywords Instantly.
                            </h2>
                            <p className="text-white-50 lead mb-4" style={{ fontSize: '1rem' }}>
                                Don't send the exact same resume to 50 different companies. CVPilot matches your candidate profile against any target Job Description (JD) text from LinkedIn or Indeed.
                            </p>

                            <ul className="list-unstyled text-white-50 d-flex flex-column gap-2.5">
                                <li className="d-flex align-items-start gap-2">
                                    <span className="text-warning fw-bold">✓</span>
                                    <span><strong>Keyword Gap Analysis:</strong> Differentiates between matched skills and critical missing recruiter keywords.</span>
                                </li>
                                <li className="d-flex align-items-start gap-2">
                                    <span className="text-warning fw-bold">✓</span>
                                    <span><strong>1-Click Tailored Summary:</strong> Re-generates a custom 3-line objective paragraph catered directly to that company.</span>
                                </li>
                                <li className="d-flex align-items-start gap-2">
                                    <span className="text-warning fw-bold">✓</span>
                                    <span><strong>Live Board Keyword Inserter:</strong> Auto-inject missing keywords directly into your skills store.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Right Image */}
                        <div className="col-12 col-lg-6">
                            <div className="glass-card-hover p-2 rounded-4 border border-secondary border-opacity-25 shadow-lg">
                                <img
                                    src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80"
                                    alt="Job Description Matcher"
                                    className="img-fluid rounded-3 w-100"
                                    style={{ height: '360px', objectFit: 'cover' }}
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </section>


            {/* ==================== 4. FEATURE 3 (LEFT IMAGE - RIGHT TEXT) ==================== */}
            <section className="py-5 border-top border-secondary border-opacity-10 bg-black bg-opacity-20">
                <div className="container py-4">
                    <div className="row align-items-center g-5">

                        {/* Left Image */}
                        <div className="col-12 col-lg-6">
                            <div className="glass-card-hover p-2 rounded-4 border border-secondary border-opacity-25 shadow-lg">
                                <img
                                    src="https://images.unsplash.com/photo-1455849318743-b2233052fcff?auto=format&fit=crop&w=900&q=80"
                                    alt="AI Cover Letter & Live Job Board"
                                    className="img-fluid rounded-3 w-100"
                                    style={{ height: '360px', objectFit: 'cover' }}
                                />
                            </div>
                        </div>

                        {/* Right Text */}
                        <div className="col-12 col-lg-6 text-start">
                            <span className="text-success fw-bold small text-uppercase tracking-wider">03. Full Application Suite</span>
                            <h2 className="fw-bold display-6 mt-1 mb-3">
                                AI Cover Letters & Integrated Job Board.
                            </h2>
                            <p className="text-white-50 lead mb-4" style={{ fontSize: '1rem' }}>
                                CVPilot accompanies you through the entire application cycle — from letter writing to searching live remote software openings.
                            </p>

                            <ul className="list-unstyled text-white-50 d-flex flex-column gap-2.5">
                                <li className="d-flex align-items-start gap-2">
                                    <span className="text-success fw-bold">✓</span>
                                    <span><strong>AI Cover Letter Generator:</strong> Crafts persuasive 3-paragraph application letters personalized to target hiring managers.</span>
                                </li>
                                <li className="d-flex align-items-start gap-2">
                                    <span className="text-success fw-bold">✓</span>
                                    <span><strong>Live Job Feed Sync:</strong> Browse open software engineering, full stack, and DevOps positions right inside the resume builder.</span>
                                </li>
                            </ul>
                        </div>

                    </div>
                </div>
            </section>


            {/* ==================== 5. DETAILED COMPARISON MATRIX ==================== */}
            <section className="py-5 border-top border-secondary border-opacity-10">
                <div className="container py-4">
                    <div className="text-center mb-5">
                        <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-3 py-1 rounded-pill small fw-bold mb-2">
                            Why Choose Us
                        </span>
                        <h2 className="fw-bold display-5">How CVPilot Outperforms Others</h2>
                        <p className="text-white-50 max-w-2xl mx-auto">Compare CVPilot against standard online resume generators and Canva templates.</p>
                    </div>

                    <div className="table-responsive rounded-4 border border-secondary border-opacity-25 glass-card-hover">
                        <table className="table table-dark align-middle mb-0 text-start" style={{ fontSize: '0.9rem' }}>
                            <thead>
                                <tr className="border-bottom border-secondary">
                                    <th className="p-3 fs-6">Feature Capability</th>
                                    <th className="p-3 fs-6 text-center text-info comparison-table-header" style={{ width: '30%' }}>
                                        🚀 CVPilot AI
                                    </th>
                                    <th className="p-3 fs-6 text-center text-white-50" style={{ width: '30%' }}>
                                        Traditional Resume Builders (Canva/Zety)
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="p-3 fw-semibold">ATS Scanner & Keyword Auditor</td>
                                    <td className="p-3 text-center text-success fw-bold comparison-table-header">✅ Full Gemini AI Audit</td>
                                    <td className="p-3 text-center text-danger">❌ Basic / Missing</td>
                                </tr>
                                <tr>
                                    <td className="p-3 fw-semibold">Target Job Description Matching</td>
                                    <td className="p-3 text-center text-success fw-bold comparison-table-header">✅ 1-Click JD Sync & Gap Analysis</td>
                                    <td className="p-3 text-center text-danger">❌ Manual Copying</td>
                                </tr>
                                <tr>
                                    <td className="p-3 fw-semibold">Built-in AI Cover Letter Writer</td>
                                    <td className="p-3 text-center text-success fw-bold comparison-table-header">✅ Included with Letterhead PDF</td>
                                    <td className="p-3 text-center text-danger">❌ Separate Paid Add-on</td>
                                </tr>
                                <tr>
                                    <td className="p-3 fw-semibold">Live Job Board & Keyword Inserter</td>
                                    <td className="p-3 text-center text-success fw-bold comparison-table-header">✅ Live Integrated Feed</td>
                                    <td className="p-3 text-center text-danger">❌ Not Available</td>
                                </tr>
                                <tr>
                                    <td className="p-3 fw-semibold">PDF Export & Cloud Profiles</td>
                                    <td className="p-3 text-center text-success fw-bold comparison-table-header">✅ Clean Formatted Export</td>
                                    <td className="p-3 text-center text-warning">⚠️ Paywall per Single Export</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>


            {/* ==================== 6. CALL TO ACTION (CTA) ==================== */}
            <section className="py-5 border-top border-secondary border-opacity-10 position-relative">
                <div className="container py-5 text-center">
                    <div className="p-5 rounded-5 glass-card-hover border border-info border-opacity-25 shadow-lg position-relative overflow-hidden">

                        <div className="position-relative z-1">
                            <h2 className="display-5 fw-bold mb-3">Ready to Land Your Dream Tech Role?</h2>
                            <p className="text-white-50 lead max-w-xl mx-auto mb-4" style={{ fontSize: '1.05rem' }}>
                                Join thousands of engineers, product managers, and developers who passed ATS filters and got hired.
                            </p>

                            <div className="d-flex flex-wrap justify-content-center align-items-center gap-3">
                                <button
                                    onClick={() => navigate('/select-template')}
                                    className="btn btn-info text-dark fw-bold btn-lg px-5 py-3 shadow-lg rounded-3"
                                >
                                    ⚡ Create Your Free Resume Now
                                </button>
                                <button
                                    onClick={() => navigate('/upgrade-plan')}
                                    className="btn btn-outline-warning fw-bold btn-lg px-4 py-3 rounded-3 d-flex align-items-center gap-2"
                                >
                                    <span>👑</span>
                                    <span>View Pro Plans</span>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </section>


            {/* ==================== 7. FOOTER SECTION ==================== */}
            <footer className="border-top border-secondary border-opacity-20 pt-5 pb-4 bg-black bg-opacity-40">
                <div className="container">
                    <div className="row g-4 justify-content-between text-start mb-5">

                        {/* Brand Column */}
                        <div className="col-12 col-lg-4">
                            <div className="d-flex align-items-center gap-2 mb-3 cursor-pointer" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                                <span className="p-1.5 rounded-3 bg-info bg-opacity-10 border border-info border-opacity-25 text-info fw-bold">⚡</span>
                                <h4 className="fw-extrabold text-white m-0 tracking-wider">
                                    CV<span className="text-info">Pilot</span>
                                </h4>
                            </div>
                            <p className="text-white-50 small mb-3" style={{ lineHeight: '1.7', maxWidth: '320px' }}>
                                The intelligent ATS-proof resume builder designed for developers, designers, and tech leaders. Built-in Gemini AI scoring, JD matcher, and tailored application generation.
                            </p>
                            <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-dark border border-secondary border-opacity-30 text-white-50 py-1.5 px-2.5 rounded-pill font-monospace" style={{ fontSize: '0.7rem' }}>
                                    v1.0 Production
                                </span>
                                <span className="d-inline-flex align-items-center gap-1.5 px-2.5 py-1 rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-20 extra-small" style={{ fontSize: '0.7rem' }}>
                                    <span className="spinner-grow spinner-grow-sm text-success" style={{ width: '6px', height: '6px' }}></span>
                                    System Active
                                </span>
                            </div>
                        </div>

                        {/* Quick Navigation Links */}
                        <div className="col-6 col-md-3 col-lg-2">
                            <h6 className="fw-bold text-white mb-3 text-uppercase extra-small tracking-wider">Workspace</h6>
                            <ul className="list-unstyled d-flex flex-column gap-2 small text-white-50">
                                <li><span onClick={() => navigate('/select-template')} className="cursor-pointer hover-text-info" style={{ cursor: 'pointer' }}>Choose Templates</span></li>
                                <li><span onClick={() => navigate('/build-resume')} className="cursor-pointer hover-text-info" style={{ cursor: 'pointer' }}>Resume Builder</span></li>
                                <li><span onClick={() => navigate('/profile')} className="cursor-pointer hover-text-info" style={{ cursor: 'pointer' }}>Profile & Socials</span></li>
                                <li><span onClick={() => navigate('/upgrade-plan')} className="cursor-pointer text-warning fw-bold" style={{ cursor: 'pointer' }}>Upgrade to Pro 👑</span></li>
                            </ul>
                        </div>

                        {/* AI & Features Links */}
                        <div className="col-6 col-md-3 col-lg-3">
                            <h6 className="fw-bold text-white mb-3 text-uppercase extra-small tracking-wider">Capabilities</h6>
                            <ul className="list-unstyled d-flex flex-column gap-2 small text-white-50">
                                <li><span className="text-white-50">Gemini ATS Inspector</span></li>
                                <li><span className="text-white-50">Job Description Matcher</span></li>
                                <li><span className="text-white-50">AI Cover Letter Generator</span></li>
                                <li><span className="text-white-50">Multi-Format PDF Exporter</span></li>
                                <li><span className="text-white-50">Hardware IP Threat Logging</span></li>
                            </ul>
                        </div>

                        {/* Security & Payment Standards */}
                        <div className="col-12 col-md-6 col-lg-3">
                            <h6 className="fw-bold text-white mb-3 text-uppercase extra-small tracking-wider">Secure Infrastructure</h6>
                            <p className="text-white-50 extra-small mb-3" style={{ lineHeight: '1.6' }}>
                                Payments and user sessions are encrypted end-to-end via 256-Bit SSL and Razorpay compliance.
                            </p>
                            <div className="p-3 rounded-3 border border-secondary border-opacity-25 bg-dark bg-opacity-50">
                                <div className="d-flex align-items-center gap-2 mb-1.5">
                                    <span className="text-success fw-bold">🔒</span>
                                    <span className="fw-bold small text-white">Razorpay Secure Verified</span>
                                </div>
                                <span className="extra-small text-white-50 d-block" style={{ fontSize: '0.72rem' }}>
                                    UPI • Debit/Credit Cards • Net Banking
                                </span>
                            </div>
                        </div>

                    </div>

                    {/* Bottom Sub-footer */}
                    <div className="border-top border-secondary border-opacity-15 pt-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 text-white-50 extra-small" style={{ fontSize: '0.78rem' }}>
                        <span>© 2026 CVPilot Inc. All rights reserved. Designed for High-Impact Careers.</span>
                        <div className="d-flex gap-3">
                            <span className="cursor-pointer hover-text-white" onClick={() => navigate('/upgrade-plan')} style={{ cursor: 'pointer' }}>Pricing & Plans</span>
                            <span>•</span>
                            <span className="cursor-pointer hover-text-white" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>Account Dashboard</span>
                            <span>•</span>
                            <span className="text-white-50">Terms & Privacy</span>
                        </div>
                    </div>

                </div>
            </footer>

        </div>
    );
}