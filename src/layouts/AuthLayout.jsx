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
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link to="/" className="inline-flex items-center gap-2 group mb-8">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg border border-white/30 group-hover:bg-white/30 transition-all">
            <HiOutlineBuildingStorefront className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white drop-shadow">
            EtGebeya
          </span>
        </Link>

        {/* Auth Card */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-2xl p-8 animate-scale-in">
          <Outlet />
        </div>

        {/* Footer */}
        <p className="text-center text-white/60 text-sm mt-6">
          © 2026 EtGebeya. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;