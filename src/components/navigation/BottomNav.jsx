import { NavLink } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineMagnifyingGlass,
  HiOutlinePlusCircle,
  HiOutlineHeart,
  HiOutlineUser,
} from 'react-icons/hi2';
import { useSelector } from 'react-redux';

/**
 * BottomNav — Mobile bottom navigation bar (hidden on desktop)
 */
const BottomNav = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  const navItems = [
    { to: '/', icon: HiOutlineHome, label: 'Home' },
    { to: '/products', icon: HiOutlineMagnifyingGlass, label: 'Browse' },
    { to: isAuthenticated ? '/products/new' : '/login', icon: HiOutlinePlusCircle, label: 'Sell', isSpecial: true },
    { to: '/wishlist', icon: HiOutlineHeart, label: 'Wishlist' },
    { to: isAuthenticated ? '/profile' : '/login', icon: HiOutlineUser, label: 'Profile' },
  ];

