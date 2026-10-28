import SavingsGoal from '../models/SavingsGoal.js';

// @desc    Get all savings goals for user
// @route   GET /api/savings
// @access  Private
export const getGoals = async (req, res, next) => {
  try {
    const goals = await SavingsGoal.find({ user: req.user.id }).sort({ deadline: 1 });

    let totalTarget = 0;
    let totalSaved = 0;

    const enrichedGoals = goals.map((g) => {
      totalTarget += g.targetAmount;
      totalSaved += g.currentAmount;
      const remaining = Math.max(0, g.targetAmount - g.currentAmount);
      const progress = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100 * 10) / 10);
      const daysLeft = Math.ceil((new Date(g.deadline) - new Date()) / (1000 * 60 * 60 * 24));

      return {
        _id: g._id,
        name: g.name,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        remaining,
        progress,
        deadline: g.deadline,
        daysLeft,
        status: g.status,
        category: g.category,
        contributions: g.contributions,
        createdAt: g.createdAt,
      };
    });

    const overallProgress =
      totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100 * 10) / 10 : 0;

    res.status(200).json({
      success: true,
      summary: {
        totalGoals: goals.length,
        totalTarget: Math.round(totalTarget * 100) / 100,
        totalSaved: Math.round(totalSaved * 100) / 100,
        totalRemaining: Math.round(Math.max(0, totalTarget - totalSaved) * 100) / 100,
        overallProgress,
      },
      goals: enrichedGoals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new savings goal
// @route   POST /api/savings
// @access  Private
export const createGoal = async (req, res, next) => {
  try {
    const { name, targetAmount, currentAmount, deadline, category } = req.body;

    if (!name || !targetAmount || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide goal name, target amount, and deadline.',
      });
    }

    const numTarget = parseFloat(targetAmount);
    const numCurrent = parseFloat(currentAmount) || 0;

    if (numTarget <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Target amount must be greater than zero.',
      });
    }

    const goal = await SavingsGoal.create({
      user: req.user.id,
      name: name.trim(),
      targetAmount: numTarget,
      currentAmount: numCurrent,
      deadline: new Date(deadline),
      category: category || 'Emergency Fund',
      contributions:
        numCurrent > 0
          ? [
              {
                amount: numCurrent,
                type: 'deposit',
                date: new Date(),
                note: 'Initial balance',
              },
            ]
          : [],
    });

    res.status(201).json({
      success: true,
      message: 'Savings goal created successfully.',
      goal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a contribution (deposit) or withdrawal to a savings goal
// @route   POST /api/savings/:id/contribute
// @access  Private
export const addContribution = async (req, res, next) => {
  try {
    const { amount, type = 'deposit', note } = req.body;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid amount greater than zero.',
      });
    }

    const goal = await SavingsGoal.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found.',
      });
    }

    if (type === 'withdrawal' && goal.currentAmount < numAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient savings. You currently have ₹${goal.currentAmount.toLocaleString('en-IN')}.`,
      });
    }

    if (type === 'deposit') {
      goal.currentAmount += numAmount;
    } else {
      goal.currentAmount -= numAmount;
    }

    // Check if goal reached
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = 'Completed';
    } else if (goal.status === 'Completed' && goal.currentAmount < goal.targetAmount) {
      goal.status = 'In Progress';
    }

    goal.contributions.push({
      amount: numAmount,
      type,
      note: note || (type === 'deposit' ? 'Manual deposit' : 'Manual withdrawal'),
      date: new Date(),
    });

    await goal.save();

    res.status(200).json({
      success: true,
      message: `${type === 'deposit' ? 'Deposit' : 'Withdrawal'} of ₹${numAmount.toLocaleString('en-IN')} recorded successfully.`,
      goal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a savings goal
// @route   PUT /api/savings/:id
// @access  Private
export const updateGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found.',
      });
    }

    const { name, targetAmount, deadline, category, status } = req.body;

    if (name) goal.name = name.trim();
    if (targetAmount !== undefined) goal.targetAmount = parseFloat(targetAmount);
    if (deadline) goal.deadline = new Date(deadline);
    if (category) goal.category = category;
    if (status) goal.status = status;

    await goal.save();

    res.status(200).json({
      success: true,
      message: 'Savings goal updated successfully.',
      goal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a savings goal
// @route   DELETE /api/savings/:id
// @access  Private
export const deleteGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Savings goal deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
