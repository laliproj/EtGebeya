import HeroBanner from '../../components/home/HeroBanner';
import CategoryNav from '../../components/home/CategoryNav';
import FeaturedProducts from '../../components/home/FeaturedProducts';
import RecentProducts from '../../components/home/RecentProducts';
import TrendingBrands from '../../components/home/TrendingBrands';
import AIRecommendedProducts from '../../components/home/AIRecommendedProducts';
import AITrendingProducts from '../../components/home/AITrendingProducts';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <HeroBanner />
      
      <div className="max-w-7xl mx-auto space-y-8">
        <CategoryNav />
      </div>

      <AITrendingProducts />
      
      <div className="max-w-7xl mx-auto space-y-8">
        <FeaturedProducts />
      </div>

      <AIRecommendedProducts />

      <RecentProducts />

      <div className="max-w-7xl mx-auto">
        <TrendingBrands />
      </div>
    </div>
  );
};

export default HomePage;
