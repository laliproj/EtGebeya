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

