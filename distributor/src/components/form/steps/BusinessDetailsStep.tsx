'use client';

import React from 'react';
import { Control, FieldErrors, useFieldArray } from 'react-hook-form';
import { TextInputField, SelectField } from '../shared/FormField';
import { DistributorFormData, NepaliDistrict } from '@/types/application.types';

interface BusinessDetailsStepProps {
  control: Control<DistributorFormData>;
  errors: FieldErrors<DistributorFormData>;
  watch: (name: string) => any;
}

const nepalDistricts: NepaliDistrict[] = [
  'काठमाडौं', 'ललितपुर', 'भक्तपुर', 'नुवाकोट', 'रसुवा', 'धादिङ', 'मकवानपुर', 'सिन्धुली', 'कावरेपलाञ्चोक', 'दोलखा', 'सिन्धुपाल्चोक', 'रामेछाप',
  'चितवन', 'गोरखा', 'लमजुङ', 'तनहुँ', 'स्याङ्जा', 'कास्की', 'मनाङ', 'मुस्ताङ', 'म्याग्दी', 'पर्वत', 'बागलुङ', 'गुल्मी', 'पाल्पा', 'अर्घाखाँची',
  'नवलपरासी (बर्दघाट सुस्ता पूर्व)', 'रुपन्देही', 'कपिलवस्तु', 'दाङ', 'प्यूठान', 'रोल्पा', 'रुकुम (पूर्वी भाग)', 'सल्यान', 'सुर्खेत', 'बाँके', 'बर्दिया',
  'कैलाली', 'कञ्चनपुर', 'डडेल्धुरा', 'बैतडी', 'दार्चुला', 'बाजुरा', 'अछाम', 'डोटी', 'कालीकोट', 'जुम्ला', 'हुम्ला', 'कर्णाली', 'डोल्पा', 'मुगु',
  'सुदूरपश्चिम', 'झापा', 'इलाम', 'पाँचथर', 'ताप्लेजुङ', 'संखुवासभा', 'तेह्रथुम', 'धनकुटा', 'भोजपुर', 'सोलुखुम्बु', 'ओखलढुङ्गा', 'खोटाङ', 'उदयपुर',
  'सप्तरी', 'सिराहा', 'धनुषा', 'महोत्तरी', 'सर्लाही', 'बारा', 'पर्सा', 'रौतहट', 'मोरङ', 'सुनसरी'
];

export const BusinessDetailsStep: React.FC<BusinessDetailsStepProps> = ({
  control,
  errors,
  watch
}) => {
  const { fields: transactionFields, append: appendTransaction, remove: removeTransaction } = useFieldArray({
    control,
    name: 'currentTransactions'
  });

  const addTransaction = () => {
    appendTransaction({
      company: '',
      products: '',
      turnover: ''
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-[#001011] mb-6 absans">व्यापारिक विवरण</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          <TextInputField
            control={control}
            errors={errors}
            name="businessDetails.companyName"
            label="कम्पनीको नाम"
            required
            placeholder="कम्पनीको नाम"
          />

          <TextInputField
            control={control}
            errors={errors}
            name="businessDetails.registrationNumber"
            label="दर्ता नम्बर/रजिस्ट्रेशन नम्बर"
            required
            placeholder="दर्ता नम्बर"
          />

          <TextInputField
            control={control}
            errors={errors}
            name="businessDetails.panVatNumber"
            label="PAN/VAT नम्बर"
            required
            placeholder="PAN/VAT नम्बर"
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <TextInputField
            control={control}
            errors={errors}
            name="businessDetails.officeAddress"
            label="कार्यालयको ठेगाना"
            required
            placeholder="कार्यालयको ठेगाना"
          />

          <SelectField
            control={control}
            errors={errors}
            name="businessDetails.workAreaDistrict"
            label="काम गर्ने क्षेत्र/जिल्ला"
            required
            options={nepalDistricts.map(district => ({ value: district, label: district }))}
            emptyOption="जिल्ला छान्नुहोस्"
          />

          <TextInputField
            control={control}
            errors={errors}
            name="businessDetails.desiredDistributionArea"
            label="वितरक बन्न चाहने क्षेत्र"
            required
            placeholder="वितरक बन्न चाहने क्षेत्र"
          />
        </div>
      </div>

      {/* Current Business Section - Full Width */}
      <div className="mt-8">
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-[#001011] absans">हालको व्यापारको विवरण</h4>
          <p className="text-sm text-[#001011] absans">
            कृपया तलका विवरणहरू लेख्नुहोस्: व्यापारको प्रकार, बेच्ने उत्पादनहरू, र वार्षिक टर्नओभर (Please provide: Business type, Products you sell, and Annual turnover)
          </p>
          
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <TextInputField
                  control={control}
                  errors={errors}
                  name="businessDetails.currentBusiness"
                  label="व्यापारको प्रकार (Business type)"
                  required
                  placeholder="जस्तै: खुद्रा व्यापार"
                  className="text-sm"
                />
              </div>
              
              <div>
                <TextInputField
                  control={control}
                  errors={errors}
                  name="businessDetails.businessType"
                  label="बिक्री गरिने उत्पादनहरू (Products sold)"
                  required
                  placeholder="जस्तै: खाद्य वस्तु, कपडा"
                  className="text-sm"
                />
              </div>
              
              <div>
                <TextInputField
                  control={control}
                  errors={errors}
                  name="businessDetails.currentBusiness"
                  label="वार्षिक टर्नओभर (Annual turnover)"
                  required
                  placeholder="जस्तै: ५० लाख रुपैयाँ"
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Transactions Dynamic Section */}
      <div className="mt-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold text-[#001011] absans">वर्तमान कारोबार (Current Transactions)</h4>
            <button
              type="button"
              onClick={addTransaction}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm absans"
            >
              + थप्नुहोस्
            </button>
          </div>
          
          {transactionFields.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500 absans">कुनै वर्तमान कारोबार थपिएको छैन</p>
              <p className="text-sm text-gray-400 mt-2 absans">माथिको "थप्नुहोस्" बटन क्लिक गरी थप्नुहोस्</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactionFields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <TextInputField
                        control={control}
                        errors={errors}
                        name={`currentTransactions.${index}.company`}
                        label="कम्पनी"
                        placeholder="कम्पनीको नाम"
                        className="text-sm"
                      />
                    </div>
                    
                    <div>
                      <TextInputField
                        control={control}
                        errors={errors}
                        name={`currentTransactions.${index}.products`}
                        label="उत्पादनहरू"
                        placeholder="बेच्ने उत्पादनहरू"
                        className="text-sm"
                      />
                    </div>
                    
                    <div>
                      <TextInputField
                        control={control}
                        errors={errors}
                        name={`currentTransactions.${index}.turnover`}
                        label="टर्नओभर"
                        placeholder="वार्षिक टर्नओभर"
                        className="text-sm"
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeTransaction(index)}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm absans"
                      >
                        हटाउनुहोस्
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};