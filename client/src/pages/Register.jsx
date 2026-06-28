import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/register.css"


function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        phone: "",
        password: "",
    });

    // Custom Alert State
    const [alertMessage, setAlertMessage] = useState({
        show: false,
        text: "",
        type: "danger", // 'success' or 'danger'
    });

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAlertMessage({ show: false, text: "", type: "danger" });

        try {
            const res = await axios.post(
                "http://localhost:6050/api/auth/register",
                formData
            );
            localStorage.setItem("email", formData.email);

            setAlertMessage({
                show: true,
                text: res.data.message || "Registration Successful!",
                type: "success"
            });

            // Brief delay to allow the user to read the success message
            setTimeout(() => {
                navigate("/verify-otp");
            }, 1500);

        } catch (error) {
            const errorMsg = error.response?.data?.message || "Something went wrong. Please try again.";
            setAlertMessage({
                show: true,
                text: errorMsg,
                type: "danger"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page d-flex align-items-center justify-content-center">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-5 col-md-7 col-sm-10">

                        <div className="card register-card shadow-lg border-0">

                            <div className="card-body p-4">

                                <h1 className="text-center glow-title mb-2">
                                    Create Account
                                </h1>

                                <p className="text-center text-secondary mb-4">
                                    Join the Future 🚀
                                </p>

                                {alertMessage.show && (
                                    <div
                                        className={`alert alert-${alertMessage.type}`}
                                    >
                                        {alertMessage.text}
                                    </div>
                                )}

                                <form onSubmit={submitHandler}>

                                    <div className="mb-3">
                                        <label className="form-label text-light">
                                            Username
                                        </label>

                                        <div className="input-group">

                                            <span className="input-group-text futuristic-icon">
                                                <i className="bi bi-person-fill"></i>
                                            </span>

                                            <input
                                                type="text"
                                                className="form-control futuristic-input"
                                                name="username"
                                                placeholder="Enter your username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                required
                                            />

                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label text-light">
                                            Email
                                        </label>

                                        <div className="input-group">

                                            <span className="input-group-text futuristic-icon">
                                                <i className="bi bi-envelope-fill"></i>
                                            </span>

                                            <input
                                                type="email"
                                                className="form-control futuristic-input"
                                                name="email"
                                                placeholder="Enter your email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />

                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label text-light">
                                            Phone
                                        </label>


                                        <div className="input-group">

                                            <span className="input-group-text futuristic-icon">
                                                <i className="bi bi-telephone-fill"></i>
                                            </span>

                                            <input
                                                type="tel"
                                                className="form-control futuristic-input"
                                                name="phone"
                                                placeholder="Enter your phone number"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required
                                            />

                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label text-light">
                                            Password
                                        </label>

                                        <div className="input-group">

                                            <span className="input-group-text futuristic-icon">
                                                <i className="bi bi-lock-fill"></i>
                                            </span>

                                            <input
                                                type={showPassword ? "text" : "password"}
                                                className="form-control futuristic-input"
                                                name="password"
                                                placeholder="Enter your password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                            />

                                            <button
                                                type="button"
                                                className="input-group-text futuristic-icon"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                <i
                                                    className={`bi ${showPassword ? "bi-eye-slash-fill" : "bi-eye-fill"
                                                        }`}
                                                ></i>
                                            </button>

                                        </div>
                                    </div>

                                    <button
                                        className="btn futuristic-btn w-100"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                ></span>
                                                Registering...
                                            </>
                                        ) : (
                                            "Create Account"
                                        )}
                                    </button>

                                </form>

                                <div className="text-center mt-4">
                                    <span className="text-secondary">
                                        Already have an account?
                                    </span>

                                    <button
                                        className="btn btn-link text-info text-decoration-none"
                                        onClick={() => navigate("/login")}
                                    >
                                        Login
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

export default Register;