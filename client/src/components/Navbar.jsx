import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/authService';

const Navbar = ({ onToggleSidebar, onQuickAddClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [loadingDemo, setLoadingDemo] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (window.triggerFinTrackToast) {
      window.triggerFinTrackToast('Logged out safely.', 'Session Closed');
    }
  };

  const handleLoadDemo = async () => {
    if (!window.confirm('Load rich sample demo data (realistic transactions, budgets & goals)? This will provide pre-populated figures for evaluation.')) {
      return;
    }
    setLoadingDemo(true);
    try {
      await authService.seedDemoData();
      if (window.triggerFinTrackToast) {
        window.triggerFinTrackToast('Sample financial data loaded successfully!', 'Demo Ready');
      }
      // Reload page to refresh all active dashboard data
      window.location.reload();
    } catch (err) {
      alert('Failed to seed demo data: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <header className="ft-topbar d-flex align-items-center justify-content-between">
      {/* Left: Sidebar toggle & Title */}
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-sm btn-light border-0 d-flex align-items-center justify-content-center p-2 rounded-3 text-muted"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Sidebar"
        >
          <i className="bi bi-list fs-5"></i>
        </button>
        <div className="d-none d-md-block">
          <span className="badge bg-success-subtle text-success px-2 py-1 rounded-pill small">
            <i className="bi bi-shield-check me-1"></i> End-to-End Secure
          </span>
        </div>
      </div>

      {/* Right: Actions & User Menu */}
      <div className="d-flex align-items-center gap-2">
        {/* Quick Add Button */}
        <button
          className="btn btn-sm btn-emerald d-flex align-items-center gap-1 shadow-sm"
          onClick={onQuickAddClick}
          title="Quickly record an income or expense"
        >
          <i className="bi bi-plus-circle-fill"></i>
          <span className="d-none d-sm-inline">Quick Add</span>
        </button>

        {/* Demo Mode Button */}
        <button
          className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
          onClick={handleLoadDemo}
          disabled={loadingDemo}
          title="Populate demo data for academic evaluation"
        >
          <i className="bi bi-database-fill-gear"></i>
          <span className="d-none d-lg-inline">{loadingDemo ? 'Loading...' : 'Demo Data'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          className="btn btn-sm btn-light border p-2 rounded-circle"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <i className="bi bi-moon-stars text-secondary"></i>
          ) : (
            <i className="bi bi-sun-fill text-warning"></i>
          )}
        </button>

        {/* User Profile Dropdown */}
        <div className="dropdown ms-1">
          <button
            className="btn btn-light btn-sm border-0 dropdown-toggle d-flex align-items-center gap-2 p-1 pe-2 rounded-pill"
            type="button"
            id="userDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <div
              className="rounded-circle bg-emerald text-white d-flex align-items-center justify-content-center fw-bold"
              style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="d-none d-sm-inline fw-semibold small text-truncate" style={{ maxWidth: '120px' }}>
              {user?.name || 'Account'}
            </span>
          </button>

          <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-3 mt-2" aria-labelledby="userDropdown">
            <li className="px-3 py-2 border-bottom">
              <p className="mb-0 fw-bold small text-truncate">{user?.name}</p>
              <p className="mb-0 text-muted extra-small text-truncate" style={{ fontSize: '0.75rem' }}>
                {user?.email}
              </p>
            </li>
            <li>
              <Link className="dropdown-item py-2 small d-flex align-items-center gap-2" to="/settings">
                <i className="bi bi-person-gear text-muted"></i> Account Settings
              </Link>
            </li>
            <li>
              <button
                className="dropdown-item py-2 small d-flex align-items-center gap-2 text-danger"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right"></i> Sign Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
