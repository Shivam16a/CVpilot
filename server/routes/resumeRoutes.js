// server/routes/resumeRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');

// Configure Multer Memory Storage for PDF file processing (5MB Limit)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
});

// Existing Resume Controllers
const {
    savePersonalInfo,
    saveSummary,
    saveSkills,
    saveEducation,
    saveExperience,
    saveProjects,
    saveAdditional,
    getResumeData,
    saveMasterResume,
    getUserDashboardData,
    deleteResume
} = require('../controllers/resumeController');

// 🚀 Naye Drag & Drop Upload & 1-Page Optimizer Controllers
const {
    parseUploadedResume,
    optimizeToOnePage
} = require('../controllers/resumeUploadController');

// Authentication & Subscription Guard Middleware
const { protect } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');
const { checkSubscription } = require('../middleware/subscriptionMiddleware');

// ==========================================
// 1. READ / DASHBOARD ROUTES (Read-Only)
// ==========================================
// Get saved resume for auto-filling inputs
router.get('/get-resume', protect, getResumeData);

// User Profile Dashboard Endpoint
router.get('/user-dashboard', protect, getUserDashboardData);

// ==========================================
// 2. 🚀 RESUME IMPORT & AI OPTIMIZATION (Subscription Guarded)
// ==========================================
// Drag & Drop PDF Resume Upload & Parse into JSON Store
router.post('/upload-parse', protect, checkSubscription, upload.single('resumePdf'), parseUploadedResume);

// AI 1-Page Tightening & Compression Engine
router.post('/optimize-one-page', protect, aiLimiter, checkSubscription, optimizeToOnePage);

// ==========================================
// 3. 🔒 SAVE & DELETE ACTIONS (Subscription Guarded)
// ==========================================
// Primary Master Overwrite Route (Save to Profile Action)
router.post('/save-master', protect, checkSubscription, saveMasterResume);

// Delete Resume Action
router.delete('/delete/:id', protect, checkSubscription, deleteResume);

// Section-wise Save Endpoints
router.post('/personal-info', protect, checkSubscription, savePersonalInfo);
router.post('/summary', protect, checkSubscription, saveSummary);
router.post('/skills', protect, checkSubscription, saveSkills);
router.post('/education', protect, checkSubscription, saveEducation);
router.post('/experience', protect, checkSubscription, saveExperience);
router.post('/projects', protect, checkSubscription, saveProjects);
router.post('/additional', protect, checkSubscription, saveAdditional);

module.exports = router;