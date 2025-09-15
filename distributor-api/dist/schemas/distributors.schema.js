"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDistributorSchema = exports.CreateDistributorSchema = void 0;
const zod_1 = require("zod");
exports.CreateDistributorSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    email: zod_1.z.string().email('Invalid email address'),
    phoneNumber: zod_1.z.string().min(10, 'Phone number must be at least 10 digits'),
    address: zod_1.z.string().min(1, 'Address is required'),
    dateOfBirth: zod_1.z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid date format'
    }),
    nationalId: zod_1.z.string().min(1, 'National ID is required'),
    companyName: zod_1.z.string().min(1, 'Company name is required'),
    companyType: zod_1.z.enum(['SOLE_PROPRIETORSHIP', 'PARTNERSHIP', 'PRIVATE_LIMITED', 'PUBLIC_LIMITED']),
    registrationNumber: zod_1.z.string().min(1, 'Registration number is required'),
    panNumber: zod_1.z.string().min(1, 'PAN number is required'),
    vatNumber: zod_1.z.string().optional(),
    establishedDate: zod_1.z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid date format'
    }),
    companyAddress: zod_1.z.string().min(1, 'Company address is required'),
    website: zod_1.z.string().url('Invalid URL').optional().or(zod_1.z.literal('')),
    description: zod_1.z.string().optional(),
    username: zod_1.z.string().min(3, 'Username must be at least 3 characters'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: zod_1.z.string().optional()
}).refine((data) => {
    if (data.confirmPassword && data.password !== data.confirmPassword) {
        return false;
    }
    return true;
}, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});
exports.UpdateDistributorSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1, 'First name is required').optional(),
    lastName: zod_1.z.string().min(1, 'Last name is required').optional(),
    email: zod_1.z.string().email('Invalid email address').optional(),
    phoneNumber: zod_1.z.string().min(10, 'Phone number must be at least 10 digits').optional(),
    address: zod_1.z.string().min(1, 'Address is required').optional(),
    dateOfBirth: zod_1.z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid date format'
    }).optional(),
    nationalId: zod_1.z.string().min(1, 'National ID is required').optional(),
    companyName: zod_1.z.string().min(1, 'Company name is required').optional(),
    companyType: zod_1.z.enum(['SOLE_PROPRIETORSHIP', 'PARTNERSHIP', 'PRIVATE_LIMITED', 'PUBLIC_LIMITED']).optional(),
    registrationNumber: zod_1.z.string().min(1, 'Registration number is required').optional(),
    panNumber: zod_1.z.string().min(1, 'PAN number is required').optional(),
    vatNumber: zod_1.z.string().optional(),
    establishedDate: zod_1.z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid date format'
    }).optional(),
    companyAddress: zod_1.z.string().min(1, 'Company address is required').optional(),
    website: zod_1.z.string().url('Invalid URL').optional().or(zod_1.z.literal('')),
    description: zod_1.z.string().optional(),
    username: zod_1.z.string().min(3, 'Username must be at least 3 characters').optional(),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters').optional(),
    confirmPassword: zod_1.z.string().optional(),
    status: zod_1.z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional()
}).refine((data) => {
    if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
        return false;
    }
    return true;
}, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});
//# sourceMappingURL=distributors.schema.js.map