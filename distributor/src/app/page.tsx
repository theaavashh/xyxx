'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useRef } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';
import NavigationTabs from '@/components/NavigationTabs';

// Nepali date conversion function
const convertToNepaliDate = (englishDate: Date): string => {
  const nepaliMonths = [
    'बैशाख', 'जेष्ठ', 'आषाढ़', 'श्रावण', 'भाद्र', 'आश्विन',
    'कार्तिक', 'मार्ग', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'
  ];
  
  const nepaliDays = [
    'आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहिबार', 'शुक्रबार', 'शनिबार'
  ];
  
  // Fixed conversion: English 2025 = Bikram Sambat 2082
  // The difference is approximately 57 years, but let's be more precise
  const englishYear = englishDate.getFullYear();
  const nepaliYear = englishYear + 57; // 2025 + 57 = 2082
  
  const month = englishDate.getMonth();
  const day = englishDate.getDate();
  const dayOfWeek = englishDate.getDay();
  
  return `${nepaliYear} ${nepaliMonths[month]} ${day}, ${nepaliDays[dayOfWeek]}`;
};

const getTodayNepaliDate = (): string => {
  return convertToNepaliDate(new Date());
};

// ========== CONTEXT API FOR FORM DATA MANAGEMENT ==========

interface FormContextType {
  allFormData: any;
  updateFormData: (stepData: any) => void;
  clearFormData: () => void;
  getCurrentFormData: () => any;
}

const FormDataContext = createContext<FormContextType | undefined>(undefined);

// Form Data Provider Component
export function FormDataProvider({ children }: { children: ReactNode }) {
  const [allFormData, setAllFormData] = useState<any>({});

  const updateFormData = (stepData: any) => {
    console.log('🔄 CONTEXT: Updating form data with:', stepData);
    setAllFormData(prev => {
      const updated = { ...prev, ...stepData };
      ;
      return updated;
    });
  };

  const clearFormData = () => {
   
    setAllFormData({});
  };

  const getCurrentFormData = () => {
    return allFormData;
  };

  return (
    <FormDataContext.Provider value={{
      allFormData,
      updateFormData,
      clearFormData,
      getCurrentFormData
    }}>
      {children}
    </FormDataContext.Provider>
  );
}

// Custom hook to use form context
export function useFormData() {
  const context = useContext(FormDataContext);
  if (context === undefined) {
    throw new Error('useFormData must be used within a FormDataProvider');
  }
  return context;
}

// ========== FORM VALIDATION SCHEMA ==========
const schema = yup.object().shape({
  // Step 1: Personal Details
  fullName: yup.string()
    .required('पूरा नाम आवश्यक छ')
    .matches(/^[a-zA-Z\s\u0900-\u097F]+$/, 'नाममा संख्या हुनु हुँदैन (Name should not contain numbers)'),
  age: yup.number()
    .typeError('उमेर संख्या हुनुपर्छ (Age should be a number)')
    .required('उमेर आवश्यक छ')
    .min(18, 'कम्तिमा १८ वर्ष हुनुपर्छ')
    .max(80, 'अधिकतम ८० वर्ष हुनुपर्छ (Maximum age should be 80)')
    .integer('उमेर पूर्ण संख्या हुनुपर्छ (Age must be a whole number)'),
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
  mobileNumber: yup
    .string()
    .required('मोबाइल नम्बर आवश्यक छ')
    .matches(/^[0-9]+$/, 'मोबाइल नम्बरमा केवल अंकहरू हुनुपर्छ')
    .length(10, 'मोबाइल नम्बर ठ्याक्कै १० अंकको हुनुपर्छ')
    .matches(/^9/, 'मोबाइल नम्बर ९ ले सुरु हुनुपर्छ'),
  email: yup.string().email('मान्य इमेल चाहिन्छ').required('इमेल ठेगाना आवश्यक छ'),
  permanentAddress: yup.string().required('स्थायी ठेगाना आवश्यक छ'),
  temporaryAddress: yup.string(),

  // Step 2: Business Details
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
  workAreaDistrict: yup.string().required('काम गर्ने क्षेत्र/जिल्ला आवश्यक छ'),
  desiredDistributionArea: yup
    .string()
    .required('वितरक बन्न चाहने क्षेत्र आवश्यक छ')
    .matches(/^[a-zA-Z\u0900-\u097F]/, 'वितरक बन्न चाहने क्षेत्र अक्षरले सुरु हुनुपर्छ'),
  currentBusiness: yup.array().of(
    yup.object().shape({
      businessType: yup.string().required('व्यापारको प्रकार आवश्यक छ'),
      products: yup.string().required('उत्पादनहरू आवश्यक छ'),
      turnover: yup.string().required('टर्नओभर आवश्यक छ')
    })
  ), // Dynamic table for multiple business entries
  businessType: yup.string(),

  // Step 3: Staff and Infrastructure
  salesManCount: yup.number(),
  salesManExperience: yup.string(),
  driverCount: yup.number(),
  driverExperience: yup.string(),
  helperCount: yup.number(),
  helperExperience: yup.string(),
  accountantCount: yup.number(),
  accountantExperience: yup.string(),
  storageSpace: yup.number(),
  storageDetails: yup.string(),
  truckCount: yup.number(),
  truckExperience: yup.string(),
  fourWheelerCount: yup.number(),
  fourWheelerExperience: yup.string(),
  motorcycleCount: yup.number(),
  motorcycleExperience: yup.string(),
  cycleCount: yup.number(),
  cycleExperience: yup.string(),
  thelaCount: yup.number(),
  thelaExperience: yup.string(),

  // Step 4: Business Information and Products
  productCategory: yup.string(),
  businessExperience: yup.string(),
  monthlyIncome: yup.string(),
  storageFacility: yup.string(),
  paymentPreference: yup.string(),
  creditDays: yup.number(),
  deliveryPreference: yup.string(),

  // Partnership Details (optional)
  partnerFullName: yup.string(),
  partnerAge: yup
    .number()
    .when('partnerFullName', {
      is: (val: string) => val && val.length > 0,
      then: (schema) => schema
        .typeError('साझेदारको उमेर संख्या हुनुपर्छ')
        .required('साझेदारको उमेर आवश्यक छ')
        .min(18, 'साझेदारको कम्तिमा १८ वर्ष हुनुपर्छ')
        .max(80, 'साझेदारको अधिकतम ८० वर्ष हुनुपर्छ')
        .integer('साझेदारको उमेर पूर्ण संख्या हुनुपर्छ'),
      otherwise: (schema) => schema
    }),
  partnerGender: yup.string(),
  partnerCitizenshipNumber: yup
    .string()
    .when('partnerFullName', {
      is: (val: string) => val && val.length > 0,
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
  partnerIssuedDistrict: yup.string(),
  partnerMobileNumber: yup
    .string()
    .when('partnerFullName', {
      is: (val: string) => val && val.length > 0,
      then: (schema) => schema
        .required('साझेदारको मोबाइल नम्बर आवश्यक छ')
        .matches(/^[0-9]+$/, 'मोबाइल नम्बरमा केवल अंकहरू हुनुपर्छ')
        .length(10, 'मोबाइल नम्बर ठ्याक्कै १० अंकको हुनुपर्छ')
        .matches(/^9/, 'मोबाइल नम्बर ९ ले सुरु हुनुपर्छ'),
      otherwise: (schema) => schema
    }),
  partnerEmail: yup.string().email(),
  partnerPermanentAddress: yup.string(),
  partnerTemporaryAddress: yup.string(),

  // Step 5: Area Coverage and Additional Information
  additionalInfo: yup.string(),
  additionalInfo2: yup.string(),
  additionalInfo3: yup.string(),

  // Step 6: Document Upload
  citizenshipCertificate: yup.boolean(),
  citizenshipFile: yup.mixed().required("नागरिकता प्रमाणपत्र आवश्यक छ"),
  companyRegistration: yup.boolean(),
  companyRegistrationFile: yup.mixed().required("कम्पनी दर्ता प्रमाणपत्र आवश्यक छ"),
  panVat: yup.boolean(),
  panVatFile: yup.mixed().required("PAN/VAT प्रमाणपत्र आवश्यक छ"),
  officePhoto: yup.boolean(),
  officePhotoFile: yup.mixed(),
  otherDocuments: yup.boolean(),
  otherDocumentsFile: yup.mixed(),

  // Step 7: Agreement and signature
  agreementAccepted: yup.boolean().oneOf([true], "सहमति स्वीकार गर्नुहोस्"),
  distributorSignatureName: yup.string(),
  distributorSignatureDate: yup.string(),
});

// Nepali districts for dropdown
const nepalDistricts = [
  'काठमाडौं', 'ललितपुर', 'भक्तपुर', 'नुवाकोट', 'रसुवा', 'धादिङ', 'मकवानपुर', 'सिन्धुली', 'कावरेपलाञ्चोक', 'दोलखा', 'सिन्धुपाल्चोक', 'रामेछाप',
  'चितवन', 'गोरखा', 'लमजुङ', 'तनहुँ', 'स्याङ्जा', 'कास्की', 'मनाङ', 'मुस्ताङ', 'म्याग्दी', 'पर्वत', 'बागलुङ', 'गुल्मी', 'पाल्पा', 'अर्घाखाँची',
  'नवलपरासी (बर्दघाट सुस्ता पूर्व)', 'रुपन्देही', 'कपिलवस्तु', 'दाङ', 'प्यूठान', 'रोल्पा', 'रुकुम (पूर्वी भाग)', 'सल्यान', 'सुर्खेत', 'बाँके', 'बर्दिया',
  'कैलाली', 'कञ्चनपुर', 'डडेल्धुरा', 'बैतडी', 'दार्चुला', 'बाजुरा', 'अछाम', 'डोटी', 'कालीकोट', 'जुम्ला', 'हुम्ला', 'करणाली', 'डोल्पा', 'मुगु',
  'सुदूरपश्चिम', 'झापा', 'इलाम', 'पाँचथर', 'ताप्लेजुङ', 'संखुवासभा', 'तेह्रथुम', 'धनकुटा', 'भोजपुर', 'सोलुखुम्बु', 'ओखलढुङ्गा', 'खोटाङ', 'उदयपुर',
  'सप्तरी', 'सिराहा', 'धनुषा', 'महोत्तरी', 'सर्लाही', 'बारा', 'पर्सा', 'रौतहट', 'मोरङ', 'सुनसरी'
];

interface FormData {
  // Step 1: Personal Details
  fullName?: string;
  age?: number;
  gender?: string;
  citizenshipNumber?: string;
  issuedDistrict?: string;
  mobileNumber?: string;
  email?: string;
  permanentAddress?: string;
  temporaryAddress?: string;

  // Step 2: Business Details
  companyName?: string;
  registrationNumber?: string;
  panVatNumber?: string;
  officeAddress?: string;
  workAreaDistrict?: string;
  desiredDistributionArea?: string;
  currentBusiness?: string;
  businessType?: string;

  // Step 3: Staff and Infrastructure
  salesManCount?: number;
  salesManExperience?: string;
  driverCount?: number;
  driverExperience?: string;
  helperCount?: number;
  helperExperience?: string;
  accountantCount?: number;
  accountantExperience?: string;
  storageSpace?: number;
  storageDetails?: string;
  truckCount?: number;
  truckExperience?: string;
  fourWheelerCount?: number;
  fourWheelerExperience?: string;
  motorcycleCount?: number;
  motorcycleExperience?: string;
  cycleCount?: number;
  cycleExperience?: string;
  thelaCount?: number;
  thelaExperience?: string;

  // Current transactions
  currentTransactions?: any[];
  currentCompany1?: string;
  currentProducts1?: string;
  currentTurnover1?: string;
  currentCompany2?: string;
  currentProducts2?: string;
  currentTurnover2?: string;
  currentCompany3?: string;
  currentProducts3?: string;
  currentTurnover3?: string;
  currentCompany4?: string;
  currentProducts4?: string;
  currentTurnover4?: string;
  currentCompany5?: string;
  currentProducts5?: string;
  currentTurnover5?: string;

  // Step 4: Business Information
  productCategory?: string;
  businessExperience?: string;
  monthlyIncome?: string;
  storageFacility?: string;
  paymentPreference?: string;
  creditDays?: number;
  deliveryPreference?: string;

  // Products to distribute
  products?: any[];

  // Partnership Details
  partnerFullName?: string;
  partnerAge?: number;
  partnerGender?: string;
  partnerCitizenshipNumber?: string;
  partnerIssuedDistrict?: string;
  partnerMobileNumber?: string;
  partnerEmail?: string;
  partnerPermanentAddress?: string;
  partnerTemporaryAddress?: string;

  // Step 5: Area Coverage
  areaCoverageDetails?: any[];
  areaDescription1?: string;
  populationEstimate1?: string;
  competitorCompany1?: string;
  areaDescription2?: string;
  populationEstimate2?: string;
  competitorCompany2?: string;
  areaDescription3?: string;
  populationEstimate3?: string;
  competitorCompany3?: string;
  areaDescription4?: string;
  populationEstimate4?: string;
  competitorCompany4?: string;

  // Additional Information
  additionalInfo?: string;
  additionalInfo2?: string;
  additionalInfo3?: string;

  // Step 6: Document Upload
  citizenshipCertificate?: boolean;
  citizenshipFile?: File;
  companyRegistration?: boolean;
  companyRegistrationFile?: File;
  panVat?: boolean;
  panVatFile?: File;
  officePhoto?: boolean;
  officePhotoFile?: File;
  otherDocuments?: boolean;
  otherDocumentsFile?: FileList;
  
  // Step 7: Agreement and signature
  agreementAccepted?: boolean;
  distributorSignatureName?: string;
  distributorSignatureDate?: string;
}

const steps = [
  { id: 1, title: 'व्यक्तिगत विवरण', subtitle: 'Personal Details' },
  { id: 2, title: 'व्यापारिक विवरण', subtitle: 'Business Details' },
  { id: 3, title: 'कर्मचारी र पूर्वाधार', subtitle: 'Staff & Infrastructure' },
  { id: 4, title: 'उत्पादन र साझेदारी', subtitle: 'Products & Partnership' },
  { id: 5, title: 'प्रमाणपत्र संलग्न', subtitle: 'Document Upload' },
  { id: 6, title: 'अतिरिक्त जानकारी', subtitle: 'Additional Information' },
  { id: 7, title: 'नियम र सहमति', subtitle: 'Terms & Agreement' },
  { id: 8, title: 'समीक्षा', subtitle: 'Review' },
];

// Main Form Component (wrapped with Context)
function DistributorFormContent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Digital signature state
  const [signature, setSignature] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [categories, setCategories] = useState<Array<{
    id: string, 
    title: string, 
    type: 'category' | 'subcategory',
    parentId?: string | null
  }>>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  
  
  // Use Context API instead of local state
  const { allFormData, updateFormData, getCurrentFormData } = useFormData();

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      console.log('Fetching categories from API...');
      
      // Use the backend API URL
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors', // Explicitly set CORS mode
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data && Array.isArray(data.data)) {
          // Parse categories and create subcategories from description
          const categoriesWithSubcategories = data.data.flatMap(category => {
            const result = [{ 
              id: category.id, 
              title: category.title,
              type: 'category',
              parentId: null
            }];
            
            // Parse description for subcategories
            if (category.description) {
              const subcategories = category.description
                .split(',')
                .map(sub => sub.trim())
                .filter(sub => sub.length > 0)
                .map((sub, index) => ({
                  id: `${category.id}_sub_${index}`,
                  title: sub,
                  type: 'subcategory',
                  parentId: category.id
                }));
              
              result.push(...subcategories);
            }
            
            return result;
          });
          
          setCategories(categoriesWithSubcategories);
        } else {
          console.warn('Invalid data structure:', data);
          setCategories([]);
        }
      } else {
        console.warn('Failed to fetch categories, status:', response.status);
        setCategories([]);
      }
    } catch (error) {
      console.warn('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);


  const { control, handleSubmit, trigger, formState: { errors }, watch, reset, setValue } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    mode: 'onChange',
    defaultValues: {
      // Personal Details
      fullName: '',
      age: 18,
      gender: '',
      citizenshipNumber: '',
      issuedDistrict: '',
      mobileNumber: '',
      email: '',
      permanentAddress: '',
      temporaryAddress: '',
      
      // Business Details
      companyName: '',
      registrationNumber: '',
      panVatNumber: '',
      officeAddress: '',
      workAreaDistrict: '',
      desiredDistributionArea: '',
      
      // Staff & Infrastructure
      salesManCount: 0,
      salesManExperience: '',
      deliveryStaffCount: 0,
      deliveryStaffExperience: '',
      accountAssistantCount: 0,
      accountAssistantExperience: '',
      otherStaffCount: 0,
      otherStaffExperience: '',
      warehouseSpace: 0,
      warehouseDetails: '',
      truckCount: 0,
      truckDetails: '',
      fourWheelerCount: 0,
      fourWheelerDetails: '',
      twoWheelerCount: 0,
      twoWheelerDetails: '',
      cycleCount: 0,
      cycleDetails: '',
      thelaCount: 0,
      thelaDetails: '',
      
      // Products & Partnership
      partnerName: '',
      partnerAge: 18,
      partnerMobile: '',
      partnerEmail: '',
      partnerCitizenshipNumber: '',
      partnerIssuedDistrict: '',
      creditDays: 0,
      
      // Document Upload
      citizenshipDocument: null,
      companyRegistrationDocument: null,
      panVatDocument: null,
      digitalSignature: null,
      
      // Additional Information
      additionalInfo: '',
      termsAndConditions: '',
      
      // Agreement
      agreementAccepted: false,
      distributorSignatureName: '',
      distributorSignatureDate: getTodayNepaliDate(),
      
      // Dynamic Arrays
      currentTransactions: [{ company: '', products: '', turnover: '' }],
      products: [{ name: '', monthlySalesCapacity: '' }, { name: '', monthlySalesCapacity: '' }],
      areaCoverageDetails: [],
      currentBusiness: [{ businessType: '', products: '', turnover: '' }]
    }
  });

  // Field arrays for dynamic sections
  const { fields: transactionFields, append: appendTransaction, remove: removeTransaction } = useFieldArray({
    control,
    name: 'currentTransactions'
  });

  const { fields: productFields, append: appendProduct, remove: removeProduct } = useFieldArray({
    control,
    name: 'products'
  });

  const { fields: areaFields, append: appendArea, remove: removeArea } = useFieldArray({
    control,
    name: 'areaCoverageDetails'
  });

  const { fields: businessFields, append: appendBusiness, remove: removeBusiness } = useFieldArray({
    control,
    name: 'currentBusiness'
  });

  // Manage form state when step changes
  useEffect(() => {
    const contextData = getCurrentFormData();
    console.log(`🔄 STEP ${currentStep} - Context data:`, contextData);
    
    // Default empty form data
    const emptyFormData = {
      fullName: '',
      age: '',
      gender: '',
      citizenshipNumber: '',
      issuedDistrict: '',
      mobileNumber: '',
      email: '',
      permanentAddress: '',
      temporaryAddress: '',
      companyName: '',
      registrationNumber: '',
      panVatNumber: '',
      officeAddress: '',
      workAreaDistrict: '',
      desiredDistributionArea: '',
      currentBusiness: '',
      businessType: '',
      salesManCount: 0,
      salesManExperience: '',
      deliveryStaffCount: 0,
      deliveryStaffExperience: '',
      accountAssistantCount: 0,
      accountAssistantExperience: '',
      otherStaffCount: 0,
      otherStaffExperience: '',
      warehouseSpace: 0,
      warehouseDetails: '',
      truckCount: 0,
      truckDetails: '',
      fourWheelerCount: 0,
      fourWheelerDetails: '',
      twoWheelerCount: 0,
      twoWheelerDetails: '',
      cycleCount: 0,
      cycleDetails: '',
      thelaCount: 0,
      thelaDetails: '',
      distributorSignatureName: '',
      distributorSignatureDate: getTodayNepaliDate(),
      productCategory: '',
      businessExperience: '',
      monthlyIncome: '',
      storageFacility: '',
      paymentPreference: '',
      creditDays: 0,
      deliveryPreference: '',
      partnerFullName: '',
      partnerAge: 18,
      partnerGender: '',
      partnerCitizenshipNumber: '',
      partnerIssuedDistrict: '',
      partnerMobileNumber: '',
      partnerEmail: '',
      partnerPermanentAddress: '',
      partnerTemporaryAddress: '',
      additionalInfo: '',
      additionalInfo2: '',
      additionalInfo3: '',
      agreementAccepted: false,
      distributorSignatureName: '',
      distributorSignatureDate: getTodayNepaliDate(),
      currentTransactions: [{ company: '', products: '', turnover: '' }],
      products: [{ name: '', monthlySalesCapacity: '' }, { name: '', monthlySalesCapacity: '' }],
      areaCoverageDetails: [],
      currentBusiness: [{ businessType: '', products: '', turnover: '' }]
    };
    
    // Merge context data with empty form data (context data takes precedence)
    const formDataToSet = { ...emptyFormData, ...contextData };
    
    reset(formDataToSet);
    console.log(`🔄 STEP ${currentStep} - Form populated with context data for editing`);
  }, [currentStep, reset, getCurrentFormData]);

  // Initialize canvas drawing context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up drawing context
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  // Digital signature functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ensure proper drawing context setup
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Get coordinates relative to canvas
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    // Scale coordinates to match canvas internal dimensions
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const scaledX = x * scaleX;
    const scaledY = y * scaleY;

    // Ensure coordinates are within canvas bounds
    const boundedX = Math.max(0, Math.min(scaledX, canvas.width));
    const boundedY = Math.max(0, Math.min(scaledY, canvas.height));

    ctx.beginPath();
    ctx.moveTo(boundedX, boundedY);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ensure proper drawing context setup
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Get coordinates relative to canvas
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    // Scale coordinates to match canvas internal dimensions
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const scaledX = x * scaleX;
    const scaledY = y * scaleY;

    // Ensure coordinates are within canvas bounds
    const boundedX = Math.max(0, Math.min(scaledX, canvas.width));
    const boundedY = Math.max(0, Math.min(scaledY, canvas.height));

    ctx.lineTo(boundedX, boundedY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Save signature as high-quality data URL
    const signatureData = canvas.toDataURL('image/png', 1.0);
    setSignature(signatureData);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the entire canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Reset canvas properties
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    setSignature(null);
  };

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas properties for smooth drawing
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Set canvas size to match display size for better touch support
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
  }, []);

  // Auto-fill signature name from Step 1 full name
  useEffect(() => {
    const fullName = watch('fullName');
    if (fullName && currentStep === 7) {
      // Auto-fill the signature name field with the full name from Step 1
      setValue('distributorSignatureName', fullName);
    }
  }, [currentStep, watch, setValue]);

  const nextStep = async () => {
    // Get current form data and save it to Context
    const currentFormData = watch();
    console.log(`🔒 STEP ${currentStep} - Capturing form data:`, currentFormData);
    
    // Clean and save to Context API (preserve form data!)
    const cleanedData = Object.entries(currentFormData).reduce((acc: any, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'string' && value.trim() !== '') {
          acc[key] = value.trim();
        } else if (typeof value === 'number' && value >= 0) {
          acc[key] = value;
        } else if (typeof value === 'boolean') {
          acc[key] = value;
        } else if (Array.isArray(value) && value.length > 0) {
          acc[key] = value;
        } else if (value instanceof File || value instanceof FileList) {
          acc[key] = value;
        } else if (typeof value === 'object' && value !== null) {
          acc[key] = value;
        }
      }
      return acc;
    }, {});
    
    // Save to Context API
    updateFormData(cleanedData);
    console.log(`✅ STEP ${currentStep} - Data saved to Context API`);
    
    // Validate current step if needed
    let fieldsToValidate: string[] = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ['fullName', 'age', 'gender', 'citizenshipNumber', 'issuedDistrict', 'mobileNumber', 'email', 'permanentAddress'];
        break;
      case 2:
        fieldsToValidate = ['companyName', 'registrationNumber', 'panVatNumber', 'officeAddress', 'workAreaDistrict', 'desiredDistributionArea'];
        break;
      case 3:
        fieldsToValidate = [];
        break;
      case 4:
        fieldsToValidate = [];
        break;
      case 5:
        fieldsToValidate = ['citizenshipCertificate', 'citizenshipFile', 'companyRegistrationFile', 'panVatFile'];
        break;
      case 6:
        fieldsToValidate = [];
        break;
      case 7:
        fieldsToValidate = ['agreementAccepted', 'distributorSignatureName', 'distributorSignatureDate'];
        break;
      case 8:
        fieldsToValidate = []; // Review step - no validation needed
        break;
      default:
        fieldsToValidate = [];
    }

    if (fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate as any);
      const currentValues = watch();
      console.log('🔍 Step', currentStep, 'validation:');
      console.log('Required fields:', fieldsToValidate);
      console.log('Current form values:', currentValues);
      console.log('Form errors:', errors);
      console.log('Validation result:', isValid);
      
      if (!isValid) {
        toast.error(`कृपया आवश्यक फिल्डहरू भर्नुहोस्। `, {
          duration: 5000,
          style: {
            background: '#fee2e2',
            color: '#dc2626',
            border: '1px solid #fecaca',
          },
        });
        return;
      }
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      console.log(`🚀 MOVED TO STEP ${currentStep + 1} - All data preserved in Context`);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      console.log(`🔙 MOVED TO STEP ${currentStep - 1}`);
    }
  };

  const handleFormSubmit = async (data: any) => {
    console.log('🎯 handleFormSubmit called with:', data);
    console.log('Current step:', currentStep);
    console.log('Total steps:', steps.length);
    
    // Force save current step data before submission
    if (currentStep === 8) {
      const currentFormData = watch();
      console.log('🔄 Force saving final step data:', currentFormData);
      updateFormData(currentFormData);
    }
    
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Form submission failed: ' + (error as Error).message, {
        duration: 5000,
        style: {
          background: '#fee2e2',
          color: '#dc2626',
          border: '1px solid #fecaca',
        },
      });
    }
  };

  const onSubmit = async (data: any) => {
    console.log('🚀 Form submission started!');
    console.log('🔍 Raw form data:', data);
    
    // Save current step data to Context one final time
    if (currentStep === 8) {
      console.log('📝 Final step submission - saving current data and using Context');
      const currentFormData = watch();
      updateFormData(currentFormData);
    }
    
    setIsSubmitting(true);
    try {
      // Get all data from Context API (this has ALL accumulated data)
      const contextData = getCurrentFormData();
      const currentFormData = watch();
      
      console.log('🔍 Current form data from watch():', currentFormData);
      console.log('🔍 ALL CONTEXT DATA (all steps):', contextData);
      
      // Merge Context data with current form data
      const finalData: any = {
        ...contextData,     // All previous steps data from Context
        ...currentFormData  // Current step data
      };
      
      console.log('🔍 FINAL MERGED DATA FOR SUBMISSION:', finalData);
      console.log('🔍 TOTAL FIELDS IN FINAL DATA:', Object.keys(finalData).length);
      
      // Check if we have essential data - be more lenient
      console.log('🔍 Checking essential data:');
      console.log('finalData.fullName:', finalData.fullName);
      console.log('contextData.fullName:', contextData.fullName);
      
      if (!finalData.fullName && !contextData.fullName) {
        console.log('⚠️ No fullName found, but continuing with submission...');
      }
      
      // Structure data according to backend database schema
      const applicationData = {
        personalDetails: {
          fullName: finalData.fullName || '',
          age: parseInt(finalData.age) || 18,
          gender: finalData.gender || 'पुरुष',
          citizenshipNumber: finalData.citizenshipNumber || '',
          issuedDistrict: finalData.issuedDistrict || '',
          mobileNumber: finalData.mobileNumber || '',
          email: finalData.email || '',
          permanentAddress: finalData.permanentAddress || '',
          temporaryAddress: finalData.temporaryAddress || ''
        },
        businessDetails: {
          companyName: finalData.companyName || '',
          registrationNumber: finalData.registrationNumber || '',
          panVatNumber: finalData.panVatNumber || '',
          officeAddress: finalData.officeAddress || '',
          operatingArea: finalData.workAreaDistrict || finalData.officeAddress || 'काठमाडौं',
          desiredDistributorArea: finalData.desiredDistributionArea || finalData.workAreaDistrict || 'काठमाडौं',
          currentBusiness: Array.isArray(finalData.currentBusiness) 
            ? finalData.currentBusiness.map((b: any) => `${b.businessType}: ${b.products} (${b.turnover})`).join('; ')
            : finalData.currentBusiness || '',
          businessType: finalData.businessType || 'खुद्रा व्यापार'
        },
        staffInfrastructure: {
          salesManCount: parseInt(finalData.salesManCount?.toString() || '0') || 0,
          salesManExperience: finalData.salesManExperience || '',
          deliveryStaffCount: parseInt(finalData.deliveryStaffCount?.toString() || '0') || 0,
          deliveryStaffExperience: finalData.deliveryStaffExperience || '',
          accountAssistantCount: parseInt(finalData.accountAssistantCount?.toString() || '0') || 0,
          accountAssistantExperience: finalData.accountAssistantExperience || '',
          otherStaffCount: parseInt(finalData.otherStaffCount?.toString() || '0') || 0,
          otherStaffExperience: finalData.otherStaffExperience || '',
          warehouseSpace: parseInt(finalData.warehouseSpace?.toString() || '0') || 0,
          warehouseDetails: finalData.warehouseDetails || '',
          truckCount: parseInt(finalData.truckCount?.toString() || '0') || 0,
          truckDetails: finalData.truckDetails || '',
          fourWheelerCount: parseInt(finalData.fourWheelerCount?.toString() || '0') || 0,
          fourWheelerDetails: finalData.fourWheelerDetails || '',
          twoWheelerCount: parseInt(finalData.twoWheelerCount?.toString() || '0') || 0,
          twoWheelerDetails: finalData.twoWheelerDetails || '',
          cycleCount: parseInt(finalData.cycleCount?.toString() || '0') || 0,
          cycleDetails: finalData.cycleDetails || '',
          thelaCount: parseInt(finalData.thelaCount?.toString() || '0') || 0,
          thelaDetails: finalData.thelaDetails || ''
        },
        businessInformation: {
          productCategory: finalData.productCategory || 'खाद्य वस्तु',
          yearsInBusiness: parseInt(finalData.businessExperience) || 1,
          monthlySales: finalData.monthlyIncome || '0',
          storageFacility: finalData.storageFacility || 'आधारभूत भण्डारण'
        },
        retailerRequirements: {
          preferredProducts: finalData.products?.map((p: any) => p.name).join(', ') || '',
          monthlyOrderQuantity: finalData.products?.reduce((sum: number, p: any) => sum + parseInt(p.monthlySalesCapacity || 0), 0).toString() || '0',
          paymentPreference: finalData.paymentPreference || 'नगद',
          creditDays: parseInt(finalData.creditDays?.toString() || '0') || 0,
          deliveryPreference: finalData.deliveryPreference || 'स्वयं उठाउने'
        },
        partnershipDetails: finalData.partnerFullName ? {
          partnerFullName: finalData.partnerFullName,
          partnerAge: parseInt(finalData.partnerAge?.toString() || '0') || 0,
          partnerGender: finalData.partnerGender || '',
          partnerCitizenshipNumber: finalData.partnerCitizenshipNumber || '',
          partnerIssuedDistrict: finalData.partnerIssuedDistrict || '',
          partnerMobileNumber: finalData.partnerMobileNumber || '',
          partnerEmail: finalData.partnerEmail || '',
          partnerPermanentAddress: finalData.partnerPermanentAddress || '',
          partnerTemporaryAddress: finalData.partnerTemporaryAddress || ''
        } : null,
        additionalInformation: {
          additionalInfo1: finalData.additionalInfo || '',
          additionalInfo2: finalData.additionalInfo2 || '',
          additionalInfo3: finalData.additionalInfo3 || ''
        },
        declaration: {
          declaration: finalData.agreementAccepted === true,
          signature: finalData.distributorSignatureName || finalData.fullName || '',
          date: finalData.distributorSignatureDate || getTodayNepaliDate()
        },
        agreement: {
          agreementAccepted: finalData.agreementAccepted === true,
          distributorSignatureName: finalData.distributorSignatureName || finalData.fullName || '',
          distributorSignatureDate: finalData.distributorSignatureDate || getTodayNepaliDate(),
          digitalSignature: null // Signature removed from review section
        },
        currentTransactions: finalData.currentTransactions || [],
        productsToDistribute: finalData.products || [],
        areaCoverageDetails: finalData.areaCoverageDetails || []
      };

      // Handle file uploads separately
      const formData = new FormData();
      formData.append('data', JSON.stringify(applicationData));

      // Add files if they exist - using correct field names that match backend upload middleware
      if (finalData.citizenshipFile) {
        const file = finalData.citizenshipFile instanceof FileList
          ? finalData.citizenshipFile[0]
          : finalData.citizenshipFile;
        if (file) {
          formData.append('citizenshipId', file);
        }
      }
      if (finalData.companyRegistrationFile) {
        const file = finalData.companyRegistrationFile instanceof FileList
          ? finalData.companyRegistrationFile[0]
          : finalData.companyRegistrationFile;
        if (file) {
          formData.append('companyRegistration', file);
        }
      }
      if (finalData.panVatFile) {
        const file = finalData.panVatFile instanceof FileList
          ? finalData.panVatFile[0]
          : finalData.panVatFile;
        if (file) {
          formData.append('panVatRegistration', file);
        }
      }
      if (finalData.officePhotoFile) {
        const file = finalData.officePhotoFile instanceof FileList
          ? finalData.officePhotoFile[0]
          : finalData.officePhotoFile;
        if (file) {
          formData.append('officePhoto', file);
        }
      }
      if (finalData.otherDocumentsFile) {
        const file = finalData.otherDocumentsFile instanceof FileList
          ? finalData.otherDocumentsFile[0]
          : finalData.otherDocumentsFile;
        if (file) {
          formData.append('areaMap', file);
        }
      }

      // Digital signature removed from review section
      // No signature file upload needed

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/applications/submit`, {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Application submitted successfully:', result);
        setIsSubmitted(true);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Submission failed:', errorData);
        toast.error(`आवेदन पेश गर्न असफल भयो। त्रुटि `, {
          duration: 6000,
          style: {
            background: '#fee2e2',
            color: '#dc2626',
            border: '1px solid #fecaca',
          },
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(`आवेदन पेश गर्न असफल भयो। नेटवर्क त्रुटि `, {
        duration: 6000,
        style: {
          background: '#fee2e2',
          color: '#dc2626',
          border: '1px solid #fecaca',
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-[#001011] mb-6 absans">व्यक्तिगत विवरण</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                  पूरा नाम (Full Name) *
                </label>
                <Controller
                  name="fullName"
                  control={control}
                  rules={{ required: "पूरा नाम आवश्यक छ" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                        errors.fullName ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                      }`}
                      placeholder="तपाईंको पूरा नाम लेख्नुहोस्"
                    />
                  )}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                  उमेर (Age) *
                </label>
                <Controller
                  name="age"
                  control={control}
                  rules={{ required: "उमेर आवश्यक छ" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      min="18"
                      className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                        errors.age ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                      }`}
                      placeholder="तपाईंको उमेर"
                    />
                  )}
                />
                {errors.age && (
                  <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                  लिङ्ग (Gender)*
                </label>
                <Controller
                  name="gender"
                  control={control}
                  rules={{ required: "लिङ्ग आवश्यक छ" }}
                  render={({ field }) => (
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          {...field}
                          value="पुरुष"
                          checked={field.value === 'पुरुष'}
                          className="mr-2"
                        />
                        <span className="text-sm text-[#001011] absans">पुरुष</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          {...field}
                          value="महिला"
                          checked={field.value === 'महिला'}
                          className="mr-2"
                        />
                        <span className="text-sm text-[#001011] absans">महिला</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          {...field}
                          value="अन्य"
                          checked={field.value === 'अन्य'}
                          className="mr-2"
                        />
                        <span className="text-sm text-[#001011] absans">अन्य</span>
                      </label>
                    </div>
                  )}
                />
                {errors.gender && (
                  <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                  नागरिकता नम्बर (Citizenship No) *
                </label>
                <Controller
                  name="citizenshipNumber"
                  control={control}
                  rules={{ required: "नागरिकता नम्बर आवश्यक छ" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                        errors.citizenshipNumber ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                      }`}
                      placeholder="नागरिकता नम्बर"
                    />
                  )}
                />
                {errors.citizenshipNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.citizenshipNumber.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                  जारी जिल्ला (Issued District) *
                </label>
                <Controller
                  name="issuedDistrict"
                  control={control}
                  rules={{ required: "जारी जिल्ला आवश्यक छ" }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] absans ${
                        errors.issuedDistrict ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                      }`}
                    >
                      <option value="">जिल्ला छान्नुहोस्</option>
                      {nepalDistricts.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.issuedDistrict && (
                  <p className="text-red-500 text-sm mt-1">{errors.issuedDistrict.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                  मोबाइल नम्बर (Contact Number) *
                </label>
                <Controller
                  name="mobileNumber"
                  control={control}
                  rules={{ required: "मोबाइल नम्बर आवश्यक छ" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="tel"
                      className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                        errors.mobileNumber ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                      }`}
                      placeholder="9xxxxxxxxx"
                    />
                  )}
                />
                {errors.mobileNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.mobileNumber.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                  इमेल ठेगाना (Email Address) *
                </label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="email"
                      className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                        errors.email ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                      }`}
                      placeholder="example@email.com"
                    />
                  )}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                  स्थायी ठेगाना (Permanent Address) *
                </label>
                <Controller
                  name="permanentAddress"
                  control={control}
                  rules={{ required: "स्थायी ठेगाना आवश्यक छ" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                        errors.permanentAddress ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                      }`}
                      placeholder="स्थायी ठेगाना"
                    />
                  )}
                />
                {errors.permanentAddress && (
                  <p className="text-red-500 text-sm mt-1">{errors.permanentAddress.message}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                  अस्थायी ठेगाना (Temporary Address)
                </label>
                <Controller
                  name="temporaryAddress"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                        field.value ? 'border-orange-400' : 'border-gray-300'
                      }`}
                      placeholder="अस्थायी ठेगाना"
                    />
                  )}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-[#001011] mb-6 absans">व्यापारिक विवरण</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                    कम्पनीको नाम *
                </label>
                <Controller
                  name="companyName"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                        className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                          errors.companyName ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                        }`}
                      placeholder="कम्पनीको नाम"
                    />
                  )}
                />
                  {errors.companyName && (
                    <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>
                  )}
              </div>

              <div>
                <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                    दर्ता नम्बर/रजिस्ट्रेशन नम्बर *
                </label>
                <Controller
                  name="registrationNumber"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                        className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans ${
                          errors.registrationNumber ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                        }`}
                      placeholder="दर्ता नम्बर"
                    />
                  )}
                />
                  {errors.registrationNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.registrationNumber.message}</p>
                  )}
              </div>

              <div>
                <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                    PAN/VAT नम्बर *
                </label>
                <Controller
                  name="panVatNumber"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                        className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] absans ${
                          errors.panVatNumber ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                        }`}
                      placeholder="PAN/VAT नम्बर"
                    />
                  )}
                />
                  {errors.panVatNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.panVatNumber.message}</p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                    कार्यालयको ठेगाना *
                </label>
                <Controller
                  name="officeAddress"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                        className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] absans ${
                          errors.officeAddress ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                        }`}
                      placeholder="कार्यालयको ठेगाना"
                    />
                  )}
                />
                  {errors.officeAddress && (
                    <p className="text-red-500 text-sm mt-1">{errors.officeAddress.message}</p>
                  )}
              </div>

              <div>
                <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                    काम गर्ने क्षेत्र/जिल्ला *
                </label>
                <Controller
                  name="workAreaDistrict"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                        className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] absans ${
                          errors.workAreaDistrict ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                        }`}
                    >
                      <option value="">जिल्ला छान्नुहोस्</option>
                      {nepalDistricts.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  )}
                />
                  {errors.workAreaDistrict && (
                    <p className="text-red-500 text-sm mt-1">{errors.workAreaDistrict.message}</p>
                  )}
              </div>

              <div>
                <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                    वितरक बन्न चाहने क्षेत्र *
                </label>
                <Controller
                    name="desiredDistributionArea"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                        className={`w-full px-6 py-4 border rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] absans ${
                          errors.desiredDistributionArea ? 'border-red-300' : field.value ? 'border-orange-400' : 'border-gray-300'
                        }`}
                        placeholder="वितरक बन्न चाहने क्षेत्र"
                    />
                  )}
                />
                  {errors.desiredDistributionArea && (
                    <p className="text-red-500 text-sm mt-1">{errors.desiredDistributionArea.message}</p>
                  )}
              </div>
              </div>
            </div>

            {/* Current Business Section - Full Width */}
            <div className="mt-8">
              <div>
                <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                  हालको व्यापारको विवरण
                </label>
                <p className="text-sm text-[#001011] mb-3 absans">
                  कृपया तलका विवरणहरू लेख्नुहोस्: व्यापारको प्रकार, बेच्ने उत्पादनहरू, र वार्षिक टर्नओभर (Please provide: Business type, Products you sell, and Annual turnover)
                </p>
                
                <div className="space-y-4">
                  {businessFields.map((field, index) => (
                    <div key={field.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-bold text-[#001011] absans">
                          व्यापार {index + 1} (Business {index + 1})
                        </h4>
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => removeBusiness(index)}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors absans"
                          >
                            हटाउनुहोस् (Remove)
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#001011] mb-1 absans">
                            व्यापारको प्रकार * (Business type *)
                </label>
                <Controller
                            name={`currentBusiness.${index}.businessType`}
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                                className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] text-sm absans"
                                placeholder="जस्तै: खुद्रा व्यापार"
                    />
                  )}
                />
              </div>
                        
                        <div>
                          <label className="block text-xs font-bold text-[#001011] mb-1 absans">
                            उत्पादनहरू * (Products *)
                          </label>
                          <Controller
                            name={`currentBusiness.${index}.products`}
                            control={control}
                            render={({ field }) => (
                              <input
                                {...field}
                                type="text"
                                className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] text-sm absans"
                                placeholder="जस्तै: खाद्य वस्तु, कपडा"
                              />
                            )}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-bold text-[#001011] mb-1 absans">
                            वार्षिक टर्नओभर * (Annual turnover *)
                          </label>
                          <Controller
                            name={`currentBusiness.${index}.turnover`}
                            control={control}
                            render={({ field }) => (
                              <input
                                {...field}
                                type="text"
                                className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] text-sm absans"
                                placeholder="जस्तै: ५० लाख रुपैयाँ"
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => appendBusiness({ businessType: '', products: '', turnover: '' })}
                    className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-[#001011] hover:border-blue-500 hover:text-blue-500 transition-colors text-sm absans"
                  >
                    + अर्को व्यापार थप्नुहोस् (Add Another Business)
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-[#001011] mb-6 absans">३. कार्यरत कर्मचारी र पूर्वाधारको विवरण (Working Staff and Infrastructure Details)</h3>
            
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-bold text-[#001011] border-b border-gray-200 absans">
                        कर्मचारी पद (Employee Position)
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-[#001011] border-b border-gray-200 absans">
                        संख्या (Number)
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-[#001011] border-b border-gray-200 absans">
                        अनुभव विवरण (Experience Details)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {/* Sales Man */}
                    <tr>
                      <td className="px-4 py-3 text-sm text-[#001011] absans">
                        सेल्स म्यान (Sales Man)
                      </td>
                      <td className="px-4 py-3">
                    <Controller
                      name="salesManCount"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min="0"
                              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                          placeholder="0"
                        />
                      )}
                    />
                      </td>
                      <td className="px-4 py-3">
                        <Controller
                          name="salesManExperience"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                              placeholder="Experience details"
                            />
                          )}
                        />
                      </td>
                    </tr>

                    {/* Delivery Staff */}
                    <tr>
                      <td className="px-4 py-3 text-sm text-[#001011] absans">
                        डेलिभरी स्टाफ (Delivery Staff)
                      </td>
                      <td className="px-4 py-3">
                    <Controller
                          name="deliveryStaffCount"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min="0"
                              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                          placeholder="0"
                        />
                      )}
                    />
                      </td>
                      <td className="px-4 py-3">
                        <Controller
                          name="deliveryStaffExperience"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                              placeholder="Experience details"
                            />
                          )}
                        />
                      </td>
                    </tr>

                    {/* Account Assistant */}
                    <tr>
                      <td className="px-4 py-3 text-sm text-[#001011] absans">
                        लेखा सहायक (Account Assistant)
                      </td>
                      <td className="px-4 py-3">
                    <Controller
                          name="accountAssistantCount"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min="0"
                              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                          placeholder="0"
                        />
                      )}
                    />
                      </td>
                      <td className="px-4 py-3">
                        <Controller
                          name="accountAssistantExperience"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                              placeholder="Experience details"
                            />
                          )}
                        />
                      </td>
                    </tr>

                    {/* Other Staff */}
                    <tr>
                      <td className="px-4 py-3 text-sm text-[#001011] absans">
                        अन्य (खुलाउनुहोस्) (Other - Specify)
                      </td>
                      <td className="px-4 py-3">
                    <Controller
                          name="otherStaffCount"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min="0"
                              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                          placeholder="0"
                        />
                      )}
                    />
                      </td>
                      <td className="px-4 py-3">
                        <Controller
                          name="otherStaffExperience"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                              placeholder="Specify other staff type and experience"
                            />
                          )}
                        />
                      </td>
                    </tr>

                    {/* Warehouse Space */}
                    <tr>
                      <td className="px-4 py-3 text-sm text-[#001011] absans">
                        गोदाम space Sq.Ft. (Warehouse space Sq.Ft.)
                      </td>
                      <td className="px-4 py-3">
                    <Controller
                          name="warehouseSpace"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min="0"
                              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                          placeholder="0"
                        />
                      )}
                    />
                      </td>
                      <td className="px-4 py-3">
                        <Controller
                          name="warehouseDetails"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                              placeholder="Warehouse details"
                            />
                          )}
                        />
                      </td>
                    </tr>

                    {/* Truck/Mini Truck */}
                    <tr>
                      <td className="px-4 py-3 text-sm text-[#001011] absans">
                        Truck/mini truck
                      </td>
                      <td className="px-4 py-3">
                    <Controller
                      name="truckCount"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min="0"
                              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                          placeholder="0"
                        />
                      )}
                    />
                      </td>
                      <td className="px-4 py-3">
                        <Controller
                          name="truckDetails"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                              placeholder="Truck details"
                            />
                          )}
                        />
                      </td>
                    </tr>

                    {/* Four Wheeler */}
                    <tr>
                      <td className="px-4 py-3 text-sm text-[#001011] absans">
                        Four wheeler
                      </td>
                      <td className="px-4 py-3">
                    <Controller
                      name="fourWheelerCount"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min="0"
                              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                          placeholder="0"
                        />
                      )}
                    />
                      </td>
                      <td className="px-4 py-3">
                        <Controller
                          name="fourWheelerDetails"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                              placeholder="Four wheeler details"
                            />
                          )}
                        />
                      </td>
                    </tr>

                    {/* Two Wheeler */}
                    <tr>
                      <td className="px-4 py-3 text-sm text-[#001011] absans">
                        Two wheeler
                      </td>
                      <td className="px-4 py-3">
                    <Controller
                          name="twoWheelerCount"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min="0"
                              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                          placeholder="0"
                        />
                      )}
                    />
                      </td>
                      <td className="px-4 py-3">
                        <Controller
                          name="twoWheelerDetails"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                              placeholder="Two wheeler details"
                            />
                          )}
                        />
                      </td>
                    </tr>

                    {/* Cycle */}
                    <tr>
                      <td className="px-4 py-3 text-sm text-[#001011] absans">
                        Cycle
                      </td>
                      <td className="px-4 py-3">
                    <Controller
                          name="cycleCount"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min="0"
                              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                          placeholder="0"
                        />
                      )}
                    />
                      </td>
                      <td className="px-4 py-3">
                        <Controller
                          name="cycleDetails"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                              placeholder="Cycle details"
                            />
                          )}
                        />
                      </td>
                    </tr>

                    {/* Thela */}
                    <tr>
                      <td className="px-4 py-3 text-sm text-[#001011] absans">
                        Thela
                      </td>
                      <td className="px-4 py-3">
                    <Controller
                          name="thelaCount"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min="0"
                              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                          placeholder="0"
                        />
                      )}
                    />
                      </td>
                      <td className="px-4 py-3">
                        <Controller
                          name="thelaDetails"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                              placeholder="Thela details"
                            />
                          )}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-[#001011] mb-6 absans">उत्पादन र साझेदारी</h3>
            
            
            {/* Products Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-[#001011] absans">वितरण गर्ने उत्पादनहरू</h4>
              
              {productFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
                  <div>
                    <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                      उत्पादनको नाम
                    </label>
                    <Controller
                      name={`products.${index}.name` as any}
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          disabled={categoriesLoading}
                          className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">
                            {categoriesLoading ? 'लोड हुँदैछ...' : 'उत्पादन छान्नुहोस्'}
                          </option>
                          {categories.length === 0 ? (
                            <option value="" disabled>
                              {categoriesLoading ? 'लोड हुँदैछ...' : 'कुनै श्रेणी उपलब्ध छैन'}
                            </option>
                          ) : (
                            categories.map((item) => (
                              <option 
                                key={item.id} 
                                value={item.type === 'category' ? item.title : ''}
                                disabled={item.type === 'subcategory'}
                                style={{
                                  fontWeight: item.type === 'category' ? 'bold' : 'normal',
                                  paddingLeft: item.type === 'subcategory' ? '20px' : '8px',
                                  color: item.type === 'subcategory' ? '#9CA3AF' : 'inherit',
                                  fontStyle: item.type === 'subcategory' ? 'italic' : 'normal'
                                }}
                              >
                                {item.type === 'subcategory' ? '  └ ' : ''}{item.title}
                                {item.type === 'subcategory' ? ' (सब-श्रेणी)' : ''}
                              </option>
                            ))
                          )}
                        </select>
                      )}
                    />
                    <p className="text-xs text-gray-600 mt-1 absans">
                      सब-श्रेणीहरू केवल जानकारीका लागि देखाइएका छन्। मुख्य श्रेणी मात्र छान्नुहोस्।
                    </p>
                    {errors.products?.[index]?.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.products[index]?.name?.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                      मासिक बिक्री क्षमता
                    </label>
                    <Controller
                      name={`products.${index}.monthlySalesCapacity` as any}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                          placeholder="मासिक बिक्री क्षमता"
                        />
                      )}
                    />
                    {errors.products?.[index]?.monthlySalesCapacity && (
                      <p className="text-red-500 text-sm mt-1">{errors.products[index]?.monthlySalesCapacity?.message}</p>
                    )}
                  </div>

                  <div className="flex items-end">
                    {productFields.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm absans"
                      >
                        हटाउनुहोस्
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => appendProduct({ name: '', monthlySalesCapacity: '' })}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm absans"
              >
                + नयाँ उत्पादन थप्नुहोस्
              </button>
            </div>

            {/* Partnership Details */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-[#001011] absans">साझेदारी विवरण (वैकल्पिक)</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                    साझेदारको पूरा नाम
                  </label>
                  <Controller
                    name="partnerFullName"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                        placeholder="साझेदारको नाम"
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                    साझेदारको उमेर
                  </label>
                  <Controller
                    name="partnerAge"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min="18"
                        className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                        placeholder="उमेर"
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                    साझेदारको मोबाइल नम्बर
                  </label>
                  <Controller
                    name="partnerMobileNumber"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="tel"
                        className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                        placeholder="9xxxxxxxxx"
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                    साझेदारको इमेल
                  </label>
                  <Controller
                    name="partnerEmail"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="email"
                        className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                        placeholder="partner@email.com"
                      />
                    )}
                  />
                </div>
              
              <div>
                <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                    साझेदारको नागरिकता नम्बर
                </label>
                <Controller
                    name="partnerCitizenshipNumber"
                  control={control}
                  render={({ field }) => (
                      <input
                      {...field}
                        type="text"
                      className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                        placeholder="नागरिकता नम्बर"
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                    साझेदारको जारी जिल्ला
                </label>
                <Controller
                    name="partnerIssuedDistrict"
                  control={control}
                  render={({ field }) => (
                      <select
                      {...field}
                      className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                      >
                        <option value="">जिल्ला छान्नुहोस्</option>
                        {nepalDistricts.map((district) => (
                          <option key={district} value={district}>
                            {district}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-[#001011] mb-6 absans">प्रमाणपत्र संलग्न</h3>
            
            <div className="space-y-6">
              {/* Citizenship Certificate */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Controller
                    name="citizenshipCertificate"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        checked={field.value || false}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    )}
                  />
                  <label className="text-sm font-bold text-[#001011] absans">
                    नागरिकता प्रमाणपत्र * (अनिवार्य)
                  </label>
                </div>
                <div className="space-y-3">
                <Controller
                  name="citizenshipFile"
                  control={control}
                    rules={{ required: "नागरिकता प्रमाणपत्र आवश्यक छ" }}
                  render={({ field: { onChange, value, ...field } }) => (
                      <>
                    <input
                      {...field}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => onChange(e.target.files?.[0])}
                      className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                    />
                        <div className="flex gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.capture = 'camera';
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) {
                                  onChange(file);
                                }
                              };
                              input.click();
                            }}
                            className="px-3 py-2 border border-gray-300 text-black rounded-lg hover:bg-green-700 transition-colors text-sm absans flex items-center gap-1"
                          >
                            📷 क्यामेरा
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = '.pdf,.jpg,.jpeg,.png';
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) {
                                  onChange(file);
                                }
                              };
                              input.click();
                            }}
                            className="px-3 py-2 border border-gray-300 text-black rounded-lg hover:bg-blue-700 transition-colors text-sm absans flex items-center gap-1"
                          >
                            📁 फाइल छान्नुहोस्
                          </button>
                        </div>
                      </>
                    )}
                  />
                </div>
                {errors.citizenshipFile && (
                  <p className="text-red-500 text-sm mt-1">{errors.citizenshipFile.message}</p>
                )}
              </div>

              {/* Company Registration */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Controller
                    name="companyRegistration"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        checked={field.value || false}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    )}
                  />
                  <label className="text-sm font-bold text-[#001011] absans">
                    कम्पनी दर्ता प्रमाणपत्र * (अनिवार्य)
                  </label>
                </div>
                <div className="space-y-3">
                <Controller
                  name="companyRegistrationFile"
                  control={control}
                    rules={{ required: "कम्पनी दर्ता प्रमाणपत्र आवश्यक छ" }}
                  render={({ field: { onChange, value, ...field } }) => (
                      <>
                    <input
                      {...field}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => onChange(e.target.files?.[0])}
                      className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                    />
                        <div className="flex gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.capture = 'camera';
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) {
                                  onChange(file);
                                }
                              };
                              input.click();
                            }}
                            className="px-3 py-2 border border-gray-300 text-black rounded-lg hover:bg-green-700 transition-colors text-sm absans flex items-center gap-1"
                          >
                            📷 क्यामेरा
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = '.pdf,.jpg,.jpeg,.png';
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) {
                                  onChange(file);
                                }
                              };
                              input.click();
                            }}
                            className="px-3 py-2 border border-gray-300 text-black rounded-lg hover:bg-blue-700 transition-colors text-sm absans flex items-center gap-1"
                          >
                            📁 फाइल छान्नुहोस्
                          </button>
                        </div>
                      </>
                    )}
                  />
                </div>
                {errors.companyRegistrationFile && (
                  <p className="text-red-500 text-sm mt-1">{errors.companyRegistrationFile.message}</p>
                )}
              </div>

              {/* PAN/VAT */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Controller
                    name="panVat"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        checked={field.value || false}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    )}
                  />
                  <label className="text-sm font-bold text-[#001011] absans">
                    PAN/VAT प्रमाणपत्र * (अनिवार्य)
                  </label>
                </div>
                <div className="space-y-3">
                <Controller
                  name="panVatFile"
                  control={control}
                    rules={{ required: "PAN/VAT प्रमाणपत्र आवश्यक छ" }}
                  render={({ field: { onChange, value, ...field } }) => (
                      <>
                    <input
                      {...field}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => onChange(e.target.files?.[0])}
                      className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                    />
                        <div className="flex gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.capture = 'camera';
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) {
                                  onChange(file);
                                }
                              };
                              input.click();
                            }}
                            className="px-3 py-2 border border-gray-300 text-black rounded-lg hover:bg-green-700 transition-colors text-sm absans flex items-center gap-1"
                          >
                            📷 क्यामेरा
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = '.pdf,.jpg,.jpeg,.png';
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) {
                                  onChange(file);
                                }
                              };
                              input.click();
                            }}
                            className="px-3 py-2 border border-gray-300 text-black rounded-lg hover:bg-blue-700 transition-colors text-sm absans flex items-center gap-1"
                          >
                            📁 फाइल छान्नुहोस्
                          </button>
                        </div>
                      </>
                    )}
                  />
                </div>
                {errors.panVatFile && (
                  <p className="text-red-500 text-sm mt-1">{errors.panVatFile.message}</p>
                )}
              </div>

              {/* Office Photo */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Controller
                    name="officePhoto"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        checked={field.value || false}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    )}
                  />
                  <label className="text-sm font-bold text-[#001011] absans">
                    कार्यालयको फोटो
                  </label>
                </div>
                <Controller
                  name="officePhotoFile"
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <input
                      {...field}
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => onChange(e.target.files?.[0])}
                      className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                    />
                  )}
                />
              </div>

              {/* Other Documents */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Controller
                    name="otherDocuments"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        checked={field.value || false}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    )}
                  />
                  <label className="text-sm font-bold text-[#001011] absans">
                    अन्य कागजातहरू
                  </label>
                </div>
                <Controller
                  name="otherDocumentsFile"
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <input
                      {...field}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      multiple
                      onChange={(e) => onChange(e.target.files)}
                      className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                    />
                  )}
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-[#001011] mb-6 absans">अतिरिक्त जानकारी</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                  अतिरिक्त जानकारी १
                </label>
                <Controller
                  name="additionalInfo"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows={3}
                      className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                      placeholder="अतिरिक्त जानकारी लेख्नुहोस्..."
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                  अतिरिक्त जानकारी २
                </label>
                <Controller
                  name="additionalInfo2"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows={3}
                      className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                      placeholder="अतिरिक्त जानकारी लेख्नुहोस्..."
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                  अतिरिक्त जानकारी ३
                </label>
                <Controller
                  name="additionalInfo3"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows={3}
                      className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                      placeholder="अतिरिक्त जानकारी लेख्नुहोस्..."
                    />
                  )}
                />
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-[#001011] mb-6 absans">नियम र सहमति (Terms & Agreement)</h3>
            
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <h4 className="text-lg font-semibold text-[#001011] absans">मुख्य शर्तहरू (Main Terms & Conditions):</h4>
              
              <div className="space-y-3 text-sm text-[#001011] absans">
                <p>1. वितरकले वितरण क्षेत्रभित्र मात्र सामान बिक्री गर्न पाउनेछ।</p>
                <p>2. सबै बक्यौता ३० दिनभित्र चुक्ता गर्नु पर्नेछ।</p>
                <p>3. कम्पनीको मूल्य सूची र स्किम अनुसार नै बिक्री गर्नुपर्नेछ।</p>
                <p>4. समयमै अर्डर र डेलिभरी सुनिश्चित गर्नुपर्नेछ।</p>
                <p>5. नवीकरण प्रत्येक वर्ष गरिनुपर्नेछ।</p>
                <p>6. कम्पनीको ब्रान्ड नाम, लोगो, सामग्रीहरूको दुरुपयोग गर्ने पाउने छैन।</p>
                <p>7. कुनै विवाद उत्पन्न भएमा कम्पनीको मुख्य कार्यालयको निर्णय अन्तिम हुनेछ।</p>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <h4 className="text-lg font-semibold text-[#001011] absans">८. सहमति (Agreement & Terms)</h4>
              
              <div className="space-y-3 text-sm text-[#001011] absans">
                <p>म/हामी माथि उल्लेखित सबै विवरणहरू सत्य र यथार्थ छन् भनी प्रमाणित गर्दछु/गछौँ।</p>
                <p>Celebrate Multi Industries Pvt. Ltd. को नियम र शर्तहरू पालना गर्नेछु/गछौ।</p>
              </div>
            </div>

            {/* Agreement Checkbox */}
            <div className="mb-6">
              <div className="flex items-start space-x-3 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                <Controller
                  name="agreementAccepted"
                  control={control}
                  rules={{ required: "सहमति स्वीकार गर्नुहोस्" }}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      checked={field.value || false}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  )}
                />
                <div className="flex-1">
                  <label className="text-sm font-medium text-blue-900 absans">
                    म/हामी माथि उल्लेखित सबै नियम र शर्तहरू स्वीकार गर्दछु/गर्दछौं। *
                  </label>
                  <p className="text-xs text-blue-700 mt-1">
                    I/We accept all the terms and conditions mentioned above. *
                  </p>
                  {errors.agreementAccepted && (
                    <p className="text-red-500 text-sm mt-1">{errors.agreementAccepted.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Signature Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
              <h4 className="text-lg font-semibold text-[#001011] absans">हस्ताक्षर र विवरण (Signature & Details)</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                    वितरकको नाम (Distributor Name) *
                  </label>
                  <Controller
                    name="distributorSignatureName"
                    control={control}
                    rules={{ required: "नाम आवश्यक छ" }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans"
                        placeholder="Enter your full name"
                      />
                    )}
                  />
                  {errors.distributorSignatureName && (
                    <p className="text-red-500 text-sm mt-1">{errors.distributorSignatureName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                    मिति (Date) *
                  </label>
                  <Controller
                    name="distributorSignatureDate"
                    control={control}
                    rules={{ required: "मिति आवश्यक छ" }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        readOnly
                        className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none text-[#001011] placeholder-[#001011] absans bg-gray-50 cursor-not-allowed"
                        placeholder="आजको मिति"
                      />
                    )}
                  />
                  <p className="text-xs text-gray-600 mt-1 absans">
                    आजको नेपाली मिति स्वतः भरिएको छ (Today's Nepali date is auto-filled)
                  </p>
                  {errors.distributorSignatureDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.distributorSignatureDate.message}</p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                  वितरकको हस्ताक्षरः (Distributor's Signature:)
                </label>
                <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={400}
                    className="border border-gray-200 rounded cursor-crosshair w-full max-w-4xl mx-auto"
                    style={{ touchAction: 'none' }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                  <div className="flex gap-2 mt-3 justify-center">
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm absans"
                    >
                      सफा गर्नुहोस् (Clear)
                    </button>
                    {signature && (
                      <div className="text-green-600 text-sm flex items-center gap-1">
                        ✓ हस्ताक्षर भयो (Signature Captured)
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-bold text-[#001011] mb-2 absans">
                  छाप (Stamp)
                </label>
                <div className="border-2 border-dashed border-gray-300 h-16 flex items-center justify-center">
                  <span className="text-[#001011] text-sm absans">[Stamp area]</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-[#001011] mb-2 absans">समीक्षा (Review)</h3>
              <p className="text-[#001011] absans">
                कृपया तपाईंले भरेका सबै विवरणहरू जाँच गर्नुहोस्। यदि कुनै परिवर्तन चाहिन्छ भने, पछाडि जानुहोस् र सम्पादन गर्नुहोस्।
              </p>
              <p className="text-sm text-[#001011] mt-1">
                Please review all the details you have entered. If any changes are needed, go back and edit.
              </p>
            </div>
            
            <div className="space-y-8">
              {/* Step 1: Personal Details */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h4 className="text-xl font-semibold text-[#001011] mb-6 pb-3 border-b border-gray-200 absans">
                  व्यक्तिगत विवरण (Personal Details)
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={getCurrentFormData().fullName || ''}
                        disabled
                        className="w-full px-4 pt-6 pb-2 bg-gray-50 border border-gray-200 rounded-lg text-[#001011] cursor-not-allowed absans focus:outline-none focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none"
                        placeholder=" "
                      />
                      <label className="absolute left-4 -top-1 bg-gray-50 px-1 text-xs font-bold text-[#001011] transition-all duration-200 pointer-events-none absans">
                        नाम (Full Name)
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={getCurrentFormData().age || ''}
                        disabled
                        className="w-full px-4 pt-6 pb-2 bg-gray-50 border border-gray-200 rounded-lg text-[#001011] cursor-not-allowed absans focus:outline-none focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none"
                        placeholder=" "
                      />
                      <label className="absolute left-4 -top-1 bg-gray-50 px-1 text-xs font-bold text-[#001011] transition-all duration-200 pointer-events-none absans">
                        उमेर (Age)
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={getCurrentFormData().gender || ''}
                        disabled
                        className="w-full px-4 pt-6 pb-2 bg-gray-50 border border-gray-200 rounded-lg text-[#001011] cursor-not-allowed absans focus:outline-none focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none"
                        placeholder=" "
                      />
                      <label className="absolute left-4 -top-1 bg-gray-50 px-1 text-xs font-bold text-[#001011] transition-all duration-200 pointer-events-none absans">
                        लिङ्ग (Gender)
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={getCurrentFormData().citizenshipNumber || ''}
                        disabled
                        className="w-full px-4 pt-6 pb-2 bg-gray-50 border border-gray-200 rounded-lg text-[#001011] cursor-not-allowed absans focus:outline-none focus:ring-0 focus:border-gray-400 focus:bg-gray-100 focus:outline-none"
                        placeholder=" "
                      />
                      <label className="absolute left-4 -top-1 bg-gray-50 px-1 text-xs font-bold text-[#001011] transition-all duration-200 pointer-events-none absans">
                        नागरिकता नम्बर (Citizenship Number)
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#001011] mb-2 absans">जारी जिल्ला (Issued District)</label>
                      <input
                        type="text"
                        value={getCurrentFormData().issuedDistrict || ''}
                        disabled
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#001011] cursor-not-allowed absans"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-[#001011] mb-2 absans">मोबाइल (Mobile)</label>
                      <input
                        type="text"
                        value={getCurrentFormData().mobileNumber || ''}
                        disabled
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#001011] cursor-not-allowed absans"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#001011] mb-2 absans">इमेल (Email)</label>
                      <input
                        type="text"
                        value={getCurrentFormData().email || ''}
                        disabled
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#001011] cursor-not-allowed absans"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#001011] mb-2 absans">स्थायी ठेगाना (Permanent Address)</label>
                      <input
                        type="text"
                        value={getCurrentFormData().permanentAddress || ''}
                        disabled
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#001011] cursor-not-allowed absans"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#001011] mb-2 absans">अस्थायी ठेगाना (Temporary Address)</label>
                      <input
                        type="text"
                        value={getCurrentFormData().temporaryAddress || ''}
                        disabled
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#001011] cursor-not-allowed absans"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Business Details */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h4 className="text-xl font-semibold text-[#001011] mb-6 pb-3 border-b border-gray-200 absans">
                  व्यापारिक विवरण (Business Details)
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-[#001011] mb-2 absans">कम्पनीको नाम (Company Name)</label>
                      <input
                        type="text"
                        value={getCurrentFormData().companyName || ''}
                        disabled
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#001011] cursor-not-allowed absans"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#001011] mb-2 absans">दर्ता नम्बर (Registration Number)</label>
                      <input
                        type="text"
                        value={getCurrentFormData().registrationNumber || ''}
                        disabled
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#001011] cursor-not-allowed absans"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#001011] mb-2 absans">PAN/VAT नम्बर (PAN/VAT Number)</label>
                      <input
                        type="text"
                        value={getCurrentFormData().panVatNumber || ''}
                        disabled
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#001011] cursor-not-allowed absans"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-[#001011] mb-2 absans">कार्यालयको ठेगाना (Office Address)</label>
                      <input
                        type="text"
                        value={getCurrentFormData().officeAddress || ''}
                        disabled
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#001011] cursor-not-allowed absans"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#001011] mb-2 absans">काम गर्ने क्षेत्र (Work Area District)</label>
                      <input
                        type="text"
                        value={getCurrentFormData().workAreaDistrict || ''}
                        disabled
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#001011] cursor-not-allowed absans"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#001011] mb-2 absans">वितरक बन्न चाहने क्षेत्र (Desired Distribution Area)</label>
                      <input
                        type="text"
                        value={getCurrentFormData().desiredDistributionArea || ''}
                        disabled
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#001011] cursor-not-allowed absans"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Current Business Details */}
                {getCurrentFormData().currentBusiness && getCurrentFormData().currentBusiness.length > 0 && (
                  <div className="mt-4">
                    <h5 className="font-bold text-[#001011] mb-2 absans">हालको व्यापारको विवरण (Current Business Details):</h5>
                    {getCurrentFormData().currentBusiness.map((business: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-3 rounded mb-2 text-sm text-[#001011]">
                        <div><strong>व्यापारको प्रकार (Business Type):</strong> {business.businessType || 'N/A'}</div>
                        <div><strong>उत्पादनहरू (Products):</strong> {business.products || 'N/A'}</div>
                        <div><strong>वार्षिक टर्नओभर (Annual Turnover):</strong> {business.turnover || 'N/A'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 3: Staff & Infrastructure */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-[#001011] mb-4 absans">कर्मचारी र पूर्वाधार (Staff & Infrastructure)</h4>
                <div className="space-y-3 text-sm text-[#001011]">
                  <div><strong>सेल्स म्यान (Sales Man):</strong> {getCurrentFormData().salesManCount || '0'} - {getCurrentFormData().salesManExperience || 'No experience details'}</div>
                  <div><strong>डेलिभरी स्टाफ (Delivery Staff):</strong> {getCurrentFormData().deliveryStaffCount || '0'} - {getCurrentFormData().deliveryStaffExperience || 'No experience details'}</div>
                  <div><strong>लेखा सहायक (Account Assistant):</strong> {getCurrentFormData().accountAssistantCount || '0'} - {getCurrentFormData().accountAssistantExperience || 'No experience details'}</div>
                  <div><strong>अन्य (Other Staff):</strong> {getCurrentFormData().otherStaffCount || '0'} - {getCurrentFormData().otherStaffExperience || 'No details'}</div>
                  <div><strong>गोदाम स्थान (Warehouse Space):</strong> {getCurrentFormData().warehouseSpace || '0'} Sq.Ft. - {getCurrentFormData().warehouseDetails || 'No details'}</div>
                  <div><strong>Truck/Mini Truck:</strong> {getCurrentFormData().truckCount || '0'} - {getCurrentFormData().truckDetails || 'No details'}</div>
                  <div><strong>Four Wheeler:</strong> {getCurrentFormData().fourWheelerCount || '0'} - {getCurrentFormData().fourWheelerDetails || 'No details'}</div>
                  <div><strong>Two Wheeler:</strong> {getCurrentFormData().twoWheelerCount || '0'} - {getCurrentFormData().twoWheelerDetails || 'No details'}</div>
                  <div><strong>Cycle:</strong> {getCurrentFormData().cycleCount || '0'} - {getCurrentFormData().cycleDetails || 'No details'}</div>
                  <div><strong>Thela:</strong> {getCurrentFormData().thelaCount || '0'} - {getCurrentFormData().thelaDetails || 'No details'}</div>
                </div>
              </div>

              {/* Step 4: Products & Partnership */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-[#001011] mb-4 absans">उत्पादन र साझेदारी (Products & Partnership)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#001011]">
                  <div><strong>उत्पादन श्रेणी (Product Category):</strong> {getCurrentFormData().productCategory || 'N/A'}</div>
                  <div><strong>व्यापार अनुभव (Business Experience):</strong> {getCurrentFormData().businessExperience || 'N/A'} वर्ष</div>
                  <div><strong>मासिक आम्दानी (Monthly Income):</strong> {getCurrentFormData().monthlyIncome || 'N/A'}</div>
                  <div><strong>भुक्तानी प्राथमिकता (Payment Preference):</strong> {getCurrentFormData().paymentPreference || 'N/A'}</div>
                </div>
                
                {/* Partnership Details */}
                {getCurrentFormData().partnerFullName && (
                  <div className="mt-4">
                    <h5 className="font-bold text-[#001011] mb-2 absans">साझेदारी विवरण (Partnership Details):</h5>
                    <div className="bg-gray-50 p-3 rounded text-sm text-[#001011]">
                      <div><strong>साझेदारको नाम (Partner Name):</strong> {getCurrentFormData().partnerFullName}</div>
                      <div><strong>साझेदारको उमेर (Partner Age):</strong> {getCurrentFormData().partnerAge}</div>
                      <div><strong>साझेदारको मोबाइल (Partner Mobile):</strong> {getCurrentFormData().partnerMobileNumber}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 5: Document Upload */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h4 className="text-xl font-semibold text-[#001011] mb-6 pb-3 border-b border-gray-200 absans">
                  प्रमाणपत्र संलग्न (Document Upload)
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-[#001011] mb-3 absans">नागरिकता प्रमाणपत्र (Citizenship Certificate)</label>
                      {getCurrentFormData().citizenshipFile ? (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="px-3 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              Uploaded
                            </div>
                            <button
                              type="button"
                              onClick={() => window.open(URL.createObjectURL(getCurrentFormData().citizenshipFile), '_blank')}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 transition-colors"
                            >
                              Open Full Size
                            </button>
                          </div>
                          <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                            <img
                              src={URL.createObjectURL(getCurrentFormData().citizenshipFile)}
                              alt="Citizenship Certificate"
                              className="w-full h-48 object-contain rounded"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <div className="px-3 py-2 rounded-full text-sm font-medium bg-red-100 text-red-800">
                             Not uploaded
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#001011] mb-3 absans">कम्पनी दर्ता (Company Registration)</label>
                      {getCurrentFormData().companyRegistrationFile ? (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="px-3 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              Uploaded
                            </div>
                            <button
                              type="button"
                              onClick={() => window.open(URL.createObjectURL(getCurrentFormData().companyRegistrationFile), '_blank')}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 transition-colors"
                            >
                              Preview
                            </button>
                          </div>
                          <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                            <img
                              src={URL.createObjectURL(getCurrentFormData().companyRegistrationFile)}
                              alt="Company Registration"
                              className="w-full h-48 object-contain rounded"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <div className="px-3 py-2 rounded-full text-sm font-medium bg-red-100 text-red-800">
                            Not uploaded
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-[#001011] mb-3 absans">PAN/VAT प्रमाणपत्र (PAN/VAT Certificate)</label>
                      {getCurrentFormData().panVatFile ? (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="px-3 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                               Uploaded
                            </div>
                            <button
                              type="button"
                              onClick={() => window.open(URL.createObjectURL(getCurrentFormData().panVatFile), '_blank')}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 transition-colors"
                            >
                             Preview
                            </button>
                          </div>
                          <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                            <img
                              src={URL.createObjectURL(getCurrentFormData().panVatFile)}
                              alt="PAN/VAT Certificate"
                              className="w-full h-48 object-contain rounded"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <div className="px-3 py-2 rounded-full text-sm font-medium bg-red-100 text-red-800">
                             Not uploaded
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#001011] mb-3 absans">कार्यालयको फोटो (Office Photo)</label>
                      {getCurrentFormData().officePhotoFile ? (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="px-3 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              Uploaded
                            </div>
                            <button
                              type="button"
                              onClick={() => window.open(URL.createObjectURL(getCurrentFormData().officePhotoFile), '_blank')}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 transition-colors"
                            >
                              Preview
                            </button>
                          </div>
                          <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                            <img
                              src={URL.createObjectURL(getCurrentFormData().officePhotoFile)}
                              alt="Office Photo"
                              className="w-full h-48 object-contain rounded"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <div className="px-3 py-2 rounded-full text-sm font-medium bg-red-100 text-red-800">
                             Not uploaded
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 6: Additional Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-[#001011] mb-4 absans">अतिरिक्त जानकारी (Additional Information)</h4>
                <div className="space-y-3 text-sm text-[#001011]">
                  <div><strong>अतिरिक्त जानकारी १ (Additional Information 1):</strong> {getCurrentFormData().additionalInfo || 'N/A'}</div>
                  <div><strong>अतिरिक्त जानकारी २ (Additional Information 2):</strong> {getCurrentFormData().additionalInfo2 || 'N/A'}</div>
                  <div><strong>अतिरिक्त जानकारी ३ (Additional Information 3):</strong> {getCurrentFormData().additionalInfo3 || 'N/A'}</div>
                </div>
              </div>

              {/* Step 7: Terms & Agreement */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-[#001011] mb-4 absans">नियम र सहमति (Terms & Agreement)</h4>
                <div className="space-y-3 text-sm text-[#001011]">
                  <div><strong>सहमति स्वीकार (Agreement Accepted):</strong> {getCurrentFormData().agreementAccepted ? '✅ Yes' : '❌ No'}</div>
                  <div><strong>वितरकको नाम (Distributor Name):</strong> {getCurrentFormData().distributorSignatureName || 'N/A'}</div>
                  <div><strong>मिति (Date):</strong> {getCurrentFormData().distributorSignatureDate || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-[#001011] mb-6 absans">
              Step {currentStep} - Under Development
            </h3>
            <p className="text-[#001011] absans">
              This step content will be implemented soon. For now, you can navigate to the next step.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 absans">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#374151',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        }}
      />
      
      {/* Thank You Message */}
      {isSubmitted && (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-2xl mx-auto text-center px-6">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-[#001011] mb-4 absans">
                  धन्यवाद! (Thank You!)
                </h1>
                <h2 className="text-xl font-semibold text-[#001011] mb-4 absans">
                  आवेदन सफलतापूर्वक पेश गरियो
                </h2>
              </div>
              
              <div className="space-y-4 text-[#001011] absans">
                <p className="text-lg">
                  तपाईंको आवेदन सफलतापूर्वक पेश गरियो। हाम्रो टोलीले यसको समीक्षा गर्नेछ र तपाईंलाई फिर्ता सम्पर्क गर्नेछ।
                </p>
                <p className="text-base text-gray-600">
                  Your application has been successfully submitted. Our team will review it and get back to you.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <p className="text-sm text-blue-800 absans">
                    <strong>अगाडि के हुन्छ?</strong> हामी तपाईंको आवेदनको समीक्षा गर्नेछौं र तपाईंको व्यापारिक स्थिति अनुसार फिर्ता सम्पर्क गर्नेछौं।
                  </p>
                  <p className="text-xs text-blue-700 mt-2">
                    <strong>What's next?</strong> We will review your application and contact you back based on your business status.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setCurrentStep(1);
                    // Reset form if needed
                    window.location.reload();
                  }}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors absans"
                >
                  नयाँ आवेदन (New Application)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Form Content - only show when not submitted */}
      {!isSubmitted && (
        <>
          {/* Header */}
      <div 
        className="sticky top-0 z-50 border-b border-gray-200"
        style={{
          background: "radial-gradient(125% 125% at 50% 90%, #fff 40%,rgb(228, 106, 40) 100%)",
        }}
      >
        <div className="max-w-9xl px-4 py-6 ">
          <div className="flex flex-col sm:flex-row items-center justify-center relative">
            {/* Logo */}
            <div className="flex-shrink-0 mb-2 sm:mb-0 sm:absolute sm:left-0">
              <Image src="/logo.png" alt="ZIP ZIP" width={150} height={150} className="w-24 h-16 sm:w-20 sm:h-12 md:w-22 md:h-14 lg:w-28 lg:h-18" />
            </div>
            {/* Title centered */}
            <div className="text-center">
              <h1 className="text-lg md:text-2xl font-extrabold text-[#001011] absans">
                वितरक आवेदन फारम<br />Distributor Application Form
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-8" style={{
        backgroundImage: `linear-gradient(135deg, #F2F8FC 0%, #E0F2FE 25%, #F2F8FC 50%, #E0F2FE 75%, #F2F8FC 100%)`,
        backgroundSize: '200% 200%',
        animation: 'marble 8s ease-in-out infinite'
      }}>
        <div className="lg:flex lg:gap-8">
          {/* Progress Sidebar - Hidden on small screens */}
          <div className="hidden lg:block lg:w-96 mb-8 lg:mb-0">
            <div className="bg-white rounded-lg shadow-sm p-6 fixed top-24 left-8 z-10 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <h2 className="text-lg font-semibold text-[#001011] mb-6 absans">प्रगति</h2>
              
              {/* Progress Overview */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-[#001011] mb-2">
                  <span>Step {currentStep} of {steps.length}</span>
                  <span>{Math.round((currentStep / steps.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(currentStep / steps.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Step Tabs */}
              <div className="space-y-12">
                {steps.map((step, index) => (
                  <div key={step.id} className="relative">
                    {/* Connecting Line */}
                    {index < steps.length - 1 && (
                      <div className="absolute left-3 top-10 w-0.5 h-12 bg-gray-300 z-0"></div>
                    )}
                    
                    <div
                      className={`relative p-4 rounded-lg border transition-all duration-200 cursor-pointer z-10 ${
                        currentStep === step.id
                        ? 'bg-blue-50 border-blue-200 shadow-sm'
                          : currentStep > step.id
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      if (currentStep > step.id) {
                        setCurrentStep(step.id);
                      }
                    }}
                  >
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep === step.id
                          ? 'bg-blue-500 text-white'
                          : currentStep > step.id
                          ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-[#001011]'
                      }`}>
                          {currentStep > step.id ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            step.id
                          )}
                    </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                            currentStep === step.id ? 'text-blue-700' : currentStep > step.id ? 'text-green-700' : 'text-[#001011]'
                        }`}>
                        {step.title}
                        </p>
                          <p className="text-xs text-[#001011] mt-1">
                        {step.subtitle}
                        </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Progress - Modern Tab Design */}
          <div className="lg:hidden mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              {/* Progress Overview */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-[#001011] mb-2">
                  <span>Step {currentStep} of {steps.length}</span>
                  <span>{Math.round((currentStep / steps.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(currentStep / steps.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Step Indicators */}
              <div className="flex justify-evenly gap-12 overflow-x-auto relative">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex flex-col items-center relative">
                    {/* Connecting Line */}
                    {index < steps.length - 1 && (
                      <div className="absolute left-1/2 top-4 w-12 h-0.5 bg-gray-300 z-0 transform translate-x-4"></div>
                    )}
                    
                      <div
                      className={`relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 z-10 ${
                          currentStep === step.id
                          ? 'bg-blue-500 text-white shadow-lg'
                            : currentStep > step.id
                          ? 'bg-green-500 text-white shadow-lg'
                            : 'bg-gray-200 text-[#001011]'
                        }`}
                      >
                        {currentStep > step.id ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          step.id
                        )}
                      </div>
                    <p className={`text-xs mt-1 text-center ${
                          currentStep === step.id
                        ? 'text-blue-600 font-medium'
                            : currentStep > step.id
                            ? 'text-green-600'
                            : 'text-[#001011]'
                    }`}>
                        {step.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Step Navigation */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-lg font-semibold text-[#001011] absans">
                    Step {currentStep} of {steps.length}
                  </h2>
                  <p className="text-sm text-[#001011] absans">
                    {steps.find(s => s.id === currentStep)?.title}
                  </p>
                </div>
              </div>


              {/* Form Content */}
              <div className="p-4">
                <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                  {renderStepContent()}
                  
                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors absans ${
                        currentStep === 1
                          ? 'bg-gray-100 text-[#001011] cursor-not-allowed'
                          : 'bg-gray-200 text-[#001011] hover:bg-gray-300'
                      }`}
                    >
                      पछाडि
                    </button>

                    {currentStep < steps.length ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors absans"
                      >
                        अगाडि
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        onClick={async (e) => {
                          console.log('🖱️ Submit button clicked!');
                          console.log('Current step:', currentStep);
                          console.log('Form errors:', errors);
                          const currentValues = watch();
                          console.log('Current form values:', currentValues);
                          
                          // Check if agreement is accepted
                          if (currentStep === 8 && !currentValues.agreementAccepted) {
                            toast.error('कृपया सर्तहरू स्वीकार गर्नुहोस् (Please accept the terms and conditions)', {
                              duration: 4000,
                              style: {
                                background: '#fee2e2',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                              },
                            });
                            return;
                          }
                          
                          
                          // If on final step and agreement is accepted, submit directly
                          if (currentStep === 8 && currentValues.agreementAccepted) {
                            e.preventDefault();
                            console.log('🚀 Submitting form from submit button');
                            await onSubmit(currentValues);
                          }
                        }}
                        className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors absans ${
                          isSubmitting
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {isSubmitting ? 'पेश गर्दै...' : 'पेश गर्नुहोस्'}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}

// Main exported component with Context Provider
export default function DistributorForm() {
  return (
    <>
      <style jsx>{`
        @keyframes marble {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Main Content */}
      <div className="min-h-screen bg-gray-50">
        <FormDataProvider>
          <DistributorFormContent />
        </FormDataProvider>
      </div>
    </>
  );
}
