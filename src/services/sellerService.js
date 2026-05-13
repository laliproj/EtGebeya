import api from './api';

const sellerService = {
  async getSellerById(id) {
    const response = await api.get(`/sellers/show.php?id=${id}`);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to fetch seller profile');
  },

  /** Alias used by SellerProfilePage */
  async getById(id) {
    return this.getSellerById(id);
  },

  /** Public profile - only returns active products */
  async getSellerProducts(id) {
    const response = await api.get(`/sellers/products.php?id=${id}`);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to fetch seller products');
  },

  /** Alias used by SellerProfilePage */
  async getProducts(id) {
