import mongoose from 'mongoose';

const contributionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0.01,
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal'],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
    trim: true,
    default: '',
  },
});

const savingsGoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a savings goal name'],
      trim: true,
      maxlength: [80, 'Goal name cannot exceed 80 characters'],
    },
    targetAmount: {
      type: Number,
      required: [true, 'Please provide a target amount'],
      min: [1, 'Target amount must be greater than zero'],
      set: (v) => Math.round((v + Number.EPSILON) * 100) / 100,
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, 'Current amount cannot be negative'],
      set: (v) => Math.round((v + Number.EPSILON) * 100) / 100,
    },
    category: {
      type: String,
      default: 'Emergency Fund',
      trim: true,
    },
    deadline: {
      type: Date,
      required: [true, 'Please provide a target completion deadline'],
    },
    status: {
      type: String,
      enum: ['In Progress', 'Completed', 'Paused', 'Cancelled'],
      default: 'In Progress',
    },
    contributions: [contributionSchema],
  },
  {
    timestamps: true,
  }
);

savingsGoalSchema.index({ user: 1, status: 1 });

export default mongoose.model('SavingsGoal', savingsGoalSchema);
