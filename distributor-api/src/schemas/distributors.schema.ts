import { z } from 'zod';

// Create Distributor Schema
export const CreateDistributorSchema = z.object({
  // Personal Details
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(1, 'Address is required'),
  dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format'
  }),
  nationalId: z.string().min(1, 'National ID is required'),
  
  // Company Details
  companyName: z.string().min(1, 'Company name is required'),
  companyType: z.enum(['SOLE_PROPRIETORSHIP', 'PARTNERSHIP', 'PRIVATE_LIMITED', 'PUBLIC_LIMITED']),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  panNumber: z.string().min(1, 'PAN number is required'),
  vatNumber: z.string().optional(),
  establishedDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format'
  }),
  companyAddress: z.string().min(1, 'Company address is required'),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  description: z.string().optional(),
  
  // Credentials
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().optional()
}).refine((data) => {
  if (data.confirmPassword && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Update Distributor Schema (all fields optional except ID)
export const UpdateDistributorSchema = z.object({
  // Personal Details
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  address: z.string().min(1, 'Address is required').optional(),
  dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format'
  }).optional(),
  nationalId: z.string().min(1, 'National ID is required').optional(),
  
  // Company Details
  companyName: z.string().min(1, 'Company name is required').optional(),
  companyType: z.enum(['SOLE_PROPRIETORSHIP', 'PARTNERSHIP', 'PRIVATE_LIMITED', 'PUBLIC_LIMITED']).optional(),
  registrationNumber: z.string().min(1, 'Registration number is required').optional(),
  panNumber: z.string().min(1, 'PAN number is required').optional(),
  vatNumber: z.string().optional(),
  establishedDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format'
  }).optional(),
  companyAddress: z.string().min(1, 'Company address is required').optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  description: z.string().optional(),
  
  // Credentials (optional for updates)
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  confirmPassword: z.string().optional(),
  
  // Status
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional()
}).refine((data) => {
  if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Export types
export type CreateDistributorData = z.infer<typeof CreateDistributorSchema>;
export type UpdateDistributorData = z.infer<typeof UpdateDistributorSchema>;
