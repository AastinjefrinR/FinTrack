import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    currency: 'INR',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        currency: formData.currency,
      });

      if (window.triggerFinTrackToast) {
        window.triggerFinTrackToast(
          'Account created! You are now logged in.',
          'Registration Successful'
        );
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="fw-bold text-dark mb-1">Create Account</h3>
      <p className="text-muted small mb-4">
        Join FinTrack to organize, budget, and grow your wealth.
      </p>

      {error && (
        <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label small fw-semibold text-muted">Full Name</label>
          <div className="input-group">
            <span className="input-group-text bg-light text-muted">
              <i className="bi bi-person"></i>
            </span>
            <input
              type="text"
              name="name"
              className="form-control ft-input"
              placeholder="e.g. Aastin Sharma"
              value={formData.name}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold text-muted">Email Address</label>
          <div className="input-group">
            <span className="input-group-text bg-light text-muted">
              <i className="bi bi-envelope"></i>
            </span>
            <input
              type="email"
              name="email"
              className="form-control ft-input"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="row g-2 mb-3">
          <div className="col-md-6">
            <label className="form-label small fw-semibold text-muted">Password</label>
            <input
              type="password"
              name="password"
              className="form-control ft-input"
              placeholder="Min 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-semibold text-muted">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-control ft-input"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label small fw-semibold text-muted">Default Currency</label>
          <select
            name="currency"
            className="form-select ft-select"
            value={formData.currency}
            onChange={handleChange}
          >
            <option value="INR">INR (₹) — Indian Rupee (Default)</option>
            <option value="USD">USD ($) — US Dollar</option>
            <option value="EUR">EUR (€) — Euro</option>
            <option value="GBP">GBP (£) — British Pound</option>
            <option value="AED">AED (د.إ) — UAE Dirham</option>
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-emerald w-100 py-2 d-flex align-items-center justify-content-center gap-2 fw-semibold"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status"></span>
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Sign Up Free</span>
              <i className="bi bi-arrow-right"></i>
            </>
          )}
        </button>
      </form>

      <div className="text-center mt-4 pt-3 border-top small text-muted">
        Already have an account?{' '}
        <Link to="/login" className="fw-semibold text-emerald text-decoration-none">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
