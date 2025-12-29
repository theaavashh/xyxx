'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/components/AuthProvider';
import {
  Eye,
  EyeOff,
  Lock,
  AlertTriangle,
  CheckCircle,
  Shield,
  Key,
} from 'lucide-react';

const ChangePasswordForm: React.FC = () => {
  const { changePassword, isLoading } = useAuth();
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');
  const confirmPassword = watch('confirmPassword');

  const passwordStrength = (password: string): { score: number; text: string; color: string } => {
    if (password.length === 0) return { score: 0, text: '', color: '' };
    if (password.length < 6) return { score: 1, text: 'Weak', color: 'text-red-500' };
    if (password.length < 8) return { score: 2, text: 'Fair', color: 'text-yellow-500' };
    if (password.length < 12) return { score: 3, text: 'Good', color: 'text-blue-500' };
    return { score: 4, text: 'Strong', color: 'text-green-500' };
  };

  const passwordRequirements = (password: string) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  };

  const onSubmit = async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    if (data.currentPassword === data.newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const success = await changePassword(data.currentPassword, data.newPassword);
      
      if (success) {
        setSuccess('Password changed successfully! You will be redirected to login shortly.');
        // Clear form
        reset();
        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        setError('Current password is incorrect. Please try again.');
      }
    } catch (error) {
      console.error('Change password error:', error);
      setError('Failed to change password. Please try again later.');
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const strength = passwordStrength(newPassword || '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-50 rounded-lg">
          <Shield className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
          <p className="text-sm text-gray-600">Update your password to keep your account secure</p>
        </div>
      </div>

      {/* Security Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Key className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <h4 className="font-semibold mb-3">Password Requirements:</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  passwordRequirements(newPassword || '').length 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {passwordRequirements(newPassword || '').length ? '✓' : '✗'}
                </span>
                <span className={
                  passwordRequirements(newPassword || '').length 
                    ? 'text-green-700' 
                    : 'text-red-700'
                }>
                  At least 8 characters long
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-xs">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  passwordRequirements(newPassword || '').uppercase 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {passwordRequirements(newPassword || '').uppercase ? '✓' : '✗'}
                </span>
                <span className={
                  passwordRequirements(newPassword || '').uppercase 
                    ? 'text-green-700' 
                    : 'text-red-700'
                }>
                  Include uppercase letters (A-Z)
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-xs">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  passwordRequirements(newPassword || '').lowercase 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {passwordRequirements(newPassword || '').lowercase ? '✓' : '✗'}
                </span>
                <span className={
                  passwordRequirements(newPassword || '').lowercase 
                    ? 'text-green-700' 
                    : 'text-red-700'
                }>
                  Include lowercase letters (a-z)
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-xs">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  passwordRequirements(newPassword || '').number 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {passwordRequirements(newPassword || '').number ? '✓' : '✗'}
                </span>
                <span className={
                  passwordRequirements(newPassword || '').number 
                    ? 'text-green-700' 
                    : 'text-red-700'
                }>
                  Include at least one number (0-9)
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-xs">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  passwordRequirements(newPassword || '').special 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {passwordRequirements(newPassword || '').special ? '✓' : '✗'}
                </span>
                <span className={
                  passwordRequirements(newPassword || '').special 
                    ? 'text-green-700' 
                    : 'text-red-700'
                }>
                  Include special characters (!@#$%^&*...)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">Error</h3>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">Success</h3>
                <p className="text-sm mt-1">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Current Password */}
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="currentPassword"
              {...register('currentPassword', { required: 'Current password is required' })}
              type={showPasswords.current ? 'text' : 'password'}
              disabled={isSubmitting}
              className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm placeholder-gray-400 text-black ${
                errors.currentPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your current password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPasswords.current ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>
          )}
        </div>

        {/* New Password */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="newPassword"
              {...register('newPassword', { 
                required: 'New password is required',
                minLength: { value: 8, message: 'New password must be at least 8 characters long' }
              })}
              type={showPasswords.new ? 'text' : 'password'}
              disabled={isSubmitting}
              className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm placeholder-gray-400 text-black ${
                errors.newPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your new password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPasswords.new ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.newPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
          )}
          
          {/* Password Strength Indicator */}
          {newPassword && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Password Strength</span>
                <span className={`text-xs font-medium ${strength.color}`}>{strength.text}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    strength.score <= 1 ? 'bg-red-500' :
                    strength.score <= 2 ? 'bg-yellow-500' :
                    strength.score <= 3 ? 'bg-blue-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${(strength.score / 4) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm New Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="confirmPassword"
              {...register('confirmPassword', { 
                required: 'Please confirm your new password',
                validate: (value) => value === newPassword || 'Passwords do not match'
              })}
              type={showPasswords.confirm ? 'text' : 'password'}
              disabled={isSubmitting}
              className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm placeholder-gray-400 text-black ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Confirm your new password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPasswords.confirm ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
          
          {/* Password Match Indicator */}
          {confirmPassword && (
            <div className="mt-2">
              {newPassword === confirmPassword ? (
                <div className="flex items-center text-xs text-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Passwords match
                </div>
              ) : (
                <div className="flex items-center text-xs text-red-600">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Passwords do not match
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => reset()}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white inline mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Changing Password...
              </>
            ) : (
              'Change Password'
            )}
          </button>
        </div>
      </form>

      {/* Additional Security Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <h4 className="font-semibold mb-1">Important Security Notice:</h4>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>After changing your password, you'll be automatically logged out</li>
              <li>Use a unique password that you don't use for other accounts</li>
              <li>Consider using a password manager to generate and store strong passwords</li>
              <li>Never share your password with anyone</li>
              <li>If you suspect your account has been compromised, change your password immediately</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordForm;