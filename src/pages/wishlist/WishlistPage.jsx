import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { HiOutlineHeart, HiOutlineTrash } from 'react-icons/hi2';
import ProductCard from '../../components/product/ProductCard';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { clearWishlist } from '../../store/wishlistSlice';
import productService from '../../services/productService';

const WishlistPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { wishlistIds } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchWishlistProducts = async () => {
