'use client';

import { Control, Controller, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { districtsByProvince, nepalProvinces } from '../../constants/form.constants';

import { FormData } from '@/types/formTypes';

interface Step3BusinessDetailsProps {
  control: Control<FormData>;
  errors: any; // Using any since React Hook Form errors structure is complex
  setValue: UseFormSetValue<FormData>;
  watch: UseFormWatch<FormData>;
}

export function Step3BusinessDetails({ control, errors, setValue, watch }: Step3BusinessDetailsProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-[#001011] mb-6 absans">३. व्यापारिक विवरण (Business Details)</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="sm:col-span-2">
          <label className="block text-sm font-bold text-[#001011] mb-2 absans">
            कम्पनीको नाम (Company Name) *
          </label>
          <Controller
            name="companyName"
            control={control}
            rules={{ required: "कम्पनीको नाम आवश्यक छ" }}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                  errors.companyName ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                }`}
                placeholder="कम्पनीको नाम लेख्नुहोस्"
              />
            )}
          />
          {errors.companyName && (
            <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-[#001011] mb-2 absans">
            दर्ता नम्बर (Registration Number) *
          </label>
          <Controller
            name="registrationNumber"
            control={control}
            rules={{ required: "दर्ता नम्बर आवश्यक छ" }}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                  errors.registrationNumber ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                }`}
                placeholder="दर्ता नम्बर"
              />
            )}
          />
          {errors.registrationNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.registrationNumber.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-[#001011] mb-2 absans">
            PAN/VAT नम्बर (PAN/VAT Number) *
          </label>
          <Controller
            name="panVatNumber"
            control={control}
            rules={{ required: "PAN/VAT नम्बर आवश्यक छ" }}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                  errors.panVatNumber ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                }`}
                placeholder="PAN/VAT नम्बर"
              />
            )}
          />
          {errors.panVatNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.panVatNumber.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-bold text-[#001011] mb-2 absans">
            कार्यालयको ठेगाना (Office Address) *
          </label>
          <Controller
            name="officeAddress"
            control={control}
            rules={{ required: "कार्यालयको ठेगाना आवश्यक छ" }}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                  errors.officeAddress ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                }`}
                placeholder="कार्यालयको ठेगाना"
              />
            )}
          />
          {errors.officeAddress && (
            <p className="text-red-500 text-sm mt-1">{errors.officeAddress.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-[#001011] mb-2 absans">
            काम गर्ने प्रदेश (Work Area Province) *
          </label>
          <Controller
            name="workAreaProvince"
            control={control}
            rules={{ required: "काम गर्ने प्रदेश आवश्यक छ" }}
            render={({ field }) => (
              <select
                {...field}
                className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                  errors.workAreaProvince ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                }`}
                onChange={(e) => {
                  field.onChange(e);
                  // Reset district and area when province changes
                  setValue('workAreaDistrict', '');
                  setValue('workArea', '');
                }}
              >
                <option value="">प्रदेश छन्नुहोस्</option>
                {nepalProvinces.map((province) => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
            )}
          />
          {errors.workAreaProvince && (
            <p className="text-red-500 text-sm mt-1">{errors.workAreaProvince.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-[#001011] mb-2 absans">
            काम गर्ने क्षेत्र/जिल्ला (Work Area/District) *
          </label>
          <Controller
            name="workAreaDistrict"
            control={control}
            rules={{ required: "काम गर्ने क्षेत्र/जिल्ला आवश्यक छ" }}
            render={({ field }) => {
              const selectedProvince = watch('workAreaProvince');
              const districts = selectedProvince && districtsByProvince[selectedProvince] ? districtsByProvince[selectedProvince] : [];
              
              return (
                <select
                  {...field}
                  className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                    errors.workAreaDistrict ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                  }`}
                >
                  <option value="">जिल्ला छन्नुहोस्</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              );
            }}
          />
          {errors.workAreaDistrict && (
            <p className="text-red-500 text-sm mt-1">{errors.workAreaDistrict.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-bold text-[#001011] mb-2 absans">
            वितरक बन्न चाहने क्षेत्र (Desired Distribution Area) *
          </label>
          <Controller
            name="desiredDistributionArea"
            control={control}
            rules={{ required: "वितरक बन्न चाहने क्षेत्र आवश्यक छ" }}
            render={({ field }) => (
              <textarea
                {...field}
                rows={3}
                className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                  errors.desiredDistributionArea ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                }`}
                placeholder="वितरक बन्न चाहने क्षेत्र विस्तारित गर्नुहोस्"
              />
            )}
          />
          {errors.desiredDistributionArea && (
            <p className="text-red-500 text-sm mt-1">{errors.desiredDistributionArea.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}