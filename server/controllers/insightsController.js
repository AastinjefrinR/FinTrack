import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import SavingsGoal from '../models/SavingsGoal.js';
import UserSettings from '../models/UserSettings.js';
import { calculateHealthScore } from '../services/healthScoreService.js';
import { generateInsights } from '../services/insightsService.js';

// @desc    Get real-time financial health score, explainable insights, and smart alerts
// @route   GET /api/insights
// @access  Private
export const getInsightsAndHealthScore = async (req, res, next) => {
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

    // Concurrently fetch transactions, budgets, goals, and settings
    const [
      currentMonthTransactions,
      prevMonthTransactions,
      budgets,
      savingsGoals,
      settings,
    ] = await Promise.all([
      Transaction.find({ user: userId, date: { $gte: startOfCurrent, $lte: endOfCurrent } }),
      Transaction.find({ user: userId, date: { $gte: startOfPrev, $lte: endOfPrev } }),
      Budget.find({ user: userId, month: curMonth, year: curYear }),
      SavingsGoal.find({ user: userId }),
      UserSettings.findOne({ user: userId }),
    ]);

    const currentIncomeTx = currentMonthTransactions.filter((t) => t.type === 'income');
    const currentExpenseTx = currentMonthTransactions.filter((t) => t.type === 'expense');
    const prevExpenseTx = prevMonthTransactions.filter((t) => t.type === 'expense');

    const totalIncome = currentIncomeTx.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = currentExpenseTx.reduce((sum, t) => sum + t.amount, 0);

    const categoryExpenses = {};
    currentExpenseTx.forEach((t) => {
      categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount;
    });

    // 1. Calculate Monthly Financial Health Score (0 - 100)
    const healthScore = calculateHealthScore({
      totalIncome,
      totalExpense,
      budgets,
      categoryExpenses,
      savingsGoals,
    });

    // 2. Generate Rule-Based Explainable Insights & Smart Alerts
    const insightsEngineOutput = generateInsights({
      currentMonthExpenses: currentExpenseTx,
      previousMonthExpenses: prevExpenseTx,
      currentMonthIncome: currentIncomeTx,
      budgets,
      savingsGoals,
      currency: settings?.currency || 'INR',
    });

    res.status(200).json({
      success: true,
      healthScore,
      alerts: insightsEngineOutput.alerts,
      insights: insightsEngineOutput.insights,
      tips: insightsEngineOutput.tips,
      generatedAt: new Date(),
    });
  } catch (error) {
    next(error);
  }
};
