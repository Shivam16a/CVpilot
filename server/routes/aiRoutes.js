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
const { aiLimiter } = require('../middleware/rateLimiter');
const { protect } = require('../middleware/authMiddleware');
// 🚀 Strict Subscription & 1-Month Trial Guard Import
const { checkSubscription } = require('../middleware/subscriptionMiddleware');

// 🔒 AI Feature Routes (Blocked if trial/plan expired)
router.post('/summary', protect, aiLimiter, checkSubscription, generateSummary);
router.post('/project-desc', protect, aiLimiter, checkSubscription, generateProjectDesc);
router.post('/skills', protect, aiLimiter, checkSubscription, suggestSkills);
router.post('/analyze-ats', protect, aiLimiter, checkSubscription, analyzeAtsScore);
router.post('/match-jd', protect, aiLimiter, checkSubscription, matchJobDescription);
router.post('/cover-letter', protect, aiLimiter, checkSubscription, generateCoverLetter);

// Support Chat Assistant (Allow users to ask about features / subscription help)
router.post('/agent-chat', protect, handleChatAgent);

module.exports = router;