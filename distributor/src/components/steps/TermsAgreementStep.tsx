import { Controller } from 'react-hook-form';

import { Control } from 'react-hook-form';
import { FormData } from '@/types/formTypes';

interface TermsAgreementStepProps {
  control: Control<FormData>;
  errors: any; // Using any since React Hook Form errors structure is complex
}

export const TermsAgreementStep = ({ control, errors }: TermsAgreementStepProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-[#001011] mb-6 absans">८. नियम र सहमति (Terms & Agreement)</h3>
      
      <div className="space-y-6">
        <div className="border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
          <h4 className="font-semibold text-[#001011] mb-2 absans">सेवा सर्तहरू (Terms of Service)</h4>
          <p className="text-sm text-[#001011] absans">
            यो सेवा सर्तहरू वितरक आवेदन प्रक्रिया सम्बन्धी नियम र शर्तहरू स्पष्ट पार्दछ। आवेदन दिने व्यक्तिले यी सर्तहरू स्वीकार गर्नुपर्छ।
          </p>
          <ul className="list-disc list-inside text-sm text-[#001011] mt-2 space-y-1">
            <li>प्रस्तुत गरिएका सबै जानकारी सत्य र सही हुनुपर्छ</li>
            <li>आवेदन प्रक्रिया सम्पन्न गर्न आवश्यक कागजातहरू प्रस्तुत गर्नुपर्छ</li>
            <li>सही जानकारी नदिएको पाइएमा आवेदन अस्वीकृत गरिन सक्छ</li>
            <li>कम्पनीका नियम अनुसार वितरण कार्य सम्पादन गर्नुपर्छ</li>
          </ul>
        </div>
        
        <div className="flex items-start">
          <Controller
            name="agreementAccepted"
            control={control}
            rules={{ required: "कृपया सर्तहरू स्वीकार गर्नुहोस्" }}
            render={({ field }) => (
              <input
                type="checkbox"
                checked={field.value}
                onChange={field.onChange}
                className="mt-1 h-5 w-5 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
              />
            )}
          />
          <label className="ml-3 block text-sm text-[#001011] absans">
            मैले माथिका सबै सर्तहरू पढेको छु र स्वीकार गर्दछु (I have read and agree to all the above terms)
          </label>
        </div>
      </div>
    </div>
  );
};