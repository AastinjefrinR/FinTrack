/**
 * Explainable Financial Insights & Smart Alerts Service
 * Generates transparent, rule-based insights and actionable tips from actual DB records.
 */

export const generateInsights = ({
  currentMonthExpenses = [],
  previousMonthExpenses = [],
  currentMonthIncome = [],
  budgets = [],
  savingsGoals = [],
  currency = 'INR',
}) => {
  const alerts = [];
  const insights = [];
  const tips = [];

  const sym = currency === 'INR' ? '₹' : currency + ' ';

  // Calculate totals
  const currentTotalExpense = currentMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
  const prevTotalExpense = previousMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
  const currentTotalIncome = currentMonthIncome.reduce((sum, t) => sum + t.amount, 0);

  // Group current expenses by category
  const currentCatTotals = {};
  currentMonthExpenses.forEach((t) => {
    currentCatTotals[t.category] = (currentCatTotals[t.category] || 0) + t.amount;
  });

  // Group previous expenses by category
  const prevCatTotals = {};
  previousMonthExpenses.forEach((t) => {
    prevCatTotals[t.category] = (prevCatTotals[t.category] || 0) + t.amount;
  });

  // 1. Month-over-Month Spending Comparison Insight
  if (prevTotalExpense > 0) {
    const diff = currentTotalExpense - prevTotalExpense;
    const pctChange = ((diff / prevTotalExpense) * 100).toFixed(1);

    if (diff > 0) {
      insights.push({
        type: 'spending_trend',
        level: 'warning',
        title: 'Spending Increased',
        message: `Your total spending this month is up by ${pctChange}% (${sym}${Math.abs(diff).toLocaleString('en-IN')}) compared to last month.`,
        metric: `+${pctChange}%`,
      });
      tips.push({
        category: 'Spending Control',
        tip: `You are spending faster than last month. Consider reviewing discretionary categories like Shopping or Entertainment this week.`,
      });
    } else if (diff < 0) {
      insights.push({
        type: 'spending_trend',
        level: 'success',
        title: 'Reduced Spending',
        message: `Outstanding! You spent ${Math.abs(pctChange)}% less (${sym}${Math.abs(diff).toLocaleString('en-IN')}) this month than last month.`,
        metric: `${pctChange}%`,
      });
      tips.push({
        category: 'Savings Momentum',
        tip: `Since you saved ${sym}${Math.abs(diff).toLocaleString('en-IN')} relative to last month, consider moving this surplus directly into your active savings goal!`,
      });
    } else {
      insights.push({
        type: 'spending_trend',
        level: 'info',
        title: 'Consistent Spending',
        message: `Your spending this month is identical to last month at ${sym}${currentTotalExpense.toLocaleString('en-IN')}.`,
        metric: '0%',
      });
    }
  }

  // 2. Budget Alerts & Threshold Warnings (80% and 100%)
  budgets.forEach((budget) => {
    const spent = currentCatTotals[budget.category] || 0;
    const pct = ((spent / budget.monthlyLimit) * 100).toFixed(1);
    const remaining = budget.monthlyLimit - spent;

    if (spent > budget.monthlyLimit) {
      const overBy = spent - budget.monthlyLimit;
      alerts.push({
        category: budget.category,
        severity: 'danger',
        type: 'budget_exceeded',
        title: `Budget Exceeded: ${budget.category}`,
        message: `You have exceeded your ${budget.category} budget by ${sym}${overBy.toLocaleString('en-IN')} (${pct}% of limit used).`,
        spent,
        limit: budget.monthlyLimit,
        pct: parseFloat(pct),
      });
    } else if (spent >= budget.monthlyLimit * 0.8) {
      alerts.push({
        category: budget.category,
        severity: 'warning',
        type: 'budget_warning',
        title: `Budget Caution: ${budget.category}`,
        message: `You have used ${pct}% of your ${budget.category} budget. Only ${sym}${remaining.toLocaleString('en-IN')} remaining.`,
        spent,
        limit: budget.monthlyLimit,
        pct: parseFloat(pct),
      });
    }
  });

  // 3. Category Shift Analysis
  Object.keys(currentCatTotals).forEach((cat) => {
    const curSpent = currentCatTotals[cat];
    const prevSpent = prevCatTotals[cat] || 0;

    if (prevSpent > 0 && curSpent > prevSpent * 1.25 && curSpent - prevSpent >= 1000) {
      const surgePct = (((curSpent - prevSpent) / prevSpent) * 100).toFixed(0);
      insights.push({
        type: 'category_spike',
        level: 'warning',
        title: `${cat} Expense Spike`,
        message: `Your spending on ${cat} surged by ${surgePct}% (${sym}${(curSpent - prevSpent).toLocaleString('en-IN')} more) compared to last month.`,
        metric: `+${surgePct}%`,
      });
    }
  });

  // 4. Single High-Value Transaction Alert
  currentMonthExpenses.forEach((t) => {
    if (currentTotalExpense > 5000 && t.amount > currentTotalExpense * 0.25) {
      alerts.push({
        category: t.category,
        severity: 'info',
        type: 'large_transaction',
        title: 'High-Value Outflow Recorded',
        message: `Single transaction "${t.description}" (${sym}${t.amount.toLocaleString('en-IN')}) accounts for over 25% of your total monthly outflow.`,
        amount: t.amount,
      });
    }
  });

  // 5. Savings Goals Alerts & Suggestions
  savingsGoals.forEach((goal) => {
    const remaining = goal.targetAmount - goal.currentAmount;
    const pct = ((goal.currentAmount / goal.targetAmount) * 100).toFixed(0);

    if (remaining <= 0) {
      insights.push({
        type: 'goal_completed',
        level: 'success',
        title: `Goal Achieved: ${goal.name}!`,
        message: `Congratulations! You reached 100% of your target amount (${sym}${goal.targetAmount.toLocaleString('en-IN')}).`,
        metric: '100%',
      });
    } else {
      const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysLeft > 0 && daysLeft <= 30) {
        alerts.push({
          category: 'Savings',
          severity: 'warning',
          type: 'goal_deadline',
          title: `Goal Deadline Approaching: ${goal.name}`,
          message: `Only ${daysLeft} days remaining to save ${sym}${remaining.toLocaleString('en-IN')} (${pct}% complete).`,
          daysLeft,
          remaining,
        });
      }

      tips.push({
        category: goal.name,
        tip: `You need ${sym}${remaining.toLocaleString('en-IN')} more to reach your "${goal.name}" target. A small contribution of ${sym}${Math.ceil(remaining / Math.max(1, Math.ceil(daysLeft / 30))).toLocaleString('en-IN')}/month will get you there.`,
      });
    }
  });

  // 6. Savings Rate Rule Check
  if (currentTotalIncome > 0) {
    const savingsRate = ((currentTotalIncome - currentTotalExpense) / currentTotalIncome) * 100;
    if (savingsRate < 10) {
      tips.push({
        category: 'Savings Rate Optimization',
        tip: `Your current savings rate is ${savingsRate.toFixed(1)}%. Financial planners recommend the 50/30/20 rule: 50% needs, 30% wants, and 20% savings.`,
      });
    }
  }

  // Ensure default insights if dataset is small
  if (insights.length === 0) {
    insights.push({
      type: 'general',
      level: 'info',
      title: 'Active Financial Tracking',
      message: 'All your income and expenses are actively monitored against your monthly targets.',
      metric: 'Active',
    });
  }

  if (tips.length === 0) {
    tips.push({
      category: 'Smart Budgeting',
      tip: 'Set monthly category budgets to receive automated threshold alerts and improve your Financial Health Score.',
    });
  }

  return {
    alerts,
    insights,
    tips,
    generatedAt: new Date(),
  };
};
