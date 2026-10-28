import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center py-5 px-3 bg-main">
      <div className="container" style={{ maxWidth: '460px' }}>
        {/* Brand Header */}
        <div className="text-center mb-4">
          <Link to="/" className="text-decoration-none d-inline-flex align-items-center gap-2 mb-2">
            <div
              className="rounded-3 bg-emerald p-2 d-flex align-items-center justify-content-center shadow-sm"
              style={{ width: '42px', height: '42px' }}
            >
              <i className="bi bi-wallet2 text-white fs-4"></i>
            </div>
            <span className="brand-font fw-bold fs-3 text-dark tracking-tight">FinTrack</span>
          </Link>
          <p className="text-muted small">
            Smart Expense and Budget Manager for Disciplined Personal Finances
          </p>
        </div>

        {/* Render Form Card */}
        <div className="ft-card p-4 p-sm-5 shadow-lg">
          <Outlet />
        </div>

        {/* Footer links */}
        <div className="text-center mt-4 text-muted small">
          <Link to="/" className="text-decoration-none text-emerald me-3">
            &larr; Back to Home
          </Link>
          <span>&bull;</span>
          <span className="ms-3">&copy; {new Date().getFullYear()} FinTrack</span>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
