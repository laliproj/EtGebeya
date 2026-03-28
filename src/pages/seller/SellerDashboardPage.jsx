import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  HiOutlineExclamationTriangle, HiOutlineChartBarSquare,
  HiOutlineCurrencyDollar, HiOutlineArchiveBox,
  HiOutlineTrash, HiOutlinePencilSquare, HiOutlineCheckBadge,
  HiOutlineClock, HiOutlineXCircle, HiOutlinePlus, HiOutlineArrowPath,
  HiOutlineEye,
} from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import sellerService from '../../services/sellerService';
import { formatPrice, timeAgo } from '../../utils/helpers';
import AISellerInsights from '../../components/seller/AISellerInsights';

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = {
    active:   { bg: 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400', icon: '✅', label: 'Active' },
    pending:  { bg: 'bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400', icon: '⏳', label: 'Pending Approval' },
    rejected: { bg: 'bg-danger-100  dark:bg-danger-900/30  text-danger-700  dark:text-danger-400',  icon: '❌', label: 'Rejected' },
    sold:     { bg: 'bg-surface-100 dark:bg-surface-800    text-surface-600 dark:text-surface-400', icon: '🏷️', label: 'Sold' },
  };
  const c = cfg[status] || cfg.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg}`}>
      {c.icon} {c.label}
    </span>
  );
};

// ─── Edit Modal ───────────────────────────────────────────────────────────────
const EditModal = ({ product, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: product.title || '',
    price: product.price || '',
    description: product.description || '',
    location: product.location || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(product.id, { ...form, price: parseFloat(form.price) });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-5">Edit Listing</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Title</label>
            <input
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Price (ETB)</label>
            <input
              type="number" min="0" step="0.01"
              value={form.price}
              onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Location</label>
            <input
              value={form.location}
              onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 font-medium hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold transition-colors">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
const ConfirmDialog = ({ title, message, confirmLabel, confirmClass, onConfirm, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
    <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
      <p className="text-lg font-bold text-surface-900 dark:text-white mb-2">{title}</p>
      <p className="text-sm text-surface-500 mb-6">{message}</p>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 font-medium hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
          Cancel
        </button>
        <button onClick={onConfirm} className={`flex-1 py-2.5 rounded-xl text-white font-semibold transition-colors ${confirmClass}`}>
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const SellerDashboardPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { type, product }
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
  }, [isAuthenticated, navigate]);

