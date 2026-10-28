/**
 * Formatter Utilities for Currency, Dates, and Percentages
 */

export const formatCurrency = (amount, currency = 'INR') => {
  const numeric = typeof amount === 'number' ? amount : parseFloat(amount) || 0;

  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(numeric);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 2,
  }).format(numeric);
};

export const formatDate = (dateString, format = 'DD/MM/YYYY') => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '-';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  const monthShort = d.toLocaleString('en-US', { month: 'short' });

  if (format === 'DD MMM YYYY') {
    return `${day} ${monthShort} ${year}`;
  }

  return `${day}/${month}/${year}`;
};

export const formatPercentage = (value) => {
  const num = typeof value === 'number' ? value : parseFloat(value) || 0;
  return `${num.toFixed(1)}%`;
};
