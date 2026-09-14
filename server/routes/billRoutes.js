import express from 'express';
import multer from 'multer';
import Bill from '../models/Bill.js';
import mongoose from 'mongoose';
import cloudinary from '../config/cloudinary.js';
import { optionalAuth } from '../middleware/auth.js';
import { checkOllamaStatus, analyzeBillWithOllama } from '../services/ollamaService.js';

const router = express.Router();

// Memory storage for multer to stream directly to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

/**
 * @route   GET /api/bills/llm-health
 * @desc    Check status and models of local Ollama / TaxShield AI engine
 * @access  Public
 */
router.get('/llm-health', async (req, res) => {
  const status = await checkOllamaStatus();
  res.json(status);
});

/**
 * @route   POST /api/bills/analyze
 * @desc    Analyze receipt text using local Ollama model (taxshield-ai) and compute statutory audit
 * @access  Public
 */
router.post('/analyze', async (req, res, next) => {
  try {
    const { billText, options, imageUrl } = req.body;
    if (!billText || typeof billText !== 'string' || billText.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Valid billText string is required',
      });
    }

    const auditResult = await analyzeBillWithOllama(billText, {
      ...options,
      billImageUrl: imageUrl || options?.billImageUrl,
    });

    res.json(auditResult);
  } catch (error) {
    console.error('[POST /api/bills/analyze Error]', error);
    next(error);
  }
});

/**
 * @route   POST /api/bills/upload
 * @desc    Upload bill receipt image to Cloudinary via backend
 * @access  Public / Optional Auth
 */
router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    let fileBuffer = req.file?.buffer;
    let base64Data = req.body?.imageBase64;

    if (!fileBuffer && !base64Data) {
      return res.status(400).json({
        success: false,
        message: 'No image file or base64 data provided',
      });
    }

    // Upload buffer or base64 stream to Cloudinary
    const uploadStream = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'taxshield_bills',
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        if (fileBuffer) {
          stream.end(fileBuffer);
        } else {
          // If base64 data string
          const buffer = Buffer.from(
            base64Data.replace(/^data:image\/\w+;base64,/, ''),
            'base64'
          );
          stream.end(buffer);
        }
      });

    const uploadResult = await uploadStream();

    res.json({
      success: true,
      data: {
        secure_url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
      },
    });
  } catch (error) {
    console.error('Cloudinary upload error in backend:', error);
    next(error);
  }
});

/**
 * @route   GET /api/bills/analytics/overview
 * @desc    Aggregated analytics (spending, tax, fees, order count)
 * @access  Optional / Private
 */
router.get('/analytics/overview', optionalAuth, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        offline: true,
        data: {
          totalSpending: 0,
          totalTax: 0,
          totalFees: 0,
          orderCount: 0,
          totalSavings: 0,
        },
      });
    }

    const userId = req.user?.id || req.user?._id || req.user?.uid || 'guest';
    const query = userId !== 'guest' ? { userId } : {};

    const bills = await Bill.find(query);

    if (!bills || bills.length === 0) {
      return res.json({
        success: true,
        data: {
          totalSpending: 0,
          totalTax: 0,
          totalFees: 0,
          orderCount: 0,
          totalSavings: 0,
        },
      });
    }

    let totalSpending = 0;
    let totalTax = 0;
    let totalFees = 0;
    let totalSavings = 0;

    bills.forEach((b) => {
      const billTotal = Number(b.totalAmount || b.total || 0);
      const billTax = Number(b.gstAmount || b.taxes || b.gst || (Number(b.cgst || 0) + Number(b.sgst || 0)) || 0);
      const billFee = Number(b.serviceCharge || 0);
      const billDiscount = Number(b.discount || 0);

      totalSpending += billTotal;
      totalTax += billTax;
      totalFees += billFee;
      totalSavings += billFee + billDiscount;
    });

    res.json({
      success: true,
      data: {
        totalSpending: Number(totalSpending.toFixed(2)),
        totalTax: Number(totalTax.toFixed(2)),
        totalFees: Number(totalFees.toFixed(2)),
        totalSavings: Number(totalSavings.toFixed(2)),
        orderCount: bills.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/bills
 * @desc    Create a new bill record in MongoDB
 * @access  Optional / Private
 */
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.body.userId || req.user?.id || req.user?._id || req.user?.uid || 'guest';

    // Normalize image URL
    const billImageUrl = req.body.billImageUrl || req.body.imageUrl || req.body.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop';
    
    // Extract public_id if available
    let cloudinaryPublicId = req.body.cloudinaryPublicId;
    if (!cloudinaryPublicId && billImageUrl.includes('cloudinary.com')) {
      const segments = billImageUrl.split('/');
      const lastSegment = segments[segments.length - 1];
      cloudinaryPublicId = lastSegment.split('.')[0];
    }

    const billData = {
      ...req.body,
      userId,
      billImageUrl,
      image: billImageUrl,
      cloudinaryPublicId,
      billType: req.body.billType || 'RESTAURANT',
      retailer: req.body.retailer || req.body.restaurantName || req.body.merchant || 'Store',
      restaurantName: req.body.restaurantName || req.body.retailer || req.body.merchant || 'Establishment',
      taxVerdict: req.body.taxVerdict || null,
      hsnCodes: req.body.hsnCodes || [],
      totalAmount: Number(req.body.totalAmount || req.body.total || req.body.statedTotal || 0),
      total: Number(req.body.totalAmount || req.body.total || req.body.statedTotal || 0),
      gstAmount: Number(req.body.gstAmount || req.body.taxes || req.body.gst || 0),
      taxes: Number(req.body.gstAmount || req.body.taxes || req.body.gst || 0),
      serviceCharge: Number(req.body.serviceCharge || 0),
      items: req.body.items || req.body.lineItems || [],
      lineItems: req.body.items || req.body.lineItems || [],
      verificationStatus: req.body.verificationStatus || req.body.status || 'Uploaded',
    };

    if (mongoose.connection.readyState !== 1) {
      return res.status(201).json({
        success: true,
        offline: true,
        data: { ...billData, _id: 'local_' + Date.now(), id: 'local_' + Date.now() },
        message: 'Saved in offline session mode (MongoDB offline)',
      });
    }

    const newBill = await Bill.create(billData);

    res.status(201).json({
      success: true,
      data: newBill,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/bills/analytics/by-category
 * @desc    Get aggregated spending broken down by billType / shopping category
 * @access  Optional / Private
 */
router.get('/analytics/by-category', optionalAuth, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, offline: true, data: {} });
    }

    const userId = req.query.userId || req.user?.id || req.user?._id || req.user?.uid;
    const query = userId && userId !== 'guest' ? { userId } : {};

    const bills = await Bill.find(query);
    const breakdown = {
      RESTAURANT: { label: 'Dining & Food', total: 0, tax: 0, count: 0 },
      GROCERY: { label: 'Supermarkets', total: 0, tax: 0, count: 0 },
      FASHION: { label: 'Fashion & Apparel', total: 0, tax: 0, count: 0 },
      ELECTRONICS: { label: 'Electronics', total: 0, tax: 0, count: 0 },
      PHARMACY: { label: 'Pharmacy', total: 0, tax: 0, count: 0 },
      FUEL: { label: 'Fuel', total: 0, tax: 0, count: 0 },
      OTHER: { label: 'Other Retail', total: 0, tax: 0, count: 0 },
    };

    bills.forEach((b) => {
      const type = (b.billType || 'RESTAURANT').toUpperCase();
      const target = breakdown[type] || breakdown.OTHER;
      const amount = Number(b.totalAmount || b.total || 0);
      const tax = Number(b.gstAmount || b.taxes || b.gst || (Number(b.cgst || 0) + Number(b.sgst || 0)) || 0);
      target.total += amount;
      target.tax += tax;
      target.count += 1;
    });

    res.json({ success: true, data: breakdown });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/bills
 * @desc    Get all bills for current user
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
    const search = req.query.search || '';
    const status = req.query.status || '';
    const billType = req.query.billType || '';

    const filter = {};
    if (userId && userId !== 'guest') {
      filter.userId = userId;
    }

    if (status && status !== 'ALL') {
      filter.verificationStatus = status;
    }

    if (billType && billType !== 'ALL') {
      filter.billType = billType;
    }

    if (search) {
      filter.$or = [
        { restaurantName: { $regex: search, $options: 'i' } },
        { retailer: { $regex: search, $options: 'i' } },
        { billType: { $regex: search, $options: 'i' } },
        { billNumber: { $regex: search, $options: 'i' } },
        { invoiceNo: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { platform: { $regex: search, $options: 'i' } },
      ];
    }

    const bills = await Bill.find(filter).sort({ createdAt: -1 }).limit(100);

    res.json({
      success: true,
      count: bills.length,
      data: bills,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/bills/:id
 * @desc    Get single bill by ID
 * @access  Optional / Private
 */
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(404).json({
        success: false,
        offline: true,
        message: 'Bill not found (database offline)',
      });
    }

    let bill;
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      bill = await Bill.findById(req.params.id);
    } else {
      bill = await Bill.findOne({
        $or: [{ id: req.params.id }, { invoiceNo: req.params.id }, { billNumber: req.params.id }],
      });
    }

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found',
      });
    }

    res.json({
      success: true,
      data: bill,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/bills/:id
 * @desc    Update a bill
 * @access  Optional / Private
 */
router.put('/:id', optionalAuth, async (req, res, next) => {
  try {
    const bill = await Bill.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found',
      });
    }

    res.json({
      success: true,
      data: bill,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/bills/:id
 * @desc    Delete a bill and optionally delete Cloudinary image
 * @access  Optional / Private
 */
router.delete('/:id', optionalAuth, async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found',
      });
    }

    // Attempt to delete Cloudinary asset if public_id is known
    if (bill.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(bill.cloudinaryPublicId);
      } catch (cloudErr) {
        console.warn('Cloudinary image deletion skipped/failed:', cloudErr.message);
      }
    }

    await Bill.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Bill deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
