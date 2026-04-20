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
          <p className="text-surface-500 mt-1">
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="md:hidden flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm font-medium text-surface-700 dark:text-surface-300 shadow-sm"
          >
            <HiOutlineFunnel className="w-4 h-4" />
            Filters
          </button>

          {/* Sort Dropdown */}
          <div className="relative flex items-center bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl shadow-sm px-3 py-2">
            <HiOutlineArrowsUpDown className="w-4 h-4 text-surface-400 mr-2 shrink-0" />
            <select
              value={filters.sortBy}
              onChange={handleSortChange}
              className="bg-transparent text-sm font-medium text-surface-700 dark:text-surface-300 focus:outline-none cursor-pointer pr-4"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 shrink-0 sticky top-24 h-[calc(100vh-8rem)]">
          <FilterSidebar />
        </div>

        {/* Mobile Sidebar Modal */}
        <Modal 
          isOpen={isMobileFiltersOpen} 
          onClose={() => setIsMobileFiltersOpen(false)}
          title="Filters"
        >
          <FilterSidebar onClose={() => setIsMobileFiltersOpen(false)} />
        </Modal>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 py-12">
              <EmptyState
                icon={HiOutlineFunnel}
                title="No products found"
                description="Try adjusting your filters or search terms to find what you're looking for."
                actionLabel="Clear Filters"
                onAction={() => dispatch(setFilters({ category: '', brand: '', search: '', condition: '', priceMin: '', priceMax: '' }))}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;
