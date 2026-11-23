const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'cardiocare_ai_production_jwt_secret_academic_2026';

/**
 * Protect route with JWT authentication
 */
const protect = async (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: No authentication token provided.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User associated with token no longer exists.',
      });
    }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: Token is invalid or expired.',
    });
  }
};

/**
 * Optional authentication: loads user if token present, proceeds regardless
 */
const optionalAuth = async (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      // Ignored for optional
    }
  }

  next();
};

module.exports = {
  protect,
  optionalAuth,
  JWT_SECRET,
};
