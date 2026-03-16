import { Controller, Control, FieldErrors, UseFormWatch } from 'react-hook-form';
import { FormData } from '@/types/formTypes';

interface ProductsPartnershipStepProps {
  control: Control<FormData>;
  errors: FieldErrors<FormData>;
  watch: UseFormWatch<FormData>;
}

export const ProductsPartnershipStep = ({ control, errors, watch }: ProductsPartnershipStepProps) => {
  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-[#001011] mb-6 absans">६. उत्पादन र साझेदारी (Products & Partnership)</h3>

      <div className="space-y-6">
        <h4 className="text-lg font-semibold text-[#001011] absans">उत्पादन विवरण (Product Details)</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-[#001011] mb-2 absans">
              उत्पादन श्रेणी (Product Category)
            </label>
            <Controller
              name="productCategory"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                    errors.productCategory ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                  }`}
                >
                  <option value="">उत्पादन श्रेणी छान्नुहोस्</option>
                  <option value="potato-chips">Zip Zip Potato Chips</option>
             
                 
                </select>
              )}
            />
            {errors.productCategory && (
              <p className="text-red-500 text-sm mt-1">{errors.productCategory.message}</p>
            )}
          </div>
          
         
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-[#001011] mb-2 absans">
              मासिक आय (Monthly Income Target)
            </label>
            <Controller
              name="monthlyIncome"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                    errors.monthlyIncome ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                  }`}
                >
                  <option value="">मासिक आय छान्नुहोस्</option>
                  <option value="0-50k">Rs. ०-५०,०००</option>
                  <option value="50k-100k">Rs. ५०,०००-१,००,०००</option>
                  <option value="100k-200k">Rs. १,००,०००-२,००,०००</option>
                  <option value="200k+">Rs. २,००,०००+</option>
                </select>
              )}
            />
            {errors.monthlyIncome && (
              <p className="text-red-500 text-sm mt-1">{errors.monthlyIncome.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-bold text-[#001011] mb-2 absans">
              भण्डारण सुविधा (Storage Facility)
            </label>
            <Controller
              name="storageFacility"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                    errors.storageFacility ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                  }`}
                >
                  <option value="">भण्डारण सुविधा छान्नुहोस्</option>
                  <option value="own">आफ्नै (Own)</option>
                  <option value="rented">किराया (Rented)</option>
                  <option value="shared">साझेदारी (Shared)</option>
                  <option value="none">कुनै पनि होइन (None)</option>
                </select>
              )}
            />
            {errors.storageFacility && (
              <p className="text-red-500 text-sm mt-1">{errors.storageFacility.message}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Partnership Details Section - Only show if business structure is partnership */}
      {(watch('businessStructure') === 'partnership') && (
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-[#001011] absans">साझेदारी विवरण (Partnership Details)</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                साझेदारको पूरा नाम (Partner Full Name)
              </label>
              <Controller
                name="partnerFullName"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                      errors.partnerFullName ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                    }`}
                    placeholder="साझेदारको पूरा नाम लेख्नुहोस्"
                  />
                )}
              />
              {errors.partnerFullName && (
                <p className="text-red-500 text-sm mt-1">{errors.partnerFullName.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                साझेदारको उमेर (Partner Age)
              </label>
              <Controller
                name="partnerAge"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                      errors.partnerAge ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                    }`}
                    placeholder="साझेदारको उमेर लेख्नुहोस्"
                  />
                )}
              />
              {errors.partnerAge && (
                <p className="text-red-500 text-sm mt-1">{errors.partnerAge.message}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                साझेदारको लिङ्ग (Partner Gender)
              </label>
              <Controller
                name="partnerGender"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                      errors.partnerGender ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                    }`}
                  >
                    <option value="">लिङ्ग छान्नुहोस्</option>
                    <option value="पुरुष">पुरुष</option>
                    <option value="महिला">महिला</option>
                    <option value="अन्य">अन्य</option>
                  </select>
                )}
              />
              {errors.partnerGender && (
                <p className="text-red-500 text-sm mt-1">{errors.partnerGender.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                साझेदारको नागरिकता नम्बर (Partner Citizenship Number)
              </label>
              <Controller
                name="partnerCitizenshipNumber"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                      errors.partnerCitizenshipNumber ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                    }`}
                    placeholder="साझेदारको नागरिकता नम्बर"
                  />
                )}
              />
              {errors.partnerCitizenshipNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.partnerCitizenshipNumber.message}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                साझेदारको जारी जिल्ला (Partner Issued District)
              </label>
              <Controller
                name="partnerIssuedDistrict"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                      errors.partnerIssuedDistrict ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                    }`}
                  >
                    <option value="">जिल्ला छान्नुहोस्</option>
                    <option value="काठमाडौं">काठमाडौं</option>
                    <option value="ललितपुर">ललितपुर</option>
                    <option value="भक्तपुर">भक्तपुर</option>
                    <option value="चितवन">चितवन</option>
                    <option value="काभ्रेपलाञ्चोक">काभ्रेपलाञ्चोक</option>
                  </select>
                )}
              />
              {errors.partnerIssuedDistrict && (
                <p className="text-red-500 text-sm mt-1">{errors.partnerIssuedDistrict.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                साझेदारको मोबाइल नम्बर (Partner Mobile Number)
              </label>
              <Controller
                name="partnerMobileNumber"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="tel"
                    className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                      errors.partnerMobileNumber ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                    }`}
                    placeholder="9xxxxxxxxx"
                  />
                )}
              />
              {errors.partnerMobileNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.partnerMobileNumber.message}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                साझेदारको ईमेल (Partner Email)
              </label>
              <Controller
                name="partnerEmail"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="email"
                    className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                      errors.partnerEmail ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                    }`}
                    placeholder="partner@example.com"
                  />
                )}
              />
              {errors.partnerEmail && (
                <p className="text-red-500 text-sm mt-1">{errors.partnerEmail.message}</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Products Section - Always show */}
      
    </div>
  );
};