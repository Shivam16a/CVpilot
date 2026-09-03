// client/src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import Toast from '../components/Toast';
import { toggleBlockUserApi, toggleAdminRoleApi, toggleIpBlockApi } from '../services/adminService';
// 🚀 Modular Analytics & Communications Components
import RevenueAnalytics from '../components/RevenueAnalytics';
import AdminCommunications from '../components/AdminCommunications';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        blockedUsers: 0,
        totalResumes: 0,
        uniqueVisitors: 0,
        totalRevenue: 0,
        freeTrialUsers: 0,
        upgradedUsers: 0,
        expiredUsers: 0
    });
    const [monthlyGrowth, setMonthlyGrowth] = useState([]);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [templateData, setTemplateData] = useState([]);
    const [suspiciousLogs, setSuspiciousLogs] = useState([]);

    // 🚫 Firewall Blacklisted IPs
    const [blockedIps, setBlockedIps] = useState(new Set());
    const [banningIp, setBanningIp] = useState({});

    const [filterType, setFilterType] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUserResumes, setSelectedUserResumes] = useState(null);
    const [loading, setLoading] = useState(true);

    // 🛡️ SOC Threat Radar Local States
    const [logSearchTerm, setLogSearchTerm] = useState('');
    const [logSeverityFilter, setLogSeverityFilter] = useState('ALL');
    const [copiedText, setCopiedText] = useState('');

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
                setStats(statsRes.data.stats || {});
                setMonthlyGrowth(statsRes.data.monthlyGrowth || []);

                // 🛡️ Client-side de-duplication: Purane consecutive duplicate logs ko clean karein
                const rawLogs = statsRes.data.suspiciousLogs || [];
                const cleanLogs = [];
                const seenKeys = new Set();

                rawLogs.forEach(log => {
                    const timeBucket = Math.floor(new Date(log.timestamp).getTime() / 30000); // 30 sec time slot
                    const key = `${log.ip}_${log.attemptedRoute}_${timeBucket}`;
                    if (!seenKeys.has(key)) {
                        seenKeys.add(key);
                        cleanLogs.push(log);
                    }
                });

                setSuspiciousLogs(cleanLogs);
                setTemplateData(statsRes.data.templateAnalytics?.map(item => ({
                    name: item._id || 'Standard ATS',
                    count: item.count
                })) || []);

                // Sync Blocked IPs Set
                const bannedList = statsRes.data.blockedIps || [];
                setBlockedIps(new Set(bannedList.map(item => item.ip || item)));
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

    // 🚫 1-Click IP Firewall Ban / Lift Ban Toggle
    const handleToggleIpBan = async (targetIp) => {
        const isBanned = blockedIps.has(targetIp);
        const confirmMsg = isBanned
            ? `Are you sure you want to UNBLOCK and lift Firewall Ban on IP: ${targetIp}?`
            : `CRITICAL ACTION: Block IP ${targetIp} permanently on CVPilot Firewall?`;

        if (!window.confirm(confirmMsg)) return;

        setBanningIp(prev => ({ ...prev, [targetIp]: true }));
        try {
            const res = await toggleIpBlockApi(targetIp, 'Manual Quarantine via SOC Threat Radar');
            if (res.success) {
                showToast(res.message, res.isBlocked ? 'warning' : 'success');
                setBlockedIps(prev => {
                    const updated = new Set(prev);
                    if (res.isBlocked) updated.add(targetIp);
                    else updated.delete(targetIp);
                    return updated;
                });
            } else {
                showToast(res.message || "Firewall rule update failed", "danger");
            }
        } catch (err) {
            showToast("Network error updating firewall rule.", "danger");
        } finally {
            setBanningIp(prev => ({ ...prev, [targetIp]: false }));
        }
    };

    // User Table Filter Effect
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

    // 🛡️ Log Actions & Filtering
    const handleCopyLogItem = (text, label) => {
        navigator.clipboard.writeText(text);
        setCopiedText(text);
        showToast(`${label} copied to clipboard!`, 'info');
        setTimeout(() => setCopiedText(''), 1800);
    };

    const filteredLogs = suspiciousLogs.filter((log) => {
        const matchesSeverity = logSeverityFilter === 'ALL' || log.severity === logSeverityFilter;
        const q = logSearchTerm.toLowerCase();
        const matchesSearch =
            !q ||
            log.ip?.toLowerCase().includes(q) ||
            log.attemptedRoute?.toLowerCase().includes(q) ||
            log.username?.toLowerCase().includes(q) ||
            log.email?.toLowerCase().includes(q);
        return matchesSeverity && matchesSearch;
    });

    const highSeverityCount = suspiciousLogs.filter(l => l.severity === 'HIGH').length;
    const uniqueAttackIps = new Set(suspiciousLogs.map(l => l.ip)).size;

    return (
        <div className="container-fluid py-4 text-white" style={{ minHeight: '100vh', backgroundColor: '#070a12' }}>
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

            {/* Header Control */}
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary border-opacity-25 flex-wrap gap-2">
                <div>
                    <h3 className="fw-bold text-info mb-1 d-flex align-items-center gap-2">
                        🛡️ Threat Intelligence & Executive Analytics
                    </h3>
                    <p className="text-white-50 small mb-0">De-duplicated unique device traffic, revenue telemetry & subscriber monitoring.</p>
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

            {/* 🚀 1. REVENUE, UPGRADES & MONTHLY GROWTH ANALYTICS */}
            <RevenueAnalytics stats={stats} monthlyGrowth={monthlyGrowth} />

            {/* 2. BASE METRICS ROW */}
            <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="p-3 bg-dark border border-secondary border-opacity-25 rounded-4 h-100 shadow-sm">
                        <span className="text-white-50 extra-small font-monospace">UNIQUE DEVICES (IPs)</span>
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

            {/* 3. ADOPTION & STATUS CHARTS */}
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

            {/* 🚀 4. SUSPICIOUS ROUTE INTRUSION LOGS (CLEAN SOC THREAT RADAR + 1-CLICK FIREWALL BAN) */}
            <div
                className="p-3.5 p-md-4 rounded-4 shadow-2xl mb-4 border transition-all"
                style={{
                    background: 'linear-gradient(180deg, rgba(26, 11, 16, 0.95) 0%, rgba(15, 7, 10, 0.98) 100%)',
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    boxShadow: '0 8px 32px rgba(220, 38, 38, 0.12)'
                }}
            >
                {/* Header Section with Live Pulse & Metrics */}
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3 pb-3 border-bottom border-danger border-opacity-20">
                    <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="spinner-grow spinner-grow-sm text-danger" style={{ width: '10px', height: '10px' }} role="status"></span>
                            <h5 className="fw-bold m-0 text-white d-flex align-items-center gap-2 tracking-wide" style={{ fontSize: '1.05rem' }}>
                                <span>🚨</span> Suspicious Route Intrusion & Trap Logs
                            </h5>
                            <span
                                className="rounded-pill px-2 py-0.5 extra-small font-monospace fw-bold text-danger border border-danger border-opacity-75 d-inline-flex align-items-center gap-1.5"
                                style={{
                                    background: 'transparent',
                                    boxShadow: '0 0 10px rgba(239, 68, 68, 0.25)',
                                    letterSpacing: '0.6px',
                                    fontSize: '0.68rem'
                                }}
                            >
                                <span
                                    className="rounded-circle d-inline-block bg-danger animate-pulse"
                                    style={{
                                        width: '6px',
                                        height: '6px',
                                        boxShadow: '0 0 8px #ef4444'
                                    }}
                                ></span>
                                LIVE RADAR
                            </span>
                        </div>
                        <span className="text-white-50 extra-small">
                            Automated honey-pot monitoring capturing 404 scans, path traversals, brute-force probes and active firewall quarantine.
                        </span>
                    </div>

                    {/* Metric Quick Indicators */}
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        <div className="px-2 py-1 rounded-3 bg-black bg-opacity-40 border border-secondary border-opacity-25 text-center">
                            <span className="text-white-50 extra-small d-block text-uppercase" style={{ fontSize: '0.62rem' }}>Unique Attackers</span>
                            <span className="fw-bold text-warning font-monospace small">{uniqueAttackIps} IPs</span>
                        </div>
                        {/* High Threat Indicator */}
                        <div
                            className="px-2 py-1 rounded-3 border border-danger border-opacity-60 text-center transition-all"
                            style={{
                                background: 'transparent',
                                boxShadow: '0 0 12px rgba(239, 68, 68, 0.15)'
                            }}
                        >
                            <span
                                className="text-danger extra-small d-block text-uppercase fw-semibold"
                                style={{ fontSize: '0.62rem', letterSpacing: '0.5px' }}
                            >
                                High Threat
                            </span>
                            <span
                                className="fw-bold text-danger font-monospace small"
                                style={{ textShadow: '0 0 8px rgba(239, 68, 68, 0.4)' }}
                            >
                                {highSeverityCount} Critical
                            </span>
                        </div>

                        {/* Firewall Banned Indicator */}
                        <div
                            className="px-2 py-1 rounded-3 border border-danger border-opacity-60 text-center transition-all"
                            style={{
                                background: 'transparent',
                                boxShadow: '0 0 12px rgba(239, 68, 68, 0.15)'
                            }}
                        >
                            <span
                                className="text-danger extra-small d-block text-uppercase fw-semibold"
                                style={{ fontSize: '0.62rem', letterSpacing: '0.5px' }}
                            >
                                Firewall Banned
                            </span>
                            <span
                                className="fw-bold text-danger font-monospace small"
                                style={{ textShadow: '0 0 8px rgba(239, 68, 68, 0.4)' }}
                            >
                                {blockedIps.size} Banned
                            </span>
                        </div>
                        <div className="px-2 py-1 rounded-3 bg-black bg-opacity-40 border border-secondary border-opacity-25 text-center">
                            <span className="text-white-50 extra-small d-block text-uppercase" style={{ fontSize: '0.62rem' }}>Total Trapped</span>
                            <span className="fw-bold text-white font-monospace small">{suspiciousLogs.length} Events</span>
                        </div>
                    </div>
                </div>

                {/* Filter & Search Toolbar */}
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                    <div className="d-flex gap-1.5 align-items-center">
                        {['ALL', 'HIGH', 'MEDIUM'].map((sev) => (
                            <button
                                key={sev}
                                type="button"
                                onClick={() => setLogSeverityFilter(sev)}
                                className={`btn btn-xs py-1 px-2.5 rounded-pill extra-small fw-semibold transition-all ${logSeverityFilter === sev
                                    ? sev === 'HIGH' ? 'btn-danger text-white shadow-sm' : 'btn-warning text-dark shadow-sm'
                                    : 'btn-dark text-white-50 border border-secondary border-opacity-30'
                                    }`}
                                style={{ fontSize: '0.72rem' }}
                            >
                                {sev === 'ALL' ? 'All Severities' : `${sev} Severity`}
                            </button>
                        ))}
                    </div>

                    <div className="position-relative" style={{ minWidth: '220px' }}>
                        <input
                            type="text"
                            placeholder="🔍 Filter by IP, Path, or User..."
                            value={logSearchTerm}
                            onChange={(e) => setLogSearchTerm(e.target.value)}
                            className="form-control form-control-sm glass-input text-white extra-small pe-4"
                            style={{
                                fontSize: '0.76rem',
                                height: '30px',
                                background: 'rgba(0,0,0,0.5)',
                                borderColor: 'rgba(255,255,255,0.1)'
                            }}
                        />
                        {logSearchTerm && (
                            <button
                                type="button"
                                onClick={() => setLogSearchTerm('')}
                                className="btn btn-link text-white-50 position-absolute end-0 top-50 translate-middle-y p-1 extra-small text-decoration-none"
                                style={{ fontSize: '0.7rem' }}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Table Core */}
                {filteredLogs.length === 0 ? (
                    <div className="text-center py-4 border border-dashed border-secondary border-opacity-25 rounded-3 bg-black bg-opacity-20 text-white-50 small">
                        🛡️ No matching suspicious intrusions detected. All systems nominal.
                    </div>
                ) : (
                    <div className="table-responsive rounded-3 border border-secondary border-opacity-25 shadow-inner" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                        <table className="table table-dark table-hover table-sm align-middle mb-0" style={{ fontSize: '0.8rem' }}>
                            <thead className="bg-black sticky-top" style={{ zIndex: 2 }}>
                                <tr className="text-white-50 extra-small border-bottom border-secondary border-opacity-25">
                                    <th className="py-2.5 px-3">TIMESTAMP</th>
                                    <th className="py-2.5">CLIENT IP & FIREWALL</th>
                                    <th className="py-2.5">TARGET / PROBE PATH</th>
                                    <th className="py-2.5">ACCOUNT / EMAIL</th>
                                    <th className="py-2.5">SEVERITY</th>
                                    <th className="py-2.5 text-end px-3">DEVICE / BROWSER</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map((log) => {
                                    const isHigh = log.severity === 'HIGH';
                                    const isIpBanned = blockedIps.has(log.ip);

                                    return (
                                        <tr
                                            key={log._id}
                                            style={{
                                                borderBottom: '1px solid rgba(255,255,255,0.04)',
                                                backgroundColor: isIpBanned ? 'rgba(220, 38, 38, 0.12)' : (isHigh ? 'rgba(220, 38, 38, 0.04)' : 'transparent')
                                            }}
                                        >
                                            {/* Timestamp */}
                                            <td className="py-2 px-3 font-monospace text-white-50 extra-small text-nowrap">
                                                <span>🕒 {new Date(log.timestamp).toLocaleTimeString()}</span>
                                                <span className="d-block text-white-50" style={{ fontSize: '0.65rem' }}>
                                                    {new Date(log.timestamp).toLocaleDateString()}
                                                </span>
                                            </td>

                                            {/* Client IP + 1-Click Firewall Ban Toggle */}
                                            <td className="py-2 text-nowrap">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div
                                                        onClick={() => handleCopyLogItem(log.ip, 'IP Address')}
                                                        className="d-inline-flex align-items-center gap-1.5 px-2 py-0.5 rounded border border-warning border-opacity-25 bg-black bg-opacity-40 cursor-pointer text-warning font-monospace fw-bold extra-small"
                                                        style={{ cursor: 'pointer' }}
                                                        title="Click to copy IP"
                                                    >
                                                        <span>{log.ip}</span>
                                                        <span style={{ fontSize: '0.65rem' }}>{copiedText === log.ip ? '✓' : '📋'}</span>
                                                    </div>

                                                    {/* 🚀 1-CLICK FIREWALL BAN TOGGLE */}
                                                    <button
                                                        type="button"
                                                        disabled={banningIp[log.ip]}
                                                        onClick={() => handleToggleIpBan(log.ip)}
                                                        className={`btn btn-xs py-0.5 px-2 extra-small rounded-pill font-monospace fw-bold transition-all ${isIpBanned
                                                            ? 'btn-danger text-white shadow-sm'
                                                            : 'btn-outline-danger'
                                                            }`}
                                                        style={{ fontSize: '0.66rem' }}
                                                        title={isIpBanned ? "Click to Lift Firewall Ban" : "Quarantine IP on Server Firewall"}
                                                    >
                                                        {banningIp[log.ip] ? '...' : (isIpBanned ? '🚫 BANNED' : 'BAN IP ⚡')}
                                                    </button>
                                                </div>
                                            </td>

                                            {/* Attempted Route */}
                                            <td className="py-2 text-nowrap">
                                                <span
                                                    onClick={() => handleCopyLogItem(log.attemptedRoute, 'Route Path')}
                                                    className="d-inline-block px-2 py-0.5 rounded font-monospace fw-bold text-danger border border-danger border-opacity-20 bg-danger bg-opacity-10 cursor-pointer extra-small"
                                                    style={{ cursor: 'pointer', maxWidth: '220px' }}
                                                    title="Click to copy path"
                                                >
                                                    {log.attemptedRoute}
                                                </span>
                                            </td>

                                            {/* Account / User */}
                                            <td className="py-2">
                                                <span className="fw-semibold text-white d-block lh-1 mb-0.5">{log.username || 'Anonymous'}</span>
                                                <span className="text-white-50 extra-small d-block font-monospace" style={{ fontSize: '0.68rem' }}>
                                                    {log.email || 'Guest / Unauthenticated'}
                                                </span>
                                            </td>

                                            {/* Severity */}
                                            <td className="py-2">
                                                <span
                                                    className={`px-2 py-0.5 rounded-pill font-monospace fw-bold extra-small d-inline-flex align-items-center gap-1.5 transition-all ${isHigh
                                                        ? 'text-danger border border-danger'
                                                        : 'text-warning border border-warning'
                                                        }`}
                                                    style={{
                                                        background: 'transparent',
                                                        borderColor: isHigh ? '#ef4444' : '#f59e0b',
                                                        boxShadow: isHigh
                                                            ? '0 0 8px rgba(239, 68, 68, 0.25)'
                                                            : '0 0 8px rgba(245, 158, 11, 0.2)',
                                                        fontSize: '0.68rem',
                                                        letterSpacing: '0.4px'
                                                    }}
                                                >
                                                    <span
                                                        className="rounded-circle d-inline-block"
                                                        style={{
                                                            width: '5px',
                                                            height: '5px',
                                                            backgroundColor: isHigh ? '#ef4444' : '#f59e0b',
                                                            boxShadow: `0 0 6px ${isHigh ? '#ef4444' : '#f59e0b'}`
                                                        }}
                                                    ></span>
                                                    {isHigh ? 'HIGH RISK' : 'SUSPICIOUS'}
                                                </span>
                                            </td>

                                            {/* Device / Agent */}
                                            <td className="py-2 text-end px-3">
                                                <span className="text-white-50 extra-small d-inline-block text-truncate font-monospace" style={{ maxWidth: '200px' }} title={log.userAgent}>
                                                    {log.userAgent || 'Unknown Scanner'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 🚀 INQUIRIES & AUTOMATED EMAIL DISPATCHER */}
            <AdminCommunications
                users={users}
                suspiciousLogs={suspiciousLogs}
                showToast={showToast}
            />

            {/* 5. USER MANAGEMENT TABLE */}
            <div className="p-3 border border-secondary border-opacity-25 rounded-4 bg-dark shadow-lg mt-4">
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