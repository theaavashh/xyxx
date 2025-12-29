'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Camera,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Edit3
} from 'lucide-react';
import Modal from '@/components/Modal';

interface PersonalInfoFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  companyName: string;
  businessLicense: string;
}

interface PersonalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PersonalInfoModal: React.FC<PersonalInfoModalProps> = ({ isOpen, onClose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<PersonalInfoFormData>({
    defaultValues: {
      firstName: 'Demo',
      lastName: 'Distributor',
      email: 'demo@distributor.com',
      phone: '+977-123-4567',
      address: '123 Business Street',
      city: 'Kathmandu',
      state: 'Bagmati',
      zipCode: '44600',
      country: 'Nepal',
      companyName: 'Demo Distribution Co.',
      businessLicense: 'DL-2024-12345'
    }
  });

  const watchedValues = watch();

  const onSubmit = async (data: PersonalInfoFormData) => {
    console.log('Updating personal information:', data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert('Personal information updated successfully!');
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Uploading image:', file.name);
      // Handle image upload logic here
    }
  };

  React.useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Personal Information"
      size="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        {/* Profile Picture Section */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                DD
              </div>
              <label className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <Camera className="h-4 w-4 text-gray-600" />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Profile Picture</h3>
              <p className="text-sm text-gray-600">Upload a professional photo</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-4 w-4" />
                Personal Information
              </h4>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      First Name
                    </label>
                    <input
                      {...register('firstName', { required: 'First name is required' })}
                      type="text"
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Last Name
                    </label>
                    <input
                      {...register('lastName', { required: 'Last name is required' })}
                      type="text"
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      type="email"
                      disabled={isSubmitting}
                      className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      {...register('phone', { required: 'Phone number is required' })}
                      type="tel"
                      disabled={isSubmitting}
                      className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building className="h-4 w-4" />
                Business Information
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Company Name
                  </label>
                  <input
                    {...register('companyName', { required: 'Company name is required' })}
                    type="text"
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                      errors.companyName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Business License
                  </label>
                  <input
                    {...register('businessLicense', { required: 'Business license is required' })}
                    type="text"
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                      errors.businessLicense ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.businessLicense && (
                    <p className="mt-1 text-sm text-red-600">{errors.businessLicense.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Address Information */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Address Information
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Street Address
                  </label>
                  <input
                    {...register('address', { required: 'Address is required' })}
                    type="text"
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      City
                    </label>
                    <input
                      {...register('city', { required: 'City is required' })}
                      type="text"
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      State/Province
                    </label>
                    <input
                      {...register('state', { required: 'State is required' })}
                      type="text"
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                        errors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      ZIP/Postal Code
                    </label>
                    <input
                      {...register('zipCode', { required: 'ZIP code is required' })}
                      type="text"
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                        errors.zipCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.zipCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Country
                    </label>
                    <input
                      {...register('country', { required: 'Country is required' })}
                      type="text"
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                        errors.country ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.country && (
                      <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Current Information Display */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-3">Current Account Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Account Type:</span>
                  <span className="font-medium text-blue-900">Distributor</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Member Since:</span>
                  <span className="font-medium text-blue-900">January 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Account Status:</span>
                  <span className="font-medium text-green-600">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Last Updated:</span>
                  <span className="font-medium text-blue-900">Today</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
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
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 inline mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PersonalInfoModal;