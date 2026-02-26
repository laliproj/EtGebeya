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
