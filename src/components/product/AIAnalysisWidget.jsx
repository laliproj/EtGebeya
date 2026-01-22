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

