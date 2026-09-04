import { useState, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";

const API_URL = import.meta.env.VITE_API_URL || "https://cvpilot-n525.onrender.com";

function VerifyOtp() {
    const navigate = useNavigate();

    // 🚀 localStorage se directly email retrieve karein
    const email = localStorage.getItem("email") || "";

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [alertMsg, setAlertMsg] = useState({ type: "", text: "" });
    const inputRefs = useRef([]);

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

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").trim();
        if (/^\d{6}$/.test(pastedData)) {
            setOtp(pastedData.split(""));
            inputRefs.current[5]?.focus();
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        const finalOtp = otp.join("");

        if (!email) {
            setAlertMsg({ type: "danger", text: "Session expired or email missing. Please register again." });
            return;
        }

        if (finalOtp.length < 6) {
            setAlertMsg({ type: "danger", text: "Please enter all 6 digits of the OTP." });
            return;
        }

        try {
            setLoading(true);
            setAlertMsg({ type: "", text: "" });

            const res = await axios.post(`${API_URL}/api/auth/verify-otp`, {
                email: email.toLowerCase().trim(),
                otp: finalOtp,
            });

            setAlertMsg({ type: "success", text: res.data.message || "OTP verified! Redirecting to login..." });

            // Cleanup email from localStorage post successful verification
            localStorage.removeItem("email");

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

    return (
        <div className="auth-container d-flex justify-content-center align-items-center min-vh-100 py-4">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">

                        <div className="auth-card border-0 shadow-lg p-4 p-md-5 text-center">
                            {/* Brand Logo */}
                            <div className="d-flex justify-content-center mb-3">
                                <BrandLogo size={50} showText={true} />
                            </div>

                            <h2 className="auth-title fw-bold text-white mb-2">
                                Verify Account
                            </h2>

                            <p className="auth-subtitle text-secondary small mb-4">
                                Enter the 6-digit verification code sent to<br />
                                <span className="text-info fw-medium text-break">
                                    {email || "your registered email address"}
                                </span>
                            </p>

                            {alertMsg.text && (
                                <div className={`alert alert-${alertMsg.type} py-2 px-3 small text-center mb-3`} role="alert">
                                    {alertMsg.text}
                                </div>
                            )}

                            <form onSubmit={submitHandler}>
                                {/* OTP Digit Inputs */}
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