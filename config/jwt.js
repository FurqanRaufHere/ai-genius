// config/jwt.js
// JWT token generation and verification helpers

const jwt = require('jsonwebtoken');

/**
 * Generate an Access Token (short-lived)
 * Payload: id, email, role
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES }
  );
};

/**
 * Generate a Refresh Token (long-lived)
 * Only stores minimal info - just the user id
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES }
  );
};

/**
 * Verify a JWT token
 * Returns the decoded payload or throws an error
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateAccessToken, generateRefreshToken, verifyToken };
