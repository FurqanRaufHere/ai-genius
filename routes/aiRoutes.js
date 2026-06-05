// routes/aiRoutes.js
const express = require('express');
const { freeModel, premiumModel, purgeCache } = require('../controllers/aiController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes below require authentication first
router.use(protect);

// GET /api/ai/free-model — All logged-in users
router.get('/free-model', freeModel);

// POST /api/ai/premium-model — Premium_User and Admin only
router.post('/premium-model', restrictTo('Premium_User', 'Admin'), premiumModel);

// DELETE /api/ai/purge-cache — Admin only
router.delete('/purge-cache', restrictTo('Admin'), purgeCache);

module.exports = router;
