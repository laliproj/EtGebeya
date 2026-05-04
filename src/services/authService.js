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

  async register(userData) {
    const response = await api.post('/auth/register.php', userData);
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
      return response.data.data;
    }
    throw new Error(response.data.message || 'Registration failed');
  },

  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password.php', { email });
    if (response.data.success) {
      return response.data;
    }
