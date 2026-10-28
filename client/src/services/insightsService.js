import api from './api';

export const insightsService = {
  async getInsightsAndHealthScore() {
    const response = await api.get('/insights');
    return response.data;
  },
};
