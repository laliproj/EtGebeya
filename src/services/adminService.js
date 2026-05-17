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

  /** Approve or reject a product listing */
  async handleProduct(productId, action) {
    const response = await api.post('/admin/approve_product.php', { productId, action });
    if (response.data.success) return response.data;
    throw new Error(response.data.message || 'Failed to handle product');
  },

  /** Get all user reports */
  async getReports() {
    const response = await api.get('/admin/reports.php');
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to fetch reports');
  },

  /** Handle a report: dismiss | remove_product | warn_seller | ban_seller */
  async handleReport(reportId, action) {
    const response = await api.post('/admin/handle_report.php', { reportId, action });
    if (response.data.success) return response.data;
    throw new Error(response.data.message || 'Failed to handle report');
  },

  /** Get reports submitted by the currently logged-in user */
  async getMyReports() {
    const response = await api.get('/admin/my_reports.php');
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to fetch your reports');
  },
};

export default adminService;
