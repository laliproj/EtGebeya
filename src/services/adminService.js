import api from './api';

/**
 * Admin Service — wraps all /api/admin/* endpoints
 */
const adminService = {
  /** Fetch dashboard stats */
  async getStats() {
    const response = await api.get('/admin/stats.php');
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to fetch stats');
  },

  /** Get all pending product listings awaiting approval */
  async getPendingProducts() {
    const response = await api.get('/admin/pending_products.php');
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to fetch pending products');
  },

