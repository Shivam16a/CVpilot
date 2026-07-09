const express = require('express');
const router = express.Router();
const { savePersonalInfo, saveSummary, saveSkills, saveEducation, saveExperience} = require('../controllers/resumeController');
const protect = require('../middleware/authMiddleware');

router.post('/personal-info', protect, savePersonalInfo);
router.post('/summary', protect, saveSummary);
router.post('/skills', protect, saveSkills);
router.post('/education', protect, saveEducation);
router.post('/experience', protect, saveExperience);

module.exports = router;