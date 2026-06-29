import { Routes, Route } from "react-router-dom";

import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import Login from "./pages/Login";
import AuthLayout from "./components/AuthLayout";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/layout" element={<AuthLayout />} />
      <Route path="/reset-password" element={<ResetPassword/>}/>
    </Routes>
  );
}

export default App;