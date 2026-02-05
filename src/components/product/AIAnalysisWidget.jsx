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
