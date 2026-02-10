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
