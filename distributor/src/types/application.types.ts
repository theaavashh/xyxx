// Core form data interfaces for distributor application
export interface PersonalDetails {
  fullName: string;
  age: number;
  gender: 'पुरुष' | 'महिला' | 'अन्य';
  citizenshipNumber: string;
  issuedDistrict: string;
  mobileNumber: string;
  email: string;
  permanentAddress: string;
  temporaryAddress?: string;
}

export interface BusinessDetails {
  companyName: string;
  registrationNumber: string;
  panVatNumber: string;
  officeAddress: string;
  workAreaDistrict: string;
  desiredDistributionArea: string;
  currentBusiness?: string;
  businessType?: string;
}

export interface StaffInfrastructure {
  salesManCount: number;
  salesManExperience?: string;
  driverCount: number;
  driverExperience?: string;
  helperCount: number;
  helperExperience?: string;
  accountantCount: number;
  accountantExperience?: string;
  storageSpace: number;
  storageDetails?: string;
  truckCount: number;
  truckExperience?: string;
  truckDetails?: string;
  fourWheelerCount: number;
  fourWheelerExperience?: string;
  fourWheelerDetails?: string;
  motorcycleCount: number;
  motorcycleExperience?: string;
  twoWheelerDetails?: string;
  cycleCount: number;
  cycleExperience?: string;
  cycleDetails?: string;
  thelaCount: number;
  thelaExperience?: string;
  thelaDetails?: string;
}

export interface BusinessInformation {
  productCategory?: string;
  businessExperience?: string;
  monthlyIncome?: string;
  storageFacility?: string;
  paymentPreference?: string;
  creditDays?: number;
  deliveryPreference?: string;
}

export interface PartnershipDetails {
  partnerFullName?: string;
  partnerAge?: number;
  partnerGender?: string;
  partnerCitizenshipNumber?: string;
  partnerIssuedDistrict?: string;
  partnerMobileNumber?: string;
  partnerEmail?: string;
  partnerPermanentAddress?: string;
  partnerTemporaryAddress?: string;
}

export interface AdditionalInformation {
  additionalInfo?: string;
  additionalInfo2?: string;
  additionalInfo3?: string;
}

export interface DocumentUpload {
  citizenshipCertificate: boolean;
  citizenshipFile?: File;
  companyRegistration: boolean;
  companyRegistrationFile?: File;
  panVat: boolean;
  panVatFile?: File;
  officePhoto?: boolean;
  officePhotoFile?: File;
  otherDocuments?: boolean;
  otherDocumentsFile?: FileList;
}

export interface AgreementDetails {
  agreementAccepted: boolean;
  distributorSignatureName?: string;
  distributorSignatureDate?: string;
  termsAndConditions?: string;
}

export interface CurrentTransaction {
  id?: string;
  company: string;
  products: string;
  turnover: string;
}

export interface ProductToDistribute {
  id?: string;
  name: string;
  category: string;
  monthlySalesCapacity: string;
}

export interface AreaCoverage {
  id?: string;
  areaDescription: string;
  populationEstimate: string;
  competitorCompany: string;
}

// Main form data interface
export interface DistributorFormData {
  // Step 1: Personal Details
  personalDetails: PersonalDetails;
  
  // Step 2: Business Details
  businessDetails: BusinessDetails;
  
  // Step 3: Staff and Infrastructure
  staffInfrastructure: StaffInfrastructure;
  
  // Step 4: Business Information and Products
  businessInformation: BusinessInformation;
  
  // Partnership Details (optional)
  partnershipDetails?: PartnershipDetails;
  
  // Step 5: Area Coverage and Additional Information
  additionalInformation: AdditionalInformation;
  
  // Step 6: Document Upload
  documentUpload: DocumentUpload;
  
  // Step 7: Agreement and signature
  agreementDetails: AgreementDetails;
  
  // Dynamic arrays
  currentTransactions: CurrentTransaction[];
  productsToDistribute: ProductToDistribute[];
  areaCoverageDetails: AreaCoverage[];
}

// API Request/Response interfaces
export interface ApiApplicationData {
  personalDetails: PersonalDetails;
  businessDetails: BusinessDetails;
  staffInfrastructure: StaffInfrastructure;
  businessInformation: BusinessInformation;
  retailerRequirements: {
    preferredProducts: string;
    monthlyOrderQuantity: string;
    paymentPreference: string;
    creditDays: number;
    deliveryPreference: string;
  };
  partnershipDetails: PartnershipDetails | null;
  additionalInformation: AdditionalInformation;
  declaration: {
    declaration: boolean;
    signature: string;
    date: string;
  };
  agreement: {
    agreementAccepted: boolean;
    distributorSignatureName: string;
    distributorSignatureDate: string;
    digitalSignature: string | null;
  };
  currentTransactions: CurrentTransaction[];
  productsToDistribute: ProductToDistribute[];
  areaCoverageDetails: AreaCoverage[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApplicationSubmissionResponse {
  success: boolean;
  message: string;
  referenceNumber?: string;
}

export interface DraftResponse {
  success: boolean;
  data: {
    referenceNumber: string;
  };
}

// Form wizard step interface
export interface FormStep {
  id: number;
  title: string;
  subtitle: string;
  component: React.ComponentType<any>;
}

// Form validation context interface
export interface FormValidationContext {
  errors: Record<string, string>;
  isValid: boolean;
  isSubmitting: boolean;
  validateStep: (stepId: number) => Promise<boolean>;
  setErrors: (errors: Record<string, string>) => void;
}

// Nepali districts type
export type NepaliDistrict = 
  | 'काठमाडौं' | 'ललितपुर' | 'भक्तपुर' | 'नुवाकोट' | 'रसुवा' | 'धादिङ' | 'मकवानपुर' | 'सिन्धुली' | 'कावरेपलाञ्चोक' | 'दोलखा' | 'सिन्धुपाल्चोक' | 'रामेछाप'
  | 'चितवन' | 'गोरखा' | 'लमजुङ' | 'तनहुँ' | 'स्याङ्जा' | 'कास्की' | 'मनाङ' | 'मुस्ताङ' | 'म्याग्दी' | 'पर्वत' | 'बागलुङ' | 'गुल्मी' | 'पाल्पा' | 'अर्घाखाँची'
  | 'नवलपरासी (बर्दघाट सुस्ता पूर्व)' | 'रुपन्देही' | 'कपिलवस्तु' | 'दाङ' | 'प्यूठान' | 'रोल्पा' | 'रुकुम (पूर्वी भाग)' | 'सल्यान' | 'सुर्खेत' | 'बाँके' | 'बर्दिया'
  | 'कैलाली' | 'कञ्चनपुर' | 'डडेल्धुरा' | 'बैतडी' | 'दार्चुला' | 'बाजुरा' | 'अछाम' | 'डोटी' | 'कालीकोट' | 'जुम्ला' | 'हुम्ला' | 'कर्णाली' | 'डोल्पा' | 'मुगु'
  | 'सुदूरपश्चिम' | 'झापा' | 'इलाम' | 'पाँचथर' | 'ताप्लेजुङ' | 'संखुवासभा' | 'तेह्रथुम' | 'धनकुटा' | 'भोजपुर' | 'सोलुखुम्बु' | 'ओखलढुङ्गा' | 'खोटाङ' | 'उदयपुर'
  | 'सप्तरी' | 'सिराहा' | 'धनुषा' | 'महोत्तरी' | 'सर्लाही' | 'बारा' | 'पर्सा' | 'रौतहट' | 'मोरङ' | 'सुनसरी';

// Category interface for product categories
export interface Category {
  id: string;
  title: string;
  type: 'category' | 'subcategory';
  parentId?: string | null;
}