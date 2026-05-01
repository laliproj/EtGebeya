import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { HiOutlineHeart, HiOutlineTrash } from 'react-icons/hi2';
import ProductCard from '../../components/product/ProductCard';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { clearWishlist } from '../../store/wishlistSlice';
import productService from '../../services/productService';

const WishlistPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { wishlistIds } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchWishlistProducts = async () => {
      setLoading(true);
      try {
        if (wishlistIds.length === 0) {
          setProducts([]);
          return;
        }
        
        // In a real app, you'd probably send an array of IDs to the backend
        // For the mock, we fetch all and filter
        const allProducts = await productService.getAll();
        const wishlistItems = allProducts.filter(p => wishlistIds.includes(p.id));
        setProducts(wishlistItems);
      } catch (error) {
        console.error('Failed to fetch wishlist', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlistIds, isAuthenticated, navigate]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-surface-200 dark:border-surface-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white flex items-center gap-3">
            <HiOutlineHeart className="w-8 h-8 text-danger-500" />
            My Wishlist
          </h1>
          <p className="text-surface-500 mt-1">
            {wishlistIds.length} {wishlistIds.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {wishlistIds.length > 0 && (
          <Button 
            variant="ghost" 
            onClick={() => dispatch(clearWishlist())}
            icon={HiOutlineTrash}
            className="text-danger-500 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20"
          >
            Clear Wishlist
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-80 bg-surface-200 dark:bg-surface-800 rounded-2xl"></div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 py-16">
          <EmptyState
            icon={HiOutlineHeart}
            title="Your wishlist is empty"
            description="Save items you like to your wishlist to keep track of them."
            actionLabel="Browse Products"
            actionTo="/products"
          />
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
