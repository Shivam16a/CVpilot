// client/src/pages/UpgradePlan.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';

export default function UpgradePlan() {
    const navigate = useNavigate();
    const [loadingPlan, setLoadingPlan] = useState(null);
    const [billingCycle, setBillingCycle] = useState('yearly'); // 'monthly' | 'yearly'
    const [toast, setToast] = useState({ message: '', type: 'success' });
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const showToast = (message, type = 'success') => setToast({ message, type });

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleUpgrade = async (planType) => {
        setLoadingPlan(planType);
        const scriptLoaded = await loadRazorpayScript();

        if (!scriptLoaded) {
            showToast('Unable to connect to payment gateway. Please check your connection.', 'danger');
            setLoadingPlan(null);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(
                'http://localhost:6050/api/payment/create-order',
                { planType },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!data.success) {
                showToast(data.message || 'Failed to initialize transaction.', 'danger');
                setLoadingPlan(null);
                return;
            }

            const options = {
                key: data.key,
                amount: data.order.amount,
                currency: data.order.currency,
                name: 'CVPilot Premium',
                description: `${planType === 'PRO_YEARLY' ? 'Annual' : 'Monthly'} Pro Membership`,
                order_id: data.order.id,
                handler: async (response) => {
                    try {
                        const verifyRes = await axios.post(
                            'http://localhost:6050/api/payment/verify-payment',
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                planType
                            },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );

                        if (verifyRes.data.success) {
                            localStorage.setItem('user', JSON.stringify(verifyRes.data.user));
                            showToast('Payment verified! All features unlocked.', 'success');
                            setTimeout(() => navigate('/build-resume'), 1200);
                        }
                    } catch (err) {
                        showToast('Transaction verification failed. Contact support if debited.', 'danger');
                    } finally {
                        setLoadingPlan(null);
                    }
                },
                modal: {
                    ondismiss: () => setLoadingPlan(null)
                },
                prefill: {
                    name: user.username || '',
                    email: user.email || ''
                },
                theme: { color: '#0ea5e9' }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            showToast(error.response?.data?.message || 'Payment processing error.', 'danger');
            setLoadingPlan(null);
        }
    };

    return (
        <div className="min-vh-100 text-white py-5 position-relative overflow-hidden" style={{ backgroundColor: '#070a12' }}>
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

            {/* Ambient Background Glows */}
            <div
                style={{
                    position: 'absolute',
                    top: '-10%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '600px',
                    height: '400px',
                    background: 'radial-gradient(ellipse at center, rgba(14, 165, 233, 0.15) 0%, transparent 70%)',
                    pointerEvents: 'none'
                }}
            />

            <div className="container position-relative" style={{ maxWidth: '1100px', zIndex: 2 }}>

                {/* Header Showcase */}
                <div className="text-center mb-5">
                    <div className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill bg-danger bg-opacity-10 border border-danger border-opacity-30 mb-3">
                        <span className="badge bg-danger rounded-circle p-1">!</span>
                        <span className="text-danger fw-semibold extra-small" style={{ fontSize: '0.78rem', letterSpacing: '0.5px' }}>
                            TRIAL PERIOD COMPLETED
                        </span>
                    </div>

                    <h1 className="display-6 fw-extrabold text-white mb-3">
                        Unlock Unlimited Career Velocity with{' '}
                        <span style={{
                            background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitFillColor: 'transparent'
                        }}>
                            CVPilot Pro
                        </span>
                    </h1>

                    <p className="text-white-50 mx-auto" style={{ maxWidth: '650px', fontSize: '0.95rem', lineHeight: '1.6' }}>
                        Your 30-day initial trial has concluded. Upgrade now to restore continuous ATS parsing, multi-format PDF generation, AI cover letters, and unlimited resume variants.
                    </p>

                    {/* Interactive Billing Toggle */}
                    <div className="d-inline-flex align-items-center p-1 rounded-pill border border-secondary border-opacity-30 bg-black bg-opacity-50 mt-3">
                        <button
                            type="button"
                            onClick={() => setBillingCycle('monthly')}
                            className={`btn btn-sm rounded-pill px-4 py-1.5 fw-semibold ${billingCycle === 'monthly' ? 'btn-info text-dark shadow' : 'text-white-50 btn-dark border-0'}`}
                            style={{ fontSize: '0.82rem', transition: 'all 0.2s' }}
                        >
                            Monthly Billing
                        </button>
                        <button
                            type="button"
                            onClick={() => setBillingCycle('yearly')}
                            className={`btn btn-sm rounded-pill px-4 py-1.5 fw-semibold position-relative ${billingCycle === 'yearly' ? 'btn-info text-dark shadow' : 'text-white-50 btn-dark border-0'}`}
                            style={{ fontSize: '0.82rem', transition: 'all 0.2s' }}
                        >
                            Annual Billing
                            <span className="badge bg-success text-white rounded-pill ms-2" style={{ fontSize: '0.65rem' }}>
                                SAVE 35%
                            </span>
                        </button>
                    </div>
                </div>

                {/* Plan Cards Matrix */}
                <div className="row g-4 justify-content-center align-items-stretch mb-5">

                    {/* Monthly Tier */}
                    <div className="col-12 col-md-6 col-lg-5">
                        <div
                            className={`card h-100 p-4 rounded-4 text-white position-relative transition-all ${billingCycle === 'monthly' ? 'border-info' : 'border-secondary border-opacity-25'}`}
                            style={{
                                background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(11, 15, 25, 0.95) 100%)',
                                backdropFilter: 'blur(12px)',
                                borderWidth: billingCycle === 'monthly' ? '2px' : '1px'
                            }}
                        >
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h4 className="fw-bold mb-1">Monthly Flex</h4>
                                    <p className="text-white-50 extra-small mb-0">Best for immediate job applications</p>
                                </div>
                                <span className="badge bg-secondary bg-opacity-25 text-white-50 border border-secondary border-opacity-50 px-2.5 py-1 extra-small">
                                    Month-to-Month
                                </span>
                            </div>

                            <div className="my-3 pb-3 border-bottom border-secondary border-opacity-20">
                                <div className="d-flex align-items-baseline gap-1">
                                    <span className="fs-1 fw-extrabold text-white">₹199</span>
                                    <span className="text-white-50 small">/ month</span>
                                </div>
                                <span className="text-white-50 extra-small">Billed monthly, cancel anytime</span>
                            </div>

                            <div className="flex-grow-1 mb-4">
                                <span className="text-info extra-small fw-bold text-uppercase d-block mb-3">Everything Included:</span>
                                <ul className="list-unstyled d-flex flex-column gap-2.5 small text-white-50 mb-0">
                                    <li className="d-flex align-items-center gap-2">
                                        <span className="text-success">✓</span>
                                        <span>Unlimited ATS Resumes & Layouts</span>
                                    </li>
                                    <li className="d-flex align-items-center gap-2">
                                        <span className="text-success">✓</span>
                                        <span>High-Res PDF Export & Photo Embedding</span>
                                    </li>
                                    <li className="d-flex align-items-center gap-2">
                                        <span className="text-success">✓</span>
                                        <span>Gemini AI ATS Keyword Scanner</span>
                                    </li>
                                    <li className="d-flex align-items-center gap-2">
                                        <span className="text-success">✓</span>
                                        <span>AI Cover Letter Tailoring Engine</span>
                                    </li>
                                    <li className="d-flex align-items-center gap-2">
                                        <span className="text-success">✓</span>
                                        <span>Real-Time Job Board Matching</span>
                                    </li>
                                </ul>
                            </div>

                            <button
                                disabled={loadingPlan !== null}
                                onClick={() => handleUpgrade('PRO_MONTHLY')}
                                className="btn btn-outline-info w-100 py-2.5 fw-bold rounded-pill"
                                style={{ fontSize: '0.85rem' }}
                            >
                                {loadingPlan === 'PRO_MONTHLY' ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" />
                                        Connecting Razorpay...
                                    </>
                                ) : (
                                    'Get Started with Monthly Pro'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Annual Tier (Recommended) */}
                    <div className="col-12 col-md-6 col-lg-5">
                        <div
                            className="card h-100 p-4 rounded-4 text-white position-relative shadow-2xl"
                            style={{
                                background: 'linear-gradient(180deg, rgba(14, 165, 233, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%)',
                                border: '2px solid #0ea5e9',
                                backdropFilter: 'blur(16px)'
                            }}
                        >
                            {/* Value Tag */}
                            <div className="position-absolute top-0 end-0 m-3">
                                <span className="badge bg-info text-dark fw-bold px-3 py-1.5 rounded-pill shadow-sm" style={{ fontSize: '0.72rem' }}>
                                    MOST POPULAR • SAVE 35%
                                </span>
                            </div>

                            <div className="mb-3 pe-5">
                                <h4 className="fw-bold mb-1 text-white">Annual Pro</h4>
                                <p className="text-info extra-small mb-0">Complete end-to-end recruitment suite</p>
                            </div>

                            <div className="my-3 pb-3 border-bottom border-info border-opacity-20">
                                <div className="d-flex align-items-baseline gap-1">
                                    <span className="fs-1 fw-extrabold text-white">₹1,499</span>
                                    <span className="text-white-50 small">/ year</span>
                                </div>
                                <span className="text-success extra-small fw-semibold">Effective ₹125/month (Best Value)</span>
                            </div>

                            <div className="flex-grow-1 mb-4">
                                <span className="text-info extra-small fw-bold text-uppercase d-block mb-3">All Monthly Features, Plus:</span>
                                <ul className="list-unstyled d-flex flex-column gap-2.5 small text-white mb-0">
                                    <li className="d-flex align-items-center gap-2">
                                        <span className="text-info">★</span>
                                        <span>Full 365 Days Uninterrupted Access</span>
                                    </li>
                                    <li className="d-flex align-items-center gap-2">
                                        <span className="text-info">★</span>
                                        <span>Priority Cloud Synchronization</span>
                                    </li>
                                    <li className="d-flex align-items-center gap-2">
                                        <span className="text-info">★</span>
                                        <span>Unlimited Multi-Profile Management</span>
                                    </li>
                                    <li className="d-flex align-items-center gap-2">
                                        <span className="text-info">★</span>
                                        <span>Early Access to New Resume Templates</span>
                                    </li>
                                    <li className="d-flex align-items-center gap-2">
                                        <span className="text-info">★</span>
                                        <span>Direct Support & Career Template Revisions</span>
                                    </li>
                                </ul>
                            </div>

                            <button
                                disabled={loadingPlan !== null}
                                onClick={() => handleUpgrade('PRO_YEARLY')}
                                className="btn btn-info text-dark w-100 py-2.5 fw-bold rounded-pill shadow-lg"
                                style={{ fontSize: '0.88rem' }}
                            >
                                {loadingPlan === 'PRO_YEARLY' ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2 text-dark" />
                                        Connecting Razorpay...
                                    </>
                                ) : (
                                    'Upgrade to Annual Pro (Best Value)'
                                )}
                            </button>
                        </div>
                    </div>

                </div>

                {/* Trust & Guarantee Strip */}
                <div className="p-4 rounded-4 border border-secondary border-opacity-20 bg-dark bg-opacity-30 text-center mb-5">
                    <div className="row g-3 justify-content-center">
                        <div className="col-12 col-md-4 d-flex align-items-center justify-content-center gap-2">
                            <span className="fs-5">🔒</span>
                            <div className="text-start">
                                <span className="d-block small fw-bold text-white">256-Bit Encrypted</span>
                                <span className="text-white-50 extra-small">Processed securely by Razorpay</span>
                            </div>
                        </div>
                        <div className="col-12 col-md-4 d-flex align-items-center justify-content-center gap-2">
                            <span className="fs-5">⚡</span>
                            <div className="text-start">
                                <span className="d-block small fw-bold text-white">Instant Activation</span>
                                <span className="text-white-50 extra-small">Unlocks dashboard immediately</span>
                            </div>
                        </div>
                        <div className="col-12 col-md-4 d-flex align-items-center justify-content-center gap-2">
                            <span className="fs-5">🎯</span>
                            <div className="text-start">
                                <span className="d-block small fw-bold text-white">ATS Compliant</span>
                                <span className="text-white-50 extra-small">Accepted by top hiring firms</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Frequently Asked Questions (Quick Accordion) */}
                <div className="mx-auto text-start" style={{ maxWidth: '800px' }}>
                    <h5 className="fw-bold text-white mb-3 text-center">Frequently Asked Questions</h5>

                    <div className="d-flex flex-column gap-2.5">
                        <div className="p-3 rounded-3 border border-secondary border-opacity-20 bg-black bg-opacity-40">
                            <h6 className="fw-semibold text-info mb-1 small">What happens to my previously created resumes?</h6>
                            <p className="text-white-50 extra-small mb-0">
                                Your saved resumes remain permanently safe in MongoDB. Upgrading allows you to resume editing them, modify templates, generate new versions, and export PDFs.
                            </p>
                        </div>

                        <div className="p-3 rounded-3 border border-secondary border-opacity-20 bg-black bg-opacity-40">
                            <h6 className="fw-semibold text-info mb-1 small">Which payment methods are accepted?</h6>
                            <p className="text-white-50 extra-small mb-0">
                                Razorpay accepts UPI (Google Pay, PhonePe, Paytm), Credit/Debit cards (Visa, Mastercard, RuPay), Net Banking, and major digital wallets.
                            </p>
                        </div>

                        <div className="p-3 rounded-3 border border-secondary border-opacity-20 bg-black bg-opacity-40">
                            <h6 className="fw-semibold text-info mb-1 small">Is there any auto-debit commitment?</h6>
                            <p className="text-white-50 extra-small mb-0">
                                No surprise debits. Standard one-time orders run per subscription cycle without forced recurring contracts.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}