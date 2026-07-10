const express = require('express');
const router = express.Router();
const { savePersonalInfo, saveSummary, saveSkills, saveEducation, saveExperience, saveProjects, saveAdditional, getResumeData } = require('../controllers/resumeController');
const protect = require('../middleware/authMiddleware');

router.post('/personal-info', protect, savePersonalInfo);
router.post('/summary', protect, saveSummary);
router.post('/skills', protect, saveSkills);
router.post('/education', protect, saveEducation);
router.post('/experience', protect, saveExperience);
router.post('/projects', protect, saveProjects);
router.post('/additional', protect, saveAdditional);
router.get('/get-resume', protect, getResumeData);

module.exports = router;