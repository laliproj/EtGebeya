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
    sortBy: 'newest',
  },
};

const applyFilters = (state) => {
  let filtered = [...state.items];

  if (state.filters.category) {
    filtered = filtered.filter(p => p.category === state.filters.category);
  }
  if (state.filters.brand) {
    // Check if brand matches, or if the title contains the brand name (making it more robust)
    const targetBrand = state.filters.brand.toLowerCase();
    filtered = filtered.filter(p => 
      (p.brand && p.brand.toLowerCase() === targetBrand) || 
      p.title.toLowerCase().includes(targetBrand)
    );
  }
  if (state.filters.condition) {
    filtered = filtered.filter(p => p.condition === state.filters.condition);
  }
  if (state.filters.priceMin) {
    filtered = filtered.filter(p => p.price >= Number(state.filters.priceMin));
  }
  if (state.filters.priceMax) {
    filtered = filtered.filter(p => p.price <= Number(state.filters.priceMax));
  }
  if (state.filters.search) {
    const searchLower = state.filters.search.toLowerCase();
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(searchLower) ||
      (p.description && p.description.toLowerCase().includes(searchLower)) ||
      (p.brand && p.brand.toLowerCase().includes(searchLower))
    );
  }
  if (state.filters.storage) {
    filtered = filtered.filter(p => p.specs?.storage === state.filters.storage);
  }
  if (state.filters.ram) {
    filtered = filtered.filter(p => p.specs?.ram === state.filters.ram);
  }

  // Sorting
  switch (state.filters.sortBy) {
    case 'newest':
      filtered.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
      break;
    case 'price-low':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'popular':
      filtered.sort((a, b) => b.views - a.views);
      break;
    default:
      break;
  }

  state.filteredItems = filtered;
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts(state, action) {
      state.items = action.payload;
      applyFilters(state);
    },
    setCurrentProduct(state, action) {
      state.currentProduct = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
      applyFilters(state);
    },
    clearFilters(state) {
      state.filters = initialState.filters;
      state.filteredItems = state.items;
    },
    addProduct(state, action) {
      state.items.unshift(action.payload);
      applyFilters(state);
    },
  },
});

export const {
  setProducts, setCurrentProduct, setLoading, setError,
  setFilters, clearFilters, addProduct,
} = productSlice.actions;

export default productSlice.reducer;
