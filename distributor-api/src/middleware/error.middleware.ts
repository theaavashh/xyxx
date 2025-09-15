import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ApiResponse } from '@/types';

// Global error handler
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    timestamp: new Date().toISOString()
  });

  // Default error response
  let statusCode = 500;
  let message = 'आन्तरिक सर्भर त्रुटि';
  let errorCode = 'INTERNAL_SERVER_ERROR';

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        statusCode = 409;
        message = 'डुप्लिकेट डाटा - यो जानकारी पहिले नै अवस्थित छ';
        errorCode = 'DUPLICATE_ENTRY';
        break;
      case 'P2025':
        statusCode = 404;
        message = 'अनुरोध गरिएको डाटा फेला परेन';
        errorCode = 'RECORD_NOT_FOUND';
        break;
      case 'P2003':
        statusCode = 400;
        message = 'सम्बन्धित डाटा फेला परेन';
        errorCode = 'FOREIGN_KEY_CONSTRAINT';
        break;
      case 'P2014':
        statusCode = 400;
        message = 'डाटा सम्बन्धमा समस्या';
        errorCode = 'RELATION_VIOLATION';
        break;
      default:
        statusCode = 500;
        message = 'डाटाबेस त्रुटि';
        errorCode = 'DATABASE_ERROR';
    }
  }
  
  // Handle Prisma validation errors
  else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'डाटा प्रमाणीकरण त्रुटि';
    errorCode = 'VALIDATION_ERROR';
  }
  
  // Handle Prisma connection errors
  else if (error instanceof Prisma.PrismaClientInitializationError) {
    statusCode = 503;
    message = 'डाटाबेस जडान समस्या';
    errorCode = 'DATABASE_CONNECTION_ERROR';
  }
  
  // Handle JWT errors
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'अवैध प्रमाणीकरण टोकन';
    errorCode = 'INVALID_TOKEN';
  }
  
  else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'प्रमाणीकरण टोकनको समय सकिएको छ';
    errorCode = 'TOKEN_EXPIRED';
  }
  
  // Handle multer errors (file upload)
  else if (error.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'फाइल साइज धेरै ठूलो छ';
    errorCode = 'FILE_TOO_LARGE';
  }
  
  else if (error.code === 'LIMIT_FILE_COUNT') {
    statusCode = 413;
    message = 'धेरै फाइलहरू अपलोड गर्न खोजिएको';
    errorCode = 'TOO_MANY_FILES';
  }
  
  else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'अनपेक्षित फाइल प्रकार';
    errorCode = 'UNEXPECTED_FILE';
  }
  
  // Handle custom application errors
  else if (error.statusCode) {
    statusCode = error.statusCode;
    message = error.message || message;
    errorCode = error.code || errorCode;
  }
  
  // Handle validation errors
  else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'डाटा प्रमाणीकरण त्रुटि';
    errorCode = 'VALIDATION_ERROR';
  }

  const response: ApiResponse = {
    success: false,
    message,
    error: errorCode
  };

  // Add additional error details in development
  if (process.env.NODE_ENV === 'development') {
    response.error = {
      code: errorCode,
      message: error.message,
      stack: error.stack
    } as any;
  }

  res.status(statusCode).json(response);
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: false,
    message: 'अनुरोध गरिएको पृष्ठ फेला परेन',
    error: 'NOT_FOUND'
  };
  
  res.status(404).json(response);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
