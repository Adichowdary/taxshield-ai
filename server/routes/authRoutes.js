import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import memoryStore from '../services/memoryStore.js';

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
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    let userExists = false;
    if (mongoose.connection.readyState === 1) {
      try {
        const found = await User.findOne({ email: normalizedEmail });
        if (found) userExists = true;
      } catch {
        // Fallback to memory
      }
    }
    if (!userExists && memoryStore.findUserByEmail(normalizedEmail)) {
      userExists = true;
    }

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address',
      });
    }

    let user;
    if (mongoose.connection.readyState === 1) {
      try {
        const passwordHash = await User.hashPassword(password);
        user = await User.create({
          name,
          email: normalizedEmail,
          passwordHash,
          role: role || 'user',
        });
      } catch {
        user = await memoryStore.createUser({ name, email: normalizedEmail, password, role });
      }
    } else {
      user = await memoryStore.createUser({ name, email: normalizedEmail, password, role });
    }

    const userId = user._id || user.id;
    const token = generateToken(userId, user.email, user.name);

    const safeUser = {
      id: userId,
      _id: userId,
      name: user.name,
      email: user.email,
      role: user.role || 'user',
    };

    res.status(201).json({
      success: true,
      token,
      user: safeUser,
      data: {
        ...safeUser,
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

    const normalizedEmail = email.toLowerCase().trim();
    let user = null;
    let isMatch = false;

    if (mongoose.connection.readyState === 1) {
      try {
        const dbUser = await User.findOne({ email: normalizedEmail });
        if (dbUser) {
          user = dbUser;
          isMatch = await dbUser.matchPassword(password);
        }
      } catch {
        // Fallback to memory store
      }
    }

    if (!user) {
      const memUser = memoryStore.findUserByEmail(normalizedEmail);
      if (memUser) {
        user = memUser;
        isMatch = await memoryStore.verifyPassword(memUser, password);
      }
    }

    if (!user || !isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const userId = user._id || user.id;
    const token = generateToken(userId, user.email, user.name);

    const safeUser = {
      id: userId,
      _id: userId,
      name: user.name,
      email: user.email,
      role: user.role || 'user',
    };

    res.json({
      success: true,
      token,
      user: safeUser,
      data: {
        ...safeUser,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get currently authenticated user identity
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
  const safeUser = {
    id: req.user._id || req.user.id,
    _id: req.user._id || req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role || 'user',
  };

  res.json({
    success: true,
    user: safeUser,
    data: safeUser,
  });
});

/**
 * @route   GET /api/auth/profile
 * @desc    Get user profile (backward compatibility)
 * @access  Private
 */
router.get('/profile', protect, async (req, res, next) => {
  try {
    let user = null;
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(req.user._id || req.user.id)) {
      user = await User.findById(req.user._id || req.user.id);
    }
    if (!user) {
      user = memoryStore.findUserById(req.user._id || req.user.id);
    }

    if (user) {
      const { passwordHash, ...safe } = user.toObject ? user.toObject() : user;
      return res.json({
        success: true,
        data: safe,
      });
    }

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
 * @desc    Upsert Firebase user into User collection
 * @access  Public
 */
router.post('/sync-firebase', async (req, res, next) => {
  try {
    const { firebaseUid, email, name } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = null;

    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOne({
          $or: [{ firebaseUid }, { email: normalizedEmail }],
        });

        if (!user) {
          user = await User.create({
            name: name || email.split('@')[0] || 'TaxShield User',
            email: normalizedEmail,
            firebaseUid,
          });
        } else if (!user.firebaseUid && firebaseUid) {
          user.firebaseUid = firebaseUid;
          await user.save();
        }
      } catch {
        // Fallback to memory
      }
    }

    if (!user) {
      user = memoryStore.findUserByEmail(normalizedEmail);
      if (!user) {
        user = await memoryStore.createUser({
          name: name || email.split('@')[0] || 'TaxShield User',
          email: normalizedEmail,
          password: 'FirebaseGeneratedSecret_' + Date.now(),
        });
      }
    }

    const userId = user._id || user.id;
    const token = generateToken(userId, user.email, user.name);

    res.json({
      success: true,
      token,
      data: {
        _id: userId,
        name: user.name,
        email: user.email,
        firebaseUid,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
