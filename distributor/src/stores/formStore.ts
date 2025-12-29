import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { DistributorFormData, PersonalDetails, BusinessDetails, StaffInfrastructure, BusinessInformation, PartnershipDetails, AdditionalInformation, DocumentUpload, AgreementDetails, CurrentTransaction, ProductToDistribute, AreaCoverage } from '@/types/application.types';

// Form data store
interface FormDataState {
  // Form data
  formData: Partial<DistributorFormData>;
  
  // Actions
  setFormData: (data: Partial<DistributorFormData>) => void;
  updateFormData: (data: Partial<DistributorFormData>) => void;
  clearFormData: () => void;
  
  // Step-specific setters
  setPersonalDetails: (data: PersonalDetails) => void;
  setBusinessDetails: (data: BusinessDetails) => void;
  setStaffInfrastructure: (data: StaffInfrastructure) => void;
  setBusinessInformation: (data: BusinessInformation) => void;
  setPartnershipDetails: (data: PartnershipDetails) => void;
  setAdditionalInformation: (data: AdditionalInformation) => void;
  setDocumentUpload: (data: DocumentUpload) => void;
  setAgreementDetails: (data: AgreementDetails) => void;
  
  // Array operations
  setCurrentTransactions: (transactions: CurrentTransaction[]) => void;
  addCurrentTransaction: (transaction: CurrentTransaction) => void;
  updateCurrentTransaction: (index: number, transaction: CurrentTransaction) => void;
  removeCurrentTransaction: (index: number) => void;
  
  setProductsToDistribute: (products: ProductToDistribute[]) => void;
  addProductToDistribute: (product: ProductToDistribute) => void;
  updateProductToDistribute: (index: number, product: ProductToDistribute) => void;
  removeProductToDistribute: (index: number) => void;
  
  setAreaCoverageDetails: (areas: AreaCoverage[]) => void;
  addAreaCoverage: (area: AreaCoverage) => void;
  updateAreaCoverage: (index: number, area: AreaCoverage) => void;
  removeAreaCoverage: (index: number) => void;
  
  // Helper methods
  getCompletionPercentage: () => number;
  isStepComplete: (stepId: number) => boolean;
  validateCurrentStep: (stepId: number) => { isValid: boolean; errors: string[] };
}

export const useFormDataStore = create<FormDataState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        formData: {},
        
        // Basic form data operations
        setFormData: (data) => {
          set({ formData: data }, false, 'setFormData');
        },
        
        updateFormData: (data) => {
          set((state) => ({
            formData: { ...state.formData, ...data }
          }), false, 'updateFormData');
        },
        
        clearFormData: () => {
          set({ formData: {} }, false, 'clearFormData');
        },
        
        // Step-specific setters
        setPersonalDetails: (personalDetails) => {
          set((state) => ({
            formData: { ...state.formData, personalDetails }
          }), false, 'setPersonalDetails');
        },
        
        setBusinessDetails: (businessDetails) => {
          set((state) => ({
            formData: { ...state.formData, businessDetails }
          }), false, 'setBusinessDetails');
        },
        
        setStaffInfrastructure: (staffInfrastructure) => {
          set((state) => ({
            formData: { ...state.formData, staffInfrastructure }
          }), false, 'setStaffInfrastructure');
        },
        
        setBusinessInformation: (businessInformation) => {
          set((state) => ({
            formData: { ...state.formData, businessInformation }
          }), false, 'setBusinessInformation');
        },
        
        setPartnershipDetails: (partnershipDetails) => {
          set((state) => ({
            formData: { ...state.formData, partnershipDetails }
          }), false, 'setPartnershipDetails');
        },
        
        setAdditionalInformation: (additionalInformation) => {
          set((state) => ({
            formData: { ...state.formData, additionalInformation }
          }), false, 'setAdditionalInformation');
        },
        
        setDocumentUpload: (documentUpload) => {
          set((state) => ({
            formData: { ...state.formData, documentUpload }
          }), false, 'setDocumentUpload');
        },
        
        setAgreementDetails: (agreementDetails) => {
          set((state) => ({
            formData: { ...state.formData, agreementDetails }
          }), false, 'setAgreementDetails');
        },
        
        // Current transactions operations
        setCurrentTransactions: (currentTransactions) => {
          set((state) => ({
            formData: { ...state.formData, currentTransactions }
          }), false, 'setCurrentTransactions');
        },
        
        addCurrentTransaction: (transaction) => {
          set((state) => ({
            formData: {
              ...state.formData,
              currentTransactions: [
                ...(state.formData.currentTransactions || []),
                { ...transaction, id: Date.now().toString() }
              ]
            }
          }), false, 'addCurrentTransaction');
        },
        
        updateCurrentTransaction: (index, transaction) => {
          set((state) => {
            const transactions = [...(state.formData.currentTransactions || [])];
            transactions[index] = { ...transactions[index], ...transaction };
            return {
              formData: { ...state.formData, currentTransactions: transactions }
            };
          }, false, 'updateCurrentTransaction');
        },
        
        removeCurrentTransaction: (index) => {
          set((state) => ({
            formData: {
              ...state.formData,
              currentTransactions: (state.formData.currentTransactions || [])
                .filter((_, i) => i !== index)
            }
          }), false, 'removeCurrentTransaction');
        },
        
        // Products to distribute operations
        setProductsToDistribute: (productsToDistribute) => {
          set((state) => ({
            formData: { ...state.formData, productsToDistribute }
          }), false, 'setProductsToDistribute');
        },
        
        addProductToDistribute: (product) => {
          set((state) => ({
            formData: {
              ...state.formData,
              productsToDistribute: [
                ...(state.formData.productsToDistribute || []),
                { ...product, id: Date.now().toString() }
              ]
            }
          }), false, 'addProductToDistribute');
        },
        
        updateProductToDistribute: (index, product) => {
          set((state) => {
            const products = [...(state.formData.productsToDistribute || [])];
            products[index] = { ...products[index], ...product };
            return {
              formData: { ...state.formData, productsToDistribute: products }
            };
          }, false, 'updateProductToDistribute');
        },
        
        removeProductToDistribute: (index) => {
          set((state) => ({
            formData: {
              ...state.formData,
              productsToDistribute: (state.formData.productsToDistribute || [])
                .filter((_, i) => i !== index)
            }
          }), false, 'removeProductToDistribute');
        },
        
        // Area coverage operations
        setAreaCoverageDetails: (areaCoverageDetails) => {
          set((state) => ({
            formData: { ...state.formData, areaCoverageDetails }
          }), false, 'setAreaCoverageDetails');
        },
        
        addAreaCoverage: (area) => {
          set((state) => ({
            formData: {
              ...state.formData,
              areaCoverageDetails: [
                ...(state.formData.areaCoverageDetails || []),
                { ...area, id: Date.now().toString() }
              ]
            }
          }), false, 'addAreaCoverage');
        },
        
        updateAreaCoverage: (index, area) => {
          set((state) => {
            const areas = [...(state.formData.areaCoverageDetails || [])];
            areas[index] = { ...areas[index], ...area };
            return {
              formData: { ...state.formData, areaCoverageDetails: areas }
            };
          }, false, 'updateAreaCoverage');
        },
        
        removeAreaCoverage: (index) => {
          set((state) => ({
            formData: {
              ...state.formData,
              areaCoverageDetails: (state.formData.areaCoverageDetails || [])
                .filter((_, i) => i !== index)
            }
          }), false, 'removeAreaCoverage');
        },
        
        // Helper methods
        getCompletionPercentage: () => {
          const { formData } = get();
          const totalRequiredFields = 25;
          let completedFields = 0;
          
          const checkField = (obj: any, path: string): boolean => {
            const value = path.split('.').reduce((current, key) => current?.[key], obj);
            return value !== undefined && value !== null && value !== '' && 
                   (typeof value !== 'string' || value.trim() !== '');
          };
          
          const requiredFields = [
            'personalDetails.fullName',
            'personalDetails.age',
            'personalDetails.gender',
            'personalDetails.citizenshipNumber',
            'personalDetails.issuedDistrict',
            'personalDetails.mobileNumber',
            'personalDetails.email',
            'personalDetails.permanentAddress',
            'businessDetails.companyName',
            'businessDetails.registrationNumber',
            'businessDetails.panVatNumber',
            'businessDetails.officeAddress',
            'businessDetails.workAreaDistrict',
            'businessDetails.desiredDistributionArea',
            'documentUpload.citizenshipCertificate',
            'documentUpload.citizenshipFile',
            'documentUpload.companyRegistrationFile',
            'documentUpload.panVatFile',
            'agreementDetails.agreementAccepted'
          ];
          
          completedFields = requiredFields.filter(field => checkField(formData, field)).length;
          
          return Math.round((completedFields / totalRequiredFields) * 100);
        },
        
        isStepComplete: (stepId: number) => {
          const { formData } = get();
          
          const stepRequirements: Record<number, string[]> = {
            1: [
              'personalDetails.fullName',
              'personalDetails.age',
              'personalDetails.gender',
              'personalDetails.citizenshipNumber',
              'personalDetails.issuedDistrict',
              'personalDetails.mobileNumber',
              'personalDetails.email',
              'personalDetails.permanentAddress'
            ],
            2: [
              'businessDetails.companyName',
              'businessDetails.registrationNumber',
              'businessDetails.panVatNumber',
              'businessDetails.officeAddress',
              'businessDetails.workAreaDistrict',
              'businessDetails.desiredDistributionArea'
            ],
            3: [], // Optional step
            4: [], // Optional step
            5: [
              'documentUpload.citizenshipCertificate',
              'documentUpload.citizenshipFile',
              'documentUpload.companyRegistrationFile',
              'documentUpload.panVatFile'
            ],
            6: [], // Optional step
            7: [
              'agreementDetails.agreementAccepted'
            ],
            8: [] // Review step
          };
          
          const requiredFields = stepRequirements[stepId] || [];
          
          const checkField = (obj: any, path: string): boolean => {
            const value = path.split('.').reduce((current, key) => current?.[key], obj);
            return value !== undefined && value !== null && value !== '' && 
                   (typeof value !== 'string' || value.trim() !== '');
          };
          
          return requiredFields.every(field => checkField(formData, field));
        },
        
        validateCurrentStep: (stepId: number) => {
          const { formData } = get();
          const errors: string[] = [];
          
          const validateField = (obj: any, path: string, fieldName: string) => {
            const value = path.split('.').reduce((current, key) => current?.[key], obj);
            if (!value || (typeof value === 'string' && value.trim() === '')) {
              errors.push(`${fieldName} is required`);
            }
          };
          
          switch (stepId) {
            case 1:
              validateField(formData, 'personalDetails.fullName', 'Full Name');
              validateField(formData, 'personalDetails.age', 'Age');
              validateField(formData, 'personalDetails.gender', 'Gender');
              validateField(formData, 'personalDetails.citizenshipNumber', 'Citizenship Number');
              validateField(formData, 'personalDetails.issuedDistrict', 'Issued District');
              validateField(formData, 'personalDetails.mobileNumber', 'Mobile Number');
              validateField(formData, 'personalDetails.email', 'Email');
              validateField(formData, 'personalDetails.permanentAddress', 'Permanent Address');
              break;
            case 2:
              validateField(formData, 'businessDetails.companyName', 'Company Name');
              validateField(formData, 'businessDetails.registrationNumber', 'Registration Number');
              validateField(formData, 'businessDetails.panVatNumber', 'PAN/VAT Number');
              validateField(formData, 'businessDetails.officeAddress', 'Office Address');
              validateField(formData, 'businessDetails.workAreaDistrict', 'Work Area District');
              validateField(formData, 'businessDetails.desiredDistributionArea', 'Desired Distribution Area');
              break;
            case 5:
              validateField(formData, 'documentUpload.citizenshipFile', 'Citizenship Certificate');
              validateField(formData, 'documentUpload.companyRegistrationFile', 'Company Registration');
              validateField(formData, 'documentUpload.panVatFile', 'PAN/VAT Certificate');
              break;
            case 7:
              if (!formData.agreementDetails?.agreementAccepted) {
                errors.push('Agreement must be accepted');
              }
              break;
          }
          
          return {
            isValid: errors.length === 0,
            errors
          };
        }
      }),
      {
        name: 'distributor-form-storage',
        partialize: (state) => ({ formData: state.formData })
      }
    )
  )
);