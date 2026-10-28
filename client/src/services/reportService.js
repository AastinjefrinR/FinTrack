import api from './api';

export const reportService = {
  async getDashboardSummary(params = {}) {
    const response = await api.get('/reports/dashboard', { params });
    return response.data;
  },

  async getDetailedAnalytics() {
    const response = await api.get('/reports/analytics');
    return response.data;
  },
};
