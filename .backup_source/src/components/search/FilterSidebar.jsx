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
            ))}
          </div>
        </div>

        {/* Brand Filter */}
        <div>
          <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-3">Brand</h3>
          <select 
            className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3 py-2 text-sm text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500/30"
            value={localFilters.brand}
            onChange={(e) => handleChange('brand', e.target.value)}
          >
            <option value="">All Brands</option>
            {availableBrands.map((brand, i) => (
              <option key={i} value={brand.name}>{brand.name}</option>
            ))}
          </select>
        </div>

        {/* Condition Filter */}
        <div>
          <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-3">Condition</h3>
          <div className="flex flex-wrap gap-2">
            {['New', 'Used'].map(condition => (
              <button
                key={condition}
                onClick={() => handleChange('condition', localFilters.condition === condition ? '' : condition)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  localFilters.condition === condition
                    ? 'bg-primary-600 text-white border border-primary-600'
                    : 'bg-surface-50 dark:bg-surface-800 text-surface-600 dark:text-surface-400 border border-surface-200 dark:border-surface-700 hover:border-surface-300'
                }`}
              >
                {condition}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div>
          <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-3">Price Range</h3>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-sm">$</span>
              <input
                type="number"
                placeholder="Min"
                value={localFilters.priceMin}
                onChange={(e) => handleChange('priceMin', e.target.value)}
                className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl pl-6 pr-3 py-2 text-sm text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500/30"
              />
            </div>
            <span className="text-surface-400">-</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-sm">$</span>
              <input
                type="number"
                placeholder="Max"
                value={localFilters.priceMax}
                onChange={(e) => handleChange('priceMax', e.target.value)}
                className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl pl-6 pr-3 py-2 text-sm text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500/30"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 mt-6 border-t border-surface-100 dark:border-surface-800 flex gap-3">
        <Button variant="outline" fullWidth onClick={handleClear}>
          Clear
        </Button>
        <Button variant="primary" fullWidth onClick={handleApply}>
          Apply
        </Button>
      </div>
    </div>
  );
};

export default FilterSidebar;
