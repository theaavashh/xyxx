'use client';

import { useMutation } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast, { Toaster } from 'react-hot-toast';
import Image from 'next/image';

// Import existing context and utilities
import { FormDataProvider } from '@/contexts/DistributorFormContext';
import { FormData } from '@/types/formTypes';
import {
  formSteps,
  getTodayNepaliDate
} from '@/constants/form.constants';
import { formValidationSchema } from '@/validation/form.schema';
import { apiService } from '@/services/api.service';
import { BusinessTypeStep } from '@/components/steps/BusinessTypeStep';
import { PersonalDetailsStep } from '@/components/steps/PersonalDetailsStep';
import { BusinessDetailsStep } from '@/components/steps/BusinessDetailsStep';
import { StaffInfrastructureStep } from '@/components/steps/StaffInfrastructureStep';
import { ProductsPartnershipStep } from '../components/steps/ProductsPartnershipStep';
import { ProductsPartnershipStepNew } from '../components/steps/ProductsPartnershipStepNew';
import { DocumentUploadStepNew } from '../components/steps/DocumentUploadStepNew';
import { AdditionalInfoStep } from '@/components/steps/AdditionalInfoStep';
import { TermsConditionsStep } from '@/components/steps/TermsConditionsStep';
import { ReviewSubmitStep } from '@/components/steps/ReviewSubmitStep';

// Main Form Component
function DistributorFormContent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showReferenceInput, setShowReferenceInput] = useState(false);

  const { control, handleSubmit, trigger, formState: { errors }, watch, reset, setValue } = useForm<FormData>({
    resolver: yupResolver(formValidationSchema) as any, // Type cast to handle validation schema mismatch
    mode: 'onChange',
    defaultValues: {
      businessStructure: undefined,
      contactNumber: '',
      fullName: '',
      age: '',
      gender: '',
      citizenshipNumber: '',
      issuedDistrict: '',
      email: '',
      permanentAddress: '',
      temporaryAddress: '',
      companyName: '',
      registrationNumber: '',
      panVatNumber: '',
      officeAddress: '',
      workAreaProvince: '',
      workAreaDistrict: '',
      workArea: '',
      desiredDistributionArea: '',
      businessType: '',
      currentTransactions: [],
      turnover: '',
      businessExperience: '',
      selectedStaffType: '',
      staffQuantity: undefined,
      selectedInfrastructureType: '',
      infrastructureQuantity: undefined,
      agreementAccepted: false,
    }
  });




  const nextStep = async () => {
    // Validate current step
    let fieldsToValidate: string[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = ['businessStructure', 'contactNumber'];
        break;
      case 2:
        fieldsToValidate = ['fullName', 'age', 'gender', 'citizenshipNumber', 'issuedDistrict', 'citizenshipFrontFile', 'citizenshipBackFile'];
        break;
      case 3:
        fieldsToValidate = ['companyName', 'registrationNumber', 'panVatNumber', 'officeAddress', 'workAreaProvince', 'workAreaDistrict', 'workArea', 'desiredDistributionArea', 'panDocument', 'registrationDocument'];
        break;
      case 4:
        fieldsToValidate = [];
        break;
      case 5:
        fieldsToValidate = ['currentTransactions'];
        break;
      case 6:
        // Validate partnership fields if business structure is partnership
        const businessStructure = watch('businessStructure');
        if (businessStructure === 'partnership') {
          fieldsToValidate = ['partnerFullName', 'partnerAge', 'partnerGender', 'partnerCitizenshipNumber', 'partnerIssuedDistrict', 'partnerMobileNumber'];
        } else {
          fieldsToValidate = [];
        }
        break;
      case 7:
        fieldsToValidate = ['paymentPreference', 'deliveryPreference'];
        break;
      case 8:
        // Terms & Conditions step - validate agreement acceptance
        fieldsToValidate = ['agreementAccepted'];
        break;
      case 9: {
        // Review step - validate ALL required fields before submission
        fieldsToValidate = [
          'businessStructure', 'contactNumber',
          'fullName', 'age', 'gender', 'citizenshipNumber', 'issuedDistrict',
          'citizenshipFrontFile', 'citizenshipBackFile',
          'companyName', 'registrationNumber', 'panVatNumber',
          'officeAddress', 'workAreaProvince', 'workAreaDistrict', 'workArea',
          'desiredDistributionArea', 'panDocument', 'registrationDocument',
          'currentTransactions',
          'agreementAccepted'
        ];
        
        // If partnership, also validate partner fields
        const businessStructure = watch('businessStructure');
        if (businessStructure === 'partnership') {
          fieldsToValidate.push(
            'partnerFullName', 'partnerAge', 'partnerGender', 
            'partnerCitizenshipNumber', 'partnerIssuedDistrict', 'partnerMobileNumber'
          );
        }
        break;
      }
      // Add validation for other steps as they are implemented
      default:
        fieldsToValidate = [];
    }

    if (fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate as any);

      if (!isValid) {
        toast.error(`कृपया आवश्यक फिल्डहरू भर्नुहोस्।`, {
          duration: 5000,
          style: {
            background: '#fee2e2',
            color: '#dc2626',
            border: '1px solid #fecaca',
          },
        });
        return;
      }
    }

    if (currentStep < formSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const { mutate: mutateSaveDraft, isPending: isSavingDraft } = useMutation({
    mutationFn: async () => {
      const currentFormData = watch();

      const draftData = {
        personalDetails: {
          fullName: currentFormData.fullName || '',
          age: currentFormData.age || '',
          gender: currentFormData.gender || 'पुरुष',
          citizenshipNumber: currentFormData.citizenshipNumber || '',
          issuedDistrict: currentFormData.issuedDistrict || '',
          email: currentFormData.email || '',
          mobileNumber: currentFormData.contactNumber || '',
        },
        businessDetails: {
          businessStructure: currentFormData.businessStructure || '',
          companyName: currentFormData.companyName || '',
          registrationNumber: currentFormData.registrationNumber || '',
          panVatNumber: currentFormData.panVatNumber || '',
          officeAddress: currentFormData.officeAddress || '',
          workAreaProvince: currentFormData.workAreaProvince || '',
          workAreaDistrict: currentFormData.workAreaDistrict || '',
          workArea: currentFormData.workArea || '',
          desiredDistributorArea: currentFormData.desiredDistributionArea || '',
        },
        agreement: {
          agreementAccepted: currentFormData.agreementAccepted === true,
          distributorSignatureName: currentFormData.fullName || '',
          distributorSignatureDate: getTodayNepaliDate(),
        }
      };

      const response = await apiService.saveDraft(draftData, {
        panDocument: currentFormData.panDocument || null,
        registrationDocument: currentFormData.registrationDocument || null,
        citizenshipFrontFile: currentFormData.citizenshipFrontFile || null,
        citizenshipBackFile: currentFormData.citizenshipBackFile || null,
        officePhotoFile: currentFormData.officePhotoFile || null,
        otherDocumentsFile: currentFormData.otherDocumentsFile || null,
      });

      if (!response.ok) {
        throw new Error('Draft save failed');
      }
      return response;
    },
    onSuccess: () => {
      toast.success('ड्राफ्ट सफलतापूर्वक सेभ भयो!');
    },
    onError: (error) => {
      toast.error('ड्राफ्ट सेभ गर्न असफल भयो।');
    }
  });

  const saveDraft = () => {
    mutateSaveDraft();
  };

  const { mutate: mutateSubmitApplication, isPending: isSubmitting } = useMutation({
    mutationFn: async (data: FormData) => {
      const currentFormData = watch();
      
      // Debug: Log what's being sent
      console.log('Submitting raw form data:', currentFormData);
      console.log('Files:', {
        citizenshipFrontFile: currentFormData.citizenshipFrontFile ? 'Present' : 'Missing',
        citizenshipBackFile: currentFormData.citizenshipBackFile ? 'Present' : 'Missing',
        panDocument: currentFormData.panDocument ? 'Present' : 'Missing',
        registrationDocument: currentFormData.registrationDocument ? 'Present' : 'Missing',
      });

      // submitApplication will handle the transformation
      const response = await apiService.submitApplication(currentFormData, {
        citizenshipFrontFile: currentFormData.citizenshipFrontFile || null,
        citizenshipBackFile: currentFormData.citizenshipBackFile || null,
        panDocument: currentFormData.panDocument || null,
        registrationDocument: currentFormData.registrationDocument || null,
        officePhotoFile: currentFormData.officePhotoFile || null,
        otherDocumentsFile: currentFormData.otherDocumentsFile || null,
      });

      if (!response.ok) {
        let errorMessage = 'आवेदन पेश गर्न असफल भयो।';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      return await response.json();
    },
    onSuccess: (result) => {
      setIsSubmitted(true);
      toast.success('आवेदन सफलतापूर्वक पेश भयो!');
    },
    onError: (error: any) => {
      // Show the actual error message from server
      const errorMessage = error?.message || error?.response?.data?.message || 'आवेदन पेश गर्न असफल भयो।';
      toast.error(errorMessage, {
        duration: 6000,
        style: {
          background: '#fee2e2',
          color: '#dc2626',
          border: '1px solid #fecaca',
          maxWidth: '500px',
          wordWrap: 'break-word'
        },
      });
    }
  });

  const onSubmit = (data: FormData) => {
    console.log('Form data being submitted:', data);
    console.log('Full Name:', data.fullName);
    console.log('Age:', data.age);
    console.log('Gender:', data.gender);
    mutateSubmitApplication(data);
  };

  const onError = (errors: any) => {
    // Get all error field names
    const errorFields = Object.keys(errors);
    
    // Log errors for debugging
    console.log('Validation errors:', errors);
    console.log('Error fields:', errorFields);
    
    if (errorFields.length === 0) {
      toast.error('कृपया सबै आवश्यक फिल्डहरू भर्नुहोस्।');
      return;
    }
    
    // Show specific field errors with their messages
    const errorMessages = errorFields.map(field => {
      const error = errors[field];
      return error?.message || field;
    }).filter(Boolean);
    
    // Show first few errors
    const displayMessage = errorMessages.slice(0, 3).join(', ');
    const remainingCount = errorMessages.length - 3;
    
    if (remainingCount > 0) {
      toast.error(`${displayMessage} र अन्य ${remainingCount} ओटा फिल्डमा समस्या छ`, {
        duration: 6000,
      });
    } else {
      toast.error(`कृपया यी फिल्डहरू सच्याउनुहोस्: ${displayMessage}`, {
        duration: 5000,
      });
    }
  };

  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <BusinessTypeStep control={control} errors={errors} />;
      case 2:
        return <PersonalDetailsStep control={control} errors={errors} setValue={setValue} watch={watch} />;
      case 3:
        return <BusinessDetailsStep control={control} errors={errors} watch={watch} setValue={setValue} />;
      case 4:
        return <StaffInfrastructureStep control={control} errors={errors} setValue={setValue} watch={watch} />;
      case 5:
        return <ProductsPartnershipStepNew control={control} errors={errors} watch={watch} setValue={setValue} />;
      case 6:
        return <ProductsPartnershipStep control={control} errors={errors} watch={watch} />;
      case 7:
        return <AdditionalInfoStep control={control} errors={errors} />;
      case 8:
        return <TermsConditionsStep control={control} errors={errors} />;
      case 9:
        return <ReviewSubmitStep control={control} errors={errors} watch={watch} />;
      default:
        return <div>Step {currentStep} content to be implemented</div>;
    }
  };

  // If form is submitted, show success message
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fff8f4] to-[#f0f4f8] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#001011] mb-4 absans">आवेदन सफलतापूर्वक पेश भयो!</h2>
          <p className="text-gray-600 absans mb-6">
            तपाईंको वितरक आवेदन हामीले प्राप्त गरेका छौं। हामी यसको समीक्षा गर्नेछौं र छिट्टै तपाईंसँग सम्पर्कमा आउनेछौं।
          </p>
          <button
            onClick={() => {
              setIsSubmitted(false);
              setCurrentStep(1);
              reset();
            }}
            className="w-full bg-[#FF6B35] text-white py-3 rounded-lg hover:bg-[#FF8A5B] transition-colors absans"
          >
            नयाँ आवेदन गर्नुहोस्
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff8f4] to-[#f0f4f8]">
      <Toaster />

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image
                src="/zipzip_logo.svg"
                alt="ZipZip Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <h1 className="text-xl font-bold text-[#001011] absans text-center">वितरक आवेदन फारम</h1>
            </div>
            
          </div>
        </div>
      </header>




      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={(e) => {
          handleSubmit(onSubmit, onError)(e);
        }}>
          {/* Form Content */}
          <div className="py-8 mb-6">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium absans ${currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              पछिल्लो (Previous)
            </button>

            <div className="flex space-x-4">
              {currentStep < formSteps.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF8A5B] font-medium absans"
                >
                  पछिल्लो (Next)
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium absans disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'पेश हुँदैछ...' : 'आवेदन पेश गर्नुहोस्'}
                </button>
              )}
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}



// Main export with existing context
export default function DistributorForm() {
  return (
    <FormDataProvider>
      <DistributorFormContent />
    </FormDataProvider>
  );
}