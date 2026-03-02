import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import productReducer from './productSlice';
import wishlistReducer from './wishlistSlice';
import notificationReducer from './notificationSlice';
import sellerReducer from './sellerSlice';
import uiReducer from './uiSlice';

/**
 * Redux Store Configuration
 * 
 * BACKEND INTEGRATION NOTE:
 * When connecting to the PHP/MySQL backend, middleware like
 * redux-thunk (included by default with RTK) will handle
 * async API calls. Replace mock data dispatches with actual
 * API calls in the slice thunks.
 */
const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    wishlist: wishlistReducer,
    notifications: notificationReducer,
    sellers: sellerReducer,
    ui: uiReducer,
  },
});

export default store;
