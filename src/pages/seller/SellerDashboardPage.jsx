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

  const fetchProducts = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await sellerService.getMyProducts(user.id);
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load your listings');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  if (!user) return null;

  // Stats
  const active   = products.filter(p => p.status === 'active').length;
  const pending  = products.filter(p => p.status === 'pending').length;
  const sold     = products.filter(p => p.status === 'sold').length;
  const rejected = products.filter(p => p.status === 'rejected').length;
  const totalValue = products.filter(p => p.status === 'active').reduce((s, p) => s + p.price, 0);

  const handleDelete = async (productId) => {
    setActionLoading(prev => ({ ...prev, [productId]: 'delete' }));
    try {
      await sellerService.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success('Listing deleted.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(prev => { const n = { ...prev }; delete n[productId]; return n; });
      setConfirmAction(null);
    }
  };

  const handleMarkSold = async (productId) => {
    setActionLoading(prev => ({ ...prev, [productId]: 'sold' }));
    try {
      await sellerService.markSold(productId);
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: 'sold' } : p));
      toast.success('🏷️ Product marked as sold!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(prev => { const n = { ...prev }; delete n[productId]; return n; });
      setConfirmAction(null);
    }
  };

  const handleEdit = async (productId, data) => {
    try {
      await sellerService.updateProduct(productId, data);
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...data } : p));
      toast.success('Listing updated!');
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white">My Dashboard</h1>
          <p className="text-surface-500 mt-1">Manage your listings and sales</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchProducts} disabled={loading} className="p-2.5 rounded-xl border border-surface-200 dark:border-surface-700 text-surface-500 hover:text-primary-600 hover:border-primary-300 transition-colors">
            <HiOutlineArrowPath className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link to="/products/new" className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors">
            <HiOutlinePlus className="w-4 h-4" /> New Listing
          </Link>
        </div>
      </div>

      {/* Warnings / Ban notice */}
      {user.warnings > 0 && (
        <div className={`mb-8 p-5 rounded-2xl border flex items-start gap-4 ${
          user.isBanned
            ? 'bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-800/50'
            : 'bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800/50'
        }`}>
          <HiOutlineExclamationTriangle className={`w-7 h-7 shrink-0 ${user.isBanned ? 'text-danger-500' : 'text-warning-500'}`} />
          <div>
            <h3 className={`font-bold ${user.isBanned ? 'text-danger-800 dark:text-danger-400' : 'text-warning-800 dark:text-warning-400'}`}>
              {user.isBanned ? 'Account Suspended' : `Warning — ${user.warnings}/3`}
            </h3>
            <p className="text-sm mt-0.5 text-surface-600 dark:text-surface-400">
              {user.isBanned
                ? 'Your selling privileges have been revoked.'
                : 'Receiving 3 warnings will result in an account ban.'}
            </p>
          </div>
        </div>
      )}

      {/* AI Insights Section */}
      <AISellerInsights />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { icon: HiOutlineArchiveBox,      label: 'Active',   value: active,    color: 'text-success-600 dark:text-success-400',  bg: 'bg-success-50 dark:bg-success-900/20' },
          { icon: HiOutlineClock,           label: 'Pending',  value: pending,   color: 'text-warning-600 dark:text-warning-400',  bg: 'bg-warning-50 dark:bg-warning-900/20' },
          { icon: HiOutlineCheckBadge,      label: 'Sold',     value: sold,      color: 'text-primary-600 dark:text-primary-400',  bg: 'bg-primary-50 dark:bg-primary-900/20' },
          { icon: HiOutlineCurrencyDollar,  label: 'Active Value', value: formatPrice(totalValue), color: 'text-accent-600 dark:text-accent-400', bg: 'bg-accent-50 dark:bg-accent-900/20' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-surface-500 font-medium">{label}</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Listings Table */}
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-100 dark:border-surface-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white">All Listings</h2>
          <span className="text-sm text-surface-400">{products.length} total</span>
        </div>

        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 skeleton rounded-xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <HiOutlineArchiveBox className="w-12 h-12 text-surface-300 mx-auto mb-3" />
            <p className="text-surface-500 font-medium">No listings yet</p>
            <Link to="/products/new" className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors">
              <HiOutlinePlus className="w-4 h-4" /> Post Your First Product
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-surface-100 dark:divide-surface-800">
            {products.map(product => {
              const isActing = !!actionLoading[product.id];
              return (
                <div key={product.id} className="flex items-center gap-4 px-6 py-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                  {/* Image */}
                  <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-surface-100 dark:bg-surface-800">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-surface-300">
                        <HiOutlineArchiveBox className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-surface-900 dark:text-white truncate">{product.title}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-primary-600">{formatPrice(product.price)}</span>
                      <span className="text-xs text-surface-400">·</span>
                      <span className="text-xs text-surface-500">{timeAgo(product.postedAt)}</span>
                      <span className="text-xs text-surface-400">·</span>
                      <span className="text-xs text-surface-500 flex items-center gap-0.5"><HiOutlineEye className="w-3 h-3" /> {product.views ?? 0} views</span>
                    </div>
                    <div className="mt-1.5">
                      <StatusBadge status={product.status} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* View */}
                    <Link
                      to={`/products/${product.id}`}
                      className="p-2 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                      title="View listing"
                    >
                      <HiOutlineEye className="w-5 h-5" />
                    </Link>

                    {/* Edit — only for pending or active */}
                    {(product.status === 'active' || product.status === 'pending') && (
                      <button
                        onClick={() => setEditProduct(product)}
                        disabled={isActing}
                        className="p-2 rounded-lg text-surface-400 hover:text-warning-600 hover:bg-warning-50 dark:hover:bg-warning-900/20 transition-colors disabled:opacity-40"
                        title="Edit listing"
                      >
                        <HiOutlinePencilSquare className="w-5 h-5" />
                      </button>
                    )}

                    {/* Mark as Sold — only for active */}
                    {product.status === 'active' && (
                      <button
                        onClick={() => setConfirmAction({ type: 'sold', product })}
                        disabled={isActing}
                        className="p-2 rounded-lg text-surface-400 hover:text-success-600 hover:bg-success-50 dark:hover:bg-success-900/20 transition-colors disabled:opacity-40"
                        title="Mark as sold"
                      >
                        <HiOutlineCheckBadge className="w-5 h-5" />
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => setConfirmAction({ type: 'delete', product })}
                      disabled={isActing}
                      className="p-2 rounded-lg text-surface-400 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors disabled:opacity-40"
                      title="Delete listing"
                    >
                      {actionLoading[product.id] === 'delete' ? (
                        <HiOutlineArrowPath className="w-5 h-5 animate-spin" />
                      ) : (
                        <HiOutlineTrash className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rejected notice */}
      {rejected > 0 && (
        <div className="mt-4 p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800/50 rounded-xl flex items-center gap-3">
          <HiOutlineXCircle className="w-5 h-5 text-danger-500 shrink-0" />
          <p className="text-sm text-danger-700 dark:text-danger-400">
            You have <strong>{rejected}</strong> rejected listing{rejected > 1 ? 's' : ''}. Please review our guidelines and resubmit.
          </p>
        </div>
      )}

      {/* Edit Modal */}
      {editProduct && (
        <EditModal
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onSave={handleEdit}
        />
      )}

      {/* Confirm Dialog */}
      {confirmAction?.type === 'delete' && (
        <ConfirmDialog
          title="Delete this listing?"
          message={`"${confirmAction.product.title}" will be permanently removed and cannot be recovered.`}
          confirmLabel="Delete"
          confirmClass="bg-danger-600 hover:bg-danger-700"
          onConfirm={() => handleDelete(confirmAction.product.id)}
          onClose={() => setConfirmAction(null)}
        />
      )}
      {confirmAction?.type === 'sold' && (
        <ConfirmDialog
          title="Mark as Sold?"
          message={`"${confirmAction.product.title}" will be moved to your sold items and removed from active listings.`}
          confirmLabel="Mark as Sold"
          confirmClass="bg-success-600 hover:bg-success-700"
          onConfirm={() => handleMarkSold(confirmAction.product.id)}
          onClose={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
};

export default SellerDashboardPage;
