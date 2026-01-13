import { Controller, Control, FieldErrors } from 'react-hook-form';
import { FormData } from '@/types/formTypes';

interface AdditionalInfoStepProps {
  control: Control<FormData>;
  errors: FieldErrors<FormData>;
}

export const AdditionalInfoStep = ({ control, errors }: AdditionalInfoStepProps) => {
  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-[#001011] mb-6 absans">७. अतिरिक्त जानकारी (Additional Information)</h3>
      
      {/* Payment and Delivery Preferences */}
      <div className="space-y-6">
        <h4 className="text-lg font-semibold text-[#001011] absans">भुक्तानी र वितरण प्राथमिकता (Payment & Delivery Preferences)</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-[#001011] mb-2 absans">
              भुक्तानी प्राथमिकता (Payment Preference)
            </label>
            <Controller
              name="paymentPreference"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                    errors.paymentPreference ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                  }`}
                >
                  <option value="">भुक्तानी प्राथमिकता छान्नुहोस्</option>
                  <option value="cash">नगद (Cash)</option>
                  <option value="bank-transfer">बैंक ट्रान्सफर (Bank Transfer)</option>
                  <option value="cheque">चेक (Cheque)</option>
                  <option value="mobile-banking">मोबाइल बैंकिङ (Mobile Banking)</option>
                </select>
              )}
            />
            {errors.paymentPreference && (
              <p className="text-red-500 text-sm mt-1">{errors.paymentPreference.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-bold text-[#001011] mb-2 absans">
              वितरण प्राथमिकता (Delivery Preference)
            </label>
            <Controller
              name="deliveryPreference"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                    errors.deliveryPreference ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                  }`}
                >
                  <option value="">वितरण प्राथमिकता छान्नुहोस्</option>
                  <option value="self-pickup">आफै ल्याउने (Self Pickup)</option>
                  <option value="delivery-service">डेलिभरी सर्भिस (Delivery Service)</option>
                  <option value="courier">कुरियर (Courier)</option>
                  <option value="other">अन्य (Other)</option>
                </select>
              )}
            />
            {errors.deliveryPreference && (
              <p className="text-red-500 text-sm mt-1">{errors.deliveryPreference.message}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-[#001011] mb-2 absans">
              क्रेडिट दिने दिन (Credit Days)
            </label>
            <Controller
              name="creditDays"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                    errors.creditDays ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                  }`}
                >
                  <option value={0}>क्रेडिट दिन छान्नुहोस्</option>
                  <option value={7}>७ दिन (7 Days)</option>
                  <option value={15}>१५ दिन (15 Days)</option>
                  <option value={30}>३० दिन (30 Days)</option>
                  <option value={45}>४५ दिन (45 Days)</option>
                  <option value={60}>६० दिन (60 Days)</option>
                </select>
              )}
            />
            {errors.creditDays && (
              <p className="text-red-500 text-sm mt-1">{errors.creditDays.message}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Additional Information Fields */}
      <div className="space-y-6">
        <h4 className="text-lg font-semibold text-[#001011] absans">अतिरिक्त जानकारी (Additional Information)</h4>
        
        <div>
          <label className="block text-sm font-bold text-[#001011] mb-2 absans">
            अतिरिक्त जानकारी १ (Additional Information)
          </label>
          <Controller
            name="additionalInfo"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                rows={4}
                className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                  errors.additionalInfo ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                }`}
                placeholder="अतिरिक्त जानकारी लेख्नुहोस्..."
              />
            )}
          />
          {errors.additionalInfo && (
            <p className="text-red-500 text-sm mt-1">{errors.additionalInfo.message}</p>
          )}
        </div>
        
      
        
       
      </div>
    </div>
  );
};