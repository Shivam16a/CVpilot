// client/src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import Toast from '../components/Toast';
import { toggleBlockUserApi, toggleAdminRoleApi } from '../services/adminService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AdminDashboard() {
    const [stats, setStats] = useState({ totalUsers: 0, blockedUsers: 0, totalResumes: 0, uniqueVisitors: 0 });
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [templateData, setTemplateData] = useState([]);
    const [suspiciousLogs, setSuspiciousLogs] = useState([]);

    const [filterType, setFilterType] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUserResumes, setSelectedUserResumes] = useState(null);
    const [loading, setLoading] = useState(true);

    const [actionLoading, setActionLoading] = useState({});
    const [toast, setToast] = useState({ message: '', type: 'success' });

    const showToast = (message, type = 'success') => setToast({ message, type });

    const loadAdminDashboardData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [statsRes, usersRes] = await Promise.all([
                axios.get('http://localhost:6050/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:6050/api/admin/users-with-resumes', { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (statsRes.data.success) {
                setStats(statsRes.data.stats || { totalUsers: 0, blockedUsers: 0, totalResumes: 0, uniqueVisitors: 0 });
                setSuspiciousLogs(statsRes.data.suspiciousLogs || []);
                setTemplateData(statsRes.data.templateAnalytics?.map(item => ({
                    name: item._id || 'Standard ATS',
                    count: item.count
                })) || []);
            }

            if (usersRes.data.success) {
                setUsers(usersRes.data.users);
                setFilteredUsers(usersRes.data.users);
            }
        } catch (error) {
            console.error("Dashboard Load Error:", error);
            showToast("Failed to load analytics dashboard.", "danger");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAdminDashboardData();
    }, []);

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

    useEffect(() => {
        let result = users;
        if (filterType === 'ACTIVE') result = result.filter(u => !u.isBlocked);
        if (filterType === 'BLOCKED') result = result.filter(u => u.isBlocked);
        if (filterType === 'ADMIN') result = result.filter(u => u.isAdmin);

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(u => u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
        }

        setFilteredUsers(result);
    }, [filterType, searchQuery, users]);

    return (
        <div className="container-fluid py-4 text-white" style={{ minHeight: '100vh', backgroundColor: '#070a12' }}>
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary border-opacity-25 flex-wrap gap-2">
                <div>
                    <h3 className="fw-bold text-info mb-1 d-flex align-items-center gap-2">
                        🛡️ Threat Intelligence & Executive Analytics
                    </h3>
                    <p className="text-white-50 small mb-0">De-duplicated unique device traffic, 404 intrusion traps & account governance.</p>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <input
                        type="text"
                        placeholder="🔍 Search user name / email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="form-control form-control-sm bg-dark text-white border-secondary"
                        style={{ width: '220px' }}
                    />
                    <button onClick={loadAdminDashboardData} className="btn btn-outline-info btn-sm">🔄 Sync Data</button>
                </div>
            </div>

            {/* 🚀 1. METRICS ROW WITH UNIQUE PHYSICAL DEVICES / IP COUNTER */}
            <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="p-3 bg-dark border border-secondary border-opacity-25 rounded-4 h-100 shadow-sm">
                        <span className="text-white-50 extra-small font-monospace">UNIQUE PHYSICAL DEVICES (IPs)</span>
                        <h2 className="fw-bold text-primary mb-0 mt-1">{stats.uniqueVisitors}</h2>
                        <span className="text-white-50 extra-small">De-duplicated across all accounts</span>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="p-3 bg-dark border border-secondary border-opacity-25 rounded-4 h-100 shadow-sm">
                        <span className="text-white-50 extra-small font-monospace">REGISTERED ACCOUNTS</span>
                        <h2 className="fw-bold text-info mb-0 mt-1">{stats.totalUsers}</h2>
                        <span className="text-white-50 extra-small">Total registered users</span>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="p-3 bg-dark border border-secondary border-opacity-25 rounded-4 h-100 shadow-sm">
                        <span className="text-white-50 extra-small font-monospace">TOTAL GENERATED RESUMES</span>
                        <h2 className="fw-bold text-success mb-0 mt-1">{stats.totalResumes}</h2>
                        <span className="text-white-50 extra-small">Synced to MongoDB Atlas</span>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="p-3 bg-dark border border-danger border-opacity-25 rounded-4 h-100 shadow-sm">
                        <span className="text-danger extra-small font-monospace">SUSPENDED ACCOUNTS</span>
                        <h2 className="fw-bold text-danger mb-0 mt-1">{stats.blockedUsers}</h2>
                        <span className="text-white-50 extra-small">Quarantined for abuse</span>
                    </div>
                </div>
            </div>

            {/* 🚀 2. ANALYTICS PROGRESS CHARTS */}
            <div className="row g-3 mb-4">
                <div className="col-12 col-lg-6">
                    <div className="p-3 bg-dark border border-secondary border-opacity-25 rounded-4 h-100">
                        <h6 className="fw-bold text-info mb-3">📈 Template Adoption Breakdown</h6>
                        <div style={{ width: '100%', height: '180px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={templateData}>
                                    <XAxis dataKey="name" stroke="#8884d8" fontSize={10} />
                                    <YAxis stroke="#8884d8" fontSize={10} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} />
                                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-lg-6">
                    <div className="p-3 bg-dark border border-secondary border-opacity-25 rounded-4 h-100">
                        <h6 className="fw-bold text-info mb-3">🎯 User Status Distribution</h6>
                        <div style={{ width: '100%', height: '180px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={[
                                        { name: 'Active Users', value: stats.totalUsers - stats.blockedUsers },
                                        { name: 'Blocked Users', value: stats.blockedUsers }
                                    ]} dataKey="value" cx="50%" cy="50%" outerRadius={60}>
                                        <Cell fill="#10b981" />
                                        <Cell fill="#ef4444" />
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🚀 3. SUSPICIOUS ROUTE ATTEMPTS & 404 INTRUSION TRAP MONITOR */}
            <div className="p-3.5 border border-danger border-opacity-30 rounded-4 bg-dark shadow-lg mb-4" style={{ background: 'rgba(20, 10, 15, 0.7)' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h5 className="fw-bold m-0 text-danger d-flex align-items-center gap-2">
                            🚨 Suspicious Route Intrusion Logs
                        </h5>
                        <span className="text-white-50 extra-small">Captured 404, probe, & unauthorized route attempts with user IP</span>
                    </div>
                    <span className="badge bg-danger bg-opacity-25 text-danger border border-danger px-2.5 py-1 font-monospace">
                        {suspiciousLogs.length} Events Trapped
                    </span>
                </div>

                {suspiciousLogs.length === 0 ? (
                    <div className="text-center py-4 text-white-50 small">No suspicious intrusions detected yet.</div>
                ) : (
                    <div className="table-responsive" style={{ maxHeight: '270px', overflowY: 'auto' }}>
                        <table className="table table-dark table-sm align-middle mb-0" style={{ fontSize: '0.8rem' }}>
                            <thead>
                                <tr className="text-white-50">
                                    <th>Timestamp</th>
                                    <th>Client IP</th>
                                    <th>Attempted Path</th>
                                    <th>Account / Email</th>
                                    <th>Severity</th>
                                    <th>Device / Browser</th>
                                </tr>
                            </thead>
                            <tbody>
                                {suspiciousLogs.map((log) => (
                                    <tr key={log._id}>
                                        <td className="text-white-50 font-monospace" style={{ fontSize: '0.72rem' }}>
                                            {new Date(log.timestamp).toLocaleTimeString()}
                                        </td>
                                        <td className="text-warning fw-bold font-monospace">{log.ip}</td>
                                        <td className="text-danger font-monospace fw-semibold">{log.attemptedRoute}</td>
                                        <td>
                                            <span className="fw-semibold text-white">{log.username}</span>
                                            <span className="text-white-50 extra-small d-block">{log.email}</span>
                                        </td>
                                        <td>
                                            <span className={`badge ${log.severity === 'HIGH' ? 'bg-danger text-white' : 'bg-warning text-dark'}`}>
                                                {log.severity}
                                            </span>
                                        </td>
                                        <td className="text-white-50 extra-small text-truncate" style={{ maxWidth: '220px' }} title={log.userAgent}>
                                            {log.userAgent}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 🚀 4. USER MANAGEMENT TABLE WITH RESUME INSPECTION */}
            <div className="p-3 border border-secondary border-opacity-25 rounded-4 bg-dark shadow-lg">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold m-0 text-white">
                        User Activity & Resume Monitoring <span className="badge bg-secondary ms-2">{filteredUsers.length} Users</span>
                    </h5>
                </div>

                {loading ? (
                    <div className="text-center py-5 text-white-50">Loading real-time user records...</div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-dark table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                            <thead>
                                <tr className="text-white-50">
                                    <th>User Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Resumes Created</th>
                                    <th className="text-end">Inspect Resumes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((u) => (
                                    <tr key={u._id}>
                                        <td className="fw-bold text-info">{u.username}</td>
                                        <td>{u.email}</td>
                                        <td>
                                            <select
                                                value={u.isAdmin ? 'admin' : 'user'}
                                                disabled={actionLoading[`role_${u._id}`]}
                                                onChange={(e) => {
                                                    const shouldBeAdmin = e.target.value === 'admin';
                                                    if (shouldBeAdmin !== u.isAdmin) {
                                                        handleToggleRole(u._id, u.isAdmin, u.username);
                                                    }
                                                }}
                                                className={`form-select form-select-sm py-1 px-2 border-0 fw-bold ${u.isAdmin
                                                    ? 'bg-primary text-white'
                                                    : 'bg-secondary bg-opacity-25 text-white-50 border border-secondary'
                                                    }`}
                                                style={{ fontSize: '0.75rem', width: '110px', borderRadius: '6px', cursor: 'pointer' }}
                                            >
                                                <option value="user" className="bg-dark text-white">👤 User</option>
                                                <option value="admin" className="bg-dark text-white">🛡️ Admin</option>
                                            </select>
                                        </td>

                                        <td>
                                            <select
                                                value={u.isBlocked ? 'blocked' : 'active'}
                                                disabled={actionLoading[u._id]}
                                                onChange={(e) => {
                                                    const shouldBlock = e.target.value === 'blocked';
                                                    if (shouldBlock !== u.isBlocked) {
                                                        handleToggleBlock(u._id, u.isBlocked, u.username);
                                                    }
                                                }}
                                                className={`form-select form-select-sm py-1 px-2 border-0 fw-bold ${u.isBlocked
                                                    ? 'bg-danger text-white'
                                                    : 'bg-success bg-opacity-25 text-success border border-success'
                                                    }`}
                                                style={{ fontSize: '0.75rem', width: '115px', borderRadius: '6px', cursor: 'pointer' }}
                                            >
                                                <option value="active" className="bg-dark text-success">ACTIVE</option>
                                                <option value="blocked" className="bg-dark text-danger">BLOCKED</option>
                                            </select>
                                        </td>
                                        <td>
                                            <span className="badge bg-info bg-opacity-25 text-info fw-bold">
                                                📄 {u.resumeCount || 0} Resumes
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            <button
                                                onClick={() => setSelectedUserResumes(u)}
                                                className="btn btn-outline-info btn-xs py-1 px-2.5"
                                                style={{ fontSize: '0.75rem' }}
                                            >
                                                🔍 View Resume Titles ({u.resumeCount || 0})
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Resume Inspection Modal */}
            {selectedUserResumes && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content bg-dark text-white border border-secondary rounded-4">
                            <div className="modal-header border-secondary pb-2">
                                <h5 className="modal-title fw-bold text-info">
                                    📄 Resumes created by: {selectedUserResumes.username}
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedUserResumes(null)}></button>
                            </div>

                            <div className="modal-body p-4 text-start">
                                {selectedUserResumes.resumesList?.length === 0 ? (
                                    <p className="text-white-50 mb-0">This user has not saved any resumes yet.</p>
                                ) : (
                                    <div className="d-flex flex-column gap-2">
                                        {selectedUserResumes.resumesList?.map((r, i) => (
                                            <div key={i} className="p-3 border border-secondary border-opacity-25 rounded-3 bg-secondary bg-opacity-10 d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h6 className="fw-bold text-white mb-0">{r.resumeTitle || 'Untitled Resume'}</h6>
                                                    <span className="text-white-50 extra-small">
                                                        Template: <span className="text-info">{r.template || 'Standard ATS'}</span> • Updated: {new Date(r.updatedAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <span className="badge bg-success bg-opacity-25 text-success border border-success extra-small">
                                                    Saved in Cloud
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer border-secondary pt-2">
                                <button onClick={() => setSelectedUserResumes(null)} className="btn btn-outline-light btn-sm px-4">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}