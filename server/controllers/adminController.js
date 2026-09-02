// server/controllers/adminController.js
const User = require('../models/users');
const Resume = require('../models/resume');
const { Visitor, SuspiciousLog } = require('../models/SecurityLog');

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

// 3. GET SYSTEM & SECURITY METRICS (Total Users, Resumes, Unique Devices & Suspicious Logs)
const getAdminStats = async (req, res) => {
    try {
        const now = new Date();

        const totalUsers = await User.countDocuments();
        const blockedUsers = await User.countDocuments({ isBlocked: true });
        const totalResumes = await Resume.countDocuments();
        const uniqueVisitors = await Visitor.countDocuments();

        // 🚀 1. Subscription Status Counters
        // a) Free Trial Users (Trial plan & trial date in future)
        const freeTrialUsers = await User.countDocuments({
            'subscription.plan': 'TRIAL',
            'subscription.trialEndsAt': { $gte: now }
        });

        // b) Upgraded Active Paid Users (Monthly or Yearly & date in future)
        const upgradedUsers = await User.countDocuments({
            'subscription.plan': { $in: ['PRO_MONTHLY', 'PRO_YEARLY'] },
            'subscription.currentPeriodEnd': { $gte: now }
        });

        // c) Expired Users (Either trial ended or paid period ended)
        const expiredUsers = await User.countDocuments({
            $or: [
                { 'subscription.plan': 'TRIAL', 'subscription.trialEndsAt': { $lt: now } },
                { 'subscription.plan': { $in: ['PRO_MONTHLY', 'PRO_YEARLY'] }, 'subscription.currentPeriodEnd': { $lt: now } },
                { 'subscription.status': 'EXPIRED' }
            ]
        });

        // 🚀 2. Revenue Aggregation (Monthly Pro = ₹199, Yearly Pro = ₹1499)
        const paidUsersList = await User.find({
            'subscription.razorpayPaymentId': { $ne: null }
        }).select('subscription createdAt updatedAt');

        let totalRevenue = 0;
        paidUsersList.forEach(u => {
            if (u.subscription?.plan === 'PRO_YEARLY') totalRevenue += 1499;
            else if (u.subscription?.plan === 'PRO_MONTHLY') totalRevenue += 199;
        });

        // 🚀 3. Monthly Revenue Growth Data (Last 6 Months)
        const monthlyGrowth = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const nextD = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
            const mLabel = monthNames[d.getMonth()];

            // Count users who upgraded in this calendar month
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

        const suspiciousLogs = await SuspiciousLog.find()
            .sort({ timestamp: -1 })
            .limit(35);

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
                // 🚀 Subscription & Revenue Metrics
                totalRevenue,
                freeTrialUsers,
                upgradedUsers,
                expiredUsers
            },
            monthlyGrowth,
            templateAnalytics,
            suspiciousLogs
        });
    } catch (error) {
        console.error("Admin Stats Error:", error);
        return res.status(500).json({ success: false, message: "Stats fetch failed" });
    }
};

// 4. FETCH ALL USERS ALONG WITH THEIR CREATED RESUMES LIST
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

// 5. TOGGLE USER ADMIN ROLE (User -> Admin OR Admin -> User)
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

// 🚀 6. LOG SUSPICIOUS ROUTE ATTEMPT (Reported by Frontend 404 / Invalid URL Visit)
const logSuspiciousActivity = async (req, res) => {
    try {
        const { attemptedRoute, userId, username, email } = req.body;

        const rawIp = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
            req.socket?.remoteAddress ||
            req.ip ||
            '127.0.0.1';
        const cleanIp = rawIp.replace('::ffff:', '');
        const userAgent = req.headers['user-agent'] || 'Unknown Device';

        // Severity evaluation
        let severity = 'MEDIUM';
        const dangerousPatterns = ['admin', 'config', '.env', 'eval', 'wp-', 'backup', 'root', 'api/v'];
        if (dangerousPatterns.some(term => attemptedRoute?.toLowerCase().includes(term))) {
            severity = 'HIGH';
        }

        const logEntry = await SuspiciousLog.create({
            ip: cleanIp,
            attemptedRoute: attemptedRoute || 'Unknown Route',
            userId: userId || null,
            username: username || 'Guest Visitor',
            email: email || 'Unauthenticated',
            userAgent,
            severity
        });

        return res.status(201).json({ success: true, log: logEntry });
    } catch (error) {
        console.error("Suspicious Logging Error:", error);
        return res.status(500).json({ success: false, message: "Logging failed: " + error.message });
    }
};

module.exports = {
    getAllUsers,
    toggleBlockUser,
    getAdminStats,
    toggleAdminRole,
    getAllUsersWithResumes,
    logSuspiciousActivity // 🚀 Exported
};