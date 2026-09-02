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
// 🚀 Strict Subscription & 1-Month Trial Guard Import
const { checkSubscription } = require('../middleware/subscriptionMiddleware');

// 🔒 AI Feature Routes (Blocked if trial/plan expired)
router.post('/summary', protect, checkSubscription, generateSummary);
router.post('/project-desc', protect, checkSubscription, generateProjectDesc);
router.post('/skills', protect, checkSubscription, suggestSkills);
router.post('/analyze-ats', protect, checkSubscription, analyzeAtsScore);
router.post('/match-jd', protect, checkSubscription, matchJobDescription);
router.post('/cover-letter', protect, checkSubscription, generateCoverLetter);

// Support Chat Assistant (Allow users to ask about features / subscription help)
router.post('/agent-chat', protect, handleChatAgent);

module.exports = router;