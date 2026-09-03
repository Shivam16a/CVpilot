// server/middleware/firewallMiddleware.js
const { BlockedIp } = require('../models/SecurityLog');

// In-memory cache taaki har request par MongoDB lookup na karna pade
let blockedIpsCache = new Set();

const refreshBlockedIpsCache = async () => {
    try {
        const list = await BlockedIp.find().select('ip').lean();
        blockedIpsCache = new Set(list.map(item => item.ip));
    } catch (err) {
        console.error("Firewall cache refresh failed:", err.message);
    }
};

// Server boot hone par initialize karein
// refreshBlockedIpsCache();

const firewallShield = async (req, res, next) => {
    const rawIp = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
        req.socket?.remoteAddress ||
        req.ip ||
        '127.0.0.1';
    const cleanIp = rawIp.replace('::ffff:', '');

    if (blockedIpsCache.has(cleanIp)) {
        return res.status(403).json({
            success: false,
            isFirewallBlocked: true,
            message: "ACCESS TERMINATED: Your IP has been permanently blacklisted by CVPilot Security Firewall."
        });
    }

    next();
};

module.exports = { firewallShield, refreshBlockedIpsCache };