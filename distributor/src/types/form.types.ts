export interface Product {
  id: string;
  name: string;
  monthlySalesCapacity: string;
}

export interface AreaCoverage {
  id: string;
  areaDescription: string;
  populationEstimate: string;
  competitorCompany: string;
}

export interface CurrentBusiness {
  id: string;
  businessType: string;
  products: string;
  turnover: string;
}

export interface FormData {
  // Step 1: Business Type Selection
  businessStructure: 'individual' | 'partnership';
  contactNumber: string;
  
  // Step 2: Personal Details
  fullName: string;
  age: string;
  gender: string;
  citizenshipNumber: string;
  issuedDistrict: string;
  mobileNumber?: string;
  email?: string;
  permanentAddress?: string;
  temporaryAddress?: string;

  // Step 3: Business Details
  companyName: string;
  registrationNumber: string;
  panVatNumber: string;
  officeAddress: string;
  workAreaProvince: string;
  workAreaDistrict: string;
  workArea: string;
  desiredDistributionArea: string;
  panDocument: File;
  registrationDocument: File;
  businessType?: string;
  currentBusiness?: string;

  // Step 4: Staff and Infrastructure
  selectedStaffType: string;
  staffQuantity: number;
  selectedInfrastructureType: string;
  infrastructureQuantity: number;

  // Step 5: Business Information
  productCategory?: string;
  businessExperience?: string;
  monthlyIncome?: string;
  storageFacility?: string;
  paymentPreference: string;
  creditDays?: number;
  deliveryPreference: string;

  // Products to distribute
  products?: Product[];

  // Partnership Details
  partnerFullName?: string;
  partnerAge?: string;
  partnerGender?: string;
  partnerCitizenshipNumber?: string;
  partnerIssuedDistrict?: string;
  partnerMobileNumber?: string;
  partnerEmail?: string;
  partnerPermanentAddress?: string;
  partnerTemporaryAddress?: string;

  // Current transactions
  currentTransactions: CurrentBusiness[];

  // Area Coverage
  areaCoverageDetails?: AreaCoverage[];

  // Additional Information
  additionalInfo?: string;
  additionalInfo2?: string;
  additionalInfo3?: string;

  // Step 6: Document Upload
  citizenshipCertificate?: boolean;
  citizenshipFile?: File | null;
  citizenshipFrontFile: File | null;
  citizenshipBackFile: File | null;
  companyRegistration?: boolean;
  companyRegistrationFile?: File | null;
  panVat?: boolean;
  panVatFile?: File | null;
  officePhoto?: boolean;
  officePhotoFile?: File | null;
  otherDocuments?: boolean;
  otherDocumentsFile?: FileList;
  
  // Step 7: Agreement and signature
  agreementAccepted: boolean;
  distributorSignatureName?: string;
  distributorSignatureDate?: string;
}

export interface FormContextType {
  allFormData: FormData;
  updateFormData: (stepData: Partial<FormData>) => void;
  clearFormData: () => void;
  getCurrentFormData: () => FormData;
  loadDraftData: (draftData: FormData) => void;
}

export interface FormStep {
  id: number;
  title: string;
  subtitle: string;
}

export interface Category {
  id: string;
  title: string;
  type: 'category' | 'subcategory';
  parentId?: string | null;
}