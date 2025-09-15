// API service for distributor applications
import { config } from './config';

const API_BASE_URL = config.apiUrl;

export interface DistributorApplication {
  id: string;
  fullName: string;
  age?: number;
  gender?: string;
  citizenshipNumber?: string;
  issuedDistrict?: string;
  mobileNumber?: string;
  email?: string;
  permanentAddress?: string;
  temporaryAddress?: string;
  companyName?: string;
  registrationNumber?: string;
  panVatNumber?: string;
  officeAddress?: string;
  operatingArea?: string;
  desiredDistributorArea?: string;
  currentBusiness?: string;
  businessType?: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'REQUIRES_CHANGES';
  createdAt: string;
  updatedAt: string;
  reviewedBy?: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
  createdBy?: {
    id: string;
    fullName: string;
    email: string;
  };
  currentTransactions?: Array<{
    id: string;
    company: string;
    products: string;
    turnover: number;
  }>;
  productsToDistribute?: Array<{
    id: string;
    productName: string;
    monthlySalesCapacity: number;
  }>;
  areaCoverageDetails?: Array<{
    id: string;
    distributionArea: string;
    populationEstimate: number;
    competitorBrand: string;
  }>;
  applicationHistory?: Array<{
    id: string;
    status: string;
    notes: string;
    changedBy: string;
    changedAt: string;
  }>;
}

export interface ApplicationsResponse {
  success: boolean;
  message: string;
  data: DistributorApplication[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApplicationFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'REQUIRES_CHANGES';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  reviewedBy?: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    console.log('🌐 API Request:', { url, method: options.method || 'GET', config });

    try {
      const response = await fetch(url, config);
      
      console.log('📡 API Response:', { 
        status: response.status, 
        statusText: response.statusText,
        url: response.url 
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error:', errorData);
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log('✅ API Success:', data);
      return data;
    } catch (error) {
      console.error('💥 API request failed:', error);
      throw error;
    }
  }

  // Get all distributor applications with filters
  async getApplications(filters: ApplicationFilters = {}): Promise<ApplicationsResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    // Use development endpoint in development mode
    const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    const endpoint = `/applications${isDev ? '/dev' : ''}${queryString ? `?${queryString}` : ''}`;
    
    console.log('🔧 API Service Debug:', {
      isDev,
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
      endpoint,
      baseURL: this.baseURL,
      fullURL: `${this.baseURL}${endpoint}`
    });

    return this.request<ApplicationsResponse>(endpoint, {
      method: 'GET',
    });
  }

  // Get single application by ID
  async getApplicationById(id: string): Promise<{ success: boolean; data: { application: DistributorApplication } }> {
    const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    const endpoint = `/applications${isDev ? '/dev' : ''}/${id}`;
    
    return this.request<{ success: boolean; data: { application: DistributorApplication } }>(endpoint, {
      method: 'GET',
    });
  }

  // Update application status
  async updateApplicationStatus(
    id: string, 
    status: string, 
    notes?: string
  ): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  }

  // Get application statistics
  async getApplicationStats(): Promise<{ success: boolean; data: any }> {
    const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    const endpoint = `/applications${isDev ? '/dev/stats' : '/stats'}`;
    
    return this.request<{ success: boolean; data: any }>(endpoint, {
      method: 'GET',
    });
  }

  // Submit new application (if needed for testing)
  async submitApplication(applicationData: any): Promise<{ success: boolean; data: { application: DistributorApplication } }> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(applicationData));

    return this.request<{ success: boolean; data: { application: DistributorApplication } }>('/applications/submit', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it
      },
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export individual functions for convenience
export const {
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  getApplicationStats,
  submitApplication,
} = apiService;
