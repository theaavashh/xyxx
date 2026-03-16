'use client';

import { Control, Controller } from 'react-hook-form';
import { FileUpload } from '../FileUpload';
import { nepalDistricts } from '../../constants/form.constants';

import { FormData } from '@/types/formTypes';

interface Step2PersonalDetailsProps {
  control: Control<FormData>;
  errors: any; // Using any since React Hook Form errors structure is complex
}

export function Step2PersonalDetails({ control, errors }: Step2PersonalDetailsProps) {
  return (
    <div className="space-y-8">
      {/* Personal Details Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-black mb-4 absans">व्यक्तिगत विवरण (Personal Details)</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="sm:col-span-2">
            <label className="block text-sm font-bold text-[#001011] mb-2 absans">
              पूरा नाम (Full Name) *
            </label>
            <Controller
              name="fullName"
              control={control}
              rules={{ required: "पूरा नाम आवश्यक छ" }}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                    errors.fullName ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                  }`}
                  placeholder="तपाईंको पूरा नाम लेख्नुहोस्"
                />
              )}
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-[#001011] mb-2 absans">
              उमेर (Age) *
            </label>
            <Controller
              name="age"
              control={control}
              rules={{ required: "उमेर आवश्यक छ" }}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                    errors.age ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                  }`}
                  placeholder="तपाईंको उमेर"
                />
              )}
            />
            {errors.age && (
              <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-[#001011] mb-2 absans">
              लिङ्ग (Gender)*
            </label>
            <Controller
              name="gender"
              control={control}
              rules={{ required: "लिङ्ग आवश्यक छ" }}
              render={({ field }) => (
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      {...field}
                      value="पुरुष"
                      checked={field.value === 'पुरुष'}
                      className="mr-2"
                    />
                    <span className="text-sm text-[#001011] absans">पुरुष</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      {...field}
                      value="महिला"
                      checked={field.value === 'महिला'}
                      className="mr-2"
                    />
                    <span className="text-sm text-[#001011] absans">महिला</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      {...field}
                      value="अन्य"
                      checked={field.value === 'अन्य'}
                      className="mr-2"
                    />
                    <span className="text-sm text-[#001011] absans">अन्य</span>
                  </label>
                </div>
              )}
            />
            {errors.gender && (
              <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Citizenship Details Section */}
      <div className="space-y-6 mt-10">
        <h3 className="text-xl font-semibold text-[#001011] mb-4 absans">नागरिकता विवरण (Citizenship Details)</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-[#001011] mb-2 absans">
              नागरिकता नम्बर (Citizenship Number) *
            </label>
            <Controller
              name="citizenshipNumber"
              control={control}
              rules={{ required: "नागरिकता नम्बर आवश्यक छ" }}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                    errors.citizenshipNumber ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                  }`}
                  placeholder="नागरिकता नम्बर"
                />
              )}
            />
            {errors.citizenshipNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.citizenshipNumber.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-[#001011] mb-2 absans">
              जारी जिल्ला (Issued District) *
            </label>
            <Controller
              name="issuedDistrict"
              control={control}
              rules={{ required: "जारी जिल्ला आवश्यक छ" }}
              render={({ field }) => (
                <select
                  {...field}
                  className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                    errors.issuedDistrict ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                  }`}
                >
                  <option value="">जिल्ला छन्नुहोस्</option>
                  {nepalDistricts.map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              )}
            />
            {errors.issuedDistrict && (
              <p className="text-red-500 text-sm mt-1">{errors.issuedDistrict.message}</p>
            )}
          </div>
        </div>
        
        {/* Citizenship Document Upload Section */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-[#001011] absans">नागरिकता प्रमाणपत्र अपलोड (Citizenship Document Upload)</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileUpload
              name="citizenshipFrontFile"
              control={control}
              label="नागरिकता अगाडिको भाग (Front Side)"
              required={true}
              error={errors.citizenshipFrontFile?.message}
            />
            
            <FileUpload
              name="citizenshipBackFile"
              control={control}
              label="नागरिकता पछाडिको भाग (Back Side)"
              required={true}
              error={errors.citizenshipBackFile?.message}
            />
          </div>
        </div>
      </div>
    </div>
  );
}