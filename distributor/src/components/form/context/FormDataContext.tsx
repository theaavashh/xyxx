'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { DistributorFormData } from '@/types/application.types';

interface FormContextType {
  // Form data management
  formData: Partial<DistributorFormData>;
  updateFormData: (data: Partial<DistributorFormData>) => void;
  setFormData: (data: Partial<DistributorFormData>) => void;
  clearFormData: () => void;
  
  // Draft management
  saveDraft: () => Promise<string | null>;
  loadDraft: (referenceNumber: string) => Promise<boolean>;
  isSavingDraft: boolean;
  isLoadingDraft: boolean;
  
  // Validation
  validateStep: (stepId: number) => Promise<boolean>;
  getStepErrors: (stepId: number) => Record<string, string>;
  
  // Navigation state
  visitedSteps: Set<number>;
  markStepAsVisited: (stepId: number) => void;
  
  // Form completion
  isFormComplete: boolean;
  getCompletionPercentage: () => number;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

interface FormProviderProps {
  children: ReactNode;
  onSaveDraft?: (data: Partial<DistributorFormData>) => Promise<string | null>;
  onLoadDraft?: (referenceNumber: string) => Promise<boolean>;
}

export const FormDataProvider: React.FC<FormProviderProps> = ({
  children,
  onSaveDraft,
  onLoadDraft
}) => {
  const [formData, setFormDataState] = useState<Partial<DistributorFormData>>({});
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set());

  // Update form data
  const updateFormData = useCallback((data: Partial<DistributorFormData>) => {
    setFormDataState(prev => {
      const updated = { ...prev, ...data };
      console.log('Form data updated:', updated);
      return updated;
    });
  }, []);

  // Set form data (replace entire state)
  const setFormData = useCallback((data: Partial<DistributorFormData>) => {
    setFormDataState(data);
    console.log('Form data set:', data);
  }, []);

  // Clear form data
  const clearFormData = useCallback(() => {
    setFormDataState({});
    setVisitedSteps(new Set());
    console.log('Form data cleared');
  }, []);

  // Save draft
  const saveDraft = useCallback(async (): Promise<string | null> => {
    if (!onSaveDraft) return null;

    setIsSavingDraft(true);
    try {
      const referenceNumber = await onSaveDraft(formData);
      console.log('Draft saved with reference:', referenceNumber);
      return referenceNumber;
    } catch (error) {
      console.error('Error saving draft:', error);
      return null;
    } finally {
      setIsSavingDraft(false);
    }
  }, [formData, onSaveDraft]);

  // Load draft
  const loadDraft = useCallback(async (referenceNumber: string): Promise<boolean> => {
    if (!onLoadDraft) return false;

    setIsLoadingDraft(true);
    try {
      const success = await onLoadDraft(referenceNumber);
      if (success) {
        console.log('Draft loaded successfully');
      }
      return success;
    } catch (error) {
      console.error('Error loading draft:', error);
      return false;
    } finally {
      setIsLoadingDraft(false);
    }
  }, [onLoadDraft]);

  // Validate step (basic validation - can be extended)
  const validateStep = useCallback(async (stepId: number): Promise<boolean> => {
    const requiredFields = getRequiredFieldsForStep(stepId);
    
    for (const field of requiredFields) {
      const value = getNestedValue(formData, field);
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        console.error(`Validation failed for step ${stepId}: ${field} is required`);
        return false;
      }
    }
    
    return true;
  }, [formData]);

  // Get step errors
  const getStepErrors = useCallback((stepId: number): Record<string, string> => {
    const requiredFields = getRequiredFieldsForStep(stepId);
    const errors: Record<string, string> = {};
    
    for (const field of requiredFields) {
      const value = getNestedValue(formData, field);
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors[field] = 'यो फिल्ड आवश्यक छ';
      }
    }
    
    return errors;
  }, [formData]);

  // Mark step as visited
  const markStepAsVisited = useCallback((stepId: number) => {
    setVisitedSteps(prev => new Set([...prev, stepId]));
  }, []);

  // Check if form is complete
  const isFormComplete = useCallback(() => {
    const requiredFields = [
      'personalDetails.fullName',
      'personalDetails.age',
      'personalDetails.gender',
      'personalDetails.citizenshipNumber',
      'personalDetails.issuedDistrict',
      'personalDetails.mobileNumber',
      'personalDetails.email',
      'personalDetails.permanentAddress',
      'businessDetails.companyName',
      'businessDetails.registrationNumber',
      'businessDetails.panVatNumber',
      'businessDetails.officeAddress',
      'businessDetails.workAreaDistrict',
      'businessDetails.desiredDistributionArea',
      'documentUpload.citizenshipCertificate',
      'documentUpload.citizenshipFile',
      'documentUpload.companyRegistrationFile',
      'documentUpload.panVatFile',
      'agreementDetails.agreementAccepted'
    ];

    return requiredFields.every(field => {
      const value = getNestedValue(formData, field);
      return value !== undefined && value !== null && value !== '';
    });
  }, [formData]);

  // Get completion percentage
  const getCompletionPercentage = useCallback(() => {
    const totalFields = 25; // Approximate total required fields
    const completedFields = countCompletedFields(formData);
    return Math.round((completedFields / totalFields) * 100);
  }, [formData]);

  const contextValue: FormContextType = {
    formData,
    updateFormData,
    setFormData,
    clearFormData,
    saveDraft,
    loadDraft,
    isSavingDraft,
    isLoadingDraft,
    validateStep,
    getStepErrors,
    visitedSteps,
    markStepAsVisited,
    isFormComplete: isFormComplete(),
    getCompletionPercentage
  };

  return (
    <FormContext.Provider value={contextValue}>
      {children}
    </FormContext.Provider>
  );
};

// Custom hook to use form context
export const useFormContext = () => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useFormContext must be used within a FormDataProvider');
  }
  return context;
};

// Helper functions
const getRequiredFieldsForStep = (stepId: number): string[] => {
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
        'agreementDetails.agreementAccepted'
      ];
    default:
      return [];
  }
};

const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

const countCompletedFields = (formData: Partial<DistributorFormData>): number => {
  let count = 0;
  
  const countFields = (obj: any, prefix = '') => {
    if (obj && typeof obj === 'object') {
      Object.entries(obj).forEach(([key, value]) => {
        const fullPath = prefix ? `${prefix}.${key}` : key;
        
        if (value !== undefined && value !== null && value !== '') {
          if (typeof value === 'object' && !(value instanceof File)) {
            countFields(value, fullPath);
          } else {
            count++;
          }
        }
      });
    }
  };
  
  countFields(formData);
  return count;
};