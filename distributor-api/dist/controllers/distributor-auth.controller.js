"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDistributorProfile = exports.distributorLogout = exports.distributorLogin = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const error_middleware_1 = require("../middleware/error.middleware");
const auth_utils_1 = require("../utils/auth.utils");
const prisma = new client_1.PrismaClient();
exports.distributorLogin = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const distributor = await prisma.user.findFirst({
        where: {
            email: email,
            role: 'DISTRIBUTOR'
        },
        select: {
            id: true,
            email: true,
            username: true,
            fullName: true,
            password: true,
            address: true,
            department: true,
            position: true,
            role: true,
            isActive: true,
            createdAt: true,
            distributorProfile: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    phoneNumber: true,
                    companyName: true,
                    status: true
                }
            }
        }
    });
    if (!distributor) {
        const response = {
            success: false,
            message: 'Distributor not found',
            error: 'DISTRIBUTOR_NOT_FOUND'
        };
        res.status(401).json(response);
        return;
    }
    if (!distributor.isActive) {
        const response = {
            success: false,
            message: 'Distributor account is inactive',
            error: 'DISTRIBUTOR_ACCOUNT_INACTIVE'
        };
        res.status(401).json(response);
        return;
    }
    const isPasswordValid = await bcryptjs_1.default.compare(password, distributor.password);
    if (!isPasswordValid) {
        const response = {
            success: false,
            message: 'डिस्ट्रिब्युटरको ईमेल वा पासवर्ड गलत छ',
            error: 'INVALID_DISTRIBUTOR_CREDENTIALS'
        };
        res.status(401).json(response);
        return;
    }
    if (distributor.distributorProfile?.status !== 'ACTIVE') {
        const response = {
            success: false,
            message: 'Distributor profile is not active',
            error: 'DISTRIBUTOR_PROFILE_INACTIVE'
        };
        res.status(401).json(response);
        return;
    }
    const token = (0, auth_utils_1.generateToken)(distributor.id, distributor.email, distributor.role);
    const response = {
        success: true,
        message: 'Distributor login successful',
        data: {
            id: distributor.id,
            username: distributor.username,
            fullName: distributor.fullName,
            email: distributor.email,
            role: distributor.role,
            token,
            distributorProfile: distributor.distributorProfile,
            companyName: distributor.distributorProfile?.companyName,
            phoneNumber: distributor.distributorProfile?.phoneNumber
        }
    };
    res.status(200).json(response);
});
exports.distributorLogout = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user || req.user.role !== 'DISTRIBUTOR') {
        const response = {
            success: false,
            message: 'Authentication required',
            error: 'AUTHENTICATION_REQUIRED'
        };
        res.status(401).json(response);
        return;
    }
    const response = {
        success: true,
        message: 'Distributor logout successful',
        data: { message: 'Distributor logout successful' }
    };
    res.status(200).json(response);
});
exports.getDistributorProfile = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user || req.user.role !== 'DISTRIBUTOR') {
        const response = {
            success: false,
            message: 'Distributor authentication required',
            error: 'DISTRIBUTOR_AUTHENTICATION_REQUIRED'
        };
        res.status(401).json(response);
        return;
    }
    const distributor = await prisma.user.findFirst({
        where: {
            id: req.user.id,
            role: 'DISTRIBUTOR'
        },
        select: {
            id: true,
            username: true,
            email: true,
            fullName: true,
            address: true,
            department: true,
            position: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            distributorProfile: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    phoneNumber: true,
                    address: true,
                    dateOfBirth: true,
                    nationalId: true,
                    companyName: true,
                    companyType: true,
                    registrationNumber: true,
                    panNumber: true,
                    vatNumber: true,
                    establishedDate: true,
                    companyAddress: true,
                    website: true,
                    description: true,
                    status: true,
                    documents: true,
                    createdBy: true,
                    approvedBy: true,
                    approvedAt: true,
                    createdAt: true,
                    updatedAt: true
                }
            },
            assignedCategories: {
                select: {
                    categoryId: true,
                    category: {
                        select: {
                            id: true,
                            title: true,
                            description: true
                        }
                    }
                }
            }
        }
    });
    if (!distributor) {
        const response = {
            success: false,
            message: 'Distributor not found',
            error: 'DISTRIBUTOR_NOT_FOUND'
        };
        res.status(404).json(response);
        return;
    }
    const response = {
        success: true,
        message: 'Distributor profile retrieved successfully',
        data: distributor
    };
    res.status(200).json(response);
});
//# sourceMappingURL=distributor-auth.controller.js.map