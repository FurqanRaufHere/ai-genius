// controllers/authController.js
// Handles login and token refresh logic

const bcrypt = require('bcryptjs');
const { db } = require('../data/mockDB');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../config/jwt');

/**
 * POST /api/auth/login
 * Authenticates user credentials.
 * Returns: Access Token in JSON body + Refresh Token in httpOnly cookie
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide both email and password.',
      });
    }

    // 2. Find user in mock DB
    const user = db.users.find((u) => u.email === email);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.',
      });
    }

    // 3. Compare password with bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.',
      });
    }

    // 4. Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 5. Whitelist the refresh token in DB
    db.refreshTokens.push({ userId: user.id, token: refreshToken });

    // 6. Set Refresh Token as httpOnly secure cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,        // Not accessible via JavaScript
      secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
      sameSite: 'strict',    // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });

    // 7. Send Access Token in response body
    res.status(200).json({
      status: 'success',
      message: 'Login successful!',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Server error during login.' });
  }
};

/**
 * POST /api/auth/refresh
 * Reads Refresh Token from cookie, verifies it against whitelist,
 * and issues a new Access Token.
 */
const refresh = (req, res) => {
  try {
    // 1. Read refresh token from httpOnly cookie
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        status: 'error',
        message: 'No refresh token found. Please login again.',
      });
    }

    // 2. Check token is in whitelist (not revoked/logged out)
    const storedToken = db.refreshTokens.find((t) => t.token === refreshToken);
    if (!storedToken) {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token is invalid or has been revoked. Please login again.',
      });
    }

    // 3. Verify the refresh token signature and expiry
    const decoded = verifyToken(refreshToken);

    // 4. Find user
    const user = db.users.find((u) => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'User not found.' });
    }

    // 5. Issue a new Access Token
    const newAccessToken = generateAccessToken(user);

    res.status(200).json({
      status: 'success',
      message: 'Access token refreshed successfully.',
      accessToken: newAccessToken,
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      // Remove expired refresh token from whitelist
      db.refreshTokens = db.refreshTokens.filter((t) => t.token !== req.cookies.refreshToken);
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token has expired. Please login again.',
      });
    }
    res.status(401).json({ status: 'error', message: 'Invalid refresh token.' });
  }
};

/**
 * POST /api/auth/logout
 * Revokes the refresh token from whitelist and clears the cookie.
 */
const logout = (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  // Remove from whitelist
  db.refreshTokens = db.refreshTokens.filter((t) => t.token !== refreshToken);

  // Clear the cookie
  res.clearCookie('refreshToken');

  res.status(200).json({ status: 'success', message: 'Logged out successfully.' });
};

module.exports = { login, refresh, logout };
