// server/routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const {
    generateSummary,
    generateProjectDesc,
    suggestSkills,
    analyzeAtsScore,
    matchJobDescription,
    generateCoverLetter,
    handleChatAgent
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/summary', protect, generateSummary);
router.post('/project-desc', protect, generateProjectDesc);
router.post('/skills', protect, suggestSkills);
router.post('/analyze-ats', protect, analyzeAtsScore);
router.post('/match-jd', protect, matchJobDescription);
router.post('/cover-letter', protect, generateCoverLetter);
router.post('/agent-chat', protect, handleChatAgent);

module.exports = router;