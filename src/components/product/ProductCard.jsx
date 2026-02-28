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
            variant={product.condition === 'New' ? 'success' : 'surface'} 
            className="shadow-sm backdrop-blur-md bg-white/90 dark:bg-surface-900/90"
          >
            {product.condition}
          </Badge>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 dark:bg-surface-900/80 backdrop-blur-md shadow-sm hover:scale-110 transition-transform duration-200"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isWishlisted ? (
            <HiHeart className="w-5 h-5 text-danger-500" />
          ) : (
            <HiOutlineHeart className="w-5 h-5 text-surface-600 dark:text-surface-300 hover:text-danger-500 dark:hover:text-danger-400 transition-colors" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
            {product.brand}
          </p>
          <p className="text-lg font-bold text-surface-900 dark:text-white shrink-0">
            {formatPrice(product.price)}
          </p>
        </div>

        <h3 className="text-sm font-medium text-surface-800 dark:text-surface-100 line-clamp-2 mb-4 flex-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {product.title}
        </h3>

        <div className="mt-auto space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-surface-500 dark:text-surface-400">
            <HiOutlineMapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{product.location}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-surface-500 dark:text-surface-400">
            <div className="flex items-center gap-1.5">
              <HiOutlineClock className="w-3.5 h-3.5 shrink-0" />
              <span>{timeAgo(product.postedAt)}</span>
            </div>
            <span className="font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide">
              {product.condition}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;

// 
// 
// 
// 
// 