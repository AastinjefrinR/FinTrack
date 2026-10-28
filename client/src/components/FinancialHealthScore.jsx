import React, { useState } from 'react';

const FinancialHealthScore = ({ healthScore }) => {
  const [showModal, setShowModal] = useState(false);

  if (!healthScore) return null;

  const { score, maxScore = 100, grade, color, summary, breakdown } = healthScore;

  return (
    <div className="ft-card p-4 h-100 position-relative overflow-hidden">
      {/* Background Subtle Accent Watermark */}
      <div
        className="position-absolute top-0 end-0 p-3"
        style={{ fontSize: '4.5rem', lineHeight: 1, pointerEvents: 'none', opacity: 0.04, color: 'var(--primary-accent)' }}
      >
        <i className="bi bi-heart-pulse-fill"></i>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <span className="badge bg-emerald-subtle text-emerald px-2 py-1 rounded-pill small fw-bold">
            <i className="bi bi-activity me-1"></i> Innovation Feature
          </span>
          <h5 className="fw-bold mb-0 mt-1">Financial Health Score</h5>
        </div>
        <button
          className="btn btn-sm btn-outline-secondary rounded-pill px-2 py-1 small"
          onClick={() => setShowModal(true)}
          title="Inspect Scoring Rules & Rubric"
        >
          <i className="bi bi-info-circle me-1"></i> Scoring Rules
        </button>
      </div>

      {/* Main Score Display */}
      <div className="d-flex align-items-center gap-4 my-3">
        <div
          className="rounded-circle d-flex flex-column align-items-center justify-content-center shadow-sm flex-shrink-0"
          style={{
            width: '100px',
            height: '100px',
            border: `6px solid ${color}`,
            backgroundColor: 'var(--bg-main)',
          }}
        >
          <span className="fw-bolder fs-2 lh-1" style={{ color }}>
            {score}
          </span>
          <span className="text-muted extra-small" style={{ fontSize: '0.7rem' }}>
            / {maxScore}
          </span>
        </div>

        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span
              className="badge px-3 py-1 rounded-pill fw-bold text-white"
              style={{ backgroundColor: color }}
            >
              Grade: {grade}
            </span>
          </div>
          <p className="text-muted small mb-0">{summary}</p>
        </div>
      </div>

      {/* Pillar Breakdown Mini Indicators */}
      <div className="row g-2 pt-2 border-top">
        {breakdown &&
          breakdown.map((item, idx) => (
            <div key={idx} className="col-6">
              <div className="p-2 rounded bg-light bg-opacity-75 small">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-muted text-truncate" style={{ fontSize: '0.78rem' }}>
                    {item.metric}
                  </span>
                  <span className="fw-bold" style={{ fontSize: '0.78rem' }}>
                    {item.score}/{item.maxScore}
                  </span>
                </div>
                <div className="progress progress-ft" style={{ height: '5px' }}>
                  <div
                    className="progress-bar"
                    style={{
                      width: `${(item.score / item.maxScore) * 100}%`,
                      backgroundColor: color,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Transparent Rubric Explanation Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)' }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content ft-card border-0 shadow-xl">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <i className="bi bi-shield-check text-emerald"></i>
                  Transparent Financial Health Score Rubric
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <p className="text-muted small mb-3">
                  FinTrack calculates an objective, real-time score out of 100 points based on four essential pillars of personal financial management:
                </p>

                <div className="table-responsive">
                  <table className="table table-bordered table-sm align-middle small">
                    <thead className="table-light">
                      <tr>
                        <th>Pillar</th>
                        <th>Max Points</th>
                        <th>Measurement Rule</th>
                        <th>Status in Your Account</th>
                      </tr>
                    </thead>
                    <tbody>
                      {breakdown &&
                        breakdown.map((b, i) => (
                          <tr key={i}>
                            <td className="fw-bold">{b.metric}</td>
                            <td>{b.maxScore} pts</td>
                            <td>{b.detail}</td>
                            <td>
                              <span className="badge bg-success-subtle text-success fw-bold">
                                {b.score} / {b.maxScore} pts
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div className="alert alert-info py-2 mt-3 small mb-0">
                  <i className="bi bi-lightbulb-fill me-2"></i>
                  <strong>How to improve:</strong> Keep expenses under 70% of monthly income, set category budgets and keep spending under 80% of those limits, and maintain an active savings goal.
                </div>
              </div>

              <div className="modal-footer border-top">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowModal(false)}
                >
                  Close Rubric
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialHealthScore;
