import { Link } from 'react-router-dom';
import { HiOutlineArrowRight } from 'react-icons/hi2';

const HeroBanner = () => {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-surface-900 rounded-3xl mx-4 mt-4 pt-16 md:pt-4 animate-scale-in border border-surface-200 dark:border-surface-800">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-20 w-72 h-72 bg-accent-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative flex flex-col md:flex-row items-center justify-between p-8 md:p-12 lg:p-16 gap-8">
        {/* Text Content */}
        <div className="flex-1 text-center md:text-left z-10">
          <span className="inline-block py-1 px-3 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-semibold tracking-wider mb-4">
            NEW ARRIVALS
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-surface-900 dark:text-white leading-tight mb-6">
            Upgrade Your <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400">
              Tech Lifestyle
            </span>
          </h1>
          <p className="text-surface-600 dark:text-surface-300 text-sm md:text-base max-w-lg mx-auto md:mx-0 mb-8">
            Discover the latest electronics, from premium smartphones to professional gear. Buy, sell, and trade safely with trusted verified sellers.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
            <Link 
              to="/products"
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
            >
              Shop Now
              <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              to="/products/new"
              className="w-full sm:w-auto px-8 py-3.5 bg-surface-100 dark:bg-white/10 text-surface-900 dark:text-white font-medium rounded-xl hover:bg-surface-200 dark:hover:bg-white/20 transition-colors backdrop-blur-md flex items-center justify-center"
            >
              Start Selling
            </Link>
          </div>
        </div>

        {/* Hero Image / Mockup (using CSS and an image) */}
        <div className="flex-1 w-full max-w-md lg:max-w-lg z-10 relative hidden md:block">
          <div className="relative animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <img 
              src="https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80" 
              onError={(e) => { e.target.src = 'https://placehold.co/800x600/f3f4f6/a3a3a3?text=Premium+Tech' }}
              alt="Premium Smartphone" 
              className="w-full h-auto rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/50 ring-1 ring-surface-200 dark:ring-white/10 rotate-[-5deg] hover:rotate-0 transition-transform duration-500"
            />
            {/* Floating element 1 */}
            <div className="absolute -top-6 -right-6 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl animate-pulse-soft">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success-500/20 rounded-full flex items-center justify-center">
                  <span className="text-success-400 font-bold">100%</span>
                </div>
                <div>
                  <p className="text-surface-900 dark:text-white text-xs font-semibold">Verified Sellers</p>
                  <p className="text-surface-500 dark:text-surface-400 text-[10px]">Safe & Secure</p>
                </div>
              </div>
            </div>
            {/* Floating element 2 */}
            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 p-4 rounded-2xl shadow-xl">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <img className="w-8 h-8 rounded-full border-2 border-white dark:border-surface-900" src="https://ui-avatars.com/api/?name=JS&background=random" alt="" />
                  <img className="w-8 h-8 rounded-full border-2 border-white dark:border-surface-900" src="https://ui-avatars.com/api/?name=AK&background=random" alt="" />
                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-surface-900 bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-[10px] text-surface-900 dark:text-white">+2k</div>
                </div>
                <div className="ml-2 text-left">
                  <p className="text-surface-900 dark:text-white text-xs font-semibold">Active Users</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
