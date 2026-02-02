import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { HiHeart, HiOutlineHeart, HiOutlineMapPin, HiOutlineClock } from 'react-icons/hi2';
import Badge from '../common/Badge';
import { formatPrice, timeAgo } from '../../utils/helpers';
import { toggleWishlistAPI } from '../../store/wishlistSlice';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { wishlistIds } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const isWishlisted = wishlistIds.includes(product.id);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(toggleWishlistAPI(product.id));
  };

  return (
    <Link 
      to={`/products/${product.id}`}
      className="group flex flex-col bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
