'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { UserPlus, Eye, EyeOff, Save, X } from 'lucide-react';
import { CreateEmployeeForm, UserRole } from '@/types';
import { generateEmployeeId, validateEmail, validatePhoneNumber } from '@/lib/utils';
import toast from 'react-hot-toast';

const createEmployeeSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phoneNumber: yup.string().required('Phone number is required'),
  department: yup.string().required('Department is required'),
  position: yup.string().required('Position is required'),
  role: yup.string().required('Role is required'),
  joiningDate: yup.string().required('Joining date is required'),
  salary: yup.number().positive('Salary must be positive').required('Salary is required'),
  address: yup.string().required('Address is required'),
  emergencyContact: yup.string().required('Emergency contact is required'),
  emergencyPhone: yup.string().required('Emergency phone is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required')
});

export default function CreateEmployee() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<CreateEmployeeForm>({
    resolver: yupResolver(createEmployeeSchema)
  });

  const selectedDepartment = watch('department');

  const onSubmit = async (data: CreateEmployeeForm) => {
    setIsSubmitting(true);
    
    try {
      // Validate email and phone
      if (!validateEmail(data.email)) {
        toast.error('Please enter a valid email address');
        setIsSubmitting(false);
        return;
      }
      
      if (!validatePhoneNumber(data.phoneNumber)) {
        toast.error('Please enter a valid phone number (10 digits starting with 9)');
        setIsSubmitting(false);
        return;
      }

      // Prepare data for backend API
      const userData = {
        email: data.email,
        fullName: `${data.firstName} ${data.lastName}`,
        password: data.password,
        role: data.role as UserRole,
        department: data.department,
        phoneNumber: data.phoneNumber
      };

      console.log('Creating user with data:', userData);

      // Call backend API to create user
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Generate employee ID for display
        const employeeId = generateEmployeeId(data.department);
        
        toast.success(`Employee created successfully! Employee ID: ${employeeId}`);
        console.log('Employee created:', result.data);
        reset();
        
        // Redirect to employee management after 2 seconds
        setTimeout(() => {
          window.location.href = '/admin?tab=employees';
        }, 2000);
      } else {
        // Handle API errors
        const errorMessage = result.message || 'Failed to create employee';
        if (result.error === 'EMAIL_ALREADY_EXISTS') {
          toast.error('This email address is already in use. Please use a different email.');
        } else {
          // Convert Nepali error messages to English
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
      
    } catch (error) {
      console.error('Error creating employee:', error);
      toast.error('Failed to create employee. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset();
    toast.info('Form cleared');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Employee</h1>
          <p className="text-gray-600 mt-1">Add a new team member to the system</p>
        </div>
        <div className="flex items-center space-x-2">
          <UserPlus className="h-6 w-6 text-indigo-600" />
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Employee Information</h2>
          <p className="text-sm text-gray-600 mt-1">Fill in the details to create a new employee account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  {...register('firstName')}
                  type="text"
                  id="firstName"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  {...register('lastName')}
                  type="text"
                  id="lastName"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  {...register('phoneNumber')}
                  type="text"
                  id="phoneNumber"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="9XXXXXXXXX"
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <textarea
                  {...register('address')}
                  id="address"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="Enter full address"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Work Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Work Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <select
                  {...register('department')}
                  id="department"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                >
                  <option value="">Select Department</option>
                  <option value="Management">Management</option>
                  <option value="Sales">Sales</option>
                  <option value="Finance">Finance</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="HR">Human Resources</option>
                  <option value="IT">Information Technology</option>
                </select>
                {errors.department && (
                  <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                  Position *
                </label>
                <input
                  {...register('position')}
                  type="text"
                  id="position"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="Enter job position"
                />
                {errors.position && (
                  <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  System Role *
                </label>
                <select
                  {...register('role')}
                  id="role"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                >
                  <option value="">Select Role</option>
                  <option value="ADMIN">Administrator</option>
                  <option value="MANAGERIAL">Managerial</option>
                  <option value="SALES_MANAGER">Sales Manager</option>
                  <option value="SALES_REPRESENTATIVE">Sales Representative</option>
                  <option value="DISTRIBUTOR">Distributor</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="joiningDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Joining Date *
                </label>
                <input
                  {...register('joiningDate')}
                  type="date"
                  id="joiningDate"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                />
                {errors.joiningDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.joiningDate.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Salary (NPR) *
                </label>
                <input
                  {...register('salary')}
                  type="number"
                  id="salary"
                  min="0"
                  step="1000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="Enter monthly salary"
                />
                {errors.salary && (
                  <p className="mt-1 text-sm text-red-600">{errors.salary.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact Name *
                </label>
                <input
                  {...register('emergencyContact')}
                  type="text"
                  id="emergencyContact"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="Enter emergency contact name"
                />
                {errors.emergencyContact && (
                  <p className="mt-1 text-sm text-red-600">{errors.emergencyContact.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="emergencyPhone" className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Phone Number *
                </label>
                <input
                  {...register('emergencyPhone')}
                  type="text"
                  id="emergencyPhone"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="9XXXXXXXXX"
                />
                {errors.emergencyPhone && (
                  <p className="mt-1 text-sm text-red-600">{errors.emergencyPhone.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Security</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-12 text-black font-medium"
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
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-12 text-black font-medium"
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
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Save className="h-5 w-5 mr-2" />
              )}
              {isSubmitting ? 'Creating Employee...' : 'Create Employee'}
            </button>
            
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="h-5 w-5 mr-2" />
              Clear Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



