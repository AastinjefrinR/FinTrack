import React, { useState, useEffect, useCallback } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { reportService } from '../services/reportService';
import { transactionService } from '../services/transactionService';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';

const ReportsPage = () => {
  const { user } = useAuth();
  const currency = user?.currency || 'INR';

  const [period, setPeriod] = useState('this_month');
  const [dashboardData, setDashboardData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, analyticsRes] = await Promise.all([
        reportService.getDashboardSummary({ period }),
        reportService.getDetailedAnalytics(),
      ]);

      if (dashRes.success) setDashboardData(dashRes);
      if (analyticsRes.success) setAnalyticsData(analyticsRes);
    } catch (err) {
      console.error('Error fetching analytics reports:', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDownloadCsv = async () => {
    try {
      await transactionService.downloadCsv({});
      if (window.triggerFinTrackToast) {
        window.triggerFinTrackToast('Complete financial CSV report downloaded.', 'Export Ready');
      }
    } catch (err) {
      alert('CSV Export failed: ' + (err.response?.data?.message || err.message));
    }
  };

  // Trend Chart (Line Chart for net savings and cashflow)
  const trendLabels = (dashboardData?.monthlyTrends || []).map((m) => m.month);
  const incomeTrend = (dashboardData?.monthlyTrends || []).map((m) => m.income);
  const expenseTrend = (dashboardData?.monthlyTrends || []).map((m) => m.expense);
  const netSavingsTrend = (dashboardData?.monthlyTrends || []).map((m) => m.netSavings);

  const lineChartData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Net Savings',
        data: netSavingsTrend,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
      },
      {
        label: 'Expense Incurred',
        data: expenseTrend,
        borderColor: '#ef4444',
        borderDash: [5, 5],
        tension: 0.35,
        borderWidth: 2,
      },
      {
        label: 'Income Received',
        data: incomeTrend,
        borderColor: '#06b6d4',
        tension: 0.35,
        borderWidth: 2,
      },
    ],
  };

  // Category Breakdown Doughnut
  const categories = dashboardData?.categoryBreakdown || [];
  const doughnutColors = [
    '#10b981', '#06b6d4', '#3b82f6', '#6366f1',
    '#8b5cf6', '#d946ef', '#f43f5e', '#f59e0b',
    '#84cc16', '#64748b',
  ];

  const doughnutData = {
    labels: categories.map((c) => c.category),
    datasets: [
      {
        data: categories.map((c) => c.amount),
        backgroundColor: doughnutColors.slice(0, categories.length),
        borderWidth: 2,
      },
    ],
  };

  const comp = analyticsData?.comparison || {
    expenseDiff: 0,
    expenseChangePct: 0,
    incomeDiff: 0,
    incomeChangePct: 0,
  };

  return (
    <div className="animate-fade-in pb-4">
      {/* Header & Export Action */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bolder tracking-tight mb-1">Reports & Analytics</h2>
          <p className="text-muted small mb-0">
            Deep-dive financial aggregations, historical cashflow trajectories, and comparative shifts.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Period selector */}
          <div className="btn-group btn-group-sm shadow-sm" role="group">
            <button
              type="button"
              className={`btn ${period === 'this_month' ? 'btn-emerald' : 'btn-light border'}`}
              onClick={() => setPeriod('this_month')}
            >
              This Month
            </button>
            <button
              type="button"
              className={`btn ${period === 'last_month' ? 'btn-emerald' : 'btn-light border'}`}
              onClick={() => setPeriod('last_month')}
            >
              Last Month
            </button>
            <button
              type="button"
              className={`btn ${period === 'last_6_months' ? 'btn-emerald' : 'btn-light border'}`}
              onClick={() => setPeriod('last_6_months')}
            >
              Past 6 Months
            </button>
          </div>

          <button
            className="btn btn-outline-success btn-sm d-flex align-items-center gap-1 shadow-sm"
            onClick={handleDownloadCsv}
          >
            <i className="bi bi-download"></i>
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Comparison Highlights Row */}
      <div className="row g-3 mb-4">
        <div className="col-md-6 col-lg-3">
          <div className="ft-card p-3 h-100">
            <span className="text-muted extra-small text-uppercase fw-bold">Spending Delta vs Last Month</span>
            <h4
              className={`fw-bold mt-1 mb-0 ${
                comp.expenseDiff <= 0 ? 'text-success' : 'text-danger'
              }`}
            >
              {comp.expenseDiff > 0 ? '+' : ''}
              {formatCurrency(comp.expenseDiff, currency)}
            </h4>
            <span className="small text-muted">
              {comp.expenseChangePct > 0 ? `+${comp.expenseChangePct}% increase` : `${comp.expenseChangePct}% decrease`}
            </span>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="ft-card p-3 h-100">
            <span className="text-muted extra-small text-uppercase fw-bold">Income Delta vs Last Month</span>
            <h4
              className={`fw-bold mt-1 mb-0 ${
                comp.incomeDiff >= 0 ? 'text-success' : 'text-danger'
              }`}
            >
              {comp.incomeDiff > 0 ? '+' : ''}
              {formatCurrency(comp.incomeDiff, currency)}
            </h4>
            <span className="small text-muted">
              {comp.incomeChangePct > 0 ? `+${comp.incomeChangePct}% growth` : `${comp.incomeChangePct}% change`}
            </span>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="ft-card p-3 h-100">
            <span className="text-muted extra-small text-uppercase fw-bold">Active Savings Rate</span>
            <h4 className="fw-bold text-dark mt-1 mb-0">
              {dashboardData?.kpi?.savingsRate || 0}%
            </h4>
            <span className="small text-muted">Of income converted to wealth</span>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="ft-card p-3 h-100">
            <span className="text-muted extra-small text-uppercase fw-bold">Top Expense Category</span>
            <h4 className="fw-bold text-dark mt-1 mb-0 text-truncate">
              {categories[0]?.category || 'None'}
            </h4>
            <span className="small text-muted">
              {categories[0] ? formatCurrency(categories[0].amount, currency) : 'No outflows'}
            </span>
          </div>
        </div>
      </div>

      {/* Trajectory Cashflow Line Chart */}
      <div className="ft-card p-4 mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h5 className="fw-bold mb-0">6-Month Wealth Accumulation Trajectory</h5>
            <span className="text-muted small">Tracking Net Savings surplus vs Monthly Outflows</span>
          </div>
          <span className="badge bg-light text-muted border">Chart.js Line</span>
        </div>
        <div style={{ minHeight: '300px', maxHeight: '360px' }}>
          <Line
            data={lineChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'top' },
                tooltip: {
                  callbacks: {
                    label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw, currency)}`,
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Category Expense Table & Doughnut Chart */}
      <div className="row g-3">
        <div className="col-lg-8">
          <div className="ft-card p-4 h-100">
            <h5 className="fw-bold mb-3">Category-Wise Expense Breakdown</h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle small mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Category</th>
                    <th>Transactions</th>
                    <th className="text-end">Total Amount</th>
                    <th className="text-end">% of Total Expenses</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted">
                        No expenses recorded for this period.
                      </td>
                    </tr>
                  ) : (
                    categories.map((c) => (
                      <tr key={c.category}>
                        <td className="fw-semibold text-dark">{c.category}</td>
                        <td className="text-muted">{c.count} transactions</td>
                        <td className="text-end fw-bold text-danger">
                          {formatCurrency(c.amount, currency)}
                        </td>
                        <td className="text-end">
                          <span className="badge bg-light text-dark border fw-bold">
                            {c.percentage}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="ft-card p-4 h-100">
            <h5 className="fw-bold mb-3">Proportional Share</h5>
            <div style={{ minHeight: '260px', maxHeight: '300px' }}>
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
