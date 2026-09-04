// client/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import TemplateSelection from './pages/TemplateSelection';
import Profile from './pages/Profile';
import BuildResume from './pages/BuildResume';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import NotFound from './pages/NotFound';
import CVPilotAgent from './components/CVPilotAgent';

// 🚀 Subscription & Upgrade Page Imports
import SubscriptionGuard from './components/SubscriptionGuard';
import UpgradePlan from './pages/UpgradePlan';

// Protected Route Guard Wrapper (Checks basic login authentication)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <>
      {/* Global Secure Navbar */}
      <Navbar />

      <Routes>
        {/* Landing / Home Page Route */}
        <Route path="/" element={<Home />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        {/* 🚀 Plan Upgrade / Pricing Page (Unlocked for all logged-in users) */}
        <Route
          path="/upgrade-plan"
          element={
            <ProtectedRoute>
              <UpgradePlan />
            </ProtectedRoute>
          }
        />

        {/* 🔒 Template Selection (Locked behind 1-month trial / Pro subscription) */}
        <Route
          path="/select-template"
          element={
            <ProtectedRoute>
              <SubscriptionGuard>
                <TemplateSelection />
              </SubscriptionGuard>
            </ProtectedRoute>
          }
        />

        {/* 🔒 Resume Builder Workspace (Locked behind trial / Pro subscription) */}
        <Route
          path="/build-resume"
          element={
            <ProtectedRoute>
              <SubscriptionGuard>
                <BuildResume />
              </SubscriptionGuard>
            </ProtectedRoute>
          }
        />

        {/* User Profile Dashboard */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Route (Admin has full bypass across the platform) */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* Fallback Catch-all Route: 404 & Intrusion Trap */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <CVPilotAgent />
    </>
  );
}