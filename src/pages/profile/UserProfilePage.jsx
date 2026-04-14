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
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Column: Avatar & Quick Info */}
        <div className="w-full md:w-1/3 flex flex-col items-center">
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-8 w-full flex flex-col items-center text-center">
            <div className="relative mb-4">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-32 h-32 rounded-full object-cover ring-4 ring-primary-50 dark:ring-primary-900/20"
              />
              {user.isVerified && (
                <div className="absolute bottom-1 right-1 w-8 h-8 bg-success-500 rounded-full border-4 border-white dark:border-surface-900 flex items-center justify-center" title="Verified User">
                  <HiOutlineCheck className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            
            <h2 className="text-xl font-bold text-surface-900 dark:text-white">{user.name}</h2>
            <p className="text-sm text-surface-500 mb-4">Member since {new Date(user.joinDate).getFullYear()}</p>
            
            <div className="w-full pt-4 border-t border-surface-100 dark:border-surface-800 flex justify-between text-sm">
              <div className="text-center">
                <p className="font-bold text-surface-900 dark:text-white">{user.trustScore?.toFixed(1) || 'N/A'}</p>
                <p className="text-surface-500">Trust Score</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-surface-900 dark:text-white">{user.totalSold || 0}</p>
                <p className="text-surface-500">Items Sold</p>
              </div>
