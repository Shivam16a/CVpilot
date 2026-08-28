// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    toggleBlockUser,
    getAdminStats,
    toggleAdminRole,
    getAllUsersWithResumes
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// 1. Fetch System Dashboard Stats
router.get('/stats', protect, adminOnly, getAdminStats);

// 2. Fetch All Registered Users List
router.get('/users', protect, adminOnly, getAllUsers);

// 3. Toggle Suspicious User Block Status (PATCH /api/admin/toggle-block/:userId)
router.patch('/toggle-block/:userId', protect, adminOnly, toggleBlockUser);

// 4. NEW ROUTE: Toggle Admin Role (PATCH /api/admin/toggle-role/:userId)
router.patch('/toggle-role/:userId', protect, adminOnly, toggleAdminRole);

router.get('/users-with-resumes', protect, adminOnly, getAllUsersWithResumes);

module.exports = router;