import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { 
  ApiResponse, 
  AuthenticatedRequest, 
  CreateDistributorData,
  UpdateDistributorData,
  PaginatedResponse,
  PaginationParams
} from '../types';
import { asyncHandler } from '../middleware/error.middleware';
import { getFilePaths } from '../middleware/upload.middleware';

const prisma = new PrismaClient();

// Create new distributor account (from admin panel)
export const createDistributor = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  // In development mode, allow creation without authentication
  if (!req.user && process.env.NODE_ENV !== 'development') {
    const response: ApiResponse = {
      success: false,
      message: 'Authentication required',
      error: 'AUTHENTICATION_REQUIRED'
    };
    res.status(401).json(response);
    return;
  }

  // Parse JSON data from FormData
  let distributorData: CreateDistributorData;
  
  try {
    if (req.body.data) {
      // Data sent as JSON string in FormData
      distributorData = JSON.parse(req.body.data);
    } else {
      // Data sent as regular JSON
      distributorData = req.body;
    }
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: 'Invalid data format',
      error: 'INVALID_DATA_FORMAT'
    };
    res.status(400).json(response);
    return;
  }

  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    address,
    dateOfBirth,
    nationalId,
    companyName,
    companyType,
    registrationNumber,
    panNumber,
    vatNumber,
    establishedDate,
    companyAddress,
    website,
    description,
    username,
    password
  } = distributorData;

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { username }
      ]
    }
  });

  if (existingUser) {
    const response: ApiResponse = {
      success: false,
      message: 'User with this email or username already exists',
      error: 'USER_ALREADY_EXISTS'
    };
    res.status(409).json(response);
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user account
  const user = await prisma.user.create({
    data: {
      email,
      username,
      fullName: `${firstName} ${lastName}`,
      password: hashedPassword,
      role: 'DISTRIBUTOR',
      isActive: true,
      isVerified: true,
      address,
      department: 'Distributor',
      position: 'Distributor',
      
      // Create distributor profile
      distributorProfile: {
        create: {
          firstName,
          lastName,
          phoneNumber,
          address,
          dateOfBirth: new Date(dateOfBirth),
          nationalId,
          companyName,
          companyType,
          registrationNumber,
          panNumber,
          vatNumber,
          establishedDate: new Date(establishedDate),
          companyAddress,
          website: website || '',
          description: description || '',
          status: 'ACTIVE',
          documents: JSON.stringify({}),
          createdBy: req.user?.id || 'dev-user',
          approvedBy: req.user?.id || 'dev-user',
          approvedAt: new Date()
        }
      }
    },
    include: {
      distributorProfile: true
    }
  });

  const response: ApiResponse = {
    success: true,
    message: 'Distributor account created successfully',
    data: { 
      distributor: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        profile: user.distributorProfile
      }
    }
  };

  res.status(201).json(response);
});

// Get all distributors with filtering and pagination
export const getDistributors = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    search
  } = req.query as any;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  // Build where clause
  const where: any = {
    role: 'DISTRIBUTOR'
  };

  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { username: { contains: search, mode: 'insensitive' } },
      { 
        distributorProfile: {
          companyName: { contains: search, mode: 'insensitive' }
        }
      }
    ];
  }

  const [distributors, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
      include: {
        distributorProfile: true
      }
    }),
    prisma.user.count({ where })
  ]);

  const totalPages = Math.ceil(total / take);

  const response: PaginatedResponse<any> = {
    success: true,
    message: 'Distributors retrieved successfully',
    data: distributors,
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

// Get single distributor by ID
export const getDistributorById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const distributor = await prisma.user.findFirst({
    where: { 
      id,
      role: 'DISTRIBUTOR'
    },
    include: {
      distributorProfile: true
    }
  });

  if (!distributor) {
    const response: ApiResponse = {
      success: false,
      message: 'Distributor not found',
      error: 'DISTRIBUTOR_NOT_FOUND'
    };
    res.status(404).json(response);
    return;
  }

  const response: ApiResponse = {
    success: true,
    message: 'Distributor retrieved successfully',
    data: distributor
  };

  res.status(200).json(response);
});

// Update distributor
export const updateDistributor = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    const response: ApiResponse = {
      success: false,
      message: 'Authentication required',
      error: 'AUTHENTICATION_REQUIRED'
    };
    res.status(401).json(response);
    return;
  }

  const { id } = req.params;
  const updateData: UpdateDistributorData = req.body;

  // Check if distributor exists
  const existingDistributor = await prisma.user.findFirst({
    where: { 
      id,
      role: 'DISTRIBUTOR'
    }
  });

  if (!existingDistributor) {
    const response: ApiResponse = {
      success: false,
      message: 'Distributor not found',
      error: 'DISTRIBUTOR_NOT_FOUND'
    };
    res.status(404).json(response);
    return;
  }

  // Update user data
  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      email: updateData.email,
      address: updateData.address,
          updatedAt: new Date()
    },
    include: {
      distributorProfile: true
    }
  });

  const response: ApiResponse = {
    success: true,
    message: 'Distributor updated successfully',
    data: updatedUser
  };

  res.status(200).json(response);
});

// Delete distributor
export const deleteDistributor = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    const response: ApiResponse = {
      success: false,
      message: 'Authentication required',
      error: 'AUTHENTICATION_REQUIRED'
    };
    res.status(401).json(response);
    return;
  }

  const { id } = req.params;

  // Check if distributor exists
  const existingDistributor = await prisma.user.findFirst({
    where: { 
      id,
      role: 'DISTRIBUTOR'
    }
  });

  if (!existingDistributor) {
    const response: ApiResponse = {
      success: false,
      message: 'Distributor not found',
      error: 'DISTRIBUTOR_NOT_FOUND'
    };
    res.status(404).json(response);
    return;
  }

  // Delete distributor (cascade will delete profile)
  await prisma.user.delete({
    where: { id }
  });

  const response: ApiResponse = {
    success: true,
    message: 'Distributor deleted successfully'
  };

  res.status(200).json(response);
});

// Get distributor credentials
export const getDistributorCredentials = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user && process.env.NODE_ENV !== 'development') {
    const response: ApiResponse = {
      success: false,
      message: 'Authentication required',
      error: 'AUTHENTICATION_REQUIRED'
    };
    res.status(401).json(response);
    return;
  }

  const { id } = req.params;

  // Find the distributor with assigned categories
  const distributor = await prisma.user.findUnique({
    where: { id },
    select: { 
      id: true, 
      username: true, 
      email: true, 
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      assignedCategories: {
        include: {
          category: {
            select: {
              id: true,
              title: true,
              description: true,
              slug: true,
              isActive: true
            }
          }
        }
      }
    }
  });

  if (!distributor) {
    const response: ApiResponse = {
      success: false,
      message: 'डिस्ट्रिब्युटर फेला परेन',
      error: 'DISTRIBUTOR_NOT_FOUND'
    };
    res.status(404).json(response);
    return;
  }

  if (distributor.role !== 'DISTRIBUTOR') {
    const response: ApiResponse = {
      success: false,
      message: 'यो युजर डिस्ट्रिब्युटर होइन',
      error: 'INVALID_USER_TYPE'
    };
    res.status(400).json(response);
    return;
  }

  const response: ApiResponse = {
    success: true,
    message: 'डिस्ट्रिब्युटर क्रेडेन्शियल्स फेला पर्यो',
    data: {
      id: distributor.id,
      distributorId: distributor.id,
      username: distributor.username,
      email: distributor.email,
      password: '••••••••', // Masked password
      isActive: distributor.isActive,
      categories: distributor.assignedCategories.map(dc => dc.category),
      createdAt: distributor.createdAt,
      updatedAt: distributor.updatedAt
    }
  };

  res.status(200).json(response);
});

// Save distributor credentials
export const saveDistributorCredentials = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user && process.env.NODE_ENV !== 'development') {
    const response: ApiResponse = {
      success: false,
      message: 'Authentication required',
      error: 'AUTHENTICATION_REQUIRED'
    };
    res.status(401).json(response);
    return;
  }

  const { id } = req.params;
  const { username, email, password, categories = [] } = req.body;

  // Find the distributor
  const distributor = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true }
  });

  if (!distributor) {
    const response: ApiResponse = {
      success: false,
      message: 'डिस्ट्रिब्युटर फेला परेन',
      error: 'DISTRIBUTOR_NOT_FOUND'
    };
    res.status(404).json(response);
    return;
  }

  if (distributor.role !== 'DISTRIBUTOR') {
    const response: ApiResponse = {
      success: false,
      message: 'यो युजर डिस्ट्रिब्युटर होइन',
      error: 'INVALID_USER_TYPE'
    };
    res.status(400).json(response);
    return;
  }

  // Check if username or email already exists (excluding current user)
  const existingUser = await prisma.user.findFirst({
    where: {
      AND: [
        { id: { not: id } },
        {
          OR: [
            { username },
            { email }
          ]
        }
      ]
    }
  });

  if (existingUser) {
    const response: ApiResponse = {
      success: false,
      message: 'यो युजरनेम वा इमेल पहिले नै प्रयोग भएको छ',
      error: 'CREDENTIALS_ALREADY_EXISTS'
    };
    res.status(409).json(response);
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Update distributor credentials and categories in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Update distributor credentials
    const updatedDistributor = await tx.user.update({
      where: { id },
      data: {
        username,
        email,
        password: hashedPassword,
        updatedAt: new Date()
      },
      select: {
        id: true,
        username: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Remove existing category assignments
    await tx.distributorCategory.deleteMany({
      where: { distributorId: id }
    });

    // Add new category assignments
    if (categories && categories.length > 0) {
      const categoryAssignments = categories.map((categoryId: string) => ({
        distributorId: id,
        categoryId,
        assignedBy: req.user?.id || 'system'
      }));

      await tx.distributorCategory.createMany({
        data: categoryAssignments
      });
    }

    return updatedDistributor;
  });

  const response: ApiResponse = {
    success: true,
    message: 'डिस्ट्रिब्युटर क्रेडेन्शियल्स सफलतापूर्वक सेभ भयो',
    data: {
      id: result.id,
      distributorId: result.id,
      username: result.username,
      email: result.email,
      password: '••••••••', // Masked password
      isActive: result.isActive,
      categories: categories || [],
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    }
  };

  res.status(200).json(response);
});

// Delete distributor credentials
export const deleteDistributorCredentials = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user && process.env.NODE_ENV !== 'development') {
    const response: ApiResponse = {
      success: false,
      message: 'Authentication required',
      error: 'AUTHENTICATION_REQUIRED'
    };
    res.status(401).json(response);
    return;
  }

  const { id } = req.params;

  // Find the distributor
  const distributor = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true }
  });

  if (!distributor) {
    const response: ApiResponse = {
      success: false,
      message: 'डिस्ट्रिब्युटर फेला परेन',
      error: 'DISTRIBUTOR_NOT_FOUND'
    };
    res.status(404).json(response);
    return;
  }

  if (distributor.role !== 'DISTRIBUTOR') {
    const response: ApiResponse = {
      success: false,
      message: 'यो युजर डिस्ट्रिब्युटर होइन',
      error: 'INVALID_USER_TYPE'
    };
    res.status(400).json(response);
    return;
  }

  // Generate a random username and password
  const randomUsername = `dist_${id.slice(-8)}`;
  const randomPassword = Math.random().toString(36).slice(-12);
  const hashedPassword = await bcrypt.hash(randomPassword, 10);

  // Update distributor with random credentials
  const updatedDistributor = await prisma.user.update({
    where: { id },
    data: {
      username: randomUsername,
      password: hashedPassword,
      updatedAt: new Date()
    },
    select: {
      id: true,
      username: true,
      email: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });

  const response: ApiResponse = {
    success: true,
    message: 'Distributor credentials reset successfully',
    data: {
      id: updatedDistributor.id,
      distributorId: updatedDistributor.id,
      username: updatedDistributor.username,
      email: updatedDistributor.email,
      password: '••••••••', // Masked password
      isActive: updatedDistributor.isActive,
      createdAt: updatedDistributor.createdAt,
      updatedAt: updatedDistributor.updatedAt
    }
  };

  res.status(200).json(response);
});

// Find distributor by application ID
export const findDistributorByApplication = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { applicationId } = req.params;

  try {
    // First get the application details
    const application = await prisma.distributorApplication.findUnique({
      where: { id: applicationId },
      select: { 
        id: true, 
        fullName: true, 
        email: true, 
        mobileNumber: true,
        status: true 
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

    // Find the corresponding user account
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: application.email || '' },
          { fullName: application.fullName }
        ],
        role: 'DISTRIBUTOR'
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        isActive: true,
        createdAt: true
      }
    });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'यस आवेदनको लागि युजर खाता फेला परेन',
        error: 'USER_NOT_FOUND'
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse = {
      success: true,
      message: 'डिस्ट्रिब्युटर फेला पर्यो',
      data: user
    };

    res.json(response);
  } catch (error) {
    console.error('Error finding distributor by application:', error);
    const response: ApiResponse = {
      success: false,
      message: 'डिस्ट्रिब्युटर खोज्दा त्रुटि भयो',
      error: 'INTERNAL_SERVER_ERROR'
    };
    res.status(500).json(response);
  }
});

// Deactivate distributor account
export const deactivateDistributor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        isActive: true,
        role: true
      }
    });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'युजर फेला परेन',
        error: 'USER_NOT_FOUND'
      };
      res.status(404).json(response);
      return;
    }

    if (user.role !== 'DISTRIBUTOR') {
      const response: ApiResponse = {
        success: false,
        message: 'यो युजर डिस्ट्रिब्युटर होइन',
        error: 'INVALID_USER_ROLE'
      };
      res.status(400).json(response);
      return;
    }

    if (!user.isActive) {
      const response: ApiResponse = {
        success: false,
        message: 'यो युजर पहिले नै निष्क्रिय छ',
        error: 'USER_ALREADY_INACTIVE'
      };
      res.status(400).json(response);
      return;
    }

    // Deactivate the user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date()
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        isActive: true,
        updatedAt: true
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'डिस्ट्रिब्युटर खाता सफलतापूर्वक निष्क्रिय गरियो',
      data: updatedUser
    };

    res.json(response);
  } catch (error) {
    console.error('Error deactivating distributor:', error);
    const response: ApiResponse = {
      success: false,
      message: 'डिस्ट्रिब्युटर निष्क्रिय गर्दा त्रुटि भयो',
      error: 'INTERNAL_SERVER_ERROR'
    };
    res.status(500).json(response);
  }
});

// Activate distributor account
export const activateDistributor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        isActive: true,
        role: true
      }
    });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'युजर फेला परेन',
        error: 'USER_NOT_FOUND'
      };
      res.status(404).json(response);
      return;
    }

    if (user.role !== 'DISTRIBUTOR') {
      const response: ApiResponse = {
        success: false,
        message: 'यो युजर डिस्ट्रिब्युटर होइन',
        error: 'INVALID_USER_ROLE'
      };
      res.status(400).json(response);
      return;
    }

    if (user.isActive) {
      const response: ApiResponse = {
        success: false,
        message: 'यो युजर पहिले नै सक्रिय छ',
        error: 'USER_ALREADY_ACTIVE'
      };
      res.status(400).json(response);
      return;
    }

    // Activate the user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: true,
        updatedAt: new Date()
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        isActive: true,
        updatedAt: true
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'डिस्ट्रिब्युटर खाता सफलतापूर्वक सक्रिय गरियो',
      data: updatedUser
    };

    res.json(response);
  } catch (error) {
    console.error('Error activating distributor:', error);
    const response: ApiResponse = {
      success: false,
      message: 'डिस्ट्रिब्युटर सक्रिय गर्दा त्रुटि भयो',
      error: 'INTERNAL_SERVER_ERROR'
    };
    res.status(500).json(response);
  }
});