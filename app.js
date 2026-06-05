// app.js — AI-Genius Backend Entry Point
require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const { initDB } = require('./data/mockDB');

// Route imports
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// ─── Middleware ───────────────────────────────────────────────
app.use(express.json());         // Parse JSON request bodies
app.use(cookieParser());          // Parse cookies (needed for refresh token)

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

// ─── Root health check ────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: '🤖 AI-Genius API is running!',
    endpoints: {
      auth: {
        login:   'POST /api/auth/login',
        refresh: 'POST /api/auth/refresh',
        logout:  'POST /api/auth/logout',
      },
      ai: {
        freeModel:    'GET    /api/ai/free-model       (All users)',
        premiumModel: 'POST   /api/ai/premium-model    (Premium_User, Admin)',
        purgeCache:   'DELETE /api/ai/purge-cache      (Admin only)',
      },
    },
    testUsers: {
      admin:        { email: 'admin@aigenius.com',   password: 'Admin@1234'   },
      premium_user: { email: 'premium@aigenius.com', password: 'Premium@1234' },
      free_user:    { email: 'free@aigenius.com',    password: 'Free@1234'    },
    },
  });
});

// ─── Centralized Error Handler ────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'An unexpected server error occurred.',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: `Route ${req.originalUrl} not found.` });
});

// ─── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 AI-Genius server running on http://localhost:${PORT}`);
    console.log(`📋 Visit http://localhost:${PORT} to see all available routes`);
  });
});
