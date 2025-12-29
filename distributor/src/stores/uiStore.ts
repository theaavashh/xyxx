import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// UI state interface
interface UIState {
  // Current step
  currentStep: number;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  // Navigation state
  visitedSteps: Set<number>;
  markStepAsVisited: (step: number) => void;
  canNavigateToStep: (step: number) => boolean;
  
  // Loading states
  isSubmitting: boolean;
  setIsSubmitting: (loading: boolean) => void;
  
  isSavingDraft: boolean;
  setIsSavingDraft: (loading: boolean) => void;
  
  isLoadingDraft: boolean;
  setIsLoadingDraft: (loading: boolean) => void;
  
  // Draft state
  referenceNumber: string | null;
  setReferenceNumber: (reference: string | null) => void;
  
  // Modal states
  showReferenceInput: boolean;
  setShowReferenceInput: (show: boolean) => void;
  
  inputReferenceNumber: string;
  setInputReferenceNumber: (reference: string) => void;
  
  // Error state
  apiError: string | null;
  setApiError: (error: string | null) => void;
  clearApiError: () => void;
  
  // Success state
  submissionSuccess: boolean;
  setSubmissionSuccess: (success: boolean) => void;
  
  // Form validation state
  validationErrors: Record<string, string>;
  setValidationErrors: (errors: Record<string, string>) => void;
  addValidationError: (field: string, error: string) => void;
  removeValidationError: (field: string) => void;
  clearValidationErrors: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      // Current step
      currentStep: 1,
      setCurrentStep: (step) => {
        set({ currentStep: step }, false, 'setCurrentStep');
        // Auto-mark step as visited
        get().markStepAsVisited(step);
      },
      
      nextStep: () => {
        const { currentStep } = get();
        if (currentStep < 8) {
          const newStep = currentStep + 1;
          set({ currentStep: newStep }, false, 'nextStep');
          get().markStepAsVisited(newStep);
        }
      },
      
      prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          const newStep = currentStep - 1;
          set({ currentStep: newStep }, false, 'prevStep');
          get().markStepAsVisited(newStep);
        }
      },
      
      // Navigation state
      visitedSteps: new Set([1]),
      markStepAsVisited: (step) => {
        set((state) => ({
          visitedSteps: new Set([...state.visitedSteps, step])
        }), false, 'markStepAsVisited');
      },
      
      canNavigateToStep: (step) => {
        const { currentStep, visitedSteps } = get();
        // Can navigate to any step up to current step + 1 (next step)
        // Can always go back to any visited step
        return step <= currentStep + 1 || visitedSteps.has(step);
      },
      
      // Loading states
      isSubmitting: false,
      setIsSubmitting: (loading) => {
        set({ isSubmitting: loading }, false, 'setIsSubmitting');
      },
      
      isSavingDraft: false,
      setIsSavingDraft: (loading) => {
        set({ isSavingDraft: loading }, false, 'setIsSavingDraft');
      },
      
      isLoadingDraft: false,
      setIsLoadingDraft: (loading) => {
        set({ isLoadingDraft: loading }, false, 'setIsLoadingDraft');
      },
      
      // Draft state
      referenceNumber: null,
      setReferenceNumber: (reference) => {
        set({ referenceNumber: reference }, false, 'setReferenceNumber');
      },
      
      // Modal states
      showReferenceInput: false,
      setShowReferenceInput: (show) => {
        set({ showReferenceInput: show }, false, 'setShowReferenceInput');
      },
      
      inputReferenceNumber: '',
      setInputReferenceNumber: (reference) => {
        set({ inputReferenceNumber: reference }, false, 'setInputReferenceNumber');
      },
      
      // Error state
      apiError: null,
      setApiError: (error) => {
        set({ apiError: error }, false, 'setApiError');
      },
      
      clearApiError: () => {
        set({ apiError: null }, false, 'clearApiError');
      },
      
      // Success state
      submissionSuccess: false,
      setSubmissionSuccess: (success) => {
        set({ submissionSuccess: success }, false, 'setSubmissionSuccess');
      },
      
      // Form validation state
      validationErrors: {},
      setValidationErrors: (errors) => {
        set({ validationErrors: errors }, false, 'setValidationErrors');
      },
      
      addValidationError: (field, error) => {
        set((state) => ({
          validationErrors: { ...state.validationErrors, [field]: error }
        }), false, 'addValidationError');
      },
      
      removeValidationError: (field) => {
        set((state) => {
          const newErrors = { ...state.validationErrors };
          delete newErrors[field];
          return { validationErrors: newErrors };
        }, false, 'removeValidationError');
      },
      
      clearValidationErrors: () => {
        set({ validationErrors: {} }, false, 'clearValidationErrors');
      }
    }),
    {
      name: 'distributor-ui-storage'
    }
  )
);

// Selectors for commonly used computed values
export const useUISelectors = {
  // Step progression
  getProgressPercentage: () => {
    const { currentStep } = useUIStore.getState();
    return Math.round((currentStep / 8) * 100);
  },
  
  // Form completion
  isFormComplete: () => {
    const { currentStep, validationErrors } = useUIStore.getState();
    return currentStep === 8 && Object.keys(validationErrors).length === 0;
  },
  
  // Loading states
  isAnyLoading: () => {
    const { isSubmitting, isSavingDraft, isLoadingDraft } = useUIStore.getState();
    return isSubmitting || isSavingDraft || isLoadingDraft;
  },
  
  // Error handling
  hasErrors: () => {
    const { apiError, validationErrors } = useUIStore.getState();
    return !!apiError || Object.keys(validationErrors).length > 0;
  },
  
  // Navigation helpers
  getStepStatus: (stepId: number) => {
    const { currentStep, visitedSteps } = useUIStore.getState();
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'active';
    if (visitedSteps.has(stepId)) return 'visited';
    return 'pending';
  }
};