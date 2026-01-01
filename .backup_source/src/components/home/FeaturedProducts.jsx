import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../product/ProductCard';
import { ProductCardSkeleton } from '../common/Skeleton';
import productService from '../../services/productService';

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await productService.getFeatured();
        setProducts(data.slice(0, 4));
      } catch (error) {
        console.error('Failed to fetch featured products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <section className="py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
            Featured Products
            <span className="text-xl">🔥</span>
          </h2>
          <p className="text-sm text-surface-500 mt-1">Handpicked premium items</p>
        </div>
        <Link 
          to="/products?featured=true" 
          className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors hidden sm:block"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading
          ? [...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)
          : products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;
