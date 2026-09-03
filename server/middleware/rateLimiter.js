// server/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');
const { SuspiciousLog } = require('../models/SecurityLog');

// 🔒 Login & OTP Brute-Force Shield
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 Minutes window
    max: 5, // Ek IP se max 5 attempts allowed
    standardHeaders: true,
    legacyHeaders: false,
    handler: async (req, res) => {
        const rawIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket?.remoteAddress || req.ip || '127.0.0.1';
        const cleanIp = rawIp.replace('::ffff:', '');
        const attemptedTarget = req.originalUrl || req.url;
        const targetedEmail = req.body?.email || req.body?.username || 'Unknown Target';

        // 🚨 Trap into Suspicious Logs with CRITICAL tag
        try {
            await SuspiciousLog.create({
                ip: cleanIp,
                attemptedRoute: `${attemptedTarget} [BRUTE-FORCE LOCKED]`,
                username: 'Attacker / Botnet',
                email: targetedEmail,
                userAgent: req.headers['user-agent'] || 'Automated Script',
                severity: 'HIGH',
                timestamp: new Date()
            });
        } catch (err) {
            console.error("Failed to trap brute force log:", err.message);
        }

        return res.status(429).json({
            success: false,
            isRateLimited: true,
            message: "Too many failed login attempts from this IP. Your network is temporarily quarantined for 15 minutes."
        });
    }
});

// 🤖 AI API Route Cost Protection (Gemini Abuse Shield)
const aiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 Minute
    max: 8, // Max 8 AI optimizations per minute per user/IP
    message: {
        success: false,
        message: "AI Generation rate limit exceeded. Please wait a minute before requesting another optimization."
    }
});

module.exports = { authLimiter, aiLimiter };