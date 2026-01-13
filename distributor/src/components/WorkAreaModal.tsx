import { useState } from 'react';
import { Controller, Control } from 'react-hook-form';
import { FormData } from '@/types/formTypes';
import { nepalProvinces, districtsByProvince } from '@/constants/nepalLocations';

interface WorkAreaModalProps {
  control: Control<FormData>;
  errors: any; // Using any since React Hook Form errors structure is complex
  workAreaProvince: string | undefined;
  workAreaDistrict: string | undefined;
  setWorkAreaProvince: (province: string) => void;
  setWorkAreaDistrict: (district: string) => void;
  setShowModal: (show: boolean) => void;
  isModalOpen: boolean;
}

export const WorkAreaModal = ({
  control,
  errors,
  workAreaProvince,
  workAreaDistrict,
  setWorkAreaProvince,
  setWorkAreaDistrict,
  setShowModal,
  isModalOpen
}: WorkAreaModalProps) => {
  const [selectedProvince, setSelectedProvince] = useState(workAreaProvince || '');
  const [selectedDistrict, setSelectedDistrict] = useState(workAreaDistrict || '');

  const handleProvinceSelect = (province: string) => {
    setSelectedProvince(province);
    setWorkAreaProvince(province);
    setSelectedDistrict(''); // Reset district when province changes
    setWorkAreaDistrict('');
  };

  const handleDistrictSelect = (district: string) => {
    setSelectedDistrict(district);
    setWorkAreaDistrict(district);
    setShowModal(false); // Close modal after district selection
  };

  const handleSave = () => {
    if (selectedProvince && selectedDistrict) {
      setWorkAreaProvince(selectedProvince);
      setWorkAreaDistrict(selectedDistrict);
      setShowModal(false);
    }
  };

  return (
    <>
      {/* Work Area Input Field - Opens Modal */}
      <div
        onClick={() => setShowModal(true)}
        className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
          errors.workAreaProvince || errors.workAreaDistrict ? 'border-red-300' : (workAreaProvince && workAreaDistrict) ? 'border-orange-400' : 'border-gray-300'
        } cursor-pointer`}
      >
        {workAreaProvince && workAreaDistrict 
          ? `${workAreaProvince} - ${workAreaDistrict}`
          : "काम गर्ने क्षेत्र छान्नुहोस् (Select Work Area)"}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-xl max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-[#001011] absans">काम गर्ने क्षेत्र छान्नुहोस्</h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  &times;
                </button>
              </div>
            </div>

            <div className="p-4">
              {/* Province Selection */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-[#001011] mb-3 absans">प्रदेश छान्नुहोस् (Select Province)</h4>
                <div className="grid grid-cols-2 gap-3">
                  {nepalProvinces.map((province) => (
                    <button
                      key={province}
                      type="button"
                      onClick={() => handleProvinceSelect(province)}
                      className={`p-3 rounded-lg border text-center ${
                        selectedProvince === province
                          ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
                          : 'bg-gray-100 text-[#001011] border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      <span className="absans">{province}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* District Selection (only if province is selected) */}
              {selectedProvince && (
                <div>
                  <h4 className="text-md font-semibold text-[#001011] mb-3 absans">जिल्ला छान्नुहोस् (Select District)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {districtsByProvince[selectedProvince]?.map((district: string) => (
                      <button
                        key={district}
                        type="button"
                        onClick={() => handleDistrictSelect(district)}
                        className={`p-3 rounded-lg border text-center ${
                          selectedDistrict === district
                            ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
                            : 'bg-gray-100 text-[#001011] border-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        <span className="absans">{district}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-gray-300 text-[#001011] rounded-lg absans"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!selectedProvince || !selectedDistrict}
                  className={`flex-1 py-3 rounded-lg absans ${
                    selectedProvince && selectedDistrict
                      ? 'bg-[#FF6B35] text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  छान्नुहोस्
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};