import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { HiOutlineFunnel, HiOutlineArrowsUpDown } from 'react-icons/hi2';
import FilterSidebar from '../../components/search/FilterSidebar';
import ProductCard from '../../components/product/ProductCard';
import { ProductCardSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import { setFilters, setProducts } from '../../store/productSlice';
import productService from '../../services/productService';
import api from '../../services/api';

const ProductListPage = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { filteredItems, filters } = useSelector((state) => state.products);
  
  const [loading, setLoading] = useState(true);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Initialize filters from URL params
  useEffect(() => {
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const search = searchParams.get('search');
    
    if (category || brand || search) {
      dispatch(setFilters({
        category: category || '',
        brand: brand || '',
        search: search || '',
      }));
    }
  }, [searchParams, dispatch]);

  // Fetch products (AI Smart Search or All)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const search = searchParams.get('search');
        if (search && search.trim() !== '') {
          // Use AI Smart Search
          const response = await api.get(`/ai/smart_search.php?q=${encodeURIComponent(search)}`);
          if (response.data?.success) {
            dispatch(setProducts(response.data.data.results));
            // Optional: update filters with AI intent
          }
        } else {
          // Standard fetch
          const data = await productService.getAll();
          dispatch(setProducts(data));
        }
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('search')]);

  const handleSortChange = (e) => {
    dispatch(setFilters({ sortBy: e.target.value }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white">
            {filters.search 
              ? `Search results for "${filters.search}"`
              : filters.category 
                ? `${filters.category.charAt(0).toUpperCase() + filters.category.slice(1)}` 
                : 'All Products'}
          </h1>
