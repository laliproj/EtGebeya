import { useState, useEffect } from 'react';
import { HiOutlineSparkles, HiOutlineShieldCheck, HiOutlineCurrencyDollar, HiOutlineHeart, HiOutlineExclamationTriangle, HiOutlineArrowTrendingUp } from 'react-icons/hi2';
import api from '../../services/api';
import { formatPrice } from '../../utils/helpers';

const AIAnalysisWidget = ({ product }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  const handleReveal = async () => {
    setIsRevealed(true);
    setLoading(true);
    try {
      const response = await api.post('/ai/analyze_product.php', {
        productId: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        category: product.category,
        brand: product.brand,
        condition: product.condition
      });
      setAnalysis(response.data.data);
    } catch (err) {
      console.error('Failed to load AI analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isRevealed) {
    return (
      <button 
        onClick={handleReveal}
        className="w-full text-left bg-gradient-to-r from-surface-900 via-primary-900 to-surface-900 rounded-2xl p-1 shadow-lg relative overflow-hidden group cursor-pointer transition-all hover:shadow-primary-500/25"
      >
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="bg-surface-900/60 backdrop-blur-md rounded-xl p-4 md:p-5 border border-white/10 flex items-center justify-between transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 p-0.5 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0">
               <div className="w-full h-full bg-surface-900 rounded-full flex items-center justify-center">
                 <HiOutlineSparkles className="w-6 h-6 text-primary-400" />
               </div>
            </div>
            <div>
              <h3 className="font-bold text-white text-base md:text-lg mb-0.5">AI Analysis & Insights</h3>
              <p className="text-xs md:text-sm text-surface-400">Tap to reveal price valuation & scam risk</p>
            </div>
          </div>
          <div className="text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </button>
    );
  }

  if (loading) {
    return (
      <div className="bg-primary-50 dark:bg-primary-900/10 rounded-2xl p-5 border border-primary-100 dark:border-primary-800/30 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <HiOutlineSparkles className="w-5 h-5 text-primary-400" />
          <div className="h-5 bg-primary-200 dark:bg-primary-800 rounded w-1/3"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-primary-200 dark:bg-primary-800 rounded w-full"></div>
          <div className="h-4 bg-primary-200 dark:bg-primary-800 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-surface-50 dark:bg-surface-800/50 rounded-2xl p-5 border border-surface-200 dark:border-surface-700 text-center">
        <p className="text-sm text-surface-500">AI analysis failed to load. Please try again later.</p>
        <button onClick={handleReveal} className="mt-2 text-xs text-primary-600 font-bold hover:underline">Retry</button>
      </div>
    );
  }

  const { scamRisk, priceVerdict, aiSummary, health, market } = analysis;

  const scamConfig = {
    low:    { color: 'text-success-600', bg: 'bg-success-50 dark:bg-success-900/20', icon: HiOutlineShieldCheck, text: 'Low Risk' },
    medium: { color: 'text-warning-600', bg: 'bg-warning-50 dark:bg-warning-900/20', icon: HiOutlineExclamationTriangle, text: 'Medium Risk' },
    high:   { color: 'text-danger-600',  bg: 'bg-danger-50 dark:bg-danger-900/20',   icon: HiOutlineExclamationTriangle, text: 'High Risk' }
  };
  const currentScam = scamConfig[scamRisk] || scamConfig.low;
  const ScamIcon = currentScam.icon;

  const priceConfig = {
    great_deal: { text: 'Great Deal 🔥', color: 'text-success-600', barColor: 'bg-success-500' },
    fair_price: { text: 'Fair Price ✓',  color: 'text-primary-600', barColor: 'bg-primary-500' },
    overpriced: { text: 'Overpriced ⚠',  color: 'text-danger-600',  barColor: 'bg-danger-500' },
    unknown:    { text: 'New to Market', color: 'text-surface-500',  barColor: 'bg-surface-400' },
  };
  const currentPrice = priceConfig[priceVerdict] || priceConfig.unknown;

  // Market meter bar (where does the listing price sit between low and high?)
  const meterPct = market?.low && market?.high
    ? Math.min(100, Math.max(0, ((product.price - market.low) / (market.high - market.low)) * 100))
    : null;

  return (
    <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/10 dark:to-accent-900/10 rounded-2xl p-5 border border-primary-100 dark:border-primary-800/30 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-primary-400/20 to-accent-400/20 rounded-full blur-xl pointer-events-none"></div>

      <div className="flex items-center gap-2 mb-4">
        <HiOutlineSparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        <h3 className="font-bold text-surface-900 dark:text-white">AI Analysis & Insights</h3>
      </div>

      <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed mb-4 italic border-l-2 border-primary-300 dark:border-primary-700 pl-3">
        "{aiSummary}"
      </p>

      {/* Market Price Range Meter */}
      {market?.avg && (
        <div className="mb-4 bg-white/60 dark:bg-surface-800/50 rounded-xl p-3 border border-white/40 dark:border-surface-700/50">
          <div className="flex items-center gap-1.5 mb-2">
            <HiOutlineArrowTrendingUp className="w-4 h-4 text-primary-500" />
            <span className="text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wide">Market Price Range</span>
          </div>
          <div className="flex justify-between text-xs text-surface-500 mb-1.5">
            <span>{formatPrice(market.low)}</span>
            <span className="font-bold text-surface-700 dark:text-surface-200">Avg: {formatPrice(market.avg)}</span>
            <span>{formatPrice(market.high)}</span>
          </div>
          <div className="relative h-2 bg-surface-200 dark:bg-surface-700 rounded-full">
            <div className="absolute h-full bg-gradient-to-r from-success-400 via-primary-400 to-danger-400 rounded-full opacity-50 w-full"></div>
            {meterPct !== null && (
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-surface-900 border-2 border-primary-500 rounded-full shadow-lg transition-all duration-700"
                style={{ left: `calc(${meterPct}% - 8px)` }}
              />
            )}
          </div>
          <p className={`text-xs font-bold mt-2 text-center ${currentPrice.color}`}>{currentPrice.text}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Scam Risk */}
        <div className={`flex flex-col items-center justify-center p-3 rounded-xl border border-white/50 dark:border-surface-700/50 ${currentScam.bg}`}>
          <ScamIcon className={`w-6 h-6 mb-1 ${currentScam.color}`} />
          <span className="text-xs font-semibold text-surface-600 dark:text-surface-400 uppercase tracking-wide">Scam Risk</span>
          <span className={`text-sm font-bold ${currentScam.color}`}>{currentScam.text}</span>
        </div>

        {/* Valuation */}
        <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/50 dark:border-surface-700/50 bg-white/50 dark:bg-surface-800/50">
          <HiOutlineCurrencyDollar className={`w-6 h-6 mb-1 ${currentPrice.color}`} />
          <span className="text-xs font-semibold text-surface-600 dark:text-surface-400 uppercase tracking-wide">Valuation</span>
          <span className={`text-sm font-bold ${currentPrice.color}`}>{currentPrice.text}</span>
        </div>
      </div>

      {/* Electronics Health */}
      {health?.battery && (
        <div className="mt-4 pt-4 border-t border-primary-200/50 dark:border-primary-800/50 flex items-start gap-3">
          <div className="bg-success-100 dark:bg-success-900/30 p-2 rounded-lg text-success-600 dark:text-success-400 shrink-0">
            <HiOutlineHeart className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-surface-900 dark:text-white">Health Prediction</h4>
            <div className="flex items-center gap-4 mt-1">
              <div>
                <p className="text-xs text-surface-500">Est. Battery</p>
                <p className="text-sm font-semibold text-success-600 dark:text-success-400">~{health.battery}%</p>
              </div>
              <div>
                <p className="text-xs text-surface-500">Expected Lifespan</p>
                <p className="text-sm font-semibold text-surface-700 dark:text-surface-300">{health.lifespan}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning Flags */}
      {analysis.flags?.length > 0 && (
        <div className="mt-4 bg-danger-50 dark:bg-danger-900/10 p-3 rounded-xl border border-danger-100 dark:border-danger-800/30">
          <p className="text-xs font-bold text-danger-700 dark:text-danger-400 mb-2 flex items-center gap-1">
            <HiOutlineExclamationTriangle className="w-4 h-4" /> AI Warnings Detected:
          </p>
          <ul className="text-xs text-danger-600 dark:text-danger-400 space-y-1 list-disc list-inside">
            {analysis.flags.map((flag, idx) => (
              <li key={idx}>{flag}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AIAnalysisWidget;
