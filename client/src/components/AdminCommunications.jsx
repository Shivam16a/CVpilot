// client/src/components/AdminCommunications.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminCommunications({ users = [], suspiciousLogs = [], showToast }) {
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [filterCategory, setFilterCategory] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    // Email Dispatcher State
    const [targetEmail, setTargetEmail] = useState('');
    const [targetName, setTargetName] = useState('');
    const [targetIp, setTargetIp] = useState('');
    const [templateType, setTemplateType] = useState('UPGRADE_PLAN');
    const [customSubject, setCustomSubject] = useState('');
    const [customBody, setCustomBody] = useState('');
    const [sendingEmail, setSendingEmail] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // Fetch All Contact Inquiries
    const fetchInquiries = async () => {
        setLoadingMessages(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:6050/api/contact/admin/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setMessages(res.data.messages || []);
            }
        } catch (error) {
            console.error("Fetch inquiries error:", error);
        } finally {
            setLoadingMessages(false);
        }
    };

    useEffect(() => {
        fetchInquiries();
    }, []);

    // Auto-detect IP when user is chosen
    const handleSelectUser = (email) => {
        setTargetEmail(email);
        const matchedUser = users.find(u => u.email === email);
        if (matchedUser) {
            setTargetName(matchedUser.username);
        }
        const matchedLog = suspiciousLogs.find(l => l.email === email || l.username === matchedUser?.username);
        setTargetIp(matchedLog ? matchedLog.ip : '');
    };

    // Quick Reply to Contact message sender
    const handleQuickReply = (msg) => {
        setTargetEmail(msg.email);
        setTargetName(msg.name);
        setTargetIp(msg.ip || '');
        setTemplateType('CUSTOM');
        setCustomSubject(`Re: [${msg.subjectType}] Response from CVPilot Team`);
        setCustomBody(`Hi ${msg.name},\n\nThank you for reaching out regarding your inquiry:\n"${msg.message}"\n\n`);
        showToast(`Loaded message from ${msg.name}`, "info");
    };

    // 1-Click Load from Suspicious Probes
    const handlePopulateSuspiciousUser = (log) => {
        setTargetEmail(log.email !== 'Unauthenticated' ? log.email : '');
        setTargetName(log.username !== 'Guest Visitor' ? log.username : 'User');
        setTargetIp(log.ip || '127.0.0.1');
        setTemplateType('SUSPICIOUS_ALERT');
        showToast(`Loaded probe details for IP: ${log.ip}`, "info");
    };

    // Filtered Inquiries List
    const filteredMessages = messages.filter(m => {
        const matchesCat = filterCategory === 'ALL' || m.subjectType === filterCategory;
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q || m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q) || m.message?.toLowerCase().includes(q);
        return matchesCat && matchesSearch;
    });

    // Dispatch Email Handler
    const handleDispatchEmail = async (e) => {
        e.preventDefault();
        if (!targetEmail) {
            showToast("Recipient email is required.", "danger");
            return;
        }

        setSendingEmail(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                'http://localhost:6050/api/contact/admin/dispatch-mail',
                {
                    targetEmail,
                    targetName,
                    templateType,
                    customSubject,
                    customBody,
                    targetIp
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                showToast(`Email dispatched to ${targetEmail}! 🚀`, "success");
                if (templateType === 'CUSTOM') {
                    setCustomSubject('');
                    setCustomBody('');
                }
            }
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to dispatch email.", "danger");
        } finally {
            setSendingEmail(false);
        }
    };

    // Helper for category badge styling
    const getBadgeClass = (type) => {
        switch (type) {
            case 'BUG_REPORT': return 'bg-danger bg-opacity-15 text-danger border-danger';
            case 'BILLING': return 'bg-warning bg-opacity-15 text-warning border-warning';
            case 'FEATURE_SUGGESTION': return 'bg-info bg-opacity-15 text-info border-info';
            default: return 'bg-secondary bg-opacity-15 text-white-50 border-secondary';
        }
    };

    return (
        <div className="mb-4">

            {/* 🚀 QUICK PROBE DETECTOR STRIP (If Suspicious Logs exist) */}
            {suspiciousLogs.length > 0 && (
                <div className="p-2.5 px-3 rounded-4 mb-3 border border-danger border-opacity-30 bg-black bg-opacity-40 d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-2">
                        <span className="spinner-grow spinner-grow-sm text-danger" style={{ width: '8px', height: '8px' }}></span>
                        <span className="extra-small fw-bold text-danger text-uppercase tracking-wider">
                            Recent Security Traps:
                        </span>
                        <span className="text-white-50 extra-small">Click any probed IP to auto-fill warning:</span>
                    </div>

                    <div className="d-flex flex-wrap gap-1.5">
                        {suspiciousLogs.slice(0, 4).map((log, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => handlePopulateSuspiciousUser(log)}
                                className="btn btn-outline-danger btn-xs py-0.5 px-2 font-monospace extra-small rounded-pill d-flex align-items-center gap-1"
                                style={{ fontSize: '0.72rem' }}
                                title={`Target: ${log.attemptedRoute}`}
                            >
                                <span>⚠️</span>
                                <span>{log.ip}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="row g-3 g-xl-4 align-items-stretch">

                {/* =========================================================
                    LEFT: RECEIVED INQUIRIES & USER FEEDBACK DESK
                   ========================================================= */}
                <div className="col-12 col-xl-7">
                    <div
                        className="p-3.5 p-md-4 rounded-4 h-100 d-flex flex-column justify-content-between shadow-xl"
                        style={{
                            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(11, 15, 25, 0.98) 100%)',
                            border: '1px solid rgba(255, 255, 255, 0.08)'
                        }}
                    >
                        <div>
                            {/* Card Header & Controls */}
                            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                                <div>
                                    <h5 className="fw-bold text-white mb-0 d-flex align-items-center gap-2">
                                        <span>📬</span> User Inquiries & Support Tickets
                                        <span className="badge bg-info bg-opacity-20 text-white border border-info border-opacity-30 rounded-pill px-2.5 py-0.5 extra-small">
                                            {messages.length}
                                        </span>
                                    </h5>
                                    <span className="text-white-50 extra-small">Direct submissions from the "Get in touch with us" form</span>
                                </div>

                                <div className="d-flex gap-2 align-items-center">
                                    <button
                                        onClick={fetchInquiries}
                                        className="btn btn-outline-secondary btn-sm py-1 px-2.5 extra-small text-white-50 rounded-pill"
                                        title="Refresh Inquiries"
                                    >
                                        🔄 Sync
                                    </button>
                                </div>
                            </div>

                            {/* Search & Category Filter Pills */}
                            <div className="d-flex flex-wrap gap-2 mb-3 align-items-center justify-content-between">
                                <div className="d-flex flex-wrap gap-1">
                                    {['ALL', 'GENERAL', 'FEATURE_SUGGESTION', 'BUG_REPORT', 'BILLING'].map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setFilterCategory(cat)}
                                            className={`btn btn-xs py-1 px-2.5 rounded-pill extra-small fw-semibold ${filterCategory === cat ? 'btn-info text-dark shadow-sm' : 'btn-dark text-white-50 border border-secondary border-opacity-25'}`}
                                            style={{ fontSize: '0.72rem' }}
                                        >
                                            {cat.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>

                                <input
                                    type="text"
                                    placeholder="🔍 Search name / text..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="form-control form-control-sm glass-input text-white extra-small"
                                    style={{ width: '170px', fontSize: '0.75rem', height: '28px' }}
                                />
                            </div>

                            {/* Inquiries Table */}
                            {loadingMessages ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border spinner-border-sm text-info mb-2"></div>
                                    <p className="text-white-50 extra-small">Synchronizing messages...</p>
                                </div>
                            ) : filteredMessages.length === 0 ? (
                                <div className="text-center py-5 border border-dashed border-secondary border-opacity-25 rounded-3 bg-black bg-opacity-20">
                                    <span className="fs-3 mb-1 d-block">📭</span>
                                    <p className="text-white-50 extra-small mb-0">No messages match your selected filter.</p>
                                </div>
                            ) : (
                                <div className="table-responsive rounded-3 border border-secondary border-opacity-20" style={{ maxHeight: '380px', overflowY: 'auto' }}>
                                    <table className="table table-dark table-hover table-sm align-middle mb-0" style={{ fontSize: '0.8rem' }}>
                                        <thead className="bg-black bg-opacity-40">
                                            <tr className="text-white-50 extra-small">
                                                <th className="py-2 px-3">SENDER</th>
                                                <th className="py-2">TOPIC</th>
                                                <th className="py-2">MESSAGE EXCERPT</th>
                                                <th className="py-2 text-end px-3">ACTION</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredMessages.map((m) => (
                                                <tr key={m._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td className="py-2.5 px-3">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div className="rounded-circle bg-info bg-opacity-20 text-info fw-bold d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '28px', height: '28px', fontSize: '0.72rem' }}>
                                                                {m.name?.charAt(0).toUpperCase() || 'U'}
                                                            </div>
                                                            <div>
                                                                <span className="fw-semibold text-white d-block lh-1 mb-0.5">{m.name}</span>
                                                                <span className="text-white-50 extra-small d-block font-monospace" style={{ fontSize: '0.68rem' }}>{m.email}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`badge border px-2 py-0.5 rounded-pill extra-small ${getBadgeClass(m.subjectType)}`} style={{ fontSize: '0.65rem' }}>
                                                            {m.subjectType.replace('_', ' ')}
                                                        </span>
                                                        <span className="d-block text-warning font-monospace extra-small mt-0.5" style={{ fontSize: '0.65rem' }}>
                                                            IP: {m.ip || '127.0.0.1'}
                                                        </span>
                                                    </td>
                                                    <td style={{ maxWidth: '210px' }}>
                                                        <div className="text-truncate text-white-50" title={m.message}>
                                                            {m.message}
                                                        </div>
                                                        <span className="extra-small text-white-50 font-monospace" style={{ fontSize: '0.66rem' }}>
                                                            🕒 {new Date(m.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </td>
                                                    <td className="text-end px-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQuickReply(m)}
                                                            className="btn btn-info text-dark btn-xs py-1 px-2.5 fw-bold rounded-pill shadow-sm"
                                                            style={{ fontSize: '0.72rem' }}
                                                        >
                                                            Reply ✉️
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
                </div>

                {/* =========================================================
                    RIGHT: AUTOMATED USER EMAIL DISPATCHER ENGINE
                   ========================================================= */}
                <div className="col-12 col-xl-5">
                    <div
                        className="p-3.5 p-md-4 rounded-4 h-100 shadow-xl d-flex flex-column justify-content-between"
                        style={{
                            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(11, 15, 25, 0.98) 100%)',
                            border: '1px solid rgba(255, 255, 255, 0.08)'
                        }}
                    >
                        <form onSubmit={handleDispatchEmail}>
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <h5 className="fw-bold text-info mb-0 d-flex align-items-center gap-2">
                                        <span>📤</span> Targeted Mail Dispatcher
                                    </h5>
                                    <span className="badge bg-success bg-opacity-15 text-white border border-success border-opacity-30 rounded-pill extra-small font-monospace">
                                        SMTP Live
                                    </span>
                                </div>
                                <p className="text-white-50 extra-small mb-3">Send automated compliance notices or custom updates to user inboxes.</p>

                                {/* Pick Registered User */}
                                <div className="mb-2.5">
                                    <label className="form-label text-white-50 extra-small mb-1 fw-bold text-uppercase">
                                        Select Target User (Auto-fills Email)
                                    </label>
                                    <select
                                        onChange={(e) => handleSelectUser(e.target.value)}
                                        className="form-select form-select-sm bg-dark text-white border-secondary border-opacity-40"
                                        style={{ fontSize: '0.8rem' }}
                                    >
                                        <option value="">-- Choose Registered Candidate --</option>
                                        {users.map(u => (
                                            <option key={u._id} value={u.email}>
                                                {u.username} • {u.email} ({u.subscription?.plan || 'TRIAL'})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Recipient Email & Name Row */}
                                <div className="row g-2 mb-2.5">
                                    <div className="col-7">
                                        <label className="form-label text-white-50 extra-small mb-1 fw-bold text-uppercase">Recipient Email *</label>
                                        <input
                                            type="email"
                                            required
                                            value={targetEmail}
                                            onChange={(e) => setTargetEmail(e.target.value)}
                                            placeholder="user@example.com"
                                            className="form-control form-control-sm glass-input text-white"
                                            style={{ fontSize: '0.8rem' }}
                                        />
                                    </div>
                                    <div className="col-5">
                                        <label className="form-label text-white-50 extra-small mb-1 fw-bold text-uppercase">User Name</label>
                                        <input
                                            type="text"
                                            value={targetName}
                                            onChange={(e) => setTargetName(e.target.value)}
                                            placeholder="Candidate"
                                            className="form-control form-control-sm glass-input text-white"
                                            style={{ fontSize: '0.8rem' }}
                                        />
                                    </div>
                                </div>

                                {/* Dynamic Target IP Address Field */}
                                <div className="mb-3">
                                    <label className="form-label text-white-50 extra-small mb-1 d-flex justify-content-between align-items-center">
                                        <span className="fw-bold text-uppercase">Target IP (Logged Client IP)</span>
                                        {targetIp ? (
                                            <span className="text-success extra-small fw-bold">✓ IP Linked</span>
                                        ) : (
                                            <span className="text-white-50 extra-small">Auto-resolves from Audit Log if blank</span>
                                        )}
                                    </label>
                                    <input
                                        type="text"
                                        value={targetIp}
                                        onChange={(e) => setTargetIp(e.target.value)}
                                        placeholder="e.g. 192.168.1.102 (Auto-injected into Security Alert)"
                                        className="form-control form-control-sm glass-input text-warning font-monospace"
                                        style={{ fontSize: '0.78rem' }}
                                    />
                                </div>

                                {/* Interactive Action Cards (Replaces standard select) */}
                                <label className="form-label text-white-50 extra-small mb-1.5 fw-bold text-uppercase">
                                    Choose Email Template Preset
                                </label>
                                <div className="row g-2 mb-3">
                                    <div className="col-6">
                                        <div
                                            onClick={() => setTemplateType('UPGRADE_PLAN')}
                                            className={`p-2 rounded-3 border cursor-pointer text-start transition-all ${templateType === 'UPGRADE_PLAN' ? 'border-info bg-info bg-opacity-10 text-white' : 'border-secondary border-opacity-25 bg-black bg-opacity-20 text-white-50'}`}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <span className="d-block fw-bold small text-info">💎 Upgrade Notice</span>
                                            <span className="extra-small d-block" style={{ fontSize: '0.68rem' }}>30-Day Trial Expiration</span>
                                        </div>
                                    </div>

                                    <div className="col-6">
                                        <div
                                            onClick={() => setTemplateType('SUSPICIOUS_ALERT')}
                                            className={`p-2 rounded-3 border cursor-pointer text-start transition-all ${templateType === 'SUSPICIOUS_ALERT' ? 'border-danger bg-danger bg-opacity-10 text-white' : 'border-secondary border-opacity-25 bg-black bg-opacity-20 text-white-50'}`}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <span className="d-block fw-bold small text-danger">🚨 Probe Warning</span>
                                            <span className="extra-small d-block" style={{ fontSize: '0.68rem' }}>Includes Client IP & Route</span>
                                        </div>
                                    </div>

                                    <div className="col-6">
                                        <div
                                            onClick={() => setTemplateType('NEW_FEATURE')}
                                            className={`p-2 rounded-3 border cursor-pointer text-start transition-all ${templateType === 'NEW_FEATURE' ? 'border-success bg-success bg-opacity-10 text-white' : 'border-secondary border-opacity-25 bg-black bg-opacity-20 text-white-50'}`}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <span className="d-block fw-bold small text-success">🚀 Feature Drop</span>
                                            <span className="extra-small d-block" style={{ fontSize: '0.68rem' }}>Gemini & Job Matcher</span>
                                        </div>
                                    </div>

                                    <div className="col-6">
                                        <div
                                            onClick={() => setTemplateType('CUSTOM')}
                                            className={`p-2 rounded-3 border cursor-pointer text-start transition-all ${templateType === 'CUSTOM' ? 'border-warning bg-warning bg-opacity-10 text-white' : 'border-secondary border-opacity-25 bg-black bg-opacity-20 text-white-50'}`}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <span className="d-block fw-bold small text-warning">✍️ Custom Reply</span>
                                            <span className="extra-small d-block" style={{ fontSize: '0.68rem' }}>Custom subject & body</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Custom Editor (Shown when template is CUSTOM) */}
                                {templateType === 'CUSTOM' && (
                                    <div className="p-3 rounded-3 border border-secondary border-opacity-30 mb-3 bg-black bg-opacity-40">
                                        <div className="mb-2">
                                            <label className="form-label text-white-50 extra-small mb-1 fw-bold">SUBJECT LINE</label>
                                            <input
                                                type="text"
                                                value={customSubject}
                                                onChange={(e) => setCustomSubject(e.target.value)}
                                                placeholder="e.g. Update regarding your ticket..."
                                                className="form-control form-control-sm glass-input text-white"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label text-white-50 extra-small mb-1 fw-bold">EMAIL BODY CONTENT</label>
                                            <textarea
                                                rows={3}
                                                value={customBody}
                                                onChange={(e) => setCustomBody(e.target.value)}
                                                placeholder="Write custom instructions or ticket reply..."
                                                className="form-control glass-input text-white small"
                                                style={{ fontSize: '0.8rem' }}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Preview Dropdown Accordion */}
                                <div className="mb-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowPreview(!showPreview)}
                                        className="btn btn-link p-0 text-decoration-none text-info extra-small d-flex align-items-center gap-1"
                                    >
                                        <span>{showPreview ? '▼ Hide' : '▶ Show'} Template Preview Layout</span>
                                    </button>

                                    {showPreview && (
                                        <div className="p-2.5 rounded-3 bg-black bg-opacity-50 border border-secondary border-opacity-25 mt-1.5 extra-small text-white-50">
                                            <strong className="text-white d-block mb-1">
                                                Template Target: <span className="text-info">{templateType}</span>
                                            </strong>
                                            <span>
                                                {templateType === 'UPGRADE_PLAN' && "Includes 30-day trial completion notice, list of Pro features, and 1-click Razorpay checkout button."}
                                                {templateType === 'SUSPICIOUS_ALERT' && `Includes real-time client IP (${targetIp || 'Dynamic Lookup'}), target endpoint probe, and safety quarantine warning.`}
                                                {templateType === 'NEW_FEATURE' && "Highlights Gemini AI ATS scoring, AI cover letter exports, and integrated job board feeds."}
                                                {templateType === 'CUSTOM' && (customSubject || "Custom email body will be wrapped in CVPilot's dark corporate email frame.")}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Submit Dispatch Action */}
                            <button
                                type="submit"
                                disabled={sendingEmail || !targetEmail}
                                className="btn btn-info text-dark fw-bold btn-sm w-100 py-2.5 rounded-3 shadow-lg d-flex align-items-center justify-content-center gap-2"
                            >
                                {sendingEmail ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm text-dark"></span>
                                        <span>Dispatching via SMTP...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>🚀</span>
                                        <span>Dispatch Email to {targetName || 'User'}</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
}