// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    toggleBlockUser,
    getAdminStats,
    toggleAdminRole,
    getAllUsersWithResumes,
    logSuspiciousActivity,
    toggleIpBlock
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// 🚀 Public Honey-Pot Endpoint: Frontend 404 can report without authentication
router.post('/report-suspicious-route', logSuspiciousActivity);
router.post('/toggle-ip-block', protect, toggleIpBlock);

// Protected Admin Routes
router.get('/stats', protect, adminOnly, getAdminStats);
router.get('/users', protect, adminOnly, getAllUsers);
router.patch('/toggle-block/:userId', protect, adminOnly, toggleBlockUser);
router.patch('/toggle-role/:userId', protect, adminOnly, toggleAdminRole);
router.get('/users-with-resumes', protect, adminOnly, getAllUsersWithResumes);

module.exports = router;