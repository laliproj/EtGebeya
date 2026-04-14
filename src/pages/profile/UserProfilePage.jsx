import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { HiOutlineUser, HiOutlineEnvelope, HiOutlinePhone, HiOutlineMapPin, HiOutlineCheck } from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { updateProfile } from '../../store/authSlice';
import authService from '../../services/authService';

const UserProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const updatedUser = await authService.updateProfile(formData);
      dispatch(updateProfile(updatedUser));
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
