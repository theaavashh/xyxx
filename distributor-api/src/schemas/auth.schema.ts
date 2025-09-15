import { z } from 'zod';

// User roles
export const UserRoleSchema = z.enum([
  'ADMIN',
  'MANAGERIAL',
  'SALES_MANAGER',
  'SALES_REPRESENTATIVE',
  'DISTRIBUTOR'
]);

// Login Schema
export const LoginSchema = z.object({
  email: z.string()
    .email('इमेल ठेगाना सही ढाँचामा हुनुपर्छ')
    .min(1, 'इमेल ठेगाना आवश्यक छ'),
  
  password: z.string()
    .min(6, 'पासवर्ड कम्तिमा ६ अक्षरको हुनुपर्छ')
    .max(100, 'पासवर्ड १०० अक्षरभन्दा बढी हुन सक्दैन')
});

// Register Schema
export const RegisterSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email address is required'),
  
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username cannot exceed 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password cannot exceed 100 characters'),
  
  confirmPassword: z.string(),
  
  address: z.string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address cannot exceed 200 characters'),
  
  department: z.string()
    .min(2, 'Department is required')
    .max(50, 'Department cannot exceed 50 characters'),
  
  position: z.string()
    .min(2, 'Position is required')
    .max(100, 'Position cannot exceed 100 characters'),
  
  role: UserRoleSchema.default('SALES_REPRESENTATIVE')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// Change Password Schema
export const ChangePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'हालको पासवर्ड आवश्यक छ'),
  
  newPassword: z.string()
    .min(6, 'नयाँ पासवर्ड कम्तिमा ६ अक्षरको हुनुपर्छ')
    .max(100, 'नयाँ पासवर्ड १०० अक्षरभन्दा बढी हुन सक्दैन')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'पासवर्डमा कम्तिमा एक सानो अक्षर, एक ठूलो अक्षर र एक संख्या हुनुपर्छ'),
  
  confirmNewPassword: z.string()
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'नयाँ पासवर्ड मिलेन',
  path: ['confirmNewPassword']
});

// Forgot Password Schema
export const ForgotPasswordSchema = z.object({
  email: z.string()
    .email('इमेल ठेगाना सही ढाँचामा हुनुपर्छ')
    .min(1, 'इमेल ठेगाना आवश्यक छ')
});

// Reset Password Schema
export const ResetPasswordSchema = z.object({
  token: z.string()
    .min(1, 'रिसेट टोकन आवश्यक छ'),
  
  newPassword: z.string()
    .min(6, 'नयाँ पासवर्ड कम्तिमा ६ अक्षरको हुनुपर्छ')
    .max(100, 'नयाँ पासवर्ड १०० अक्षरभन्दा बढी हुन सक्दैन')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'पासवर्डमा कम्तिमा एक सानो अक्षर, एक ठूलो अक्षर र एक संख्या हुनुपर्छ'),
  
  confirmNewPassword: z.string()
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'नयाँ पासवर्ड मिलेन',
  path: ['confirmNewPassword']
});

// Update Profile Schema
export const UpdateProfileSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters')
    .optional(),
  
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username cannot exceed 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  
  address: z.string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address cannot exceed 200 characters')
    .optional(),
  
  department: z.string()
    .min(2, 'Department is required')
    .max(50, 'Department cannot exceed 50 characters')
    .optional(),
  
  position: z.string()
    .min(2, 'Position is required')
    .max(100, 'Position cannot exceed 100 characters')
    .optional()
});

// Export types
export type UserRole = z.infer<typeof UserRoleSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
export type RegisterData = z.infer<typeof RegisterSchema>;
export type ChangePasswordData = z.infer<typeof ChangePasswordSchema>;
export type ForgotPasswordData = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof ResetPasswordSchema>;
export type UpdateProfileData = z.infer<typeof UpdateProfileSchema>;
