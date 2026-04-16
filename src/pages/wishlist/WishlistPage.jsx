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
