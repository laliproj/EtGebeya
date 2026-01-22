import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineClock } from 'react-icons/hi2';
import ProductCard from '../product/ProductCard';
import { ProductCardSkeleton } from '../common/Skeleton';
import productService from '../../services/productService';

const RecentProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const data = await productService.getRecent();
        setProducts(data.slice(0, 8)); // Get 8 recent items
      } catch (error) {
        console.error('Failed to fetch recent products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  return (
    <section className="py-8 bg-surface-50 dark:bg-surface-900/50 mt-8 border-y border-surface-200/50 dark:border-surface-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
              <HiOutlineClock className="w-6 h-6 text-primary-500" />
              Recently Added
            </h2>
            <p className="text-sm text-surface-500 mt-1">Fresh listings from our community</p>
          </div>
          <Link 
            to="/products?sort=newest" 
            className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading
            ? [...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>
      </div>
    </section>
  );
};

export default RecentProducts;
