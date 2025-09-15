import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { UploadedFile } from '@/types';

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    let uploadPath = 'uploads/documents';
    
    // Determine upload path based on field name
    switch (file.fieldname) {
      case 'citizenshipId':
      case 'companyRegistration':
      case 'panVatRegistration':
        uploadPath = 'uploads/documents';
        break;
      case 'officePhoto':
      case 'areaMap':
        uploadPath = 'uploads/photos';
        break;
      case 'digitalSignature':
        uploadPath = 'uploads/signatures';
        break;
      default:
        uploadPath = 'uploads/misc';
    }
    
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
    
    cb(null, `${file.fieldname}-${sanitizedBaseName}-${uniqueSuffix}${extension}`);
  }
});

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void => {
  // Define allowed file types for each field
  const allowedTypes: Record<string, string[]> = {
    citizenshipId: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    companyRegistration: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    panVatRegistration: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    officePhoto: ['image/jpeg', 'image/jpg', 'image/png'],
    areaMap: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    digitalSignature: ['image/png', 'image/jpeg', 'image/jpg'], // Digital signature files
    documents: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'] // Allow generic documents
  };

  const fieldAllowedTypes = allowedTypes[file.fieldname];
  
  if (!fieldAllowedTypes) {
    cb(new Error(`अनुमति नभएको फिल्ड: ${file.fieldname}`));
    return;
  }

  if (!fieldAllowedTypes.includes(file.mimetype)) {
    cb(new Error(`${file.fieldname} को लागि अनुमति नभएको फाइल प्रकार: ${file.mimetype}`));
    return;
  }

  cb(null, true);
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
    files: 5 // Maximum 5 files
  }
});

// Middleware for distributor application document uploads
export const uploadDocuments = upload.fields([
  { name: 'citizenshipId', maxCount: 1 },
  { name: 'companyRegistration', maxCount: 1 },
  { name: 'panVatRegistration', maxCount: 1 },
  { name: 'officePhoto', maxCount: 1 },
  { name: 'areaMap', maxCount: 1 },
  { name: 'digitalSignature', maxCount: 1 }, // Digital signature file
  { name: 'documents', maxCount: 10 } // Allow generic documents field with multiple files
]);

// Middleware for single file upload
export const uploadSingle = (fieldName: string) => upload.single(fieldName);

// Middleware for multiple files upload
export const uploadMultiple = (fieldName: string, maxCount: number = 5) => 
  upload.array(fieldName, maxCount);

// Helper function to get file paths from multer files
export const getFilePaths = (files: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[]): Record<string, string> => {
  const filePaths: Record<string, string> = {};
  
  if (Array.isArray(files)) {
    // Handle array of files (from upload.array())
    files.forEach((file, index) => {
      filePaths[`file_${index}`] = file.path;
    });
  } else {
    // Handle object of file arrays (from upload.fields())
    Object.keys(files).forEach(fieldName => {
      const fileArray = files[fieldName];
      if (fileArray && fileArray.length > 0) {
        filePaths[fieldName] = fileArray[0].path;
      }
    });
  }
  
  return filePaths;
};

// Helper function to delete uploaded files
export const deleteFiles = (filePaths: string[]): void => {
  filePaths.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`Deleted file: ${filePath}`);
      } catch (error) {
        console.error(`Error deleting file ${filePath}:`, error);
      }
    }
  });
};

// Helper function to validate file existence
export const validateFileExists = (filePath: string): boolean => {
  return fs.existsSync(filePath);
};

// Helper function to get file info
export const getFileInfo = (filePath: string): { size: number; mtime: Date } | null => {
  try {
    const stats = fs.statSync(filePath);
    return {
      size: stats.size,
      mtime: stats.mtime
    };
  } catch (error) {
    return null;
  }
};
