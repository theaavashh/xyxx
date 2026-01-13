import { createContext, useContext, ReactNode, useState } from 'react';
import { FormData } from '@/types/form.types';

interface FormContextType {
  allFormData: FormData;
  updateFormData: (stepData: Partial<FormData>) => void;
  clearFormData: () => void;
  getCurrentFormData: () => FormData;
  loadDraftData: (draftData: FormData) => void;
}

const FormDataContext = createContext<FormContextType | undefined>(undefined);

// Form Data Provider Component
export function FormDataProvider({ children }: { children: ReactNode }) {
  const [allFormData, setAllFormData] = useState<FormData>({} as FormData);

  const updateFormData = (stepData: Partial<FormData>) => {
    console.log('CONTEXT: Updating form data with:', stepData);
    setAllFormData((prev: FormData) => {
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

  const loadDraftData = (draftData: FormData) => {
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