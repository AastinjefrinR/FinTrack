import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
      if (window.triggerFinTrackToast) {
        window.triggerFinTrackToast('Welcome back! Dashboard loaded.', 'Signed In');
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill sample demo credentials
  const handleDemoFill = () => {
    setEmail('demo@fintrack.test');
    setPassword('DemoPass123!');
  };

  return (
    <div>
      <h3 className="fw-bold text-dark mb-1">Welcome Back</h3>
      <p className="text-muted small mb-4">
        Log in to access your personal dashboard and financial insights.
      </p>

      {error && (
        <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Quick Demo Credential Fill Button for Evaluators */}
      <div className="p-2 mb-3 rounded bg-light border d-flex align-items-center justify-content-between small">
        <span className="text-muted">
          <i className="bi bi-person-badge me-1"></i> Testing account:
        </span>
        <button
          type="button"
          className="btn btn-sm btn-outline-success py-0 px-2 fw-semibold"
          style={{ fontSize: '0.75rem' }}
          onClick={handleDemoFill}
        >
          Auto-Fill Demo Credentials
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label small fw-semibold text-muted">Email Address</label>
          <div className="input-group">
            <span className="input-group-text bg-light text-muted">
              <i className="bi bi-envelope"></i>
            </span>
            <input
              type="email"
              className="form-control ft-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
        </div>

        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <label className="form-label small fw-semibold text-muted mb-0">Password</label>
          </div>
          <div className="input-group">
            <span className="input-group-text bg-light text-muted">
              <i className="bi bi-lock"></i>
            </span>
            <input
              type="password"
              className="form-control ft-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-emerald w-100 py-2 d-flex align-items-center justify-content-center gap-2 fw-semibold"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status"></span>
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <i className="bi bi-arrow-right"></i>
            </>
          )}
        </button>
      </form>

      <div className="text-center mt-4 pt-3 border-top small text-muted">
        Don't have an account yet?{' '}
        <Link to="/register" className="fw-semibold text-emerald text-decoration-none">
          Create Account
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
