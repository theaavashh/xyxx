import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest, JwtPayload, ApiResponse, UserRole } from '@/types';

const prisma = new PrismaClient();

// Verify JWT token and attach user to request
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      const response: ApiResponse = {
        success: false,
        message: 'पहुँच टोकन आवश्यक छ',
        error: 'Access token required'
      };
      res.status(401).json(response);
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    
    // Fetch user from database to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || !user.isActive) {
      const response: ApiResponse = {
        success: false,
        message: 'अवैध वा निष्क्रिय प्रयोगकर्ता',
        error: 'Invalid or inactive user'
      };
      res.status(401).json(response);
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    let message = 'अवैध टोकन';
    if (error instanceof jwt.TokenExpiredError) {
      message = 'टोकनको समय सकिएको छ';
    } else if (error instanceof jwt.JsonWebTokenError) {
      message = 'अवैध टोकन';
    }

    const response: ApiResponse = {
      success: false,
      message,
      error: 'Authentication failed'
    };
    res.status(401).json(response);
  }
};

// Authorization middleware to check user roles
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        message: 'प्रमाणीकरण आवश्यक छ',
        error: 'Authentication required'
      };
      res.status(401).json(response);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      const response: ApiResponse = {
        success: false,
        message: 'यो कार्य गर्न अनुमति छैन',
        error: 'Insufficient permissions'
      };
      res.status(403).json(response);
      return;
    }

    next();
  };
};

// Optional authentication - doesn't fail if no token provided
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      next();
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      next();
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (user && user.isActive) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Silently continue without authentication
    next();
  }
};

// Check if user can access specific application
export const canAccessApplication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        message: 'प्रमाणीकरण आवश्यक छ',
        error: 'Authentication required'
      };
      res.status(401).json(response);
      return;
    }

    const applicationId = req.params.id;
    if (!applicationId) {
      const response: ApiResponse = {
        success: false,
        message: 'आवेदन ID आवश्यक छ',
        error: 'Application ID required'
      };
      res.status(400).json(response);
      return;
    }

    // Admin and Sales Manager can access all applications
    if (req.user.role === 'ADMIN' || req.user.role === 'SALES_MANAGER') {
      next();
      return;
    }

    // Sales Representative can access applications they created or reviewed
    if (req.user.role === 'SALES_REPRESENTATIVE') {
      const application = await prisma.distributorApplication.findUnique({
        where: { id: applicationId },
        select: {
          id: true,
          createdById: true,
          reviewedById: true
        }
      });

      if (!application) {
        const response: ApiResponse = {
          success: false,
          message: 'आवेदन फेला परेन',
          error: 'Application not found'
        };
        res.status(404).json(response);
        return;
      }

      if (application.createdById === req.user.id || application.reviewedById === req.user.id) {
        next();
        return;
      }
    }

    const response: ApiResponse = {
      success: false,
      message: 'यो आवेदन पहुँच गर्न अनुमति छैन',
      error: 'Access denied to this application'
    };
    res.status(403).json(response);
  } catch (error) {
    console.error('Authorization error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'प्राधिकरण जाँच गर्दा त्रुटि',
      error: 'Authorization check failed'
    };
    res.status(500).json(response);
  }
};
