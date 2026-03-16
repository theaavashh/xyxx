import React from 'react';
import { FormData } from '@/types/formTypes';

interface NavigationButtonsProps {
  currentStep: number;
  steps: { id: number; title: string; subtitle: string }[];
  isSubmitting?: boolean;
  onPrevStep: () => void;
  onNextStep: () => void;
  onSaveDraft: () => void;
  onSubmit: (e: React.FormEvent) => void;
  watch: (name: keyof FormData) => any; // Using any due to complex return types from React Hook Form
  errors: any; // Using any since React Hook Form errors structure is complex
}

export const NavigationButtons = ({
  currentStep,
  steps,
  isSubmitting = false,
  onPrevStep,
  onNextStep,
  onSaveDraft,
  onSubmit,
  watch,
  errors
}: NavigationButtonsProps) => {
  return (
    <div className="flex flex-wrap justify-between gap-2 pt-6 border-t border-gray-200">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPrevStep}
          disabled={currentStep === 1}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors absans ${
            currentStep === 1
              ? 'bg-gray-100 text-[#001011] cursor-not-allowed'
              : 'bg-gray-200 text-[#001011] hover:bg-gray-300'
          }`}
        >
          पछाडि
        </button>
        <button
          type="button"
          onClick={onSaveDraft}
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-colors absans"
        >
          ड्राफ्ट सेभ गर्नुहोस्
        </button>
      </div>

      {currentStep < steps.length ? (
        <button
          type="button"
          onClick={onNextStep}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors absans"
        >
          अगाडि
        </button>
      ) : (
        <button
          type="submit"
          disabled={isSubmitting}
          onClick={onSubmit}
          className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors absans ${
            isSubmitting
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isSubmitting ? 'पेश गर्दै...' : 'पेश गर्नुहोस्'}
        </button>
      )}
    </div>
  );
};