// ─── Main Component ──────────────────────────────────────────────────────────
const UserReportsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const fetchReports = async () => {
      try {
        const data = await adminService.getMyReports();
        setReports(data);
      } catch (err) {
        toast.error('ሪፖርቶችን ማምጣት አልተሳካም: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [isAuthenticated, navigate]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-warning-50 dark:bg-warning-900/20 rounded-xl flex items-center justify-center text-warning-600">
              <HiOutlineFlag className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
              የእኔ ሪፖርቶች
            </h1>
          </div>
          <p className="text-surface-500 pl-0.5 ml-12 text-sm">My Submitted Reports — Track the status of your reports</p>
        </div>
        <Link
          to="/products"
          className="text-sm text-primary-600 hover:underline font-medium"
        >
          ወደ ምርቶች ሂድ →
        </Link>
      </div>

      {/* Info Box */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-2xl flex gap-3">
        <HiOutlineExclamationTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800 dark:text-blue-300">
          <p className="font-semibold mb-1">ሪፖርቶቹ ሂደት</p>
          <p>ሪፖርቶቹ የEtGebeya ቡድን ከፈተሸ በኋላ ሁኔታ ይቀይሳሉ። Reports are reviewed by our team and the status will be updated once resolved. False reports may lead to account suspension.</p>
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-16 text-center">
          <HiOutlineFlag className="w-12 h-12 text-surface-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">ምንም ሪፖርቶች የላቸዎትም</h3>
          <p className="text-surface-500 text-sm mb-6">You haven't submitted any reports yet.</p>
          <Button variant="outline" size="sm" onClick={() => navigate('/products')}>
            ምርቶችን ይዳስሱ — Browse Products
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-warning-50 dark:bg-warning-900/20 rounded-xl flex items-center justify-center text-warning-600 shrink-0 mt-0.5">
                    <HiOutlineFlag className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-surface-900 dark:text-white">{report.reason}</p>
                    <p className="text-sm text-surface-500 mt-0.5">
                      ሪፖርት ተደረገ: <Link
                        to={`/products/${report.product_id}`}
                        className="text-primary-600 hover:underline font-medium"
                      >
                        {report.product_title}
                      </Link>
                    </p>
                    <p className="text-xs text-surface-400 mt-0.5">
                      ሻጭ: <strong>{report.seller_name}</strong>
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={report.status} />
                  <span className="text-xs text-surface-400 flex items-center gap-1">
                    <HiOutlineClock className="w-3.5 h-3.5" />
                    {timeAgo(report.created_at)}
                  </span>
                </div>
              </div>

              {report.details && (
                <div className="ml-12 bg-surface-50 dark:bg-surface-800/50 rounded-xl p-3 mt-2">
                  <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
                    <span className="text-xs font-semibold text-surface-400 uppercase tracking-wide block mb-1">የዝርዝር መግለጫ (Details)</span>
                    {report.details}
                  </p>
                </div>
              )}

              {report.status === 'resolved' && (
                <div className="ml-12 mt-3 flex items-center gap-2 text-sm text-success-600 dark:text-success-400">
                  <HiOutlineCheckCircle className="w-4 h-4" />
                  <span>ሪፖርቱ ተፈቷል። ምስጋና ለሪፖርቱ! (Report resolved. Thank you for keeping the community safe!)</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserReportsPage;
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  HiOutlineFlag,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineExclamationTriangle,
  HiOutlineArrowPath,
} from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import adminService from '../../services/adminService';
import { timeAgo } from '../../utils/helpers';
import Skeleton from '../../components/common/Skeleton';
import Button from '../../components/common/Button';

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = {
    pending:   { cls: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',  icon: HiOutlineClock,        label: 'በጥበቃ ላይ / Pending' },
    resolved:  { cls: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400', icon: HiOutlineCheckCircle,  label: 'ተፈቷል / Resolved' },
    dismissed: { cls: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400',   icon: HiOutlineXCircle,      label: 'ተሰርዟል / Dismissed' },
  };
  const c = cfg[status] || cfg.pending;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${c.cls}`}>
      <Icon className="w-3.5 h-3.5" />
      {c.label}
    </span>
  );
};

