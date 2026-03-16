'use client';

import { useState, createContext, useContext, ReactNode } from 'react';
import { FormContextType } from '../types/formTypes';

const FormDataContext = createContext<FormContextType | undefined>(undefined);

// Form Data Provider Component
export function FormDataProvider({ children }: { children: ReactNode }) {
  const [allFormData, setAllFormData] = useState<any>({}); // Using any for flexibility with form data structure

  const updateFormData = (stepData: any) => { // Using any for flexibility with form data structure
    console.log('CONTEXT: Updating form data with:', stepData);
    setAllFormData((prev: any) => { // Using any for flexibility with form data structure
      const updated = { ...prev, ...stepData };
      console.log('CONTEXT: Updated form data:', updated);
      return updated;
    });
  };

  const clearFormData = () => {
    console.log('🔄 CONTEXT: Clearing all form data');
    setAllFormData({});
  };

  const getCurrentFormData = () => {
    return allFormData;
  };

  const loadDraftData = (draftData: any) => { // Using any for flexibility with form data structure
    console.log('🔄 CONTEXT: Loading draft data:', draftData);
    setAllFormData(draftData);
  };

  return (
    <FormDataContext.Provider value={{
      allFormData,
      updateFormData,
      clearFormData,
      getCurrentFormData,
      loadDraftData
    }}>
      {children}
    </FormDataContext.Provider>
  );
}

// Custom hook to use form context
export function useFormData() {
  const context = useContext(FormDataContext);
  if (context === undefined) {
    throw new Error('useFormData must be used within a FormDataProvider');
  }
  return context;
}