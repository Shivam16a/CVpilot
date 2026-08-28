// server/controllers/adminController.js
const User = require('../models/users');
const Resume = require('../models/resume');

// 1. GET ALL USERS (Admin Dashboard Data)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({})
            .select('-password -otp -otpExpire') // Sensitive OTP & Password hide karein
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

        // Security Guard: Admin khud ko block nahi kar sakta
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "Security Error: You cannot block your own admin account."
            });
        }

        // Toggle Block Status
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

// 3. GET SYSTEM METRICS (Total Users, Resumes Count, Blocked Count)
const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const blockedUsers = await User.countDocuments({ isBlocked: true });
        const totalResumes = await Resume.countDocuments();

        // Template Popularity Analytics Data for Graph
        const templateAnalytics = await Resume.aggregate([
            { $group: { _id: "$template", count: { $sum: 1 } } }
        ]);

        return res.status(200).json({
            success: true,
            stats: { totalUsers, blockedUsers, totalResumes },
            templateAnalytics
        });
    } catch (error) {
        console.error("Admin Stats Error:", error);
        return res.status(500).json({ success: false, message: "Stats fetch failed" });
    }
};

// 5. Fetch all users ALONG WITH their created resumes list
const getAllUsersWithResumes = async (req, res) => {
    try {
        const users = await User.find().select('-password').lean();
        const resumes = await Resume.find().select('userId resumeTitle template updatedAt createdAt').lean();

        // Attach resumes array to each corresponding user object
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

// TOGGLE USER ADMIN ROLE (User -> Admin OR Admin -> User)
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

        // Security Guard: Admin khud ka role change nahi kar sakta
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "Security Error: You cannot modify your own admin role."
            });
        }

        // Toggle Admin Status
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


module.exports = {
    getAllUsers,
    toggleBlockUser,
    getAdminStats,
    toggleAdminRole,
    getAllUsersWithResumes
};