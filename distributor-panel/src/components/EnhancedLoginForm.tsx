'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { LoginForm as LoginFormType } from '@/types';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  LogIn,
  AlertTriangle,
  Activity,
} from 'lucide-react';

interface EnhancedLoginFormProps {
  onLoginSuccess?: () => void;
}

export const EnhancedLoginForm: React.FC<EnhancedLoginFormProps> = ({ onLoginSuccess, isDistributorAuth = false }) => {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState<LoginFormType>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for remembered credentials
  useEffect(() => {
    const rememberedUser = localStorage.getItem('distributor_remembered_user');
    if (rememberedUser) {
      try {
        const { email, password } = JSON.parse(rememberedUser);
        setFormData({ email, password, rememberMe: true });
      } catch (error) {
        console.error('Error parsing remembered user:', error);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Basic validation
      if (!formData.email || !formData.password) {
        throw new Error('Please fill in all required fields');
      }

      // Email validation
      if (!formData.email.includes('@') || !formData.email.includes('.')) {
        throw new Error('Please enter a valid email address');
      }

      // Password validation
      if (formData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      const success = await login(formData.email, formData.password);

      if (success) {
        // Save to localStorage if remember me is checked
        if (formData.rememberMe) {
          localStorage.setItem('distributor_remembered_user', JSON.stringify({
            email: formData.email,
            password: formData.password,
          }));
        } else {
          localStorage.removeItem('distributor_remembered_user');
        }

        onLoginSuccess?.();
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-auto flex items-center justify-center">
            <img
              src="/zipzip-logo.svg"
              alt="ZipZip Logo"
              className="h-16 w-auto"
            />
          </div>
          <h2 className="mt-6 text-2xl font-semibold text-gray-900 font-poppins">
            Welcome to Distributor Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to manage sales and inventory
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">Login Failed</h3>
                  <p className="text-sm mt-1">{error}</p>
                  <p className="text-xs mt-1">Please fix server issue and try again.</p>
                </div>
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isSubmitting}
                className="pl-10 w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm placeholder-gray-400"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isSubmitting}
                className="pl-10 w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm placeholder-gray-400"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                disabled={isSubmitting}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </a>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting || !formData.email || !formData.password}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="ml-2">Signing in...</span>
                </>
              ) : (
                <>
                  <User className="h-5 w-5 text-white" />
                  <span className="ml-2">Sign in to Distributor Portal</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              Terms of Service
            </a>
            {' '}and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              Privacy Policy
            </a>
          </p>
        </div>

       

        {/* Additional Information */}
        <div className="mt-8 text-center">
          <div className="text-sm text-gray-600">
            <p className="mb-2">
              <strong>Need Help?</strong>
            </p>
            <p>
              Contact our support team at{' '}
              <a href="mailto:support@distributor.com" className="text-blue-600 hover:text-blue-500">
                support@distributor.com
              </a>
              {' '}or call{' '}
              <span className="font-medium">+977-123-4567</span>
            </p>
            <p className="mt-2">
              Available: Mon-Fri, 9:00 AM - 6:00 PM EST
            </p>
          </div>
        </div>

       
      </div>
    </div>
  );
};