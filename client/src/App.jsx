// client/src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import Login from "./pages/Login";
import AuthLayout from "./components/AuthLayout";
import ResetPassword from "./pages/ResetPassword";

// Naya page component import karo
import BuildResume from "./pages/BuildResume";
import TemplateSelection from "./pages/TemplateSelection";

function App() {
  return (
    <Routes>
      {/* Existing Auth Routes */}
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/layout" element={<AuthLayout />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/select-template" element={<TemplateSelection />} />

      {/* 🚀 New Dynamic Dashboard/Resume Builder Route */}
      <Route path="/build-resume" element={<BuildResume />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;