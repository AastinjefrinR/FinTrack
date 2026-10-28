/**
 * Financial Health Score Calculation Service
 * Transparent Rubric-based Scoring (0 - 100 points)
 * 
 * 1. Budget Adherence (35 pts)
 * 2. Savings Rate (30 pts)
 * 3. Expense-to-Income Ratio (20 pts)
 * 4. Savings Goal Progression (15 pts)
 */

export const calculateHealthScore = ({
  totalIncome = 0,
  totalExpense = 0,
  budgets = [],
  categoryExpenses = {},
  savingsGoals = [],
}) => {
  let score = 0;
  const breakdown = [];

  // 1. Savings Rate Scoring (Max: 30 pts)
  let savingsRateScore = 0;
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  if (totalIncome <= 0) {
    savingsRateScore = 5;
    breakdown.push({
      metric: 'Savings Rate',
      score: 5,
      maxScore: 30,
      status: 'Warning',
      detail: 'No recorded income for this period. Add income to build savings rate.',
    });
  } else if (savingsRate >= 30) {
    savingsRateScore = 30;
    breakdown.push({
      metric: 'Savings Rate',
      score: 30,
      maxScore: 30,
      status: 'Excellent',
      detail: `Outstanding savings rate of ${savingsRate.toFixed(1)}% (Target: >30%). Full points awarded.`,
    });
  } else if (savingsRate >= 20) {
    savingsRateScore = 24;
    breakdown.push({
      metric: 'Savings Rate',
      score: 24,
      maxScore: 30,
      status: 'Good',
      detail: `Healthy savings rate of ${savingsRate.toFixed(1)}% (Target: 20-30%).`,
    });
  } else if (savingsRate >= 10) {
    savingsRateScore = 16;
    breakdown.push({
      metric: 'Savings Rate',
      score: 16,
      maxScore: 30,
      status: 'Fair',
      detail: `Moderate savings rate of ${savingsRate.toFixed(1)}%. Aim for at least 20%.`,
    });
  } else if (savingsRate > 0) {
    savingsRateScore = 8;
    breakdown.push({
      metric: 'Savings Rate',
      score: 8,
      maxScore: 30,
      status: 'Low',
      detail: `Low savings rate of ${savingsRate.toFixed(1)}%. Expenses are consuming almost all income.`,
    });
  } else {
    savingsRateScore = 0;
    breakdown.push({
      metric: 'Savings Rate',
      score: 0,
      maxScore: 30,
      status: 'Critical',
      detail: `Negative savings rate (${savingsRate.toFixed(1)}%). Expenses exceed income for this period.`,
    });
  }
  score += savingsRateScore;

  // 2. Budget Adherence Scoring (Max: 35 pts)
  let budgetScore = 0;
  if (budgets.length === 0) {
    // No budgets set yet - baseline neutral score
    budgetScore = 20;
    breakdown.push({
      metric: 'Budget Discipline',
      score: 20,
      maxScore: 35,
      status: 'Neutral',
      detail: 'No active category budgets defined. Set monthly limits to maximize this score.',
    });
  } else {
    let exceededCount = 0;
    let warningCount = 0;
    let withinCount = 0;

    budgets.forEach((b) => {
      const spent = categoryExpenses[b.category] || 0;
      const usagePercent = (spent / b.monthlyLimit) * 100;
      if (usagePercent > 100) exceededCount++;
      else if (usagePercent >= 80) warningCount++;
      else withinCount++;
    });

    const totalBudgets = budgets.length;
    if (exceededCount === 0 && warningCount === 0) {
      budgetScore = 35;
      breakdown.push({
        metric: 'Budget Discipline',
        score: 35,
        maxScore: 35,
        status: 'Excellent',
        detail: `All ${totalBudgets} budget categories are comfortably within designated limits.`,
      });
    } else if (exceededCount === 0) {
      budgetScore = 28;
      breakdown.push({
        metric: 'Budget Discipline',
        score: 28,
        maxScore: 35,
        status: 'Good',
        detail: `No budgets exceeded, but ${warningCount} category is approaching the 80% caution threshold.`,
      });
    } else {
      const penalty = Math.min(25, exceededCount * 12 + warningCount * 4);
      budgetScore = Math.max(5, 35 - penalty);
      breakdown.push({
        metric: 'Budget Discipline',
        score: budgetScore,
        maxScore: 35,
        status: 'Needs Attention',
        detail: `${exceededCount} budget(s) exceeded limit. Review spending allocations.`,
      });
    }
  }
  score += budgetScore;

  // 3. Expense-to-Income Ratio (Max: 20 pts)
  let ratioScore = 0;
  if (totalIncome > 0) {
    const expenseRatio = (totalExpense / totalIncome) * 100;
    if (expenseRatio <= 50) {
      ratioScore = 20;
      breakdown.push({
        metric: 'Expense Ratio',
        score: 20,
        maxScore: 20,
        status: 'Excellent',
        detail: `Conservative expense-to-income ratio of ${expenseRatio.toFixed(1)}% (below 50%).`,
      });
    } else if (expenseRatio <= 70) {
      ratioScore = 16;
      breakdown.push({
        metric: 'Expense Ratio',
        score: 16,
        maxScore: 20,
        status: 'Good',
        detail: `Healthy expense-to-income ratio of ${expenseRatio.toFixed(1)}% (50-70% standard).`,
      });
    } else if (expenseRatio <= 90) {
      ratioScore = 10;
      breakdown.push({
        metric: 'Expense Ratio',
        score: 10,
        maxScore: 20,
        status: 'Fair',
        detail: `High expense ratio of ${expenseRatio.toFixed(1)}%. Over 70% of income is spent.`,
      });
    } else {
      ratioScore = 2;
      breakdown.push({
        metric: 'Expense Ratio',
        score: 2,
        maxScore: 20,
        status: 'Critical',
        detail: `Dangerously high expense ratio of ${expenseRatio.toFixed(1)}%. Danger of deficit.`,
      });
    }
  } else {
    ratioScore = 5;
    breakdown.push({
      metric: 'Expense Ratio',
      score: 5,
      maxScore: 20,
      status: 'Warning',
      detail: 'Income not recorded. Ratio cannot be positively evaluated.',
    });
  }
  score += ratioScore;

  // 4. Savings Goals & Future Planning (Max: 15 pts)
  let goalsScore = 0;
  if (savingsGoals.length === 0) {
    goalsScore = 5;
    breakdown.push({
      metric: 'Goal Planning',
      score: 5,
      maxScore: 15,
      status: 'Neutral',
      detail: 'No savings goals set. Create goals to build targeted financial security.',
    });
  } else {
    const activeGoals = savingsGoals.filter((g) => g.status === 'In Progress');
    const completedGoals = savingsGoals.filter((g) => g.status === 'Completed');
    const totalProgress =
      savingsGoals.reduce((sum, g) => sum + (g.currentAmount / g.targetAmount) * 100, 0) /
      savingsGoals.length;

    if (completedGoals.length > 0 || totalProgress >= 60) {
      goalsScore = 15;
      breakdown.push({
        metric: 'Goal Planning',
        score: 15,
        maxScore: 15,
        status: 'Excellent',
        detail: `Strong goal progression (Avg: ${totalProgress.toFixed(0)}%). Great habit consistency.`,
      });
    } else if (totalProgress >= 25) {
      goalsScore = 11;
      breakdown.push({
        metric: 'Goal Planning',
        score: 11,
        maxScore: 15,
        status: 'Good',
        detail: `Steady progress on active goals (${totalProgress.toFixed(0)}% completion).`,
      });
    } else {
      goalsScore = 7;
      breakdown.push({
        metric: 'Goal Planning',
        score: 7,
        maxScore: 15,
        status: 'Fair',
        detail: `Goals created (${activeGoals.length} active), but contributions are under 25%.`,
      });
    }
  }
  score += goalsScore;

  // Final Grade Assessment
  let grade = 'Fair';
  let color = '#f59e0b'; // Amber
  let summary = 'Your finances are stable, but there is clear room for optimization.';

  if (score >= 85) {
    grade = 'Excellent';
    color = '#10b981'; // Emerald
    summary = 'Superb financial management! High savings rate, strict budget control, and clear goals.';
  } else if (score >= 70) {
    grade = 'Good';
    color = '#059669'; // Emerald dark
    summary = 'Strong financial health. Keep an eye on secondary category expenses.';
  } else if (score >= 50) {
    grade = 'Fair';
    color = '#d97706'; // Amber dark
    summary = 'Average financial health. Focus on trimming non-essential expenses and capping budgets.';
  } else {
    grade = 'Needs Attention';
    color = '#ef4444'; // Red
    summary = 'Financial health requires immediate attention. Expenses are currently exceeding safe thresholds.';
  }

  return {
    score: Math.round(score),
    maxScore: 100,
    grade,
    color,
    summary,
    breakdown,
    updatedAt: new Date(),
  };
};
