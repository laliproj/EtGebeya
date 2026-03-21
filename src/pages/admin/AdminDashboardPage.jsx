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
