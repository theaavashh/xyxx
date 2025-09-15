import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { 
  LoginData, 
  RegisterData, 
  ChangePasswordData, 
  ForgotPasswordData, 
  ResetPasswordData, 
  UpdateProfileData,
  ApiResponse,
  AuthenticatedRequest,
  JwtPayload
} from '@/types';
import { asyncHandler } from '@/middleware/error.middleware';

const prisma = new PrismaClient();

// Generate JWT token
const generateToken = (userId: string, email: string, role: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET not configured');
  }

  const payload: JwtPayload = {
    userId,
    email,
    role: role as any
  };

  return jwt.sign(payload, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  } as jwt.SignOptions);
};

// Register new user
export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userData: RegisterData = req.body;

  // Check if user already exists (email or username)
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: userData.email },
        { username: userData.username }
      ]
    }
  });

  if (existingUser) {
    const isEmailTaken = existingUser.email === userData.email;
    const response: ApiResponse = {
      success: false,
      message: isEmailTaken ? 'This email address is already in use' : 'This username is already taken',
      error: isEmailTaken ? 'EMAIL_ALREADY_EXISTS' : 'USERNAME_ALREADY_EXISTS'
    };
    res.status(409).json(response);
    return;
  }

  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: userData.email,
      username: userData.username,
      fullName: userData.fullName,
      password: hashedPassword,
      address: userData.address,
      department: userData.department,
      position: userData.position,
      role: userData.role
    },
    select: {
      id: true,
      email: true,
      username: true,
      fullName: true,
      address: true,
      department: true,
      position: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  });

  // Generate token
  const token = generateToken(user.id, user.email, user.role);

  const response: ApiResponse = {
    success: true,
    message: 'User successfully registered',
    data: {
      user,
      token
    }
  };

  res.status(201).json(response);
});

// Login user
export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password }: LoginData = req.body;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
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
      createdAt: true
    }
  });

  if (!user) {
    const response: ApiResponse = {
      success: false,
      message: 'Invalid email or password',
      error: 'INVALID_CREDENTIALS'
    };
    res.status(401).json(response);
    return;
  }

  if (!user.isActive) {
    const response: ApiResponse = {
      success: false,
      message: 'User account is inactive',
      error: 'ACCOUNT_INACTIVE'
    };
    res.status(401).json(response);
    return;
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const response: ApiResponse = {
      success: false,
      message: 'Invalid email or password',
      error: 'INVALID_CREDENTIALS'
    };
    res.status(401).json(response);
    return;
  }

  // Generate token
  const token = generateToken(user.id, user.email, user.role);

  const response: ApiResponse = {
    success: true,
    message: 'Login successful',
    data: {
      username: user.username,
      role: user.role,
      token
    }
  };

  res.status(200).json(response);
});

// Get current user profile
export const getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    const response: ApiResponse = {
      success: false,
      message: 'Authentication required',
      error: 'AUTHENTICATION_REQUIRED'
    };
    res.status(401).json(response);
    return;
  }

  const response: ApiResponse = {
    success: true,
    message: 'प्रयोगकर्ता प्रोफाइल',
    data: { user: req.user }
  };

  res.status(200).json(response);
});

// Update user profile
export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    const response: ApiResponse = {
      success: false,
      message: 'Authentication required',
      error: 'AUTHENTICATION_REQUIRED'
    };
    res.status(401).json(response);
    return;
  }

  const updateData: UpdateProfileData = req.body;

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(updateData.fullName && { fullName: updateData.fullName }),
      ...(updateData.username && { username: updateData.username }),
      ...(updateData.address && { address: updateData.address }),
      ...(updateData.department && { department: updateData.department }),
      ...(updateData.position && { position: updateData.position })
    },
    select: {
      id: true,
      email: true,
      username: true,
      fullName: true,
      address: true,
      department: true,
      position: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });

  const response: ApiResponse = {
    success: true,
    message: 'प्रोफाइल सफलतापूर्वक अपडेट भयो',
    data: { user: updatedUser }
  };

  res.status(200).json(response);
});

// Change password
export const changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    const response: ApiResponse = {
      success: false,
      message: 'Authentication required',
      error: 'AUTHENTICATION_REQUIRED'
    };
    res.status(401).json(response);
    return;
  }

  const { currentPassword, newPassword }: ChangePasswordData = req.body;

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, password: true }
  });

  if (!user) {
    const response: ApiResponse = {
      success: false,
      message: 'प्रयोगकर्ता फेला परेन',
      error: 'USER_NOT_FOUND'
    };
    res.status(404).json(response);
    return;
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    const response: ApiResponse = {
      success: false,
      message: 'हालको पासवर्ड गलत छ',
      error: 'INVALID_CURRENT_PASSWORD'
    };
    res.status(400).json(response);
    return;
  }

  // Hash new password
  const saltRounds = 12;
  const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

  // Update password
  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: hashedNewPassword }
  });

  const response: ApiResponse = {
    success: true,
    message: 'पासवर्ड सफलतापूर्वक परिवर्तन भयो'
  };

  res.status(200).json(response);
});

// Logout (client-side token removal)
export const logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const response: ApiResponse = {
    success: true,
    message: 'सफलतापूर्वक लगआउट भयो'
  };

  res.status(200).json(response);
});

// Refresh token
export const refreshToken = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    const response: ApiResponse = {
      success: false,
      message: 'Authentication required',
      error: 'AUTHENTICATION_REQUIRED'
    };
    res.status(401).json(response);
    return;
  }

  // Generate new token
  const token = generateToken(req.user.id, req.user.email, req.user.role);

  const response: ApiResponse = {
    success: true,
    message: 'टोकन रिफ्रेश भयो',
    data: { token }
  };

  res.status(200).json(response);
});

// Get all users (admin/manager only)
export const getAllUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    const response: ApiResponse = {
      success: false,
      message: 'Authentication required',
      error: 'AUTHENTICATION_REQUIRED'
    };
    res.status(401).json(response);
    return;
  }

  // Check if user has manager/admin role
  if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGERIAL' && req.user.role !== 'SALES_MANAGER') {
    const response: ApiResponse = {
      success: false,
      message: 'Insufficient permissions for this action',
      error: 'INSUFFICIENT_PERMISSIONS'
    };
    res.status(403).json(response);
    return;
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      username: true,
      fullName: true,
      address: true,
      department: true,
      position: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const response: ApiResponse = {
    success: true,
    message: 'सबै प्रयोगकर्ताहरूको सूची',
    data: users
  };

  res.status(200).json(response);
});

// Update user status (admin/manager only)
export const updateUserStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    const response: ApiResponse = {
      success: false,
      message: 'Authentication required',
      error: 'AUTHENTICATION_REQUIRED'
    };
    res.status(401).json(response);
    return;
  }

  // Check if user has manager/admin role
  if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGERIAL' && req.user.role !== 'SALES_MANAGER') {
    const response: ApiResponse = {
      success: false,
      message: 'Insufficient permissions for this action',
      error: 'INSUFFICIENT_PERMISSIONS'
    };
    res.status(403).json(response);
    return;
  }

  const { userId } = req.params;
  const { isActive } = req.body;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isActive },
    select: {
      id: true,
      email: true,
      username: true,
      fullName: true,
      address: true,
      department: true,
      position: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });

  const response: ApiResponse = {
    success: true,
    message: `प्रयोगकर्ता ${isActive ? 'सक्रिय' : 'निष्क्रिय'} गरियो`,
    data: { user: updatedUser }
  };

  res.status(200).json(response);
});

// Delete user (admin/manager only)
export const deleteUser = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    const response: ApiResponse = {
      success: false,
      message: 'Authentication required',
      error: 'AUTHENTICATION_REQUIRED'
    };
    res.status(401).json(response);
    return;
  }

  // Check if user has manager/admin role
  if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGERIAL' && req.user.role !== 'SALES_MANAGER') {
    const response: ApiResponse = {
      success: false,
      message: 'Insufficient permissions for this action',
      error: 'INSUFFICIENT_PERMISSIONS'
    };
    res.status(403).json(response);
    return;
  }

  const { userId } = req.params;

  // Prevent user from deleting themselves
  if (req.user.id === userId) {
    const response: ApiResponse = {
      success: false,
      message: 'Cannot delete your own account',
      error: 'SELF_DELETE_NOT_ALLOWED'
    };
    res.status(400).json(response);
    return;
  }

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      };
      res.status(404).json(response);
      return;
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userId }
    });

    const response: ApiResponse = {
      success: true,
      message: 'User deleted successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error deleting user:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to delete user',
      error: 'DELETE_FAILED'
    };
    res.status(500).json(response);
  }
});

// Update user (admin/manager only)
export const updateUser = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    const response: ApiResponse = {
      success: false,
      message: 'Authentication required',
      error: 'AUTHENTICATION_REQUIRED'
    };
    res.status(401).json(response);
    return;
  }

  // Check if user has manager/admin role
  if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGERIAL' && req.user.role !== 'SALES_MANAGER') {
    const response: ApiResponse = {
      success: false,
      message: 'Insufficient permissions for this action',
      error: 'INSUFFICIENT_PERMISSIONS'
    };
    res.status(403).json(response);
    return;
  }

  const { userId } = req.params;
  const updateData = req.body;

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      };
      res.status(404).json(response);
      return;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(updateData.fullName && { fullName: updateData.fullName }),
        ...(updateData.username && { username: updateData.username }),
        ...(updateData.email && { email: updateData.email }),
        ...(updateData.address && { address: updateData.address }),
        ...(updateData.department && { department: updateData.department }),
        ...(updateData.position && { position: updateData.position }),
        ...(updateData.role && { role: updateData.role }),
        ...(updateData.isActive !== undefined && { isActive: updateData.isActive })
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        address: true,
        department: true,
        position: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error updating user:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to update user',
      error: 'UPDATE_FAILED'
    };
    res.status(500).json(response);
  }
});
