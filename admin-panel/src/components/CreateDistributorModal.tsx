'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  MapPin, 
  Building, 
  Briefcase, 
  Eye, 
  EyeOff, 
  Calendar,
  Phone,
  FileText,
  Upload,
  Trash2,
  Download
} from 'lucide-react';
import { CreateDistributorFormData, Distributor } from '@/types';
import { DistributorApplication } from '@/lib/distributorApi';
import { validateEmail, validatePhoneNumber } from '@/lib/utils';
import { config } from '@/lib/config';
import toast from 'react-hot-toast';

interface CreateDistributorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data?: any) => void;
  editMode?: boolean;
  initialData?: DistributorApplication | null;
}

const companyTypes = [
  { value: 'SOLE_PROPRIETORSHIP', label: 'Sole Proprietorship' },
  { value: 'PARTNERSHIP', label: 'Partnership' },
  { value: 'PRIVATE_LIMITED', label: 'Private Limited' },
  { value: 'PUBLIC_LIMITED', label: 'Public Limited' }
];

const documentTypes = [
  { value: 'CITIZENSHIP', label: 'Citizenship Certificate' },
  { value: 'PAN_CARD', label: 'PAN Card' },
  { value: 'COMPANY_REGISTRATION', label: 'Company Registration' },
  { value: 'VAT_CERTIFICATE', label: 'VAT Certificate' },
  { value: 'OTHER', label: 'Other' }
];

const createDistributorSchema = yup.object({
  // Person Details
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phoneNumber: yup.string().required('Phone number is required'),
  address: yup.string().required('Address is required'),
  dateOfBirth: yup.string().required('Date of birth is required'),
  nationalId: yup.string().required('National ID is required'),
  
  // Company Details
  companyName: yup.string().required('Company name is required'),
  companyType: yup.string().required('Company type is required'),
  registrationNumber: yup.string().required('Registration number is required'),
  panNumber: yup.string().required('PAN number is required'),
  vatNumber: yup.string().optional(),
  establishedDate: yup.string().required('Established date is required'),
  companyAddress: yup.string().required('Company address is required'),
  website: yup.string().url('Invalid URL').optional(),
  description: yup.string().optional(),
  
  // Credentials
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
  })
});

// Local storage key for form persistence
const FORM_STORAGE_KEY = 'create_distributor_form_data';
const STEP_STORAGE_KEY = 'create_distributor_current_step';

const CreateDistributorModal = React.memo(function CreateDistributorModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editMode = false, 
  initialData 
}: CreateDistributorModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState<Partial<CreateDistributorFormData>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInitialLoadRef = useRef(false);

  // Load persisted data from localStorage
  const loadPersistedData = (): Partial<CreateDistributorFormData> => {
    if (typeof window === 'undefined') return {};
    
    try {
      const savedData = localStorage.getItem(FORM_STORAGE_KEY);
      const savedStep = localStorage.getItem(STEP_STORAGE_KEY);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (savedStep) {
          setCurrentStep(parseInt(savedStep));
        }
        return parsedData;
      }
    } catch (error) {
      console.error('Error loading persisted form data:', error);
    }
    return {};
  };

  // Save data to localStorage
  const saveToLocalStorage = (data: Partial<CreateDistributorFormData>, step: number) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(STEP_STORAGE_KEY, step.toString());
    } catch (error) {
      console.error('Error saving form data to localStorage:', error);
    }
  };

  // Clear persisted data
  const clearPersistedData = () => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(FORM_STORAGE_KEY);
      localStorage.removeItem(STEP_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing persisted data:', error);
    }
  };

  // Memoized default values - prevent re-creation on every render
  const defaultValues = useMemo((): Partial<CreateDistributorFormData> => {
    if (editMode && initialData) {
      // Create a deep copy of the initial data to prevent shared state issues
      const safeInitialData = JSON.parse(JSON.stringify(initialData));
      return {
        firstName: safeInitialData.fullName?.split(' ')[0] || '',
        lastName: safeInitialData.fullName?.split(' ').slice(1).join(' ') || '',
        email: safeInitialData.email || '',
        phoneNumber: safeInitialData.mobileNumber || '',
        address: safeInitialData.permanentAddress || '',
        dateOfBirth: '',
        nationalId: safeInitialData.citizenshipNumber || '',
        companyName: safeInitialData.companyName || '',
        companyType: (safeInitialData.businessType as any) || '',
        registrationNumber: safeInitialData.registrationNumber || '',
        panNumber: safeInitialData.panVatNumber || '',
        vatNumber: safeInitialData.panVatNumber || '',
        establishedDate: '',
        companyAddress: safeInitialData.officeAddress || '',
        website: '',
        description: '',
        username: ''
      };
    }
    
    if (!editMode && isOpen) {
      return loadPersistedData();
    }
    
    return {};
  }, [editMode, initialData, isOpen]);

  const { register, handleSubmit, formState: { errors }, reset, watch, getValues, setValue } = useForm<CreateDistributorFormData>({
    resolver: yupResolver(createDistributorSchema) as any,
    context: { editMode },
    defaultValues
  });

  // Reset initial load flag when modal closes
  useEffect(() => {
    if (!isOpen) {
      isInitialLoadRef.current = false;
    } else if (isOpen && !editMode && !isInitialLoadRef.current) {
      isInitialLoadRef.current = true;
      // Form data is already loaded via defaultValues useMemo
      const persistedData = loadPersistedData();
      if (Object.keys(persistedData).length > 0) {
        setFormData(persistedData);
      }
    }
  }, [isOpen, editMode]);

  // Manual save function (called on step navigation and form submit)
  const saveCurrentFormData = () => {
    if (isOpen && !editMode) {
      const currentFormValues = getValues();
      setFormData(prevFormData => {
        const mergedData = { ...prevFormData, ...currentFormValues };
        saveToLocalStorage(mergedData, currentStep);
        return mergedData;
      });
    }
  };

  const steps = [
    { id: 1, title: 'Personal Details', icon: User },
    { id: 2, title: 'Company Details', icon: Building },
    { id: 3, title: 'Documents', icon: FileText },
    { id: 4, title: 'Credentials', icon: Lock }
  ];

  const onSubmit = async (data: CreateDistributorFormData) => {
    setIsSubmitting(true);
    
    try {
      // Save current form data before submitting
      saveCurrentFormData();
      
      // Use the submitted data directly (form validation ensures it's complete)
      const completeData = data;
      
      // Validate email
      if (!validateEmail(completeData.email)) {
        toast.error('Please enter a valid email address');
        setIsSubmitting(false);
        return;
      }

      // Validate phone number
      if (!validatePhoneNumber(completeData.phoneNumber)) {
        toast.error('Please enter a valid phone number');
        setIsSubmitting(false);
        return;
      }

      // Prepare form data for file upload
      const submitFormData = new FormData();
      
      // Add form data as JSON string (expected by API)
      const { documents, ...formDataForAPI } = completeData;
      submitFormData.append('data', JSON.stringify(formDataForAPI));

      // Add uploaded files
      uploadedFiles.forEach((file) => {
        submitFormData.append(`documents`, file);
      });

      console.log(editMode ? 'Updating distributor:' : 'Creating distributor:', completeData);

      if (editMode) {
        // For edit mode, call onSuccess with the form data
        if (onSuccess) {
          onSuccess(completeData);
        }
        toast.success('Distributor updated successfully!');
        clearPersistedData();
        reset();
        onClose();
      } else {
        // Call backend API to create distributor
        try {
          // In development, use the /dev endpoint to bypass authentication
          const endpoint = config.isDevelopment 
            ? `${config.apiUrl}/distributors/dev`
            : `${config.apiUrl}/distributors`;
            
          const headers: HeadersInit = {};
          
          // Only add Authorization header in production or if token exists
          if (!config.isDevelopment) {
            const token = localStorage.getItem(config.tokenKey);
            if (token) {
              headers.Authorization = `Bearer ${token}`;
            }
          }
          
          const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: submitFormData,
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          
          if (result.success) {
            toast.success('Distributor created successfully!');
            console.log('Distributor created:', result.data);
            
            // Clear persisted data on successful submission
            clearPersistedData();
            reset();
            setUploadedFiles([]);
            setCurrentStep(1);
            setFormData({});
            onClose();
            if (onSuccess) onSuccess(result.data);
          } else {
            throw new Error(result.message || 'Failed to create distributor');
          }
        } catch (apiError) {
          console.error('API Error:', apiError);
          
          // For development - show mock success
          if (process.env.NODE_ENV === 'development') {
            console.log('Development mode: Simulating successful creation');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            toast.success('Distributor created successfully! (Development Mode)');
            console.log('Distributor created with files:', uploadedFiles);
            
            clearPersistedData();
            reset();
            setUploadedFiles([]);
            setCurrentStep(1);
            setFormData({});
            onClose();
            if (onSuccess) onSuccess();
          } else {
            throw apiError;
          }
        }
      }
      
    } catch (error) {
      console.error('Error creating distributor:', error);
      toast.error('Failed to create distributor. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    // Only clear persisted data if user explicitly closes without completing
    // (data will be preserved for next time they open the modal)
    reset();
    setUploadedFiles([]);
    setCurrentStep(1);
    setFormData({});
    onClose();
  };

  const handleDiscardDraft = () => {
    // Explicitly clear all persisted data
    clearPersistedData();
    reset();
    setUploadedFiles([]);
    setCurrentStep(1);
    setFormData({});
    onClose();
  };

  const nextStep = () => {
    if (currentStep < 4) {
      saveCurrentFormData();
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      saveCurrentFormData();
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            {/* First Name and Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  First Name *
                </label>
                <input
                  {...register('firstName')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Last Name *
                </label>
                <input
                  {...register('lastName')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email Address *
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Phone Number *
                </label>
                <input
                  {...register('phoneNumber')}
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter phone number"
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
                )}
              </div>
            </div>

            {/* Date of Birth and National ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Date of Birth *
                </label>
                <input
                  {...register('dateOfBirth')}
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {errors.dateOfBirth && (
                  <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="inline h-4 w-4 mr-1" />
                  National ID *
                </label>
                <input
                  {...register('nationalId')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter national ID"
                />
                {errors.nationalId && (
                  <p className="mt-1 text-sm text-red-600">{errors.nationalId.message}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Address *
              </label>
              <textarea
                {...register('address')}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter full address"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            {/* Company Name and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building className="inline h-4 w-4 mr-1" />
                  Company Name *
                </label>
                <input
                  {...register('companyName')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter company name"
                />
                {errors.companyName && (
                  <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Briefcase className="inline h-4 w-4 mr-1" />
                  Company Type *
                </label>
                <select
                  {...register('companyType')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Company Type</option>
                  {companyTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                {errors.companyType && (
                  <p className="mt-1 text-sm text-red-600">{errors.companyType.message}</p>
                )}
              </div>
            </div>

            {/* Registration and PAN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="inline h-4 w-4 mr-1" />
                  Registration Number *
                </label>
                <input
                  {...register('registrationNumber')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter registration number"
                />
                {errors.registrationNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.registrationNumber.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="inline h-4 w-4 mr-1" />
                  PAN Number *
                </label>
                <input
                  {...register('panNumber')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter PAN number"
                />
                {errors.panNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.panNumber.message}</p>
                )}
              </div>
            </div>

            {/* VAT and Established Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="inline h-4 w-4 mr-1" />
                  VAT Number
                </label>
                <input
                  {...register('vatNumber')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter VAT number (optional)"
                />
                {errors.vatNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.vatNumber.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Established Date *
                </label>
                <input
                  {...register('establishedDate')}
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {errors.establishedDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.establishedDate.message}</p>
                )}
              </div>
            </div>

            {/* Company Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Company Address *
              </label>
              <textarea
                {...register('companyAddress')}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter company address"
              />
              {errors.companyAddress && (
                <p className="mt-1 text-sm text-red-600">{errors.companyAddress.message}</p>
              )}
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="inline h-4 w-4 mr-1" />
                Website
              </label>
              <input
                {...register('website')}
                type="url"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://example.com (optional)"
              />
              {errors.website && (
                <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Brief description of the company (optional)"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                Upload Documents
              </label>
              <p className="text-sm text-gray-600 mb-4">
                Upload required documents such as citizenship certificate, company registration, PAN card, etc.
              </p>
              
              {/* File Upload Area */}
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Click to upload or drag and drop files here
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: PDF, JPG, PNG (Max 5MB each)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileUpload}
              />

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Username *
              </label>
              <input
                {...register('username')}
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter username"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            {/* Password Row - Only show in create mode */}
            {!editMode && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock className="inline h-4 w-4 mr-1" />
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-12"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock className="inline h-4 w-4 mr-1" />
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-12"
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
          </div>
        );

      default:
        return null;
    }
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
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 z-[60]"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ y: '100vh', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100vh', opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed top-[2%] left-1/2 transform -translate-x-1/2 w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-xl z-[70] max-h-[95vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editMode ? 'Edit Distributor' : 'Add New Distributor'}
                </h2>
                <p className="text-sm text-gray-600">
                  {editMode ? 'Update distributor information' : 'Fill in the details to add a new distributor'}
                </p>
                {!editMode && Object.keys(formData).length > 0 && (
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-xs text-blue-600 font-medium">Draft saved automatically</span>
                  </div>
                )}
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            {/* Steps Indicator */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = step.id === currentStep;
                  const isCompleted = step.id < currentStep;
                  
                  return (
                    <div key={step.id} className="flex items-center">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                        isActive 
                          ? 'border-indigo-600 bg-indigo-600 text-white' 
                          : isCompleted 
                            ? 'border-green-600 bg-green-600 text-white'
                            : 'border-gray-300 text-gray-400'
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className={`ml-2 text-sm font-medium ${
                        isActive ? 'text-indigo-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {step.title}
                      </span>
                      {index < steps.length - 1 && (
                        <div className={`mx-4 h-0.5 w-8 ${
                          isCompleted ? 'bg-green-600' : 'bg-gray-300'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                {renderStepContent()}
              </form>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <span className="text-sm text-gray-500">
                Step {currentStep} of {steps.length}
              </span>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                {!editMode && Object.keys(formData).length > 0 && (
                  <button
                    type="button"
                    onClick={handleDiscardDraft}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50"
                  >
                    Discard Draft
                  </button>
                )}

                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={handleSubmit(onSubmit)}
                    className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Building className="h-4 w-4 mr-2" />
                    )}
                    {isSubmitting 
                      ? (editMode ? 'Updating...' : 'Creating...') 
                      : (editMode ? 'Update Distributor' : 'Create Distributor')
                    }
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

export default CreateDistributorModal;

