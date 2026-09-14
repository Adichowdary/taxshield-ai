import express from 'express';
import mongoose from 'mongoose';
import Complaint from '../models/Complaint.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/complaints
 * @desc    Create a new complaint
 * @access  Optional / Private
 */
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.body.userId || req.user?.id || req.user?._id || req.user?.uid || 'guest';
    const {
      billId,
      restaurantName,
      complaintReason,
      complaintDetails,
      evidence,
      status,
    } = req.body;

    if (!restaurantName || !complaintReason || !complaintDetails) {
      return res.status(400).json({
        success: false,
        message: 'Please provide restaurantName, complaintReason, and complaintDetails',
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(201).json({
        success: true,
        offline: true,
        data: {
          _id: 'local_' + Date.now(),
          userId,
          billId,
          restaurantName,
          complaintReason,
          complaintDetails,
          evidence: evidence || {},
          status: status || 'Generated',
        },
        message: 'Complaint drafted in offline session mode',
      });
    }

    const complaint = await Complaint.create({
      userId,
      billId,
      restaurantName,
      complaintReason,
      complaintDetails,
      evidence: evidence || {},
      status: status || 'Generated',
    });

    res.status(201).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/complaints
 * @desc    Get all complaints for user
 * @access  Optional / Private
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        offline: true,
        count: 0,
        data: [],
      });
    }

    const userId = req.query.userId || req.user?.id || req.user?._id || req.user?.uid;
    const filter = {};
    if (userId && userId !== 'guest') {
      filter.userId = userId;
    }

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/complaints/:id
 * @desc    Get single complaint by ID
 * @access  Optional / Private
 */
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    res.json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/complaints/:id
 * @desc    Update complaint details or status
 * @access  Optional / Private
 */
router.put('/:id', optionalAuth, async (req, res, next) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    res.json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/complaints/:id
 * @desc    Delete complaint by ID
 * @access  Optional / Private
 */
router.delete('/:id', optionalAuth, async (req, res, next) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    res.json({
      success: true,
      message: 'Complaint deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
