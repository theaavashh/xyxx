'use client';

import React from 'react';
import { Control, FieldErrors } from 'react-hook-form';
import { TextInputField, SelectField, RadioField } from '../shared/FormField';
import { DistributorFormData, NepaliDistrict } from '@/types/application.types';

interface PersonalDetailsStepProps {
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

const genderOptions = [
  { value: 'पुरुष', label: 'पुरुष' },
  { value: 'महिला', label: 'महिला' },
  { value: 'अन्य', label: 'अन्य' }
];

export const PersonalDetailsStep: React.FC<PersonalDetailsStepProps> = ({
  control,
  errors,
  watch
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-[#001011] mb-6 absans">व्यक्तिगत विवरण</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="sm:col-span-2">
          <TextInputField
            control={control}
            errors={errors}
            name="personalDetails.fullName"
            label="पूरा नाम (Full Name)"
            required
            placeholder="तपाईंको पूरा नाम लेख्नुहोस्"
          />
        </div>

        <div>
          <TextInputField
            control={control}
            errors={errors}
            name="personalDetails.age"
            label="उमेर (Age)"
            required
            type="number"
            min={18}
            max={80}
            placeholder="तपाईंको उमेर"
          />
        </div>

        <div>
          <RadioField
            control={control}
            errors={errors}
            name="personalDetails.gender"
            label="लिङ्ग (Gender)"
            required
            options={genderOptions}
          />
        </div>

        <div>
          <TextInputField
            control={control}
            errors={errors}
            name="personalDetails.citizenshipNumber"
            label="नागरिकता नम्बर (Citizenship No)"
            required
            placeholder="नागरिकता नम्बर"
          />
        </div>

        <div>
          <SelectField
            control={control}
            errors={errors}
            name="personalDetails.issuedDistrict"
            label="जारी जिल्ला (Issued District)"
            required
            options={nepalDistricts.map(district => ({ value: district, label: district }))}
            emptyOption="जिल्ला छान्नुहोस्"
          />
        </div>

        <div>
          <TextInputField
            control={control}
            errors={errors}
            name="personalDetails.mobileNumber"
            label="मोबाइल नम्बर (Contact Number)"
            required
            type="tel"
            placeholder="9xxxxxxxxx"
          />
        </div>

        <div>
          <TextInputField
            control={control}
            errors={errors}
            name="personalDetails.email"
            label="इमेल ठेगाना (Email Address)"
            required
            type="email"
            placeholder="example@email.com"
          />
        </div>

        <div className="sm:col-span-2">
          <TextInputField
            control={control}
            errors={errors}
            name="personalDetails.permanentAddress"
            label="स्थायी ठेगाना (Permanent Address)"
            required
            placeholder="स्थायी ठेगाना"
          />
        </div>

        <div className="sm:col-span-2">
          <TextInputField
            control={control}
            errors={errors}
            name="personalDetails.temporaryAddress"
            label="अस्थायी ठेगाना (Temporary Address)"
            placeholder="अस्थायी ठेगाना"
          />
        </div>
      </div>
    </div>
  );
};