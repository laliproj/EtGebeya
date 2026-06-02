import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { HiOutlineFunnel, HiOutlineXMark } from 'react-icons/hi2';
import { setFilters, clearFilters } from '../../store/productSlice';
import Button from '../common/Button';
import categoriesData from '../../data/categories.json';
import brandsData from '../../data/brands.json';

const FilterSidebar = ({ onClose }) => {
  const dispatch = useDispatch();
  const currentFilters = useSelector((state) => state.products.filters);
  
  // Local state for filters to apply on submit
  const [localFilters, setLocalFilters] = useState(currentFilters);
  
  // Update local filters when currentFilters change
  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  const handleChange = (name, value) => {
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    dispatch(setFilters(localFilters));
    if (onClose) onClose();
  };

  const handleClear = () => {
    dispatch(clearFilters());
    if (onClose) onClose();
  };

  // Get brands for selected category, or all brands if no category selected
  const availableBrands = localFilters.category 
    ? brandsData[localFilters.category] || []
    : Object.values(brandsData).flat().filter((v, i, a) => a.findIndex(t => t.name === v.name) === i);

  return (
    <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-100 dark:border-surface-800">
        <h2 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
          <HiOutlineFunnel className="w-5 h-5" />
          Filters
        </h2>
        {onClose && (
          <button onClick={onClose} className="p-1 text-surface-400 hover:text-surface-900 dark:hover:text-white md:hidden">
            <HiOutlineXMark className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 hide-scrollbar">
        {/* Category Filter */}
        <div>
          <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-3">Category</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="radio" 
                name="category"
                checked={localFilters.category === ''}
                onChange={() => handleChange('category', '')}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-surface-300 rounded-full"
              />
              <span className="text-sm text-surface-600 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-white">All Categories</span>
            </label>
            {categoriesData.map(category => (
              <label key={category.id} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="radio" 
                  name="category"
                  checked={localFilters.category === category.slug}
                  onChange={() => handleChange('category', category.slug)}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-surface-300 rounded-full"
                />
                <span className="text-sm text-surface-600 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-white">
                  {category.name}
                </span>
              </label>
