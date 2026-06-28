import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/login.css"

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false); // Action loading state
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post(
                "http://localhost:6050/api/auth/login",
                formData
            );

            localStorage.setItem("token", res.data.token);
            alert("Login Successful 🎉");
            navigate("/layout");
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Login Failed "
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page d-flex align-items-center justify-content-center">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-xl-4 col-lg-5 col-md-7 col-sm-10">

                        <div className="card login-card border-0 shadow-lg">

                            <div className="card-body p-4 p-md-5">

                                <h1 className="text-center glow-title mb-2">
                                    Welcome Back
                                </h1>

                                <p className="text-center text-secondary mb-4">
                                    Login to Continue 🚀
                                </p>

                                <form onSubmit={submitHandler}>

                                    {/* Email */}

                                    <div className="mb-3">

                                        <label className="form-label text-light">
                                            Email Address
                                        </label>

                                        <div className="input-group">

                                            <span className="input-group-text futuristic-icon">
                                                <i className="bi bi-envelope-fill"></i>
                                            </span>

                                            <input
                                                type="email"
                                                className="form-control futuristic-input"
                                                placeholder="Enter your email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />

                                        </div>

                                    </div>

                                    {/* Password */}

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
                                                placeholder="Enter password"
                                                name="password"
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
                                        type="submit"
                                        className="btn futuristic-btn w-100"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Logging In...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-box-arrow-in-right me-2"></i>
                                                Login
                                            </>
                                        )}
                                    </button>

                                </form>

                                <div className="text-center mt-4">

                                    <p className="text-secondary mb-2">
                                        Don't have an account?
                                    </p>

                                    <button
                                        className="btn btn-link text-info text-decoration-none"
                                        onClick={() => navigate("/register")}
                                    >
                                        Create Account
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

export default Login;