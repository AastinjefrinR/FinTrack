import React from 'react';

const Footer = () => {
  return (
    <footer className="mt-auto py-3 px-4 border-top text-center text-md-start small text-muted bg-white border-light">
      <div className="container-fluid d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
        <div>
          <span className="fw-semibold text-dark">FinTrack</span> &copy; {new Date().getFullYear()} — Smart Expense & Budget Manager.
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap justify-content-center">
          <span className="badge bg-light text-secondary border">ReactJS</span>
          <span className="badge bg-light text-secondary border">Bootstrap 5</span>
          <span className="badge bg-light text-secondary border">jQuery</span>
          <span className="badge bg-light text-secondary border">Node.js</span>
          <span className="badge bg-light text-secondary border">Express.js</span>
          <span className="badge bg-light text-secondary border">MongoDB</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
