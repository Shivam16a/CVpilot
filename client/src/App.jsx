// client/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home'; // 🚀 Import Home Page
import Login from './pages/Login';
import Register from './pages/Register';
import TemplateSelection from './pages/TemplateSelection';
import Profile from './pages/Profile';
import BuildResume from './pages/BuildResume';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import NotFound from './pages/NotFound';

// Protected Route Guard Wrapper
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
        {/* 🚀 Landing / Home Page Route */}
        <Route path="/" element={<Home />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/select-template"
          element={
            <ProtectedRoute>
              <TemplateSelection />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Route */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/build-resume"
          element={
            <ProtectedRoute>
              <BuildResume />
            </ProtectedRoute>
          }
        />

        {/* Fallback Catch-all Route: Redirect to Home */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}