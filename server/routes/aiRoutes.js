// server/routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { generateSummary, generateProjectDesc, suggestSkills } = require('../controllers/aiController');
const protect = require('../middleware/authMiddleware'); // Protected taaki koi misuse na kare

router.post('/summary', protect, generateSummary);
router.post('/project-desc', protect, generateProjectDesc);
router.post('/skills', protect, suggestSkills);

module.exports = router;