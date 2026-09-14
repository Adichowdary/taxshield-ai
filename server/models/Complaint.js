import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    billId: {
      type: String,
      ref: 'Bill',
    },
    restaurantName: {
      type: String,
      required: [true, 'Restaurant name is required'],
      trim: true,
    },
    complaintReason: {
      type: String,
      required: [true, 'Complaint reason is required'],
      trim: true,
    },
    complaintDetails: {
      type: String,
      required: [true, 'Complaint details text is required'],
    },
    evidence: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['Draft', 'Generated', 'Submitted', 'Pending', 'Resolved', 'Rejected'],
      default: 'Generated',
    },
  },
  {
    timestamps: true,
  }
);

complaintSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

complaintSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  },
});

const Complaint = mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema);
export default Complaint;
