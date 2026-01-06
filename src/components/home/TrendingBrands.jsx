import { Link } from 'react-router-dom';
import brandsData from '../../data/brands.json';

const TrendingBrands = () => {
  // Extract top brands across categories
  const allBrands = Object.values(brandsData).flat();
  const uniqueBrands = Array.from(new Set(allBrands.map(b => b.name)))
    .map(name => allBrands.find(b => b.name === name))
    .filter(b => b.name !== 'Generic')
    .slice(0, 10);

  return (
    <section className="py-12 px-4">
      <div className="text-center mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-surface-900 dark:text-white">
          Trending Brands
        </h2>
        <p className="text-sm text-surface-500 mt-2">Top electronics brands in our marketplace</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {uniqueBrands.map((brand, index) => (
          <Link
            key={`${brand.id}-${index}`}
            to={`/products?brand=${brand.name.toLowerCase()}`}
            className="group flex flex-col items-center justify-center p-6 bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 hover:shadow-lg hover:border-primary-500/30 transition-all duration-300"
          >
            <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
              {brand.logo}
            </span>
            <span className="text-sm font-semibold text-surface-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {brand.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default TrendingBrands;
