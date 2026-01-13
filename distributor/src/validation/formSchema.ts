// Validation functions for React Hook Form
export const validateBusinessStructure = (value: string) => {
  if (!value) return 'व्यापार प्रकार आवश्यक छ';
  if (!['individual', 'partnership'].includes(value)) return 'कृपया वैध व्यापार प्रकार छन्नुहोस्';
  return true;
};

export const validateContactNumber = (value: string) => {
  if (!value) return 'सम्पर्क नम्बर आवश्यक छ';
  if (!/^[0-9]+$/.test(value)) return 'सम्पर्क नम्बरमा केवल अंकहरू हुनुपर्छ';
  if (value.length !== 10) return 'सम्पर्क नम्बर ठ्याक्कै १० अंकको हुनुपर्छ';
  if (!/^9/.test(value)) return 'सम्पर्क नम्बर ९ ले सुरु हुनुपर्छ';
  return true;
};

export const validateFullName = (value: string) => {
  if (!value) return 'पूरा नाम आवश्यक छ';
  if (!/^[a-zA-Z\s\u0900-\u097F]+$/.test(value)) return 'नाममा संख्या हुनु हुँदैन';
  return true;
};

export const validateAge = (value: string) => {
  if (!value) return 'उमेर आवश्यक छ';
  return true;
};

export const validateGender = (value: string) => {
  if (!value) return 'लिङ्ग आवश्यक छ';
  return true;
};

export const validateCitizenshipNumber = (value: string) => {
  if (!value) return 'नागरिकता नम्बर आवश्यक छ';
  if (!/^[0-9\-\/]+$/.test(value)) return 'नागरिकता नम्बरमा केवल अंक, - र / हुनुपर्छ';
  const digitsOnly = value.replace(/[^0-9]/g, '');
  if (digitsOnly.length < 4) return 'नागरिकता नम्बर कम्तिमा ४ अंकको हुनुपर्छ';
  return true;
};

export const validateIssuedDistrict = (value: string) => {
  if (!value) return 'जारी जिल्ला आवश्यक छ';
  return true;
};

export const validateEmail = (value: string) => {
  if (!value) return 'इमेल आवश्यक छ';
  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) return 'मान्य इमेल चाहिन्छ';
  return true;
};

export const validateCompanyName = (value: string) => {
  if (!value) return 'कम्पनीको नाम आवश्यक छ';
  if (!/^[a-zA-Z\s\u0900-\u097F]+$/.test(value)) return 'कम्पनीको नाममा केवल अक्षरहरू हुनुपर्छ';
  return true;
};

export const validateRegistrationNumber = (value: string) => {
  if (!value) return 'दर्ता नम्बर आवश्यक छ';
  if (!/^[0-9\-\/]+$/.test(value)) return 'दर्ता नम्बरमा केवल अंक, - र / हुनुपर्छ';
  return true;
};

export const validatePanVatNumber = (value: string) => {
  if (!value) return 'PAN/VAT नम्बर आवश्यक छ';
  if (!/^[0-9\-\/]+$/.test(value)) return 'PAN/VAT नम्बरमा केवल अंक, - र / हुनुपर्छ';
  return true;
};

export const validateOfficeAddress = (value: string) => {
  if (!value) return 'कार्यालयको ठेगाना आवश्यक छ';
  if (!/^[a-zA-Z\u0900-\u097F]/.test(value)) return 'कार्यालयको ठेगाना अक्षरले सुरु हुनुपर्छ';
  return true;
};

export const validateWorkAreaProvince = (value: string) => {
  if (!value) return 'काम गर्ने प्रदेश आवश्यक छ';
  return true;
};

export const validateWorkAreaDistrict = (value: string) => {
  if (!value) return 'काम गर्ने क्षेत्र/जिल्ला आवश्यक छ';
  return true;
};

export const validateWorkArea = (value: string) => {
  if (!value) return 'काम गर्ने क्षेत्र आवश्यक छ';
  return true;
};

export const validateDesiredDistributionArea = (value: string) => {
  if (!value) return 'वितरक बन्न चाहने क्षेत्र आवश्यक छ';
  if (!/^[a-zA-Z\u0900-\u097F]/.test(value)) return 'वितरक बन्न चाहने क्षेत्र अक्षरले सुरु हुनुपर्छ';
  return true;
};

export const validatePartnerAge = (value: string, isPartnerPresent: boolean) => {
  if (isPartnerPresent && !value) return 'साझेदारको उमेर आवश्यक छ';
  return true;
};

export const validatePartnerCitizenshipNumber = (value: string, isPartnerPresent: boolean) => {
  if (isPartnerPresent && !value) return 'साझेदारको नागरिकता नम्बर आवश्यक छ';
  if (isPartnerPresent && !/^[0-9\-\/]+$/.test(value)) return 'साझेदारको नागरिकता नम्बरमा केवल अंक, - र / हुनुपर्छ';
  if (isPartnerPresent) {
    const digitsOnly = value.replace(/[^0-9]/g, '');
    if (digitsOnly.length < 4) return 'साझेदारको नागरिकता नम्बर कम्तिमा ४ अंकको हुनुपर्छ';
  }
  return true;
};

export const validatePartnerMobileNumber = (value: string, isPartnerPresent: boolean) => {
  if (isPartnerPresent && !value) return 'साझेदारको मोबाइल नम्बर आवश्यक छ';
  if (isPartnerPresent && !/^[0-9]+$/.test(value)) return 'मोबाइल नम्बरमा केवल अंकहरू हुनुपर्छ';
  if (isPartnerPresent && value.length !== 10) return 'मोबाइल नम्बर ठ्याक्कै १० अंकको हुनुपर्छ';
  if (isPartnerPresent && !/^9/.test(value)) return 'मोबाइल नम्बर ९ ले सुरु हुनुपर्छ';
  return true;
};

export const validateCitizenshipFile = (value: File | null) => {
  if (!value) return 'नागरिकता प्रमाणपत्र आवश्यक छ';
  return true;
};

export const validateCompanyRegistrationFile = (value: File | null) => {
  if (!value) return 'कम्पनी दर्ता प्रमाणपत्र आवश्यक छ';
  return true;
};

export const validatePanVatFile = (value: File | null) => {
  if (!value) return 'PAN/VAT प्रमाणपत्र आवश्यक छ';
  return true;
};

export const validateAgreementAccepted = (value: boolean) => {
  if (!value) return 'सहमति स्वीकार गर्नुहोस्';
  return true;
};