import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { HiOutlineMapPin, HiOutlineCalendar, HiOutlineShieldCheck } from 'react-icons/hi2';
import ProductCard from '../../components/product/ProductCard';
import Rating from '../../components/common/Rating';
import { ProductCardSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import sellerService from '../../services/sellerService';
import { formatDate } from '../../utils/helpers';

const SellerProfilePage = () => {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('listings');

  useEffect(() => {
    const fetchSellerData = async () => {
      setLoading(true);
      try {
        const [sellerData, productsData, reviewsData] = await Promise.all([
          sellerService.getById(id),
          sellerService.getProducts(id),
          sellerService.getReviews(id)
        ]);
        setSeller(sellerData);
        setProducts(productsData);
        setReviews(reviewsData);
      } catch (error) {
        console.error('Failed to fetch seller profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSellerData();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-48 bg-surface-200 dark:bg-surface-800 rounded-3xl mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (!seller) {
    return <EmptyState title="Seller Not Found" description="The requested seller profile does not exist or has been removed." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Seller Header */}
      <div className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 p-6 md:p-10 shadow-sm mb-8 relative overflow-hidden">
        {/* Background Banner */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-primary-600 to-accent-600 opacity-10"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
          <img 
            src={seller.avatar} 
            alt={seller.name} 
            className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-surface-900 shadow-lg"
          />
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
              <h1 className="text-3xl font-bold text-surface-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
                {seller.name}
                {seller.isVerified && <HiOutlineShieldCheck className="w-6 h-6 text-success-500" title="Verified Seller" />}
              </h1>
              <Rating value={seller.trustScore || 0} count={seller.totalRatings || 0} size="md" showValue />
            </div>

            {/* AI Trust Badge */}
            <div className="flex justify-center md:justify-start mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/30 dark:to-accent-900/30 border border-primary-200 dark:border-primary-800/50 rounded-lg shadow-sm">
                <HiOutlineShieldCheck className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <span className="text-sm font-bold text-surface-900 dark:text-white">Trust Score:</span>
                <span className="text-sm font-black text-primary-600 dark:text-primary-400">{seller.trustScore || 50}/100</span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded uppercase">
                  {seller.trustScore >= 90 ? 'Platinum' : seller.trustScore >= 75 ? 'Gold' : seller.trustScore >= 60 ? 'Silver' : 'Bronze'}
                </span>
              </div>
            </div>
            
            <p className="text-surface-600 dark:text-surface-300 max-w-2xl mx-auto md:mx-0 mb-4">
              {seller.bio || 'No bio provided.'}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 text-sm text-surface-500">
              <div className="flex items-center gap-1.5">
                <HiOutlineMapPin className="w-4 h-4 shrink-0" />
                {seller.location}
              </div>
              <div className="flex items-center gap-1.5">
                <HiOutlineCalendar className="w-4 h-4 shrink-0" />
                Joined {formatDate(seller.joinDate)}
              </div>
              <div className="px-3 py-1 bg-surface-100 dark:bg-surface-800 rounded-lg font-medium text-surface-900 dark:text-white">
                {seller.totalSold} Items Sold
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-200 dark:border-surface-800 mb-8 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'listings'
              ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
              : 'border-transparent text-surface-500 hover:text-surface-900 dark:hover:text-white'
          }`}
        >
          Active Listings ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'reviews'
              ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
              : 'border-transparent text-surface-500 hover:text-surface-900 dark:hover:text-white'
          }`}
        >
          Reviews ({reviews.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'listings' ? (
          products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState title="No Active Listings" description="This seller doesn't have any items for sale right now." />
          )
        ) : (
          reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map(review => (
                <div key={review.id} className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800">
                  <div className="flex items-center justify-between mb-4">
                    <Rating value={review.rating} size="sm" />
                    <span className="text-xs text-surface-400">{formatDate(review.date)}</span>
                  </div>
                  <p className="text-surface-700 dark:text-surface-300 text-sm mb-4">"{review.comment}"</p>
                  <p className="text-xs font-medium text-surface-500">— {review.author}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No Reviews Yet" description="This seller hasn't received any reviews." />
          )
        )}
      </div>
    </div>
  );
};

export default SellerProfilePage;
