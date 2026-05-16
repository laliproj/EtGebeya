import api from './api';

/**
 * Auth Service — API calls for authentication
 */

const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login.php', { email, password });
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
      return response.data.data;
    }
    throw new Error(response.data.message || 'Login failed');
  },
