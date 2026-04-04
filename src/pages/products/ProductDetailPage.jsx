import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  HiOutlineHeart, HiHeart, HiOutlineMapPin, HiOutlineClock, 
  HiOutlineShieldCheck, HiOutlineChatBubbleLeftEllipsis, HiOutlineExclamationTriangle,
  HiOutlinePhone, HiStar, HiOutlineStar, HiOutlineUser, HiOutlineCheckCircle,
  HiOutlineHandRaised
} from 'react-icons/hi2';
import { toast } from 'react-hot-toast';

import ProductGallery from '../../components/product/ProductGallery';
import ProductSpecs from '../../components/product/ProductSpecs';
import SimilarProducts from '../../components/product/SimilarProducts';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Rating from '../../components/common/Rating';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ReportModal from '../../components/report/ReportModal';
import AIAnalysisWidget from '../../components/product/AIAnalysisWidget';
import NegotiationModal from '../../components/product/NegotiationModal';

import productService from '../../services/productService';
import sellerService from '../../services/sellerService';
import { toggleWishlistAPI } from '../../store/wishlistSlice';
import { formatPrice, timeAgo, formatDate } from '../../utils/helpers';

// ─── Seller Reviews Section ─────────────────────────────────────────────────
const SellerReviewsSection = ({ seller, isAuthenticated }) => {
  const { user } = useSelector((state) => state.auth);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await sellerService.getSellerReviews(seller.id);
        setReviews(data);
        // Check if current user already reviewed
        if (user && data.some(r => r.author === user.name)) {
          setHasReviewed(true);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [seller.id, user]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (userRating === 0) {
      toast.error('እባክዎ ደረጃ ይስጡ (Please select a rating)');
      return;
    }
    if (!comment.trim()) {
      toast.error('እባክዎ አስተያየትዎን ያስገቡ (Please write a comment)');
      return;
    }
    setSubmitting(true);
    try {
      await sellerService.rateSeller(seller.id, userRating, comment);
      toast.success('አስተያየትዎ ተልኳል! (Review submitted successfully!)');
      setHasReviewed(true);
      // Refresh reviews
      const data = await sellerService.getSellerReviews(seller.id);
      setReviews(data);
      setComment('');
      setUserRating(0);
    } catch (err) {
      toast.error(err.message || 'አስተያየት ማስገባት አልተሳካም');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 p-6 md:p-8 shadow-sm mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-warning-50 dark:bg-warning-900/20 rounded-xl flex items-center justify-center text-warning-500">
          <HiStar className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-surface-900 dark:text-white">የሻጩ ግምገማዎች</h3>
          <p className="text-sm text-surface-500">Seller Reviews & Ratings</p>
        </div>
        {reviews.length > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <Rating value={seller.trustScore || 0} count={reviews.length} size="md" showValue />
          </div>
        )}
      </div>

      {/* Submit Review */}
      {isAuthenticated && !hasReviewed && user?.id !== seller.id && (
        <div className="mb-8 p-5 bg-surface-50 dark:bg-surface-800/50 rounded-2xl border border-surface-200 dark:border-surface-700">
          <h4 className="font-semibold text-surface-900 dark:text-white mb-4">አስተያየት ይፃፉ — Write a Review</h4>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Star picker */}
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">ደረጃ (Rating)</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    {star <= (hoverRating || userRating)
                      ? <HiStar className="w-8 h-8 text-warning-400" />
                      : <HiOutlineStar className="w-8 h-8 text-surface-300 dark:text-surface-600" />
                    }
                  </button>
                ))}
                {userRating > 0 && (
                  <span className="ml-2 text-sm font-medium text-surface-600 dark:text-surface-400">
                    {['', 'ደካማ', 'መካከለኛ', 'ጥሩ', 'በጣም ጥሩ', 'እጹብ ድንቅ'][userRating]}
                    {' '}({['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][userRating]})
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                አስተያየት (Comment)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="ስለ ሻጩ ምን ያስባሉ? — What do you think about this seller?"
                className="w-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 text-sm text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 resize-none transition-all"
              />
            </div>

            <Button type="submit" variant="primary" isLoading={submitting} size="sm">
              አስተያየት አስገባ — Submit Review
            </Button>
          </form>
        </div>
      )}

      {hasReviewed && isAuthenticated && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-success-50 dark:bg-success-900/20 rounded-xl border border-success-200 dark:border-success-800/50">
          <HiOutlineCheckCircle className="w-5 h-5 text-success-600 shrink-0" />
          <p className="text-sm text-success-800 dark:text-success-400">አስተያየትዎ ቀድሞ ቀርቧል። (You have already reviewed this seller.)</p>
        </div>
      )}

      {!isAuthenticated && (
        <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-800/50">
          <p className="text-sm text-primary-800 dark:text-primary-400">
            <Link to="/login" className="font-bold underline">ይግቡ (Login)</Link> አስተያየት ለመስጠት — to write a review.
          </p>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 bg-surface-50 dark:bg-surface-800/50 rounded-2xl border border-surface-100 dark:border-surface-700">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {review.author?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-surface-900 dark:text-white text-sm">{review.author}</p>
                    <p className="text-xs text-surface-400">{formatDate(review.date)}</p>
                  </div>
                </div>
                <Rating value={review.rating} size="sm" />
              </div>
              {review.comment && (
                <p className="text-sm text-surface-700 dark:text-surface-300 pl-12 leading-relaxed">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <HiOutlineUser className="w-10 h-10 text-surface-300 mx-auto mb-3" />
          <p className="text-surface-500 text-sm">ገና ምንም ግምገማ የለም — No reviews yet. Be the first!</p>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { wishlistIds } = useSelector((state) => state.wishlist);

  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isNegotiationOpen, setIsNegotiationOpen] = useState(false);
  const [phoneRevealed, setPhoneRevealed] = useState(false);

  const isWishlisted = product ? wishlistIds.includes(product.id) : false;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const productData = await productService.getById(id);
        setProduct(productData);
        
        // Fetch seller separately — don't let seller errors hide the product
        if (productData.sellerId) {
          try {
            const sellerData = await sellerService.getSellerById(productData.sellerId);
            setSeller(sellerData);
          } catch {
            // Seller load failed, show product without seller section
            setSeller(null);
          }
        }
      } catch (err) {
        setError('ምርቱ አልተገኘም ወይም ተወግዷል። (Product not found or has been removed.)');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      toast.error('ምርቱን ለማስቀመጥ እባክዎ ይግቡ (Please login to save items)');
      navigate('/login');
      return;
    }
    dispatch(toggleWishlistAPI(product.id));
    toast.success(isWishlisted ? 'ከምርጦቼ ተወግዷል' : 'ወደ ምርጦቼ ተጨምሯል');
  };

  const handleReport = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsReportModalOpen(true);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-3/5">
            <Skeleton className="w-full aspect-[4/3] rounded-2xl" />
            <div className="flex gap-4 mt-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="w-20 h-20 rounded-xl" />)}
            </div>
          </div>
          <div className="w-full lg:w-2/5 space-y-6">
            <Skeleton className="w-24 h-6" />
            <Skeleton className="w-3/4 h-10" />
            <Skeleton className="w-1/2 h-8" />
            <Skeleton className="w-full h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20">
        <EmptyState
          title="ምርቱ አልተገኘም"
          description={error}
          actionLabel="ወደ መነሻ ይሂዱ"
          actionTo="/"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex text-sm text-surface-500 mb-6">
        <Link to="/" className="hover:text-primary-600 transition-colors">መነሻ</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-primary-600 transition-colors">ኤሌክትሮኒክስ</Link>
        <span className="mx-2">/</span>
        <Link to={`/products?category=${product.category}`} className="capitalize hover:text-primary-600 transition-colors">
          {product.category}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-surface-900 dark:text-surface-300 truncate">{product.title}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Left Column: Gallery & Specs */}
        <div className="w-full lg:w-3/5 flex flex-col gap-12">
          <ProductGallery images={product.images} title={product.title} />
          
          <div className="hidden lg:block">
            <ProductSpecs specs={product.specs} features={product.features} />
          </div>
        </div>

        {/* Right Column: Info & Actions */}
        <div className="w-full lg:w-2/5">
          <div className="sticky top-24 space-y-6">
            
            {/* Title & Price Section */}
            <div className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-4">
                <Badge variant={product.condition === 'New' ? 'success' : 'surface'}>
                  {product.condition === 'New' ? 'አዲስ' : 'ሁለተኛ እጅ'} — {product.condition}
                </Badge>
                <div className="flex items-center gap-2 text-surface-500 text-sm">
                  <HiOutlineClock className="w-4 h-4" />
                  {timeAgo(product.postedAt)}
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-white leading-tight mb-4">
                {product.title}
              </h1>

              <div className="flex items-end justify-between mb-6 pb-6 border-b border-surface-100 dark:border-surface-800">
                <div>
                  <p className="text-xs text-surface-500 mb-1">ዋጋ (Price)</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                    {formatPrice(product.price)}
                  </p>
                  <p className="text-xs text-surface-400 mt-1">ብር (Ethiopian Birr)</p>
                  {seller && (
                    <div className="flex gap-2 w-full mt-4">
                      <Link 
                        to={`/seller/${seller.id}`}
                        className="flex-1 text-center py-2 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-900 dark:text-white rounded-xl text-sm font-medium transition-colors"
                      >
                        ፕሮፋይል (Profile)
                      </Link>
                      {user?.id?.toString() !== seller.id?.toString() && (
                        <Link 
                          to={`/messages?user_id=${seller.id}&product_id=${product.id}`}
                          className="flex-1 text-center py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-colors"
                        >
                          መልዕክት (Message)
                        </Link>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleWishlistToggle}
                  className="p-3 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 hover:text-danger-500 transition-colors group"
                >
                  {isWishlisted ? (
                    <HiHeart className="w-7 h-7 text-danger-500" />
                  ) : (
                    <HiOutlineHeart className="w-7 h-7 group-hover:scale-110 transition-transform" />
                  )}
                </button>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-semibold text-surface-900 dark:text-white mb-2">መግለጫ (Description)</h3>
                <p className="text-surface-600 dark:text-surface-300 text-sm leading-relaxed whitespace-pre-line">
                  {product.description}
