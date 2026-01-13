'use client';

import { Control, Controller } from 'react-hook-form';

import { FormData } from '@/types/form.types';

interface Step1BusinessTypeProps {
  control: Control<FormData>;
  errors: any; // Using any since React Hook Form errors structure is complex
}

export function Step1BusinessType({ control, errors }: Step1BusinessTypeProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-[#001011] mb-6 absans">व्यापार प्रकार र सम्पर्क विवरण</h3>
      <p className="text-sm text-[#6b7280] mb-6 absans">
        कृपया तपाईंको व्यापार प्रकार र सम्पर्क नम्बर प्रदान गर्नुहोस्
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="sm:col-span-2">
          <label className="block text-sm font-bold text-[#001011] mb-2 absans">
            व्यापार प्रकार (Business Type) *
          </label>
          <Controller
            name="businessStructure"
            control={control}
            rules={{ required: "व्यापार प्रकार आवश्यक छ" }}
            render={({ field }) => (
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...field}
                    value="individual"
                    checked={field.value === 'individual'}
                    className="mr-2"
                  />
                  <span className="text-sm text-[#001011] absans">व्यक्तिगत (Individual)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...field}
                    value="partnership"
                    checked={field.value === 'partnership'}
                    className="mr-2"
                  />
                  <span className="text-sm text-[#001011] absans">साझेदारी (Partnership)</span>
                </label>
              </div>
            )}
          />
          {errors.businessStructure && (
            <p className="text-red-500 text-sm mt-1">{errors.businessStructure.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-bold text-[#001011] mb-2 absans">
            सम्पर्क नम्बर (Contact Number) *
          </label>
          <Controller
            name="contactNumber"
            control={control}
            rules={{ required: "सम्पर्क नम्बर आवश्यक छ" }}
            render={({ field }) => (
              <input
                {...field}
                type="tel"
                className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                  errors.contactNumber ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                }`}
               
              />
            )}
          />
          {errors.contactNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.contactNumber.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}