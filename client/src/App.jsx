// client/src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import Login from "./pages/Login";
import AuthLayout from "./components/AuthLayout";
import ResetPassword from "./pages/ResetPassword";

// Naya page component import karo
import BuildResume from "./pages/BuildResume";

function App() {
  return (
    <Routes>
      {/* Existing Auth Routes */}
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/layout" element={<AuthLayout />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* 🚀 New Dynamic Dashboard/Resume Builder Route */}
      <Route path="/build-resume" element={<BuildResume />} />

      {/* Fallback configuration (Optional): Agar user galat route par jaye toh login pr bhej do */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;