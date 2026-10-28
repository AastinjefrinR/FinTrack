import api from './api';

export const savingsService = {
  async getGoals() {
    const response = await api.get('/savings');
    return response.data;
  },

  async createGoal(goalData) {
    const response = await api.post('/savings', goalData);
    return response.data;
  },

  async addContribution(goalId, contributionData) {
    const response = await api.post(`/savings/${goalId}/contribute`, contributionData);
    return response.data;
  },

  async updateGoal(id, goalData) {
    const response = await api.put(`/savings/${id}`, goalData);
    return response.data;
  },

  async deleteGoal(id) {
    const response = await api.delete(`/savings/${id}`);
    return response.data;
  },
};
