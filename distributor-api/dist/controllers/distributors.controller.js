"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activateDistributor = exports.deactivateDistributor = exports.findDistributorByApplication = exports.deleteDistributorCredentials = exports.saveDistributorCredentials = exports.getDistributorCredentials = exports.deleteDistributor = exports.updateDistributor = exports.getDistributorById = exports.getDistributors = exports.createDistributor = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const error_middleware_1 = require("../middleware/error.middleware");
const mailjet_service_1 = __importDefault(require("../services/mailjet.service"));
const prisma = new client_1.PrismaClient();
exports.createDistributor = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user && process.env.NODE_ENV !== 'development') {
        const response = {
            success: false,
            message: 'Authentication required',
            error: 'AUTHENTICATION_REQUIRED'
        };
        res.status(401).json(response);
        return;
    }
    let distributorData;
    try {
        if (req.body.data) {
            distributorData = JSON.parse(req.body.data);
        }
        else {
            distributorData = req.body;
        }
    }
    catch (error) {
        const response = {
            success: false,
            message: 'Invalid data format',
            error: 'INVALID_DATA_FORMAT'
        };
        res.status(400).json(response);
        return;
    }
    const { firstName, lastName, email, phoneNumber, address, dateOfBirth, nationalId, companyName, companyType, registrationNumber, panNumber, vatNumber, establishedDate, companyAddress, website, description, username, password } = distributorData;
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email },
                { username }
            ]
        }
    });
    if (existingUser) {
        const response = {
            success: false,
            message: 'User with this email or username already exists',
            error: 'USER_ALREADY_EXISTS'
        };
        res.status(409).json(response);
        return;
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const user = await prisma.user.create({
        data: {
            email,
            username,
            fullName: `${firstName} ${lastName}`,
            password: hashedPassword,
            role: 'DISTRIBUTOR',
            isActive: true,
            isVerified: true,
            address,
            department: 'Distributor',
            position: 'Distributor',
            distributorProfile: {
                create: {
                    firstName,
                    lastName,
                    phoneNumber,
                    address,
                    dateOfBirth: new Date(dateOfBirth),
                    nationalId,
                    companyName,
                    companyType,
                    registrationNumber,
                    panNumber,
                    vatNumber,
                    establishedDate: new Date(establishedDate),
                    companyAddress,
                    website: website || '',
                    description: description || '',
                    status: 'ACTIVE',
                    documents: JSON.stringify({}),
                    createdBy: req.user?.id || 'dev-user',
                    approvedBy: req.user?.id || 'dev-user',
                    approvedAt: new Date()
                }
            }
        },
        include: {
            distributorProfile: true
        }
    });
    const response = {
        success: true,
        message: 'Distributor account created successfully',
        data: {
            distributor: {
                id: user.id,
                email: user.email,
                username: user.username,
                fullName: user.fullName,
                role: user.role,
                isActive: user.isActive,
                profile: user.distributorProfile
            }
        }
    };
    res.status(201).json(response);
});
exports.getDistributors = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const where = {
        role: 'DISTRIBUTOR'
    };
    if (search) {
        where.OR = [
            { fullName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { username: { contains: search, mode: 'insensitive' } },
            {
                distributorProfile: {
                    companyName: { contains: search, mode: 'insensitive' }
                }
            }
        ];
    }
    const [distributors, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take,
            orderBy: { [sortBy]: sortOrder },
            include: {
                distributorProfile: true
            }
        }),
        prisma.user.count({ where })
    ]);
    const totalPages = Math.ceil(total / take);
    const response = {
        success: true,
        message: 'Distributors retrieved successfully',
        data: distributors,
        pagination: {
            page: parseInt(page),
            limit: take,
            total,
            totalPages,
            hasNext: parseInt(page) < totalPages,
            hasPrev: parseInt(page) > 1
        }
    };
    res.status(200).json(response);
});
exports.getDistributorById = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const distributor = await prisma.user.findFirst({
        where: {
            id,
            role: 'DISTRIBUTOR'
        },
        include: {
            distributorProfile: true
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
        message: 'Distributor retrieved successfully',
        data: distributor
    };
    res.status(200).json(response);
});
exports.updateDistributor = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        const response = {
            success: false,
            message: 'Authentication required',
            error: 'AUTHENTICATION_REQUIRED'
        };
        res.status(401).json(response);
        return;
    }
    const { id } = req.params;
    const updateData = req.body;
    const existingDistributor = await prisma.user.findFirst({
        where: {
            id,
            role: 'DISTRIBUTOR'
        }
    });
    if (!existingDistributor) {
        const response = {
            success: false,
            message: 'Distributor not found',
            error: 'DISTRIBUTOR_NOT_FOUND'
        };
        res.status(404).json(response);
        return;
    }
    const updatedUser = await prisma.user.update({
        where: { id },
        data: {
            email: updateData.email,
            address: updateData.address,
            updatedAt: new Date()
        },
        include: {
            distributorProfile: true
        }
    });
    const response = {
        success: true,
        message: 'Distributor updated successfully',
        data: updatedUser
    };
    res.status(200).json(response);
});
exports.deleteDistributor = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        const response = {
            success: false,
            message: 'Authentication required',
            error: 'AUTHENTICATION_REQUIRED'
        };
        res.status(401).json(response);
        return;
    }
    const { id } = req.params;
    const existingDistributor = await prisma.user.findFirst({
        where: {
            id,
            role: 'DISTRIBUTOR'
        }
    });
    if (!existingDistributor) {
        const response = {
            success: false,
            message: 'Distributor not found',
            error: 'DISTRIBUTOR_NOT_FOUND'
        };
        res.status(404).json(response);
        return;
    }
    await prisma.user.delete({
        where: { id }
    });
    const response = {
        success: true,
        message: 'Distributor deleted successfully'
    };
    res.status(200).json(response);
});
exports.getDistributorCredentials = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user && process.env.NODE_ENV !== 'development') {
        const response = {
            success: false,
            message: 'Authentication required',
            error: 'AUTHENTICATION_REQUIRED'
        };
        res.status(401).json(response);
        return;
    }
    const { id } = req.params;
    const distributor = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            assignedCategories: {
                include: {
                    category: {
                        select: {
                            id: true,
                            title: true,
                            description: true,
                            slug: true,
                            isActive: true
                        }
                    }
                }
            }
        }
    });
    if (!distributor) {
        const response = {
            success: false,
            message: 'डिस्ट्रिब्युटर फेला परेन',
            error: 'DISTRIBUTOR_NOT_FOUND'
        };
        res.status(404).json(response);
        return;
    }
    if (distributor.role !== 'DISTRIBUTOR') {
        const response = {
            success: false,
            message: 'यो युजर डिस्ट्रिब्युटर होइन',
            error: 'INVALID_USER_TYPE'
        };
        res.status(400).json(response);
        return;
    }
    const response = {
        success: true,
        message: 'डिस्ट्रिब्युटर क्रेडेन्शियल्स फेला पर्यो',
        data: {
            id: distributor.id,
            distributorId: distributor.id,
            username: distributor.username,
            email: distributor.email,
            password: '••••••••',
            isActive: distributor.isActive,
            categories: distributor.assignedCategories.map(dc => dc.category),
            createdAt: distributor.createdAt,
            updatedAt: distributor.updatedAt
        }
    };
    res.status(200).json(response);
});
exports.saveDistributorCredentials = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user && process.env.NODE_ENV !== 'development') {
        const response = {
            success: false,
            message: 'Authentication required',
            error: 'AUTHENTICATION_REQUIRED'
        };
        res.status(401).json(response);
        return;
    }
    const { id } = req.params;
    const { username, email, password, categories = [] } = req.body;
    const distributor = await prisma.user.findUnique({
        where: { id },
        select: { id: true, role: true }
    });
    if (!distributor) {
        const response = {
            success: false,
            message: 'डिस्ट्रिब्युटर फेला परेन',
            error: 'DISTRIBUTOR_NOT_FOUND'
        };
        res.status(404).json(response);
        return;
    }
    if (distributor.role !== 'DISTRIBUTOR') {
        const response = {
            success: false,
            message: 'यो युजर डिस्ट्रिब्युटर होइन',
            error: 'INVALID_USER_TYPE'
        };
        res.status(400).json(response);
        return;
    }
    const existingUser = await prisma.user.findFirst({
        where: {
            AND: [
                { id: { not: id } },
                {
                    OR: [
                        { username },
                        { email }
                    ]
                }
            ]
        }
    });
    if (existingUser) {
        const response = {
            success: false,
            message: 'यो युजरनेम वा इमेल पहिले नै प्रयोग भएको छ',
            error: 'CREDENTIALS_ALREADY_EXISTS'
        };
        res.status(409).json(response);
        return;
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const result = await prisma.$transaction(async (tx) => {
        const updatedDistributor = await tx.user.update({
            where: { id },
            data: {
                username,
                email,
                password: hashedPassword,
                updatedAt: new Date()
            },
            select: {
                id: true,
                username: true,
                email: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });
        await tx.distributorCategory.deleteMany({
            where: { distributorId: id }
        });
        if (categories && categories.length > 0) {
            const categoryAssignments = categories.map((categoryId) => ({
                distributorId: id,
                categoryId,
                assignedBy: req.user?.id || 'system'
            }));
            await tx.distributorCategory.createMany({
                data: categoryAssignments
            });
        }
        return updatedDistributor;
    });
    try {
        const application = await prisma.distributorApplication.findFirst({
            where: {
                OR: [
                    { email: result.email },
                    { fullName: { contains: result.username, mode: 'insensitive' } }
                ]
            }
        });
        if (application) {
            const emailData = {
                applicationId: application.id,
                fullName: application.fullName,
                email: result.email,
                companyName: application.companyName,
                distributionArea: application.desiredDistributorArea,
                businessType: application.businessType,
                reviewNotes: 'Credentials have been set for your approved application'
            };
            const credentials = {
                username: result.username,
                email: result.email,
                password: password,
                categories: categories || []
            };
            await mailjet_service_1.default.notifyDistributorApproved(emailData, credentials);
        }
    }
    catch (emailError) {
        console.error('Failed to send credentials email:', emailError);
    }
    const response = {
        success: true,
        message: 'डिस्ट्रिब्युटर क्रेडेन्शियल्स सफलतापूर्वक सेभ भयो',
        data: {
            id: result.id,
            distributorId: result.id,
            username: result.username,
            email: result.email,
            password: '••••••••',
            isActive: result.isActive,
            categories: categories || [],
            createdAt: result.createdAt,
            updatedAt: result.updatedAt
        }
    };
    res.status(200).json(response);
});
exports.deleteDistributorCredentials = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user && process.env.NODE_ENV !== 'development') {
        const response = {
            success: false,
            message: 'Authentication required',
            error: 'AUTHENTICATION_REQUIRED'
        };
        res.status(401).json(response);
        return;
    }
    const { id } = req.params;
    const distributor = await prisma.user.findUnique({
        where: { id },
        select: { id: true, role: true }
    });
    if (!distributor) {
        const response = {
            success: false,
            message: 'डिस्ट्रिब्युटर फेला परेन',
            error: 'DISTRIBUTOR_NOT_FOUND'
        };
        res.status(404).json(response);
        return;
    }
    if (distributor.role !== 'DISTRIBUTOR') {
        const response = {
            success: false,
            message: 'यो युजर डिस्ट्रिब्युटर होइन',
            error: 'INVALID_USER_TYPE'
        };
        res.status(400).json(response);
        return;
    }
    const randomUsername = `dist_${id.slice(-8)}`;
    const randomPassword = Math.random().toString(36).slice(-12);
    const hashedPassword = await bcryptjs_1.default.hash(randomPassword, 10);
    const updatedDistributor = await prisma.user.update({
        where: { id },
        data: {
            username: randomUsername,
            password: hashedPassword,
            updatedAt: new Date()
        },
        select: {
            id: true,
            username: true,
            email: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
        }
    });
    const response = {
        success: true,
        message: 'Distributor credentials reset successfully',
        data: {
            id: updatedDistributor.id,
            distributorId: updatedDistributor.id,
            username: updatedDistributor.username,
            email: updatedDistributor.email,
            password: '••••••••',
            isActive: updatedDistributor.isActive,
            createdAt: updatedDistributor.createdAt,
            updatedAt: updatedDistributor.updatedAt
        }
    };
    res.status(200).json(response);
});
exports.findDistributorByApplication = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { applicationId } = req.params;
    try {
        const application = await prisma.distributorApplication.findUnique({
            where: { id: applicationId },
            select: {
                id: true,
                fullName: true,
                email: true,
                mobileNumber: true,
                status: true
            }
        });
        if (!application) {
            const response = {
                success: false,
                message: 'आवेदन फेला परेन',
                error: 'APPLICATION_NOT_FOUND'
            };
            res.status(404).json(response);
            return;
        }
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: application.email || '' },
                    { fullName: application.fullName }
                ],
                role: 'DISTRIBUTOR'
            },
            select: {
                id: true,
                username: true,
                email: true,
                fullName: true,
                isActive: true,
                createdAt: true
            }
        });
        if (!user) {
            const response = {
                success: false,
                message: 'यस आवेदनको लागि युजर खाता फेला परेन',
                error: 'USER_NOT_FOUND'
            };
            res.status(404).json(response);
            return;
        }
        const response = {
            success: true,
            message: 'डिस्ट्रिब्युटर फेला पर्यो',
            data: user
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error finding distributor by application:', error);
        const response = {
            success: false,
            message: 'डिस्ट्रिब्युटर खोज्दा त्रुटि भयो',
            error: 'INTERNAL_SERVER_ERROR'
        };
        res.status(500).json(response);
    }
});
exports.deactivateDistributor = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                email: true,
                fullName: true,
                isActive: true,
                role: true
            }
        });
        if (!user) {
            const response = {
                success: false,
                message: 'युजर फेला परेन',
                error: 'USER_NOT_FOUND'
            };
            res.status(404).json(response);
            return;
        }
        if (user.role !== 'DISTRIBUTOR') {
            const response = {
                success: false,
                message: 'यो युजर डिस्ट्रिब्युटर होइन',
                error: 'INVALID_USER_ROLE'
            };
            res.status(400).json(response);
            return;
        }
        if (!user.isActive) {
            const response = {
                success: false,
                message: 'यो युजर पहिले नै निष्क्रिय छ',
                error: 'USER_ALREADY_INACTIVE'
            };
            res.status(400).json(response);
            return;
        }
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                isActive: false,
                updatedAt: new Date()
            },
            select: {
                id: true,
                username: true,
                email: true,
                fullName: true,
                isActive: true,
                updatedAt: true
            }
        });
        const response = {
            success: true,
            message: 'डिस्ट्रिब्युटर खाता सफलतापूर्वक निष्क्रिय गरियो',
            data: updatedUser
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error deactivating distributor:', error);
        const response = {
            success: false,
            message: 'डिस्ट्रिब्युटर निष्क्रिय गर्दा त्रुटि भयो',
            error: 'INTERNAL_SERVER_ERROR'
        };
        res.status(500).json(response);
    }
});
exports.activateDistributor = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                email: true,
                fullName: true,
                isActive: true,
                role: true
            }
        });
        if (!user) {
            const response = {
                success: false,
                message: 'युजर फेला परेन',
                error: 'USER_NOT_FOUND'
            };
            res.status(404).json(response);
            return;
        }
        if (user.role !== 'DISTRIBUTOR') {
            const response = {
                success: false,
                message: 'यो युजर डिस्ट्रिब्युटर होइन',
                error: 'INVALID_USER_ROLE'
            };
            res.status(400).json(response);
            return;
        }
        if (user.isActive) {
            const response = {
                success: false,
                message: 'यो युजर पहिले नै सक्रिय छ',
                error: 'USER_ALREADY_ACTIVE'
            };
            res.status(400).json(response);
            return;
        }
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                isActive: true,
                updatedAt: new Date()
            },
            select: {
                id: true,
                username: true,
                email: true,
                fullName: true,
                isActive: true,
                updatedAt: true
            }
        });
        const response = {
            success: true,
            message: 'डिस्ट्रिब्युटर खाता सफलतापूर्वक सक्रिय गरियो',
            data: updatedUser
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error activating distributor:', error);
        const response = {
            success: false,
            message: 'डिस्ट्रिब्युटर सक्रिय गर्दा त्रुटि भयो',
            error: 'INTERNAL_SERVER_ERROR'
        };
        res.status(500).json(response);
    }
});
//# sourceMappingURL=distributors.controller.js.map