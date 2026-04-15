import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { HiOutlineFunnel, HiOutlineArrowsUpDown } from 'react-icons/hi2';
import FilterSidebar from '../../components/search/FilterSidebar';
import ProductCard from '../../components/product/ProductCard';
import { ProductCardSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import { setFilters, setProducts } from '../../store/productSlice';
import productService from '../../services/productService';
import api from '../../services/api';

const ProductListPage = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { filteredItems, filters } = useSelector((state) => state.products);
  
  const [loading, setLoading] = useState(true);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Initialize filters from URL params
  useEffect(() => {
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const search = searchParams.get('search');
    
    if (category || brand || search) {
      dispatch(setFilters({
        category: category || '',
        brand: brand || '',
        search: search || '',
      }));
    }
  }, [searchParams, dispatch]);

  // Fetch products (AI Smart Search or All)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
