import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'taxshield-jwt-secret-key-2026';

/**
 * Protect routes: requires valid JWT or recognized user identity
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers['x-user-id']) {
    // Fallback for Firebase client session passing UID
    req.user = {
      id: req.headers['x-user-id'],
      _id: req.headers['x-user-id'],
      email: req.headers['x-user-email'] || '',
      name: req.headers['x-user-name'] || 'TaxShield User',
    };
    return next();
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }

  try {
    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (user) {
      req.user = user;
    } else {
      req.user = { id: decoded.id, email: decoded.email, name: decoded.name };
    }
    next();
  } catch (err) {
    // If it's a raw Firebase UID passed as bearer token
    if (token && token.length > 5 && !token.includes('.')) {
      req.user = { id: token, uid: token };
      return next();
    }
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token validation failed',
      error: err.message,
    });
  }
};

/**
 * Optional authentication: extracts user if provided, otherwise sets req.user to guest
 */
export const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers['x-user-id']) {
    req.user = {
      id: req.headers['x-user-id'],
      _id: req.headers['x-user-id'],
      email: req.headers['x-user-email'] || '',
      name: req.headers['x-user-name'] || 'Guest User',
    };
    return next();
  }

  if (!token) {
    req.user = { id: 'guest', name: 'Guest' };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');
    req.user = user || { id: decoded.id, email: decoded.email, name: decoded.name };
  } catch {
    req.user = { id: token, uid: token, name: 'Guest' };
  }
  next();
};
