import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  HiOutlineShoppingCart,
  HiOutlineBell,
  HiOutlineHeart,
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineMagnifyingGlass,
  HiOutlinePlusCircle,
  HiOutlineUser,
  HiOutlineArrowRightOnRectangle,
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineChartBarSquare,
  HiOutlineBuildingStorefront,
  HiOutlineShieldCheck,
  HiOutlineFlag,
} from 'react-icons/hi2';
import { toggleTheme } from '../../store/uiSlice';
import { logout } from '../../store/authSlice';
import NotificationDropdown from '../notifications/NotificationDropdown';
import SearchBar from '../search/SearchBar';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useSelector((state) => state.ui);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const { wishlistIds } = useSelector((state) => state.wishlist);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-surface-200/50 dark:border-surface-700/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
              <HiOutlineBuildingStorefront className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent hidden sm:block">
              EtGebeya
            </span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-6">
            <SearchBar />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="md:hidden p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              aria-label="Search"
            >
              {showMobileSearch ? (
                <HiOutlineXMark className="w-5 h-5 text-surface-600 dark:text-surface-400" />
              ) : (
                <HiOutlineMagnifyingGlass className="w-5 h-5 text-surface-600 dark:text-surface-400" />
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <HiOutlineMoon className="w-5 h-5 text-surface-600" />
              ) : (
                <HiOutlineSun className="w-5 h-5 text-yellow-400" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                {/* Post Item Button */}
                <Link
                  to="/products/new"
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-200 hover:-translate-y-0.5"
                >
                  <HiOutlinePlusCircle className="w-4 h-4" />
                  <span>ሽጥ / Sell</span>
                </Link>

                {/* Wishlist */}
                <Link
                  to="/wishlist"
                  className="relative p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                  aria-label="Wishlist"
                >
                  <HiOutlineHeart className="w-5 h-5 text-surface-600 dark:text-surface-400" />
                  {wishlistIds.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {wishlistIds.length}
                    </span>
                  )}
                </Link>

                {/* Notifications */}
                <div ref={notifRef} className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                    aria-label="Notifications"
                  >
                    <HiOutlineBell className="w-5 h-5 text-surface-600 dark:text-surface-400" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-soft">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <NotificationDropdown onClose={() => setShowNotifications(false)} />
                  )}
                </div>

                {/* User Menu */}
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                  >
                    <img
                      src={user?.avatar}
                      alt={user?.name}
