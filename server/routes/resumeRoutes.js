// server/routes/resumeRoutes.js
const express = require('express');
const router = express.Router();
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

const { protect } = require('../middleware/authMiddleware');
// 🚀 Strict Subscription & 1-Month Trial Guard Import
const { checkSubscription } = require('../middleware/subscriptionMiddleware');

// Get saved resume for auto-filling inputs (Allowed for read)
router.get('/get-resume', protect, getResumeData);

// User Profile Dashboard Endpoint (Allowed to view saved items)
router.get('/user-dashboard', protect, getUserDashboardData);

// 🔒 Primary Master Overwrite Route (Blocked if trial/plan expired)
router.post('/save-master', protect, checkSubscription, saveMasterResume);

// 🔒 Delete Resume Action (Blocked if trial/plan expired)
router.delete('/delete/:id', protect, checkSubscription, deleteResume);

// 🔒 Section-wise Save Endpoints (Blocked if trial/plan expired)
router.post('/personal-info', protect, checkSubscription, savePersonalInfo);
router.post('/summary', protect, checkSubscription, saveSummary);
router.post('/skills', protect, checkSubscription, saveSkills);
router.post('/education', protect, checkSubscription, saveEducation);
router.post('/experience', protect, checkSubscription, saveExperience);
router.post('/projects', protect, checkSubscription, saveProjects);
router.post('/additional', protect, checkSubscription, saveAdditional);

module.exports = router;