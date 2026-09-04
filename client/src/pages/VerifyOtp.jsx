import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";

// Production backend fallback URL
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

    // Handle digit input & auto-focus next
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
            setAlertMsg({ type: "danger", text: "Please enter all 6 digits." });
            return;
        }

        try {
            setLoading(true);
            setAlertMsg({ type: "", text: "" });

            const res = await axios.post(`${API_URL}/api/auth/verify-otp`, {
                email,
                otp: finalOtp,
            });

            setAlertMsg({ type: "success", text: res.data.message || "OTP verified! Redirecting to login..." });

            setTimeout(() => {
                navigate("/login");
            }, 1200);
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

            setAlertMsg({ type: "success", text: "New OTP sent to your email." });
            setTimer(60);
        } catch (error) {
            setAlertMsg({
                type: "danger",
                text: error.response?.data?.message || "Failed to resend code."
            });
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="auth-container d-flex justify-content-center align-items-center min-vh-100 py-4">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">

                        {/* Identical Login Page Dark Card */}
                        <div className="auth-card border-0 shadow-lg p-4 p-md-5 text-center">

                            {/* Reusable Brand Logo */}
                            <div className="d-flex justify-content-center mb-3">
                                <BrandLogo size={50} showText={true} />
                            </div>

                            <h2 className="auth-title fw-bold text-white mb-2">
                                Verify Account
                            </h2>

                            <p className="auth-subtitle text-secondary small mb-4">
                                Enter the 6-digit verification code sent to<br />
                                <span className="text-info fw-medium">{email}</span>
                            </p>

                            {/* Status Alert */}
                            {alertMsg.text && (
                                <div className={`alert alert-${alertMsg.type} py-2 px-3 small text-center mb-3`} role="alert">
                                    {alertMsg.text}
                                </div>
                            )}

                            {/* 6-Digit OTP Box Grid */}
                            <form onSubmit={submitHandler}>
                                <div className="d-flex justify-content-center gap-2 mb-4" onPaste={handlePaste}>
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
                                            className="form-control form-control-dark text-center fw-bold fs-5 px-0"
                                            style={{ width: "45px", height: "52px" }}
                                        />
                                    ))}
                                </div>

                                {/* Login-Styled Action Button */}
                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 mb-3"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                            <span>Verifying...</span>
                                        </>
                                    ) : (
                                        <span>Verify OTP</span>
                                    )}
                                </button>
                            </form>

                            {/* Resend & Return Links */}
                            <div className="mt-3">
                                <p className="text-secondary small mb-1">Didn't receive the code?</p>
                                {timer > 0 ? (
                                    <span className="text-muted small">
                                        Resend in <strong className="text-info">{timer}s</strong>
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={resending}
                                        className="btn btn-link text-info text-decoration-none p-0 small fw-semibold"
                                    >
                                        {resending ? "Sending..." : "Resend OTP"}
                                    </button>
                                )}
                            </div>

                            <div className="mt-3 pt-3 border-top border-secondary border-opacity-25">
                                <Link to="/login" className="text-decoration-none text-secondary small">
                                    Already verified? <span className="text-info fw-semibold">Sign In</span>
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