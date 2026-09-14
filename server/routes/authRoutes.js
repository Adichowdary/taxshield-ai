import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'taxshield-jwt-secret-key-2026';

const generateToken = (id, email, name) => {
  return jwt.sign({ id, email, name }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address',
      });
    }

    // Hash password
    const passwordHash = await User.hashPassword(password);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
    });

    const token = generateToken(user._id, user.email, user.name);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id, user.email, user.name);

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/auth/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id || req.user.id);
    if (user) {
      return res.json({
        success: true,
        data: user,
      });
    }
    // Return decoded info if user record was created via external auth
    res.json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/sync-firebase
 * @desc    Upsert Firebase user into MongoDB User collection
 * @access  Public
 */
router.post('/sync-firebase', async (req, res, next) => {
  try {
    const { firebaseUid, email, name } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    let user = await User.findOne({
      $or: [{ firebaseUid }, { email: email.toLowerCase() }],
    });

    if (!user) {
      user = await User.create({
        name: name || email.split('@')[0] || 'TaxShield User',
        email: email.toLowerCase(),
        firebaseUid,
      });
    } else if (!user.firebaseUid && firebaseUid) {
      user.firebaseUid = firebaseUid;
      await user.save();
    }

    const token = generateToken(user._id, user.email, user.name);

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        firebaseUid: user.firebaseUid,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
