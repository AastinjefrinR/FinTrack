import React from 'react';

const SpendingAlerts = ({ alerts = [] }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="ft-card p-3 mb-4 border-start border-4 border-success">
        <div className="d-flex align-items-center gap-3">
          <span className="badge bg-success-subtle text-success p-2 rounded-circle fs-5">
            <i className="bi bi-shield-check"></i>
          </span>
          <div>
            <h6 className="fw-bold mb-0 text-success">All Clear — No Spending Alerts</h6>
            <p className="text-muted small mb-0">
              All active category budgets and outflow thresholds are currently in a healthy safe zone.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
          <i className="bi bi-bell-fill text-warning"></i>
          <span>Smart Spending Alerts</span>
          <span className="badge bg-danger rounded-pill px-2">{alerts.length}</span>
        </h6>
      </div>

      <div className="d-flex flex-column gap-2">
        {alerts.map((alert, index) => {
          const isDanger = alert.severity === 'danger';
          const isWarning = alert.severity === 'warning';

          return (
            <div
              key={index}
              className={`ft-card p-3 border-start border-4 ${
                isDanger
                  ? 'border-danger bg-danger-subtle bg-opacity-25'
                  : isWarning
                  ? 'border-warning bg-warning-subtle bg-opacity-25'
                  : 'border-info bg-info-subtle bg-opacity-25'
              }`}
            >
              <div className="d-flex align-items-start justify-content-between gap-3">
                <div className="d-flex align-items-start gap-2">
                  <i
                    className={`bi ${
                      isDanger
                        ? 'bi-exclamation-octagon-fill text-danger'
                        : isWarning
                        ? 'bi-exclamation-triangle-fill text-warning'
                        : 'bi-info-circle-fill text-info'
                    } fs-5 mt-1`}
                  ></i>
                  <div>
                    <div className="fw-bold small text-dark">{alert.title}</div>
                    <div className="small text-secondary">{alert.message}</div>
                  </div>
                </div>

                {alert.pct && (
                  <span
                    className={`badge ${
                      isDanger
                        ? 'bg-danger text-white'
                        : isWarning
                        ? 'bg-warning text-dark'
                        : 'bg-info text-white'
                    } fw-bold`}
                  >
                    {alert.pct}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SpendingAlerts;
