import { Request } from 'express';
import { User, DistributorApplication, ApplicationStatus, UserRole } from '@prisma/client';

// Extended Request interface with user
export interface AuthenticatedRequest extends Request {
  user?: User;
}

// API Response interface
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

// Pagination interface
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Filter interfaces
export interface ApplicationFilters {
  status?: ApplicationStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  reviewedBy?: string;
}

// File upload interface
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

// JWT Payload interface
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Application with relations
export interface DistributorApplicationWithRelations extends DistributorApplication {
  currentTransactions?: Array<{
    id: string;
    company: string;
    products: string;
    turnover: string;
  }>;
  productsToDistribute?: Array<{
    id: string;
    productName: string;
    monthlySalesCapacity: string;
  }>;
  areaCoverageDetails?: Array<{
    id: string;
    distributionArea: string;
    populationEstimate: string;
    competitorBrand: string;
  }>;
  reviewedBy?: {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
  };
  createdBy?: {
    id: string;
    fullName: string;
    email: string;
  };
  applicationHistory?: Array<{
    id: string;
    status: ApplicationStatus;
    notes: string | null;
    changedBy: string;
    changedAt: Date;
  }>;
}

// Dashboard statistics
export interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  underReviewApplications: number;
  requiresChangesApplications: number;
  recentApplications: DistributorApplicationWithRelations[];
  applicationsByMonth: Array<{
    month: string;
    count: number;
  }>;
  applicationsByStatus: Array<{
    status: ApplicationStatus;
    count: number;
  }>;
}

// Email notification types
export interface EmailNotification {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

// Application submission data
export interface ApplicationSubmissionData {
  personalDetails: {
    fullName: string;
    age: number;
    gender: string;
    citizenshipNumber: string;
    issuedDistrict: string;
    mobileNumber: string;
    email?: string;
    permanentAddress: string;
    temporaryAddress?: string;
  };
  businessDetails: {
    companyName: string;
    registrationNumber: string;
    panVatNumber: string;
    officeAddress: string;
    operatingArea: string;
    desiredDistributorArea: string;
    currentBusiness: string;
    businessType: string;
  };
  staffInfrastructure: {
    salesManCount: number;
    salesManExperience?: string;
    deliveryStaffCount: number;
    deliveryStaffExperience?: string;
    accountAssistantCount: number;
    accountAssistantExperience?: string;
    otherStaffCount: number;
    otherStaffExperience?: string;
    warehouseSpace: number;
    warehouseDetails?: string;
    truckCount: number;
    truckDetails?: string;
    fourWheelerCount: number;
    fourWheelerDetails?: string;
    twoWheelerCount: number;
    twoWheelerDetails?: string;
    cycleCount: number;
    cycleDetails?: string;
    thelaCount: number;
    thelaDetails?: string;
  };
  currentTransactions: Array<{
    company: string;
    products: string;
    turnover: string;
  }>;
  businessInformation: {
    productCategory: string;
    yearsInBusiness: number;
    monthlySales: string;
    storageFacility: string;
  };
  productsToDistribute: Array<{
    productName: string;
    monthlySalesCapacity: string;
  }>;
  partnershipDetails?: {
    partnerFullName?: string;
    partnerAge?: number;
    partnerGender?: string;
    partnerCitizenshipNumber?: string;
    partnerIssuedDistrict?: string;
    partnerMobileNumber?: string;
    partnerEmail?: string;
    partnerPermanentAddress?: string;
    partnerTemporaryAddress?: string;
  };
  retailerRequirements: {
    preferredProducts: string;
    monthlyOrderQuantity: string;
    paymentPreference: string;
    creditDays?: number;
    deliveryPreference: string;
  };
  areaCoverageDetails: Array<{
    distributionArea: string;
    populationEstimate: string;
    competitorBrand: string;
  }>;
  additionalInformation?: {
    additionalInfo1?: string;
    additionalInfo2?: string;
    additionalInfo3?: string;
  };
  documents?: {
    citizenshipId?: string;
    companyRegistration?: string;
    panVatRegistration?: string;
    officePhoto?: string;
    areaMap?: string;
  };
  declaration: {
    declaration: boolean;
    signature: string;
    date: string;
  };
  agreement: {
    agreementAccepted: boolean;
    distributorSignatureName: string;
    distributorSignatureDate: string;
  };
}

// Auth-related types
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  address: string;
  department: string;
  position: string;
  role: UserRole;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UpdateProfileData {
  fullName?: string;
  username?: string;
  address?: string;
  department?: string;
  position?: string;
}

export interface ApplicationUpdate {
  status: ApplicationStatus;
  reviewNotes?: string;
  reviewedBy: string;
  reviewedAt?: Date;
}

// Distributor creation and management types
export interface CreateDistributorData {
  // Personal Details
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  nationalId: string;
  
  // Company Details
  companyName: string;
  companyType: 'SOLE_PROPRIETORSHIP' | 'PARTNERSHIP' | 'PRIVATE_LIMITED' | 'PUBLIC_LIMITED';
  registrationNumber: string;
  panNumber: string;
  vatNumber?: string;
  establishedDate: string;
  companyAddress: string;
  website?: string;
  description?: string;
  
  // Credentials
  username: string;
  password: string;
  confirmPassword?: string;
}

export interface UpdateDistributorData {
  // Personal Details
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  nationalId?: string;
  
  // Company Details
  companyName?: string;
  companyType?: 'SOLE_PROPRIETORSHIP' | 'PARTNERSHIP' | 'PRIVATE_LIMITED' | 'PUBLIC_LIMITED';
  registrationNumber?: string;
  panNumber?: string;
  vatNumber?: string;
  establishedDate?: string;
  companyAddress?: string;
  website?: string;
  description?: string;
  
  // Credentials
  username?: string;
  password?: string;
  confirmPassword?: string;
  
  // Status
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface DistributorProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: Date;
  nationalId: string;
  companyName: string;
  companyType: string;
  registrationNumber: string;
  panNumber: string;
  vatNumber?: string;
  establishedDate: Date;
  companyAddress: string;
  website?: string;
  description?: string;
  status: string;
  documents?: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DistributorWithProfile extends User {
  distributorProfile?: DistributorProfile;
}

// Category types
export interface CreateCategoryData {
  title: string;
  description?: string;
  slug?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateCategoryData {
  title?: string;
  description?: string;
  slug?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface CategoryWithProducts {
  id: string;
  title: string;
  description?: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
  products: Product[];
  _count?: {
    products: number;
  };
}

// Import Product and Category from Prisma
import { Product, Category } from '@prisma/client';

// Product types
export interface CreateProductData {
  name: string;
  description?: string;
  categoryId: string;
  sku?: string;
  price?: number;
  costPrice?: number;
  stockQuantity?: number;
  minStockLevel?: number;
  weight?: number;
  dimensions?: string; // JSON string
  brand?: string;
  model?: string;
  color?: string;
  size?: string;
  tags?: string; // JSON array as string
  slug?: string;
  isActive?: boolean;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  categoryId?: string;
  sku?: string;
  price?: number;
  costPrice?: number;
  stockQuantity?: number;
  minStockLevel?: number;
  weight?: number;
  dimensions?: string;
  brand?: string;
  model?: string;
  color?: string;
  size?: string;
  tags?: string;
  slug?: string;
  isActive?: boolean;
}

export interface ProductWithCategory {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  price?: number;
  costPrice?: number;
  stockQuantity: number;
  minStockLevel: number;
  isActive: boolean;
  weight?: number;
  dimensions?: string;
  brand?: string;
  model?: string;
  color?: string;
  size?: string;
  images?: string;
  documents?: string;
  slug: string;
  tags?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
  category: Category;
  categoryId: string;
}

// Stock update data type
export interface UpdateStockData {
  stockQuantity: number;
  operation?: 'set' | 'add' | 'subtract';
  reason?: string;
}

// Export Prisma types
export { User, DistributorApplication, ApplicationStatus, UserRole, Category, Product } from '@prisma/client';
