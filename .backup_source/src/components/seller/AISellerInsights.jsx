import { useState, useEffect } from 'react';
import { HiOutlineSparkles, HiOutlineLightBulb, HiOutlineShieldCheck, HiOutlineArrowTrendingUp, HiOutlineInformationCircle } from 'react-icons/hi2';
import api from '../../services/api';
import Skeleton from '../common/Skeleton';

const AISellerInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await api.get('/ai/seller_insights.php');
        if (response.data?.success) {
          setInsights(response.data.data);
        }
      } catch (err) {
        console.error('Failed to load insights', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="bg-primary-50 dark:bg-primary-900/10 rounded-3xl p-6 md:p-8 animate-pulse mb-8 border border-primary-100 dark:border-primary-800/30">
        <Skeleton className="w-48 h-8 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!insights) return null;

  const trustColors = {
    platinum: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    gold: 'text-amber-600 bg-amber-50 border-amber-200',
    silver: 'text-surface-600 bg-surface-100 border-surface-300',
    bronze: 'text-amber-800 bg-amber-100 border-amber-300'
  };
  const trustClass = trustColors[insights.trust.level] || trustColors.bronze;

  return (
    <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-3xl p-6 md:p-8 mb-8 border border-primary-100 dark:border-primary-800/30 shadow-sm relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-primary-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-white dark:bg-surface-800 rounded-xl shadow-sm flex items-center justify-center">
          <HiOutlineSparkles className="w-6 h-6 text-primary-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-white">AI Seller Insights</h2>
          <p className="text-sm text-surface-600 dark:text-surface-400">Smart analysis of your performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Trust Score */}
        <div className="bg-white/60 dark:bg-surface-800/60 backdrop-blur-md p-5 rounded-2xl border border-white/40 dark:border-surface-700/50">
          <div className="flex items-center gap-2 mb-3">
            <HiOutlineShieldCheck className="w-5 h-5 text-surface-500" />
            <h3 className="font-semibold text-surface-700 dark:text-surface-300">Trust Score</h3>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-black text-surface-900 dark:text-white">{insights.trust.score}</span>
            <span className={`px-2.5 py-1 mb-1 rounded-full text-xs font-bold uppercase tracking-wide border ${trustClass}`}>
              {insights.trust.level}
            </span>
          </div>
        </div>

        {/* Pricing Competitiveness */}
        <div className="bg-white/60 dark:bg-surface-800/60 backdrop-blur-md p-5 rounded-2xl border border-white/40 dark:border-surface-700/50">
          <div className="flex items-center gap-2 mb-3">
            <HiOutlineArrowTrendingUp className="w-5 h-5 text-surface-500" />
            <h3 className="font-semibold text-surface-700 dark:text-surface-300">Pricing Competitiveness</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-surface-200 dark:text-surface-700" />
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="175" strokeDashoffset={175 - (175 * insights.pricingCompetitiveness.score) / 100} className="text-primary-500 transition-all duration-1000" />
              </svg>
              <span className="absolute text-sm font-bold">{insights.pricingCompetitiveness.score}%</span>
            </div>
            <div className="text-xs text-surface-600 dark:text-surface-400 space-y-1">
              <div className="flex justify-between gap-4"><span>Great Deals:</span> <strong>{insights.pricingCompetitiveness.breakdown.great_deal}</strong></div>
              <div className="flex justify-between gap-4"><span>Fair Price:</span> <strong>{insights.pricingCompetitiveness.breakdown.fair_price}</strong></div>
              <div className="flex justify-between gap-4 text-danger-600"><span>Overpriced:</span> <strong>{insights.pricingCompetitiveness.breakdown.overpriced}</strong></div>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-white/60 dark:bg-surface-800/60 backdrop-blur-md p-5 rounded-2xl border border-white/40 dark:border-surface-700/50">
          <div className="flex items-center gap-2 mb-3">
            <HiOutlineLightBulb className="w-5 h-5 text-surface-500" />
            <h3 className="font-semibold text-surface-700 dark:text-surface-300">Actionable Advice</h3>
          </div>
          {insights.aiSuggestions?.length > 0 ? (
            <ul className="space-y-3">
              {insights.aiSuggestions.map((suggestion, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-surface-700 dark:text-surface-300">
                  <span className="text-primary-500 mt-0.5">•</span> {suggestion}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-surface-500 flex items-center gap-2">
              <HiOutlineInformationCircle className="w-4 h-4" /> You're doing great! No immediate suggestions.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AISellerInsights;
