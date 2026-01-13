'use client';

import { useState } from 'react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showReferenceInput, setShowReferenceInput] = useState(false);

  const { control, handleSubmit, trigger, formState: { errors }, watch, reset, setValue } = useForm<FormData>({
    resolver: yupResolver(formValidationSchema) as any,
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
        fieldsToValidate = ['selectedStaffType', 'staffQuantity', 'selectedInfrastructureType', 'infrastructureQuantity'];
        break;
      case 5:
        fieldsToValidate = ['businessType', 'currentTransactions', 'turnover', 'businessExperience'];
        break;
      case 6:
        // Only validate partnership fields if business structure is partnership
        const businessStructure = watch('businessStructure');
        if (businessStructure === 'partnership') {
          fieldsToValidate = ['partnerFullName', 'partnerAge', 'partnerGender', 'partnerCitizenshipNumber', 'partnerIssuedDistrict', 'partnerMobileNumber', 'productCategory', 'businessExperience', 'monthlyIncome', 'storageFacility'];
        } else {
          fieldsToValidate = ['productCategory', 'businessExperience', 'monthlyIncome', 'storageFacility'];
        }
        break;
      case 7:
        fieldsToValidate = ['paymentPreference', 'deliveryPreference'];
        break;
      case 8:
        // Terms & Conditions step - validate agreement acceptance
        fieldsToValidate = ['agreementAccepted'];
        break;
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

  const saveDraft = async () => {
    try {
      const currentFormData = watch();
      
      // Structure data for draft save
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

      // Save draft to API
      const response = await apiService.saveDraft(draftData, {
        // Include any uploaded files here
        panDocument: currentFormData.panDocument || null,
        registrationDocument: currentFormData.registrationDocument || null,
        citizenshipFile: currentFormData.citizenshipFile || null,
        companyRegistrationFile: currentFormData.companyRegistrationFile || null,
        panVatFile: currentFormData.panVatFile || null,
        officePhotoFile: currentFormData.officePhotoFile || null,
        otherDocumentsFile: currentFormData.otherDocumentsFile || null,
      });

      if (response.ok) {
        toast.success('ड्राफ्ट सफलतापूर्वक सेभ भयो!');
      } else {
        toast.error('ड्राफ्ट सेभ गर्न असफल भयो।');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('ड्राफ्ट सेभ गर्न असफल भयो। नेटवर्क त्रुटि');
    }
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      const currentFormData = watch();
      
      // Structure data for backend
      const applicationData = {
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

      // Submit to API using service
      const response = await apiService.submitApplication(applicationData, {
        // Include any uploaded files here
        citizenshipFile: currentFormData.citizenshipFile || null,
        companyRegistrationFile: currentFormData.companyRegistrationFile || null,
        panVatFile: currentFormData.panVatFile || null,
        officePhotoFile: currentFormData.officePhotoFile || null,
        otherDocumentsFile: currentFormData.otherDocumentsFile || null,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Application submitted successfully:', result);
        setIsSubmitted(true);
        toast.success('आवेदन सफलतापूर्वक पेश भयो!');
      } else {
        toast.error('आवेदन पेश गर्न असफल भयो।');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('आवेदन पेश गर्न असफल भयो। नेटवर्क त्रुटि');
    } finally {
      setIsSubmitting(false);
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
        return <StaffInfrastructureStep control={control} errors={errors} />;
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
              <h1 className="text-xl font-bold text-[#001011] absans">वितरक आवेदन फारम</h1>
            </div>
             <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={saveDraft}
                className="text-sm text-gray-600 hover:text-[#FF6B35] absans"
              >
                ड्राफ्ट सेभ गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      </header>

    
     

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)}>
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
              className={`px-6 py-3 rounded-lg font-medium absans ${
                currentStep === 1
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