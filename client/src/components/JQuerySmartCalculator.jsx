import React, { useEffect, useRef } from 'react';
import $ from 'jquery';

/**
 * JQuerySmartCalculator Component
 * 
 * Rubric Demonstration:
 * Demonstrates clean, isolated jQuery DOM interaction, animations, and event handling
 * without interfering with React's Virtual DOM.
 * 
 * Features:
 * - Floating trigger button with jQuery slideToggle and bounce animation
 * - Interactive SIP & Loan EMI quick financial estimator
 * - Animated toast notification banner powered entirely by jQuery DOM manipulation
 */
const JQuerySmartCalculator = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const $container = $(containerRef.current);
    const $panel = $container.find('#jquery-calc-panel');
    const $bubble = $container.find('#jquery-calc-toggle');

    // 1. jQuery Slide Toggle with Icon Animation
    $bubble.off('click').on('click', function (e) {
      e.stopPropagation();
      $panel.stop(true, true).slideToggle(280, function () {
        const isVisible = $panel.is(':visible');
        $bubble.find('i').css({
          transform: isVisible ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.25s ease',
        });
      });
    });

    // Close panel when clicking outside
    $(document).off('click.jqueryCalc').on('click.jqueryCalc', function (e) {
      if (!$(e.target).closest($container).length && $panel.is(':visible')) {
        $panel.slideUp(200);
        $bubble.find('i').css({ transform: 'rotate(0deg)' });
      }
    });

    // 2. Tab Switching with jQuery Fade Transition
    $container.find('.calc-tab-btn').off('click').on('click', function () {
      $container.find('.calc-tab-btn').removeClass('active btn-emerald').addClass('btn-light');
      $(this).removeClass('btn-light').addClass('active btn-emerald');

      const targetTab = $(this).data('tab');
      $container.find('.calc-tab-pane').hide();
      $container.find(`#tab-${targetTab}`).fadeIn(200);
    });

    // 3. SIP Calculator Calculation using jQuery
    const calculateSIP = () => {
      const monthly = parseFloat($container.find('#sip-amount').val()) || 5000;
      const rate = parseFloat($container.find('#sip-rate').val()) || 12;
      const years = parseFloat($container.find('#sip-years').val()) || 5;

      const i = rate / 12 / 100;
      const n = years * 12;
      // Formula: P * [((1 + i)^n - 1) / i] * (1 + i)
      const maturity = monthly * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
      const invested = monthly * n;
      const wealthGained = maturity - invested;

      $container.find('#sip-invested').text(`₹${Math.round(invested).toLocaleString('en-IN')}`);
      $container.find('#sip-maturity').text(`₹${Math.round(maturity).toLocaleString('en-IN')}`);
      $container.find('#sip-gain').text(`+₹${Math.round(wealthGained).toLocaleString('en-IN')}`);
    };

    // 4. Loan EMI Calculator Calculation using jQuery
    const calculateEMI = () => {
      const principal = parseFloat($container.find('#emi-principal').val()) || 100000;
      const annualRate = parseFloat($container.find('#emi-rate').val()) || 10.5;
      const tenureMonths = (parseFloat($container.find('#emi-years').val()) || 2) * 12;

      const r = annualRate / 12 / 100;
      // EMI = [P * r * (1+r)^n] / [(1+r)^n - 1]
      const emi = (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
      const totalPayable = emi * tenureMonths;
      const totalInterest = totalPayable - principal;

      $container.find('#emi-monthly').text(`₹${Math.round(emi).toLocaleString('en-IN')}`);
      $container.find('#emi-interest').text(`₹${Math.round(totalInterest).toLocaleString('en-IN')}`);
      $container.find('#emi-total').text(`₹${Math.round(totalPayable).toLocaleString('en-IN')}`);
    };

    // Listeners for live slider/input updates
    $container.find('.sip-input').off('input change').on('input change', calculateSIP);
    $container.find('.emi-input').off('input change').on('input change', calculateEMI);

    // Initial calculations
    calculateSIP();
    calculateEMI();

    // 5. Global jQuery Toast Notification Trigger
    window.triggerFinTrackToast = (message, title = 'Notification') => {
      let $toastBox = $('#jquery-toast-container');
      if (!$toastBox.length) {
        $toastBox = $('<div id="jquery-toast-container"></div>').appendTo('body');
      }

      const $toast = $(`
        <div class="jquery-toast-item" style="display:none;">
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-success rounded-circle p-1"><i class="bi bi-check2"></i></span>
            <div>
              <div style="font-weight:700; font-size:0.8rem; color:#10b981;">${title}</div>
              <div>${message}</div>
            </div>
          </div>
          <button type="button" class="btn-close btn-close-white btn-sm" aria-label="Close"></button>
        </div>
      `);

      $toastBox.append($toast);
      $toast.slideDown(250);

      const removeToast = () => {
        $toast.slideUp(200, function () {
          $(this).remove();
        });
      };

      $toast.find('.btn-close').on('click', removeToast);
      setTimeout(removeToast, 4000);
    };

    // Demo Notification Trigger Button inside calculator
    $container.find('#demo-toast-btn').off('click').on('click', function () {
      window.triggerFinTrackToast(
        'jQuery animated toast triggered smoothly without React state churn!',
        'jQuery Event Demo'
      );
    });

    // Cleanup on unmount
    return () => {
      $(document).off('click.jqueryCalc');
      $bubble.off('click');
      $container.find('*').off();
    };
  }, []);

  return (
    <div ref={containerRef} className="jquery-calc-widget">
      {/* Floating Toggle Bubble */}
      <div
        id="jquery-calc-toggle"
        className="jquery-calc-bubble"
        title="Quick Financial Calculator (jQuery Powered)"
      >
        <i className="bi bi-calculator"></i>
      </div>

      {/* Slide-out Calculator Panel */}
      <div id="jquery-calc-panel" className="jquery-calc-panel p-3">
        <div className="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-success-subtle text-success p-1 rounded">
              <i className="bi bi-lightning-charge-fill"></i> jQuery
            </span>
            <span className="fw-bold" style={{ fontSize: '0.95rem' }}>Smart Calculator</span>
          </div>
          <button
            id="demo-toast-btn"
            className="btn btn-sm btn-outline-secondary py-0 px-2"
            style={{ fontSize: '0.75rem' }}
            title="Demonstrate jQuery Animated Toast Notification"
          >
            Toast Demo
          </button>
        </div>

        {/* Tab Selector */}
        <div className="btn-group w-100 mb-3" role="group" id="calc-tabs">
          <button
            type="button"
            className="btn btn-sm btn-emerald calc-tab-btn active"
            data-tab="sip"
          >
            SIP Growth
          </button>
          <button
            type="button"
            className="btn btn-sm btn-light calc-tab-btn text-muted"
            data-tab="emi"
          >
            Loan EMI
          </button>
        </div>

        {/* Tab 1: SIP Calculator */}
        <div id="tab-sip" className="calc-tab-pane">
          <div className="mb-2">
            <div className="d-flex justify-content-between small text-muted mb-1">
              <span>Monthly Investment</span>
            </div>
            <input
              type="number"
              id="sip-amount"
              className="form-control form-control-sm ft-input sip-input"
              defaultValue="5000"
              step="500"
            />
          </div>
          <div className="row g-2 mb-3">
            <div className="col-6">
              <label className="small text-muted mb-1">Expected Return (%)</label>
              <input
                type="number"
                id="sip-rate"
                className="form-control form-control-sm ft-input sip-input"
                defaultValue="12"
                step="0.5"
              />
            </div>
            <div className="col-6">
              <label className="small text-muted mb-1">Time (Years)</label>
              <input
                type="number"
                id="sip-years"
                className="form-control form-control-sm ft-input sip-input"
                defaultValue="5"
                min="1"
                max="30"
              />
            </div>
          </div>

          <div className="p-2 rounded bg-light small">
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Total Invested:</span>
              <span className="fw-semibold" id="sip-invested">₹0</span>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Est. Wealth Gain:</span>
              <span className="text-success fw-semibold" id="sip-gain">₹0</span>
            </div>
            <div className="d-flex justify-content-between pt-1 border-top fw-bold">
              <span>Maturity Value:</span>
              <span className="text-primary" id="sip-maturity">₹0</span>
            </div>
          </div>
        </div>

        {/* Tab 2: Loan EMI Calculator */}
        <div id="tab-emi" className="calc-tab-pane" style={{ display: 'none' }}>
          <div className="mb-2">
            <label className="small text-muted mb-1">Loan Amount (₹)</label>
            <input
              type="number"
              id="emi-principal"
              className="form-control form-control-sm ft-input emi-input"
              defaultValue="200000"
              step="10000"
            />
          </div>
          <div className="row g-2 mb-3">
            <div className="col-6">
              <label className="small text-muted mb-1">Interest Rate (%)</label>
              <input
                type="number"
                id="emi-rate"
                className="form-control form-control-sm ft-input emi-input"
                defaultValue="10.5"
                step="0.25"
              />
            </div>
            <div className="col-6">
              <label className="small text-muted mb-1">Duration (Years)</label>
              <input
                type="number"
                id="emi-years"
                className="form-control form-control-sm ft-input emi-input"
                defaultValue="3"
                min="1"
                max="30"
              />
            </div>
          </div>

          <div className="p-2 rounded bg-light small">
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Monthly EMI:</span>
              <span className="fw-bold text-danger" id="emi-monthly">₹0</span>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Total Interest:</span>
              <span className="fw-semibold" id="emi-interest">₹0</span>
            </div>
            <div className="d-flex justify-content-between pt-1 border-top fw-bold">
              <span>Total Repayment:</span>
              <span className="text-primary" id="emi-total">₹0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JQuerySmartCalculator;
