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

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-surface-200/50 dark:border-surface-700/50">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                item.isSpecial
                  ? ''
                  : isActive
