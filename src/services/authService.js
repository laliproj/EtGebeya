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
    throw new Error(response.data.message || 'Request failed');
  },

  async getProfile() {
    const response = await api.get('/auth/profile.php');
    if (response.data.success) {
      // Update local storage just in case
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const updatedUser = { ...currentUser, ...response.data.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    }
    throw new Error(response.data.message || 'Failed to fetch profile');
  },

  async updateProfile(data) {
    const response = await api.put('/auth/profile.php', data);
    if (response.data.success) {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const updatedUser = { ...currentUser, ...response.data.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    }
    throw new Error(response.data.message || 'Failed to update profile');
  },
};

export default authService;
