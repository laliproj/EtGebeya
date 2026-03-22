import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineShieldCheck,
  HiOutlineArchiveBox,
  HiOutlineFlag,
  HiOutlineUsers,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineExclamationTriangle,
  HiOutlineNoSymbol,
  HiOutlineArrowPath,
  HiOutlineChartBarSquare,
  HiOutlineClipboardDocumentCheck,
} from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import adminService from '../../services/adminService';
import { formatPrice, timeAgo } from '../../utils/helpers';
import Skeleton from '../../components/common/Skeleton';

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color = 'primary', sub }) => (
  <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 flex items-center gap-5">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400`}>
      <Icon className="w-7 h-7" />
    </div>
    <div>
      <p className="text-sm text-surface-500 font-medium">{label}</p>
      <p className="text-3xl font-bold text-surface-900 dark:text-white">{value ?? '—'}</p>
      {sub && <p className="text-xs text-surface-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    pending:   'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
    resolved:  'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400',
    dismissed: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400',
    active:    'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400',
    rejected:  'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400',
  };
  const labels = {
    pending: 'በጥበቃ ላይ', resolved: 'ተፈቷል', dismissed: 'ተሰርዟል',
    active: 'ንቁ', rejected: 'ተቀባይነት አልነበረውም',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] || map.pending}`}>
      {labels[status] || status}
    </span>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('pending');
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  // Guard: must be admin
  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!user?.isAdmin) { navigate('/'); toast.error('የአስተዳዳሪ መዳረሻ ብቻ። (Admin access only)'); return; }
  }, [isAuthenticated, user, navigate]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [s, p, r] = await Promise.all([
        adminService.getStats(),
        adminService.getPendingProducts(),
        adminService.getReports(),
      ]);
      setStats(s);
      setPending(p);
      setReports(r);
    } catch (err) {
      toast.error('ዳታ መጫን አልተሳካም: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleProduct = async (productId, action) => {
    setActionLoading(prev => ({ ...prev, [productId]: action }));
    try {
      await adminService.handleProduct(productId, action);
      toast.success(action === 'approve' ? '✅ ማስታወቂያ ተቀበሎ!' : '❌ ማስታወቂያ ውድቅ ሆነ!');
      setPending(prev => prev.filter(p => p.id !== productId));
      setStats(prev => prev ? { ...prev, pending_products: prev.pending_products - 1 } : prev);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(prev => { const n = { ...prev }; delete n[productId]; return n; });
    }
  };

  const handleReport = async (reportId, action) => {
    setActionLoading(prev => ({ ...prev, [`r_${reportId}`]: action }));
    try {
      await adminService.handleReport(reportId, action);
      const labels = { dismiss: 'ሪፖርት ተሰርዟል', remove_product: 'ምርቱ ተወግዷል', warn_seller: 'ሻጩ ማስጠንቀቂያ ደርሷቸዋል', ban_seller: 'ሻጩ ታድጓቸዋል' };
      toast.success(labels[action] || 'ዝግጅቱ ተፈጸሟ');
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: action === 'dismiss' ? 'dismissed' : 'resolved' } : r));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(prev => { const n = { ...prev }; delete n[`r_${reportId}`]; return n; });
    }
  };

  if (!user?.isAdmin) return null;

  const tabs = [
    { id: 'pending',  label: 'ማስታወቂያ ጥያቄዎች', sublabel: 'Pending Posts',  icon: HiOutlineClipboardDocumentCheck, count: stats?.pending_products },
    { id: 'reports',  label: 'ሪፖርቶች',           sublabel: 'User Reports',   icon: HiOutlineFlag,                   count: stats?.open_reports },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-600 rounded-xl flex items-center justify-center">
              <HiOutlineShieldCheck className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white">
              የአስተዳዳሪ ዳሽቦርድ
            </h1>
          </div>
          <p className="text-surface-500 ml-13 pl-0.5">Admin Dashboard — EtGebeya Control Panel</p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-xl text-sm font-medium text-surface-700 dark:text-surface-300 transition-colors"
        >
          <HiOutlineArrowPath className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          አድስ — Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
        ) : (
          <>
            <StatCard icon={HiOutlineUsers}          label="ጠቅላላ ተጠቃሚዎች / Total Users"       value={stats?.total_users}      color="primary" />
            <StatCard icon={HiOutlineArchiveBox}     label="ጠቅላላ ምርቶች / Total Products"      value={stats?.total_products}   color="accent"  />
            <StatCard icon={HiOutlineClipboardDocumentCheck} label="በጥበቃ ላይ / Pending Approval" value={stats?.pending_products} color="warning" />
            <StatCard icon={HiOutlineFlag}           label="ክፍት ሪፖርቶች / Open Reports"        value={stats?.open_reports}     color="danger"  sub={`${stats?.banned_users ?? 0} ተጠቃሚዎች ታግደዋል`} />
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-100 dark:bg-surface-800 rounded-2xl mb-6 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-surface-900 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1 bg-danger-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {tab.count > 9 ? '9+' : tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Pending Products Tab ────────────────────────────────────────────── */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {loading ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
          ) : pending.length === 0 ? (
            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-16 text-center">
              <HiOutlineCheckCircle className="w-12 h-12 text-success-400 mx-auto mb-3" />
              <p className="text-lg font-semibold text-surface-900 dark:text-white">ሁሉም ምርቶች ተፈቅደዋል!</p>
              <p className="text-surface-500 text-sm mt-1">All listings have been reviewed. No pending approvals.</p>
            </div>
          ) : (
            pending.map(product => (
              <div key={product.id} className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-5 flex flex-col sm:flex-row gap-4">
                {product.cover_image && (
                  <img
                    src={product.cover_image}
                    alt={product.title}
                    className="w-full sm:w-28 h-28 rounded-xl object-cover shrink-0 bg-surface-100"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-surface-900 dark:text-white text-lg truncate">{product.title}</h3>
                    <span className="text-xl font-bold text-primary-600">{formatPrice(product.price)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-surface-500 mb-3">
                    <span className="bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded-lg">{product.category}</span>
                    <span className="bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded-lg">{product.brand}</span>
                    <span className="bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded-lg">{product.condition}</span>
                    <span className="bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded-lg">📍 {product.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-surface-600 dark:text-surface-400 mb-4">
                    <span>ሻጭ: <strong className="text-surface-900 dark:text-white">{product.seller_name}</strong></span>
                    <span className="text-surface-300">·</span>
                    <span>{product.seller_email}</span>
                    <span className="text-surface-300">·</span>
                    <span>{timeAgo(product.postedAt)}</span>
                  </div>
                  <div className="flex gap-3">
                    <button
