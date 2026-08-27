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
    getUserDashboardData
} = require('../controllers/resumeController');
const protect = require('../middleware/authMiddleware');

// Get saved resume for auto-filling inputs
router.get('/get-resume', protect, getResumeData);

// Primary Master Overwrite Route (Save to Profile Action)
router.post('/save-master', protect, saveMasterResume);

// User Profile Dashboard Endpoint
router.get('/user-dashboard', protect, getUserDashboardData);

// Section-wise Endpoints (Safely Preserved)
router.post('/personal-info', protect, savePersonalInfo);
router.post('/summary', protect, saveSummary);
router.post('/skills', protect, saveSkills);
router.post('/education', protect, saveEducation);
router.post('/experience', protect, saveExperience);
router.post('/projects', protect, saveProjects);
router.post('/additional', protect, saveAdditional);

module.exports = router;