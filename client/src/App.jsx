// client/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import TemplateSelection from './pages/TemplateSelection';
import Profile from './pages/Profile';
import BuildResume from './pages/BuildResume';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';

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

      {/* Direct Routes (NO Router Wrapper Here) */}
      <Routes>
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
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route path="/profile" element={<Profile />} />
        
        <Route
          path="/build-resume"
          element={
            <ProtectedRoute>
              <BuildResume />
            </ProtectedRoute>
          }
        />

        {/* Fallback Catch-all Route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}