import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import Bill from '../models/Bill.js';
import cloudinary from '../config/cloudinary.js';
import { optionalAuth } from '../middleware/auth.js';
import { checkOllamaStatus, analyzeBillWithOllama } from '../services/ollamaService.js';
import memoryStore from '../services/memoryStore.js';

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

    const parsedData = auditResult.data || {};
    res.json({
      ...auditResult,
      total: parsedData.statedTotal || parsedData.total || 0,
      subtotal: parsedData.subtotal || 0,
      taxVerdict: parsedData.taxLegality || parsedData.verification || { status: 'VERIFIED' },
      billAnalysis: parsedData,
    });
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
 * Helper to collect all bills (from MongoDB and/or memory store)
 */
async function getAllBillsCombined(userId = null, search = '', billType = '') {
  let bills = [];

  if (mongoose.connection.readyState === 1) {
    try {
      const filter = {};
      if (userId && userId !== 'guest') filter.userId = userId;
      if (billType && billType !== 'ALL') filter.billType = billType;
      if (search) {
        filter.$or = [
          { restaurantName: { $regex: search, $options: 'i' } },
          { retailer: { $regex: search, $options: 'i' } },
          { billType: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
          { invoiceNo: { $regex: search, $options: 'i' } },
        ];
      }
      bills = await Bill.find(filter).lean();
    } catch {
      // Fallback
    }
  }

  const memBills = memoryStore.findBills({ search, userId, billType });
  const existingIds = new Set(bills.map((b) => (b._id || b.id).toString()));

  for (const mb of memBills) {
    const mbId = (mb._id || mb.id).toString();
    if (!existingIds.has(mbId)) {
      bills.push(mb);
    }
  }

  return bills;
}

/**
 * @route   GET /api/bills/analytics/overview
 * @desc    Aggregated analytics (spending, tax, fees, order count)
 * @access  Optional / Private
 */
router.get('/analytics/overview', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.uid || 'guest';
    const bills = await getAllBillsCombined(userId);

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
 * @route   GET /api/bills/analytics/trends
 * @desc    Monthly bucketed trend data for N months
 * @access  Optional / Private
 */
router.get('/analytics/trends', optionalAuth, async (req, res, next) => {
  try {
    const monthsCount = Math.max(1, Math.min(24, parseInt(req.query.months, 10) || 6));
    const userId = req.user?.id || req.user?._id || req.user?.uid || 'guest';
    const bills = await getAllBillsCombined(userId);

    const now = new Date();
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      months.push({
        month: key,
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
        totalSpending: 0,
        totalTax: 0,
        totalFees: 0,
        billCount: 0,
      });
    }

    bills.forEach((b) => {
      const bDate = b.createdAt ? new Date(b.createdAt) : (b.date ? new Date(b.date) : now);
      const monthIdx = bDate.getMonth();
      const year = bDate.getFullYear();

      const bucket = months.find((m) => m.year === year && m.monthIndex === monthIdx) || months[months.length - 1];
      if (bucket) {
        bucket.totalSpending += Number(b.totalAmount || b.total || 0);
        bucket.totalTax += Number(b.gstAmount || b.taxes || b.gst || 0);
        bucket.totalFees += Number(b.serviceCharge || 0);
        bucket.billCount += 1;
      }
    });

    const sanitizedTrends = months.map(({ month, totalSpending, totalTax, totalFees, billCount }) => ({
      month,
      totalSpending: Number(totalSpending.toFixed(2)),
      totalTax: Number(totalTax.toFixed(2)),
      totalFees: Number(totalFees.toFixed(2)),
      billCount,
    }));

    res.json({
      success: true,
      data: sanitizedTrends,
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
    const userId = req.user?.id || req.user?._id || req.user?.uid || 'guest';
    const bills = await getAllBillsCombined(userId);

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

    const categoryArray = Object.entries(breakdown).map(([category, info]) => ({
      category,
      ...info,
      total: Number(info.total.toFixed(2)),
      tax: Number(info.tax.toFixed(2)),
    }));

    res.json({
      success: true,
      data: categoryArray,
      byCategory: breakdown,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/bills
 * @desc    Create a new bill record
 * @access  Optional / Private
 */
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const restaurantName = req.body.restaurantName || req.body.retailer || req.body.merchant;
    if (!restaurantName || typeof restaurantName !== 'string' || !restaurantName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid restaurantName or retailer',
      });
    }

    const userId = req.body.userId || req.user?.id || req.user?._id || req.user?.uid || 'guest';

    // Normalize image URL
    const billImageUrl = req.body.billImageUrl || req.body.imageUrl || req.body.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop';

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
      retailer: req.body.retailer || restaurantName,
      restaurantName,
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

    let createdBill = null;
    if (mongoose.connection.readyState === 1) {
      try {
        createdBill = await Bill.create(billData);
      } catch {
        // Fallback to memory
      }
    }

    if (!createdBill) {
      createdBill = memoryStore.createBill(billData);
    } else {
      // Also cache in memoryStore for instant cross-query
      memoryStore.createBill({
        ...createdBill.toObject ? createdBill.toObject() : createdBill,
        _id: (createdBill._id || createdBill.id).toString(),
      });
    }

    res.status(201).json({
      success: true,
      data: createdBill,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/bills
 * @desc    Get all bills for current user or filter
 * @access  Optional / Private
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.query.userId || req.user?.id || req.user?._id || req.user?.uid;
    const search = req.query.search || '';
    const billType = req.query.billType || '';

    const bills = await getAllBillsCombined(userId, search, billType);

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
    let bill = null;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(req.params.id)) {
      try {
        bill = await Bill.findById(req.params.id);
      } catch {
        // Fallback
      }
    }

    if (!bill) {
      bill = memoryStore.findBillById(req.params.id);
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
    let bill = null;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(req.params.id)) {
      try {
        bill = await Bill.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true,
        });
      } catch {
        // Fallback
      }
    }

    if (!bill) {
      bill = memoryStore.updateBill(req.params.id, req.body);
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
 * @route   DELETE /api/bills/:id
 * @desc    Delete a bill
 * @access  Optional / Private
 */
router.delete('/:id', optionalAuth, async (req, res, next) => {
  try {
    let deleted = false;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(req.params.id)) {
      try {
        const doc = await Bill.findById(req.params.id);
        if (doc) {
          if (doc.cloudinaryPublicId) {
            cloudinary.uploader.destroy(doc.cloudinaryPublicId).catch(() => {});
          }
          await Bill.findByIdAndDelete(req.params.id);
          deleted = true;
        }
      } catch {
        // Fallback
      }
    }

    if (memoryStore.deleteBill(req.params.id)) {
      deleted = true;
    }

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found',
      });
    }

    res.json({
      success: true,
      message: 'Bill deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
