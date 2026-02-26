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
