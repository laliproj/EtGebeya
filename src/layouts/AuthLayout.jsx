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
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/4 w-60 h-60 bg-primary-400/10 rounded-full blur-2xl"></div>
