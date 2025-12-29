import { DistributorFormData, ApiApplicationData, ApiResponse, ApplicationSubmissionResponse, DraftResponse } from '@/types/application.types';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4444/api';
const API_TIMEOUT = 30000; // 30 seconds

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any,
    public isNetworkError: boolean = false
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// HTTP client with error handling and retry logic
class HttpClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries: number = 3
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await this.parseError(response);
        throw new ApiError(
          errorData.message || `HTTP ${response.status}`,
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      // Network error or timeout
      if (retries > 0 && this.shouldRetry(error)) {
        console.log(`Retrying request to ${endpoint}, ${retries} retries left`);
        await this.delay(1000); // Wait 1 second before retry
        return this.request<T>(endpoint, options, retries - 1);
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408, undefined, true);
      }

      throw new ApiError(
        'Network error',
        0,
        undefined,
        true
      );
    }
  }

  private async parseError(response: Response): Promise<any> {
    try {
      return await response.json();
    } catch {
      return { message: response.statusText || 'Unknown error' };
    }
  }

  private shouldRetry(error: unknown): boolean {
    if (error instanceof ApiError) {
      // Retry on 5xx errors, 408, 429
      return error.statusCode >= 500 || error.statusCode === 408 || error.statusCode === 429;
    }
    if (error instanceof Error) {
      // Retry on network errors
      return error.name === 'TypeError' || error.name === 'NetworkError';
    }
    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // HTTP methods
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // File upload method
  async upload<T>(
    endpoint: string,
    formData: FormData,
    options: RequestInit = {}
  ): Promise<T> {
    // Don't set Content-Type header for FormData - browser sets it automatically with boundary
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
      headers: {
        ...options.headers,
        // Remove Content-Type to let browser set it with boundary
      },
    });
  }
}

// Create HTTP client instance
const httpClient = new HttpClient(API_BASE_URL);

// API service functions
export const applicationApi = {
  // Submit application
  async submitApplication(data: DistributorFormData): Promise<ApplicationSubmissionResponse> {
    try {
      const applicationData = transformFormDataForSubmission(data);
      
      const formData = new FormData();
      formData.append('data', JSON.stringify(applicationData));
      
      // Add files
      addFilesToFormData(formData, data);

      const response = await httpClient.upload<ApplicationSubmissionResponse>(
        '/applications/submit',
        formData
      );

      return response;
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  },

  // Save draft
  async saveDraft(data: Partial<DistributorFormData>): Promise<DraftResponse> {
    try {
      const draftData = transformFormDataForDraft(data);
      
      const formData = new FormData();
      formData.append('data', JSON.stringify(draftData));
      
      // Add files
      addFilesToFormData(formData, data);

      const response = await httpClient.upload<DraftResponse>(
        '/applications/draft',
        formData
      );

      return response;
    } catch (error) {
      console.error('Error saving draft:', error);
      throw error;
    }
  },

  // Load application by reference number
  async loadApplicationByReference(referenceNumber: string) {
    try {
      const response = await httpClient.get<{ data: any }>(
        `/reference/${referenceNumber}`
      );
      return response.data;
    } catch (error) {
      console.error('Error loading application:', error);
      throw error;
    }
  },

  // Get all applications (for dashboard)
  async getApplications() {
    try {
      const response = await httpClient.get<{ data: any[] }>(
        '/applications'
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  },

  // Get application by ID
  async getApplicationById(id: string) {
    try {
      const response = await httpClient.get<{ data: any }>(
        `/applications/${id}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching application:', error);
      throw error;
    }
  },
};

// Categories API
export const categoriesApi = {
  async getCategories() {
    try {
      const response = await httpClient.get<{ success: boolean; data: any[] }>(
        '/categories'
      );
      
      if (!response.success) {
        throw new ApiError('Failed to fetch categories', 500);
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
};

// Helper functions
function transformFormDataForSubmission(data: DistributorFormData): ApiApplicationData {
  return {
    personalDetails: data.personalDetails,
    businessDetails: data.businessDetails,
    staffInfrastructure: data.staffInfrastructure,
    businessInformation: data.businessInformation,
    retailerRequirements: {
      preferredProducts: data.productsToDistribute?.map(p => p.name).join(', ') || '',
      monthlyOrderQuantity: data.productsToDistribute?.reduce((sum, p) => sum + parseInt(p.monthlySalesCapacity || '0'), 0).toString() || '0',
      paymentPreference: data.businessInformation.paymentPreference || 'नगद',
      creditDays: data.businessInformation.creditDays || 0,
      deliveryPreference: data.businessInformation.deliveryPreference || 'स्वयं उठाउने'
    },
    partnershipDetails: data.partnershipDetails || null,
    additionalInformation: data.additionalInformation,
    declaration: {
      declaration: data.agreementDetails.agreementAccepted === true,
      signature: data.agreementDetails.distributorSignatureName || data.personalDetails.fullName || '',
      date: data.agreementDetails.distributorSignatureDate || getTodayNepaliDate()
    },
    agreement: {
      agreementAccepted: data.agreementDetails.agreementAccepted === true,
      distributorSignatureName: data.agreementDetails.distributorSignatureName || data.personalDetails.fullName || '',
      distributorSignatureDate: data.agreementDetails.distributorSignatureDate || getTodayNepaliDate(),
      digitalSignature: null
    },
    currentTransactions: data.currentTransactions || [],
    productsToDistribute: data.productsToDistribute || [],
    areaCoverageDetails: data.areaCoverageDetails || []
  };
}

function transformFormDataForDraft(data: Partial<DistributorFormData>) {
  return {
    personalDetails: data.personalDetails || {
      fullName: '',
      age: 18,
      gender: 'पुरुष',
      citizenshipNumber: '',
      issuedDistrict: '',
      mobileNumber: '',
      email: '',
      permanentAddress: '',
      temporaryAddress: ''
    },
    businessDetails: data.businessDetails || {
      companyName: '',
      registrationNumber: '',
      panVatNumber: '',
      officeAddress: '',
      operatingArea: '',
      desiredDistributorArea: '',
      currentBusiness: '',
      businessType: ''
    },
    staffInfrastructure: data.staffInfrastructure || {
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
      thelaDetails: ''
    },
    businessInformation: data.businessInformation || {
      productCategory: '',
      yearsInBusiness: 1,
      monthlySales: '0',
      storageFacility: ''
    },
    retailerRequirements: {
      preferredProducts: data.productsToDistribute?.map(p => p.name).join(', ') || '',
      monthlyOrderQuantity: data.productsToDistribute?.reduce((sum, p) => sum + parseInt(p.monthlySalesCapacity || '0'), 0).toString() || '0',
      paymentPreference: data.businessInformation?.paymentPreference || 'नगद',
      creditDays: data.businessInformation?.creditDays || 0,
      deliveryPreference: data.businessInformation?.deliveryPreference || 'स्वयं उठाउने'
    },
    partnershipDetails: data.partnershipDetails || null,
    additionalInformation: data.additionalInformation || {
      additionalInfo1: '',
      additionalInfo2: '',
      additionalInfo3: ''
    },
    declaration: {
      declaration: data.agreementDetails?.agreementAccepted === true,
      signature: data.agreementDetails?.distributorSignatureName || data.personalDetails?.fullName || '',
      date: data.agreementDetails?.distributorSignatureDate || getTodayNepaliDate()
    },
    agreement: {
      agreementAccepted: data.agreementDetails?.agreementAccepted === true,
      distributorSignatureName: data.agreementDetails?.distributorSignatureName || data.personalDetails?.fullName || '',
      distributorSignatureDate: data.agreementDetails?.distributorSignatureDate || getTodayNepaliDate(),
      digitalSignature: null
    },
    currentTransactions: data.currentTransactions || [],
    productsToDistribute: data.productsToDistribute || [],
    areaCoverageDetails: data.areaCoverageDetails || []
  };
}

function addFilesToFormData(formData: FormData, data: Partial<DistributorFormData>) {
  if (data.documentUpload?.citizenshipFile) {
    const file = data.documentUpload.citizenshipFile instanceof FileList
      ? data.documentUpload.citizenshipFile[0]
      : data.documentUpload.citizenshipFile;
    if (file) formData.append('citizenshipId', file);
  }

  if (data.documentUpload?.companyRegistrationFile) {
    const file = data.documentUpload.companyRegistrationFile instanceof FileList
      ? data.documentUpload.companyRegistrationFile[0]
      : data.documentUpload.companyRegistrationFile;
    if (file) formData.append('companyRegistration', file);
  }

  if (data.documentUpload?.panVatFile) {
    const file = data.documentUpload.panVatFile instanceof FileList
      ? data.documentUpload.panVatFile[0]
      : data.documentUpload.panVatFile;
    if (file) formData.append('panVatRegistration', file);
  }

  if (data.documentUpload?.officePhotoFile) {
    const file = data.documentUpload.officePhotoFile instanceof FileList
      ? data.documentUpload.officePhotoFile[0]
      : data.documentUpload.officePhotoFile;
    if (file) formData.append('officePhoto', file);
  }

  if (data.documentUpload?.otherDocumentsFile) {
    const file = data.documentUpload.otherDocumentsFile instanceof FileList
      ? data.documentUpload.otherDocumentsFile[0]
      : data.documentUpload.otherDocumentsFile;
    if (file) formData.append('areaMap', file);
  }
}

// Date utilities
function getTodayNepaliDate(): string {
  const nepaliMonths = [
    'बैशाख', 'जेष्ठ', 'आषाढ़', 'श्रावण', 'भाद्र', 'आश्विन',
    'कार्तिक', 'मार्ग', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'
  ];
  
  const nepaliDays = [
    'आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहिबार', 'शुक्रबार', 'शनिबार'
  ];
  
  const englishDate = new Date();
  const nepaliYear = englishDate.getFullYear() + 57;
  
  const month = englishDate.getMonth();
  const day = englishDate.getDate();
  const dayOfWeek = englishDate.getDay();
  
  return `${nepaliYear} ${nepaliMonths[month]} ${day}, ${nepaliDays[dayOfWeek]}`;
}