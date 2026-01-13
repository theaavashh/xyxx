import * as yup from 'yup';
import { FormData } from '../types/formTypes';

export const formValidationSchema = yup.object().shape({
  // Step 1: Business Type Selection
  businessStructure: yup.string()
    .required('व्यापार प्रकार आवश्यक छ')
    .oneOf(['individual', 'partnership'], 'कृपया वैध व्यापार प्रकार छन्नुहोस्'),
  contactNumber: yup.string()
    .required('सम्पर्क नम्बर आवश्यक छ')
    .matches(/^[0-9]+$/, 'सम्पर्क नम्बरमा केवल अंकहरू हुनुपर्छ')
    .length(10, 'सम्पर्क नम्बर ठ्याक्कै १० अंकको हुनुपर्छ')
    .matches(/^9/, 'सम्पर्क नम्बर ९ ले सुरु हुनुपर्छ'),
    
  // Step 2: Personal Details
  fullName: yup.string()
    .required('पूरा नाम आवश्यक छ')
    .matches(/^[a-zA-Z\s\u0900-\u097F]+$/, 'नाममा संख्या हुनु हुँदैन'),
  age: yup.string().required('उमेर आवश्यक छ'),
  gender: yup.string().required('लिङ्ग आवश्यक छ'),
  citizenshipNumber: yup
    .string()
    .required('नागरिकता नम्बर आवश्यक छ')
    .matches(/^[0-9\-\/]+$/, 'नागरिकता नम्बरमा केवल अंक, - र / हुनुपर्छ')
    .test('min-digits', 'नागरिकता नम्बर कम्तिमा ४ अंकको हुनुपर्छ', function(value) {
      if (!value) return false;
      const digitsOnly = value.replace(/[^0-9]/g, '');
      return digitsOnly.length >= 4;
    }),
  issuedDistrict: yup.string().required('जारी जिल्ला आवश्यक छ'),
  email: yup.string().email('मान्य इमेल चाहिन्छ'),
  permanentAddress: yup.string(),
  temporaryAddress: yup.string(),
  citizenshipFrontFile: yup.mixed().required('अगाडिल्लो भाग अपलोड गर्नुहोस्'),
  citizenshipBackFile: yup.mixed().required('पछाडिल्लो भाग अपलोड गर्नुहोस्'),

  // Step 3: Business Details
  companyName: yup
    .string()
    .required('कम्पनीको नाम आवश्यक छ')
    .matches(/^[a-zA-Z\s\u0900-\u097F]+$/, 'कम्पनीको नाममा केवल अक्षरहरू हुनुपर्छ'),
  registrationNumber: yup
    .string()
    .required('दर्ता नम्बर आवश्यक छ')
    .matches(/^[0-9\-\/]+$/, 'दर्ता नम्बरमा केवल अंक, - र / हुनुपर्छ'),
  panVatNumber: yup
    .string()
    .required('PAN/VAT नम्बर आवश्यक छ')
    .matches(/^[0-9\-\/]+$/, 'PAN/VAT नम्बरमा केवल अंक, - र / हुनुपर्छ'),
  officeAddress: yup
    .string()
    .required('कार्यालयको ठेगाना आवश्यक छ')
    .matches(/^[a-zA-Z\u0900-\u097F]/, 'कार्यालयको ठेगाना अक्षरले सुरु हुनुपर्छ'),
  workAreaProvince: yup.string().required('काम गर्ने प्रदेश आवश्यक छ'),
  workAreaDistrict: yup.string().required('काम गर्ने क्षेत्र/जिल्ला आवश्यक छ'),
  workArea: yup.string().required('काम गर्ने क्षेत्र आवश्यक छ'),
  desiredDistributionArea: yup
    .string()
    .required('वितरक बन्न चाहने क्षेत्र आवश्यक छ')
    .matches(/^[a-zA-Z\u0900-\u097F]/, 'वितरक बन्न चाहने क्षेत्र अक्षरले सुरु हुनुपर्छ'),
  
  // Document uploads for step 3
  panDocument: yup.mixed().required('PAN प्रमाणपत्र अपलोड गर्नुहोस्'),
  registrationDocument: yup.mixed().required('कम्पनी दर्ता प्रमाणपत्र अपलोड गर्नुहोस्'),

  // Step 4: Staff and Infrastructure
  selectedStaffType: yup.string().required('कर्मचारी प्रकार आवश्यक छ'),
  staffQuantity: yup.number().positive('कर्मचारी संख्या धनात्मक हुनुपर्छ').default(0),
  selectedInfrastructureType: yup.string().required('पूर्वाधार प्रकार आवश्यक छ'),
  infrastructureQuantity: yup.number().positive('पूर्वाधार मात्रा धनात्मक हुनुपर्छ').default(0),

  // Step 5: Business Information and Products
  currentTransactions: yup.array().of(
    yup.object().shape({
      id: yup.string().required(),
      businessType: yup.string().required('व्यापार प्रकार आवश्यक छ'),
      productName: yup.string().required('उत्पादन वा कम्पनीको नाम आवश्यक छ'),
      turnover: yup.string().required('वार्षिक आय आवश्यक छ'),
      experience: yup.string().required('व्यापार अनुभव आवश्यक छ'),
    })
  ).min(1, 'कम्तिमा एउटा व्यापार विवरण थप्नुहोस्').required('हालको व्यापार विवरण आवश्यक छ'),
  businessType: yup.string(),
  turnover: yup.string(),
  
  // Step 6: Partnership Details
  productCategory: yup.string(),
  businessExperience: yup.string(),
  monthlyIncome: yup.string(),
  storageFacility: yup.string(),
  paymentPreference: yup.string(),
  creditDays: yup.number().default(0),
  deliveryPreference: yup.string(),

  // Partnership Details (step 6)
  partnerFullName: yup
    .string()
    .when('businessStructure', {
      is: (val: string) => val === 'partnership',
      then: (schema) => schema,
      otherwise: (schema) => schema
    }),
  partnerAge: yup
    .string()
    .when(['businessStructure', 'partnerFullName'], {
      is: (structure: string, name: string) => structure === 'partnership' && name && name.length > 0,
      then: (schema) => schema
        .required('साझेदारको उमेर आवश्यक छ'),
      otherwise: (schema) => schema
    }),
  partnerGender: yup
    .string()
    .when(['businessStructure', 'partnerFullName'], {
      is: (structure: string, name: string) => structure === 'partnership' && name && name.length > 0,
      then: (schema) => schema,
      otherwise: (schema) => schema
    }),
  partnerCitizenshipNumber: yup
    .string()
    .when(['businessStructure', 'partnerFullName'], {
      is: (structure: string, name: string) => structure === 'partnership' && name && name.length > 0,
      then: (schema) => schema
        .required('साझेदारको नागरिकता नम्बर आवश्यक छ')
        .matches(/^[0-9\-\/]+$/, 'साझेदारको नागरिकता नम्बरमा केवल अंक, - र / हुनुपर्छ')
        .test('min-digits', 'साझेदारको नागरिकता नम्बर कम्तिमा ४ अंकको हुनुपर्छ', function(value) {
          if (!value) return false;
          const digitsOnly = value.replace(/[^0-9]/g, '');
          return digitsOnly.length >= 4;
        }),
      otherwise: (schema) => schema
    }),
  partnerIssuedDistrict: yup
    .string()
    .when(['businessStructure', 'partnerFullName'], {
      is: (structure: string, name: string) => structure === 'partnership' && name && name.length > 0,
      then: (schema) => schema,
      otherwise: (schema) => schema
    }),
  partnerMobileNumber: yup
    .string()
    .when(['businessStructure', 'partnerFullName'], {
      is: (structure: string, name: string) => structure === 'partnership' && name && name.length > 0,
      then: (schema) => schema
        .required('साझेदारको मोबाइल नम्बर आवश्यक छ')
        .matches(/^[0-9]+$/, 'मोबाइल नम्बरमा केवल अंकहरू हुनुपर्छ')
        .length(10, 'मोबाइल नम्बर ठ्याक्कै १० अंकको हुनुपर्छ')
        .matches(/^9/, 'मोबाइल नम्बर ९ ले सुरु हुनुपर्छ'),
      otherwise: (schema) => schema
    }),
  partnerEmail: yup
    .string()
    .email()
    .when(['businessStructure', 'partnerFullName'], {
      is: (structure: string, name: string) => structure === 'partnership' && name && name.length > 0,
      then: (schema) => schema,
      otherwise: (schema) => schema
    }),
  partnerPermanentAddress: yup
    .string()
    .when(['businessStructure', 'partnerFullName'], {
      is: (structure: string, name: string) => structure === 'partnership' && name && name.length > 0,
      then: (schema) => schema,
      otherwise: (schema) => schema
    }),
  partnerTemporaryAddress: yup
    .string()
    .when(['businessStructure', 'partnerFullName'], {
      is: (structure: string, name: string) => structure === 'partnership' && name && name.length > 0,
      then: (schema) => schema,
      otherwise: (schema) => schema
    }),

  // Step 7: Additional Information
  additionalInfo: yup.string(),
  additionalInfo2: yup.string(),
  additionalInfo3: yup.string(),

  // Optional document fields
  citizenshipCertificate: yup.boolean(),
  citizenshipFile: yup.mixed(),
  companyRegistration: yup.boolean(),
  companyRegistrationFile: yup.mixed(),
  panVat: yup.boolean(),
  panVatFile: yup.mixed(),
  officePhoto: yup.boolean(),
  officePhotoFile: yup.mixed(),
  otherDocuments: yup.boolean(),
  otherDocumentsFile: yup.mixed(),

  // Step 8: Agreement and signature
  agreementAccepted: yup.boolean().oneOf([true], "कृपया सम्झौतालाई स्वीकार गर्नुहोस्"),
  distributorSignatureName: yup.string(),
  distributorSignatureDate: yup.string(),
});