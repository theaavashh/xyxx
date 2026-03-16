interface ThankYouMessageProps {
  isSubmitted: boolean;
  setIsSubmitted: (value: boolean) => void;
  setCurrentStep: (step: number) => void;
}

export const ThankYouMessage = ({
  isSubmitted,
  setIsSubmitted,
  setCurrentStep
}: ThankYouMessageProps) => {
  if (!isSubmitted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl mx-auto text-center px-6">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-[#001011] mb-4 absans">
              धन्यवाद! (Thank You!)
            </h1>
            <h2 className="text-xl font-semibold text-[#001011] mb-4 absans">
              आवेदन सफलतापूर्वक पेश गरियो
            </h2>
          </div>
          
          <div className="space-y-4 text-[#001011] absans">
            <p className="text-lg">
              तपाईंको आवेदन सफलतापूर्वक पेश गरियो। हाम्रो टोलीले यसको समीक्षा गर्नेछ र तपाईंलाई फिर्ता सम्पर्क गर्नेछ।
            </p>
            <p className="text-base text-gray-600">
              Your application has been successfully submitted. Our team will review it and get back to you.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-blue-800 absans">
                <strong>अगाडि के हुन्छ?</strong> हामी तपाईंको आवेदनको समीक्षा गर्नेछौं र तपाईंको व्यापारिक स्थिति अनुसार फिर्ता सम्पर्क गर्नेछौं।
              </p>
              <p className="text-xs text-blue-700 mt-2">
                <strong>What&apos;s next?</strong> We will review your application and contact you back based on your business status.
              </p>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                setIsSubmitted(false);
                setCurrentStep(1);
                window.location.reload();
              }}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors absans"
            >
              नयाँ आवेदन (New Application)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};