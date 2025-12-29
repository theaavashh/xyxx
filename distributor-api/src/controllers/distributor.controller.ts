import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { 
  ApiResponse, 
  AuthenticatedRequest, 
  ApplicationSubmissionData,
  DistributorApplicationWithRelations,
  PaginatedResponse,
  PaginationParams,
  ApplicationFilters,
  ApplicationUpdate
} from '../types';
import { asyncHandler } from '../middleware/error.middleware';
import { getFilePaths } from '../middleware/upload.middleware';
import mailjetEmailService from '../services/mailjet.service';

const prisma = new PrismaClient();

// Submit distributor application
export const submitApplication = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // Parse JSON data from FormData
  let applicationData: ApplicationSubmissionData;
  
  try {
    if (req.body.data) {
      // Data sent as JSON string in FormData
      applicationData = JSON.parse(req.body.data);
    } else {
      // Data sent as regular JSON
      applicationData = req.body;
    }
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: 'अवैध डाटा ढाँचा',
      error: 'INVALID_DATA_FORMAT'
    };
    res.status(400).json(response);
    return;
  }

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  // Get file paths if files were uploaded
  const filePaths = files ? getFilePaths(files) : {};

  // Validate required fields
  if (!applicationData.personalDetails?.fullName) {
    const response: ApiResponse = {
      success: false,
      message: 'व्यक्तिगत विवरण आवश्यक छ',
      error: 'MISSING_PERSONAL_DETAILS'
    };
    res.status(400).json(response);
    return;
  }

  // Log received data in development
  if (process.env.NODE_ENV === 'development') {
    console.log('📋 Application Data Received:', JSON.stringify(applicationData, null, 2));
    console.log('📁 Files Received:', filePaths);
  }

  // Create application with all related data
  const application = await prisma.distributorApplication.create({
    data: {
      // Personal Details
      fullName: applicationData.personalDetails.fullName,
      age: applicationData.personalDetails.age,
      gender: applicationData.personalDetails.gender,
      citizenshipNumber: applicationData.personalDetails.citizenshipNumber,
      issuedDistrict: applicationData.personalDetails.issuedDistrict,
      mobileNumber: applicationData.personalDetails.mobileNumber,
      email: applicationData.personalDetails.email,
      permanentAddress: applicationData.personalDetails.permanentAddress,
      temporaryAddress: applicationData.personalDetails.temporaryAddress,

      // Business Details
      companyName: applicationData.businessDetails.companyName,
      registrationNumber: applicationData.businessDetails.registrationNumber,
      panVatNumber: applicationData.businessDetails.panVatNumber,
      officeAddress: applicationData.businessDetails.officeAddress,
      operatingArea: applicationData.businessDetails.operatingArea,
      desiredDistributorArea: applicationData.businessDetails.desiredDistributorArea,
      currentBusiness: applicationData.businessDetails.currentBusiness,
      businessType: applicationData.businessDetails.businessType,

      // Staff and Infrastructure
      salesManCount: applicationData.staffInfrastructure.salesManCount,
      salesManExperience: applicationData.staffInfrastructure.salesManExperience,
      deliveryStaffCount: applicationData.staffInfrastructure.deliveryStaffCount,
      deliveryStaffExperience: applicationData.staffInfrastructure.deliveryStaffExperience,
      accountAssistantCount: applicationData.staffInfrastructure.accountAssistantCount,
      accountAssistantExperience: applicationData.staffInfrastructure.accountAssistantExperience,
      otherStaffCount: applicationData.staffInfrastructure.otherStaffCount,
      otherStaffExperience: applicationData.staffInfrastructure.otherStaffExperience,
      warehouseSpace: applicationData.staffInfrastructure.warehouseSpace,
      warehouseDetails: applicationData.staffInfrastructure.warehouseDetails,
      truckCount: applicationData.staffInfrastructure.truckCount,
      truckDetails: applicationData.staffInfrastructure.truckDetails,
      fourWheelerCount: applicationData.staffInfrastructure.fourWheelerCount,
      fourWheelerDetails: applicationData.staffInfrastructure.fourWheelerDetails,
      twoWheelerCount: applicationData.staffInfrastructure.twoWheelerCount,
      twoWheelerDetails: applicationData.staffInfrastructure.twoWheelerDetails,
      cycleCount: applicationData.staffInfrastructure.cycleCount,
      cycleDetails: applicationData.staffInfrastructure.cycleDetails,
      thelaCount: applicationData.staffInfrastructure.thelaCount,
      thelaDetails: applicationData.staffInfrastructure.thelaDetails,

      // Business Information
      productCategory: applicationData.businessInformation.productCategory,
      yearsInBusiness: applicationData.businessInformation.yearsInBusiness,
      monthlySales: applicationData.businessInformation.monthlySales,
      storageFacility: applicationData.businessInformation.storageFacility,

      // Retailer Requirements
      preferredProducts: applicationData.retailerRequirements.preferredProducts,
      monthlyOrderQuantity: applicationData.retailerRequirements.monthlyOrderQuantity,
      paymentPreference: applicationData.retailerRequirements.paymentPreference,
      creditDays: applicationData.retailerRequirements.creditDays,
      deliveryPreference: applicationData.retailerRequirements.deliveryPreference,

      // Partnership Details (optional)
      partnerFullName: applicationData.partnershipDetails?.partnerFullName,
      partnerAge: applicationData.partnershipDetails?.partnerAge,
      partnerGender: applicationData.partnershipDetails?.partnerGender,
      partnerCitizenshipNumber: applicationData.partnershipDetails?.partnerCitizenshipNumber,
      partnerIssuedDistrict: applicationData.partnershipDetails?.partnerIssuedDistrict,
      partnerMobileNumber: applicationData.partnershipDetails?.partnerMobileNumber,
      partnerEmail: applicationData.partnershipDetails?.partnerEmail,
      partnerPermanentAddress: applicationData.partnershipDetails?.partnerPermanentAddress,
      partnerTemporaryAddress: applicationData.partnershipDetails?.partnerTemporaryAddress,

      // Additional Information
      additionalInfo1: applicationData.additionalInformation?.additionalInfo1,
      additionalInfo2: applicationData.additionalInformation?.additionalInfo2,
      additionalInfo3: applicationData.additionalInformation?.additionalInfo3,

      // Documents
      citizenshipId: filePaths.citizenshipId,
      companyRegistration: filePaths.companyRegistration,
      panVatRegistration: filePaths.panVatRegistration,
      officePhoto: filePaths.officePhoto,
      areaMap: filePaths.areaMap,

      // Declaration
      declaration: applicationData.declaration.declaration,
      signature: applicationData.declaration.signature,
      date: applicationData.declaration.date,
      
      // Agreement
      agreementAccepted: applicationData.agreement.agreementAccepted,
      distributorSignatureName: applicationData.agreement.distributorSignatureName,
      distributorSignatureDate: applicationData.agreement.distributorSignatureDate,

      // Relations
      currentTransactions: {
        create: applicationData.currentTransactions?.filter(ct => ct.company && ct.products).map(ct => ({
          company: ct.company,
          products: ct.products,
          turnover: ct.turnover
        })) || []
      },
      productsToDistribute: {
        create: applicationData.productsToDistribute?.filter(pd => pd.productName).map(pd => ({
          productName: pd.productName,
          monthlySalesCapacity: pd.monthlySalesCapacity
        })) || []
      },
      areaCoverageDetails: {
        create: applicationData.areaCoverageDetails?.filter(acd => acd.distributionArea).map(acd => ({
          distributionArea: acd.distributionArea,
          populationEstimate: acd.populationEstimate,
          competitorBrand: acd.competitorBrand
        })) || []
      },
      applicationHistory: {
        create: {
          status: 'PENDING',
          notes: 'आवेदन पेश गरिएको',
          changedBy: 'System',
          changedAt: new Date()
        }
      }
    },
    include: {
      currentTransactions: true,
      productsToDistribute: true,
      areaCoverageDetails: true,
      applicationHistory: true
    }
  });

  const response: ApiResponse = {
    success: true,
    message: 'आवेदन सफलतापूर्वक पेश गरिएको छ',
    data: { application }
  };

  res.status(201).json(response);
});

// Get all applications with filtering and pagination
export const getApplications = asyncHandler(async (req: AuthenticatedRequest | Request, res: Response): Promise<void> => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    status,
    dateFrom,
    dateTo,
    search,
    reviewedBy
  } = req.query as any;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  // Build where clause
  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) {
      where.createdAt.gte = new Date(dateFrom);
    }
    if (dateTo) {
      where.createdAt.lte = new Date(dateTo);
    }
  }

  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { companyName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { mobileNumber: { contains: search } },
      { citizenshipNumber: { contains: search } }
    ];
  }

  if (reviewedBy) {
    where.reviewedById = reviewedBy;
  }

  // Role-based filtering (only if user is authenticated)
  const authenticatedReq = req as AuthenticatedRequest;
  if (authenticatedReq.user?.role === 'SALES_REPRESENTATIVE') {
    where.OR = [
      { createdById: authenticatedReq.user.id },
      { reviewedById: authenticatedReq.user.id }
    ];
  }

  const [applications, total] = await Promise.all([
    prisma.distributorApplication.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
      include: {
        currentTransactions: true,
        productsToDistribute: true,
        areaCoverageDetails: true,
        reviewedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true
          }
        },
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        applicationHistory: {
          orderBy: { changedAt: 'desc' },
          take: 5
        }
      }
    }),
    prisma.distributorApplication.count({ where })
  ]);

  const totalPages = Math.ceil(total / take);

  const response: PaginatedResponse<DistributorApplicationWithRelations> = {
    success: true,
    message: 'आवेदनहरू सफलतापूर्वक प्राप्त भयो',
    data: applications as DistributorApplicationWithRelations[],
    pagination: {
      page: parseInt(page),
      limit: take,
      total,
      totalPages,
      hasNext: parseInt(page) < totalPages,
      hasPrev: parseInt(page) > 1
    }
  };

  res.status(200).json(response);
});

// Get single application by ID
export const getApplicationById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const application = await prisma.distributorApplication.findUnique({
    where: { id },
    include: {
      currentTransactions: true,
      productsToDistribute: true,
      areaCoverageDetails: true,
      reviewedBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true
        }
      },
      createdBy: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      },
      applicationHistory: {
        orderBy: { changedAt: 'desc' }
      }
    }
  });

  if (!application) {
    const response: ApiResponse = {
      success: false,
      message: 'आवेदन फेला परेन',
      error: 'APPLICATION_NOT_FOUND'
    };
    res.status(404).json(response);
    return;
  }

  const response: ApiResponse = {
    success: true,
    message: 'आवेदन सफलतापूर्वक प्राप्त भयो',
    data: { application }
  };

  res.status(200).json(response);
});

// Update application status (for sales team)
export const updateApplicationStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    const response: ApiResponse = {
      success: false,
      message: 'प्रमाणीकरण आवश्यक छ',
      error: 'AUTHENTICATION_REQUIRED'
    };
    res.status(401).json(response);
    return;
  }

  const { id } = req.params;
  const updateData: ApplicationUpdate = req.body;

  // Check if application exists
  const existingApplication = await prisma.distributorApplication.findUnique({
    where: { id },
    select: { id: true, status: true }
  });

  if (!existingApplication) {
    const response: ApiResponse = {
      success: false,
      message: 'आवेदन फेला परेन',
      error: 'APPLICATION_NOT_FOUND'
    };
    res.status(404).json(response);
    return;
  }

  // If approving application, DO NOT create user account automatically
  // Admin will create user account separately through modal with custom credentials
  if (updateData.status === 'APPROVED') {
    // Just check if application exists, no auto-creation of user account
    const application = await prisma.distributorApplication.findUnique({
      where: { id },
      select: { id: true, status: true }
    });

    if (!application) {
      const response: ApiResponse = {
        success: false,
        message: 'आवेदन फेला परेन',
        error: 'APPLICATION_NOT_FOUND'
      };
      res.status(404).json(response);
      return;
    }
  }

  // Update application
  const updatedApplication = await prisma.distributorApplication.update({
    where: { id },
    data: {
      status: updateData.status,
      reviewNotes: updateData.reviewNotes,
      reviewedBy: { connect: { id: req.user.id } },
      reviewedAt: new Date(),
      applicationHistory: {
        create: {
          status: updateData.status,
          notes: updateData.reviewNotes || `स्थिति परिवर्तन: ${updateData.status}`,
          changedBy: req.user.fullName,
          changedAt: new Date()
        }
      }
    },
    include: {
      currentTransactions: true,
      productsToDistribute: true,
      areaCoverageDetails: true,
      reviewedBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true
        }
      },
      applicationHistory: {
        orderBy: { changedAt: 'desc' },
        take: 5
      }
    }
  });

  // Send email notification if application is approved (without credentials)
  if (updateData.status === 'APPROVED') {
    try {
      const emailData = {
        applicationId: updatedApplication.id,
        fullName: updatedApplication.fullName,
        email: updatedApplication.email,
        companyName: updatedApplication.companyName,
        distributionArea: updatedApplication.desiredDistributorArea,
        businessType: updatedApplication.businessType,
        reviewNotes: updateData.reviewNotes
      };

      // Send email without credentials (credentials will be set later through modal)
      await mailjetEmailService.notifyDistributorApproved(emailData);
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
      // Don't fail the approval process if email fails
    }
  }

  const response: ApiResponse = {
    success: true,
    message: 'आवेदनको स्थिति सफलतापूर्वक अपडेट भयो',
    data: { application: updatedApplication }
  };

  res.status(200).json(response);
});

// Update application status (development version - no auth required)
export const updateApplicationStatusDev = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const updateData: ApplicationUpdate = req.body;

  // Check if application exists
  const existingApplication = await prisma.distributorApplication.findUnique({
    where: { id },
    select: { id: true, status: true }
  });

  if (!existingApplication) {
    const response: ApiResponse = {
      success: false,
      message: 'आवेदन फेला परेन',
      error: 'APPLICATION_NOT_FOUND'
    };
    res.status(404).json(response);
    return;
  }

  // If approving application, DO NOT create user account automatically
  // Admin will create user account separately through modal with custom credentials
  if (updateData.status === 'APPROVED') {
    // Just check if application exists, no auto-creation of user account
    const application = await prisma.distributorApplication.findUnique({
      where: { id },
      select: { id: true, status: true }
    });

    if (!application) {
      const response: ApiResponse = {
        success: false,
        message: 'आवेदन फेला परेन',
        error: 'APPLICATION_NOT_FOUND'
      };
      res.status(404).json(response);
      return;
    }
  }

  // Update application (without user info for dev)
  const updatedApplication = await prisma.distributorApplication.update({
    where: { id },
    data: {
      status: updateData.status,
      reviewNotes: updateData.reviewNotes,
      reviewedAt: new Date(),
      applicationHistory: {
        create: {
          status: updateData.status,
          notes: updateData.reviewNotes || `स्थिति परिवर्तन: ${updateData.status}`,
          changedBy: 'Development User',
          changedAt: new Date()
        }
      }
    },
    include: {
      currentTransactions: true,
      productsToDistribute: true,
      areaCoverageDetails: true,
      reviewedBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true
        }
      },
      applicationHistory: {
        orderBy: { changedAt: 'desc' },
        take: 5
      }
    }
  });

  // Send email notification if application is approved (dev version, without credentials)
  if (updateData.status === 'APPROVED') {
    try {
      const emailData = {
        applicationId: updatedApplication.id,
        fullName: updatedApplication.fullName,
        email: updatedApplication.email,
        companyName: updatedApplication.companyName,
        distributionArea: updatedApplication.desiredDistributorArea,
        businessType: updatedApplication.businessType,
        reviewNotes: updateData.reviewNotes
      };

      // Send email without credentials (credentials will be set later through modal)
      await mailjetEmailService.notifyDistributorApproved(emailData);
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
      // Don't fail the approval process if email fails
    }
  }

  const response: ApiResponse = {
    success: true,
    message: 'आवेदनको स्थिति सफलतापूर्वक अपडेट भयो',
    data: { application: updatedApplication }
  };

  res.status(200).json(response);
});

// Delete application (soft delete by setting status to cancelled)
export const deleteApplication = asyncHandler(async (req: AuthenticatedRequest | Request, res: Response): Promise<void> => {
  const authenticatedReq = req as AuthenticatedRequest;
  
  // In development mode without authentication, allow deletion
  const isDev = process.env.NODE_ENV === 'development';
  
  if (!isDev && !authenticatedReq.user) {
    const response: ApiResponse = {
      success: false,
      message: 'प्रमाणीकरण आवश्यक छ',
      error: 'AUTHENTICATION_REQUIRED'
    };
    res.status(401).json(response);
    return;
  }

  const { id } = req.params;

  // Check if application exists
  const existingApplication = await prisma.distributorApplication.findUnique({
    where: { id },
    select: { id: true, status: true }
  });

  if (!existingApplication) {
    const response: ApiResponse = {
      success: false,
      message: 'आवेदन फेला परेन',
      error: 'APPLICATION_NOT_FOUND'
    };
    res.status(404).json(response);
    return;
  }

  // Only allow deletion of pending applications (except in dev mode or for admins)
  const isAdmin = authenticatedReq.user?.role === 'ADMIN' || authenticatedReq.user?.role === 'MANAGERIAL';
  
  if (existingApplication.status !== 'PENDING' && !isDev && !isAdmin) {
    const response: ApiResponse = {
      success: false,
      message: 'केवल पेन्डिङ आवेदनहरू मेटाउन सकिन्छ',
      error: 'CANNOT_DELETE_PROCESSED_APPLICATION'
    };
    res.status(400).json(response);
    return;
  }

  // Soft delete by updating status
  const updateData: any = {
    status: 'REJECTED',
    reviewNotes: 'आवेदन रद्द गरिएको',
    reviewedAt: new Date(),
    applicationHistory: {
      create: {
        status: 'REJECTED',
        notes: 'आवेदन रद्द गरिएको',
        changedBy: authenticatedReq.user?.fullName || 'System',
        changedAt: new Date()
      }
    }
  };

  // Only add reviewedBy if user exists
  if (authenticatedReq.user) {
    updateData.reviewedBy = { connect: { id: authenticatedReq.user.id } };
  }

  await prisma.distributorApplication.update({
    where: { id },
    data: updateData
  });

  const response: ApiResponse = {
    success: true,
    message: 'आवेदन सफलतापूर्वक रद्द गरिएको छ'
  };

  res.status(200).json(response);
});

// Get application statistics
export const getApplicationStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const [
    totalApplications,
    pendingApplications,
    approvedApplications,
    rejectedApplications,
    underReviewApplications,
    requiresChangesApplications
  ] = await Promise.all([
    prisma.distributorApplication.count(),
    prisma.distributorApplication.count({ where: { status: 'PENDING' } }),
    prisma.distributorApplication.count({ where: { status: 'APPROVED' } }),
    prisma.distributorApplication.count({ where: { status: 'REJECTED' } }),
    prisma.distributorApplication.count({ where: { status: 'UNDER_REVIEW' } }),
    prisma.distributorApplication.count({ where: { status: 'REQUIRES_CHANGES' } })
  ]);

  // Get recent applications
  const recentApplications = await prisma.distributorApplication.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      reviewedBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true
        }
      }
    }
  });

  // Get applications by month (last 12 months)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const applicationsByMonth = await prisma.$queryRaw`
    SELECT 
      DATE_TRUNC('month', "createdAt") as month,
      COUNT(*)::int as count
    FROM "distributor_applications"
    WHERE "createdAt" >= ${twelveMonthsAgo}
    GROUP BY DATE_TRUNC('month', "createdAt")
    ORDER BY month ASC
  ` as Array<{ month: Date; count: number }>;

  const stats = {
    totalApplications,
    pendingApplications,
    approvedApplications,
    rejectedApplications,
    underReviewApplications,
    requiresChangesApplications,
    recentApplications,
    applicationsByMonth: applicationsByMonth.map(item => ({
      month: item.month.toISOString().substring(0, 7), // YYYY-MM format
      count: item.count
    })),
    applicationsByStatus: [
      { status: 'PENDING', count: pendingApplications },
      { status: 'UNDER_REVIEW', count: underReviewApplications },
      { status: 'APPROVED', count: approvedApplications },
      { status: 'REJECTED', count: rejectedApplications },
      { status: 'REQUIRES_CHANGES', count: requiresChangesApplications }
    ]
  };

  const response: ApiResponse = {
    success: true,
    message: 'आवेदन तथ्याङ्क सफलतापूर्वक प्राप्त भयो',
    data: stats
  };

  res.status(200).json(response);
});

// Save draft application with reference number
export const saveDraftApplication = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // Parse JSON data from FormData
  let applicationData: ApplicationSubmissionData;
  
  try {
    if (req.body.data) {
      // Data sent as JSON string in FormData
      applicationData = JSON.parse(req.body.data);
    } else {
      // Data sent as regular JSON
      applicationData = req.body;
    }
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: 'अवैध डाटा ढाँचा',
      error: 'INVALID_DATA_FORMAT'
    };
    res.status(400).json(response);
    return;
  }

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  // Get file paths if files were uploaded
  const filePaths = files ? getFilePaths(files) : {};

  // Generate a unique reference number
  const referenceNumber = `DRAFT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  // Create or update draft application
  const application = await prisma.distributorApplication.upsert({
    where: { referenceNumber },
    update: {
      // Update all fields with new data
      fullName: applicationData.personalDetails.fullName,
      age: applicationData.personalDetails.age,
      gender: applicationData.personalDetails.gender,
      citizenshipNumber: applicationData.personalDetails.citizenshipNumber,
      issuedDistrict: applicationData.personalDetails.issuedDistrict,
      mobileNumber: applicationData.personalDetails.mobileNumber,
      email: applicationData.personalDetails.email,
      permanentAddress: applicationData.personalDetails.permanentAddress,
      temporaryAddress: applicationData.personalDetails.temporaryAddress,
      
      // Business Details
      companyName: applicationData.businessDetails.companyName,
      registrationNumber: applicationData.businessDetails.registrationNumber,
      panVatNumber: applicationData.businessDetails.panVatNumber,
      officeAddress: applicationData.businessDetails.officeAddress,
      operatingArea: applicationData.businessDetails.operatingArea,
      desiredDistributorArea: applicationData.businessDetails.desiredDistributorArea,
      currentBusiness: applicationData.businessDetails.currentBusiness,
      businessType: applicationData.businessDetails.businessType,
      
      // Staff and Infrastructure
      salesManCount: applicationData.staffInfrastructure.salesManCount,
      salesManExperience: applicationData.staffInfrastructure.salesManExperience,
      deliveryStaffCount: applicationData.staffInfrastructure.deliveryStaffCount,
      deliveryStaffExperience: applicationData.staffInfrastructure.deliveryStaffExperience,
      accountAssistantCount: applicationData.staffInfrastructure.accountAssistantCount,
      accountAssistantExperience: applicationData.staffInfrastructure.accountAssistantExperience,
      otherStaffCount: applicationData.staffInfrastructure.otherStaffCount,
      otherStaffExperience: applicationData.staffInfrastructure.otherStaffExperience,
      warehouseSpace: applicationData.staffInfrastructure.warehouseSpace,
      warehouseDetails: applicationData.staffInfrastructure.warehouseDetails,
      truckCount: applicationData.staffInfrastructure.truckCount,
      truckDetails: applicationData.staffInfrastructure.truckDetails,
      fourWheelerCount: applicationData.staffInfrastructure.fourWheelerCount,
      fourWheelerDetails: applicationData.staffInfrastructure.fourWheelerDetails,
      twoWheelerCount: applicationData.staffInfrastructure.twoWheelerCount,
      twoWheelerDetails: applicationData.staffInfrastructure.twoWheelerDetails,
      cycleCount: applicationData.staffInfrastructure.cycleCount,
      cycleDetails: applicationData.staffInfrastructure.cycleDetails,
      thelaCount: applicationData.staffInfrastructure.thelaCount,
      thelaDetails: applicationData.staffInfrastructure.thelaDetails,
      
      // Business Information
      productCategory: applicationData.businessInformation.productCategory,
      yearsInBusiness: applicationData.businessInformation.yearsInBusiness,
      monthlySales: applicationData.businessInformation.monthlySales,
      storageFacility: applicationData.businessInformation.storageFacility,
      
      // Retailer Requirements
      preferredProducts: applicationData.retailerRequirements.preferredProducts,
      monthlyOrderQuantity: applicationData.retailerRequirements.monthlyOrderQuantity,
      paymentPreference: applicationData.retailerRequirements.paymentPreference,
      creditDays: applicationData.retailerRequirements.creditDays,
      deliveryPreference: applicationData.retailerRequirements.deliveryPreference,
      
      // Partnership Details (optional)
      partnerFullName: applicationData.partnershipDetails?.partnerFullName,
      partnerAge: applicationData.partnershipDetails?.partnerAge,
      partnerGender: applicationData.partnershipDetails?.partnerGender,
      partnerCitizenshipNumber: applicationData.partnershipDetails?.partnerCitizenshipNumber,
      partnerIssuedDistrict: applicationData.partnershipDetails?.partnerIssuedDistrict,
      partnerMobileNumber: applicationData.partnershipDetails?.partnerMobileNumber,
      partnerEmail: applicationData.partnershipDetails?.partnerEmail,
      partnerPermanentAddress: applicationData.partnershipDetails?.partnerPermanentAddress,
      partnerTemporaryAddress: applicationData.partnershipDetails?.partnerTemporaryAddress,
      
      // Additional Information
      additionalInfo1: applicationData.additionalInformation?.additionalInfo1,
      additionalInfo2: applicationData.additionalInformation?.additionalInfo2,
      additionalInfo3: applicationData.additionalInformation?.additionalInfo3,
      
      // Documents
      citizenshipId: filePaths.citizenshipId,
      companyRegistration: filePaths.companyRegistration,
      panVatRegistration: filePaths.panVatRegistration,
      officePhoto: filePaths.officePhoto,
      areaMap: filePaths.areaMap,
      
      // Declaration
      declaration: applicationData.declaration.declaration,
      signature: applicationData.declaration.signature,
      date: applicationData.declaration.date,
      
      // Agreement
      agreementAccepted: applicationData.agreement.agreementAccepted,
      distributorSignatureName: applicationData.agreement.distributorSignatureName,
      distributorSignatureDate: applicationData.agreement.distributorSignatureDate,
      
      // Update status to DRAFT
      status: 'PENDING', // Draft applications remain in PENDING status until submitted
      updatedAt: new Date()
    },
    create: {
      referenceNumber,
      // Personal Details
      fullName: applicationData.personalDetails.fullName,
      age: applicationData.personalDetails.age,
      gender: applicationData.personalDetails.gender,
      citizenshipNumber: applicationData.personalDetails.citizenshipNumber,
      issuedDistrict: applicationData.personalDetails.issuedDistrict,
      mobileNumber: applicationData.personalDetails.mobileNumber,
      email: applicationData.personalDetails.email,
      permanentAddress: applicationData.personalDetails.permanentAddress,
      temporaryAddress: applicationData.personalDetails.temporaryAddress,
      
      // Business Details
      companyName: applicationData.businessDetails.companyName,
      registrationNumber: applicationData.businessDetails.registrationNumber,
      panVatNumber: applicationData.businessDetails.panVatNumber,
      officeAddress: applicationData.businessDetails.officeAddress,
      operatingArea: applicationData.businessDetails.operatingArea,
      desiredDistributorArea: applicationData.businessDetails.desiredDistributorArea,
      currentBusiness: applicationData.businessDetails.currentBusiness,
      businessType: applicationData.businessDetails.businessType,
      
      // Staff and Infrastructure
      salesManCount: applicationData.staffInfrastructure.salesManCount,
      salesManExperience: applicationData.staffInfrastructure.salesManExperience,
      deliveryStaffCount: applicationData.staffInfrastructure.deliveryStaffCount,
      deliveryStaffExperience: applicationData.staffInfrastructure.deliveryStaffExperience,
      accountAssistantCount: applicationData.staffInfrastructure.accountAssistantCount,
      accountAssistantExperience: applicationData.staffInfrastructure.accountAssistantExperience,
      otherStaffCount: applicationData.staffInfrastructure.otherStaffCount,
      otherStaffExperience: applicationData.staffInfrastructure.otherStaffExperience,
      warehouseSpace: applicationData.staffInfrastructure.warehouseSpace,
      warehouseDetails: applicationData.staffInfrastructure.warehouseDetails,
      truckCount: applicationData.staffInfrastructure.truckCount,
      truckDetails: applicationData.staffInfrastructure.truckDetails,
      fourWheelerCount: applicationData.staffInfrastructure.fourWheelerCount,
      fourWheelerDetails: applicationData.staffInfrastructure.fourWheelerDetails,
      twoWheelerCount: applicationData.staffInfrastructure.twoWheelerCount,
      twoWheelerDetails: applicationData.staffInfrastructure.twoWheelerDetails,
      cycleCount: applicationData.staffInfrastructure.cycleCount,
      cycleDetails: applicationData.staffInfrastructure.cycleDetails,
      thelaCount: applicationData.staffInfrastructure.thelaCount,
      thelaDetails: applicationData.staffInfrastructure.thelaDetails,
      
      // Business Information
      productCategory: applicationData.businessInformation.productCategory,
      yearsInBusiness: applicationData.businessInformation.yearsInBusiness,
      monthlySales: applicationData.businessInformation.monthlySales,
      storageFacility: applicationData.businessInformation.storageFacility,
      
      // Retailer Requirements
      preferredProducts: applicationData.retailerRequirements.preferredProducts,
      monthlyOrderQuantity: applicationData.retailerRequirements.monthlyOrderQuantity,
      paymentPreference: applicationData.retailerRequirements.paymentPreference,
      creditDays: applicationData.retailerRequirements.creditDays,
      deliveryPreference: applicationData.retailerRequirements.deliveryPreference,
      
      // Partnership Details (optional)
      partnerFullName: applicationData.partnershipDetails?.partnerFullName,
      partnerAge: applicationData.partnershipDetails?.partnerAge,
      partnerGender: applicationData.partnershipDetails?.partnerGender,
      partnerCitizenshipNumber: applicationData.partnershipDetails?.partnerCitizenshipNumber,
      partnerIssuedDistrict: applicationData.partnershipDetails?.partnerIssuedDistrict,
      partnerMobileNumber: applicationData.partnershipDetails?.partnerMobileNumber,
      partnerEmail: applicationData.partnershipDetails?.partnerEmail,
      partnerPermanentAddress: applicationData.partnershipDetails?.partnerPermanentAddress,
      partnerTemporaryAddress: applicationData.partnershipDetails?.partnerTemporaryAddress,
      
      // Additional Information
      additionalInfo1: applicationData.additionalInformation?.additionalInfo1,
      additionalInfo2: applicationData.additionalInformation?.additionalInfo2,
      additionalInfo3: applicationData.additionalInformation?.additionalInfo3,
      
      // Documents
      citizenshipId: filePaths.citizenshipId,
      companyRegistration: filePaths.companyRegistration,
      panVatRegistration: filePaths.panVatRegistration,
      officePhoto: filePaths.officePhoto,
      areaMap: filePaths.areaMap,
      
      // Declaration
      declaration: applicationData.declaration.declaration,
      signature: applicationData.declaration.signature,
      date: applicationData.declaration.date,
      
      // Agreement
      agreementAccepted: applicationData.agreement.agreementAccepted,
      distributorSignatureName: applicationData.agreement.distributorSignatureName,
      distributorSignatureDate: applicationData.agreement.distributorSignatureDate,
      
      // Relations
      currentTransactions: {
        create: applicationData.currentTransactions?.filter(ct => ct.company && ct.products).map(ct => ({
          company: ct.company,
          products: ct.products,
          turnover: ct.turnover
        })) || []
      },
      productsToDistribute: {
        create: applicationData.productsToDistribute?.filter(pd => pd.productName).map(pd => ({
          productName: pd.productName,
          monthlySalesCapacity: pd.monthlySalesCapacity
        })) || []
      },
      areaCoverageDetails: {
        create: applicationData.areaCoverageDetails?.filter(acd => acd.distributionArea).map(acd => ({
          distributionArea: acd.distributionArea,
          populationEstimate: acd.populationEstimate,
          competitorBrand: acd.competitorBrand
        })) || []
      },
      applicationHistory: {
        create: {
          status: 'PENDING',
          notes: 'Draft application saved',
          changedBy: 'System',
          changedAt: new Date()
        }
      }
    },
    include: {
      currentTransactions: true,
      productsToDistribute: true,
      areaCoverageDetails: true,
      applicationHistory: true
    }
  });

  const response: ApiResponse = {
    success: true,
    message: 'Draft application saved successfully',
    data: { 
      application,
      referenceNumber // Return the reference number so user can continue later
    }
  };

  res.status(201).json(response);
});

// Get application by reference number
export const getApplicationByReference = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { referenceNumber } = req.params;

  const application = await prisma.distributorApplication.findUnique({
    where: { referenceNumber },
    include: {
      currentTransactions: true,
      productsToDistribute: true,
      areaCoverageDetails: true,
      applicationHistory: {
        orderBy: { changedAt: 'desc' },
        take: 5
      }
    }
  });

  if (!application) {
    const response: ApiResponse = {
      success: false,
      message: 'Draft application not found',
      error: 'APPLICATION_NOT_FOUND'
    };
    res.status(404).json(response);
    return;
  }

  const response: ApiResponse = {
    success: true,
    message: 'Draft application retrieved successfully',
    data: { application }
  };

  res.status(200).json(response);
});

// Send offer letter to approved distributor
export const sendOfferLetter = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { distributorId, products, additionalData, distributorInfo } = req.body;

  if (!distributorId || !products || !distributorInfo) {
    const response: ApiResponse = {
      success: false,
      message: 'Missing required fields',
      error: 'MISSING_REQUIRED_FIELDS'
    };
    res.status(400).json(response);
    return;
  }

  try {
    // Send the offer letter email
    await mailjetEmailService.sendDistributorOfferLetter(
      {
        ...distributorInfo,
        applicationId: distributorId
      },
      products,
      additionalData
    );

    const response: ApiResponse = {
      success: true,
      message: 'Offer letter sent successfully',
      data: {
        distributorId,
        emailSent: true,
        productsCount: products.length,
        sentAt: new Date().toISOString()
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error sending offer letter:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to send offer letter',
      error: 'EMAIL_SEND_FAILED'
    };
    res.status(500).json(response);
  }
});
