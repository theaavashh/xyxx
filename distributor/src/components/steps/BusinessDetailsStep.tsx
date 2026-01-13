import { useState } from 'react';
import { Controller, Control, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { nepalProvinces, districtsByProvince } from '@/constants/nepalLocations';
import { FormData } from '@/types/formTypes';
import { FileUpload } from '../../components/FileUpload';
import { WorkAreaModal } from '../../components/WorkAreaModal';

interface BusinessDetailsStepProps {
  control: Control<FormData>;
  errors: FieldErrors<FormData>;
  watch: UseFormWatch<FormData>;
  setValue: UseFormSetValue<FormData>;
}

export const BusinessDetailsStep = ({ control, errors, watch, setValue }: BusinessDetailsStepProps) => {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <div className="space-y-8">
      {/* Business Details Section */}
      <div className="space-y-6 bg-white rounded-xl p-8 shadow-lg">
        <h3 className="text-xl font-semibold text-[#001011] mb-4 absans">व्यापार विवरण (Business Details)</h3>
        
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
              काम गर्ने क्षेत्र (Work Area) *
            </label>
            <WorkAreaModal
              control={control}
              errors={errors}
              workAreaProvince={watch('workAreaProvince')}
              workAreaDistrict={watch('workAreaDistrict')}
              setWorkAreaProvince={(province) => setValue('workAreaProvince', province)}
              setWorkAreaDistrict={(district) => setValue('workAreaDistrict', district)}
              setShowModal={setShowModal}
              isModalOpen={showModal}
            />
            {errors.workAreaProvince && (
              <p className="text-red-500 text-sm mt-1">{errors.workAreaProvince.message}</p>
            )}
            {errors.workAreaDistrict && (
              <p className="text-red-500 text-sm mt-1">{errors.workAreaDistrict.message}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-bold text-[#001011] mb-2 absans">
              काम गर्ने क्षेत्र (Work Area) *
            </label>
            <Controller
              name="workArea"
              control={control}
              rules={{ required: "काम गर्ने क्षेत्र आवश्यक छ" }}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                    errors.workArea ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                  }`}
                  placeholder="काम गर्ने क्षेत्र लेख्नुहोस् (उदाहरण: कोहलपुर, बनेश्वरी, आदि)"
                  disabled={!watch('workAreaDistrict')}
                />
              )}
            />
            {errors.workArea && (
              <p className="text-red-500 text-sm mt-1">{errors.workArea.message}</p>
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
                <input
                  {...field}
                  type="text"
                  className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                    errors.desiredDistributionArea ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                  }`}
                  placeholder="वितरक बन्न चाहने क्षेत्र"
                />
              )}
            />
            {errors.desiredDistributionArea && (
              <p className="text-red-500 text-sm mt-1">{errors.desiredDistributionArea.message}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* PAN Details Section */}
      <div className="space-y-6 bg-white rounded-xl p-8 shadow-lg">
        <h3 className="text-xl font-semibold text-[#001011] mb-4 absans">PAN विवरण (PAN Details)</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

         
        </div>
        
        <div>
          <label className="block text-sm font-bold text-[#001011] mb-2 absans">
            PAN/VAT प्रमाणपत्र (PAN/VAT Certificate)
          </label>
          <Controller
            name="panDocument"
            control={control}
            render={({ field }) => (
              <FileUpload
                name="panDocument"
                control={control}
                label="PAN प्रमाणपत्र अपलोड गर्नुहोस्"
                accept="image/*,application/pdf"
                error={errors.panDocument?.message as string}
              />
            )}
          />
          {errors.panDocument && (
            <p className="text-red-500 text-sm mt-1">{errors.panDocument.message}</p>
          )}
        </div>
      </div>
      
      {/* Registration Details Section */}
      <div className="space-y-6 bg-white rounded-xl p-8 shadow-lg">
        <h3 className="text-xl font-semibold text-[#001011] mb-4 absans">दर्ता विवरण (Registration Details)</h3>

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
            कम्पनी दर्ता प्रमाणपत्र (Company Registration Certificate)
          </label>
          <Controller
            name="registrationDocument"
            control={control}
            render={({ field }) => (
              <FileUpload
                name="registrationDocument"
                control={control}
                label="दर्ता प्रमाणपत्र अपलोड गर्नुहोस्"
                accept="image/*,application/pdf"
                error={errors.registrationDocument?.message as string}
              />
            )}
          />
          {errors.registrationDocument && (
            <p className="text-red-500 text-sm mt-1">{errors.registrationDocument.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};
