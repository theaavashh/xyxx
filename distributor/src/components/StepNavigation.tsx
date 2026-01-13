interface StepNavigationProps {
  currentStep: number;
  steps: { id: number; title: string; subtitle: string }[];
}

export const StepNavigation = ({ currentStep, steps }: StepNavigationProps) => {
  return (
    <div className="p-6 border-b border-gray-200">
      <div>
        <h2 className="text-lg font-semibold text-[#001011] absans">
          {steps.find(s => s.id === currentStep)?.title}
        </h2>
      </div>
    </div>
  );
};