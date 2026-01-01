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
    const response = await api.get(`/products/show.php?id=${id}`);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to fetch product');
  },

  async getSimilar(productId) {
    const response = await api.get(`/products/similar.php?id=${productId}`);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to fetch similar products');
  },

  async search(query) {
    const response = await api.get(`/search/index.php?q=${encodeURIComponent(query)}`);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to search products');
  },

  async create(formData) {
    // Send FormData directly
    const response = await api.post('/products/create.php', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to create product');
  }
};

export default productService;
