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
