import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { 
  ApiResponse, 
  AuthenticatedRequest,
  LoginData
} from '../types';
import { asyncHandler } from '../middleware/error.middleware';
import { generateToken } from '../utils/auth.utils';

const prisma = new PrismaClient();

// Distributor login - separate from admin login
export const distributorLogin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password }: LoginData = req.body;

  // Find distributor user specifically
  const distributor = await prisma.user.findFirst({
    where: {
      email: email,
      role: 'DISTRIBUTOR'
    },
    select: {
      id: true,
      email: true,
      username: true,
      fullName: true,
      password: true,
      address: true,
      department: true,
      position: true,
      role: true,
      isActive: true,
      createdAt: true,
      distributorProfile: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          companyName: true,
          status: true
        }
      }
    }
  });

  if (!distributor) {
    const response: ApiResponse = {
      success: false,
      message: 'Distributor not found',
      error: 'DISTRIBUTOR_NOT_FOUND'
    };
    res.status(401).json(response);
    return;
  }

  if (!distributor.isActive) {
    const response: ApiResponse = {
      success: false,
      message: 'Distributor account is inactive',
      error: 'DISTRIBUTOR_ACCOUNT_INACTIVE'
    };
    res.status(401).json(response);
    return;
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, distributor.password);
  if (!isPasswordValid) {
    const response: ApiResponse = {
      success: false,
      message: 'डिस्ट्रिब्युटरको ईमेल वा पासवर्ड गलत छ',
      error: 'INVALID_DISTRIBUTOR_CREDENTIALS'
    };
    res.status(401).json(response);
    return;
  }

  // Check if distributor profile is active
  if (distributor.distributorProfile?.status !== 'ACTIVE') {
    const response: ApiResponse = {
      success: false,
      message: 'Distributor profile is not active',
      error: 'DISTRIBUTOR_PROFILE_INACTIVE'
    };
    res.status(401).json(response);
    return;
  }

  // Generate token with distributor-specific claims
  const token = generateToken(distributor.id, distributor.email, distributor.role);

  const response: ApiResponse = {
    success: true,
    message: 'Distributor login successful',
    data: {
      id: distributor.id,
      username: distributor.username,
      fullName: distributor.fullName,
      email: distributor.email,
      role: distributor.role,
      token,
      distributorProfile: distributor.distributorProfile,
      // Distributor-specific info
      companyName: distributor.distributorProfile?.companyName,
      phoneNumber: distributor.distributorProfile?.phoneNumber
    }
  };

  res.status(200).json(response);
});

// Distributor logout with distributor-specific cleanup
export const distributorLogout = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== 'DISTRIBUTOR') {
    const response: ApiResponse = {
      success: false,
      message: 'Authentication required',
      error: 'AUTHENTICATION_REQUIRED'
    };
    res.status(401).json(response);
    return;
  }

  // In a real app, you might want to:
  // - Revoke the token
  // - Clear distributor-specific sessions
  // - Log distributor logout activity
  
  const response: ApiResponse = {
    success: true,
    message: 'Distributor logout successful',
    data: { message: 'Distributor logout successful' }
  };

  res.status(200).json(response);
});

// Get distributor profile with extended data
export const getDistributorProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== 'DISTRIBUTOR') {
    const response: ApiResponse = {
      success: false,
      message: 'Distributor authentication required',
      error: 'DISTRIBUTOR_AUTHENTICATION_REQUIRED'
    };
    res.status(401).json(response);
    return;
  }

  // Get full distributor profile with business data
  const distributor = await prisma.user.findFirst({
    where: {
      id: req.user.id,
      role: 'DISTRIBUTOR'
    },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      address: true,
      department: true,
      position: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      distributorProfile: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          address: true,
          dateOfBirth: true,
          nationalId: true,
          companyName: true,
          companyType: true,
          registrationNumber: true,
          panNumber: true,
          vatNumber: true,
          establishedDate: true,
          companyAddress: true,
          website: true,
          description: true,
          status: true,
          documents: true,
          createdBy: true,
          approvedBy: true,
          approvedAt: true,
          createdAt: true,
          updatedAt: true
        }
      },
      // Get assigned categories if any
      assignedCategories: {
        select: {
          categoryId: true,
          category: {
            select: {
              id: true,
              title: true,
              description: true
            }
          }
        }
      }
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
    message: 'Distributor profile retrieved successfully',
    data: distributor
  };

  res.status(200).json(response);
});