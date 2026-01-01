import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../product/ProductCard';
import { ProductCardSkeleton } from '../common/Skeleton';
import productService from '../../services/productService';

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
