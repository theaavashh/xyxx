"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProfileSchema = exports.ResetPasswordSchema = exports.ForgotPasswordSchema = exports.ChangePasswordSchema = exports.RegisterSchema = exports.LoginSchema = exports.UserRoleSchema = void 0;
const zod_1 = require("zod");
exports.UserRoleSchema = zod_1.z.enum([
    'ADMIN',
    'MANAGERIAL',
    'SALES_MANAGER',
    'SALES_REPRESENTATIVE',
    'DISTRIBUTOR'
]);
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string()
        .email('इमेल ठेगाना सही ढाँचामा हुनुपर्छ')
        .min(1, 'इमेल ठेगाना आवश्यक छ'),
    password: zod_1.z.string()
        .min(6, 'पासवर्ड कम्तिमा ६ अक्षरको हुनुपर्छ')
        .max(100, 'पासवर्ड १०० अक्षरभन्दा बढी हुन सक्दैन')
});
exports.RegisterSchema = zod_1.z.object({
    fullName: zod_1.z.string()
        .min(2, 'Full name must be at least 2 characters')
        .max(100, 'Full name cannot exceed 100 characters'),
    email: zod_1.z.string()
        .email('Please enter a valid email address')
        .min(1, 'Email address is required'),
    username: zod_1.z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(50, 'Username cannot exceed 50 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    password: zod_1.z.string()
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password cannot exceed 100 characters'),
    confirmPassword: zod_1.z.string(),
    address: zod_1.z.string()
        .min(5, 'Address must be at least 5 characters')
        .max(200, 'Address cannot exceed 200 characters'),
    department: zod_1.z.string()
        .min(2, 'Department is required')
        .max(50, 'Department cannot exceed 50 characters'),
    position: zod_1.z.string()
        .min(2, 'Position is required')
        .max(100, 'Position cannot exceed 100 characters'),
    role: exports.UserRoleSchema.default('SALES_REPRESENTATIVE')
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
});
exports.ChangePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string()
        .min(1, 'हालको पासवर्ड आवश्यक छ'),
    newPassword: zod_1.z.string()
        .min(6, 'नयाँ पासवर्ड कम्तिमा ६ अक्षरको हुनुपर्छ')
        .max(100, 'नयाँ पासवर्ड १०० अक्षरभन्दा बढी हुन सक्दैन')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'पासवर्डमा कम्तिमा एक सानो अक्षर, एक ठूलो अक्षर र एक संख्या हुनुपर्छ'),
    confirmNewPassword: zod_1.z.string()
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'नयाँ पासवर्ड मिलेन',
    path: ['confirmNewPassword']
});
exports.ForgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string()
        .email('इमेल ठेगाना सही ढाँचामा हुनुपर्छ')
        .min(1, 'इमेल ठेगाना आवश्यक छ')
});
exports.ResetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string()
        .min(1, 'रिसेट टोकन आवश्यक छ'),
    newPassword: zod_1.z.string()
        .min(6, 'नयाँ पासवर्ड कम्तिमा ६ अक्षरको हुनुपर्छ')
        .max(100, 'नयाँ पासवर्ड १०० अक्षरभन्दा बढी हुन सक्दैन')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'पासवर्डमा कम्तिमा एक सानो अक्षर, एक ठूलो अक्षर र एक संख्या हुनुपर्छ'),
    confirmNewPassword: zod_1.z.string()
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'नयाँ पासवर्ड मिलेन',
    path: ['confirmNewPassword']
});
exports.UpdateProfileSchema = zod_1.z.object({
    fullName: zod_1.z.string()
        .min(2, 'Full name must be at least 2 characters')
        .max(100, 'Full name cannot exceed 100 characters')
        .optional(),
    username: zod_1.z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(50, 'Username cannot exceed 50 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
        .optional(),
    address: zod_1.z.string()
        .min(5, 'Address must be at least 5 characters')
        .max(200, 'Address cannot exceed 200 characters')
        .optional(),
    department: zod_1.z.string()
        .min(2, 'Department is required')
        .max(50, 'Department cannot exceed 50 characters')
        .optional(),
    position: zod_1.z.string()
        .min(2, 'Position is required')
        .max(100, 'Position cannot exceed 100 characters')
        .optional()
});
//# sourceMappingURL=auth.schema.js.map