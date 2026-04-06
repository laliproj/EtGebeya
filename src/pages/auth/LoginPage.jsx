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
