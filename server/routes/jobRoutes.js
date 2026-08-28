// server/routes/jobRoutes.js
const express = require('express');
const router = express.Router();
const { getLiveJobs, autoInsertKeywords } = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

router.get('/live-jobs', protect, getLiveJobs);
router.post('/auto-insert-keywords', protect, autoInsertKeywords);

module.exports = router;