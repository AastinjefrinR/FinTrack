import React from 'react';
import { formatCurrency } from '../utils/formatters';

const SpendingComparison = ({ analyticsData, currency = 'INR' }) => {
  if (!analyticsData || !analyticsData.comparison) return null;

  const { currentMonth, previousMonth, comparison } = analyticsData;
  const isSpendingReduced = comparison.expenseDiff <= 0;

  return (
    <div className="ft-card p-4 h-100">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
          <i className="bi bi-clock-history text-emerald"></i>
          <span>Period Comparison</span>
        </h6>
        <span
          className={`badge ${
            isSpendingReduced ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'
          } rounded-pill px-2 py-1 fw-bold`}
        >
          {comparison.expenseChangePct > 0
            ? `+${comparison.expenseChangePct}%`
            : `${comparison.expenseChangePct}%`}
        </span>
      </div>

      <div className="row g-3 mb-3">
        {/* Current Month Box */}
        <div className="col-6">
          <div className="p-3 rounded bg-light border">
            <span className="text-muted extra-small d-block text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>
              {currentMonth.label} (Current)
            </span>
            <div className="fw-bold fs-5 text-dark mt-1">
              {formatCurrency(currentMonth.expense, currency)}
            </div>
            <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
              Income: {formatCurrency(currentMonth.income, currency)}
            </div>
          </div>
        </div>

        {/* Previous Month Box */}
        <div className="col-6">
          <div className="p-3 rounded bg-light border">
            <span className="text-muted extra-small d-block text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>
              {previousMonth.label} (Previous)
            </span>
            <div className="fw-bold fs-5 text-secondary mt-1">
              {formatCurrency(previousMonth.expense, currency)}
            </div>
            <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
              Income: {formatCurrency(previousMonth.income, currency)}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Narrative */}
      <div
        className={`p-2 px-3 rounded small d-flex align-items-center gap-2 ${
          isSpendingReduced
            ? 'bg-success-subtle text-success'
            : 'bg-warning-subtle text-dark'
        }`}
      >
        <i
          className={`bi ${
            isSpendingReduced ? 'bi-arrow-down-circle-fill text-success' : 'bi-arrow-up-circle-fill text-danger'
          }`}
        ></i>
        <span>
          {isSpendingReduced
            ? `You have spent ${formatCurrency(Math.abs(comparison.expenseDiff), currency)} less than in ${previousMonth.label}. Excellent discipline!`
            : `Spending is higher by ${formatCurrency(comparison.expenseDiff, currency)} compared to ${previousMonth.label}.`}
        </span>
      </div>
    </div>
  );
};

export default SpendingComparison;
