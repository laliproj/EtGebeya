import api from './api';

const wishlistService = {
  async getWishlist() {
    const response = await api.get('/wishlist/index.php');
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to fetch wishlist');
  },

  async toggleWishlist(productId) {
    const response = await api.post('/wishlist/toggle.php', { productId });
    if (response.data.success) return response.data.data;
