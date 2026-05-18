import api from './api';

const wishlistService = {
  async getWishlist() {
    const response = await api.get('/wishlist/index.php');
    if (response.data.success) return response.data.data;
