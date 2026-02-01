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

