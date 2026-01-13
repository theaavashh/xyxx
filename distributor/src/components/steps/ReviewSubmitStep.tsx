import { Control, FieldErrors } from 'react-hook-form';
import { FormData, CurrentBusiness } from '@/types/formTypes';

interface ReviewSubmitStepProps {
  control: Control<FormData>;
  errors: FieldErrors<FormData>;
  watch: (fieldNames?: any) => FormData; // Using any for watch as it's complex to type
}

export const ReviewSubmitStep = ({ control, errors, watch }: ReviewSubmitStepProps) => {
  // Get form data using watch
  const formData = watch();

  return (
    <div className="text-center py-12">
      <h3 className="text-xl font-semibold text-black mb-4 absans">९. समीक्षा र पेश गर्नुहोस् (Review & Submit)</h3>
      <div className="text-left max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-black absans mb-3">१. व्यापार प्रकार र सम्पर्क विवरण</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="border-b pb-2">
              <span className="font-medium text-gray-600 absans">व्यापार प्रकार:</span>
              <span className="ml-2 text-black absans">{formData.businessStructure === 'individual' ? 'व्यक्तिगत' : 'साझेदारी'}</span>
            </div>
            <div className="border-b pb-2">
              <span className="font-medium text-gray-600 absans">सम्पर्क नम्बर:</span>
              <span className="ml-2 text-black absans">{formData.contactNumber}</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-lg font-semibold text-black absans mb-3">२. व्यक्तिगत विवरण</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="border-b pb-2">
              <span className="font-medium text-gray-600 absans">नाम:</span>
              <span className="ml-2 text-black absans">{formData.fullName}</span>
            </div>
            <div className="border-b pb-2">
              <span className="font-medium text-gray-600 absans">उमेर:</span>
              <span className="ml-2 text-black absans">{formData.age}</span>
            </div>
            <div className="border-b pb-2">
              <span className="font-medium text-gray-600 absans">लिङ्ग:</span>
              <span className="ml-2 text-black absans">{formData.gender}</span>
            </div>
            <div className="border-b pb-2">
              <span className="font-medium text-gray-600 absans">नागरिकता नम्बर:</span>
              <span className="ml-2 text-black absans">{formData.citizenshipNumber}</span>
            </div>
            <div className="border-b pb-2">
              <span className="font-medium text-gray-600 absans">जारी जिल्ला:</span>
              <span className="ml-2 text-black absans">{formData.issuedDistrict}</span>
            </div>
            <div className="border-b pb-2">
              <span className="font-medium text-gray-600 absans">ईमेल:</span>
              <span className="ml-2 text-black absans">{formData.email}</span>
            </div>
          </div>
          
          {/* Document Previews */}
          <div className="mt-6">
            <h5 className="text-md font-semibold text-black absans mb-3">अपलोड गरिएका कागजातहरू</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-3">
                <p className="text-xs font-medium text-gray-600 absans mb-2">नागरिकता अगाडिल्लो भाग</p>
                {formData.citizenshipFrontFile && (
                  <div className="flex items-center">
                    <img 
                      src={URL.createObjectURL(formData.citizenshipFrontFile as unknown as Blob)} 
                      alt="Citizenship Front Preview" 
                      className="w-16 h-16 object-cover rounded border"
                    />
                  </div>
                )}
                {!formData.citizenshipFrontFile && (
                  <p className="text-xs text-black">कागजात अपलोड गरिएको छैन</p>
                )}
              </div>
              
              <div className="border rounded-lg p-3">
                <p className="text-xs font-medium text-gray-600 absans mb-2">नागरिकता पछाडिल्लो भाग</p>
                {formData.citizenshipBackFile && (
                  <div className="flex items-center">
                    <img 
                      src={URL.createObjectURL(formData.citizenshipBackFile as unknown as Blob)} 
                      alt="Citizenship Back Preview" 
                      className="w-16 h-16 object-cover rounded border"
                    />
                  </div>
                )}
                {!formData.citizenshipBackFile && (
                  <p className="text-xs text-black">कागजात अपलोड गरिएको छैन</p>
                )}
              </div>
              
              <div className="border rounded-lg p-3">
                <p className="text-xs font-medium text-gray-600 absans mb-2">PAN प्रमाणपत्र</p>
                {formData.panDocument && (
                  <div className="flex items-center">
                    <img 
                      src={URL.createObjectURL(formData.panDocument as unknown as Blob)} 
                      alt="PAN Document Preview" 
                      className="w-16 h-16 object-cover rounded border"
                    />
                  </div>
                )}
                {!formData.panDocument && (
                  <p className="text-xs text-black">कागजात अपलोड गरिएको छैन</p>
                )}
              </div>
              
              <div className="border rounded-lg p-3">
                <p className="text-xs font-medium text-gray-600 absans mb-2">दर्ता प्रमाणपत्र</p>
                {formData.registrationDocument && (
                  <div className="flex items-center">
                    <img 
                      src={URL.createObjectURL(formData.registrationDocument as unknown as Blob)} 
                      alt="Registration Document Preview" 
                      className="w-16 h-16 object-cover rounded border"
                    />
                  </div>
                )}
                {!formData.registrationDocument && (
                  <p className="text-xs text-black">कागजात अपलोड गरिएको छैन</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-lg font-semibold text-black absans mb-3">३. व्यापार विवरण</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="border-b pb-2">
              <span className="font-medium text-gray-600 absans">कम्पनीको नाम:</span>
              <span className="ml-2 text-black absans">{formData.companyName}</span>
            </div>
            <div className="border-b pb-2">
              <span className="font-medium text-gray-600 absans">दर्ता नम्बर:</span>
              <span className="ml-2 text-black absans">{formData.registrationNumber}</span>
            </div>
            <div className="border-b pb-2">
              <span className="font-medium text-gray-600 absans">PAN/VAT नम्बर:</span>
              <span className="ml-2 text-black absans">{formData.panVatNumber}</span>
            </div>
            <div className="border-b pb-2">
              <span className="font-medium text-gray-600 absans">कार्यालयको ठेगाना:</span>
              <span className="ml-2 text-black absans">{formData.officeAddress}</span>
            </div>
            <div className="border-b pb-2">
              <span className="font-medium text-gray-600 absans">काम गर्ने प्रदेश:</span>
              <span className="ml-2 text-black absans">{formData.workAreaProvince}</span>
            </div>
            <div className="border-b pb-2">
              <span className="font-medium text-gray-600 absans">काम गर्ने क्षेत्र/जिल्ला:</span>
              <span className="ml-2 text-black absans">{formData.workAreaDistrict}</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-lg font-semibold text-black absans mb-3">४. कर्मचारी र बुनियादी ढांचा</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="border-b pb-2">
              <span className="font-medium text-gray-600 absans">कर्मचारी प्रकार:</span>
              <span className="ml-2 text-black absans">{formData.selectedStaffType}</span>
            </div>
            <div className="border-b pb-2">
              <span className="font-medium text-gray-600 absans">कर्मचारी संख्या:</span>
              <span className="ml-2 text-black absans">{formData.staffQuantity}</span>
            </div>
            <div className="border-b pb-2">
              <span className="font-medium text-gray-600 absans">ढांचा प्रकार:</span>
              <span className="ml-2 text-black absans">{formData.selectedInfrastructureType}</span>
            </div>
            <div className="border-b pb-2">
              <span className="font-medium text-gray-600 absans">ढांचा मात्रा:</span>
              <span className="ml-2 text-black absans">{formData.infrastructureQuantity}</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-lg font-semibold text-black absans mb-3">५. हालको व्यापार विवरण</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="border-b pb-2">
              <span className="font-medium text-gray-600 absans">व्यापार प्रकार:</span>
              <span className="ml-2 text-black absans">{formData.businessType === 'wholesale' ? 'थोक' : 'खुद्रा'}</span>
            </div>
            <div className="border-b pb-2">
              <span className="font-medium text-gray-600 absans">वार्षिक आय:</span>
              <span className="ml-2 text-black absans">{formData.turnover}</span>
            </div>
            <div className="border-b pb-2">
              <span className="font-medium text-gray-600 absans">व्यापार अनुभव:</span>
              <span className="ml-2 text-black absans">{formData.businessExperience}</span>
            </div>
          </div>
          
          {/* Current Businesses */}
          <div className="mt-4">
            <h5 className="text-md font-semibold text-black absans mb-2">हालका व्यापारहरू</h5>
            {formData.currentTransactions && formData.currentTransactions.length > 0 ? (
              <div className="space-y-3">
                {formData.currentTransactions?.map((business: CurrentBusiness, index: number) => (
                  <div key={business.id} className="border rounded-lg p-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div className="border-b pb-1">
                        <span className="font-medium text-gray-600 absans">व्यापार {index + 1}:</span>
                        <span className="ml-2 text-black absans">{business.businessType === 'wholesale' ? 'थोक' : 'खुद्रा'}</span>
                      </div>
                      <div className="border-b pb-1">
                        <span className="font-medium text-gray-600 absans">उत्पादन/कम्पनी:</span>
                        <span className="ml-2 text-black absans">{business.productName}</span>
                      </div>
                      <div className="border-b pb-1">
                        <span className="font-medium text-gray-600 absans">आय:</span>
                        <span className="ml-2 text-black absans">{business.turnover}</span>
                      </div>
                      <div className="border-b pb-1">
                        <span className="font-medium text-gray-600 absans">अनुभव:</span>
                        <span className="ml-2 text-black absans">{business.experience}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-black absans">कुनै व्यापार विवरण छैन</p>
            )}
          </div>
        </div>

        {formData.businessStructure === 'partnership' && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-black absans mb-3">६. साझेदारी विवरण</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="border-b pb-2">
                <span className="font-medium text-gray-600 absans">साझेदारको पूरा नाम:</span>
                <span className="ml-2 text-black absans">{formData.partnerFullName}</span>
              </div>
              <div className="border-b pb-2">
                <span className="font-medium text-gray-600 absans">साझेदारको उमेर:</span>
                <span className="ml-2 text-black absans">{formData.partnerAge}</span>
              </div>
              <div className="border-b pb-2">
                <span className="font-medium text-gray-600 absans">साझेदारको लिङ्ग:</span>
                <span className="ml-2 text-black absans">{formData.partnerGender}</span>
              </div>
              <div className="border-b pb-2">
                <span className="font-medium text-gray-600 absans">साझेदारको नागरिकता नम्बर:</span>
                <span className="ml-2 text-black absans">{formData.partnerCitizenshipNumber}</span>
              </div>
              <div className="border-b pb-2">
                <span className="font-medium text-gray-600 absans">साझेदारको जारी जिल्ला:</span>
                <span className="ml-2 text-black absans">{formData.partnerIssuedDistrict}</span>
              </div>
              <div className="border-b pb-2">
                <span className="font-medium text-gray-600 absans">साझेदारको मोबाइल नम्बर:</span>
                <span className="ml-2 text-black absans">{formData.partnerMobileNumber}</span>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h4 className="text-lg font-semibold text-black absans mb-3">६/७. उत्पादन र अतिरिक्त जानकारी</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="border-b pb-2">
              <span className="font-medium text-gray-600 absans">उत्पादन श्रेणी:</span>
              <span className="ml-2 text-black absans">{formData.productCategory}</span>
            </div>
            <div className="border-b pb-2">
              <span className="font-medium text-gray-600 absans">व्यापार अनुभव:</span>
              <span className="ml-2 text-black absans">{formData.businessExperience}</span>
            </div>
            <div className="border-b pb-2">
              <span className="font-medium text-gray-600 absans">मासिक आय:</span>
              <span className="ml-2 text-black absans">{formData.monthlyIncome}</span>
            </div>
            <div className="border-b pb-2">
              <span className="font-medium text-gray-600 absans">भण्डारण सुविधा:</span>
              <span className="ml-2 text-black absans">{formData.storageFacility}</span>
            </div>
            <div className="border-b pb-2">
              <span className="font-medium text-gray-600 absans">भुक्तानी प्राथमिकता:</span>
              <span className="ml-2 text-black absans">{formData.paymentPreference}</span>
            </div>
            <div className="border-b pb-2">
              <span className="font-medium text-gray-600 absans">डेलिभरी प्राथमिकता:</span>
              <span className="ml-2 text-black absans">{formData.deliveryPreference}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-black absans">
            कृपया सबै जानकारी सही रहेको निश्चित गर्नुहोस्। यदि सबै ठीक छ भने, "आवेदन पेश गर्नुहोस्" बटनमा क्लिक गर्नुहोस्।
          </p>
        </div>
      </div>
    </div>
  );
};