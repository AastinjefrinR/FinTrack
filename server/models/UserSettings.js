import mongoose from 'mongoose';

const userSettingsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
      uppercase: true,
    },
    monthlyIncomeTarget: {
      type: Number,
      default: 50000,
      min: [0, 'Monthly income target cannot be negative'],
    },
    monthlyBudgetLimit: {
      type: Number,
      default: 35000,
      min: [0, 'Monthly budget limit cannot be negative'],
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light',
    },
    spendingAlertThreshold: {
      type: Number,
      default: 80, // Alert at 80%
      min: 10,
      max: 100,
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
    dateFormat: {
      type: String,
      default: 'DD/MM/YYYY',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('UserSettings', userSettingsSchema);
