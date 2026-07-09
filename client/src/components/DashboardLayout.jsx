// client/src/components/DashboardLayout.jsx
import React from "react";
import "../styles/auth.css"; // Tumhari original css background reuse karega
import "../styles/dashboard.css";

const DashboardLayout = ({ children, title }) => {
    return (
        // container-fluid aur p-0 se page ki padding hat jayegi aur custom full horizontal width milegi
        <div className="container-fluid p-0 min-vh-100 auth-bg overflow-x-hidden">
            <div className="row g-0 min-vh-100">

                {/* LEFT SIDE WORKSPACE DECORATION (Sleek Sidebar Variant) */}
                {/* d-none aur d-lg-flex se mobile/tablet pe chhip jayega aur widescreen standard monitors pe 4 columns occupy karega */}
                <div className="d-none d-lg-flex col-lg-4 position-relative overflow-hidden auth-left border-end border-secondary border-opacity-10 min-vh-100 flex-column">

                    {/* Floating design consistency blobs */}
                    <div className="blob blob1 pointer-events-none"></div>
                    <div className="blob blob2 pointer-events-none"></div>

                    {/* Content container inside fixed sidebar view */}
                    <div className="position-relative text-white p-5 d-flex flex-column justify-content-between h-100 w-100" style={{ zIndex: 3 }}>
                        <div>
                            <h2 className="fw-extrabold tracking-wider text-info mb-1">CV<span className="text-white">Pilot</span></h2>
                            <p className="text-muted small">Workspace / ATS Builder v1.0</p>
                        </div>

                        <div className="my-auto">
                            <h3 className="fw-bold text-white mb-2">{title || "Resume Engine"}</h3>
                            <p className="text-white-50 small mb-4">
                                Fill out the structured blocks logically. Your data builds standard parsable formats automatically.
                            </p>

                            <div className="feature-box d-flex flex-column gap-3 small">
                                <div className="d-flex align-items-center gap-2">🟢 <span className="opacity-75">Schema Validation Active</span></div>
                                <div className="d-flex align-items-center gap-2">🟢 <span className="opacity-75">Local Store Synced</span></div>
                            </div>
                        </div>

                        <div className="text-white-50 small">
                            © 2026 CVPilot Inc. All rights reserved.
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE (Expanded Widescreen Matrix for Forms) */}
                {/* Mobile/Tablet pe full width 12 columns lega, Desktop (lg) pe 8 columns workspace space allocate karega */}
                <div className="col-12 col-lg-8 d-flex align-items-start align-items-md-center justify-content-center p-3 p-md-5 overflow-y-auto min-vh-100">

                    {/* Form Wrap element with scalable responsive maxWidth boundaries */}
                    <div className="w-100 my-4 my-md-0" style={{ maxWidth: "850px" }}>

                        {/* Mobile Device Header Variant (Sirf tab dikhega jab left sidebar hidden ho) */}
                        <div className="d-block d-lg-none mb-4 text-start text-white px-2">
                            <div className="d-flex justify-content-between align-items-center">
                                <h4 className="fw-extrabold tracking-wider text-info m-0">CV<span className="text-white">Pilot</span></h4>
                                <span className="badge bg-dark border border-secondary text-white-50 py-1.5 px-2.5 rounded text-xs">v1.0</span>
                            </div>
                            <h5 className="fw-bold text-white mt-3 mb-1">{title || "Resume Engine"}</h5>
                            <hr className="border-secondary opacity-25" />
                        </div>

                        {/* actual step dynamic card forms inside layout */}
                        {children}
                    </div>

                </div>

            </div>
        </div>
    );
};

export default DashboardLayout;