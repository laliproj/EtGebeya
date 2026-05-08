import { Outlet, Link } from 'react-router-dom';
import { HiOutlineBuildingStorefront } from 'react-icons/hi2';

/**
 * AuthLayout — Centered layout for login/register/forgot-password pages
 */
const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 flex items-center justify-center p-4 relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
