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
