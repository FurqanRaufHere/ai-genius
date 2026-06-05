// middleware/authMiddleware.js
// Authentication & Authorization middleware for AI-Genius

const { verifyToken } = require('../config/jwt');
const { db } = require('../data/mockDB');

/**
 * MIDDLEWARE: protect
 * Reads the Authorization: Bearer <token> header,
 * verifies the JWT signature, and attaches req.user
 */
const protect = (req, res, next) => {
  try {
    // 1. Check for Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided. Please login to access this resource.',
      });
    }

    // 2. Extract the token
    const token = authHeader.split(' ')[1];

    // 3. Verify the token (throws if expired or malformed)
    const decoded = verifyToken(token);

    // 4. Check the user still exists in DB
    const user = db.users.find((u) => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token no longer exists.',
      });
    }

    // 5. Attach user payload to request object
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Your access token has expired. Please refresh your token.',
        code: 'TOKEN_EXPIRED',
      });
    }
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token. Authentication failed.',
    });
  }
};

/**
 * MIDDLEWARE FACTORY: restrictTo
 * Returns a middleware that only allows specified roles.
 * Usage: restrictTo('Admin', 'Premium_User')
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Access denied. This route requires one of these roles: [${roles.join(', ')}]. Your role: ${req.user.role}`,
      });
    }
    next();
  };
};

module.exports = { protect, restrictTo };
