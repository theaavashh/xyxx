import { Controller } from 'react-hook-form';
import { FormData } from '@/types/formTypes';
import { useState } from 'react';

import { Control, FieldErrorsImpl } from 'react-hook-form';

interface ContactInformationSectionProps {
  control: Control<FormData>;
  errors: FieldErrorsImpl<FormData>;
  watch: (name: keyof FormData) => any; // Using any due to complex return types from React Hook Form
  setValue: (name: keyof FormData, value: any) => void; // Using any for flexibility with form values
}

export const ContactInformationSection = ({
  control,
  errors,
  watch,
  setValue
}: ContactInformationSectionProps) => {
  const [sameAsPermanent, setSameAsPermanent] = useState(false);

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-[#001011] absans">सम्पर्क जानकारी (Contact Information)</h4>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="sm:col-span-2">
          <label className="block text-sm font-bold text-[#001011] mb-2 absans">
            इमेल (Email) *
          </label>
          <Controller
            name="email"
            control={control}
            rules={{ 
              required: "इमेल आवश्यक छ",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "मान्य इमेल चाहिन्छ"
              }
            }}
            render={({ field }) => (
              <input
                {...field}
                type="email"
                className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                  errors.email ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                }`}
                placeholder="example@email.com"
              />
            )}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
        
        <div className="sm:col-span-2">
          <label className="block text-sm font-bold text-[#001011] mb-2 absans">
            स्थायी ठेगाना (Permanent Address) *
          </label>
          <Controller
            name="permanentAddress"
            control={control}
            rules={{ required: "स्थायी ठेगाना आवश्यक छ" }}
            render={({ field }) => (
              <textarea
                {...field}
                rows={3}
                className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans resize-none ${
                  errors.permanentAddress ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                }`}
                placeholder="आफ्नो स्थायी ठेगाना लेख्नुहोस्"
              />
            )}
          />
          {errors.permanentAddress && (
            <p className="text-red-500 text-sm mt-1">{errors.permanentAddress.message}</p>
          )}
        </div>
        
        <div className="sm:col-span-2">
          <label className="block text-sm font-bold text-[#001011] mb-2 absans">
            अस्थायी ठेगाना (Temporary Address) *
          </label>
          <Controller
            name="temporaryAddress"
            control={control}
            rules={{ required: "अस्थायी ठेगाना आवश्यक छ" }}
            render={({ field }) => (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="same-as-permanent"
                    checked={sameAsPermanent}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      setSameAsPermanent(isChecked);
                      if (isChecked) {
                        const permanentAddr = watch('permanentAddress');
                        setValue('temporaryAddress', permanentAddr);
                      } else {
                        setValue('temporaryAddress', '');
                      }
                    }}
                    className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                  />
                  <label htmlFor="same-as-permanent" className="text-sm text-gray-600 absans">
                    स्थायी ठेगाना जस्तै (Same as permanent address)
                  </label>
                </div>
                <textarea
                  {...field}
                  rows={3}
                  disabled={sameAsPermanent}
                  className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans resize-none ${
                    errors.temporaryAddress ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                  } ${sameAsPermanent ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="आफ्नो अस्थायी ठेगाना लेख्नुहोस्"
                />
              </div>
            )}
          />
          {errors.temporaryAddress && (
            <p className="text-red-500 text-sm mt-1">{errors.temporaryAddress.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};