'use client';

import React from 'react';

interface Step {
  id: number;
  title: string;
  subtitle: string;
}

interface StepNavigationProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
  className?: string;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  steps,
  currentStep,
  onStepClick,
  className = ''
}) => {
  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'active';
    return 'pending';
  };

  const getStepStyles = (stepId: number) => {
    const status = getStepStatus(stepId);
    
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white border-green-500';
      case 'active':
        return 'bg-orange-500 text-white border-orange-500';
      default:
        return 'bg-gray-200 text-gray-600 border-gray-300';
    }
  };

  const getConnectorStyles = (stepId: number) => {
    if (stepId < currentStep) {
      return 'bg-green-500';
    }
    return 'bg-gray-300';
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => onStepClick?.(step.id)}
                  disabled={step.id > currentStep}
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-semibold text-sm transition-all duration-200 ${
                    getStepStyles(step.id)
                  } ${
                    step.id <= currentStep && onStepClick
                      ? 'hover:scale-110 cursor-pointer'
                      : step.id > currentStep
                      ? 'cursor-not-allowed'
                      : 'cursor-pointer'
                  }`}
                >
                  {getStepStatus(step.id) === 'completed' ? '✓' : step.id}
                </button>
                
                {/* Step Labels */}
                <div className="mt-2 text-center">
                  <div className={`text-xs font-medium absans ${
                    getStepStatus(step.id) === 'completed' || getStepStatus(step.id) === 'active'
                      ? 'text-gray-900'
                      : 'text-gray-500'
                  }`}>
                    {step.title}
                  </div>
                  <div className={`text-xs absans ${
                    getStepStatus(step.id) === 'completed' || getStepStatus(step.id) === 'active'
                      ? 'text-gray-600'
                      : 'text-gray-400'
                  }`}>
                    {step.subtitle}
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${
                  getConnectorStyles(step.id)
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Information */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 absans">
              {steps[currentStep - 1]?.title}
            </h3>
            <p className="text-sm text-gray-600 absans">
              {steps[currentStep - 1]?.subtitle}
            </p>
          </div>
          
          <div className="text-right">
            <span className="text-sm text-gray-500 absans">
              चरण {currentStep} {steps.length} मध्ये
            </span>
            <div className="text-xs text-gray-400 absans mt-1">
              {Math.round((currentStep / steps.length) * 100)}% पूर्ण
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};