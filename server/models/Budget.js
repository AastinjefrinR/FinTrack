import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Please specify a category for this budget'],
      trim: true,
    },
    monthlyLimit: {
      type: Number,
      required: [true, 'Please specify a monthly budget limit'],
      min: [1, 'Budget limit must be greater than zero'],
      set: (v) => Math.round((v + Number.EPSILON) * 100) / 100,
    },
    month: {
      type: Number,
      required: [true, 'Month is required (1-12)'],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: 2000,
      max: 2100,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate budget entry for same user, category, month, and year
budgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model('Budget', budgetSchema);
