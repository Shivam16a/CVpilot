import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaKey, FaArrowLeft, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import BrandLogo from "../components/BrandLogo";

// Production backend API URL with fallback
const API_URL = import.meta.env.VITE_API_URL || "https://cvpilot-n525.onrender.com";

const ResetPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [alertMsg, setAlertMsg] = useState({ type: "", text: "" });

    const [formData, setFormData] = useState({
        email: "",
        otp: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // STEP 1: Send OTP to email
    const sendOTP = async (e) => {
        e.preventDefault();
        setAlertMsg({ type: "", text: "" });

        if (!formData.email.trim()) {
            setAlertMsg({ type: "danger", text: "Please enter your registered email address." });
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post(`${API_URL}/api/auth/forgot-password`, {
                email: formData.email.toLowerCase().trim(),
            });

            setAlertMsg({ type: "success", text: res.data.message || "Reset OTP has been sent to your email." });
            setStep(2);
        } catch (err) {
            setAlertMsg({
                type: "danger",
                text: err.response?.data?.message || "Failed to dispatch reset code. Please verify email.",
            });
        } finally {
            setLoading(false);
        }
    };

    // STEP 2: Verify OTP and save new password
    const resetPassword = async (e) => {
        e.preventDefault();
        setAlertMsg({ type: "", text: "" });

        if (formData.newPassword !== formData.confirmPassword) {
            setAlertMsg({ type: "danger", text: "New passwords do not match. Please recheck." });
            return;
        }

        if (formData.newPassword.length < 6) {
            setAlertMsg({ type: "danger", text: "Password must be at least 6 characters long." });
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post(`${API_URL}/api/auth/reset-password`, {
                email: formData.email.toLowerCase().trim(),
                otp: formData.otp.trim(),
                newPassword: formData.newPassword,
            });

            setAlertMsg({ type: "success", text: res.data.message || "Password updated successfully! Redirecting..." });

            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } catch (err) {
            setAlertMsg({
                type: "danger",
                text: err.response?.data?.message || "Password reset failed. Invalid or expired OTP.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container d-flex justify-content-center align-items-center min-vh-100 py-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
                        <div className="auth-card border-0 shadow-lg p-4 p-md-5 text-center">

                            {/* Brand Logo Component */}
                            <div className="d-flex justify-content-center mb-3">
                                <BrandLogo size={50} showText={true} />
                            </div>

                            <h2 className="auth-title fw-bold text-white mb-2">
                                {step === 1 ? "Forgot Password" : "Reset Password"}
                            </h2>

                            <p className="auth-subtitle text-secondary small mb-4">
                                {step === 1
                                    ? "Enter your registered email address to receive a secure password recovery code."
                                    : `Enter the verification code sent to ${formData.email}`}
                            </p>

                            {/* Status Alert Banner */}
                            {alertMsg.text && (
                                <div
                                    className={`alert alert-${alertMsg.type} d-flex align-items-center justify-content-center gap-2 py-2 px-3 small text-center mb-4`}
                                    role="alert"
                                >
                                    {alertMsg.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />}
                                    <span>{alertMsg.text}</span>
                                </div>
                            )}

                            {/* Step 1: Request OTP Form */}
                            {step === 1 ? (
                                <form key="email-form" onSubmit={sendOTP}>
                                    <div className="mb-3 text-start">
                                        <label className="text-secondary small mb-1">Registered Email</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-dark border-secondary text-secondary">
                                                <FaEnvelope />
                                            </span>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="name@example.com"
                                                className="form-control form-control-dark text-white"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 mb-3"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                <span>Sending Recovery Code...</span>
                                            </>
                                        ) : (
                                            <span>Send Recovery Code</span>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                /* Step 2: Verify OTP & Change Password */
                                <form key="otp-form" onSubmit={resetPassword}>
                                    <div className="mb-3 text-start">
                                        <label className="text-secondary small mb-1">6-Digit Security OTP</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-dark border-secondary text-secondary">
                                                <FaKey />
                                            </span>
                                            <input
                                                type="text"
                                                name="otp"
                                                value={formData.otp}
                                                onChange={handleChange}
                                                placeholder="Enter 6-digit OTP"
                                                maxLength="6"
                                                className="form-control form-control-dark text-white"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3 text-start">
                                        <label className="text-secondary small mb-1">New Password</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-dark border-secondary text-secondary">
                                                <FaLock />
                                            </span>
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={formData.newPassword}
                                                onChange={handleChange}
                                                placeholder="Enter new password"
                                                className="form-control form-control-dark text-white"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4 text-start">
                                        <label className="text-secondary small mb-1">Confirm New Password</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-dark border-secondary text-secondary">
                                                <FaLock />
                                            </span>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="Confirm new password"
                                                className="form-control form-control-dark text-white"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 mb-3"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                <span>Updating Password...</span>
                                            </>
                                        ) : (
                                            <span>Update Password</span>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => { setStep(1); setAlertMsg({ type: "", text: "" }); }}
                                        className="btn btn-link text-secondary text-decoration-none small p-0 mb-2"
                                    >
                                        Change Email Address
                                    </button>
                                </form>
                            )}

                            {/* Back to Login Link */}
                            <div className="mt-3 pt-3 border-top border-secondary border-opacity-25">
                                <Link to="/login" className="text-decoration-none text-secondary small d-inline-flex align-items-center gap-1">
                                    <FaArrowLeft size={11} />
                                    <span>Return to Sign In</span>
                                </Link>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;