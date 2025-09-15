import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { ApiResponse } from '@/types';

// General rate limiting
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs (increased for development)
  message: {
    success: false,
    message: 'धेरै अनुरोधहरू पठाइएको छ। केही समय पछि प्रयास गर्नुहोस्।',
    error: 'TOO_MANY_REQUESTS'
  } as ApiResponse,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    const response: ApiResponse = {
      success: false,
      message: 'धेरै अनुरोधहरू पठाइएको छ। केही समय पछि प्रयास गर्नुहोस्।',
      error: 'TOO_MANY_REQUESTS'
    };
    res.status(429).json(response);
  }
});

// Strict rate limiting for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: {
    success: false,
    message: 'धेरै लगइन प्रयासहरू। १५ मिनेट पछि प्रयास गर्नुहोस्।',
    error: 'TOO_MANY_LOGIN_ATTEMPTS'
  } as ApiResponse,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req: Request, res: Response) => {
    const response: ApiResponse = {
      success: false,
      message: 'धेरै लगइन प्रयासहरू। १५ मिनेट पछि प्रयास गर्नुहोस्।',
      error: 'TOO_MANY_LOGIN_ATTEMPTS'
    };
    res.status(429).json(response);
  }
});

// Rate limiting for application submission
export const applicationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 application submissions per hour
  message: {
    success: false,
    message: 'धेरै आवेदनहरू पठाइएको छ। १ घण्टा पछि प्रयास गर्नुहोस्।',
    error: 'TOO_MANY_APPLICATIONS'
  } as ApiResponse,
  handler: (req: Request, res: Response) => {
    const response: ApiResponse = {
      success: false,
      message: 'धेरै आवेदनहरू पठाइएको छ। १ घण्टा पछि प्रयास गर्नुहोस्।',
      error: 'TOO_MANY_APPLICATIONS'
    };
    res.status(429).json(response);
  }
});

// Rate limiting for file uploads
export const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // Limit each IP to 20 file uploads per 10 minutes
  message: {
    success: false,
    message: 'धेरै फाइल अपलोड प्रयासहरू। १० मिनेट पछि प्रयास गर्नुहोस्।',
    error: 'TOO_MANY_UPLOADS'
  } as ApiResponse,
  handler: (req: Request, res: Response) => {
    const response: ApiResponse = {
      success: false,
      message: 'धेरै फाइल अपलोड प्रयासहरू। १० मिनेट पछि प्रयास गर्नुहोस्।',
      error: 'TOO_MANY_UPLOADS'
    };
    res.status(429).json(response);
  }
});

// Rate limiting for password reset
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    success: false,
    message: 'धेरै पासवर्ड रिसेट प्रयासहरू। १ घण्टा पछि प्रयास गर्नुहोस्।',
    error: 'TOO_MANY_PASSWORD_RESET_ATTEMPTS'
  } as ApiResponse,
  handler: (req: Request, res: Response) => {
    const response: ApiResponse = {
      success: false,
      message: 'धेरै पासवर्ड रिसेट प्रयासहरू। १ घण्टा पछि प्रयास गर्नुहोस्।',
      error: 'TOO_MANY_PASSWORD_RESET_ATTEMPTS'
    };
    res.status(429).json(response);
  }
});
