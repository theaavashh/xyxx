'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  Building2, 
  User, 
  MapPin, 
  CreditCard, 
  FileText, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { validateEmail, validatePhoneNumber, generateId } from '@/lib/utils';
import toast from 'react-hot-toast';

// Step schemas for validation
const step1Schema = yup.object({
  companyName: yup.string().required('Company name is required'),
  businessType: yup.string().required('Business type is required'),
  establishedYear: yup.number().min(1900).max(new Date().getFullYear()).required('Established year is required'),
  registrationNumber: yup.string().required('Registration number is required'),
  panNumber: yup.string().required('PAN number is required'),
  vatNumber: yup.string()
});

const step2Schema = yup.object({
  contactPersonName: yup.string().required('Contact person name is required'),
  contactPersonTitle: yup.string().required('Contact person title is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phoneNumber: yup.string().required('Phone number is required'),
  alternatePhone: yup.string(),
  website: yup.string().url('Invalid website URL')
});

const step3Schema = yup.object({
  address: yup.string().required('Address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State/Province is required'),
  postalCode: yup.string().required('Postal code is required'),
  country: yup.string().required('Country is required'),
  warehouseAddress: yup.string(),
  deliveryInstructions: yup.string()
});

const step4Schema = yup.object({
  bankName: yup.string().required('Bank name is required'),
  accountNumber: yup.string().required('Account number is required'),
  accountHolderName: yup.string().required('Account holder name is required'),
  swiftCode: yup.string(),
  branchName: yup.string().required('Branch name is required'),
  creditLimit: yup.number().min(0).required('Credit limit is required'),
  paymentTerms: yup.string().required('Payment terms are required')
});

const step5Schema = yup.object({
  businessLicense: yup.string(),
  taxCertificate: yup.string(),
  tradeLicense: yup.string(),
  otherDocuments: yup.string(),
  specialRequirements: yup.string(),
  notes: yup.string(),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required')
});

interface CreateDistributorForm {
  // Step 1: Company Information
  companyName: string;
  businessType: string;
  establishedYear: number;
  registrationNumber: string;
  panNumber: string;
  vatNumber?: string;
  
  // Step 2: Contact Information
  contactPersonName: string;
  contactPersonTitle: string;
  email: string;
  phoneNumber: string;
  alternatePhone?: string;
  website?: string;
  
  // Step 3: Address Information
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  warehouseAddress?: string;
  deliveryInstructions?: string;
  
  // Step 4: Financial Information
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  swiftCode?: string;
  branchName: string;
  creditLimit: number;
  paymentTerms: string;
  
  // Step 5: Documents & Account Setup
  businessLicense?: string;
  taxCertificate?: string;
  tradeLicense?: string;
  otherDocuments?: string;
  specialRequirements?: string;
  notes?: string;
  password: string;
  confirmPassword: string;
}

const steps = [
  {
    id: 1,
    title: 'Company Information',
    icon: Building2,
    description: 'Basic company details and registration information'
  },
  {
    id: 2,
    title: 'Contact Information',
    icon: User,
    description: 'Primary contact person and communication details'
  },
  {
    id: 3,
    title: 'Address Information',
    icon: MapPin,
    description: 'Business address and delivery information'
  },
  {
    id: 4,
    title: 'Financial Information',
    icon: CreditCard,
    description: 'Banking details and credit information'
  },
  {
    id: 5,
    title: 'Documents & Setup',
    icon: FileText,
    description: 'Document upload and account setup'
  }
];

export default function CreateDistributor() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getSchemaForStep = (step: number) => {
    switch (step) {
      case 1: return step1Schema;
      case 2: return step2Schema;
      case 3: return step3Schema;
      case 4: return step4Schema;
      case 5: return step5Schema;
      default: return step1Schema;
    }
  };

  const { register, handleSubmit, formState: { errors }, trigger, getValues, reset } = useForm<CreateDistributorForm>({
    resolver: yupResolver(getSchemaForStep(currentStep)),
    mode: 'onChange'
  });

  const nextStep = async () => {
    const isValid = await trigger();
    if (isValid && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: CreateDistributorForm) => {
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

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate distributor ID
      const distributorId = 'DIST' + Date.now();
      
      // In a real app, this would be sent to the backend
      const newDistributor = {
        ...data,
        id: generateId(),
        distributorId,
        status: 'pending_approval',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('New distributor created:', newDistributor);
      
      toast.success(`Distributor created successfully! ID: ${distributorId}`);
      reset();
      setCurrentStep(1);
      
    } catch (error) {
      toast.error('Failed to create distributor. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  {...register('companyName')}
                  type="text"
                  id="companyName"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="Enter company name"
                />
                {errors.companyName && (
                  <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type *
                </label>
                <select
                  {...register('businessType')}
                  id="businessType"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                >
                  <option value="">Select Business Type</option>
                  <option value="retail">Retail Store</option>
                  <option value="wholesale">Wholesale Distributor</option>
                  <option value="supermarket">Supermarket</option>
                  <option value="pharmacy">Pharmacy</option>
                  <option value="convenience">Convenience Store</option>
                  <option value="other">Other</option>
                </select>
                {errors.businessType && (
                  <p className="mt-1 text-sm text-red-600">{errors.businessType.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="establishedYear" className="block text-sm font-medium text-gray-700 mb-2">
                  Established Year *
                </label>
                <input
                  {...register('establishedYear')}
                  type="number"
                  id="establishedYear"
                  min="1900"
                  max={new Date().getFullYear()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="YYYY"
                />
                {errors.establishedYear && (
                  <p className="mt-1 text-sm text-red-600">{errors.establishedYear.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Registration Number *
                </label>
                <input
                  {...register('registrationNumber')}
                  type="text"
                  id="registrationNumber"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="Enter registration number"
                />
                {errors.registrationNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.registrationNumber.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  PAN Number *
                </label>
                <input
                  {...register('panNumber')}
                  type="text"
                  id="panNumber"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="123456789"
                />
                {errors.panNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.panNumber.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="vatNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  VAT Number
                </label>
                <input
                  {...register('vatNumber')}
                  type="text"
                  id="vatNumber"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="VAT number (if applicable)"
                />
                {errors.vatNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.vatNumber.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contactPersonName" className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person Name *
                </label>
                <input
                  {...register('contactPersonName')}
                  type="text"
                  id="contactPersonName"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="Enter contact person name"
                />
                {errors.contactPersonName && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactPersonName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="contactPersonTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person Title *
                </label>
                <input
                  {...register('contactPersonTitle')}
                  type="text"
                  id="contactPersonTitle"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="e.g., Owner, Manager, Director"
                />
                {errors.contactPersonTitle && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactPersonTitle.message}</p>
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

              <div>
                <label htmlFor="alternatePhone" className="block text-sm font-medium text-gray-700 mb-2">
                  Alternate Phone Number
                </label>
                <input
                  {...register('alternatePhone')}
                  type="text"
                  id="alternatePhone"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="Alternate phone (optional)"
                />
                {errors.alternatePhone && (
                  <p className="mt-1 text-sm text-red-600">{errors.alternatePhone.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  {...register('website')}
                  type="url"
                  id="website"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="https://www.example.com"
                />
                {errors.website && (
                  <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Address *
                </label>
                <textarea
                  {...register('address')}
                  id="address"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="Enter complete business address"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  {...register('city')}
                  type="text"
                  id="city"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="Enter city"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                  State/Province *
                </label>
                <input
                  {...register('state')}
                  type="text"
                  id="state"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="Enter state or province"
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code *
                </label>
                <input
                  {...register('postalCode')}
                  type="text"
                  id="postalCode"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="Enter postal code"
                />
                {errors.postalCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <select
                  {...register('country')}
                  id="country"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                >
                  <option value="">Select Country</option>
                  <option value="Nepal">Nepal</option>
                  <option value="India">India</option>
                  <option value="Bangladesh">Bangladesh</option>
                  <option value="Other">Other</option>
                </select>
                {errors.country && (
                  <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="warehouseAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  Warehouse Address (if different)
                </label>
                <textarea
                  {...register('warehouseAddress')}
                  id="warehouseAddress"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="Enter warehouse address if different from business address"
                />
                {errors.warehouseAddress && (
                  <p className="mt-1 text-sm text-red-600">{errors.warehouseAddress.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="deliveryInstructions" className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Instructions
                </label>
                <textarea
                  {...register('deliveryInstructions')}
                  id="deliveryInstructions"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="Any special delivery instructions or access information"
                />
                {errors.deliveryInstructions && (
                  <p className="mt-1 text-sm text-red-600">{errors.deliveryInstructions.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name *
                </label>
                <input
                  {...register('bankName')}
                  type="text"
                  id="bankName"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="Enter bank name"
                />
                {errors.bankName && (
                  <p className="mt-1 text-sm text-red-600">{errors.bankName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="branchName" className="block text-sm font-medium text-gray-700 mb-2">
                  Branch Name *
                </label>
                <input
                  {...register('branchName')}
                  type="text"
                  id="branchName"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="Enter branch name"
                />
                {errors.branchName && (
                  <p className="mt-1 text-sm text-red-600">{errors.branchName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number *
                </label>
                <input
                  {...register('accountNumber')}
                  type="text"
                  id="accountNumber"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="Enter account number"
                />
                {errors.accountNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.accountNumber.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="accountHolderName" className="block text-sm font-medium text-gray-700 mb-2">
                  Account Holder Name *
                </label>
                <input
                  {...register('accountHolderName')}
                  type="text"
                  id="accountHolderName"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="Enter account holder name"
                />
                {errors.accountHolderName && (
                  <p className="mt-1 text-sm text-red-600">{errors.accountHolderName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="swiftCode" className="block text-sm font-medium text-gray-700 mb-2">
                  SWIFT Code
                </label>
                <input
                  {...register('swiftCode')}
                  type="text"
                  id="swiftCode"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="Enter SWIFT code (if applicable)"
                />
                {errors.swiftCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.swiftCode.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="creditLimit" className="block text-sm font-medium text-gray-700 mb-2">
                  Credit Limit (NPR) *
                </label>
                <input
                  {...register('creditLimit')}
                  type="number"
                  id="creditLimit"
                  min="0"
                  step="1000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="Enter credit limit"
                />
                {errors.creditLimit && (
                  <p className="mt-1 text-sm text-red-600">{errors.creditLimit.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="paymentTerms" className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Terms *
                </label>
                <select
                  {...register('paymentTerms')}
                  id="paymentTerms"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                >
                  <option value="">Select Payment Terms</option>
                  <option value="cash_on_delivery">Cash on Delivery (COD)</option>
                  <option value="net_15">Net 15 Days</option>
                  <option value="net_30">Net 30 Days</option>
                  <option value="net_45">Net 45 Days</option>
                  <option value="net_60">Net 60 Days</option>
                  <option value="advance_payment">Advance Payment</option>
                  <option value="custom">Custom Terms</option>
                </select>
                {errors.paymentTerms && (
                  <p className="mt-1 text-sm text-red-600">{errors.paymentTerms.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="businessLicense" className="block text-sm font-medium text-gray-700 mb-2">
                  Business License Number
                </label>
                <input
                  {...register('businessLicense')}
                  type="text"
                  id="businessLicense"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="Enter business license number"
                />
                {errors.businessLicense && (
                  <p className="mt-1 text-sm text-red-600">{errors.businessLicense.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="taxCertificate" className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Certificate Number
                </label>
                <input
                  {...register('taxCertificate')}
                  type="text"
                  id="taxCertificate"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="Enter tax certificate number"
                />
                {errors.taxCertificate && (
                  <p className="mt-1 text-sm text-red-600">{errors.taxCertificate.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="tradeLicense" className="block text-sm font-medium text-gray-700 mb-2">
                  Trade License Number
                </label>
                <input
                  {...register('tradeLicense')}
                  type="text"
                  id="tradeLicense"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="Enter trade license number"
                />
                {errors.tradeLicense && (
                  <p className="mt-1 text-sm text-red-600">{errors.tradeLicense.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="otherDocuments" className="block text-sm font-medium text-gray-700 mb-2">
                  Other Documents
                </label>
                <input
                  {...register('otherDocuments')}
                  type="text"
                  id="otherDocuments"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="List any other relevant documents"
                />
                {errors.otherDocuments && (
                  <p className="mt-1 text-sm text-red-600">{errors.otherDocuments.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="specialRequirements" className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requirements
                </label>
                <textarea
                  {...register('specialRequirements')}
                  id="specialRequirements"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="Any special product requirements, handling instructions, etc."
                />
                {errors.specialRequirements && (
                  <p className="mt-1 text-sm text-red-600">{errors.specialRequirements.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  {...register('notes')}
                  id="notes"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black font-medium"
                  placeholder="Any additional information or notes"
                />
                {errors.notes && (
                  <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
                )}
              </div>

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
                    placeholder="Enter password for distributor login"
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
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Distributor</h1>
          <p className="text-gray-600 mt-1">Register a new distributor in the system</p>
        </div>
        <div className="flex items-center space-x-2">
          <Building2 className="h-6 w-6 text-indigo-600" />
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                    ${isActive 
                      ? 'bg-indigo-600 border-indigo-600 text-white' 
                      : isCompleted 
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'border-gray-300 text-gray-400'
                    }
                  `}>
                    {isCompleted ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${isActive ? 'text-indigo-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 hidden lg:block">
                      {step.description}
                    </p>
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`w-20 h-1 ml-6 ${isCompleted ? 'bg-green-200' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Step {currentStep}: {steps[currentStep - 1].title}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {steps[currentStep - 1].description}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 border-t border-gray-200 mt-8">
            <button
              type="button"
              onClick={previousStep}
              disabled={currentStep === 1}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Previous
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
              >
                Next
                <ChevronRight className="h-5 w-5 ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Save className="h-5 w-5 mr-2" />
                )}
                {isSubmitting ? 'Creating Distributor...' : 'Create Distributor'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}








































