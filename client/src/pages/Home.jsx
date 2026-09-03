// client/src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Toast from '../components/Toast';
import BrandLogo from '../components/BrandLogo';

export default function Home() {
    const navigate = useNavigate();
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // 📬 Get In Touch Form State
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        subjectType: 'GENERAL',
        message: ''
    });
    const [contactLoading, setContactLoading] = useState(false);
    const [toast, setToast] = useState({ message: '', type: 'success' });

    const showToast = (message, type = 'success') => setToast({ message, type });

    useEffect(() => {
        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const x = (clientX / window.innerWidth - 0.5) * 30;
            const y = (clientY / window.innerHeight - 0.5) * 30;
            setMousePos({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setContactLoading(true);
        try {
            const res = await axios.post('http://localhost:6050/api/contact/send', contactForm);
            if (res.data.success) {
                showToast(res.data.message || "Message sent successfully!", "success");
                setContactForm({ name: '', email: '', subjectType: 'GENERAL', message: '' });
            }
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to send message.", "danger");
        } finally {
            setContactLoading(false);
        }
    };

    return (
        <div className="bg-dark text-white overflow-hidden" style={{ backgroundColor: '#070a12' }}>
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

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

            {/* ==================== 2. FEATURE 1 ==================== */}
            <section id="features-deepdive" className="py-5 border-top border-secondary border-opacity-10 bg-black bg-opacity-20">
                <div className="container py-4">
                    <div className="row align-items-center g-5">
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

                        <div className="col-12 col-lg-6 text-start">
                            <span className="text-info fw-bold small text-uppercase tracking-wider">01. Intelligent Scanning</span>
                            <h2 className="fw-bold display-6 mt-1 mb-3">
                                Real AI ATS Score Inspector & Fixer.
                            </h2>
                            <p className="text-white-50 lead mb-4" style={{ fontSize: '1rem' }}>
                                Standard resume builders only format text. CVPilot's Gemini AI evaluates your content against top Applicant Tracking Systems like Greenhouse, Lever, and Workday.
                            </p>

                            <ul className="list-unstyled text-white-50 d-flex flex-column gap-2.5">
                                <li className="d-flex align-items-start gap-2">
                                    <span className="text-info fw-bold">✓</span>
                                    <span><strong>Action Verb Scanner:</strong> Detects passive sentences and upgrades them to impactful statements.</span>
                                </li>
                                <li className="d-flex align-items-start gap-2">
                                    <span className="text-info fw-bold">✓</span>
                                    <span><strong>Missing Link & Section Alerts:</strong> Notifies if critical links or contacts are omitted.</span>
                                </li>
                                <li className="d-flex align-items-start gap-2">
                                    <span className="text-info fw-bold">✓</span>
                                    <span><strong>0-100 Score Breakdown:</strong> Actionable tips to push above the 85+ score threshold.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================== 3. FEATURE 2 ==================== */}
            <section className="py-5 border-top border-secondary border-opacity-10">
                <div className="container py-4">
                    <div className="row align-items-center g-5 flex-column-reverse flex-lg-row">
                        <div className="col-12 col-lg-6 text-start">
                            <span className="text-warning fw-bold small text-uppercase tracking-wider">02. Job Description Matcher</span>
                            <h2 className="fw-bold display-6 mt-1 mb-3">
                                Paste Target JD. Auto-Tailor Keywords Instantly.
                            </h2>
                            <p className="text-white-50 lead mb-4" style={{ fontSize: '1rem' }}>
                                Don't send the same resume everywhere. CVPilot matches your profile against target Job Description text in seconds.
                            </p>

                            <ul className="list-unstyled text-white-50 d-flex flex-column gap-2.5">
                                <li className="d-flex align-items-start gap-2">
                                    <span className="text-warning fw-bold">✓</span>
                                    <span><strong>Keyword Gap Analysis:</strong> Highlights matched vs missing recruiter keywords.</span>
                                </li>
                                <li className="d-flex align-items-start gap-2">
                                    <span className="text-warning fw-bold">✓</span>
                                    <span><strong>1-Click Tailored Summary:</strong> Re-generates a custom objective tailored to that job.</span>
                                </li>
                            </ul>
                        </div>

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

            {/* ==================== 4. FEATURE 3 ==================== */}
            <section className="py-5 border-top border-secondary border-opacity-10 bg-black bg-opacity-20">
                <div className="container py-4">
                    <div className="row align-items-center g-5">
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

                        <div className="col-12 col-lg-6 text-start">
                            <span className="text-success fw-bold small text-uppercase tracking-wider">03. Full Application Suite</span>
                            <h2 className="fw-bold display-6 mt-1 mb-3">
                                AI Cover Letters & Integrated Job Board.
                            </h2>
                            <p className="text-white-50 lead mb-4" style={{ fontSize: '1rem' }}>
                                From writing personalized pitch letters to browsing live software roles, manage your full career journey in one place.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================== 5. COMPARISON MATRIX ==================== */}
            <section className="py-5 border-top border-secondary border-opacity-10">
                <div className="container py-4">
                    <div className="text-center mb-5">
                        <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-3 py-1 rounded-pill small fw-bold mb-2">
                            Why Choose Us
                        </span>
                        <h2 className="fw-bold display-5">How CVPilot Outperforms Others</h2>
                    </div>

                    <div className="table-responsive rounded-4 border border-secondary border-opacity-25 glass-card-hover">
                        <table className="table table-dark align-middle mb-0 text-start" style={{ fontSize: '0.9rem' }}>
                            <thead>
                                <tr className="border-bottom border-secondary">
                                    <th className="p-3 fs-6">Feature Capability</th>
                                    <th className="p-3 fs-6 text-center text-info" style={{ width: '30%' }}>🚀 CVPilot AI</th>
                                    <th className="p-3 fs-6 text-center text-white-50" style={{ width: '30%' }}>Standard Builders</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="p-3 fw-semibold">ATS Scanner & Keyword Auditor</td>
                                    <td className="p-3 text-center text-success fw-bold">✅ Full Gemini AI Audit</td>
                                    <td className="p-3 text-center text-danger">❌ Basic / Missing</td>
                                </tr>
                                <tr>
                                    <td className="p-3 fw-semibold">Target Job Description Matching</td>
                                    <td className="p-3 text-center text-success fw-bold">✅ 1-Click JD Sync</td>
                                    <td className="p-3 text-center text-danger">❌ Manual Copying</td>
                                </tr>
                                <tr>
                                    <td className="p-3 fw-semibold">AI Cover Letter with Letterhead PDF</td>
                                    <td className="p-3 text-center text-success fw-bold">✅ Included</td>
                                    <td className="p-3 text-center text-danger">❌ Paid Add-on</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* ==================== 🚀 6. GET IN TOUCH WITH US SECTION ==================== */}
            <section id="contact-us" className="py-5 border-top border-secondary border-opacity-10 position-relative">
                <div className="container py-4" style={{ maxWidth: '850px' }}>
                    <div className="text-center mb-4">
                        <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-3 py-1 rounded-pill small fw-bold mb-2">
                            Direct Support & Suggestions
                        </span>
                        <h2 className="fw-bold display-6">Get in touch with us</h2>
                        <p className="text-white-50 small">
                            Have a feature request, feedback, or need account assistance? Drop us a direct message and our admin team will reply to your email.
                        </p>
                    </div>

                    <div className="p-4 p-md-5 rounded-4 border border-secondary border-opacity-25 shadow-lg bg-dark bg-opacity-50">
                        <form onSubmit={handleContactSubmit}>
                            <div className="row g-3 mb-3">
                                <div className="col-12 col-md-6 text-start">
                                    <label className="form-label text-white-50 extra-small fw-bold text-uppercase">Your Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={contactForm.name}
                                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                        placeholder="e.g. Alex Johnson"
                                        className="form-control glass-input text-white small"
                                    />
                                </div>
                                <div className="col-12 col-md-6 text-start">
                                    <label className="form-label text-white-50 extra-small fw-bold text-uppercase">Your Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={contactForm.email}
                                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                        placeholder="alex@example.com"
                                        className="form-control glass-input text-white small"
                                    />
                                </div>
                            </div>

                            <div className="mb-3 text-start">
                                <label className="form-label text-white-50 extra-small fw-bold text-uppercase">Topic / Subject</label>
                                <select
                                    value={contactForm.subjectType}
                                    onChange={(e) => setContactForm({ ...contactForm, subjectType: e.target.value })}
                                    className="form-select glass-input text-white small bg-dark border-secondary"
                                >
                                    <option value="GENERAL">General Feedback / Inquiry</option>
                                    <option value="FEATURE_SUGGESTION">Feature Request / Suggestion</option>
                                    <option value="BUG_REPORT">Bug or Error Report</option>
                                    <option value="BILLING">Billing / Plan Inquiry</option>
                                    <option value="OTHER">Other Query</option>
                                </select>
                            </div>

                            <div className="mb-4 text-start">
                                <label className="form-label text-white-50 extra-small fw-bold text-uppercase">Your Message</label>
                                <textarea
                                    rows={4}
                                    required
                                    value={contactForm.message}
                                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                    placeholder="Write your suggestions, issue details, or feedback here..."
                                    className="form-control glass-input text-white small"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={contactLoading}
                                className="btn btn-info text-dark fw-bold w-100 py-2.5 rounded-3 shadow"
                            >
                                {contactLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Sending to Admin...
                                    </>
                                ) : (
                                    "✉️ Send Message to Team"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* ==================== 7. CALL TO ACTION (CTA) ==================== */}
            <section className="py-5 border-top border-secondary border-opacity-10 position-relative">
                <div className="container py-5 text-center">
                    <div className="p-5 rounded-5 glass-card-hover border border-info border-opacity-25 shadow-lg position-relative overflow-hidden">
                        <div className="position-relative z-1">
                            <h2 className="display-5 fw-bold mb-3">Ready to Land Your Dream Tech Role?</h2>
                            <p className="text-white-50 lead max-w-xl mx-auto mb-4" style={{ fontSize: '1.05rem' }}>
                                Join thousands of developers who passed ATS filters and got hired.
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

            {/* ==================== 8. FOOTER SECTION ==================== */}
            <footer className="border-top border-secondary border-opacity-20 pt-5 pb-4 bg-black bg-opacity-40">
                <div className="container">
                    <div className="row g-4 justify-content-between text-start mb-5">
                        <div className="col-12 col-lg-4">
                            {/* Brand Logo */}
                            <BrandLogo size={50} showText={true} />
                            <p className="text-white-50 small mb-3" style={{ lineHeight: '1.7', maxWidth: '320px' }}>
                                The intelligent ATS-proof resume builder designed for developers, designers, and tech leaders. Built-in Gemini AI scoring, JD matcher, and tailored application generation.
                            </p>
                            <span className="badge bg-dark border border-secondary border-opacity-30 text-white-50 py-1.5 px-2.5 rounded-pill font-monospace" style={{ fontSize: '0.7rem' }}>
                                v1.0 Production
                            </span>
                        </div>

                        <div className="col-6 col-md-3 col-lg-2">
                            <h6 className="fw-bold text-white mb-3 text-uppercase extra-small tracking-wider">Workspace</h6>
                            <ul className="list-unstyled d-flex flex-column gap-2 small text-white-50">
                                <li><span onClick={() => navigate('/select-template')} className="cursor-pointer" style={{ cursor: 'pointer' }}>Choose Templates</span></li>
                                <li><span onClick={() => navigate('/build-resume')} className="cursor-pointer" style={{ cursor: 'pointer' }}>Resume Builder</span></li>
                                <li><span onClick={() => navigate('/profile')} className="cursor-pointer" style={{ cursor: 'pointer' }}>Profile & Socials</span></li>
                                <li><span onClick={() => navigate('/upgrade-plan')} className="cursor-pointer text-warning fw-bold" style={{ cursor: 'pointer' }}>Upgrade to Pro 👑</span></li>
                            </ul>
                        </div>

                        <div className="col-6 col-md-3 col-lg-3">
                            <h6 className="fw-bold text-white mb-3 text-uppercase extra-small tracking-wider">Support</h6>
                            <ul className="list-unstyled d-flex flex-column gap-2 small text-white-50">
                                <li><a href="#contact-us" className="text-white-50 text-decoration-none">Get in touch with us</a></li>
                                <li><span className="text-white-50">Gemini ATS Inspector</span></li>
                                <li><span className="text-white-50">Job Description Matcher</span></li>
                            </ul>
                        </div>

                        <div className="col-12 col-md-6 col-lg-3">
                            <h6 className="fw-bold text-white mb-3 text-uppercase extra-small tracking-wider">Secure Infrastructure</h6>
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

                    <div className="border-top border-secondary border-opacity-15 pt-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 text-white-50 extra-small" style={{ fontSize: '0.78rem' }}>
                        <span>© 2026 CVPilot Inc. All rights reserved.</span>
                        <div className="d-flex gap-3">
                            <span className="cursor-pointer" onClick={() => navigate('/upgrade-plan')} style={{ cursor: 'pointer' }}>Pricing & Plans</span>
                            <span>•</span>
                            <span className="cursor-pointer" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>Account Dashboard</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}