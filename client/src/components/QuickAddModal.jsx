import React, { useState } from 'react';
import { transactionService } from '../services/transactionService';

const QuickAddModal = ({ isOpen, onClose, onTransactionAdded }) => {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: 'Food & Dining',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'UPI / NetBanking',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const expenseCategories = [
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
    'Other',
  ];

  const incomeCategories = [
    'Salary',
    'Freelance',
    'Investments',
    'Business',
    'Rental Income',
    'Gift / Grant',
    'Other',
  ];

  const categories = formData.type === 'expense' ? expenseCategories : incomeCategories;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Reset category if switching type
      ...(name === 'type'
        ? { category: value === 'expense' ? 'Food & Dining' : 'Salary' }
        : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount greater than zero.');
      return;
    }

    if (!formData.description.trim()) {
      setError('Please provide a brief description.');
      return;
    }

    setLoading(true);
    try {
      await transactionService.createTransaction({
        ...formData,
        amount: parseFloat(formData.amount),
      });

      if (window.triggerFinTrackToast) {
        window.triggerFinTrackToast(
          `${formData.type === 'income' ? 'Income' : 'Expense'} of ₹${parseFloat(formData.amount).toLocaleString('en-IN')} recorded!`,
          'Transaction Saved'
        );
      }

      // Reset form
      setFormData({
        type: 'expense',
        amount: '',
        category: 'Food & Dining',
        description: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'UPI / NetBanking',
        notes: '',
      });

      if (onTransactionAdded) onTransactionAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content ft-card border-0 shadow-xl">
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
              <span className="badge bg-emerald text-white p-2 rounded-circle">
                <i className="bi bi-plus-lg"></i>
              </span>
              Quick Add Transaction
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {error && (
                <div className="alert alert-danger py-2 small d-flex align-items-center gap-2">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  <span>{error}</span>
                </div>
              )}

              {/* Type Toggle: Income vs Expense */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Transaction Type</label>
                <div className="btn-group w-100" role="group">
                  <button
                    type="button"
                    className={`btn btn-sm ${
                      formData.type === 'expense'
                        ? 'btn-danger fw-bold'
                        : 'btn-outline-secondary'
                    }`}
                    onClick={() =>
                      handleChange({ target: { name: 'type', value: 'expense' } })
                    }
                  >
                    <i className="bi bi-arrow-up-right me-1"></i> Expense
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${
                      formData.type === 'income'
                        ? 'btn-success fw-bold'
                        : 'btn-outline-secondary'
                    }`}
                    onClick={() =>
                      handleChange({ target: { name: 'type', value: 'income' } })
                    }
                  >
                    <i className="bi bi-arrow-down-left me-1"></i> Income
                  </button>
                </div>
              </div>

              {/* Amount & Date */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted">Amount (₹) *</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light fw-bold">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      name="amount"
                      className="form-control ft-input"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                      autoFocus
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted">Date *</label>
                  <input
                    type="date"
                    name="date"
                    className="form-control ft-input"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Category & Payment Method */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted">Category *</label>
                  <select
                    name="category"
                    className="form-select ft-select"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted">Payment Method</label>
                  <select
                    name="paymentMethod"
                    className="form-select ft-select"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                  >
                    <option value="UPI / NetBanking">UPI / NetBanking</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Description *</label>
                <input
                  type="text"
                  name="description"
                  className="form-control ft-input"
                  placeholder="e.g. Grocery shopping at Nature's Basket"
                  value={formData.description}
                  onChange={handleChange}
                  maxLength="200"
                  required
                />
              </div>

              {/* Notes */}
              <div>
                <label className="form-label small fw-semibold text-muted">Notes (Optional)</label>
                <input
                  type="text"
                  name="notes"
                  className="form-control ft-input"
                  placeholder="Additional context or invoice ref..."
                  value={formData.notes}
                  onChange={handleChange}
                  maxLength="500"
                />
              </div>
            </div>

            <div className="modal-footer border-top pt-3">
              <button
                type="button"
                className="btn btn-light"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-emerald px-4 d-flex align-items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle-fill"></i> Save Transaction
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuickAddModal;
