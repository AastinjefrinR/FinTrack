import api from './api';

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('fintrack_token', response.data.token);
      localStorage.setItem('fintrack_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('fintrack_token', response.data.token);
      localStorage.setItem('fintrack_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('fintrack_token');
    localStorage.removeItem('fintrack_user');
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put('/auth/profile', profileData);
    if (response.data.user) {
      const current = JSON.parse(localStorage.getItem('fintrack_user') || '{}');
      localStorage.setItem('fintrack_user', JSON.stringify({ ...current, ...response.data.user }));
    }
    return response.data;
  },

  async changePassword(passwords) {
    const response = await api.put('/auth/change-password', passwords);
    return response.data;
  },

  async seedDemoData() {
    const response = await api.post('/auth/seed-demo');
    return response.data;
  },
};
