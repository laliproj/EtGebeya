import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import AppRouter from './router/AppRouter';
import { checkAuth } from './store/authSlice';
import { fetchNotificationsAPI } from './store/notificationSlice';
import { fetchWishlist } from './store/wishlistSlice';

function App() {
  const dispatch = useDispatch();

  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check authentication status on app load
    dispatch(checkAuth());
    
    // Fetch user specific data if logged in
    if (isAuthenticated) {
      dispatch(fetchNotificationsAPI());
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <>
