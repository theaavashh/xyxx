'use client';

import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { FormWizard } from '@/components/form/FormWizard';
import { FormDataProvider } from '@/components/form/context/FormDataContext';
import { DistributorFormData, ApiApplicationData, ApplicationSubmissionResponse } from '@/types/application.types';

// Nepali date conversion utilities
const convertToNepaliDate = (englishDate: Date): string => {
  const nepaliMonths = [
    'बैशाख', 'जेष्ठ', 'आषाढ़', 'श्रावण', 'भाद्र', 'आश्विन',
    'कार्तिक', 'मार्ग', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'
  ];
  
  const nepaliDays = [
    'आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहिबार', 'शुक्रबार', 'शनिबार'
  ];
  
  const englishYear = englishDate.getFullYear();
  const nepaliYear = englishYear + 57;
  
  const month = englishDate.getMonth();
  const day = englishDate.getDate();
  const dayOfWeek = englishDate.getDay();
  
  return `${nepaliYear} ${nepaliMonths[month]} ${day}, ${nepaliDays[dayOfWeek]}`;
};

const getTodayNepaliDate = (): string => {
  return convertToNepaliDate(new Date());
};

// API service functions
const submitApplication = async (data: DistributorFormData): Promise<void> => {
  // Transform form data to match backend schema
  const applicationData: ApiApplicationData = {
    personalDetails: data.personalDetails,
    businessDetails: data.businessDetails,
    staffInfrastructure: data.staffInfrastructure,
    businessInformation: data.businessInformation,
    retailerRequirements: {
      preferredProducts: data.productsToDistribute?.map(p => p.name).join(', ') || '',
      monthlyOrderQuantity: data.productsToDistribute?.reduce((sum, p) => sum + parseInt(p.monthlySalesCapacity || '0'), 0).toString() || '0',
      paymentPreference: data.businessInformation.paymentPreference || 'नगद',
      creditDays: data.businessInformation.creditDays || 0,
      deliveryPreference: data.businessInformation.deliveryPreference || 'स्वयं उठाउने'
    },
    partnershipDetails: data.partnershipDetails || null,
    additionalInformation: data.additionalInformation,
    declaration: {
      declaration: data.agreementDetails.agreementAccepted === true,
      signature: data.agreementDetails.distributorSignatureName || data.personalDetails.fullName || '',
      date: data.agreementDetails.distributorSignatureDate || getTodayNepaliDate()
    },
    agreement: {
      agreementAccepted: data.agreementDetails.agreementAccepted === true,
      distributorSignatureName: data.agreementDetails.distributorSignatureName || data.personalDetails.fullName || '',
      distributorSignatureDate: data.agreementDetails.distributorSignatureDate || getTodayNepaliDate(),
      digitalSignature: null
    },
    currentTransactions: data.currentTransactions || [],
    productsToDistribute: data.productsToDistribute || [],
    areaCoverageDetails: data.areaCoverageDetails || []
  };

  // Handle file uploads
  const formData = new FormData();
  formData.append('data', JSON.stringify(applicationData));

  // Add files if they exist
  if (data.documentUpload.citizenshipFile) {
    const file = data.documentUpload.citizenshipFile instanceof FileList
      ? data.documentUpload.citizenshipFile[0]
      : data.documentUpload.citizenshipFile;
    if (file) formData.append('citizenshipId', file);
  }

  if (data.documentUpload.companyRegistrationFile) {
    const file = data.documentUpload.companyRegistrationFile instanceof FileList
      ? data.documentUpload.companyRegistrationFile[0]
      : data.documentUpload.companyRegistrationFile;
    if (file) formData.append('companyRegistration', file);
  }

  if (data.documentUpload.panVatFile) {
    const file = data.documentUpload.panVatFile instanceof FileList
      ? data.documentUpload.panVatFile[0]
      : data.documentUpload.panVatFile;
    if (file) formData.append('panVatRegistration', file);
  }

  if (data.documentUpload.officePhotoFile) {
    const file = data.documentUpload.officePhotoFile instanceof FileList
      ? data.documentUpload.officePhotoFile[0]
      : data.documentUpload.officePhotoFile;
    if (file) formData.append('officePhoto', file);
  }

  if (data.documentUpload.otherDocumentsFile) {
    const file = data.documentUpload.otherDocumentsFile instanceof FileList
      ? data.documentUpload.otherDocumentsFile[0]
      : data.documentUpload.otherDocumentsFile;
    if (file) formData.append('areaMap', file);
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4444/api'}/applications/submit`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || 'Submission failed');
  }

  const result = await response.json();
  console.log('Application submitted successfully:', result);
};

const saveDraftApplication = async (data: Partial<DistributorFormData>): Promise<string | null> => {
  // Transform data for draft submission
  const draftData = {
    personalDetails: data.personalDetails || {
      fullName: '',
      age: 18,
      gender: 'पुरुष',
      citizenshipNumber: '',
      issuedDistrict: '',
      mobileNumber: '',
      email: '',
      permanentAddress: '',
      temporaryAddress: ''
    },
    businessDetails: data.businessDetails || {
      companyName: '',
      registrationNumber: '',
      panVatNumber: '',
      officeAddress: '',
      operatingArea: '',
      desiredDistributorArea: '',
      currentBusiness: '',
      businessType: ''
    },
    staffInfrastructure: data.staffInfrastructure || {
      salesManCount: 0,
      salesManExperience: '',
      deliveryStaffCount: 0,
      deliveryStaffExperience: '',
      accountAssistantCount: 0,
      accountAssistantExperience: '',
      otherStaffCount: 0,
      otherStaffExperience: '',
      warehouseSpace: 0,
      warehouseDetails: '',
      truckCount: 0,
      truckDetails: '',
      fourWheelerCount: 0,
      fourWheelerDetails: '',
      twoWheelerCount: 0,
      twoWheelerDetails: '',
      cycleCount: 0,
      cycleDetails: '',
      thelaCount: 0,
      thelaDetails: ''
    },
    businessInformation: data.businessInformation || {
      productCategory: '',
      yearsInBusiness: 1,
      monthlySales: '0',
      storageFacility: ''
    },
    retailerRequirements: {
      preferredProducts: data.productsToDistribute?.map(p => p.name).join(', ') || '',
      monthlyOrderQuantity: data.productsToDistribute?.reduce((sum, p) => sum + parseInt(p.monthlySalesCapacity || '0'), 0).toString() || '0',
      paymentPreference: data.businessInformation?.paymentPreference || 'नगद',
      creditDays: data.businessInformation?.creditDays || 0,
      deliveryPreference: data.businessInformation?.deliveryPreference || 'स्वयं उठाउने'
    },
    partnershipDetails: data.partnershipDetails || null,
    additionalInformation: data.additionalInformation || {
      additionalInfo1: '',
      additionalInfo2: '',
      additionalInfo3: ''
    },
    declaration: {
      declaration: data.agreementDetails?.agreementAccepted === true,
      signature: data.agreementDetails?.distributorSignatureName || data.personalDetails?.fullName || '',
      date: data.agreementDetails?.distributorSignatureDate || getTodayNepaliDate()
    },
    agreement: {
      agreementAccepted: data.agreementDetails?.agreementAccepted === true,
      distributorSignatureName: data.agreementDetails?.distributorSignatureName || data.personalDetails?.fullName || '',
      distributorSignatureDate: data.agreementDetails?.distributorSignatureDate || getTodayNepaliDate(),
      digitalSignature: null
    },
    currentTransactions: data.currentTransactions || [],
    productsToDistribute: data.productsToDistribute || [],
    areaCoverageDetails: data.areaCoverageDetails || []
  };

  const formData = new FormData();
  formData.append('data', JSON.stringify(draftData));

  // Add files if they exist
  if (data.documentUpload?.citizenshipFile) {
    const file = data.documentUpload.citizenshipFile instanceof FileList
      ? data.documentUpload.citizenshipFile[0]
      : data.documentUpload.citizenshipFile;
    if (file) formData.append('citizenshipId', file);
  }

  if (data.documentUpload?.companyRegistrationFile) {
    const file = data.documentUpload.companyRegistrationFile instanceof FileList
      ? data.documentUpload.companyRegistrationFile[0]
      : data.documentUpload.companyRegistrationFile;
    if (file) formData.append('companyRegistration', file);
  }

  if (data.documentUpload?.panVatFile) {
    const file = data.documentUpload.panVatFile instanceof FileList
      ? data.documentUpload.panVatFile[0]
      : data.documentUpload.panVatFile;
    if (file) formData.append('panVatRegistration', file);
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4444/api'}/applications/draft`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || 'Draft save failed');
  }

  const result = await response.json();
  return result.data.referenceNumber;
};

const loadDraftApplication = async (referenceNumber: string): Promise<boolean> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4444/api'}/reference/${referenceNumber}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || 'Draft load failed');
  }

  const result = await response.json();
  
  if (result.data && result.data.application) {
    // Transform the loaded data to match our form structure
    const application = result.data.application;
    // This would need to be implemented to properly load the data into the form
    console.log('Draft application loaded:', application);
    return true;
  }
  
  return false;
};

export default function DistributorApplicationPage() {
  const [showReferenceInput, setShowReferenceInput] = useState(false);
  const [inputReferenceNumber, setInputReferenceNumber] = useState('');

  const handleFormSubmit = async (data: DistributorFormData) => {
    try {
      await submitApplication(data);
      toast.success('आवेदन सफलतापूर्वक पेश भयो! तपाईंलाई धन्यवाद।', {
        duration: 6000,
        style: {
          background: '#d1fae5',
          color: '#065f46',
          border: '1px solid #86efac',
        },
      });
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(`आवेदन पेश गर्न असफल भयो। त्रुटि: ${(error as Error).message}`, {
        duration: 6000,
        style: {
          background: '#fee2e2',
          color: '#dc2626',
          border: '1px solid #fecaca',
        },
      });
      throw error;
    }
  };

  const handleSaveDraft = async (data: Partial<DistributorFormData>) => {
    try {
      const referenceNumber = await saveDraftApplication(data);
      if (referenceNumber) {
        toast.success(`ड्राफ्ट सफलतापूर्वक सेभ भयो! सन्दर्भ नम्बर: ${referenceNumber}`, {
          duration: 8000,
          style: {
            background: '#d1fae5',
            color: '#065f46',
            border: '1px solid #86efac',
          },
        });
        return referenceNumber;
      }
    } catch (error) {
      console.error('Draft save error:', error);
      toast.error(`ड्राफ्ट सेभ गर्न असफल भयो। त्रुटि: ${(error as Error).message}`, {
        duration: 6000,
        style: {
          background: '#fee2e2',
          color: '#dc2626',
          border: '1px solid #fecaca',
        },
      });
    }
    return null;
  };

  const handleLoadDraft = async (referenceNumber: string) => {
    try {
      const success = await loadDraftApplication(referenceNumber);
      if (success) {
        toast.success('ड्राफ्ट डाटा सफलतापूर्वक लोड भयो!', {
          duration: 4000,
          style: {
            background: '#d1fae5',
            color: '#065f46',
            border: '1px solid #86efac',
          },
        });
        setShowReferenceInput(false);
        setInputReferenceNumber('');
        return true;
      } else {
        toast.error('सन्दर्भ नम्बर सँग मिल्ने डाटा भेटिएन।', {
          duration: 4000,
          style: {
            background: '#fee2e2',
            color: '#dc2626',
            border: '1px solid #fecaca',
          },
        });
      }
    } catch (error) {
      console.error('Draft load error:', error);
      toast.error(`ड्राफ्ट लोड गर्न असफल भयो। त्रुटि: ${(error as Error).message}`, {
        duration: 6000,
        style: {
          background: '#fee2e2',
          color: '#dc2626',
          border: '1px solid #fecaca',
        },
      });
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster />
      
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 absans">
            वितरक आवेदन पत्र
          </h1>
          <p className="text-lg text-gray-600 absans">
            Distributor Application Form
          </p>
        </div>

        {/* Reference Number Input */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="flex justify-center">
            <button
              onClick={() => setShowReferenceInput(!showReferenceInput)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm absans"
            >
              {showReferenceInput ? 'सन्दर्भ इनपुट लुकाउनुहोस्' : 'ड्राफ्ट लोड गर्नुहोस्'}
            </button>
          </div>
          
          {showReferenceInput && (
            <div className="mt-4 bg-white p-4 rounded-lg shadow border">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={inputReferenceNumber}
                  onChange={(e) => setInputReferenceNumber(e.target.value)}
                  placeholder="सन्दर्भ नम्बर प्रविष्ट गर्नुहोस्"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none"
                />
                <button
                  onClick={() => handleLoadDraft(inputReferenceNumber)}
                  disabled={!inputReferenceNumber.trim()}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  लोड गर्नुहोस्
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Form Wizard */}
        <FormDataProvider
          onSaveDraft={handleSaveDraft}
          onLoadDraft={handleLoadDraft}
        >
          <FormWizard
            onSubmit={handleFormSubmit}
            onSaveDraft={handleSaveDraft}
            onLoadDraft={handleLoadDraft}
          />
        </FormDataProvider>
      </div>
    </div>
  );
}