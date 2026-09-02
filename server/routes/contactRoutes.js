// server/routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const {
    submitContactMessage,
    getAllContactMessages,
    sendAdminEmailToUser
} = require('../controllers/contactController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public User Endpoint
router.post('/send', submitContactMessage);

// Protected Admin Endpoints
router.get('/admin/all', protect, adminOnly, getAllContactMessages);
router.post('/admin/dispatch-mail', protect, adminOnly, sendAdminEmailToUser);

module.exports = router;