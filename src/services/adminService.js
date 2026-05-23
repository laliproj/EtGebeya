import api from './api';

/**
 * Admin Service — wraps all /api/admin/* endpoints
 */
const adminService = {
  /** Fetch dashboard stats */
  async getStats() {
    const response = await api.get('/admin/stats.php');
    if (response.data.success) return response.data.data;
