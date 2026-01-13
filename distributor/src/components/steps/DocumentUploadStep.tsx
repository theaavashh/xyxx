import { Controller, Control, FieldErrors } from 'react-hook-form';
import { FormData } from '@/types/formTypes';
import { FileUpload } from '../FileUpload';

interface DocumentUploadStepProps {
  control: Control<FormData>;
  errors: FieldErrors<FormData>;
}

export const DocumentUploadStep = ({ control, errors }: DocumentUploadStepProps) => {
  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-[#001011] mb-6 absans">६. प्रमाणपत्र संलग्न (Document Upload)</h3>
      
      {/* Primary Documents Section */}
      <div className="space-y-6">
        <h4 className="text-lg font-semibold text-[#001011] absans">मुख्य प्रमाणपत्रहरू (Primary Documents)</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-[#001011] mb-2 absans">
              नागरिकता प्रमाणपत्र (Citizenship Certificate)
            </label>
            <Controller
              name="citizenshipFile"
              control={control}
              render={({ field }) => (
                <FileUpload
                  name="citizenshipFile"
                  control={control}
                  label="नागरिकता प्रमाणपत्र अपलोड गर्नुहोस्"
                  accept="image/*,application/pdf"
                  error={errors.citizenshipFile?.message as string}
                />
              )}
            />
            {errors.citizenshipFile && (
              <p className="text-red-500 text-sm mt-1">{errors.citizenshipFile.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-bold text-[#001011] mb-2 absans">
              कम्पनी दर्ता प्रमाणपत्र (Company Registration Certificate)
            </label>
            <Controller
              name="companyRegistrationFile"
              control={control}
              render={({ field }) => (
                <FileUpload
                  name="companyRegistrationFile"
                  control={control}
                  label="कम्पनी दर्ता प्रमाणपत्र अपलोड गर्नुहोस्"
                  accept="image/*,application/pdf"
                  error={errors.companyRegistrationFile?.message as string}
                />
              )}
            />
            {errors.companyRegistrationFile && (
              <p className="text-red-500 text-sm mt-1">{errors.companyRegistrationFile.message}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Financial Documents Section */}
      <div className="space-y-6">
        <h4 className="text-lg font-semibold text-[#001011] absans">वित्तीय प्रमाणपत्रहरू (Financial Documents)</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-[#001011] mb-2 absans">
              PAN/VAT प्रमाणपत्र (PAN/VAT Certificate)
            </label>
            <Controller
              name="panVatFile"
              control={control}
              render={({ field }) => (
                <FileUpload
                  name="panVatFile"
                  control={control}
                  label="PAN/VAT प्रमाणपत्र अपलोड गर्नुहोस्"
                  accept="image/*,application/pdf"
                  error={errors.panVatFile?.message as string}
                />
              )}
            />
            {errors.panVatFile && (
              <p className="text-red-500 text-sm mt-1">{errors.panVatFile.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-bold text-[#001011] mb-2 absans">
              कार्यालयको फोटो (Office Photo)
            </label>
            <Controller
              name="officePhotoFile"
              control={control}
              render={({ field }) => (
                <FileUpload
                  name="officePhotoFile"
                  control={control}
                  label="कार्यालयको फोटो अपलोड गर्नुहोस्"
                  accept="image/*"
                  error={errors.officePhotoFile?.message as string}
                />
              )}
            />
            {errors.officePhotoFile && (
              <p className="text-red-500 text-sm mt-1">{errors.officePhotoFile.message}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Additional Documents Section */}
      <div className="space-y-6">
        <h4 className="text-lg font-semibold text-[#001011] absans">अतिरिक्त प्रमाणपत्रहरू (Additional Documents)</h4>
        
        <div>
          <label className="block text-sm font-bold text-[#001011] mb-2 absans">
            अन्य कागजात (Other Documents)
          </label>
          <Controller
            name="otherDocumentsFile"
            control={control}
            render={({ field }) => (
              <FileUpload
                name="otherDocumentsFile"
                control={control}
                label="अन्य कागजात अपलोड गर्नुहोस्"
                accept="image/*,application/pdf"
                error={errors.otherDocumentsFile?.message as string}
              />
            )}
          />
          {errors.otherDocumentsFile && (
            <p className="text-red-500 text-sm mt-1">{errors.otherDocumentsFile.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};