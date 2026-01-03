import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { toast } from 'react-toastify';

const Profile: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    monthly_budget: 0,
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username,
        email: user.email,
        monthly_budget: user.monthly_budget,
      });
      // Fetch notifications setting
      fetchNotificationsSetting();
    }
  }, [user]);

  const fetchNotificationsSetting = async () => {
    try {
      const response = await api.get('/auth/notifications');
      setNotificationsEnabled(response.data.email_notifications_enabled);
    } catch (error) {
      console.error('Failed to fetch notifications setting:', error);
    }
  };

  const validateProfile = () => {
    const newErrors: { [key: string]: string } = {};

    if (!profileData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (profileData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(profileData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (profileData.monthly_budget < 0) {
      newErrors.monthly_budget = 'Monthly budget cannot be negative';
    } else if (profileData.monthly_budget > 5000) {
      newErrors.monthly_budget = 'Monthly budget cannot exceed $5000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors: { [key: string]: string } = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'New password must be at least 8 characters';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfile()) return;

    setLoading(true);
    try {
      const response = await api.put('/auth/me', {
        username: profileData.username,
        email: profileData.email,
        monthly_budget: profileData.monthly_budget,
      });

      // Update user in context if needed, but since AuthContext fetches on login,
      // we might need to refresh or update context
      toast.success('Profile updated successfully!');
      setErrors({});
    } catch (error: any) {
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setPasswordLoading(true);
    try {
      const formData = new FormData();
      formData.append('current_password', passwordData.currentPassword);
      formData.append('new_password', passwordData.newPassword);

      await api.post('/auth/change-password', formData);

      toast.success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setErrors({});
    } catch (error: any) {
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Failed to change password');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleNotificationsToggle = async () => {
    setNotificationsLoading(true);
    try {
      const response = await api.put('/auth/notifications', { enabled: !notificationsEnabled });
      setNotificationsEnabled(response.data.email_notifications_enabled);
      toast.success('Notifications setting updated!');
    } catch (error) {
      toast.error('Failed to update notifications setting');
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await api.get('/reports/export/expenses', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expense_data_${user?.username}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  if (authLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Profile Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information Section */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={profileData.username}
                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                className={`input-field ${errors.username ? 'border-error-500 focus:ring-error-500' : ''}`}
              />
              {errors.username && <p className="text-error-500 text-sm mt-1">{errors.username}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className={`input-field ${errors.email ? 'border-error-500 focus:ring-error-500' : ''}`}
              />
              {errors.email && <p className="text-error-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="monthly_budget" className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Budget ($)
              </label>
              <input
                type="number"
                id="monthly_budget"
                value={profileData.monthly_budget}
                onChange={(e) => setProfileData({ ...profileData, monthly_budget: parseFloat(e.target.value) || 0 })}
                className={`input-field ${errors.monthly_budget ? 'border-error-500 focus:ring-error-500' : ''}`}
                min="0"
                step="0.01"
              />
              {errors.monthly_budget && <p className="text-error-500 text-sm mt-1">{errors.monthly_budget}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Change Password Section */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className={`input-field ${errors.currentPassword ? 'border-error-500 focus:ring-error-500' : ''}`}
              />
              {errors.currentPassword && <p className="text-error-500 text-sm mt-1">{errors.currentPassword}</p>}
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className={`input-field ${errors.newPassword ? 'border-error-500 focus:ring-error-500' : ''}`}
              />
              {errors.newPassword && <p className="text-error-500 text-sm mt-1">{errors.newPassword}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className={`input-field ${errors.confirmPassword ? 'border-error-500 focus:ring-error-500' : ''}`}
              />
              {errors.confirmPassword && <p className="text-error-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="btn-primary w-full"
            >
              {passwordLoading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Account Settings Section */}
        <div className="card lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Account Status</h3>
                <p className="text-sm text-gray-600">Your account is active and in good standing.</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                Active
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                <p className="text-sm text-gray-600">Receive email notifications for important updates.</p>
              </div>
              <button
                onClick={handleNotificationsToggle}
                disabled={notificationsLoading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  notificationsEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Data Export</h3>
                <p className="text-sm text-gray-600">Download all your expense data.</p>
              </div>
              <button
                onClick={handleExportData}
                className="btn-secondary text-sm"
              >
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;