import React, { useState, useEffect, useCallback } from 'react';
import { transactionService } from '../services/transactionService';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';

const TransactionsPage = () => {
  const { user } = useAuth();
  const currency = user?.currency || 'INR';

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Filters & Search
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Edit/Delete Modal States
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form State for Editing/Adding
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: 'Food & Dining',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'UPI / NetBanking',
    notes: '',
  });

  const categories = [
    'All',
    'Food & Dining',
    'Transportation',
    'Housing & Rent',
    'Utilities & Bills',
    'Shopping',
    'Entertainment',
    'Health & Fitness',
    'Education',
    'Salary',
    'Freelance',
    'Investments',
    'Other',
  ];

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await transactionService.getTransactions({
        page,
        limit,
        type: typeFilter || undefined,
        category: categoryFilter !== 'All' ? categoryFilter : undefined,
        search: search.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sortBy,
        sortOrder,
      });

      if (res.success) {
        setTransactions(res.transactions);
        setTotalCount(res.total);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.error('Fetch transactions error:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, typeFilter, categoryFilter, search, startDate, endDate, sortBy, sortOrder]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleOpenEdit = (tx) => {
    setEditingTransaction(tx);
    setFormData({
      type: tx.type,
      amount: tx.amount,
      category: tx.category,
      description: tx.description,
      date: new Date(tx.date).toISOString().split('T')[0],
      paymentMethod: tx.paymentMethod,
      notes: tx.notes || '',
    });
    setModalError('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setModalError('Amount must be greater than zero.');
      return;
    }
    if (!formData.description.trim()) {
      setModalError('Description cannot be empty.');
      return;
    }

    setIsSaving(true);
    setModalError('');
    try {
      await transactionService.updateTransaction(editingTransaction._id, {
        ...formData,
        amount: parseFloat(formData.amount),
      });

      if (window.triggerFinTrackToast) {
        window.triggerFinTrackToast('Transaction updated successfully.', 'Changes Saved');
      }

      setEditingTransaction(null);
      fetchTransactions();
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to update transaction');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await transactionService.deleteTransaction(deleteId);
      if (window.triggerFinTrackToast) {
        window.triggerFinTrackToast('Transaction deleted permanently.', 'Deleted');
      }
      setDeleteId(null);
      fetchTransactions();
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      await transactionService.downloadCsv({
        type: typeFilter || undefined,
        category: categoryFilter !== 'All' ? categoryFilter : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      if (window.triggerFinTrackToast) {
        window.triggerFinTrackToast('Transactions CSV file exported!', 'Export Complete');
      }
    } catch (err) {
      alert('Export failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleResetFilters = () => {
    setTypeFilter('');
    setCategoryFilter('All');
    setSearch('');
    setStartDate('');
    setEndDate('');
    setSortBy('date');
    setSortOrder('desc');
    setPage(1);
  };

  return (
    <div className="animate-fade-in pb-4">
      {/* Title & CSV Export Action */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bolder tracking-tight mb-1">Transaction Ledger</h2>
          <p className="text-muted small mb-0">
            Search, filter, edit, sort, and export all recorded income and expenditure.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-success btn-sm d-flex align-items-center gap-2 shadow-sm"
            onClick={handleExportCsv}
            title="Download CSV report of current filtered view"
          >
            <i className="bi bi-file-earmark-spreadsheet-fill"></i>
            <span>Export to CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="ft-card p-3 mb-4">
        <div className="row g-2 align-items-center">
          {/* Search Box */}
          <div className="col-12 col-md-3">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control ft-input"
                placeholder="Search description, notes..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm ft-select"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Types</option>
              <option value="income">Income Only</option>
              <option value="expense">Expense Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm ft-select"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm ft-select"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so);
                setPage(1);
              }}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="amount-asc">Amount: Low to High</option>
            </select>
          </div>

          {/* Date Range Start & End */}
          <div className="col-6 col-md-2">
            <input
              type="date"
              className="form-control form-control-sm ft-input"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              title="Start Date"
            />
          </div>

          <div className="col-12 col-md-1 d-flex justify-content-end">
            <button
              className="btn btn-sm btn-light border w-100"
              onClick={handleResetFilters}
              title="Reset all filters"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="ft-card p-0 overflow-hidden shadow-sm mb-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light border-bottom">
              <tr className="small text-muted text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>
                <th className="ps-4">Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Description</th>
                <th>Payment</th>
                <th className="text-end">Amount</th>
                <th className="text-center pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div className="spinner-border text-emerald spinner-border-sm me-2" role="status"></div>
                    <span className="text-muted small">Loading records...</span>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <i className="bi bi-inbox fs-2 text-secondary d-block mb-2"></i>
                    No transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx._id}>
                    <td className="ps-4 fw-medium text-muted small">
                      {formatDate(tx.date, 'DD MMM YYYY')}
                    </td>
                    <td>
                      <span className={tx.type === 'income' ? 'badge-income' : 'badge-expense'}>
                        {tx.type === 'income' ? 'Income' : 'Expense'}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-light text-secondary border">
                        {tx.category}
                      </span>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '240px' }}>
                        {tx.description}
                      </div>
                      {tx.notes && (
                        <div className="text-muted extra-small text-truncate" style={{ maxWidth: '240px', fontSize: '0.72rem' }}>
                          {tx.notes}
                        </div>
                      )}
                    </td>
                    <td className="small text-muted">{tx.paymentMethod}</td>
                    <td className="text-end fw-bold">
                      <span className={tx.type === 'income' ? 'text-success' : 'text-danger'}>
                        {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount, currency)}
                      </span>
                    </td>
                    <td className="text-center pe-4">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-light border-0 text-primary p-1"
                          onClick={() => handleOpenEdit(tx)}
                          title="Edit transaction"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button
                          className="btn btn-light border-0 text-danger p-1"
                          onClick={() => setDeleteId(tx._id)}
                          title="Delete transaction"
                        >
                          <i className="bi bi-trash3"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-top d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 small text-muted">
          <span>
            Showing <strong>{transactions.length}</strong> of <strong>{totalCount}</strong> transactions
          </span>
          <div className="btn-group btn-group-sm">
            <button
              className="btn btn-light border"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              &laquo; Previous
            </button>
            <span className="btn btn-light border disabled fw-bold">
              Page {page} of {totalPages}
            </span>
            <button
              className="btn btn-light border"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next &raquo;
            </button>
          </div>
        </div>
      </div>

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content ft-card border-0 shadow-xl">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Edit Transaction</h5>
                <button type="button" className="btn-close" onClick={() => setEditingTransaction(null)}></button>
              </div>

              <form onSubmit={handleSaveEdit}>
                <div className="modal-body p-4">
                  {modalError && (
                    <div className="alert alert-danger py-2 small mb-3">{modalError}</div>
                  )}

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Type</label>
                      <select
                        name="type"
                        className="form-select ft-select"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Amount (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control ft-input"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Category</label>
                      <input
                        type="text"
                        className="form-control ft-input"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Date</label>
                      <input
                        type="date"
                        className="form-control ft-input"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Description</label>
                    <input
                      type="text"
                      className="form-control ft-input"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Payment Method</label>
                      <select
                        className="form-select ft-select"
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      >
                        <option value="UPI / NetBanking">UPI / NetBanking</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Debit Card">Debit Card</option>
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Notes</label>
                      <input
                        type="text"
                        className="form-control ft-input"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setEditingTransaction(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-emerald" disabled={isSaving}>
                    {isSaving ? 'Updating...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content ft-card border-0 shadow-xl">
              <div className="modal-body p-4 text-center">
                <i className="bi bi-trash3-fill text-danger fs-1 mb-2 d-block"></i>
                <h5 className="fw-bold mb-1">Delete Transaction?</h5>
                <p className="text-muted small mb-4">
                  This record will be permanently deleted from MongoDB and cannot be restored.
                </p>
                <div className="d-flex justify-content-center gap-2">
                  <button
                    type="button"
                    className="btn btn-light btn-sm px-3"
                    onClick={() => setDeleteId(null)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm px-3"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Confirm Delete'}
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

export default TransactionsPage;
