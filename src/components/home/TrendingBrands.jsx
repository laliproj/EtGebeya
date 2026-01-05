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
