import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineClock } from 'react-icons/hi2';
import ProductCard from '../product/ProductCard';
import { ProductCardSkeleton } from '../common/Skeleton';
import productService from '../../services/productService';

const RecentProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const data = await productService.getRecent();
        setProducts(data.slice(0, 8)); // Get 8 recent items
      } catch (error) {
        console.error('Failed to fetch recent products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  return (
    <section className="py-8 bg-surface-50 dark:bg-surface-900/50 mt-8 border-y border-surface-200/50 dark:border-surface-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
