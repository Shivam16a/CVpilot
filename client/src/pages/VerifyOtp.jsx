import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

// Production fallback URL
const API_URL = import.meta.env.VITE_API_URL || "https://cvpilot-n525.onrender.com";

function VerifyOtp() {
    const navigate = useNavigate();
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [timer, setTimer] = useState(60);
    const [alertMsg, setAlertMsg] = useState({ type: "", text: "" });
    const inputRefs = useRef([]);

    const email = localStorage.getItem("email") || "your registered email";

    // Resend countdown timer
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Handle single digit input & auto focus next
    const handleChange = (e, index) => {
        const val = e.target.value;
        if (!/^\d*$/.test(val)) return;

        const newOtp = [...otp];
        newOtp[index] = val.slice(-1);
        setOtp(newOtp);

        if (val && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Handle Backspace navigation
    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Handle Paste 6-digit OTP
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").trim();
        if (/^\d{6}$/.test(pastedData)) {
            const digits = pastedData.split("");
            setOtp(digits);
            inputRefs.current[5]?.focus();
        }
    };

    // Submit Verification
    const submitHandler = async (e) => {
        e.preventDefault();
        const finalOtp = otp.join("");

        if (finalOtp.length < 6) {
            setAlertMsg({ type: "danger", text: "Please enter all 6 digits of the verification code." });
            return;
        }

        try {
            setLoading(true);
            setAlertMsg({ type: "", text: "" });

            const res = await axios.post(`${API_URL}/api/auth/verify-otp`, {
                email,
                otp: finalOtp,
            });

            setAlertMsg({ type: "success", text: res.data.message || "OTP verified successfully! Redirecting to login..." });

            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } catch (error) {
            setAlertMsg({
                type: "danger",
                text: error.response?.data?.message || "Invalid or expired verification code."
            });
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const handleResend = async () => {
        if (timer > 0 || resending) return;
        try {
            setResending(true);
            setAlertMsg({ type: "", text: "" });

            await axios.post(`${API_URL}/api/auth/resend-otp`, { email });

            setAlertMsg({ type: "success", text: "A fresh verification code has been sent to your email." });
            setTimer(60);
        } catch (error) {
            setAlertMsg({
                type: "danger",
                text: error.response?.data?.message || "Failed to resend verification code. Please try again."
            });
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="auth-container d-flex justify-content-center align-items-center py-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">

                        <div className="auth-card border-0 shadow-lg text-center p-4 p-md-5">

                            {/* CVPilot Brand Logo */}
                            <div className="d-flex justify-content-center align-items-center mb-3">
                                <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
                                    <div className="brand-logo-icon">
                                        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect width="34" height="34" rx="9" fill="#0284c7" fillOpacity="0.15" />
                                            <path d="M11 9H23V25H11V9Z" stroke="#38bdf8" strokeWidth="2" strokeLinejoin="round" />
                                            <path d="M15 14H19M15 18H19M15 22H17" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                                            <circle cx="21" cy="11" r="2" fill="#38bdf8" />
                                        </svg>
                                    </div>
                                    <span className="brand-text fs-4 fw-bold text-white">
                                        CV<span className="text-primary-accent">Pilot</span>
                                    </span>
                                </Link>
                            </div>

                            <h3 className="fw-bold text-white mb-2">Verify Account</h3>
                            <p className="text-muted small mb-4">
                                Enter the 6-digit security code dispatched to<br />
                                <span className="text-info fw-semibold text-break">{email}</span>
                            </p>

                            {/* Status Alert Banner */}
                            {alertMsg.text && (
                                <div className={`alert alert-${alertMsg.type} d-flex align-items-center justify-content-center gap-2 py-2 px-3 small mb-4`} role="alert">
                                    {alertMsg.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />}
                                    <span>{alertMsg.text}</span>
                                </div>
                            )}

                            {/* 6-Digit OTP Form */}
                            <form onSubmit={submitHandler}>
                                <div className="otp-input-group d-flex justify-content-center gap-2 mb-4" onPaste={handlePaste}>
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => (inputRefs.current[index] = el)}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength="1"
                                            value={digit}
                                            onChange={(e) => handleChange(e, index)}
                                            onKeyDown={(e) => handleKeyDown(e, index)}
                                            autoFocus={index === 0}
                                            className="form-control otp-box text-center fw-bold"
                                        />
                                    ))}
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 py-2 fw-bold text-dark d-flex align-items-center justify-content-center gap-2 mb-3"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                            <span>Verifying...</span>
                                        </>
                                    ) : (
                                        <span>Verify & Complete Registration</span>
                                    )}
                                </button>
                            </form>

                            {/* Resend Section */}
                            <div className="pt-3 border-top border-secondary border-opacity-25 mt-3">
                                <p className="text-muted small mb-1">Didn't receive the code?</p>
                                {timer > 0 ? (
                                    <span className="text-secondary small">
                                        Resend code in <strong className="text-info">{timer}s</strong>
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={resending}
                                        className="btn btn-link text-decoration-none text-info p-0 small fw-semibold"
                                    >
                                        {resending ? "Dispatching code..." : "Resend Security Code"}
                                    </button>
                                )}
                            </div>

                            {/* Back Navigation */}
                            <div className="mt-3">
                                <Link to="/register" className="text-decoration-none text-muted small d-inline-flex align-items-center gap-1">
                                    <FaArrowLeft size={11} />
                                    <span>Back to Register</span>
                                </Link>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default VerifyOtp;