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
          <Link 
            to="/login"
            className="block text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link 
          to="/login" 
          className="inline-flex items-center gap-1.5 text-sm font-medium text-surface-500 hover:text-surface-900 dark:hover:text-white transition-colors mb-6"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">
          Forgot Password
        </h1>
        <p className="text-surface-500 dark:text-surface-400 text-sm">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email Address"
          name="email"
          type="email"
          icon={HiOutlineEnvelope}
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
          error={error}
          disabled={isLoading}
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          isLoading={isLoading}
          icon={HiOutlinePaperAirplane}
        >
          Send Reset Link
        </Button>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
