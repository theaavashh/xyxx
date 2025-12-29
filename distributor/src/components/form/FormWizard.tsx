'use client';

import React, { useState, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { DistributorFormData } from '@/types/application.types';
import { PersonalDetailsStep } from './steps/PersonalDetailsStep';
import { BusinessDetailsStep } from './steps/BusinessDetailsStep';
import { StepNavigation } from './shared/StepNavigation';
import { FormDataContext, FormDataProvider } from './context/FormDataContext';

// Form validation schema
const createValidationSchema = () => {
  return yup.object().shape({
    personalDetails: yup.object().shape({
      fullName: yup.string()
        .required('पूरा नाम आवश्यक छ')
        .matches(/^[a-zA-Z\s\u0900-\u097F]+$/, 'नाममा संख्या हुनु हुँदैन'),
      age: yup.number()
        .typeError('उमेर संख्या हुनुपर्छ')
        .required('उमेर आवश्यक छ')
        .min(18, 'कम्तिमा १८ वर्ष हुनुपर्छ')
        .max(80, 'अधिकतम ८० वर्ष हुनुपर्छ')
        .integer('उमेर पूर्ण संख्या हुनुपर्छ'),
      gender: yup.string().required('लिङ्ग आवश्यक छ'),
      citizenshipNumber: yup.string()
        .required('नागरिकता नम्बर आवश्यक छ')
        .matches(/^[0-9\-\/]+$/, 'नागरिकता नम्बरमा केवल अंक, - र / हुनुपर्छ'),
      issuedDistrict: yup.string().required('जारी जिल्ला आवश्यक छ'),
      mobileNumber: yup.string()
        .required('मोबाइल नम्बर आवश्यक छ')
        .matches(/^[0-9]+$/, 'मोबाइल नम्बरमा केवल अंकहरू हुनुपर्छ')
        .length(10, 'मोबाइल नम्बर ठ्याक्कै १० अंकको हुनुपर्छ')
        .matches(/^9/, 'मोबाइल नम्बर ९ ले सुरु हुनुपर्छ'),
      email: yup.string().email('मान्य इमेल चाहिन्छ').required('इमेल ठेगाना आवश्यक छ'),
      permanentAddress: yup.string().required('स्थायी ठेगाना आवश्यक छ'),
      temporaryAddress: yup.string().optional()
    }),
    
    businessDetails: yup.object().shape({
      companyName: yup.string()
        .required('कम्पनीको नाम आवश्यक छ')
        .matches(/^[a-zA-Z\s\u0900-\u097F]+$/, 'कम्पनीको नाममा केवल अक्षरहरू हुनुपर्छ'),
      registrationNumber: yup.string()
        .required('दर्ता नम्बर आवश्यक छ')
        .matches(/^[0-9\-\/]+$/, 'दर्ता नम्बरमा केवल अंक, - र / हुनुपर्छ'),
      panVatNumber: yup.string()
        .required('PAN/VAT नम्बर आवश्यक छ')
        .matches(/^[0-9\-\/]+$/, 'PAN/VAT नम्बरमा केवल अंक, - र / हुनुपर्छ'),
      officeAddress: yup.string()
        .required('कार्यालयको ठेगाना आवश्यक छ')
        .matches(/^[a-zA-Z\u0900-\u097F]/, 'कार्यालयको ठेगाना अक्षरले सुरु हुनुपर्छ'),
      workAreaDistrict: yup.string().required('काम गर्ने क्षेत्र/जिल्ला आवश्यक छ'),
      desiredDistributionArea: yup.string()
        .required('वितरक बन्न चाहने क्षेत्र आवश्यक छ')
        .matches(/^[a-zA-Z\u0900-\u097F]/, 'वितरक बन्न चाहने क्षेत्र अक्षरले सुरु हुनुपर्छ'),
      currentBusiness: yup.string().optional(),
      businessType: yup.string().optional()
    }),
    
    // Add validation for other steps as needed
    staffInfrastructure: yup.object().shape({
      salesManCount: yup.number().optional(),
      salesManExperience: yup.string().optional(),
      driverCount: yup.number().optional(),
      driverExperience: yup.string().optional(),
      helperCount: yup.number().optional(),
      helperExperience: yup.string().optional(),
      accountantCount: yup.number().optional(),
      accountantExperience: yup.string().optional(),
      storageSpace: yup.number().optional(),
      storageDetails: yup.string().optional(),
      truckCount: yup.number().optional(),
      truckExperience: yup.string().optional(),
      truckDetails: yup.string().optional(),
      fourWheelerCount: yup.number().optional(),
      fourWheelerExperience: yup.string().optional(),
      fourWheelerDetails: yup.string().optional(),
      motorcycleCount: yup.number().optional(),
      motorcycleExperience: yup.string().optional(),
      twoWheelerDetails: yup.string().optional(),
      cycleCount: yup.number().optional(),
      cycleExperience: yup.string().optional(),
      cycleDetails: yup.string().optional(),
      thelaCount: yup.number().optional(),
      thelaExperience: yup.string().optional(),
      thelaDetails: yup.string().optional()
    }),
    
    businessInformation: yup.object().shape({
      productCategory: yup.string().optional(),
      businessExperience: yup.string().optional(),
      monthlyIncome: yup.string().optional(),
      storageFacility: yup.string().optional(),
      paymentPreference: yup.string().optional(),
      creditDays: yup.number().optional(),
      deliveryPreference: yup.string().optional()
    }),
    
    partnershipDetails: yup.object().shape({
      partnerFullName: yup.string().optional(),
      partnerAge: yup.number().optional(),
      partnerGender: yup.string().optional(),
      partnerCitizenshipNumber: yup.string().optional(),
      partnerIssuedDistrict: yup.string().optional(),
      partnerMobileNumber: yup.string().optional(),
      partnerEmail: yup.string().email().optional(),
      partnerPermanentAddress: yup.string().optional(),
      partnerTemporaryAddress: yup.string().optional()
    }).optional(),
    
    additionalInformation: yup.object().shape({
      additionalInfo: yup.string().optional(),
      additionalInfo2: yup.string().optional(),
      additionalInfo3: yup.string().optional()
    }),
    
    documentUpload: yup.object().shape({
      citizenshipCertificate: yup.boolean().required(),
      citizenshipFile: yup.mixed().required("नागरिकता प्रमाणपत्र आवश्यक छ"),
      companyRegistration: yup.boolean().required(),
      companyRegistrationFile: yup.mixed().required("कम्पनी दर्ता प्रमाणपत्र आवश्यक छ"),
      panVat: yup.boolean().required(),
      panVatFile: yup.mixed().required("PAN/VAT प्रमाणपत्र आवश्यक छ"),
      officePhoto: yup.boolean().optional(),
      officePhotoFile: yup.mixed().optional(),
      otherDocuments: yup.boolean().optional(),
      otherDocumentsFile: yup.mixed().optional()
    }),
    
    agreementDetails: yup.object().shape({
      agreementAccepted: yup.boolean().oneOf([true], "सहमति स्वीकार गर्नुहोस्"),
      distributorSignatureName: yup.string().optional(),
      distributorSignatureDate: yup.string().optional(),
      termsAndConditions: yup.string().optional()
    }),
    
    currentTransactions: yup.array().of(
      yup.object().shape({
        company: yup.string().required('कम्पनी आवश्यक छ'),
        products: yup.string().required('उत्पादनहरू आवश्यक छ'),
        turnover: yup.string().required('टर्नओभर आवश्यक छ')
      })
    ).optional(),
    
    productsToDistribute: yup.array().of(
      yup.object().shape({
        name: yup.string().required('उत्पादन नाम आवश्यक छ'),
        category: yup.string().required('श्रेणी आवश्यक छ'),
        monthlySalesCapacity: yup.string().required('मासिक बिक्री क्षमता आवश्यक छ')
      })
    ).optional(),
    
    areaCoverageDetails: yup.array().of(
      yup.object().shape({
        areaDescription: yup.string().required('क्षेत्र विवरण आवश्यक छ'),
        populationEstimate: yup.string().required('जनसङ्ख्या अनुमान आवश्यक छ'),
        competitorCompany: yup.string().required('प्रतिस्पर्धी कम्पनी आवश्यक छ')
      })
    ).optional()
  });
};

// Form steps configuration
const formSteps = [
  { id: 1, title: 'व्यक्तिगत विवरण', subtitle: 'Personal Details' },
  { id: 2, title: 'व्यापारिक विवरण', subtitle: 'Business Details' },
  { id: 3, title: 'कर्मचारी र पूर्वाधार', subtitle: 'Staff & Infrastructure' },
  { id: 4, title: 'उत्पादन र साझेदारी', subtitle: 'Products & Partnership' },
  { id: 5, title: 'प्रमाणपत्र संलग्न', subtitle: 'Document Upload' },
  { id: 6, title: 'अतिरिक्त जानकारी', subtitle: 'Additional Information' },
  { id: 7, title: 'नियम र सहमति', subtitle: 'Terms & Agreement' },
  { id: 8, title: 'समीक्षा', subtitle: 'Review' },
];

// Default form values
const getDefaultFormValues = (): Partial<DistributorFormData> => ({
  personalDetails: {
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
  businessDetails: {
    companyName: '',
    registrationNumber: '',
    panVatNumber: '',
    officeAddress: '',
    workAreaDistrict: '',
    desiredDistributionArea: '',
    currentBusiness: '',
    businessType: ''
  },
  staffInfrastructure: {
    salesManCount: 0,
    salesManExperience: '',
    driverCount: 0,
    driverExperience: '',
    helperCount: 0,
    helperExperience: '',
    accountantCount: 0,
    accountantExperience: '',
    storageSpace: 0,
    storageDetails: '',
    truckCount: 0,
    truckExperience: '',
    truckDetails: '',
    fourWheelerCount: 0,
    fourWheelerExperience: '',
    fourWheelerDetails: '',
    motorcycleCount: 0,
    motorcycleExperience: '',
    twoWheelerDetails: '',
    cycleCount: 0,
    cycleExperience: '',
    cycleDetails: '',
    thelaCount: 0,
    thelaExperience: '',
    thelaDetails: ''
  },
  businessInformation: {
    productCategory: '',
    businessExperience: '',
    monthlyIncome: '',
    storageFacility: '',
    paymentPreference: '',
    creditDays: 0,
    deliveryPreference: ''
  },
  additionalInformation: {
    additionalInfo: '',
    additionalInfo2: '',
    additionalInfo3: ''
  },
  documentUpload: {
    citizenshipCertificate: false,
    companyRegistration: false,
    panVat: false,
    officePhoto: false,
    otherDocuments: false
  },
  agreementDetails: {
    agreementAccepted: false
  },
  currentTransactions: [],
  productsToDistribute: [],
  areaCoverageDetails: []
});

interface FormWizardProps {
  onSubmit: (data: DistributorFormData) => Promise<void>;
  onSaveDraft?: (data: DistributorFormData) => Promise<string | null>;
  onLoadDraft?: (referenceNumber: string) => Promise<boolean>;
}

export const FormWizard: React.FC<FormWizardProps> = ({
  onSubmit,
  onSaveDraft,
  onLoadDraft
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const methods = useForm<DistributorFormData>({
    resolver: yupResolver(createValidationSchema()),
    mode: 'onChange',
    defaultValues: getDefaultFormValues() as DistributorFormData
  });

  const { handleSubmit, trigger, watch, formState: { errors } } = methods;

  // Step validation fields
  const getStepValidationFields = (stepId: number): string[] => {
    switch (stepId) {
      case 1:
        return [
          'personalDetails.fullName',
          'personalDetails.age', 
          'personalDetails.gender',
          'personalDetails.citizenshipNumber',
          'personalDetails.issuedDistrict',
          'personalDetails.mobileNumber',
          'personalDetails.email',
          'personalDetails.permanentAddress'
        ];
      case 2:
        return [
          'businessDetails.companyName',
          'businessDetails.registrationNumber',
          'businessDetails.panVatNumber',
          'businessDetails.officeAddress',
          'businessDetails.workAreaDistrict',
          'businessDetails.desiredDistributionArea'
        ];
      case 5:
        return [
          'documentUpload.citizenshipCertificate',
          'documentUpload.citizenshipFile',
          'documentUpload.companyRegistrationFile',
          'documentUpload.panVatFile'
        ];
      case 7:
        return [
          'agreementDetails.agreementAccepted',
          'agreementDetails.distributorSignatureName',
          'agreementDetails.distributorSignatureDate'
        ];
      default:
        return [];
    }
  };

  const nextStep = async () => {
    const validationFields = getStepValidationFields(currentStep);
    
    if (validationFields.length > 0) {
      const isValid = await trigger(validationFields as any);
      if (!isValid) {
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

  const onFormSubmit = async (data: DistributorFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <PersonalDetailsStep control={methods.control} errors={methods.formState.errors} watch={watch} />;
      case 2:
        return <BusinessDetailsStep control={methods.control} errors={methods.formState.errors} watch={watch} />;
      // Add other step components as they are created
      default:
        return <div>Step {currentStep} content coming soon...</div>;
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-green-600 mb-4 absans">आवेदन सफलतापूर्वक पेश भयो!</h2>
        <p className="text-gray-600 absans">तपाईंको आवेदन हामीले प्राप्त गरेका छौं। हामी चाँडै तपाईंलाई सम्पर्क गर्नेछौं।</p>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        {/* Step Navigation */}
        <StepNavigation 
          steps={formSteps}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
        />

        {/* Form Content */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="mt-8">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors absans"
            >
              पछाडि
            </button>

            <div className="flex gap-4">
              {onSaveDraft && (
                <button
                  type="button"
                  onClick={() => onSaveDraft(watch() as DistributorFormData)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors absans"
                >
                  ड्राफ्ट सेभ गर्नुहोस्
                </button>
              )}

              {currentStep === formSteps.length ? (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors absans"
                >
                  {isSubmitting ? 'पेश गरिँदै...' : 'आवेदन पेश गर्नुहोस्'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors absans"
                >
                  अर्को चरण
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </FormProvider>
  );
};