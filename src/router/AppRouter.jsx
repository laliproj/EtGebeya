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

