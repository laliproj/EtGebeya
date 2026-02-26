
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
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  wishlistIds: [],
  favoriteIds: [], // Used for sellers/brands if needed
  loading: false,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlist(state) {
      state.wishlistIds = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlistIds = action.payload || [];
      })
      .addCase(fetchWishlist.rejected, (state) => {
        state.loading = false;
      })
      // Toggle
      .addCase(toggleWishlistAPI.fulfilled, (state, action) => {
        const { productId, action: toggleAction } = action.payload;
        if (toggleAction === 'added') {
          if (!state.wishlistIds.includes(productId)) {
            state.wishlistIds.push(productId);
          }
        } else if (toggleAction === 'removed') {
          state.wishlistIds = state.wishlistIds.filter(id => id !== productId);
        }
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
