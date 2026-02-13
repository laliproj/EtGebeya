import { createSlice } from '@reduxjs/toolkit';
import sellersData from '../data/sellers.json';

/**
 * Seller Slice
 * 
 * BACKEND INTEGRATION NOTE:
 * Replace with API calls to:
 * - GET /api/sellers/:id
 * - GET /api/sellers/:id/products
 * - GET /api/sellers/:id/reviews
 * - PUT /api/sellers/:id/report
 */

const initialState = {
  sellers: sellersData,
  currentSeller: null,
  loading: false,
  error: null,
};

const sellerSlice = createSlice({
  name: 'sellers',
  initialState,
  reducers: {
    setCurrentSeller(state, action) {
      state.currentSeller = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    addWarning(state, action) {
      const seller = state.sellers.find(s => s.id === action.payload);
      if (seller) {
        seller.warnings += 1;
        if (seller.warnings >= 3) {
          seller.isBanned = true;
        }
      }
    },
  },
});

export const { setCurrentSeller, setLoading: setSellerLoading, addWarning } = sellerSlice.actions;

export default sellerSlice.reducer;
