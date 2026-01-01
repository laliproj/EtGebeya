import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Pages - Auth
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';

// Pages - Main
import HomePage from '../pages/home/HomePage';
import ProductListPage from '../pages/products/ProductListPage';
import ProductDetailPage from '../pages/products/ProductDetailPage';
import PostProductPage from '../pages/products/PostProductPage';
import SellerProfilePage from '../pages/seller/SellerProfilePage';
import SellerDashboardPage from '../pages/seller/SellerDashboardPage';
import UserProfilePage from '../pages/profile/UserProfilePage';
import UserReportsPage from '../pages/profile/UserReportsPage';
import WishlistPage from '../pages/wishlist/WishlistPage';
import NotificationsPage from '../pages/notifications/NotificationsPage';
import MessagesPage from '../pages/messages/MessagesPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';

// ─── Route Guards ─────────────────────────────────────────────────────────────

/** Redirects unauthenticated users to /login */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

/** Restricts access to admin users only */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// ─── Router ───────────────────────────────────────────────────────────────────
const AppRouter = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* Main Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/seller/:id" element={<SellerProfilePage />} />
            
            {/* Protected Routes (logged-in users) */}
            <Route path="/products/new" element={
              <ProtectedRoute><PostProductPage /></ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute><SellerDashboardPage /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><UserProfilePage /></ProtectedRoute>
            } />
            <Route path="/wishlist" element={
              <ProtectedRoute><WishlistPage /></ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute><NotificationsPage /></ProtectedRoute>
            } />
            <Route path="/my-reports" element={
              <ProtectedRoute><UserReportsPage /></ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute><MessagesPage /></ProtectedRoute>
            } />

            {/* Admin-Only Route */}
            <Route path="/admin" element={
              <AdminRoute><AdminDashboardPage /></AdminRoute>
            } />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default AppRouter;
