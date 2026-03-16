import { useState } from 'react';
import { Controller, Control, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { FormData, StaffDetail, InfrastructureDetail } from '@/types/formTypes';

interface StaffInfrastructureStepProps {
  control: Control<FormData>;
  errors: FieldErrors<FormData>;
  setValue: UseFormSetValue<FormData>;
  watch: UseFormWatch<FormData>;
}

export const StaffInfrastructureStep = ({ control, errors, setValue, watch }: StaffInfrastructureStepProps) => {
  const [staffDetails, setStaffDetails] = useState<StaffDetail[]>(watch('staffDetails') || []);
  const [infrastructureDetails, setInfrastructureDetails] = useState<InfrastructureDetail[]>(watch('infrastructureDetails') || []);
  
  const addStaffDetail = () => {
    const newStaff: StaffDetail = {
      id: Date.now().toString(),
      staffType: '',
      quantity: 0
    };
    const updatedStaff = [...staffDetails, newStaff];
    setStaffDetails(updatedStaff);
    setValue('staffDetails', updatedStaff);
  };
  
  const removeStaffDetail = (id: string) => {
    const updatedStaff = staffDetails.filter(staff => staff.id !== id);
    setStaffDetails(updatedStaff);
    setValue('staffDetails', updatedStaff);
  };
  
  const updateStaffDetail = (id: string, field: keyof StaffDetail, value: string | number) => {
    const updatedStaff = staffDetails.map(staff => 
      staff.id === id ? { ...staff, [field]: value } : staff
    );
    setStaffDetails(updatedStaff);
    setValue('staffDetails', updatedStaff);
  };
  
  const addInfrastructureDetail = () => {
    const newInfrastructure: InfrastructureDetail = {
      id: Date.now().toString(),
      infrastructureType: '',
      quantity: 0
    };
    const updatedInfrastructure = [...infrastructureDetails, newInfrastructure];
    setInfrastructureDetails(updatedInfrastructure);
    setValue('infrastructureDetails', updatedInfrastructure);
  };
  
  const removeInfrastructureDetail = (id: string) => {
    const updatedInfrastructure = infrastructureDetails.filter(infra => infra.id !== id);
    setInfrastructureDetails(updatedInfrastructure);
    setValue('infrastructureDetails', updatedInfrastructure);
  };
  
  const updateInfrastructureDetail = (id: string, field: keyof InfrastructureDetail, value: string | number) => {
    const updatedInfrastructure = infrastructureDetails.map(infra => 
      infra.id === id ? { ...infra, [field]: value } : infra
    );
    setInfrastructureDetails(updatedInfrastructure);
    setValue('infrastructureDetails', updatedInfrastructure);
  };

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-[#001011] mb-6 absans">४. कर्मचारी र पूर्वाधार (Staff & Infrastructure)</h3>
      
      {/* Staff Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-semibold text-[#001011] absans">कर्मचारी विवरण (Staff Details)</h4>
          <button
            type="button"
            onClick={addStaffDetail}
            className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF8A5B] text-sm absans"
          >
            + कर्मचारी थप्नुहोस्
          </button>
        </div>
        
        {staffDetails.length === 0 ? (
          <div className="text-center py-8 text-gray-500 absans">
            कुनै कर्मचारी विवरण थपिएको छैन। &quot;+&quot; बटन थिचेर कर्मचारी थप्नुहोस्।
          </div>
        ) : (
          <div className="space-y-4">
            {staffDetails.map((staff, index) => (
              <div key={staff.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-medium text-[#001011] absans">कर्मचारी {index + 1}</h5>
                  <button
                    type="button"
                    onClick={() => removeStaffDetail(staff.id)}
                    className="text-red-500 hover:text-red-700 text-sm absans"
                  >
                    हटाउनुहोस्
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                      कर्मचारी प्रकार (Staff Type)
                    </label>
                    <select
                      value={staff.staffType}
                      onChange={(e) => updateStaffDetail(staff.id, 'staffType', e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] absans border-gray-300"
                    >
                      <option value="">कर्मचारी प्रकार छान्नुहोस्</option>
                      <option value="full-time">पूरा समय (Full-time)</option>
                      <option value="part-time">आधा समय (Part-time)</option>
                      <option value="contract">ठेक्का (Contract)</option>
                      <option value="temporary">अस्थायी (Temporary)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                      कर्मचारी संख्या (Number of Staff)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={staff.quantity}
                      onChange={(e) => updateStaffDetail(staff.id, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] absans border-gray-300"
                      placeholder="कर्मचारी संख्या लेख्नुहोस्"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Infrastructure Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-semibold text-[#001011] absans">पूर्वाधार विवरण (Infrastructure Details)</h4>
          <button
            type="button"
            onClick={addInfrastructureDetail}
            className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF8A5B] text-sm absans"
          >
            + पूर्वाधार थप्नुहोस्
          </button>
        </div>
        
        {infrastructureDetails.length === 0 ? (
          <div className="text-center py-8 text-gray-500 absans">
            कुनै पूर्वाधार विवरण थपिएको छैन। &quot;+&quot; बटन थिचेर पूर्वाधार थप्नुहोस्।
          </div>
        ) : (
          <div className="space-y-4">
            {infrastructureDetails.map((infra, index) => (
              <div key={infra.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-medium text-[#001011] absans">पूर्वाधार {index + 1}</h5>
                  <button
                    type="button"
                    onClick={() => removeInfrastructureDetail(infra.id)}
                    className="text-red-500 hover:text-red-700 text-sm absans"
                  >
                    हटाउनुहोस्
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                      पूर्वाधार प्रकार (Infrastructure Type)
                    </label>
                    <select
                      value={infra.infrastructureType}
                      onChange={(e) => updateInfrastructureDetail(infra.id, 'infrastructureType', e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] absans border-gray-300"
                    >
                      <option value="">पूर्वाधार प्रकार छान्नुहोस्</option>
                      <option value="warehouse">गोदाम (Warehouse)</option>
                      <option value="office">कार्यालय (Office)</option>
                      <option value="transport">परिवहन (Transport)</option>
                      <option value="storage">भण्डारण (Storage)</option>
                      <option value="retail">खुद्रा (Retail)</option>
                      <option value="distribution">वितरण केन्द्र (Distribution Center)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                      पूर्वाधार मात्रा (Infrastructure Quantity)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={infra.quantity}
                      onChange={(e) => updateInfrastructureDetail(infra.id, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] absans border-gray-300"
                      placeholder="पूर्वाधार मात्रा लेख्नुहोस्"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};