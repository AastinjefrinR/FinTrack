import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center text-center p-4 bg-main">
      <div className="display-1 fw-bolder text-emerald mb-2">404</div>
      <h3 className="fw-bold text-dark mb-2">Page Not Found</h3>
      <p className="text-muted small mb-4" style={{ maxWidth: '400px' }}>
        The page or financial ledger section you are attempting to access does not exist or has been relocated.
      </p>
      <Link to="/dashboard" className="btn btn-emerald px-4">
        Return to Dashboard &rarr;
      </Link>
    </div>
  );
};

export default NotFoundPage;
