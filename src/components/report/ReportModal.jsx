import { useState } from 'react';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import Modal from '../common/Modal';
import Button from '../common/Button';
import reportService from '../../services/reportService';

const ReportModal = ({ isOpen, onClose, productId, productTitle }) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportReasons = [
    'Incorrect Category/Brand',
    'Fake or Counterfeit Item',
    'Suspicious Pricing',
    'Inappropriate Content',
    'Scam or Fraudulent Seller',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      toast.error('Please select a reason for reporting');
      return;
    }

    setIsSubmitting(true);
    try {
      await reportService.submitReport(
        productId,
        reason,
        details
      );
      toast.success('Report submitted successfully. Thank you for keeping our community safe.');
      onClose();
      // Reset form
      setReason('');
      setDetails('');
    } catch (error) {
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report Listing">
      <div className="mb-6 bg-warning-50 dark:bg-warning-900/20 p-4 rounded-xl border border-warning-200 dark:border-warning-800/50 flex gap-3">
        <HiOutlineExclamationTriangle className="w-6 h-6 text-warning-600 dark:text-warning-500 shrink-0" />
        <div>
          <p className="text-sm text-warning-800 dark:text-warning-400 font-medium">
            You are reporting: <span className="font-bold">{productTitle}</span>
          </p>
          <p className="text-xs text-warning-700 dark:text-warning-500 mt-1">
