import { Controller, Control, FieldErrors } from 'react-hook-form';
import { FormData } from '@/types/formTypes';

interface StaffInfrastructureStepProps {
  control: Control<FormData>;
  errors: FieldErrors<FormData>;
}

export const StaffInfrastructureStep = ({ control, errors }: StaffInfrastructureStepProps) => {
  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-[#001011] mb-6 absans">४. कर्मचारी र पूर्वाधार (Staff & Infrastructure)</h3>
      
      {/* Staff Section */}
      <div className="space-y-6">
        <h4 className="text-lg font-semibold text-[#001011] absans">कर्मचारी विवरण (Staff Details)</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-[#001011] mb-2 absans">
              कर्मचारी प्रकार (Staff Type)
            </label>
            <Controller
              name="selectedStaffType"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                    errors.selectedStaffType ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                  }`}
                >
                  <option value="">कर्मचारी प्रकार छान्नुहोस्</option>
                  <option value="full-time">पूरा समय (Full-time)</option>
                  <option value="part-time">आधा समय (Part-time)</option>
                  <option value="contract">ठेक्का (Contract)</option>
                  <option value="temporary">अस्थायी (Temporary)</option>
                </select>
              )}
            />
            {errors.selectedStaffType && (
              <p className="text-red-500 text-sm mt-1">{errors.selectedStaffType.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-bold text-[#001011] mb-2 absans">
              कर्मचारी संख्या (Number of Staff)
            </label>
            <Controller
              name="staffQuantity"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  min="0"
                  className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                    errors.staffQuantity ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                  }`}
                  placeholder="कर्मचारी संख्या लेख्नुहोस्"
                />
              )}
            />
            {errors.staffQuantity && (
              <p className="text-red-500 text-sm mt-1">{errors.staffQuantity.message}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Infrastructure Section */}
      <div className="space-y-6">
        <h4 className="text-lg font-semibold text-[#001011] absans">पूर्वाधार विवरण (Infrastructure Details)</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-[#001011] mb-2 absans">
              पूर्वाधार प्रकार (Infrastructure Type)
            </label>
            <Controller
              name="selectedInfrastructureType"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                    errors.selectedInfrastructureType ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                  }`}
                >
                  <option value="">पूर्वाधार प्रकार छान्नुहोस्</option>
                  <option value="warehouse">गोदाम (Warehouse)</option>
                  <option value="office">कार्यालय (Office)</option>
                  <option value="transport">परिवहन (Transport)</option>
                  <option value="storage">भण्डारण (Storage)</option>
                  <option value="retail">खुद्रा (Retail)</option>
                  <option value="distribution">वितरण केन्द्र (Distribution Center)</option>
                </select>
              )}
            />
            {errors.selectedInfrastructureType && (
              <p className="text-red-500 text-sm mt-1">{errors.selectedInfrastructureType.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-bold text-[#001011] mb-2 absans">
              पूर्वाधार मात्रा (Infrastructure Quantity)
            </label>
            <Controller
              name="infrastructureQuantity"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  min="0"
                  className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                    errors.infrastructureQuantity ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                  }`}
                  placeholder="पूर्वाधार मात्रा लेख्नुहोस्"
                />
              )}
            />
            {errors.infrastructureQuantity && (
              <p className="text-red-500 text-sm mt-1">{errors.infrastructureQuantity.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};