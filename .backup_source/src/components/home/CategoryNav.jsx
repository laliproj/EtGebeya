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
            className="group flex flex-col items-center gap-3 min-w-[100px] sm:min-w-[120px] snap-start"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 flex items-center justify-center text-4xl shadow-sm group-hover:shadow-md group-hover:border-primary-500/50 dark:group-hover:border-primary-500/50 group-hover:-translate-y-1 transition-all duration-300">
              {category.icon}
            </div>
            <div className="text-center">
              <span className="block text-sm font-medium text-surface-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {category.name}
              </span>
              <span className="text-xs text-surface-500">
                {category.count.toLocaleString()} items
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryNav;
