import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../uploads/payment-config');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new TypeError('Only image files are allowed!') as any, false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Validation schemas
const createPaymentConfigSchema = z.object({
  qrCodeUrl: z.string().url().optional().nullable(),
  bankAccountNumber: z.string().optional().nullable(),
  bankAccountName: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  branchName: z.string().optional().nullable(),
  paymentGateway: z.string().optional().nullable(),
  paymentGatewayApiKey: z.string().optional().nullable(),
  paymentGatewaySecret: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

const updatePaymentConfigSchema = z.object({
  qrCodeUrl: z.string().url().optional().nullable(),
  bankAccountNumber: z.string().optional().nullable(),
  bankAccountName: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  branchName: z.string().optional().nullable(),
  paymentGateway: z.string().optional().nullable(),
  paymentGatewayApiKey: z.string().optional().nullable(),
  paymentGatewaySecret: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const getPaymentConfigs = async (req: Request, res: Response) => {
  try {
    const configs = await prisma.paymentConfig.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      message: 'Payment configurations retrieved successfully',
      data: configs,
    });
  } catch (error) {
    console.error('Error retrieving payment configurations:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
  return; // Explicit return to satisfy TypeScript
};

export const getPaymentConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const config = await prisma.paymentConfig.findUnique({
      where: {
        id,
      },
    });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Payment configuration not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment configuration retrieved successfully',
      data: config,
    });
  } catch (error) {
    console.error('Error retrieving payment configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
  return; // Explicit return to satisfy TypeScript
};

export const createPaymentConfig = async (req: Request, res: Response) => {
  try {
    const validationResult = createPaymentConfigSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationResult.error.errors,
      });
    }

    const {
      qrCodeUrl,
      bankAccountNumber,
      bankAccountName,
      bankName,
      branchName,
      paymentGateway,
      paymentGatewayApiKey,
      paymentGatewaySecret,
      isActive,
    } = validationResult.data;

    const config = await prisma.paymentConfig.create({
      data: {
        qrCodeUrl: qrCodeUrl || null,
        bankAccountNumber: bankAccountNumber || null,
        bankAccountName: bankAccountName || null,
        bankName: bankName || null,
        branchName: branchName || null,
        paymentGateway: paymentGateway || null,
        paymentGatewayApiKey: paymentGatewayApiKey || null,
        paymentGatewaySecret: paymentGatewaySecret || null,
        isActive: isActive ?? true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Payment configuration created successfully',
      data: config,
    });
  } catch (error) {
    console.error('Error creating payment configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
  return; // Explicit return to satisfy TypeScript
};

export const updatePaymentConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validationResult = updatePaymentConfigSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationResult.error.errors,
      });
    }

    const {
      qrCodeUrl,
      bankAccountNumber,
      bankAccountName,
      bankName,
      branchName,
      paymentGateway,
      paymentGatewayApiKey,
      paymentGatewaySecret,
      isActive,
    } = validationResult.data;

    const existingConfig = await prisma.paymentConfig.findUnique({
      where: {
        id,
      },
    });

    if (!existingConfig) {
      return res.status(404).json({
        success: false,
        message: 'Payment configuration not found',
      });
    }

    const updatedConfig = await prisma.paymentConfig.update({
      where: {
        id,
      },
      data: {
        qrCodeUrl: qrCodeUrl !== undefined ? qrCodeUrl || null : undefined,
        bankAccountNumber: bankAccountNumber !== undefined ? bankAccountNumber || null : undefined,
        bankAccountName: bankAccountName !== undefined ? bankAccountName || null : undefined,
        bankName: bankName !== undefined ? bankName || null : undefined,
        branchName: branchName !== undefined ? branchName || null : undefined,
        paymentGateway: paymentGateway !== undefined ? paymentGateway || null : undefined,
        paymentGatewayApiKey: paymentGatewayApiKey !== undefined ? paymentGatewayApiKey || null : undefined,
        paymentGatewaySecret: paymentGatewaySecret !== undefined ? paymentGatewaySecret || null : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Payment configuration updated successfully',
      data: updatedConfig,
    });
  } catch (error) {
    console.error('Error updating payment configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
  return; // Explicit return to satisfy TypeScript
};

export const deletePaymentConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingConfig = await prisma.paymentConfig.findUnique({
      where: {
        id,
      },
    });

    if (!existingConfig) {
      return res.status(404).json({
        success: false,
        message: 'Payment configuration not found',
      });
    }

    await prisma.paymentConfig.delete({
      where: {
        id,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Payment configuration deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting payment configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
  return; // Explicit return to satisfy TypeScript
};

// New endpoint for uploading QR code
export const uploadQrCode = (req: Request, res: Response) => {
  upload.single('qrCode')(req, res, (err) => {
    if (err) {
      // Handle file validation error
      if (err.message === 'Only image files are allowed!' || err.message.includes('Only image')) {
        return res.status(400).json({
          success: false,
          message: 'Only image files are allowed!',
        });
      }
      
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 5MB.',
          });
        }
      }
      
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Return the file path for the uploaded QR code
    const filePath = `/uploads/payment-config/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      message: 'QR code uploaded successfully',
      data: {
        fileName: req.file.filename,
        filePath: filePath,
        originalName: req.file.originalname,
      },
    });
    
    // Explicit return to satisfy TypeScript compiler
    return;
  });
  
  // Explicit return to satisfy TypeScript compiler
  return;
};