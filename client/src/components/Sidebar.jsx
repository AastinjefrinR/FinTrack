import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isCollapsed, isMobileOpen, onCloseMobile }) => {
  const { user } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: 'bi-grid-1x2-fill', label: 'Dashboard' },
    { to: '/transactions', icon: 'bi-arrow-left-right', label: 'Transactions' },
    { to: '/budgets', icon: 'bi-pie-chart-fill', label: 'Budgets' },
    { to: '/savings', icon: 'bi-piggy-bank-fill', label: 'Savings Goals' },
    { to: '/reports', icon: 'bi-graph-up-arrow', label: 'Analytics & Reports' },
    { to: '/settings', icon: 'bi-sliders', label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
          style={{ zIndex: 1039 }}
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`ft-sidebar d-flex flex-column ${
          isCollapsed ? 'collapsed' : ''
        } ${isMobileOpen ? 'show' : ''}`}
      >
        {/* Brand Header */}
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary border-opacity-25">
          <NavLink to="/dashboard" className="text-decoration-none d-flex align-items-center gap-2 text-white">
            <div
              className="rounded-3 bg-emerald p-2 d-flex align-items-center justify-content-center shadow-sm"
              style={{ width: '38px', height: '38px' }}
            >
              <i className="bi bi-wallet2 text-white fs-5"></i>
            </div>
            {!isCollapsed && (
              <div className="d-flex flex-column">
                <span className="brand-font fw-bold fs-5 tracking-tight lh-1 text-white">FinTrack</span>
                <span className="text-emerald extra-small" style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}>
                  SMART FINANCE
                </span>
              </div>
            )}
          </NavLink>
        </div>

        {/* Navigation Items */}
        <nav className="flex-grow-1 py-3 overflow-y-auto">
          <ul className="list-unstyled mb-0">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={onCloseMobile}
                  title={isCollapsed ? item.label : undefined}
                >
                  <i className={`bi ${item.icon} fs-5`}></i>
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Card at bottom */}
        {!isCollapsed && (
          <div className="p-3 border-top border-secondary border-opacity-25 mt-auto">
            <div className="p-2 rounded-3 bg-white bg-opacity-10 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2 overflow-hidden">
                <div
                  className="rounded-circle bg-emerald text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                  style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-truncate">
                  <div className="small fw-semibold text-white text-truncate">{user?.name}</div>
                  <div className="text-muted text-truncate" style={{ fontSize: '0.7rem' }}>
                    {user?.currency || 'INR'} Account
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
