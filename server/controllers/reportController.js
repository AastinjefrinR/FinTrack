import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import SavingsGoal from '../models/SavingsGoal.js';

// Helper to get date boundaries based on period filter
const getDateRange = (period, customStart, customEnd) => {
  const now = new Date();
  let startDate;
  let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  switch (period) {
    case 'this_month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case 'last_month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
    case 'last_3_months':
      startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      break;
    case 'last_6_months':
      startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      break;
    case 'this_year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case 'custom':
      startDate = customStart ? new Date(customStart) : new Date(now.getFullYear(), now.getMonth(), 1);
      if (customEnd) {
        endDate = new Date(customEnd);
        endDate.setHours(23, 59, 59, 999);
      }
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return { startDate, endDate };
};

// @desc    Get dashboard KPIs and charts summary
// @route   GET /api/reports/dashboard
// @access  Private
export const getDashboardSummary = async (req, res, next) => {
  try {
    const { period = 'this_month', startDate: customStart, endDate: customEnd } = req.query;
    const { startDate, endDate } = getDateRange(period, customStart, customEnd);
    const userId = req.user._id;

    // 1. Current Period Totals
    const totalsAgg = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    totalsAgg.forEach((t) => {
      if (t._id === 'income') totalIncome = t.total;
      if (t._id === 'expense') totalExpense = t.total;
    });

    const currentBalance = Math.round((totalIncome - totalExpense) * 100) / 100;
    const savingsRate =
      totalIncome > 0
        ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100 * 10) / 10
        : 0;

    // 2. Category Breakdown for Expenses in Period
    const categoryAgg = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const categoryBreakdown = categoryAgg.map((c) => ({
      category: c._id,
      amount: Math.round(c.total * 100) / 100,
      count: c.count,
      percentage:
        totalExpense > 0 ? Math.round((c.total / totalExpense) * 100 * 10) / 10 : 0,
    }));

    // 3. Past 6 Months Income vs Expense Trend
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyTrendAgg = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    // Build ordered list of the last 6 months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrends = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const label = `${monthNames[m - 1]} ${y}`;

      const incomeEntry = monthlyTrendAgg.find(
        (e) => e._id.year === y && e._id.month === m && e._id.type === 'income'
      );
      const expenseEntry = monthlyTrendAgg.find(
        (e) => e._id.year === y && e._id.month === m && e._id.type === 'expense'
      );

      const incomeVal = incomeEntry ? Math.round(incomeEntry.total * 100) / 100 : 0;
      const expenseVal = expenseEntry ? Math.round(expenseEntry.total * 100) / 100 : 0;

      monthlyTrends.push({
        month: label,
        year: y,
        monthIndex: m,
        income: incomeVal,
        expense: expenseVal,
        netSavings: Math.round((incomeVal - expenseVal) * 100) / 100,
      });
    }

    // 4. Budget Overview for current month
    const curMonth = now.getMonth() + 1;
    const curYear = now.getFullYear();
    const budgets = await Budget.find({ user: userId, month: curMonth, year: curYear });

    let totalBudgetLimit = 0;
    let totalBudgetSpent = 0;
    budgets.forEach((b) => {
      totalBudgetLimit += b.monthlyLimit;
      const catSpent = categoryBreakdown.find((c) => c.category === b.category)?.amount || 0;
      totalBudgetSpent += catSpent;
    });

    const budgetUsagePercent =
      totalBudgetLimit > 0
        ? Math.round((totalBudgetSpent / totalBudgetLimit) * 100 * 10) / 10
        : 0;

    // 5. Recent 6 Transactions
    const recentTransactions = await Transaction.find({ user: userId })
      .sort({ date: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      period,
      dateRange: {
        startDate,
        endDate,
      },
      kpi: {
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalExpense: Math.round(totalExpense * 100) / 100,
        currentBalance,
        savingsRate,
        totalBudgetLimit: Math.round(totalBudgetLimit * 100) / 100,
        totalBudgetSpent: Math.round(totalBudgetSpent * 100) / 100,
        budgetUsagePercent,
      },
      categoryBreakdown,
      monthlyTrends,
      recentTransactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed analytics and previous-period comparison
// @route   GET /api/reports/analytics
// @access  Private
export const getDetailedAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const curMonth = now.getMonth() + 1;
    const curYear = now.getFullYear();

    const startOfCurrent = new Date(curYear, curMonth - 1, 1);
    const endOfCurrent = new Date(curYear, curMonth, 0, 23, 59, 59, 999);

    const prevMonth = curMonth === 1 ? 12 : curMonth - 1;
    const prevYear = curMonth === 1 ? curYear - 1 : curYear;
    const startOfPrev = new Date(prevYear, prevMonth - 1, 1);
    const endOfPrev = new Date(prevYear, prevMonth, 0, 23, 59, 59, 999);

    // Fetch transactions for both months
    const [currentTransactions, prevTransactions] = await Promise.all([
      Transaction.find({ user: userId, date: { $gte: startOfCurrent, $lte: endOfCurrent } }),
      Transaction.find({ user: userId, date: { $gte: startOfPrev, $lte: endOfPrev } }),
    ]);

    const curIncome = currentTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const curExpense = currentTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const prevIncome = prevTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const prevExpense = prevTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Category comparison
    const curCatTotals = {};
    currentTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        curCatTotals[t.category] = (curCatTotals[t.category] || 0) + t.amount;
      });

    const prevCatTotals = {};
    prevTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        prevCatTotals[t.category] = (prevCatTotals[t.category] || 0) + t.amount;
      });

    const allCategories = Array.from(
      new Set([...Object.keys(curCatTotals), ...Object.keys(prevCatTotals)])
    );

    const categoryComparison = allCategories.map((cat) => {
      const cur = curCatTotals[cat] || 0;
      const prev = prevCatTotals[cat] || 0;
      const diff = cur - prev;
      const pct = prev > 0 ? Math.round((diff / prev) * 100 * 10) / 10 : cur > 0 ? 100 : 0;
      return {
        category: cat,
        currentSpent: Math.round(cur * 100) / 100,
        previousSpent: Math.round(prev * 100) / 100,
        difference: Math.round(diff * 100) / 100,
        percentageChange: pct,
      };
    });

    res.status(200).json({
      success: true,
      currentMonth: {
        label: `${startOfCurrent.toLocaleString('default', { month: 'short' })} ${curYear}`,
        income: Math.round(curIncome * 100) / 100,
        expense: Math.round(curExpense * 100) / 100,
        netSavings: Math.round((curIncome - curExpense) * 100) / 100,
      },
      previousMonth: {
        label: `${startOfPrev.toLocaleString('default', { month: 'short' })} ${prevYear}`,
        income: Math.round(prevIncome * 100) / 100,
        expense: Math.round(prevExpense * 100) / 100,
        netSavings: Math.round((prevIncome - prevExpense) * 100) / 100,
      },
      comparison: {
        expenseDiff: Math.round((curExpense - prevExpense) * 100) / 100,
        expenseChangePct:
          prevExpense > 0
            ? Math.round(((curExpense - prevExpense) / prevExpense) * 100 * 10) / 10
            : 0,
        incomeDiff: Math.round((curIncome - prevIncome) * 100) / 100,
        incomeChangePct:
          prevIncome > 0
            ? Math.round(((curIncome - prevIncome) / prevIncome) * 100 * 10) / 10
            : 0,
      },
      categoryComparison,
    });
  } catch (error) {
    next(error);
  }
};
