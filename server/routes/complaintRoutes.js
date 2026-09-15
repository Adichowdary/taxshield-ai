import express from 'express';
import mongoose from 'mongoose';
import Complaint from '../models/Complaint.js';
import { optionalAuth } from '../middleware/auth.js';
import memoryStore from '../services/memoryStore.js';

const router = express.Router();

const VALID_STATUSES = ['Draft', 'Generated', 'Submitted', 'Resolved', 'Dismissed'];

/**
 * Helper to combine complaints from MongoDB and memoryStore
 */
async function getAllComplaintsCombined(userId = null) {
  let list = [];

  if (mongoose.connection.readyState === 1) {
    try {
      const filter = {};
      if (userId && userId !== 'guest') filter.userId = userId;
      list = await Complaint.find(filter).lean();
    } catch {
      // Fallback
    }
  }

  const memList = memoryStore.findComplaints({ userId });
  const existingIds = new Set(list.map((c) => (c._id || c.id).toString()));

  for (const mc of memList) {
    const mcId = (mc._id || mc.id).toString();
    if (!existingIds.has(mcId)) {
      list.push(mc);
    }
  }

  return list;
}

/**
 * @route   POST /api/complaints
 * @desc    Create a new CCPA grievance complaint
 * @access  Optional / Private
 */
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.body.userId || req.user?.id || req.user?._id || req.user?.uid || 'guest';
    const {
      billId,
      billNumber,
      restaurantName,
      complaintReason,
      complaintDetails,
      overchargeAmount,
      totalBillAmount,
      evidence,
      status,
    } = req.body;

    if (!restaurantName || !complaintReason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide restaurantName and complaintReason',
      });
    }

    const complaintData = {
      userId,
      billId,
      billNumber: billNumber || 'INV-CCPA-NOTICE',
      restaurantName,
      complaintReason,
      complaintDetails: complaintDetails || 'Grievance registered under CCPA 2022 Guidelines.',
      overchargeAmount: Number(overchargeAmount || 0),
      totalBillAmount: Number(totalBillAmount || 0),
      evidence: evidence || {},
      status: status || 'Generated',
    };

    let createdComplaint = null;
    if (mongoose.connection.readyState === 1) {
      try {
        createdComplaint = await Complaint.create(complaintData);
      } catch {
        // Fallback
      }
    }

    if (!createdComplaint) {
      createdComplaint = memoryStore.createComplaint(complaintData);
    } else {
      memoryStore.createComplaint({
        ...createdComplaint.toObject ? createdComplaint.toObject() : createdComplaint,
        _id: (createdComplaint._id || createdComplaint.id).toString(),
      });
    }

    res.status(201).json({
      success: true,
      data: createdComplaint,
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
    const userId = req.query.userId || req.user?.id || req.user?._id || req.user?.uid;
    const complaints = await getAllComplaintsCombined(userId);

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
    let complaint = null;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(req.params.id)) {
      try {
        complaint = await Complaint.findById(req.params.id);
      } catch {
        // Fallback
      }
    }

    if (!complaint) {
      complaint = memoryStore.findComplaintById(req.params.id);
    }

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
 * @route   PATCH /api/complaints/:id/status
 * @desc    Update complaint dispute status
 * @access  Optional / Private
 */
router.patch('/:id/status', optionalAuth, async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${VALID_STATUSES.join(', ')}`,
      });
    }

    let complaint = null;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(req.params.id)) {
      try {
        complaint = await Complaint.findByIdAndUpdate(
          req.params.id,
          { status },
          { new: true, runValidators: true }
        );
      } catch {
        // Fallback
      }
    }

    if (!complaint) {
      complaint = memoryStore.updateComplaint(req.params.id, { status });
    }

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
 * @desc    Update full complaint details or status
 * @access  Optional / Private
 */
router.put('/:id', optionalAuth, async (req, res, next) => {
  try {
    let complaint = null;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(req.params.id)) {
      try {
        complaint = await Complaint.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true,
        });
      } catch {
        // Fallback
      }
    }

    if (!complaint) {
      complaint = memoryStore.updateComplaint(req.params.id, req.body);
    }

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
    let deleted = false;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(req.params.id)) {
      try {
        const doc = await Complaint.findByIdAndDelete(req.params.id);
        if (doc) deleted = true;
      } catch {
        // Fallback
      }
    }

    if (memoryStore.deleteComplaint(req.params.id)) {
      deleted = true;
    }

    if (!deleted) {
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
