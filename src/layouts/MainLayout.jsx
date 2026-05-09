import { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import Navbar from '../components/navigation/Navbar';
import BottomNav from '../components/navigation/BottomNav';
import AIChatbot from '../components/ai/AIChatbot';
import { fetchNotificationsAPI } from '../store/notificationSlice';

/**
 * MainLayout — Primary application layout with navbar and mobile bottom nav
 */
const MainLayout = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);
  const { items } = useSelector(state => state.notifications);
  const lastTopNotifId = useRef(items[0]?.id || null);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Initial fetch
    dispatch(fetchNotificationsAPI());

    // Poll every 15 seconds
    const interval = setInterval(() => {
      dispatch(fetchNotificationsAPI());
    }, 15000);

    return () => clearInterval(interval);
  }, [isAuthenticated, dispatch]);
