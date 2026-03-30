import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineArrowRight } from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { loginStart, loginSuccess, loginFailure } from '../../store/authSlice';
import authService from '../../services/authService';
import { isValidEmail } from '../../utils/helpers';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loginType, setLoginType] = useState('user'); // 'user' or 'admin'

  const handleLoginTypeToggle = (type) => {
    setLoginType(type);
    if (type === 'admin') {
      setFormData({ email: 'admin@etgebeya.com', password: 'password' });
    } else {
      setFormData({ email: '', password: '' });
    }
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    dispatch(loginStart());
    try {
      const user = await authService.login(formData.email, formData.password);
      dispatch(loginSuccess(user));
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      dispatch(loginFailure(message));
      toast.error(message);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">
          Welcome Back
        </h1>
        <p className="text-surface-500 dark:text-surface-400 text-sm">
          Sign in to your account to continue
        </p>
      </div>

      {/* Login Type Toggle */}
      <div className="flex bg-surface-100 dark:bg-surface-800 p-1 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => handleLoginTypeToggle('user')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            loginType === 'user'
              ? 'bg-white dark:bg-surface-900 text-primary-600 shadow-sm'
              : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
          }`}
        >
          User Login
        </button>
        <button
          type="button"
          onClick={() => handleLoginTypeToggle('admin')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            loginType === 'admin'
              ? 'bg-white dark:bg-surface-900 text-primary-600 shadow-sm'
              : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
          }`}
        >
          Admin Login
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email Address"
          name="email"
          type="email"
          icon={HiOutlineEnvelope}
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          disabled={loading}
        />

        <div className="space-y-1">
