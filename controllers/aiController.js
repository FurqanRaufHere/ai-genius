// controllers/aiController.js
// Mock AI endpoint handlers for AI-Genius platform

/**
 * GET /api/ai/free-model
 * Accessible by ALL logged-in users (Free_User, Premium_User, Admin)
 */
const freeModel = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '🤖 Free AI Model Response',
    model: 'ai-genius-free-v1',
    accessedBy: req.user.email,
    role: req.user.role,
    result: 'Hello! I am the free AI model. I can help with basic text summarization and simple Q&A.',
    usage: { tokens_used: 150, tokens_remaining: 850 },
  });
};

/**
 * POST /api/ai/premium-model
 * Accessible only by Premium_User and Admin
 */
const premiumModel = (req, res) => {
  const { prompt } = req.body;

  res.status(200).json({
    status: 'success',
    message: '🚀 Premium AI Model Response',
    model: 'ai-genius-premium-v3',
    accessedBy: req.user.email,
    role: req.user.role,
    prompt: prompt || '(no prompt provided)',
    result:
      'I am the premium AI model. I can generate high-quality text, perform complex reasoning, and assist with advanced creative tasks.',
    usage: { tokens_used: 420, tokens_remaining: 9580 },
  });
};

/**
 * DELETE /api/ai/purge-cache
 * Accessible ONLY by Admin
 */
const purgeCache = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '🗑️ AI Model Cache Purged Successfully',
    performedBy: req.user.email,
    role: req.user.role,
    details: {
      cache_entries_cleared: 1247,
      memory_freed_mb: 384,
      timestamp: new Date().toISOString(),
    },
  });
};

module.exports = { freeModel, premiumModel, purgeCache };
