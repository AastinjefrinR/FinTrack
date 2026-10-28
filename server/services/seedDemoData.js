import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import SavingsGoal from '../models/SavingsGoal.js';
import UserSettings from '../models/UserSettings.js';

export const seedUserData = async (userId) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  // 1. Clear existing user data for a clean sample state
  await Transaction.deleteMany({ user: userId });
  await Budget.deleteMany({ user: userId });
  await SavingsGoal.deleteMany({ user: userId });

  // 2. Sample Transactions for Previous Month
  const prevMonthDate = (day) => new Date(prevYear, prevMonth - 1, Math.min(day, 28));
  const currentMonthDate = (day) => new Date(currentYear, currentMonth - 1, Math.min(day, 28));

  const sampleTransactions = [
    // Previous Month Incomes
    {
      user: userId,
      type: 'income',
      amount: 75000,
      category: 'Salary',
      description: 'Monthly Corporate Tech Salary',
      date: prevMonthDate(1),
      paymentMethod: 'Bank Transfer',
      notes: 'Direct deposit',
    },
    {
      user: userId,
      type: 'income',
      amount: 15000,
      category: 'Freelance',
      description: 'React Web Development Project',
      date: prevMonthDate(15),
      paymentMethod: 'UPI / NetBanking',
      notes: 'Invoice #1042',
    },
    // Previous Month Expenses
    {
      user: userId,
      type: 'expense',
      amount: 22000,
      category: 'Housing & Rent',
      description: 'Apartment Monthly Rent',
      date: prevMonthDate(2),
      paymentMethod: 'Bank Transfer',
    },
    {
      user: userId,
      type: 'expense',
      amount: 8500,
      category: 'Food & Dining',
      description: 'Monthly Groceries at Nature Basket',
      date: prevMonthDate(5),
      paymentMethod: 'Credit Card',
    },
    {
      user: userId,
      type: 'expense',
      amount: 3200,
      category: 'Food & Dining',
      description: 'Weekend Dining & Cafes',
      date: prevMonthDate(12),
      paymentMethod: 'UPI / NetBanking',
    },
    {
      user: userId,
      type: 'expense',
      amount: 4500,
      category: 'Transportation',
      description: 'Fuel and Metro Transit Passes',
      date: prevMonthDate(10),
      paymentMethod: 'Credit Card',
    },
    {
      user: userId,
      type: 'expense',
      amount: 4200,
      category: 'Utilities & Bills',
      description: 'Electricity & High-speed Fiber Bill',
      date: prevMonthDate(8),
      paymentMethod: 'UPI / NetBanking',
    },
    {
      user: userId,
      type: 'expense',
      amount: 6000,
      category: 'Shopping',
      description: 'Festive Attire & Essentials',
      date: prevMonthDate(18),
      paymentMethod: 'Credit Card',
    },
    {
      user: userId,
      type: 'expense',
      amount: 2500,
      category: 'Entertainment',
      description: 'Movie IMAX & Streaming Subscriptions',
      date: prevMonthDate(22),
      paymentMethod: 'UPI / NetBanking',
    },

    // Current Month Incomes
    {
      user: userId,
      type: 'income',
      amount: 75000,
      category: 'Salary',
      description: 'Monthly Corporate Tech Salary',
      date: currentMonthDate(1),
      paymentMethod: 'Bank Transfer',
      notes: 'Primary monthly salary',
    },
    {
      user: userId,
      type: 'income',
      amount: 18500,
      category: 'Freelance',
      description: 'Full-Stack Dashboard Consulting',
      date: currentMonthDate(14),
      paymentMethod: 'UPI / NetBanking',
      notes: 'Consulting milestones achieved',
    },
    {
      user: userId,
      type: 'income',
      amount: 3500,
      category: 'Investments',
      description: 'Mutual Fund Dividend Payout',
      date: currentMonthDate(20),
      paymentMethod: 'Bank Transfer',
      notes: 'Quarterly dividend',
    },

    // Current Month Expenses
    {
      user: userId,
      type: 'expense',
      amount: 22000,
      category: 'Housing & Rent',
      description: 'Apartment Monthly Rent',
      date: currentMonthDate(2),
      paymentMethod: 'Bank Transfer',
      notes: 'Monthly fixed rent payment',
    },
    {
      user: userId,
      type: 'expense',
      amount: 9800,
      category: 'Food & Dining',
      description: 'Supermarket Groceries & Farm Fresh Produce',
      date: currentMonthDate(4),
      paymentMethod: 'Credit Card',
    },
    {
      user: userId,
      type: 'expense',
      amount: 3800,
      category: 'Food & Dining',
      description: 'Dinner with Colleagues at Olive Bistro',
      date: currentMonthDate(11),
      paymentMethod: 'UPI / NetBanking',
    },
    {
      user: userId,
      type: 'expense',
      amount: 4100,
      category: 'Transportation',
      description: 'Vehicle Petrol and Uber Rides',
      date: currentMonthDate(7),
      paymentMethod: 'Debit Card',
    },
    {
      user: userId,
      type: 'expense',
      amount: 3950,
      category: 'Utilities & Bills',
      description: 'Broadband Wifi & Mobile Recharges',
      date: currentMonthDate(6),
      paymentMethod: 'UPI / NetBanking',
    },
    {
      user: userId,
      type: 'expense',
      amount: 8200,
      category: 'Shopping',
      description: 'Wireless Noise-Cancelling Headphones',
      date: currentMonthDate(12),
      paymentMethod: 'Credit Card',
      notes: 'Work from home productivity upgrade',
    },
    {
      user: userId,
      type: 'expense',
      amount: 3400,
      category: 'Entertainment',
      description: 'Concert Tickets & Gaming Subscription',
      date: currentMonthDate(17),
      paymentMethod: 'UPI / NetBanking',
    },
    {
      user: userId,
      type: 'expense',
      amount: 2800,
      category: 'Health & Fitness',
      description: 'Gym Membership & Whey Protein',
      date: currentMonthDate(9),
      paymentMethod: 'UPI / NetBanking',
    },
    {
      user: userId,
      type: 'expense',
      amount: 1500,
      category: 'Education',
      description: 'Cloud Certification Practice Exams',
      date: currentMonthDate(16),
      paymentMethod: 'Credit Card',
    },
  ];

  await Transaction.insertMany(sampleTransactions);

  // 3. Realistic Budgets for Current Month
  // Food: 15,000 (spent 13,600 = ~90% -> triggers caution warning)
  // Shopping: 8,000 (spent 8,200 = >100% -> triggers exceeded warning)
  // Transportation: 6,000 (spent 4,100 = 68% -> healthy green)
  // Utilities & Bills: 5,000 (spent 3,950 = 79% -> healthy green)
  // Entertainment: 4,000 (spent 3,400 = 85% -> triggers caution warning)
  // Health & Fitness: 4,000 (spent 2,800 = 70% -> healthy green)
  const sampleBudgets = [
    {
      user: userId,
      category: 'Food & Dining',
      monthlyLimit: 15000,
      month: currentMonth,
      year: currentYear,
    },
    {
      user: userId,
      category: 'Shopping',
      monthlyLimit: 8000,
      month: currentMonth,
      year: currentYear,
    },
    {
      user: userId,
      category: 'Transportation',
      monthlyLimit: 6000,
      month: currentMonth,
      year: currentYear,
    },
    {
      user: userId,
      category: 'Utilities & Bills',
      monthlyLimit: 5000,
      month: currentMonth,
      year: currentYear,
    },
    {
      user: userId,
      category: 'Entertainment',
      monthlyLimit: 4000,
      month: currentMonth,
      year: currentYear,
    },
    {
      user: userId,
      category: 'Health & Fitness',
      monthlyLimit: 4000,
      month: currentMonth,
      year: currentYear,
    },
  ];

  await Budget.insertMany(sampleBudgets);

  // 4. Sample Savings Goals with history
  const sampleSavingsGoals = [
    {
      user: userId,
      name: 'Emergency Fund (6 Months)',
      targetAmount: 150000,
      currentAmount: 110000,
      category: 'Emergency Fund',
      deadline: new Date(currentYear, currentMonth + 3, 15),
      status: 'In Progress',
      contributions: [
        {
          amount: 50000,
          type: 'deposit',
          date: new Date(currentYear, currentMonth - 3, 10),
          note: 'Initial setup from bonus',
        },
        {
          amount: 30000,
          type: 'deposit',
          date: new Date(currentYear, currentMonth - 2, 10),
          note: 'Monthly scheduled savings',
        },
        {
          amount: 30000,
          type: 'deposit',
          date: new Date(currentYear, currentMonth - 1, 10),
          note: 'Monthly allocation',
        },
      ],
    },
    {
      user: userId,
      name: 'New MacBook Pro M3',
      targetAmount: 180000,
      currentAmount: 125000,
      category: 'Gadget',
      deadline: new Date(currentYear, currentMonth + 2, 28),
      status: 'In Progress',
      contributions: [
        {
          amount: 60000,
          type: 'deposit',
          date: new Date(currentYear, currentMonth - 2, 20),
          note: 'Freelance gig milestone deposit',
        },
        {
          amount: 65000,
          type: 'deposit',
          date: new Date(currentYear, currentMonth - 1, 20),
          note: 'Tech fund allocation',
        },
      ],
    },
    {
      user: userId,
      name: 'Japan Autumn Vacation',
      targetAmount: 220000,
      currentAmount: 75000,
      category: 'Travel',
      deadline: new Date(currentYear, currentMonth + 7, 30),
      status: 'In Progress',
      contributions: [
        {
          amount: 40000,
          type: 'deposit',
          date: new Date(currentYear, currentMonth - 2, 25),
          note: 'Flight ticket fund deposit',
        },
        {
          amount: 35000,
          type: 'deposit',
          date: new Date(currentYear, currentMonth - 1, 25),
          note: 'Hotel reservation savings',
        },
      ],
    },
  ];

  await SavingsGoal.insertMany(sampleSavingsGoals);

  // 5. User Settings
  await UserSettings.findOneAndUpdate(
    { user: userId },
    {
      user: userId,
      currency: 'INR',
      monthlyIncomeTarget: 95000,
      monthlyBudgetLimit: 60000,
      theme: 'light',
      spendingAlertThreshold: 80,
      notificationsEnabled: true,
      dateFormat: 'DD/MM/YYYY',
    },
    { upsert: true, new: true }
  );

  return {
    success: true,
    message: 'Demo financial data loaded successfully with transactions, budgets, and savings goals.',
  };
};
