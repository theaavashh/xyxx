import { httpClient, ApiResponse } from './api';

// Types for distributor applications
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
  productCategory?: string;
  yearsInBusiness?: number;
  monthlySales?: string;
  monthlyOrderQuantity?: string;
  paymentPreference?: string;
  creditDays?: number;
  deliveryPreference?: string;
  storageFacility?: string;
  preferredProducts?: string;
  partnerFullName?: string;
  partnerAge?: number;
  partnerGender?: string;
  partnerCitizenshipNumber?: string;
  partnerIssuedDistrict?: string;
  partnerMobileNumber?: string;
  partnerEmail?: string;
  partnerPermanentAddress?: string;
  partnerTemporaryAddress?: string;
  citizenshipId?: string;
  companyRegistration?: string;
  panVatRegistration?: string;
  officePhoto?: string;
  areaMap?: string;
  declaration?: boolean;
  signature?: string;
  date?: string;
  agreementAccepted?: boolean;
  distributorSignatureName?: string;
  distributorSignatureDate?: string;
  reviewNotes?: string;
  reviewedAt?: string;
  reviewedById?: string;
  createdById?: string;
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

// API service for distributor applications
export class DistributorApiService {
  // Get all distributor applications with filters
  async getApplications(filters: ApplicationFilters = {}): Promise<ApiResponse<ApplicationsResponse>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    // Use dev endpoint for now since it doesn't require authentication
    const endpoint = `/applications/dev${queryString ? `?${queryString}` : ''}`;

    return httpClient.get<ApplicationsResponse>(endpoint);
  }

  // Get single application by ID
  async getApplicationById(id: string): Promise<ApiResponse<{ application: DistributorApplication }>> {
    return httpClient.get<{ application: DistributorApplication }>(`/applications/dev/${id}`);
  }

  // Update application status
  async updateApplicationStatus(
    id: string, 
    status: string, 
    notes?: string
  ): Promise<ApiResponse<{ message: string }>> {
    return httpClient.put<{ message: string }>(`/applications/dev/${id}/status`, { status, notes });
  }

  // Get application statistics
  async getApplicationStats(): Promise<ApiResponse<any>> {
    return httpClient.get<any>('/applications/dev/stats');
  }

  // Approve application
  async approveApplication(id: string, notes?: string): Promise<ApiResponse<{ message: string }>> {
    return this.updateApplicationStatus(id, 'APPROVED', notes);
  }

  // Reject application
  async rejectApplication(id: string, notes?: string): Promise<ApiResponse<{ message: string }>> {
    return this.updateApplicationStatus(id, 'REJECTED', notes);
  }

  // Delete application
  async deleteApplication(id: string): Promise<ApiResponse<{ message: string }>> {
    return httpClient.delete<{ message: string }>(`/applications/dev/${id}`);
  }
}

// Export singleton instance
export const distributorApiService = new DistributorApiService();

// Export individual functions for convenience
export const {
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  getApplicationStats,
  approveApplication,
  rejectApplication,
  deleteApplication,
} = distributorApiService;
