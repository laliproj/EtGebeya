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
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-100 dark:bg-surface-800">
        {!imageLoaded && (
          <div className="absolute inset-0 skeleton" />
        )}
        <img
          src={product.images[0]}
          alt={product.title}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isFeatured && (
            <Badge variant="warning" className="shadow-sm shadow-warning-500/20 backdrop-blur-md bg-warning-500/90 text-white border-none">
              Featured
            </Badge>
          )}
          {product.status === 'pending' && (
            <Badge variant="warning" className="shadow-sm backdrop-blur-md bg-warning-500/90 text-white border-none">
              Pending Approval
            </Badge>
          )}
          {product.status === 'rejected' && (
            <Badge variant="danger" className="shadow-sm backdrop-blur-md bg-danger-500/90 text-white border-none">
              Rejected
            </Badge>
          )}
          <Badge 
