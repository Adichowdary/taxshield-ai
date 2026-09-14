import mongoose from 'mongoose';

const lineItemSchema = new mongoose.Schema(
  {
    id: { type: String },
    name: { type: String, required: true },
    qty: { type: Number, default: 1 },
    quantity: { type: Number },
    unitPrice: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    taxRate: { type: String },
    gstRate: { type: Number },
    hsn: { type: String },
    total: { type: Number, default: 0 },
    confidence: { type: Number },
    status: { type: String, default: 'VERIFIED' },
  },
  { _id: false }
);

const billSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    billType: {
      type: String,
      enum: ['RESTAURANT', 'GROCERY', 'FASHION', 'ELECTRONICS', 'PHARMACY', 'FUEL', 'OTHER'],
      default: 'RESTAURANT',
      index: true,
    },
    retailer: {
      type: String,
      trim: true,
    },
    restaurantName: {
      type: String,
      default: 'Establishment',
      trim: true,
    },
    billNumber: {
      type: String,
      trim: true,
    },
    invoiceNo: {
      type: String,
      trim: true,
    },
    billDate: {
      type: Date,
      default: Date.now,
    },
    date: {
      type: String,
    },
    time: {
      type: String,
    },
    category: {
      type: String,
      default: 'Restaurant',
    },
    establishmentType: {
      type: String,
      default: 'Restaurant',
    },
    platform: {
      type: String,
      default: 'Direct',
    },
    gstin: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    subtotal: {
      type: Number,
      default: 0,
    },
    gstAmount: {
      type: Number,
      default: 0,
    },
    taxes: {
      type: Number,
      default: 0,
    },
    gst: {
      type: Number,
      default: 0,
    },
    cgst: {
      type: Number,
      default: 0,
    },
    sgst: {
      type: Number,
      default: 0,
    },
    igst: {
      type: Number,
      default: 0,
    },
    serviceCharge: {
      type: Number,
      default: 0,
    },
    otherCharges: {
      type: Number,
      default: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    packagingFee: {
      type: Number,
      default: 0,
    },
    platformFee: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    extractedText: {
      type: String,
    },
    billScore: {
      type: Number,
      default: 100,
    },
    confidenceScore: {
      type: Number,
      default: 100,
    },
    verificationStatus: {
      type: String,
      enum: ['Uploaded', 'VERIFIED', 'REVIEW_RECOMMENDED', 'POTENTIAL_OVERCHARGE', 'FLAGGED', 'MATH_DISCREPANCY'],
      default: 'Uploaded',
    },
    statusText: {
      type: String,
    },
    items: [lineItemSchema],
    lineItems: [lineItemSchema],
    issues: [{ type: mongoose.Schema.Types.Mixed }],
    verification: { type: mongoose.Schema.Types.Mixed },
    taxVerdict: { type: mongoose.Schema.Types.Mixed },
    hsnCodes: [{ type: String }],
    analysisResult: {
      type: mongoose.Schema.Types.Mixed,
    },
    billImageUrl: {
      type: String,
      required: [true, 'Bill image URL is required'],
    },
    image: {
      type: String,
    },
    cloudinaryPublicId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual id matching frontend expectation
billSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

billSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  },
});

const Bill = mongoose.models.Bill || mongoose.model('Bill', billSchema);
export default Bill;
