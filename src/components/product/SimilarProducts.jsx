import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { ProductCardSkeleton } from '../common/Skeleton';
import productService from '../../services/productService';

const SimilarProducts = ({ productId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilar = async () => {
