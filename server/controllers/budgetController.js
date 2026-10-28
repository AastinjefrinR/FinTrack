import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';

// @desc    Get all budgets for a given month and year with real-time calculated spent amounts
// @route   GET /api/budgets
// @access  Private
export const getBudgets = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    const budgets = await Budget.find({
      user: req.user.id,
      month,
      year,
    }).sort({ category: 1 });

    // Determine start and end of that month
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    // Aggregate real expenses for each category in this period
    const expenseAgg = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' },
        },
      },
    ]);

    const expenseMap = {};
    expenseAgg.forEach((item) => {
      expenseMap[item._id] = item.totalSpent;
    });

    // Augment budgets with spent, remaining, usage %, and warning status
    let totalBudgetLimit = 0;
    let totalBudgetSpent = 0;

    const enrichedBudgets = budgets.map((b) => {
      const spent = expenseMap[b.category] || 0;
      const remaining = b.monthlyLimit - spent;
      const percentage = Math.round((spent / b.monthlyLimit) * 100 * 10) / 10;

      let status = 'safe'; // green
      if (percentage > 100) status = 'exceeded'; // red
      else if (percentage >= 80) status = 'warning'; // amber

      totalBudgetLimit += b.monthlyLimit;
      totalBudgetSpent += spent;

      return {
        _id: b._id,
        category: b.category,
        monthlyLimit: b.monthlyLimit,
        spent: Math.round(spent * 100) / 100,
        remaining: Math.round(remaining * 100) / 100,
        percentage,
        status,
        month: b.month,
        year: b.year,
        createdAt: b.createdAt,
      };
    });

    const overallPercentage =
      totalBudgetLimit > 0
        ? Math.round((totalBudgetSpent / totalBudgetLimit) * 100 * 10) / 10
        : 0;

    res.status(200).json({
      success: true,
      month,
      year,
      summary: {
        totalBudgetLimit: Math.round(totalBudgetLimit * 100) / 100,
        totalBudgetSpent: Math.round(totalBudgetSpent * 100) / 100,
        totalBudgetRemaining: Math.round((totalBudgetLimit - totalBudgetSpent) * 100) / 100,
        overallPercentage,
      },
      budgets: enrichedBudgets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update category budget
// @route   POST /api/budgets
// @access  Private
export const setBudget = async (req, res, next) => {
  try {
    const { category, monthlyLimit, month, year } = req.body;

    if (!category || monthlyLimit === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category and monthlyLimit.',
      });
    }

    const limitNum = parseFloat(monthlyLimit);
    if (isNaN(limitNum) || limitNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Monthly limit must be greater than zero.',
      });
    }

    const now = new Date();
    const targetMonth = month ? parseInt(month, 10) : now.getMonth() + 1;
    const targetYear = year ? parseInt(year, 10) : now.getFullYear();

    const budget = await Budget.findOneAndUpdate(
      {
        user: req.user.id,
        category: category.trim(),
        month: targetMonth,
        year: targetYear,
      },
      {
        monthlyLimit: limitNum,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Budget allocated successfully.',
      budget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
export const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found or access unauthorized.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
