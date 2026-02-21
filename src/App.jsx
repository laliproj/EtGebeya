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
      <AppRouter />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'bg-white text-surface-900 dark:bg-surface-800 dark:text-white shadow-xl border border-surface-200 dark:border-surface-700',
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

export default App;
