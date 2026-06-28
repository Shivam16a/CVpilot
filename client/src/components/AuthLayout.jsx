import React from "react";
import "../styles/auth.css";

const AuthLayout = ({ children, title }) => {
    return (
        <div className="min-vh-100 d-flex auth-bg">

            {/* LEFT SIDE */}
            <div className="d-none d-lg-flex col-lg-6 position-relative overflow-hidden auth-left">

                {/* animated gradient blobs */}
                <div className="blob blob1"></div>
                <div className="blob blob2"></div>

                <div className="z-2 text-white p-5 d-flex flex-column justify-content-center">

                    <h1 className="fw-bold display-5 mb-3">
                        Build your <span className="text-info">Career</span> smarter
                    </h1>

                    <p className="text-white-50 mb-4">
                        CVPilot helps you create ATS-optimized resumes in minutes.
                    </p>

                    <div className="feature-box">
                        <div>⚡ AI-powered suggestions</div>
                        <div>📄 ATS friendly templates</div>
                        <div>🚀 Instant PDF export</div>
                    </div>

                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="col-lg-6 col-12 d-flex align-items-center justify-content-center p-4">

                <div className="auth-card-modern">

                    <h2 className="fw-bold mb-2">{title}</h2>
                    <p className="text-white small mb-4">
                        Welcome back! Please enter your details.
                    </p>

                    {children}

                </div>

            </div>

        </div>
    );
};

export default AuthLayout;