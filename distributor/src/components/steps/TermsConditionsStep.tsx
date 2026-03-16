import { Controller, Control, FieldErrors } from 'react-hook-form';
import { FormData } from '@/types/formTypes';

interface TermsConditionsStepProps {
  control: Control<FormData>;
  errors: FieldErrors<FormData>;
}

export const TermsConditionsStep = ({ control, errors }: TermsConditionsStepProps) => {
  return (
    <div className="text-center py-12">
      <h3 className="text-xl font-semibold text-[#001011] mb-4 absans">८. नियम र सहमति (Terms & Agreement)</h3>
      <div className="text-left max-w-3xl mx-auto">
        <div className="bg-gray-100 p-6 rounded-lg max-h-96 overflow-y-auto">
          <p className="text-sm text-gray-700 absans mb-4">
            यो वितरक सम्झौता (&quot;सम्झौता&quot;) तपाईं, वितरक (&quot;आप&quot;) र ZipZip (&quot;कम्पनी&quot;) बीचको कानूनी बाध्यता भएको सम्झौता हो।
          </p>
          <p className="text-sm text-gray-700 absans mb-4">
            १. <strong>सम्झौताको दायरा:</strong> यो सम्झौता कम्पनीको उत्पादनहरू वितरण गर्न आपको अधिकार र दायित्वहरू निर्धारित गर्दछ।
          </p>
          <p className="text-sm text-gray-700 absans mb-4">
            २. <strong>वितरण अधिकार:</strong> कम्पनीले आपलाई निर्दिष्ट क्षेत्रमा उत्पादनहरू वितरण गर्ने अनन्य अधिकार प्रदान गर्दछ।
          </p>
          <p className="text-sm text-gray-700 absans mb-4">
            ३. <strong>मूल्य निर्धारण:</strong> आपले वितरण गर्ने मूल्य कम्पनी द्वारा निर्धारित गरिने छ।
          </p>
          <p className="text-sm text-gray-700 absans mb-4">
            ४. <strong>भुक्तानी अवधि:</strong> भुक्तानी अवधि ३० दिनको हुनेछ।
          </p>
          <p className="text-sm text-gray-700 absans mb-4">
            ५. <strong>गुणस्तर मापदण्ड:</strong> उत्पादनहरू निर्दिष्ट गुणस्तर मापदण्ड पूरा गर्नुपर्नेछ।
          </p>
          <p className="text-sm text-gray-700 absans mb-4">
            ६. <strong>सम्झौताको अवधि:</strong> यो सम्झौता १ वर्षको लागि हुनेछ र पुनःनवीकरण गर्न सकिन्छ।
          </p>
          <p className="text-sm text-gray-700 absans mb-4">
            ७. <strong>समाप्ति:</strong> कुनै पनि पक्षले ३० दिनको सूचना दिएर सम्झौता समाप्त गर्न सक्दछ।
          </p>
        </div>
        <div className="mt-6 flex items-center">
          <Controller
            name="agreementAccepted"
            control={control}
            rules={{ required: 'कृपया सम्झौतालाई स्वीकार गर्नुहोस्' }}
            render={({ field }) => (
              <input
                type="checkbox"
                id="agreementAccepted"
                checked={field.value || false}
                onChange={(e) => field.onChange(e.target.checked)}
                className="h-5 w-5 text-[#FF6B35] focus:ring-[#FF6B35] border-gray-300 rounded"
              />
            )}
          />
          <label htmlFor="agreementAccepted" className="ml-3 text-sm text-[#001011] absans">
            मैले माथिका सबै सर्तहरू पढेको छु र स्वीकार गर्दछु
          </label>
        </div>
        {errors.agreementAccepted && (
          <p className="text-red-500 text-sm mt-1">{errors.agreementAccepted.message}</p>
        )}
      </div>
    </div>
  );
};