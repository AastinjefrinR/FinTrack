import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: ['income', 'expense'],
        message: 'Transaction type must be either income or expense',
      },
      required: [true, 'Please specify transaction type'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please provide transaction amount'],
      min: [0.01, 'Amount must be greater than zero'],
      set: (v) => Math.round((v + Number.EPSILON) * 100) / 100, // Round to 2 decimals
    },
    category: {
      type: String,
      required: [true, 'Please select or enter a category'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    date: {
      type: Date,
      default: Date.now,
      required: [true, 'Please provide a transaction date'],
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'UPI / NetBanking', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Other'],
      default: 'UPI / NetBanking',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying user's transactions by date range efficiently
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1, date: -1 });

export default mongoose.model('Transaction', transactionSchema);
