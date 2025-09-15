'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, User, Mail, Lock, MapPin, Building, Briefcase, Eye, EyeOff } from 'lucide-react';
import { UserRole } from '@/types';
import { validateEmail, validatePhoneNumber } from '@/lib/utils';
import { config } from '@/lib/config';
import toast from 'react-hot-toast';

interface CreateEmployeeFormData {
  fullName: string;
  email: string;
  username: string;
  password?: string;
  confirmPassword?: string;
  address: string;
  department: string;
  position: string;
}

const createEmployeeSchema = yup.object({
  fullName: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  username: yup.string().min(3, 'Username must be at least 3 characters').required('Username is required'),
  password: yup.string().when('$editMode', {
    is: false,
    then: (schema) => schema.min(6, 'Password must be at least 6 characters').required('Password is required'),
    otherwise: (schema) => schema.optional()
  }),
  confirmPassword: yup.string().when('$editMode', {
    is: false,
    then: (schema) => schema.oneOf([yup.ref('password')], 'Passwords must match').required('Confirm password is required'),
    otherwise: (schema) => schema.optional()
  }),
  address: yup.string().required('Address is required'),
  department: yup.string().required('Department is required'),
  position: yup.string().required('Position is required'),
});



interface CreateEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data?: any) => void;
  editMode?: boolean;
  initialData?: Partial<CreateEmployeeFormData>;
}

const departments = [
  'Management',
  'Sales',
  'Finance',
  'Manufacturing',
  'HR',
  'IT'
];

export default function CreateEmployeeModal({ isOpen, onClose, onSuccess, editMode = false, initialData }: CreateEmployeeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateEmployeeFormData>({
    resolver: yupResolver(createEmployeeSchema) as any,
    context: { editMode },
    defaultValues: editMode ? initialData : undefined
  });

  const onSubmit = async (data: CreateEmployeeFormData) => {
    setIsSubmitting(true);
    
    try {
      // Validate email
      if (!validateEmail(data.email)) {
        toast.error('Please enter a valid email address');
        setIsSubmitting(false);
        return;
      }

      // Determine role based on department
      let role: UserRole = 'SALES_REPRESENTATIVE';
      if (data.department === 'Management') {
        role = 'MANAGERIAL';
      } else if (data.department === 'Sales') {
        role = 'SALES_MANAGER';
      } else {
        role = 'ADMIN';
      }

      // Prepare data for backend API
      const userData = {
        email: data.email,
        username: data.username,
        fullName: data.fullName,
        password: data.password,
        confirmPassword: data.confirmPassword,
        address: data.address,
        department: data.department,
        position: data.position,
        role: role
      };

      console.log(editMode ? 'Updating user with data:' : 'Creating user with data:', userData);

      if (editMode) {
        // For edit mode, call onSuccess with the form data
        if (onSuccess) {
          onSuccess(userData);
        }
        toast.success('Employee updated successfully!');
        reset();
        onClose();
      } else {
        // Call backend API to create user
        const response = await fetch(`${config.apiUrl}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          toast.success('Employee created successfully!');
          console.log('Employee created:', result.data);
          reset();
          onClose();
          if (onSuccess) onSuccess();
        } else {
          // Handle API errors
          const errorMessage = result.message || 'Failed to create employee';
          if (result.error === 'EMAIL_ALREADY_EXISTS') {
            toast.error('This email address is already in use. Please use a different email.');
          } else {
            // Convert any remaining Nepali error messages to English
            let englishMessage = errorMessage;
            if (errorMessage.includes('यो इमेल ठेगाना पहिले नै प्रयोग भएको छ')) {
              englishMessage = 'This email address is already in use. Please use a different email.';
            } else if (errorMessage.includes('गलत')) {
              englishMessage = 'Invalid data provided. Please check your input.';
            } else if (errorMessage.includes('आवश्यक')) {
              englishMessage = 'Required field is missing. Please fill all required fields.';
            }
            toast.error(englishMessage);
          }
        }
      }
      
    } catch (error) {
      console.error('Error creating employee:', error);
      toast.error('Failed to create employee. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.3,
              ease: "easeOut"
            }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 z-[60]"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ y: '100vh', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100vh', opacity: 0 }}
            transition={{ 
              duration: 0.4,
              ease: "easeOut"
            }}
            className="fixed top-[5%] left-1/2 transform -translate-x-1/2 w-full max-w-xl mx-4 bg-white rounded-2xl shadow-xl z-[70] max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editMode ? 'Edit Employee' : 'Create New Employee'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {editMode ? 'Update employee information' : 'Add a new team member to the system'}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="px-4 pb-4 space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Full Name *
                </label>
                <input
                  {...register('fullName')}
                  type="text"
                  id="fullName"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-medium"
                  placeholder="Enter full name"
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                )}
              </div>

              {/* Email and Username Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email Address *
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-medium"
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Username *
                  </label>
                  <input
                    {...register('username')}
                    type="text"
                    id="username"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-medium"
                    placeholder="Enter username"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                  )}
                </div>
              </div>

              {/* Password Row - Only show in create mode */}
              {!editMode && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock className="inline h-4 w-4 mr-1" />
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-12 text-gray-900 font-medium"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock className="inline h-4 w-4 mr-1" />
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-12 text-gray-900 font-medium"
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
              )}

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Address *
                </label>
                <textarea
                  {...register('address')}
                  id="address"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-medium"
                  placeholder="Enter full address"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>

              {/* Department and Position Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="inline h-4 w-4 mr-1" />
                    Department *
                  </label>
                  <select
                    {...register('department')}
                    id="department"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-medium"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                    <Briefcase className="inline h-4 w-4 mr-1" />
                    Position *
                  </label>
                  <input
                    {...register('position')}
                    type="text"
                    id="position"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-medium"
                    placeholder="Enter job position"
                  />
                  {errors.position && (
                    <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <User className="h-5 w-5 mr-2" />
                  )}
                  {isSubmitting 
                    ? (editMode ? 'Updating Employee...' : 'Creating Employee...') 
                    : (editMode ? 'Update Employee' : 'Create Employee')
                  }
                </button>
                
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="h-5 w-5 mr-2" />
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
