import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { ProductCardSkeleton } from '../common/Skeleton';
import productService from '../../services/productService';

const SimilarProducts = ({ productId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        const data = await productService.getSimilar(productId);
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch similar products', error);
      } finally {
        setLoading(false);
      }
    };
    if (productId) {
      fetchSimilar();
    }
  }, [productId]);

  if (!loading && products.length === 0) return null;

  return (
    <div className="mt-16">
      <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-6">
        Similar Products
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading
          ? [...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)
          : products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>
    </div>
  );
};

export default SimilarProducts;
