import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaShieldAlt } from "react-icons/fa";
import "../styles/VerifyOtp.css"

function VerifyOtp() {
    const navigate = useNavigate();

    const [otp, setOtp] = useState([
        "",
        "",
        "",
        "",
        "",
        "",
    ]);

    const [loading, setLoading] =
        useState(false);

    const email =
        localStorage.getItem("email");

    const handleChange = (e, index) => {
        const value = e.target.value;

        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (
            value &&
            e.target.nextSibling
        ) {
            e.target.nextSibling.focus();
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        const finalOtp = otp.join("");

        try {
            setLoading(true);

            const res = await axios.post(
                "http://localhost:6050/api/auth/verify-otp",
                {
                    email,
                    otp: finalOtp,
                }
            );

            alert(res.data.message);

            navigate("/login");
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Invalid OTP"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="otp-page d-flex justify-content-center align-items-center">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-xl-4 col-lg-5 col-md-7 col-sm-10">

                        <div className="card otp-card border-0 shadow-lg">

                            <div className="card-body p-4 p-md-5">

                                <div className="text-center">

                                    <div className="shield-icon mb-3">
                                        <FaShieldAlt size={55} />
                                    </div>

                                    <h2 className="glow-title">
                                        Verify OTP
                                    </h2>

                                    <p className="text-secondary mb-4">
                                        Enter the 6-digit verification code sent to
                                        <br />
                                        <span className="text-info">
                                            {email}
                                        </span>
                                    </p>

                                </div>

                                <form onSubmit={submitHandler}>

                                    <div className="d-flex justify-content-center  otp-container mb-4">
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                type="text"
                                                maxLength="1"
                                                value={digit}
                                                onChange={(e) => handleChange(e, index)}
                                                className="form-control otp-input text-center fw-bold"
                                            />
                                        ))}
                                    </div>

                                    <button
                                        className="btn futuristic-btn w-100"
                                        disabled={loading}
                                    >

                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Verifying...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-shield-check me-2"></i>
                                                Verify OTP
                                            </>
                                        )}

                                    </button>

                                </form>

                                <div className="text-center mt-4">

                                    <p className="text-secondary mb-2">
                                        Didn't receive the code?
                                    </p>

                                    <button
                                        className="btn btn-link text-info text-decoration-none"
                                    >
                                        <i className="bi bi-arrow-clockwise me-2"></i>
                                        Resend OTP
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default VerifyOtp;