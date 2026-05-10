import api from './api';

const reportService = {
  async submitReport(productId, reason, details = '') {
    const response = await api.post('/reports/create.php', { productId, reason, details });
    if (response.data.success) return response.data;
