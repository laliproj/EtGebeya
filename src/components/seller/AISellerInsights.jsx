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
