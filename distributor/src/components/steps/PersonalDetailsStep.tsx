import { useState, useEffect } from 'react';
import { Controller, Control, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { nepalDistricts } from '@/constants/nepalLocations';
import { FormData } from '@/types/formTypes';
import { FileUpload } from '../FileUpload';

interface PersonalDetailsStepProps {
  control: Control<FormData>;
  errors: FieldErrors<FormData>;
  setValue: UseFormSetValue<FormData>;
  watch: UseFormWatch<FormData>;
}

export const PersonalDetailsStep = ({ control, errors, setValue, watch }: PersonalDetailsStepProps) => {
  const [sameAsPermanent, setSameAsPermanent] = useState(false);
  return (
    <div className="space-y-8">
      {/* Personal Details Section */}
      <div className="space-y-6">
        <div className='bg-white rounded-xl p-8 shadow-lg'>
           <h3 className="text-xl font-semibold text-[#001011] mb-4 absans">व्यक्तिगत विवरण (Personal Details)</h3>
        
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
        
       
      </div>


       {/* Contact Information Section */}
      <div className="space-y-6 bg-white rounded-xl p-8 shadow-lg">
        <h3 className="text-xl font-semibold text-[#001011] mb-4 absans">सम्पर्क विवरण (Contact Information)</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="sm:col-span-2">
            <label className="block text-sm font-bold text-[#001011] mb-2 absans">
              ईमेल ठेगाना (Email Address)
            </label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="email"
                  className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                    errors.email ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                  }`}
                  placeholder="distributor@email.com"
                />
              )}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-bold text-[#001011] mb-2 absans">
              स्थायी ठेगाना (Permanent Address)
            </label>
            <Controller
              name="permanentAddress"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                    errors.permanentAddress ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                  }`}
                  placeholder="स्थायी ठेगाना लेख्नुहोस्"
                />
              )}
            />
            {errors.permanentAddress && (
              <p className="text-red-500 text-sm mt-1">{errors.permanentAddress.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-bold text-[#001011] mb-2 absans">
              अस्थायी ठेगाना (Temporary Address)
            </label>
            <Controller
              name="temporaryAddress"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                    errors.temporaryAddress ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                  }`}
                  placeholder="अस्थायी ठेगाना लेख्नुहोस्"
                  disabled={sameAsPermanent}
                />
              )}
            />
            <div className="mt-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="rounded text-[#FF6B35] focus:ring-[#FF6B35]"
                  checked={sameAsPermanent}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setSameAsPermanent(isChecked);
                    if (isChecked) {
                      setValue('temporaryAddress', watch('permanentAddress') || '');
                    }
                  }}
                />
                <span className="ml-2 text-sm text-[#001011] absans">स्थायी ठेगाना जस्तै (Same as Permanent Address)</span>
              </label>
            </div>
            {errors.temporaryAddress && (
              <p className="text-red-500 text-sm mt-1">{errors.temporaryAddress.message}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Citizenship Details Section */}
      <div className="space-y-6 bg-white rounded-xl p-8 shadow-lg">
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
                  <option value="">जिल्ला छान्नुहोस्</option>
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

          <div>
            <label className="block text-sm font-bold text-[#001011] mb-2 absans">
              नागरिकता अगाडिल्लो भाग (Front Side)
            </label>
            <FileUpload
              name="citizenshipFrontFile"
              control={control}
              label="अगाडिल्लो भाग अपलोड गर्नुहोस्"
              accept="image/*,application/pdf"
              error={errors.citizenshipFrontFile?.message as string}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#001011] mb-2 absans">
              नागरिकता पछाडिल्लो भाग (Back Side)
            </label>
            <FileUpload
              name="citizenshipBackFile"
              control={control}
              label="पछाडिल्लो भाग अपलोड गर्नुहोस्"
              accept="image/*,application/pdf"
              error={errors.citizenshipBackFile?.message as string}
            />
          </div>
          
        </div>
      </div>
      
     
      
     
    </div>
  );
};