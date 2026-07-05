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

