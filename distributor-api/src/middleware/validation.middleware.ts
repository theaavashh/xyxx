import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiResponse } from '@/types';

// Generic validation middleware factory
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate request body
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(err.message);
        });

        const response: ApiResponse = {
          success: false,
          message: 'प्रविष्ट गरिएको डाटा सही छैन',
          error: 'Validation failed',
          errors
        };
        
        res.status(400).json(response);
        return;
      }

      // Handle unexpected errors
      console.error('Validation middleware error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'डाटा प्रमाणीकरण गर्दा त्रुटि',
        error: 'Validation error'
      };
      res.status(500).json(response);
    }
  };
};

// Validate query parameters
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(err.message);
        });

        const response: ApiResponse = {
          success: false,
          message: 'क्वेरी प्यारामिटर सही छैन',
          error: 'Query validation failed',
          errors
        };
        
        res.status(400).json(response);
        return;
      }

      console.error('Query validation middleware error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'क्वेरी प्रमाणीकरण गर्दा त्रुटि',
        error: 'Query validation error'
      };
      res.status(500).json(response);
    }
  };
};

// Validate route parameters
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(err.message);
        });

        const response: ApiResponse = {
          success: false,
          message: 'रुट प्यारामिटर सही छैन',
          error: 'Parameter validation failed',
          errors
        };
        
        res.status(400).json(response);
        return;
      }

      console.error('Parameter validation middleware error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'प्यारामिटर प्रमाणीकरण गर्दा त्रुटि',
        error: 'Parameter validation error'
      };
      res.status(500).json(response);
    }
  };
};

// Sanitize input data
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Recursively sanitize strings in request body
    const sanitizeObject = (obj: any): any => {
      if (typeof obj === 'string') {
        return obj.trim();
      }
      
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      
      if (obj && typeof obj === 'object') {
        const sanitized: any = {};
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            sanitized[key] = sanitizeObject(obj[key]);
          }
        }
        return sanitized;
      }
      
      return obj;
    };

    if (req.body) {
      req.body = sanitizeObject(req.body);
    }
    
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }

    next();
  } catch (error) {
    console.error('Input sanitization error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'डाटा सफा गर्दा त्रुटि',
      error: 'Input sanitization error'
    };
    res.status(500).json(response);
  }
};
