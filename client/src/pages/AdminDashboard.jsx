// client/src/pages/AdminDashboard.jsx (Updated file snippet)
import React, { useEffect, useState } from 'react';
import { fetchAdminStats, fetchAllUsers, toggleBlockUserApi, toggleAdminRoleApi } from '../services/adminService';
import Toast from '../components/Toast';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ totalUsers: 0, blockedUsers: 0, totalResumes: 0 });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});
    const [toast, setToast] = useState({ message: '', type: 'success' });

    const showToast = (message, type = 'success') => setToast({ message, type });

    const loadAdminData = async () => {
        setLoading(true);
        try {
            const [statsRes, usersRes] = await Promise.all([fetchAdminStats(), fetchAllUsers()]);
            if (statsRes.success) setStats(statsRes.stats);
            if (usersRes.success) setUsers(usersRes.users);
        } catch (error) {
            console.error("Admin Load Error:", error);
            showToast("Failed to load admin panel data.", "danger");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAdminData();
    }, []);

    // Toggle Block Action
    const handleToggleBlock = async (userId, currentBlockedStatus, username) => {
        const actionText = currentBlockedStatus ? 'UNBLOCK' : 'BLOCK';
        if (!window.confirm(`Are you sure you want to ${actionText} user "${username}"?`)) return;

        setActionLoading(prev => ({ ...prev, [userId]: true }));
        try {
            const res = await toggleBlockUserApi(userId);
            if (res.success) {
                showToast(res.message, currentBlockedStatus ? "success" : "warning");
                setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBlocked: res.isBlocked } : u));
            } else {
                showToast(res.message || "Operation failed", "danger");
            }
        } catch (err) {
            showToast("Network error executing action.", "danger");
        } finally {
            setActionLoading(prev => ({ ...prev, [userId]: false }));
        }
    };

    // 🚀 NEW: Toggle Admin Role Action
    const handleToggleRole = async (userId, currentAdminStatus, username) => {
        const actionText = currentAdminStatus ? 'Demote to USER' : 'Promote to ADMIN';
        if (!window.confirm(`Are you sure you want to ${actionText} for "${username}"?`)) return;

        setActionLoading(prev => ({ ...prev, [`role_${userId}`]: true }));
        try {
            const res = await toggleAdminRoleApi(userId);
            if (res.success) {
                showToast(res.message, "success");
                setUsers(prev => prev.map(u => u._id === userId ? { ...u, isAdmin: res.isAdmin } : u));
            } else {
                showToast(res.message || "Role change failed", "danger");
            }
        } catch (err) {
            showToast("Network error updating role.", "danger");
        } finally {
            setActionLoading(prev => ({ ...prev, [`role_${userId}`]: false }));
        }
    };

    return (
        <div className="container py-4 text-white">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold glow-title m-0">🛡️ Admin Security Control Center</h3>
                    <p className="text-white-50 small mb-0">Manage platform users, update access roles, and inspect security flags.</p>
                </div>
                <button onClick={loadAdminData} className="btn btn-outline-info btn-sm">🔄 Refresh Data</button>
            </div>

            {/* Metrics Cards */}
            <div className="row g-3 mb-4">
                <div className="col-12 col-md-4">
                    <div className="p-3 border border-secondary border-opacity-25 rounded-3 bg-dark bg-opacity-50">
                        <span className="text-white-50 small fw-medium">Total Registered Users</span>
                        <h2 className="fw-bold text-info mb-0 mt-1">{stats.totalUsers}</h2>
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="p-3 border border-secondary border-opacity-25 rounded-3 bg-dark bg-opacity-50">
                        <span className="text-white-50 small fw-medium">Blocked Suspicious Accounts</span>
                        <h2 className="fw-bold text-danger mb-0 mt-1">{stats.blockedUsers}</h2>
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="p-3 border border-secondary border-opacity-25 rounded-3 bg-dark bg-opacity-50">
                        <span className="text-white-50 small fw-medium">Total Cloud Resumes</span>
                        <h2 className="fw-bold text-success mb-0 mt-1">{stats.totalResumes}</h2>
                    </div>
                </div>
            </div>

            {/* User List Table */}
            <div className="p-3 border border-secondary border-opacity-25 rounded-3 bg-dark bg-opacity-50">
                <h5 className="fw-bold mb-3 text-info">User Access & Role Control</h5>

                {loading ? (
                    <div className="text-center py-4 text-white-50">Loading users data...</div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-dark table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                            <thead>
                                <tr className="text-white-50">
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Account Status</th>
                                    <th className="text-end">Role Action</th>
                                    <th className="text-end">Block Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u._id}>
                                        <td className="fw-bold">{u.username}</td>
                                        <td>{u.email}</td>
                                        <td>
                                            <span className={`badge ${u.isAdmin ? 'bg-primary' : 'bg-secondary'}`}>
                                                {u.isAdmin ? '🛡️ Admin' : '👤 User'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${u.isBlocked ? 'bg-danger' : 'bg-success bg-opacity-25 text-success border border-success'}`}>
                                                {u.isBlocked ? 'BLOCKED 🚫' : 'ACTIVE ✅'}
                                            </span>
                                        </td>

                                        {/* 🚀 Role Switcher Action */}
                                        <td className="text-end">
                                            <button
                                                disabled={actionLoading[`role_${u._id}`]}
                                                onClick={() => handleToggleRole(u._id, u.isAdmin, u.username)}
                                                className={`btn btn-xs py-1 px-2.5 ${u.isAdmin ? 'btn-outline-warning' : 'btn-outline-primary'}`}
                                                style={{ fontSize: '0.75rem', borderRadius: '6px' }}
                                            >
                                                {actionLoading[`role_${u._id}`] ? 'Updating...' : (u.isAdmin ? 'Demote to User' : 'Make Admin')}
                                            </button>
                                        </td>

                                        {/* Block / Unblock Action */}
                                        <td className="text-end">
                                            <button
                                                disabled={actionLoading[u._id]}
                                                onClick={() => handleToggleBlock(u._id, u.isBlocked, u.username)}
                                                className={`btn btn-xs py-1 px-2.5 ${u.isBlocked ? 'btn-success' : 'btn-outline-danger'}`}
                                                style={{ fontSize: '0.75rem', borderRadius: '6px' }}
                                            >
                                                {actionLoading[u._id] ? 'Processing...' : (u.isBlocked ? 'Unblock' : 'Block')}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}