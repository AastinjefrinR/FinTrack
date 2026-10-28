import React from 'react';

const PersonalizedTips = ({ tips = [], insights = [] }) => {
  return (
    <div className="ft-card p-4 h-100">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
          <i className="bi bi-lightbulb-fill text-warning"></i>
          <span>Financial Insights & Tips</span>
        </h6>
        <span className="badge bg-light text-muted border small">Rule-Based</span>
      </div>

      {/* Insights */}
      {insights && insights.length > 0 && (
        <div className="mb-3">
          {insights.map((item, idx) => (
            <div key={idx} className="p-3 mb-2 rounded bg-light border-start border-3 border-emerald">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="fw-bold small text-dark">{item.title}</span>
                {item.metric && (
                  <span className="badge bg-emerald-subtle text-emerald fw-bold small">
                    {item.metric}
                  </span>
                )}
              </div>
              <p className="text-secondary small mb-0">{item.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      {tips && tips.length > 0 && (
        <div>
          <div className="text-uppercase extra-small fw-bold text-muted mb-2" style={{ fontSize: '0.7rem' }}>
            Actionable Optimization Tips
          </div>
          <div className="d-flex flex-column gap-2">
            {tips.map((t, idx) => (
              <div key={idx} className="d-flex align-items-start gap-2 small text-secondary">
                <i className="bi bi-check2-circle text-emerald mt-1 flex-shrink-0"></i>
                <div>
                  <strong className="text-dark">{t.category}: </strong>
                  {t.tip}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalizedTips;
