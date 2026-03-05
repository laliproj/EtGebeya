import { createSlice } from '@reduxjs/toolkit';
import productsData from '../data/products.json';

/**
 * Product Slice
 * 
 * BACKEND INTEGRATION NOTE:
 * Replace mock data with API calls to:
 * - GET /api/products (list with filters)
 * - GET /api/products/:id (single product)
 * - POST /api/products (create listing)
 * - PUT /api/products/:id (update listing)
 * - DELETE /api/products/:id (delete listing)
 */

const initialState = {
  items: productsData,
  filteredItems: productsData,
  currentProduct: null,
  loading: false,
  error: null,
  filters: {
    category: '',
    brand: '',
    condition: '',
    priceMin: '',
    priceMax: '',
    search: '',
    storage: '',
    ram: '',
    processor: '',
    screenSize: '',
    camera: '',
    battery: '',
