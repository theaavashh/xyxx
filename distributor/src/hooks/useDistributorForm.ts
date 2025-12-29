import { useEffect } from 'react';
import { useFormDataStore } from './formStore';
import { useUIStore, useUISelectors } from './uiStore';
import { DistributorFormData } from '@/types/application.types';

// Combined hook for form operations
export const useDistributorForm = () => {
  const formDataStore = useFormDataStore();
  const uiStore = useUIStore();
  
  // Combined actions
  const updateStepData = (stepData: Partial<DistributorFormData>) => {
    formDataStore.updateFormData(stepData);
  };
  
  const validateCurrentStep = () => {
    const { currentStep, setValidationErrors } = uiStore;
    const { isStepComplete, validateCurrentStep } = formDataStore;
    
    if (isStepComplete(currentStep)) {
      setValidationErrors({});
      return true;
    }
    
    const { isValid, errors } = validateCurrentStep(currentStep);
    const errorMap: Record<string, string> = {};
    
    errors.forEach(error => {
      errorMap[error.toLowerCase().replace(/\s+/g, '_')] = error;
    });
    
    setValidationErrors(errorMap);
    return isValid;
  };
  
  const moveToNextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      uiStore.nextStep();
      return true;
    }
    return false;
  };
  
  const moveToStep = (stepId: number) => {
    const { canNavigateToStep } = uiStore;
    if (canNavigateToStep(stepId)) {
      uiStore.setCurrentStep(stepId);
      return true;
    }
    return false;
  };
  
  const saveDraft = async () => {
    const { formData } = formDataStore;
    const { setIsSavingDraft, setApiError, setReferenceNumber } = uiStore;
    
    setIsSavingDraft(true);
    setApiError(null);
    
    try {
      // Import API function here to avoid circular dependency
      const { applicationApi } = await import('@/services/api');
      const response = await applicationApi.saveDraft(formData);
      
      setReferenceNumber(response.data.referenceNumber);
      return response.data.referenceNumber;
    } catch (error) {
      console.error('Error saving draft:', error);
      setApiError(error instanceof Error ? error.message : 'Failed to save draft');
      return null;
    } finally {
      setIsSavingDraft(false);
    }
  };
  
  const loadDraft = async (referenceNumber: string) => {
    const { setIsLoadingDraft, setApiError, setCurrentStep } = uiStore;
    const { setFormData } = formDataStore;
    
    setIsLoadingDraft(true);
    setApiError(null);
    
    try {
      // Import API function here to avoid circular dependency
      const { applicationApi } = await import('@/services/api');
      const application = await applicationApi.loadApplicationByReference(referenceNumber);
      
      // Transform loaded data to match our form structure
      const transformedData = transformLoadedApplication(application);
      setFormData(transformedData);
      setCurrentStep(1); // Reset to first step
      
      return true;
    } catch (error) {
      console.error('Error loading draft:', error);
      setApiError(error instanceof Error ? error.message : 'Failed to load draft');
      return false;
    } finally {
      setIsLoadingDraft(false);
    }
  };
  
  const submitApplication = async () => {
    const { formData, getCompletionPercentage } = formDataStore;
    const { setIsSubmitting, setApiError, setSubmissionSuccess } = uiStore;
    
    setIsSubmitting(true);
    setApiError(null);
    
    try {
      // Validate completion percentage
      const completion = getCompletionPercentage();
      if (completion < 100) {
        throw new Error(`Please complete all required fields (${completion}% complete)`);
      }
      
      // Import API function here to avoid circular dependency
      const { applicationApi } = await import('@/services/api');
      await applicationApi.submitApplication(formData as DistributorFormData);
      
      setSubmissionSuccess(true);
      return true;
    } catch (error) {
      console.error('Error submitting application:', error);
      setApiError(error instanceof Error ? error.message : 'Failed to submit application');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Auto-save draft periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const { isSubmitting, isSavingDraft } = uiStore;
      if (!isSubmitting && !isSavingDraft) {
        saveDraft();
      }
    }, 60000); // Auto-save every minute
    
    return () => clearInterval(interval);
  }, [uiStore.isSubmitting, uiStore.isSavingDraft]);
  
  // Load form data from localStorage on mount
  useEffect(() => {
    const storedData = localStorage.getItem('distributor-form-storage');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        if (parsed.state?.formData) {
          formDataStore.setFormData(parsed.state.formData);
        }
      } catch (error) {
        console.error('Error loading stored form data:', error);
      }
    }
  }, []);
  
  return {
    // Form data store
    ...formDataStore,
    
    // UI store
    ...uiStore,
    
    // Combined actions
    updateStepData,
    validateCurrentStep,
    moveToNextStep,
    moveToStep,
    saveDraft,
    loadDraft,
    submitApplication,
    
    // Computed selectors
    ...useUISelectors
  };
};

// Helper function to transform loaded application data
function transformLoadedApplication(application: any): Partial<DistributorFormData> {
  return {
    personalDetails: {
      fullName: application.fullName || '',
      age: application.age || 18,
      gender: application.gender || 'पुरुष',
      citizenshipNumber: application.citizenshipNumber || '',
      issuedDistrict: application.issuedDistrict || '',
      mobileNumber: application.mobileNumber || '',
      email: application.email || '',
      permanentAddress: application.permanentAddress || '',
      temporaryAddress: application.temporaryAddress || ''
    },
    businessDetails: {
      companyName: application.companyName || '',
      registrationNumber: application.registrationNumber || '',
      panVatNumber: application.panVatNumber || '',
      officeAddress: application.officeAddress || '',
      workAreaDistrict: application.operatingArea || '',
      desiredDistributionArea: application.desiredDistributorArea || '',
      currentBusiness: application.currentBusiness || '',
      businessType: application.businessType || ''
    },
    staffInfrastructure: {
      salesManCount: application.salesManCount || 0,
      salesManExperience: application.salesManExperience || '',
      driverCount: application.deliveryStaffCount || 0,
      driverExperience: application.deliveryStaffExperience || '',
      helperCount: application.otherStaffCount || 0,
      helperExperience: application.otherStaffExperience || '',
      accountantCount: application.accountAssistantCount || 0,
      accountantExperience: application.accountAssistantExperience || '',
      storageSpace: application.warehouseSpace || 0,
      storageDetails: application.warehouseDetails || '',
      truckCount: application.truckCount || 0,
      truckExperience: application.truckDetails || '',
      truckDetails: application.truckDetails || '',
      fourWheelerCount: application.fourWheelerCount || 0,
      fourWheelerExperience: application.fourWheelerDetails || '',
      fourWheelerDetails: application.fourWheelerDetails || '',
      motorcycleCount: application.twoWheelerCount || 0,
      motorcycleExperience: application.twoWheelerDetails || '',
      twoWheelerDetails: application.twoWheelerDetails || '',
      cycleCount: application.cycleCount || 0,
      cycleExperience: application.cycleDetails || '',
      cycleDetails: application.cycleDetails || '',
      thelaCount: application.thelaCount || 0,
      thelaExperience: application.thelaDetails || '',
      thelaDetails: application.thelaDetails || ''
    },
    businessInformation: {
      productCategory: application.productCategory || '',
      businessExperience: application.yearsInBusiness?.toString() || '',
      monthlyIncome: application.monthlySales || '',
      storageFacility: application.storageFacility || '',
      paymentPreference: application.paymentPreference || '',
      creditDays: application.creditDays || 0,
      deliveryPreference: application.deliveryPreference || ''
    },
    partnershipDetails: application.partnerFullName ? {
      partnerFullName: application.partnerFullName,
      partnerAge: application.partnerAge || 18,
      partnerGender: application.partnerGender || '',
      partnerCitizenshipNumber: application.partnerCitizenshipNumber || '',
      partnerIssuedDistrict: application.partnerIssuedDistrict || '',
      partnerMobileNumber: application.partnerMobileNumber || '',
      partnerEmail: application.partnerEmail || '',
      partnerPermanentAddress: application.partnerPermanentAddress || '',
      partnerTemporaryAddress: application.partnerTemporaryAddress || ''
    } : undefined,
    additionalInformation: {
      additionalInfo: application.additionalInfo1 || '',
      additionalInfo2: application.additionalInfo2 || '',
      additionalInfo3: application.additionalInfo3 || ''
    },
    documentUpload: {
      citizenshipCertificate: true, // Assume uploaded if loading
      companyRegistration: true,
      panVat: true,
      officePhoto: false,
      otherDocuments: false
    },
    agreementDetails: {
      agreementAccepted: application.agreementAccepted || false,
      distributorSignatureName: application.distributorSignatureName || '',
      distributorSignatureDate: application.distributorSignatureDate || ''
    },
    currentTransactions: application.currentTransactions || [],
    productsToDistribute: application.productsToDistribute || [],
    areaCoverageDetails: application.areaCoverageDetails || []
  };
}