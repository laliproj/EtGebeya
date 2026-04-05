import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineEnvelope, HiOutlineArrowLeft, HiOutlinePaperAirplane } from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import authService from '../../services/authService';
import { isValidEmail } from '../../utils/helpers';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setIsSent(true);
      toast.success('Reset link sent to your email');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to send reset link';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <HiOutlinePaperAirplane className="w-8 h-8 text-success-600 dark:text-success-500 -mt-1 ml-1" />
        </div>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">
          Check your email
        </h2>
        <p className="text-surface-500 dark:text-surface-400 mb-8">
          We've sent a password reset link to <br />
          <span className="font-medium text-surface-900 dark:text-white">{email}</span>
        </p>
        <div className="space-y-4">
          <Button
            variant="outline"
            fullWidth
            onClick={() => setIsSent(false)}
          >
            Try another email
          </Button>
