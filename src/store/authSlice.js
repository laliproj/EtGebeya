import { createSlice } from '@reduxjs/toolkit';

/**
 * Auth Slice
 * 
 * BACKEND INTEGRATION NOTE:
 * Replace the mock login/register logic with actual API calls to:
 * - POST /api/login
 * - POST /api/register
 * - POST /api/forgot-password
 * - GET /api/user/profile
 * Store JWT token in localStorage and attach to Axios headers.
 */

const storedUser = localStorage.getItem('user');

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  isAuthenticated: !!storedUser,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
