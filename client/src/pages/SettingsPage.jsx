import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/authService';
import api from '../services/api';

const SettingsPage = () => {
  const { user, reloadUser, logout } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();

  // Profile Form State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');

  // Preferences Form State
  const [monthlyIncomeTarget, setMonthlyIncomeTarget] = useState(50000);
  const [monthlyBudgetLimit, setMonthlyBudgetLimit] = useState(35000);
  const [spendingAlertThreshold, setSpendingAlertThreshold] = useState(80);
  const [prefLoading, setPrefLoading] = useState(false);
  const [prefMsg, setPrefMsg] = useState('');

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setCurrency(user.currency || 'INR');
    }

    const loadSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data?.settings) {
          const s = res.data.settings;
          setMonthlyIncomeTarget(s.monthlyIncomeTarget || 50000);
          setMonthlyBudgetLimit(s.monthlyBudgetLimit || 35000);
          setSpendingAlertThreshold(s.spendingAlertThreshold || 80);
          if (s.theme) setTheme(s.theme);
        }
      } catch (err) {
        console.error('Failed to load user settings:', err);
      }
    };

    loadSettings();
  }, [user, setTheme]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg('');
    setProfileErr('');
    try {
      await authService.updateProfile({ name: profileName, currency });
      await reloadUser();
      setProfileMsg('Profile updated successfully!');
      if (window.triggerFinTrackToast) {
        window.triggerFinTrackToast('Your profile preferences have been saved.', 'Profile Saved');
      }
    } catch (err) {
      setProfileErr(err.response?.data?.message || err.message || 'Update failed');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordErr('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErr('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    setPasswordMsg('');
    setPasswordErr('');
    try {
      await authService.changePassword({ currentPassword, newPassword });
      setPasswordMsg('Password changed securely!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (window.triggerFinTrackToast) {
        window.triggerFinTrackToast('Your account password has been updated.', 'Security Updated');
      }
    } catch (err) {
      setPasswordErr(err.response?.data?.message || err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setPrefLoading(true);
    setPrefMsg('');
    try {
      await api.put('/settings', {
        monthlyIncomeTarget: parseFloat(monthlyIncomeTarget),
        monthlyBudgetLimit: parseFloat(monthlyBudgetLimit),
        spendingAlertThreshold: parseInt(spendingAlertThreshold, 10),
        currency,
        theme,
      });
      setPrefMsg('Preferences saved successfully!');
      if (window.triggerFinTrackToast) {
        window.triggerFinTrackToast('Financial targets and alert parameters saved.', 'Preferences Saved');
      }
    } catch (err) {
      alert('Error updating preferences: ' + (err.response?.data?.message || err.message));
    } finally {
      setPrefLoading(false);
    }
  };

  return (
    <div className="animate-fade-in pb-4">
      {/* Title */}
      <div className="mb-4">
        <h2 className="fw-bolder tracking-tight mb-1">Account & Preferences</h2>
        <p className="text-muted small mb-0">
          Manage your personal credentials, default currency, budgeting thresholds, and UI themes.
        </p>
      </div>

      <div className="row g-4">
        {/* Profile Card */}
        <div className="col-lg-6">
          <div className="ft-card p-4 h-100">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-person-circle text-emerald"></i>
              Personal Information
            </h5>

            {profileMsg && <div className="alert alert-success py-2 small mb-3">{profileMsg}</div>}
            {profileErr && <div className="alert alert-danger py-2 small mb-3">{profileErr}</div>}

            <form onSubmit={handleUpdateProfile}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Full Name</label>
                <input
                  type="text"
                  className="form-control ft-input"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Email Address (Registered)</label>
                <input
                  type="email"
                  className="form-control ft-input bg-light text-muted"
                  value={user?.email || ''}
                  disabled
                />
                <span className="text-muted extra-small" style={{ fontSize: '0.72rem' }}>
                  Email address cannot be modified once verified.
                </span>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-muted">Default Currency</label>
                <select
                  className="form-select ft-select"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="INR">INR (₹) — Indian Rupee (Default)</option>
                  <option value="USD">USD ($) — US Dollar</option>
                  <option value="EUR">EUR (€) — Euro</option>
                  <option value="GBP">GBP (£) — British Pound</option>
                  <option value="AED">AED (د.إ) — UAE Dirham</option>
                </select>
              </div>

              <button type="submit" className="btn btn-emerald btn-sm px-4" disabled={profileLoading}>
                {profileLoading ? 'Saving...' : 'Update Profile'}
              </button>
            </form>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="col-lg-6">
          <div className="ft-card p-4 h-100">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-shield-lock-fill text-warning"></i>
              Security & Password
            </h5>

            {passwordMsg && <div className="alert alert-success py-2 small mb-3">{passwordMsg}</div>}
            {passwordErr && <div className="alert alert-danger py-2 small mb-3">{passwordErr}</div>}

            <form onSubmit={handleChangePassword}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Current Password</label>
                <input
                  type="password"
                  className="form-control ft-input"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">New Password</label>
                <input
                  type="password"
                  className="form-control ft-input"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-muted">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control ft-input"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-warning btn-sm px-4 fw-bold" disabled={passwordLoading}>
                {passwordLoading ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>

        {/* Financial Preferences & Theme Card */}
        <div className="col-lg-12">
          <div className="ft-card p-4">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-sliders2 text-primary"></i>
              Financial Planning Thresholds & Theme
            </h5>

            {prefMsg && <div className="alert alert-success py-2 small mb-3">{prefMsg}</div>}

            <form onSubmit={handleSavePreferences}>
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-muted">
                    Target Monthly Income (₹)
                  </label>
                  <input
                    type="number"
                    className="form-control ft-input"
                    value={monthlyIncomeTarget}
                    onChange={(e) => setMonthlyIncomeTarget(e.target.value)}
                  />
                  <span className="text-muted extra-small" style={{ fontSize: '0.72rem' }}>
                    Used as the benchmark for savings rate scores.
                  </span>
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-muted">
                    Total Monthly Budget Target (₹)
                  </label>
                  <input
                    type="number"
                    className="form-control ft-input"
                    value={monthlyBudgetLimit}
                    onChange={(e) => setMonthlyBudgetLimit(e.target.value)}
                  />
                  <span className="text-muted extra-small" style={{ fontSize: '0.72rem' }}>
                    Aggregate target ceiling across all expenses.
                  </span>
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-muted">
                    Spending Alert Caution Threshold (%)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="95"
                    className="form-control ft-input"
                    value={spendingAlertThreshold}
                    onChange={(e) => setSpendingAlertThreshold(e.target.value)}
                  />
                  <span className="text-muted extra-small" style={{ fontSize: '0.72rem' }}>
                    Default 80% triggers caution alerts.
                  </span>
                </div>
              </div>

              {/* Theme Preference */}
              <div className="d-flex align-items-center justify-content-between p-3 rounded bg-light border mb-4">
                <div>
                  <h6 className="fw-bold mb-0 text-dark">Theme Preference</h6>
                  <span className="text-muted small">
                    Toggle between Light Mode and Dark Mode interface styles.
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                  onClick={toggleTheme}
                >
                  {theme === 'light' ? (
                    <>
                      <i className="bi bi-moon-stars"></i> Switch to Dark Mode
                    </>
                  ) : (
                    <>
                      <i className="bi bi-sun-fill text-warning"></i> Switch to Light Mode
                    </>
                  )}
                </button>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <button type="submit" className="btn btn-emerald btn-sm px-4" disabled={prefLoading}>
                  {prefLoading ? 'Saving...' : 'Save Preferences'}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm px-3"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to log out?')) {
                      logout();
                    }
                  }}
                >
                  <i className="bi bi-box-arrow-right me-1"></i> Sign Out
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
