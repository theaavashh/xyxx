import { Controller, Control, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { FormData } from '@/types/formTypes';

interface ProductsPartnershipStepProps {
  control: Control<FormData>;
  errors: FieldErrors<FormData>;
  watch: UseFormWatch<FormData>;
  setValue: UseFormSetValue<FormData>;
}

export const ProductsPartnershipStepNew = ({ control, errors, watch, setValue }: ProductsPartnershipStepProps) => {
  const currentTransactions = watch('currentTransactions') || [];
  
  const addBusiness = () => {
    const newBusiness = {
      id: Date.now().toString(),
      businessType: '',
      productName: '',
      turnover: '',
      experience: '',
    };
    setValue('currentTransactions', [...currentTransactions, newBusiness]);
  };
  
  const removeBusiness = (index: number) => {
    const updatedTransactions = [...currentTransactions];
    updatedTransactions.splice(index, 1);
    setValue('currentTransactions', updatedTransactions);
  };
  
  const updateBusinessField = (index: number, field: string, value: string) => {
    const updatedTransactions = [...currentTransactions];
    updatedTransactions[index] = { ...updatedTransactions[index], [field]: value };
    setValue('currentTransactions', updatedTransactions);
  };
  
  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-[#001011] mb-6 absans">५. हालको व्यापार विवरण (Current Business Details)</h3>
      
      {/* Current Business Details Section */}
      <div className="space-y-6">
        <h4 className="text-lg font-semibold text-[#001011] absans">हालको व्यापार विवरण (Current Business Details)</h4>
        
       
        <div className="space-y-6">
        
          {currentTransactions.map((business, index) => (
            <div key={business.id || index} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h5 className="font-semibold text-[#001011] absans">व्यापार {index + 1}</h5>
                {currentTransactions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBusiness(index)}
                    className="text-red-600 hover:text-red-800 absans"
                  >
                    हटाउनुहोस्
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                    व्यापार प्रकार (Business Type) *
                  </label>
                  <select
                    value={business.businessType}
                    onChange={(e) => updateBusinessField(index, 'businessType', e.target.value)}
                    className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                      errors.currentTransactions?.[index]?.businessType ? 'border-red-300' : business.businessType ? 'border-orange-400' : 'border-gray-300'
                    }`}
                  >
                    <option value="">व्यापार प्रकार छान्नुहोस्</option>
                    <option value="wholesale">थोक (Wholesale)</option>
                    <option value="retail">खुद्रा (Retail)</option>
                  </select>
                  {errors.currentTransactions?.[index]?.businessType && (
                    <p className="text-red-500 text-sm mt-1">{errors.currentTransactions[index].businessType.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                    उत्पादन वा कम्पनीको नाम (Product or Company Name) *
                  </label>
                  <input
                    type="text"
                    value={business.productName}
                    onChange={(e) => updateBusinessField(index, 'productName', e.target.value)}
                    className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                      errors.currentTransactions?.[index]?.productName ? 'border-red-300' : business.productName ? 'border-orange-400' : 'border-gray-300'
                    }`}
                    placeholder="उत्पादन वा कम्पनीको नाम लेख्नुहोस्"
                  />
                  {errors.currentTransactions?.[index]?.productName && (
                    <p className="text-red-500 text-sm mt-1">{errors.currentTransactions[index].productName.message}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                    वार्षिक आय (Yearly Turnover) *
                  </label>
                  <select
                    value={business.turnover}
                    onChange={(e) => updateBusinessField(index, 'turnover', e.target.value)}
                    className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                      errors.currentTransactions?.[index]?.turnover ? 'border-red-300' : business.turnover ? 'border-orange-400' : 'border-gray-300'
                    }`}
                  >
                    <option value="">वार्षिक आय छान्नुहोस्</option>
                    <option value="0-100k">Rs. ०-१,००,०००</option>
                    <option value="100k-500k">Rs. १,००,०००-५,००,०००</option>
                    <option value="500k-1m">Rs. ५,००,०००-१०,००,०००</option>
                    <option value="1m+">Rs. १०,००,०००+</option>
                  </select>
                  {errors.currentTransactions?.[index]?.turnover && (
                    <p className="text-red-500 text-sm mt-1">{errors.currentTransactions[index].turnover.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                    व्यापार अनुभव (Business Experience) *
                  </label>
                  <select
                    value={business.experience}
                    onChange={(e) => updateBusinessField(index, 'experience', e.target.value)}
                    className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                      errors.currentTransactions?.[index]?.experience ? 'border-red-300' : business.experience ? 'border-orange-400' : 'border-gray-300'
                    }`}
                  >
                    <option value="">व्यापार अनुभव छान्नुहोस्</option>
                    <option value="0-1year">०-१ बर्ष</option>
                    <option value="1-3years">१-३ बर्ष</option>
                    <option value="3-5years">३-५ बर्ष</option>
                    <option value="5+years">५+ बर्ष</option>
                  </select>
                  {errors.currentTransactions?.[index]?.experience && (
                    <p className="text-red-500 text-sm mt-1">{errors.currentTransactions[index].experience.message}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addBusiness}
            className="w-full py-3 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF8A5B] font-medium absans"
          >
            + अर्को व्यापार थप्नुहोस्
          </button>
        </div>
        
      
      </div>
    </div>
  );
};