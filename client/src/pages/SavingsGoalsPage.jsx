import React, { useState, useEffect, useCallback } from 'react';
import { savingsService } from '../services/savingsService';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';

const SavingsGoalsPage = () => {
  const { user } = useAuth();
  const currency = user?.currency || 'INR';

  const [goalsData, setGoalsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Create/Edit Goal Modal
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [goalForm, setGoalForm] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    category: 'Emergency Fund',
  });

  // Contribute Modal
  const [contributeGoal, setContributeGoal] = useState(null);
  const [contribType, setContribType] = useState('deposit');
  const [contribAmount, setContribAmount] = useState('');
  const [contribNote, setContribNote] = useState('');

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await savingsService.getGoals();
      if (res.success) {
        setGoalsData(res);
      }
    } catch (err) {
      console.error('Fetch savings goals error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleOpenGoalModal = (goal = null) => {
    setEditingGoal(goal);
    if (goal) {
      setGoalForm({
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        deadline: new Date(goal.deadline).toISOString().split('T')[0],
        category: goal.category,
      });
    } else {
      setGoalForm({
        name: '',
        targetAmount: '',
        currentAmount: '',
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'Emergency Fund',
      });
    }
    setModalError('');
    setIsGoalModalOpen(true);
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    if (!goalForm.name.trim() || !goalForm.targetAmount || !goalForm.deadline) {
      setModalError('Please fill in goal name, target amount, and deadline.');
      return;
    }

    setSaving(true);
    setModalError('');
    try {
      if (editingGoal) {
        await savingsService.updateGoal(editingGoal._id, {
          name: goalForm.name,
          targetAmount: parseFloat(goalForm.targetAmount),
          deadline: goalForm.deadline,
          category: goalForm.category,
        });
        if (window.triggerFinTrackToast) {
          window.triggerFinTrackToast('Savings goal updated.', 'Saved');
        }
      } else {
        await savingsService.createGoal({
          name: goalForm.name,
          targetAmount: parseFloat(goalForm.targetAmount),
          currentAmount: parseFloat(goalForm.currentAmount) || 0,
          deadline: goalForm.deadline,
          category: goalForm.category,
        });
        if (window.triggerFinTrackToast) {
          window.triggerFinTrackToast('New savings target created!', 'Goal Added');
        }
      }

      setIsGoalModalOpen(false);
      fetchGoals();
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to save savings goal');
    } finally {
      setSaving(false);
    }
  };

  const handleContributeSubmit = async (e) => {
    e.preventDefault();
    if (!contribAmount || parseFloat(contribAmount) <= 0) {
      setModalError('Amount must be greater than zero.');
      return;
    }

    setSaving(true);
    setModalError('');
    try {
      await savingsService.addContribution(contributeGoal._id, {
        amount: parseFloat(contribAmount),
        type: contribType,
        note: contribNote,
      });

      if (window.triggerFinTrackToast) {
        window.triggerFinTrackToast(
          `${contribType === 'deposit' ? 'Added' : 'Withdrew'} ₹${parseFloat(contribAmount).toLocaleString('en-IN')}`,
          'Goal Updated'
        );
      }

      setContributeGoal(null);
      setContribAmount('');
      setContribNote('');
      fetchGoals();
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Contribution failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGoal = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await savingsService.deleteGoal(deleteId);
      if (window.triggerFinTrackToast) {
        window.triggerFinTrackToast('Savings goal removed.', 'Deleted');
      }
      setDeleteId(null);
      fetchGoals();
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsDeleting(false);
    }
  };

  const summary = goalsData?.summary || {
    totalGoals: 0,
    totalTarget: 0,
    totalSaved: 0,
    totalRemaining: 0,
    overallProgress: 0,
  };

  const goals = goalsData?.goals || [];

  return (
    <div className="animate-fade-in pb-4">
      {/* Title & Add Goal Button */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bolder tracking-tight mb-1">Savings Goal Tracker</h2>
          <p className="text-muted small mb-0">
            Design targeted emergency funds, travel reserves, and equipment goals with live deposit tracking.
          </p>
        </div>

        <button
          className="btn btn-emerald btn-sm d-flex align-items-center gap-1 shadow-sm"
          onClick={() => handleOpenGoalModal()}
        >
          <i className="bi bi-plus-circle-fill"></i>
          <span>Create New Goal</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="ft-card p-4 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-3">
            <span className="text-muted text-uppercase extra-small fw-bold">Total Target</span>
            <h3 className="fw-bold text-dark mt-1 mb-0">
              {formatCurrency(summary.totalTarget, currency)}
            </h3>
            <span className="text-muted small">Across {summary.totalGoals} goals</span>
          </div>

          <div className="col-md-3">
            <span className="text-muted text-uppercase extra-small fw-bold">Current Accumulated</span>
            <h3 className="fw-bold text-emerald mt-1 mb-0">
              {formatCurrency(summary.totalSaved, currency)}
            </h3>
            <span className="text-muted small">Saved in reserve</span>
          </div>

          <div className="col-md-3">
            <span className="text-muted text-uppercase extra-small fw-bold">Remaining Target</span>
            <h3 className="fw-bold text-secondary mt-1 mb-0">
              {formatCurrency(summary.totalRemaining, currency)}
            </h3>
            <span className="text-muted small">Needed to reach 100%</span>
          </div>

          <div className="col-md-3">
            <div className="p-3 rounded bg-light border">
              <div className="d-flex justify-content-between small fw-bold mb-1">
                <span>Overall Completion</span>
                <span className="text-emerald">{summary.overallProgress}%</span>
              </div>
              <div className="progress progress-ft">
                <div
                  className="progress-bar bg-emerald"
                  style={{ width: `${Math.min(100, summary.overallProgress)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Goals Cards Grid */}
      <div className="row g-3">
        {loading ? (
          <div className="col-12 text-center py-5">
            <div className="spinner-border text-emerald spinner-border-sm me-2" role="status"></div>
            <span className="text-muted small">Loading savings targets...</span>
          </div>
        ) : goals.length === 0 ? (
          <div className="col-12">
            <div className="ft-card p-5 text-center text-muted">
              <i className="bi bi-piggy-bank text-secondary fs-1 d-block mb-3"></i>
              <h5 className="fw-bold text-dark mb-1">No Active Savings Goals</h5>
              <p className="small mb-3">
                Establish targeted goals (e.g. Emergency Fund, Laptop, Vacation) to build consistent wealth.
              </p>
              <button className="btn btn-emerald btn-sm px-3" onClick={() => handleOpenGoalModal()}>
                <i className="bi bi-plus-circle me-1"></i> Create Your First Goal
              </button>
            </div>
          </div>
        ) : (
          goals.map((g) => {
            const isCompleted = g.currentAmount >= g.targetAmount;

            return (
              <div key={g._id} className="col-md-6 col-lg-4">
                <div className={`ft-card p-4 h-100 ${isCompleted ? 'border-success' : ''}`}>
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <div>
                      <span className="badge bg-light text-secondary border extra-small mb-1">
                        {g.category}
                      </span>
                      <h5 className="fw-bold mb-0 text-dark">{g.name}</h5>
                    </div>

                    <div className="d-flex align-items-center gap-1">
                      <span
                        className={`badge ${
                          isCompleted ? 'bg-success text-white' : 'bg-emerald-subtle text-emerald'
                        } fw-bold`}
                      >
                        {isCompleted ? 'Completed' : `${g.progress}%`}
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
                            <button className="dropdown-item py-1" onClick={() => handleOpenGoalModal(g)}>
                              <i className="bi bi-pencil me-2"></i> Edit Goal
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item py-1 text-danger"
                              onClick={() => setDeleteId(g._id)}
                            >
                              <i className="bi bi-trash3 me-2"></i> Delete Goal
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="d-flex justify-content-between align-items-baseline mb-2">
                    <div>
                      <span className="text-muted extra-small d-block">Saved so far</span>
                      <h4 className="fw-bold text-emerald mb-0">
                        {formatCurrency(g.currentAmount, currency)}
                      </h4>
                    </div>
                    <div className="text-end">
                      <span className="text-muted extra-small d-block">Target</span>
                      <span className="fw-semibold text-dark">
                        {formatCurrency(g.targetAmount, currency)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="progress progress-ft mb-3" style={{ height: '8px' }}>
                    <div
                      className={`progress-bar ${isCompleted ? 'bg-success' : 'bg-emerald'}`}
                      style={{ width: `${Math.min(100, g.progress)}%` }}
                    ></div>
                  </div>

                  {/* Deadline & Remaining trajectory */}
                  <div className="d-flex justify-content-between small text-muted mb-3 border-top pt-2" style={{ fontSize: '0.78rem' }}>
                    <span>
                      <i className="bi bi-calendar-event me-1"></i>
                      Due: {formatDate(g.deadline, 'DD MMM YYYY')}
                    </span>
                    <span>
                      {g.daysLeft > 0 ? `${g.daysLeft} days remaining` : 'Deadline reached'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-emerald w-100 d-flex align-items-center justify-content-center gap-1"
                      onClick={() => {
                        setContributeGoal(g);
                        setContribType('deposit');
                        setModalError('');
                      }}
                    >
                      <i className="bi bi-plus-lg"></i>
                      <span>Deposit</span>
                    </button>
                    <button
                      className="btn btn-sm btn-light border w-100 d-flex align-items-center justify-content-center gap-1 text-muted"
                      onClick={() => {
                        setContributeGoal(g);
                        setContribType('withdrawal');
                        setModalError('');
                      }}
                    >
                      <i className="bi bi-dash-lg"></i>
                      <span>Withdraw</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit Goal Modal */}
      {isGoalModalOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content ft-card border-0 shadow-xl">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">
                  {editingGoal ? 'Edit Savings Goal' : 'Create New Savings Goal'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setIsGoalModalOpen(false)}></button>
              </div>

              <form onSubmit={handleSaveGoal}>
                <div className="modal-body p-4">
                  {modalError && <div className="alert alert-danger py-2 small mb-3">{modalError}</div>}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Goal Title *</label>
                    <input
                      type="text"
                      className="form-control ft-input"
                      placeholder="e.g. Emergency Fund (6 Months)"
                      value={goalForm.name}
                      onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                      required
                      autoFocus
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Target Amount (₹) *</label>
                      <input
                        type="number"
                        step="1"
                        className="form-control ft-input"
                        placeholder="e.g. 150000"
                        value={goalForm.targetAmount}
                        onChange={(e) => setGoalForm({ ...goalForm, targetAmount: e.target.value })}
                        required
                      />
                    </div>
                    {!editingGoal && (
                      <div className="col-6">
                        <label className="form-label small fw-semibold text-muted">Initial Savings (₹)</label>
                        <input
                          type="number"
                          step="1"
                          className="form-control ft-input"
                          placeholder="0"
                          value={goalForm.currentAmount}
                          onChange={(e) => setGoalForm({ ...goalForm, currentAmount: e.target.value })}
                        />
                      </div>
                    )}
                  </div>

                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Target Date *</label>
                      <input
                        type="date"
                        className="form-control ft-input"
                        value={goalForm.deadline}
                        onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Category</label>
                      <select
                        className="form-select ft-select"
                        value={goalForm.category}
                        onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value })}
                      >
                        <option value="Emergency Fund">Emergency Fund</option>
                        <option value="Gadget">Gadget / Tech</option>
                        <option value="Travel">Vacation / Travel</option>
                        <option value="Vehicle">Vehicle / Bike</option>
                        <option value="Home">Home & Renovation</option>
                        <option value="Education">Education & Courses</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setIsGoalModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-emerald" disabled={saving}>
                    {saving ? 'Saving...' : editingGoal ? 'Update Goal' : 'Create Goal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Contribution (Deposit/Withdrawal) Modal */}
      {contributeGoal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content ft-card border-0 shadow-xl">
              <div className="modal-header border-bottom">
                <h6 className="modal-title fw-bold">
                  {contribType === 'deposit' ? 'Add Deposit to' : 'Withdraw from'}:{' '}
                  <span className="text-emerald">{contributeGoal.name}</span>
                </h6>
                <button type="button" className="btn-close" onClick={() => setContributeGoal(null)}></button>
              </div>

              <form onSubmit={handleContributeSubmit}>
                <div className="modal-body p-3">
                  {modalError && <div className="alert alert-danger py-2 small mb-3">{modalError}</div>}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Amount (₹) *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light fw-bold">₹</span>
                      <input
                        type="number"
                        step="1"
                        className="form-control ft-input"
                        placeholder="e.g. 5000"
                        value={contribAmount}
                        onChange={(e) => setContribAmount(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Note / Memo</label>
                    <input
                      type="text"
                      className="form-control ft-input"
                      placeholder="e.g. Freelance gig allocation"
                      value={contribNote}
                      onChange={(e) => setContribNote(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer border-top p-2">
                  <button type="button" className="btn btn-light btn-sm" onClick={() => setContributeGoal(null)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn btn-sm ${contribType === 'deposit' ? 'btn-emerald' : 'btn-danger'}`}
                    disabled={saving}
                  >
                    {saving ? 'Processing...' : contribType === 'deposit' ? 'Record Deposit' : 'Record Withdrawal'}
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
                <h5 className="fw-bold mb-1">Delete Savings Goal?</h5>
                <p className="text-muted small mb-4">
                  This goal and its contribution ledger will be removed.
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
                    onClick={handleDeleteGoal}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Confirm'}
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

export default SavingsGoalsPage;
