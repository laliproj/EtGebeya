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
