import { useState } from 'react';
import { HiOutlineHandRaised, HiOutlineXMark, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineArrowsRightLeft } from 'react-icons/hi2';
import api from '../../services/api';
import { formatPrice } from '../../utils/helpers';

const NegotiationModal = ({ product, onClose }) => {
  const [offer, setOffer] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const offerNum = parseFloat(offer);
    if (!offerNum || offerNum <= 0) return;
    setLoading(true);
    try {
      const res = await api.post('/ai/negotiation.php', {
        productId: product.id,
        offerPrice: offerNum,
      });
      setResult(res.data.data);
    } catch (err) {
      setResult({ verdict: 'error', message: '❌ Could not process your offer. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const verdictIcons = {
    accepted:     { icon: HiOutlineCheckCircle, color: 'text-success-500', bg: 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800' },
    pre_approved: { icon: HiOutlineCheckCircle, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800' },
    counter:      { icon: HiOutlineArrowsRightLeft, color: 'text-warning-500', bg: 'bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800' },
    rejected:     { icon: HiOutlineXCircle, color: 'text-danger-500', bg: 'bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-800' },
    error:        { icon: HiOutlineXCircle, color: 'text-danger-500', bg: 'bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-800' },
  };
  const verdictCfg = result ? (verdictIcons[result.verdict] || verdictIcons.error) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 rounded-xl flex items-center justify-center">
              <HiOutlineHandRaised className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-surface-900 dark:text-white">Negotiate with AI</h2>
              <p className="text-xs text-surface-500">Smart price analysis powered by EtGebeya AI</p>
            </div>
          </div>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-colors">
            <HiOutlineXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Product Info */}
        <div className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-800 rounded-xl mb-5">
          {product.images?.[0] && (
            <img src={product.images[0]} alt={product.title} className="w-14 h-14 rounded-xl object-cover shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-semibold text-surface-900 dark:text-white text-sm truncate">{product.title}</p>
            <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{formatPrice(product.price)}</p>
          </div>
        </div>

        {!result ? (
          <>
            <div className="mb-5">
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
                Your Offer Price (ETB)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-surface-400">ETB</span>
                <input
                  type="number"
                  value={offer}
                  onChange={e => setOffer(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="e.g. 45000"
                  className="w-full pl-14 pr-4 py-3.5 bg-surface-50 dark:bg-surface-800 border-2 border-surface-200 dark:border-surface-700 rounded-2xl text-surface-900 dark:text-white text-lg font-bold focus:outline-none focus:border-primary-500 transition-colors"
                  autoFocus
                />
              </div>
              <p className="text-xs text-surface-400 mt-2">
                Listed at {formatPrice(product.price)} • Our AI will evaluate your offer fairly
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !offer}
              className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-bold rounded-2xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  AI is evaluating...
                </>
              ) : (
                <>
                  <HiOutlineHandRaised className="w-5 h-5" />
                  Submit Offer
                </>
              )}
            </button>
          </>
        ) : (
          <div className={`rounded-2xl border p-5 ${verdictCfg.bg}`}>
            <div className="flex items-center gap-3 mb-3">
              <verdictCfg.icon className={`w-7 h-7 shrink-0 ${verdictCfg.color}`} />
              <span className={`font-bold text-base ${verdictCfg.color}`}>
                {result.verdict === 'accepted' ? 'Offer Accepted!' :
                 result.verdict === 'pre_approved' ? 'Offer Forwarded to Seller' :
                 result.verdict === 'counter' ? 'AI Counter-Offer' :
                 result.verdict === 'rejected' ? 'Offer Rejected' : 'Error'}
              </span>
            </div>

            <div
              className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: result.message
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\n/g, '<br/>')
              }}
            />

            {result.counter && result.verdict === 'counter' && (
              <div className="mt-4 flex items-center justify-center gap-3">
                <div className="text-center">
                  <p className="text-xs text-surface-500">Your Offer</p>
                  <p className="font-bold text-surface-700 dark:text-surface-300 line-through">{formatPrice(parseFloat(offer))}</p>
                </div>
                <HiOutlineArrowsRightLeft className="text-warning-500 w-5 h-5" />
                <div className="text-center">
                  <p className="text-xs text-surface-500">AI Suggests</p>
                  <p className="font-bold text-warning-600 dark:text-warning-400 text-lg">{formatPrice(result.counter)}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-5">
              <button onClick={() => setResult(null)} className="flex-1 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 text-sm font-medium hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                Try Again
              </button>
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-surface-900 dark:bg-white text-white dark:text-surface-900 text-sm font-bold transition-colors">
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NegotiationModal;
