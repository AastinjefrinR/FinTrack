import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

import { reportService } from '../services/reportService';
import { insightsService } from '../services/insightsService';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';

import FinancialHealthScore from '../components/FinancialHealthScore';
import SpendingAlerts from '../components/SpendingAlerts';
import SpendingComparison from '../components/SpendingComparison';
import PersonalizedTips from '../components/PersonalizedTips';
import DemoModeBanner from '../components/DemoModeBanner';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DashboardPage = () => {
  const { user } = useAuth();
  const currency = user?.currency || 'INR';

  const [period, setPeriod] = useState('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const [dashboardData, setDashboardData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [insightsData, setInsightsData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [dashRes, analyticsRes, insightsRes] = await Promise.all([
        reportService.getDashboardSummary({
          period,
          startDate: period === 'custom' ? customStart : undefined,
          endDate: period === 'custom' ? customEnd : undefined,
        }),
        reportService.getDetailedAnalytics(),
        insightsService.getInsightsAndHealthScore(),
      ]);

      if (dashRes.success) setDashboardData(dashRes);
      if (analyticsRes.success) setAnalyticsData(analyticsRes);
      if (insightsRes.success) setInsightsData(insightsRes);
    } catch (err) {
      console.error('Dashboard Fetch Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [period, customStart, customEnd]);

  useEffect(() => {
    loadData();

    // Listen for cross-component data updates (e.g., Quick Add or Demo Mode trigger)
    const handleDataUpdate = () => loadData();
    window.addEventListener('fintrack_data_updated', handleDataUpdate);
    return () => window.removeEventListener('fintrack_data_updated', handleDataUpdate);
  }, [loadData]);

  if (loading && !dashboardData) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-emerald" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading dashboard...</span>
        </div>
        <p className="text-muted mt-3 fw-semibold">Loading live financial records from MongoDB...</p>
      </div>
    );
  }

  const kpi = dashboardData?.kpi || {
    totalIncome: 0,
    totalExpense: 0,
    currentBalance: 0,
    savingsRate: 0,
    totalBudgetLimit: 0,
    totalBudgetSpent: 0,
    budgetUsagePercent: 0,
  };

  const hasNoData = kpi.totalIncome === 0 && kpi.totalExpense === 0;

  // Chart 1: Income vs Expense comparison (Bar)
  const barChartData = {
    labels: (dashboardData?.monthlyTrends || []).map((m) => m.month),
    datasets: [
      {
        label: 'Income',
        data: (dashboardData?.monthlyTrends || []).map((m) => m.income),
        backgroundColor: '#10b981',
        borderRadius: 6,
      },
      {
        label: 'Expense',
        data: (dashboardData?.monthlyTrends || []).map((m) => m.expense),
        backgroundColor: '#ef4444',
        borderRadius: 6,
      },
    ],
  };

  // Chart 2: Category Expense Breakdown (Doughnut)
  const categoryLabels = (dashboardData?.categoryBreakdown || []).map((c) => c.category);
  const categoryValues = (dashboardData?.categoryBreakdown || []).map((c) => c.amount);

  const doughnutColors = [
    '#10b981', '#06b6d4', '#3b82f6', '#6366f1',
    '#8b5cf6', '#d946ef', '#f43f5e', '#f59e0b',
    '#84cc16', '#64748b',
  ];

  const doughnutChartData = {
    labels: categoryLabels.length > 0 ? categoryLabels : ['No Expenses Recorded'],
    datasets: [
      {
        data: categoryValues.length > 0 ? categoryValues : [1],
        backgroundColor: categoryValues.length > 0 ? doughnutColors.slice(0, categoryLabels.length) : ['#e2e8f0'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  return (
    <div className="animate-fade-in pb-4">
      {/* Header & Date Range Filter Bar */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bolder tracking-tight mb-1">
            Financial Dashboard
          </h2>
          <p className="text-muted small mb-0">
            Real-time financial performance and budget allocations for <strong>{user?.name}</strong>.
          </p>
        </div>

        {/* Period Filter Buttons */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="btn-group shadow-sm" role="group">
            <button
              type="button"
              className={`btn btn-sm ${period === 'this_month' ? 'btn-emerald' : 'btn-light border'}`}
              onClick={() => setPeriod('this_month')}
            >
              This Month
            </button>
            <button
              type="button"
              className={`btn btn-sm ${period === 'last_month' ? 'btn-emerald' : 'btn-light border'}`}
              onClick={() => setPeriod('last_month')}
            >
              Last Month
            </button>
            <button
              type="button"
              className={`btn btn-sm ${period === 'last_3_months' ? 'btn-emerald' : 'btn-light border'}`}
              onClick={() => setPeriod('last_3_months')}
            >
              3 Months
            </button>
            <button
              type="button"
              className={`btn btn-sm ${period === 'custom' ? 'btn-emerald' : 'btn-light border'}`}
              onClick={() => setPeriod('custom')}
            >
              Custom
            </button>
          </div>

          {period === 'custom' && (
            <div className="d-flex align-items-center gap-2 mt-2 mt-md-0">
              <input
                type="date"
                className="form-control form-control-sm ft-input"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
              />
              <span className="text-muted small">to</span>
              <input
                type="date"
                className="form-control form-control-sm ft-input"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
              <button className="btn btn-sm btn-emerald" onClick={loadData}>
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-4">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Demo Mode Banner when evaluating */}
      <DemoModeBanner onDataLoaded={loadData} />

      {/* Top 4 KPI Metric Cards */}
      <div className="row g-3 mb-4">
        {/* KPI 1: Income */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="ft-card p-3 h-100 border-start border-4 border-success">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted text-uppercase fw-semibold extra-small" style={{ fontSize: '0.75rem' }}>
                Total Inflow
              </span>
              <span className="badge bg-success-subtle text-success p-2 rounded-circle">
                <i className="bi bi-arrow-down-left"></i>
              </span>
            </div>
            <h3 className="fw-bold text-success mb-1">
              {formatCurrency(kpi.totalIncome, currency)}
            </h3>
            <span className="text-muted extra-small" style={{ fontSize: '0.72rem' }}>
              Recorded income in period
            </span>
          </div>
        </div>

        {/* KPI 2: Expense */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="ft-card p-3 h-100 border-start border-4 border-danger">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted text-uppercase fw-semibold extra-small" style={{ fontSize: '0.75rem' }}>
                Total Outflow
              </span>
              <span className="badge bg-danger-subtle text-danger p-2 rounded-circle">
                <i className="bi bi-arrow-up-right"></i>
              </span>
            </div>
            <h3 className="fw-bold text-danger mb-1">
              {formatCurrency(kpi.totalExpense, currency)}
            </h3>
            <span className="text-muted extra-small" style={{ fontSize: '0.72rem' }}>
              Sum of expense transactions
            </span>
          </div>
        </div>

        {/* KPI 3: Net Balance */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="ft-card p-3 h-100 border-start border-4 border-primary">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted text-uppercase fw-semibold extra-small" style={{ fontSize: '0.75rem' }}>
                Current Net Balance
              </span>
              <span className="badge bg-primary-subtle text-primary p-2 rounded-circle">
                <i className="bi bi-wallet2"></i>
              </span>
            </div>
            <h3 className={`fw-bold mb-1 ${kpi.currentBalance >= 0 ? 'text-dark' : 'text-danger'}`}>
              {formatCurrency(kpi.currentBalance, currency)}
            </h3>
            <span className="text-muted extra-small" style={{ fontSize: '0.72rem' }}>
              Income − Total Expenses
            </span>
          </div>
        </div>

        {/* KPI 4: Savings Rate */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="ft-card p-3 h-100 border-start border-4 border-info">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted text-uppercase fw-semibold extra-small" style={{ fontSize: '0.75rem' }}>
                Savings Rate
              </span>
              <span className="badge bg-info-subtle text-info p-2 rounded-circle">
                <i className="bi bi-piggy-bank"></i>
              </span>
            </div>
            <h3 className="fw-bold text-dark mb-1">
              {kpi.savingsRate}%
            </h3>
            <div className="progress progress-ft mt-2" style={{ height: '6px' }}>
              <div
                className="progress-bar bg-info"
                style={{ width: `${Math.max(0, Math.min(100, kpi.savingsRate))}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Spending Alerts Banner (Innovation Feature #1) */}
      <SpendingAlerts alerts={insightsData?.alerts} />

      {/* Innovation Row: Financial Health Score & Spending Comparison */}
      <div className="row g-3 mb-4">
        <div className="col-lg-6">
          <FinancialHealthScore healthScore={insightsData?.healthScore} />
        </div>
        <div className="col-lg-6">
          <SpendingComparison analyticsData={analyticsData} currency={currency} />
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="row g-3 mb-4">
        {/* Cashflow Trends (Bar Chart) */}
        <div className="col-lg-8">
          <div className="ft-card p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h5 className="fw-bold mb-0">Income vs. Expense Trend</h5>
                <span className="text-muted small">6-Month historical cashflow dynamics</span>
              </div>
              <span className="badge bg-light text-muted border">Chart.js</span>
            </div>
            <div style={{ minHeight: '280px', maxHeight: '340px' }}>
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.raw, currency)}`,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Category Breakdown (Doughnut Chart) */}
        <div className="col-lg-4">
          <div className="ft-card p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h5 className="fw-bold mb-0">Expense Distribution</h5>
                <span className="text-muted small">By category allocation</span>
              </div>
              <span className="badge bg-light text-muted border">Distribution</span>
            </div>
            <div style={{ minHeight: '220px', maxHeight: '250px' }}>
              <Doughnut
                data={doughnutChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => ` ${ctx.label}: ${formatCurrency(ctx.raw, currency)}`,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Transactions & Personalized Financial Tips */}
      <div className="row g-3">
        {/* Recent Transactions Table */}
        <div className="col-lg-7">
          <div className="ft-card p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h5 className="fw-bold mb-0">Recent Transactions</h5>
                <span className="text-muted small">Latest ledger entries from MongoDB</span>
              </div>
              <Link to="/transactions" className="btn btn-sm btn-outline-emerald">
                View All &rarr;
              </Link>
            </div>

            {dashboardData?.recentTransactions && dashboardData.recentTransactions.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover align-middle small mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th className="text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentTransactions.map((tx) => (
                      <tr key={tx._id}>
                        <td className="text-muted">{formatDate(tx.date, 'DD MMM YYYY')}</td>
                        <td>
                          <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '180px' }}>
                            {tx.description}
                          </div>
                          <span className="extra-small text-muted" style={{ fontSize: '0.7rem' }}>
                            {tx.paymentMethod}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-light text-secondary border">
                            {tx.category}
                          </span>
                        </td>
                        <td className="text-end fw-bold">
                          <span className={tx.type === 'income' ? 'text-success' : 'text-danger'}>
                            {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount, currency)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-muted">
                <i className="bi bi-inbox fs-2 text-secondary d-block mb-2"></i>
                <p className="mb-2">No transactions recorded yet.</p>
                <Link to="/transactions" className="btn btn-sm btn-emerald">
                  Add Your First Transaction
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Personalized Tips & Insights (Innovation #6) */}
        <div className="col-lg-5">
          <PersonalizedTips
            tips={insightsData?.tips}
            insights={insightsData?.insights}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
