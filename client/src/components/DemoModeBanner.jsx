import React, { useState } from 'react';
import { authService } from '../services/authService';

const DemoModeBanner = ({ onDataLoaded }) => {
  const [loading, setLoading] = useState(false);

  const handleLoadDemo = async () => {
    setLoading(true);
    try {
      await authService.seedDemoData();
      if (window.triggerFinTrackToast) {
        window.triggerFinTrackToast(
          'Sample financial dataset populated! Exploring dashboard with realistic transactions & budgets.',
          'Demo Data Active'
        );
      }
      if (onDataLoaded) onDataLoaded();
      else window.location.reload();
    } catch (err) {
      alert('Error loading sample data: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ft-card p-3 mb-4 bg-emerald-subtle border-emerald border-opacity-25">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-circle bg-emerald text-white p-2 d-flex align-items-center justify-content-center flex-shrink-0">
            <i className="bi bi-stars fs-5"></i>
          </div>
          <div>
            <h6 className="fw-bold mb-1 text-dark">
              Evaluator Demo Mode Available
            </h6>
            <p className="text-muted small mb-0">
              Instantly populate authentic sample data (salaries, grocery bills, tech gadget budgets, and vacation savings goals) to evaluate full analytical capabilities.
            </p>
          </div>
        </div>

        <button
          className="btn btn-sm btn-emerald d-flex align-items-center justify-content-center gap-2 flex-shrink-0 px-3 py-2"
          onClick={handleLoadDemo}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status"></span>
              <span>Loading Demo Data...</span>
            </>
          ) : (
            <>
              <i className="bi bi-box-arrow-in-down"></i>
              <span>Load 1-Click Demo Data</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DemoModeBanner;
