import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { HiOutlineUser, HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineDevicePhoneMobile, HiOutlineMapPin, HiOutlineUserPlus } from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { registerStart, registerSuccess, registerFailure } from '../../store/authSlice';
import authService from '../../services/authService';
import { isValidEmail, validatePassword } from '../../utils/helpers';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const pwdValidation = validatePassword(formData.password);
      if (!pwdValidation.valid) newErrors.password = pwdValidation.message;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    dispatch(registerStart());
    try {
      // Exclude confirmPassword from API request
      const { confirmPassword, ...registerData } = formData;
      const user = await authService.register(registerData);
      dispatch(registerSuccess(user));
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      dispatch(registerFailure(message));
      toast.error(message);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">
          Create Account
        </h1>
        <p className="text-surface-500 dark:text-surface-400 text-sm">
          Join EtGebeya to buy and sell electronics
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          name="name"
          type="text"
          icon={HiOutlineUser}
