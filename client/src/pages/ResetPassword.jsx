import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
    FaEnvelope,
    FaLock,
    FaKey
} from "react-icons/fa";

import "../styles/ResetPassword.css";

const ResetPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        email: "",
        otp: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const sendOTP = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);

            const res = await axios.post(
                "http://localhost:6050/api/auth/forgot-password",
                {
                    email: formData.email,
                }
            );

            alert(res.data.message);

            setStep(2);

        } catch (err) {

            alert(err.response.data.message);

        } finally {

            setLoading(false);

        }

    };

    const resetPassword = async (e) => {

        e.preventDefault();

        if (
            formData.newPassword !==
            formData.confirmPassword
        ) {

            return alert(
                "Passwords do not match"
            );

        }

        try {

            setLoading(true);

            const res = await axios.post(
                "http://localhost:6050/api/auth/reset-password",
                {
                    email: formData.email,
                    otp: formData.otp,
                    newPassword:
                        formData.newPassword,
                }
            );

            alert(res.data.message);
            navigate("/login");

        } catch (err) {

            alert(err.response.data.message);

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="reset-page">

            <div className="reset-card">

                <h2 className="reset-title">

                    Reset Password

                </h2>

                {
                    step === 1 ?

                        <form key="email-form" onSubmit={sendOTP}>

                            <div className="input-box">

                                <FaEnvelope />

                                <input
                                    type="email"
                                    placeholder="Enter Email"
                                    name="email"
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            <button
                                className="reset-btn"
                                disabled={loading}
                            >

                                {
                                    loading
                                        ? "Sending..."
                                        : "Send OTP"
                                }

                            </button>

                        </form>

                        :

                        <form key="otp-form" onSubmit={resetPassword}>

                            <div className="input-box">

                                <FaKey />

                                <input
                                    type="text"
                                    name="otp"
                                    placeholder="OTP"
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            <div className="input-box">

                                <FaLock />

                                <input
                                    type="password"
                                    name="newPassword"
                                    placeholder="New Password"
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            <div className="input-box">

                                <FaLock />

                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            <button
                                className="reset-btn"
                                disabled={loading}
                            >

                                {
                                    loading
                                        ? "Resetting..."
                                        : "Reset Password"
                                }

                            </button>

                        </form>

                }

            </div>

        </div>

    );

};

export default ResetPassword;