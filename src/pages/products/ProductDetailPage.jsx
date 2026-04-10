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
