
/**
 * Wishlist Slice
 * 
 * BACKEND INTEGRATION NOTE:
 * Replace with API calls to:
 * - GET /api/wishlist
 * - POST /api/wishlist (add item)
 * - DELETE /api/wishlist/:productId (remove item)
 * - GET /api/favorites
 * - POST /api/favorites (add item)
 * - DELETE /api/favorites/:productId (remove item)
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import wishlistService from '../services/wishlistService';

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await wishlistService.getWishlist(); // returns array of IDs
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleWishlistAPI = createAsyncThunk(
  'wishlist/toggle',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await wishlistService.toggleWishlist(productId);
      return { productId, action: response.action };
