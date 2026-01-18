        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {data.products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AITrendingProducts;

// 
// 
// 
// import { useEffect, useState } from 'react';
import { HiOutlineFire, HiOutlineArrowTrendingUp } from 'react-icons/hi2';
import api from '../../services/api';
import ProductCard from '../product/ProductCard';
import Skeleton from '../common/Skeleton';
import { useNavigate } from 'react-router-dom';

const AITrendingProducts = () => {
  const [data, setData] = useState({ searches: [], products: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await api.get('/ai/trending.php');
        if (response.data?.success) {
          setData(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch trending', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  if (loading) {
    return (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Skeleton className="w-48 h-8 mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
          </div>
        </div>
      </section>
    );
  }

  if (!data.products.length) return null;

  return (
    <section className="py-12 border-t border-surface-200/50 dark:border-surface-800/50">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-danger-50 dark:bg-danger-900/20 rounded-lg text-danger-500">
              <HiOutlineFire className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white">Trending Right Now</h2>
          </div>

          {/* Trending Searches Pills */}
          {data.searches?.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              <span className="text-sm font-medium text-surface-500 flex items-center gap-1 shrink-0">
                <HiOutlineArrowTrendingUp className="w-4 h-4" /> Popular searches:
              </span>
              {data.searches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(`/products?search=${encodeURIComponent(search)}`)}
                  className="px-3 py-1.5 bg-surface-100 dark:bg-surface-800 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 rounded-full text-xs font-medium text-surface-700 dark:text-surface-300 whitespace-nowrap transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          )}
