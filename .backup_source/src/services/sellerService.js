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
    return this.getSellerProducts(id);
  },

  /** Seller's own dashboard - returns ALL products including pending/rejected */
  async getMyProducts(id) {
    const response = await api.get(`/sellers/products.php?id=${id}&own=1`);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to fetch your products');
  },

  async getSellerReviews(id) {
    const response = await api.get(`/sellers/reviews.php?id=${id}`);
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to fetch seller reviews');
  },

  async getReviews(id) {
    return this.getSellerReviews(id);
  },

  async rateSeller(sellerId, rating, comment = '') {
    const response = await api.post('/sellers/rate.php', { sellerId, rating, comment });
    if (response.data.success) return response.data;
    throw new Error(response.data.message || 'Failed to rate seller');
  },

  async deleteProduct(productId) {
    const response = await api.post('/products/delete.php', { productId });
    if (response.data.success) return response.data;
    throw new Error(response.data.message || 'Failed to delete product');
  },

  async markSold(productId) {
    const response = await api.post('/products/mark-sold.php', { productId });
    if (response.data.success) return response.data;
    throw new Error(response.data.message || 'Failed to mark product as sold');
  },

  async updateProduct(productId, data) {
    const response = await api.put(`/products/update.php?id=${productId}`, data);
    if (response.data.success) return response.data;
    throw new Error(response.data.message || 'Failed to update product');
  },
};

export default sellerService;
