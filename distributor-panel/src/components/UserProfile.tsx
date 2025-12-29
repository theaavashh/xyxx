'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore, useAuth } from '@/stores/authStore';
import { User, UserSettings } from '@/types';
import { apiClient } from '@/lib/api';
import {
  UserIcon,
  KeyIcon,
  BellIcon,
  ShieldCheck,
  EyeIcon,
  EyeSlashIcon,
  CameraIcon,
  GlobeAltIcon,
  CreditCardIcon,
  CogIcon,
  FileText,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

interface UserProfileProps {
  onClose?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { user, updateProfile } = useAuthStore();
  const { addNotification } = useUIStore();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'preferences'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    companyName: user?.companyName || '',
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'light',
    language: 'en',
    currency: 'NPR',
    timezone: 'Asia/Kathmandu',
    emailNotifications: true,
    pushNotifications: true,
    autoSave: true,
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'en-US',
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(true);
    
    try {
      const success = await updateProfile(formData);
      
      if (success) {
        addNotification({
          distributorId: user?.distributorId || '',
          type: 'system',
          title: 'Profile Updated',
          message: 'Your profile has been updated successfully.',
          priority: 'medium',
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      addNotification({
        distributorId: user?.distributorId || '',
        type: 'system',
        title: 'Update Failed',
        message: 'Failed to update your profile. Please try again.',
        priority: 'high',
      });
      setIsEditing(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addNotification({
        distributorId: user?.distributorId || '',
        type: 'system',
        title: 'Password Mismatch',
        message: 'New password and confirmation do not match.',
        priority: 'high',
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      addNotification({
        distributorId: user?.distributorId || '',
        type: 'system',
        title: 'Password Too Short',
        message: 'Password must be at least 8 characters long.',
        priority: 'high',
      });
      return;
    }

    setIsChangingPassword(true);
    
    try {
      const response = await apiClient.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.success) {
        addNotification({
          distributorId: user?.distributorId || '',
          type: 'system',
          title: 'Password Changed',
          message: 'Your password has been changed successfully.',
          priority: 'medium',
        });
        
        // Reset password form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setShowPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      } else {
        throw new Error(response.message || 'Password change failed');
      }
    } catch (error) {
      console.error('Password change error:', error);
      addNotification({
        distributorId: user?.distributorId || '',
        type: 'system',
        title: 'Password Change Failed',
        message: 'Current password is incorrect. Please try again.',
        priority: 'high',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSettingsUpdate = async (settingKey: keyof UserSettings, value: any) => {
    const newSettings = { ...settings, [settingKey]: value };
    setSettings(newSettings);
    
    try {
      // This would call an API endpoint to save settings
      console.log('Settings updated:', newSettings);
      
      addNotification({
        distributorId: user?.distributorId || '',
        type: 'system',
        title: 'Settings Updated',
        message: 'Your preferences have been saved.',
        priority: 'low',
      });
    } catch (error) {
      console.error('Settings update error:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 text-sm font-medium border-b-2 border-transparent ${
                activeTab === 'profile'
                  ? 'text-blue-600 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
              }`}
            >
              <UserIcon className="h-4 w-4 mr-2" />
              Profile
            </button>
            
            <button
              onClick={() => setActiveTab('security')}
              className={`px-6 py-3 text-sm font-medium border-b-2 border-transparent ${
                activeTab === 'security'
                  ? 'text-blue-600 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
              }`}
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              Security
            </button>
            
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-6 py-3 text-sm font-medium border-b-2 border-transparent ${
                activeTab === 'notifications'
                  ? 'text-blue-600 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
              }`}
            >
              <BellIcon className="h-4 w-4 mr-2" />
              Notifications
            </button>
            
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-6 py-3 text-sm font-medium border-b-2 border-transparent ${
                activeTab === 'preferences'
                  ? 'text-blue-600 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
              }`}
            >
              <CogIcon className="h-4 w-4 mr-2" />
              Preferences
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex justify-end gap-4 mt-6">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            name: user?.name || '',
                            email: user?.email || '',
                            phone: user?.phone || '',
                            address: user?.address || '',
                            companyName: user?.companyName || '',
                          });
                          setIsEditing(false);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      
                      <button
                        type="submit"
                        disabled={isChangingPassword}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isChangingPassword ? 'Saving...' : 'Save Changes'}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        disabled={isChangingPassword}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 p-1 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        disabled={isChangingPassword}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 p-1 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        disabled={isChangingPassword}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 p-1 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                    <button
                      onClick={() => handleSettingsUpdate('emailNotifications', !settings.emailNotifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full border-2 border-transparent ${
                        settings.emailNotifications
                          ? 'bg-blue-600 border-blue-500'
                          : 'bg-gray-200 border-gray-300'
                      } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <span className="sr-only">Toggle email notifications</span>
                      {settings.emailNotifications && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <svg className="h-4 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M16.707 5.293a1 1 0 01.414 0l-8-8a1 1 0 01-1.414 1.414L10.586 1.707a1 1 0 01-1.414 0l-6.293-6.293a1 1 0 01-1.414-1.414l-8 8a1 1 0 01-1.414 1.414z" />
                          </svg>
                        </span>
                      )}
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                    <button
                      onClick={() => handleSettingsUpdate('pushNotifications', !settings.pushNotifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full border-2 border-transparent ${
                        settings.pushNotifications
                          ? 'bg-blue-600 border-blue-500'
                          : 'bg-gray-200 border-gray-300'
                      } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <span className="sr-only">Toggle push notifications</span>
                      {settings.pushNotifications && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <svg className="h-4 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M16.707 5.293a1 1 0 01.414 0l-8-8a1 1 0 01-1.414 1.414L10.586 1.707a1 1 0 01-1.414 0l-6.293-6.293a1 1 0 01-1.414-1.414l-8 8a1 1 0 01-1.414 1.414z" />
                          </svg>
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Preferences</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                    <select
                      value={settings.theme}
                      onChange={(e) => handleSettingsUpdate('theme', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select
                      value={settings.language}
                      onChange={(e) => handleSettingsUpdate('language', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="en">English</option>
                      <option value="ne">नेपाली (Nepali)</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={settings.currency}
                      onChange={(e) => handleSettingsUpdate('currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="NPR">NPR (रुपैयाँ)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => handleSettingsUpdate('timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Asia/Kathmandu">Asia/Kathmandu</option>
                      <option value="Asia/Dubai">Asia/Dubai</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoSave"
                      checked={settings.autoSave}
                      onChange={(e) => handleSettingsUpdate('autoSave', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="autoSave" className="ml-2 block text-sm text-gray-700">
                      Auto-save daily logs
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};