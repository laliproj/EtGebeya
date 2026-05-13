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

  // Check for new notifications to show toast
  useEffect(() => {
    if (items.length > 0) {
      const currentTopId = items[0].id;
      if (lastTopNotifId.current && currentTopId !== lastTopNotifId.current) {
        // Find new items
        const newItems = items.filter(n => n.id > lastTopNotifId.current);
        newItems.forEach(n => {
          if (!n.read) {
            toast.success(`New Notification: ${n.title}`, { icon: n.icon || '🔔' });
          }
        });
      }
      lastTopNotifId.current = currentTopId;
    }
  }, [items]);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 transition-colors duration-300">
      <Navbar />
      <main className="pt-16 pb-20 md:pb-6">
        <Outlet />
      </main>
      <BottomNav />
      <AIChatbot />
    </div>
  );
};

export default MainLayout;
