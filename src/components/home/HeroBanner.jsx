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

