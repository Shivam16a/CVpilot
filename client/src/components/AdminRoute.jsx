// client/src/components/AdminRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function AdminRoute() {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const token = localStorage.getItem('token');

    // Check if user exists, logged in, and is Admin
    if (!token || !user || !user.isAdmin) {
        alert("Access Denied: Admin privileges required!");
        return <Navigate to="/build-resume" replace />;
    }

    return <Outlet />;
}