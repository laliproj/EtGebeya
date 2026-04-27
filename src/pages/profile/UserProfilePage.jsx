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
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="w-full md:w-2/3">
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-surface-100 dark:border-surface-800">
              <h3 className="text-lg font-bold text-surface-900 dark:text-white">Profile Details</h3>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>

            <div className="p-6">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Full Name"
                    name="name"
                    icon={HiOutlineUser}
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    icon={HiOutlineEnvelope}
                    value={formData.email}
                    onChange={handleChange}
                    disabled={true} // Usually email can't be easily changed
                    className="opacity-70 cursor-not-allowed"
                  />
                  <Input
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    icon={HiOutlinePhone}
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <Input
                    label="Location"
                    name="location"
                    icon={HiOutlineMapPin}
                    value={formData.location}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  
                  <div className="pt-4 flex gap-3 justify-end">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => setIsEditing(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      variant="primary"
                      isLoading={isLoading}
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-surface-500 mb-1">Full Name</p>
                      <p className="font-medium text-surface-900 dark:text-white flex items-center gap-2">
                        <HiOutlineUser className="w-5 h-5 text-surface-400" />
                        {user.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-surface-500 mb-1">Email Address</p>
                      <p className="font-medium text-surface-900 dark:text-white flex items-center gap-2">
                        <HiOutlineEnvelope className="w-5 h-5 text-surface-400" />
                        {user.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-surface-500 mb-1">Phone Number</p>
                      <p className="font-medium text-surface-900 dark:text-white flex items-center gap-2">
                        <HiOutlinePhone className="w-5 h-5 text-surface-400" />
                        {user.phone || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-surface-500 mb-1">Location</p>
                      <p className="font-medium text-surface-900 dark:text-white flex items-center gap-2">
                        <HiOutlineMapPin className="w-5 h-5 text-surface-400" />
                        {user.location || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserProfilePage;
