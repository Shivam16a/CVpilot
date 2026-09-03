// server/controllers/adminController.js
const User = require('../models/users');
const Resume = require('../models/resume');
const { Visitor, SuspiciousLog, BlockedIp } = require('../models/SecurityLog');
const { refreshBlockedIpsCache } = require('../middleware/firewallMiddleware');

// 🛡️ Microsecond-Level Memory Throttle Map (Prevents concurrent race-conditions)
const recentIntrusionsCache = new Map();

// Auto cleanup every 1 minute to prevent memory leak
setInterval(() => {
    const now = Date.now();
    for (const [key, timestamp] of recentIntrusionsCache.entries()) {
        if (now - timestamp > 20000) {
            recentIntrusionsCache.delete(key);
        }
    }
}, 60000);

// 1. GET ALL USERS (Admin Dashboard Data)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({})
            .select('-password -otp -otpExpire')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        console.error("Admin Fetch Users Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve user list: " + error.message
        });
    }
};

// 2. TOGGLE BLOCK / UNBLOCK USER STATUS
const toggleBlockUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Target user account not found."
            });
        }

        // Security Guard: Admin cannot block their own account
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "Security Error: You cannot block your own admin account."
            });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        return res.status(200).json({
            success: true,
            message: `User ${user.username} has been ${user.isBlocked ? 'BLOCKED 🚫' : 'UNBLOCKED ✅'} successfully.`,
            isBlocked: user.isBlocked,
            userId: user._id
        });
    } catch (error) {
        console.error("Block Toggle Error:", error);
        return res.status(500).json({
            success: false,
            message: "Operation failed: " + error.message
        });
    }
};

// 3. GET SYSTEM & SECURITY METRICS
const getAdminStats = async (req, res) => {
    try {
        const now = new Date();

        const totalUsers = await User.countDocuments();
        const blockedUsers = await User.countDocuments({ isBlocked: true });
        const totalResumes = await Resume.countDocuments();
        const uniqueVisitors = await Visitor.countDocuments();

        // 🚀 1. Subscription Status Counters
        const freeTrialUsers = await User.countDocuments({
            'subscription.plan': 'TRIAL',
            'subscription.trialEndsAt': { $gte: now }
        });

        const upgradedUsers = await User.countDocuments({
            'subscription.plan': { $in: ['PRO_MONTHLY', 'PRO_YEARLY'] },
            'subscription.currentPeriodEnd': { $gte: now }
        });

        const expiredUsers = await User.countDocuments({
            $or: [
                { 'subscription.plan': 'TRIAL', 'subscription.trialEndsAt': { $lt: now } },
                { 'subscription.plan': { $in: ['PRO_MONTHLY', 'PRO_YEARLY'] }, 'subscription.currentPeriodEnd': { $lt: now } },
                { 'subscription.status': 'EXPIRED' }
            ]
        });

        // 🚀 2. Revenue Aggregation
        const paidUsersList = await User.find({
            'subscription.razorpayPaymentId': { $ne: null }
        }).select('subscription createdAt updatedAt');

        let totalRevenue = 0;
        paidUsersList.forEach(u => {
            if (u.subscription?.plan === 'PRO_YEARLY') totalRevenue += 1499;
            else if (u.subscription?.plan === 'PRO_MONTHLY') totalRevenue += 199;
        });

        // 🚀 3. Monthly Revenue Growth Data
        const monthlyGrowth = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const nextD = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
            const mLabel = monthNames[d.getMonth()];

            const monthUsers = paidUsersList.filter(u => {
                const subDate = new Date(u.updatedAt || u.createdAt);
                return subDate >= d && subDate < nextD;
            });

            let mRev = 0;
            monthUsers.forEach(u => {
                if (u.subscription?.plan === 'PRO_YEARLY') mRev += 1499;
                else if (u.subscription?.plan === 'PRO_MONTHLY') mRev += 199;
            });

            monthlyGrowth.push({
                month: mLabel,
                revenue: mRev,
                conversions: monthUsers.length
            });
        }
        const blockedIpsList = await BlockedIp.find().select('ip reason createdAt').lean();

        const suspiciousLogs = await SuspiciousLog.find()
            .sort({ timestamp: -1 })
            .limit(50);

        const templateAnalytics = await Resume.aggregate([
            { $group: { _id: "$template", count: { $sum: 1 } } }
        ]);

        return res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                blockedUsers,
                totalResumes,
                uniqueVisitors,
                totalRevenue,
                freeTrialUsers,
                upgradedUsers,
                expiredUsers
            },
            monthlyGrowth,
            templateAnalytics,
            suspiciousLogs,
            blockedIps: blockedIpsList
        });
    } catch (error) {
        console.error("Admin Stats Error:", error);
        return res.status(500).json({ success: false, message: "Stats fetch failed" });
    }
};

// 4. FETCH ALL USERS ALONG WITH THEIR RESUMES
const getAllUsersWithResumes = async (req, res) => {
    try {
        const users = await User.find().select('-password').lean();
        const resumes = await Resume.find().select('userId resumeTitle template updatedAt createdAt').lean();

        const usersWithResumes = users.map(user => {
            const userResumes = resumes.filter(r => String(r.userId) === String(user._id));
            return {
                ...user,
                resumeCount: userResumes.length,
                resumesList: userResumes
            };
        });

        return res.status(200).json({ success: true, users: usersWithResumes });
    } catch (error) {
        console.error("Users Fetch Error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch users" });
    }
};

// 5. TOGGLE USER ADMIN ROLE
const toggleAdminRole = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User account not found."
            });
        }

        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "Security Error: You cannot modify your own admin role."
            });
        }

        user.isAdmin = !user.isAdmin;
        await user.save();

        return res.status(200).json({
            success: true,
            message: `User ${user.username} role updated to ${user.isAdmin ? 'ADMIN 🛡️' : 'USER 👤'}.`,
            isAdmin: user.isAdmin,
            userId: user._id
        });
    } catch (error) {
        console.error("Role Toggle Error:", error);
        return res.status(500).json({
            success: false,
            message: "Role update failed: " + error.message
        });
    }
};

// 🚀 6. LOG SUSPICIOUS ROUTE ATTEMPT (Bulletproof Atomic Lock & Memory Throttled)
const logSuspiciousActivity = async (req, res) => {
    try {
        if (req.method === 'OPTIONS') {
            return res.status(200).json({ success: true, ignored: true });
        }

        const { attemptedRoute, userId, username, email } = req.body;

        const rawIp = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
            req.socket?.remoteAddress ||
            req.ip ||
            '127.0.0.1';
        const cleanIp = rawIp.replace('::ffff:', '');
        const targetRoute = (attemptedRoute || 'Unknown Route').trim();

        // 🛡️ STEP 1: ZERO-MILLISECOND MEMORY LOCK (Stops concurrent burst requests)
        const cacheSignature = `${cleanIp}_${targetRoute}`;
        const now = Date.now();
        const lastExecuted = recentIntrusionsCache.get(cacheSignature);

        if (lastExecuted && (now - lastExecuted) < 15000) {
            // 15 seconds ke andar same IP & route dubara aayi toh turant drop karo
            return res.status(200).json({
                success: true,
                deduplicated: true,
                message: "Duplicate burst request suppressed by memory guard."
            });
        }

        // Lock register karein
        recentIntrusionsCache.set(cacheSignature, now);

        const userAgent = req.headers['user-agent'] || 'Unknown Device';

        let severity = 'MEDIUM';
        const dangerousPatterns = ['admin', 'config', '.env', 'eval', 'wp-', 'backup', 'root', 'api/v'];
        if (dangerousPatterns.some(term => targetRoute.toLowerCase().includes(term))) {
            severity = 'HIGH';
        }

        // 🛡️ STEP 2: ATOMIC UPSERT (Database Engine Level Concurrency Protection)
        const fifteenSecAgo = new Date(Date.now() - 15 * 1000);

        const logEntry = await SuspiciousLog.findOneAndUpdate(
            {
                ip: cleanIp,
                attemptedRoute: targetRoute,
                timestamp: { $gte: fifteenSecAgo }
            },
            {
                $set: {
                    ip: cleanIp,
                    attemptedRoute: targetRoute,
                    userId: userId || null,
                    username: username || 'Anonymous Guest',
                    email: email || 'Unauthenticated',
                    userAgent,
                    severity,
                    timestamp: new Date()
                }
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }
        );

        return res.status(201).json({ success: true, log: logEntry });
    } catch (error) {
        console.error("Suspicious Logging Error:", error);
        return res.status(500).json({ success: false, message: "Logging failed: " + error.message });
    }
};


// 🚀 7. TOGGLE FIREWALL IP BLOCK / UNBLOCK
const toggleIpBlock = async (req, res) => {
    try {
        const { ip, reason } = req.body;
        if (!ip) {
            return res.status(400).json({ success: false, message: "Valid IP address required." });
        }

        const existing = await BlockedIp.findOne({ ip });

        if (existing) {
            await BlockedIp.deleteOne({ ip });
            await refreshBlockedIpsCache();
            return res.status(200).json({
                success: true,
                isBlocked: false,
                message: `IP ${ip} has been removed from the Firewall Blacklist. ✅`
            });
        }

        await BlockedIp.create({
            ip,
            reason: reason || 'Manual Admin Quarantine',
            blockedBy: req.user?.username || 'Admin'
        });
        await refreshBlockedIpsCache();

        return res.status(200).json({
            success: true,
            isBlocked: true,
            message: `IP ${ip} is now PERMANENTLY BLOCKED by Firewall! 🚫`
        });
    } catch (error) {
        console.error("IP Block Toggle Error:", error);
        return res.status(500).json({ success: false, message: "Operation failed: " + error.message });
    }
};

// getAdminStats ke andar blockedIPs array bhi bhej dein:
// getAdminStats me:

// res.json me pass karein: blockedIps: blockedIpsList

module.exports = {
    getAllUsers,
    toggleBlockUser,
    getAdminStats,
    toggleAdminRole,
    getAllUsersWithResumes,
    logSuspiciousActivity,
    toggleIpBlock
};