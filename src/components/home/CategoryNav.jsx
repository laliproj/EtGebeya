import { Link } from 'react-router-dom';
import categoriesData from '../../data/categories.json';

const CategoryNav = () => {
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6 px-4">
        <h2 className="text-xl font-bold text-surface-900 dark:text-white">
          Explore Categories
        </h2>
        <Link 
          to="/products" 
          className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
        >
          View All
        </Link>
      </div>

      {/* Horizontal Scrollable Container */}
      <div className="flex overflow-x-auto hide-scrollbar gap-4 px-4 pb-4 snap-x">
        {categoriesData.map((category, index) => (
          <Link
            key={category.id}
            to={`/products?category=${category.slug}`}
