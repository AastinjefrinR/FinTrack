import React, { useState, useEffect, useCallback } from 'react';
import { budgetService } from '../services/budgetService';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';

const BudgetsPage = () => {
  const { user } = useAuth();
  const currency = user?.currency || 'INR';

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal State for adding/editing a budget
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState('Food & Dining');
  const [customCategory, setCustomCategory] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Delete modal state
  const [deleteBudgetId, setDeleteBudgetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const predefinedCategories = [
    'Food & Dining',
    'Transportation',
    'Housing & Rent',
    'Utilities & Bills',
    'Shopping',
    'Entertainment',
    'Health & Fitness',
    'Education',
    'Personal Care',
    'Travel',
    'Custom...',
  ];

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await budgetService.getBudgets({
        month: selectedMonth,
        year: selectedYear,
      });
      if (res.success) {
        setBudgetData(res);
      }
    } catch (err) {
      console.error('Fetch budgets error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleOpenAddModal = (existing = null) => {
    if (existing) {
      setCategory(existing.category);
      setMonthlyLimit(existing.monthlyLimit);
    } else {
      setCategory('Food & Dining');
      setMonthlyLimit('');
    }
    setCustomCategory('');
    setError('');
    setIsModalOpen(true);
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    const finalCategory = category === 'Custom...' ? customCategory.trim() : category;

    if (!finalCategory) {
      setError('Please provide a category name.');
      return;
    }
    if (!monthlyLimit || parseFloat(monthlyLimit) <= 0) {
      setError('Please enter a valid monthly limit greater than zero.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await budgetService.setBudget({
        category: finalCategory,
        monthlyLimit: parseFloat(monthlyLimit),
        month: selectedMonth,
        year: selectedYear,
      });

      if (window.triggerFinTrackToast) {
        window.triggerFinTrackToast(`Budget set for ${finalCategory}!`, 'Budget Allocated');
      }

      setIsModalOpen(false);
      fetchBudgets();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to allocate budget');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBudget = async () => {
    if (!deleteBudgetId) return;
    setIsDeleting(true);
    try {
      await budgetService.deleteBudget(deleteBudgetId);
      if (window.triggerFinTrackToast) {
        window.triggerFinTrackToast('Budget removed.', 'Deleted');
      }
      setDeleteBudgetId(null);
      fetchBudgets();
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsDeleting(false);
    }
  };

  const monthsList = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const summary = budgetData?.summary || {
    totalBudgetLimit: 0,
    totalBudgetSpent: 0,
    totalBudgetRemaining: 0,
    overallPercentage: 0,
  };

  const budgets = budgetData?.budgets || [];

  return (
    <div className="animate-fade-in pb-4">
      {/* Title & Actions */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bolder tracking-tight mb-1">Budget Planning & Limits</h2>
          <p className="text-muted small mb-0">
            Set category spending limits, receive automated 80% and 100% threshold alerts, and control expenses.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Month & Year Selectors */}
          <select
            className="form-select form-select-sm ft-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
          >
            {monthsList.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <select
            className="form-select form-select-sm ft-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button
            className="btn btn-emerald btn-sm d-flex align-items-center gap-1 flex-shrink-0"
            onClick={() => handleOpenAddModal()}
          >
            <i className="bi bi-plus-lg"></i>
            <span>Set Budget</span>
          </button>
        </div>
      </div>

      {/* Monthly Budget Summary Card */}
      <div className="ft-card p-4 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-3">
            <span className="text-muted text-uppercase extra-small fw-bold">Allocated Budget</span>
            <h3 className="fw-bold text-dark mt-1 mb-0">
              {formatCurrency(summary.totalBudgetLimit, currency)}
            </h3>
            <span className="text-muted small">Total monthly limit</span>
          </div>

          <div className="col-md-3">
            <span className="text-muted text-uppercase extra-small fw-bold">Actual Spent</span>
            <h3 className="fw-bold text-danger mt-1 mb-0">
              {formatCurrency(summary.totalBudgetSpent, currency)}
            </h3>
            <span className="text-muted small">Across allocated categories</span>
          </div>

          <div className="col-md-3">
            <span className="text-muted text-uppercase extra-small fw-bold">Remaining Pool</span>
            <h3
              className={`fw-bold mt-1 mb-0 ${
                summary.totalBudgetRemaining >= 0 ? 'text-success' : 'text-danger'
              }`}
            >
              {formatCurrency(summary.totalBudgetRemaining, currency)}
            </h3>
            <span className="text-muted small">
              {summary.totalBudgetRemaining >= 0 ? 'Surplus remaining' : 'Deficit exceeded'}
            </span>
          </div>

          <div className="col-md-3">
            <div className="p-3 rounded bg-light border">
              <div className="d-flex justify-content-between small fw-bold mb-1">
                <span>Overall Usage</span>
                <span>{summary.overallPercentage}%</span>
              </div>
              <div className="progress progress-ft">
                <div
                  className={`progress-bar ${
                    summary.overallPercentage > 100
                      ? 'bg-danger'
                      : summary.overallPercentage >= 80
                      ? 'bg-warning'
                      : 'bg-emerald'
                  }`}
                  style={{ width: `${Math.min(100, summary.overallPercentage)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="row g-3">
        {loading ? (
          <div className="col-12 text-center py-5">
            <div className="spinner-border text-emerald spinner-border-sm me-2" role="status"></div>
            <span className="text-muted small">Loading budgets...</span>
          </div>
        ) : budgets.length === 0 ? (
          <div className="col-12">
            <div className="ft-card p-5 text-center text-muted">
              <i className="bi bi-pie-chart text-secondary fs-1 d-block mb-3"></i>
              <h5 className="fw-bold text-dark mb-1">No Budgets Defined for this Month</h5>
              <p className="small mb-3">
                Establish monthly category limits (Food, Transport, Shopping) to activate real-time threshold monitoring and alerts.
              </p>
              <button className="btn btn-emerald btn-sm px-3" onClick={() => handleOpenAddModal()}>
                <i className="bi bi-plus-circle me-1"></i> Add Your First Budget
              </button>
            </div>
          </div>
        ) : (
          budgets.map((b) => {
            const isExceeded = b.status === 'exceeded';
            const isWarning = b.status === 'warning';

            return (
              <div key={b._id} className="col-md-6 col-lg-4">
                <div className={`ft-card p-4 h-100 ${isExceeded ? 'border-danger' : isWarning ? 'border-warning' : ''}`}>
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <div>
                      <h6 className="fw-bold mb-0 text-dark">{b.category}</h6>
                      <span className="text-muted extra-small" style={{ fontSize: '0.75rem' }}>
                        Limit: {formatCurrency(b.monthlyLimit, currency)}
                      </span>
                    </div>

                    <div className="d-flex align-items-center gap-1">
                      <span
                        className={`badge ${
                          isExceeded
                            ? 'bg-danger text-white'
                            : isWarning
                            ? 'bg-warning text-dark'
                            : 'bg-success text-white'
                        } fw-bold`}
                      >
                        {b.percentage}%
                      </span>
                      <div className="dropdown">
                        <button
                          className="btn btn-light btn-sm border-0 p-1 text-muted"
                          type="button"
                          data-bs-toggle="dropdown"
                        >
                          <i className="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end shadow border-0 small">
                          <li>
                            <button
                              className="dropdown-item py-1"
                              onClick={() => handleOpenAddModal(b)}
                            >
                              <i className="bi bi-pencil me-2"></i> Edit Limit
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item py-1 text-danger"
                              onClick={() => setDeleteBudgetId(b._id)}
                            >
                              <i className="bi bi-trash3 me-2"></i> Delete Budget
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Spent vs Remaining */}
                  <div className="d-flex justify-content-between small mb-2">
                    <span className="text-muted">
                      Spent: <strong className="text-dark">{formatCurrency(b.spent, currency)}</strong>
                    </span>
                    <span className={b.remaining >= 0 ? 'text-success' : 'text-danger'}>
                      {b.remaining >= 0 ? 'Remaining: ' : 'Over by: '}
                      <strong>{formatCurrency(Math.abs(b.remaining), currency)}</strong>
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="progress progress-ft mb-3" style={{ height: '8px' }}>
                    <div
                      className={`progress-bar ${
                        isExceeded ? 'bg-danger' : isWarning ? 'bg-warning' : 'bg-emerald'
                      }`}
                      style={{ width: `${Math.min(100, b.percentage)}%` }}
                    ></div>
                  </div>

                  {/* Smart Alert Badge Notification inside Card */}
                  {isExceeded ? (
                    <div className="alert alert-danger py-1 px-2 small mb-0 d-flex align-items-center gap-1" style={{ fontSize: '0.78rem' }}>
                      <i className="bi bi-exclamation-octagon-fill"></i>
                      <span><strong>Exceeded!</strong> Spending is {b.percentage}% of limit.</span>
                    </div>
                  ) : isWarning ? (
                    <div className="alert alert-warning py-1 px-2 small mb-0 d-flex align-items-center gap-1" style={{ fontSize: '0.78rem' }}>
                      <i className="bi bi-exclamation-triangle-fill"></i>
                      <span><strong>Caution:</strong> Approaching limit ({b.percentage}% used).</span>
                    </div>
                  ) : (
                    <div className="alert alert-success py-1 px-2 small mb-0 d-flex align-items-center gap-1 text-success bg-success-subtle border-0" style={{ fontSize: '0.78rem' }}>
                      <i className="bi bi-check-circle-fill"></i>
                      <span>On track: {formatCurrency(b.remaining, currency)} available.</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Set / Edit Budget Modal */}
      {isModalOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content ft-card border-0 shadow-xl">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Set Monthly Category Budget</h5>
                <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
              </div>

              <form onSubmit={handleSaveBudget}>
                <div className="modal-body p-4">
                  {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Category *</label>
                    <select
                      className="form-select ft-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {predefinedCategories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {category === 'Custom...' && (
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-muted">Custom Category Name *</label>
                      <input
                        type="text"
                        className="form-control ft-input"
                        placeholder="e.g. Gym & Supplements"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Monthly Spending Limit (₹) *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light fw-bold">₹</span>
                      <input
                        type="number"
                        step="1"
                        className="form-control ft-input"
                        placeholder="e.g. 15000"
                        value={monthlyLimit}
                        onChange={(e) => setMonthlyLimit(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                    <span className="text-muted extra-small" style={{ fontSize: '0.72rem' }}>
                      Automated warnings will trigger at 80% usage and when exceeded.
                    </span>
                  </div>
                </div>

                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-emerald" disabled={saving}>
                    {saving ? 'Allocating...' : 'Set Budget'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteBudgetId && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content ft-card border-0 shadow-xl">
              <div className="modal-body p-4 text-center">
                <i className="bi bi-trash3-fill text-danger fs-1 mb-2 d-block"></i>
                <h5 className="fw-bold mb-1">Delete Budget Limit?</h5>
                <p className="text-muted small mb-4">
                  This limit will be removed from your monthly planning.
                </p>
                <div className="d-flex justify-content-center gap-2">
                  <button
                    type="button"
                    className="btn btn-light btn-sm px-3"
                    onClick={() => setDeleteBudgetId(null)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm px-3"
                    onClick={handleDeleteBudget}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Removing...' : 'Confirm'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetsPage;
