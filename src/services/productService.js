import api from './api';

const productService = {
  async getAll(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.brand) params.append('brand', filters.brand);
    if (filters.condition) params.append('condition', filters.condition);
    if (filters.priceMin) params.append('priceMin', filters.priceMin);
    if (filters.priceMax) params.append('priceMax', filters.priceMax);

    const response = await api.get(`/products/index.php?${params.toString()}`);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to fetch products');
  },

  async getFeatured() {
    const response = await api.get('/products/featured.php');
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to fetch featured products');
  },

  async getRecent() {
    const response = await api.get('/products/recent.php');
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to fetch recent products');
  },

  async getById(id) {
