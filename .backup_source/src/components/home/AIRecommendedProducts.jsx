import { useEffect, useState } from 'react';
import { HiOutlineSparkles } from 'react-icons/hi2';
import api from '../../services/api';
import ProductCard from '../product/ProductCard';
import Skeleton from '../common/Skeleton';

const AIRecommendedProducts = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [strategy, setStrategy] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await api.get('/ai/recommendations.php?limit=4');
        if (response.data?.success) {
          setRecommendations(response.data.data.recommendations || []);
          setStrategy(response.data.data.strategy || '');
        }
      } catch (err) {
        console.error('Failed to fetch recommendations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <section className="py-12 bg-primary-50 dark:bg-primary-900/10">
        <div className="max-w-7xl mx-auto px-4">
          <Skeleton className="w-48 h-8 mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-80 rounded-2xl" />)}
          </div>
        </div>
      </section>
    );
  }

  if (recommendations.length === 0) return null;

  const getTitle = () => {
    switch (strategy) {
      case 'personalized': return 'Recommended for You';
      case 'wishlist': return 'Based on Your Wishlist';
      default: return 'Trending Near You';
    }
  };

  return (
    <section className="py-12 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-8">
          <div className="p-2 bg-white dark:bg-surface-800 rounded-lg shadow-sm text-primary-500">
            <HiOutlineSparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white">{getTitle()}</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {recommendations.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AIRecommendedProducts;

// 
// 
// 
// 
// 