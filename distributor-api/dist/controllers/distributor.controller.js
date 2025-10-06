"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOfferLetter = exports.getApplicationStats = exports.deleteApplication = exports.updateApplicationStatusDev = exports.updateApplicationStatus = exports.getApplicationById = exports.getApplications = exports.submitApplication = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const error_middleware_1 = require("../middleware/error.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const mailjet_service_1 = __importDefault(require("../services/mailjet.service"));
const prisma = new client_1.PrismaClient();
exports.submitApplication = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    let applicationData;
    try {
        if (req.body.data) {
            applicationData = JSON.parse(req.body.data);
        }
        else {
            applicationData = req.body;
        }
    }
    catch (error) {
        const response = {
            success: false,
            message: 'अवैध डाटा ढाँचा',
            error: 'INVALID_DATA_FORMAT'
        };
        res.status(400).json(response);
        return;
    }
    const files = req.files;
    const filePaths = files ? (0, upload_middleware_1.getFilePaths)(files) : {};
    if (!applicationData.personalDetails?.fullName) {
        const response = {
            success: false,
            message: 'व्यक्तिगत विवरण आवश्यक छ',
            error: 'MISSING_PERSONAL_DETAILS'
        };
        res.status(400).json(response);
        return;
    }
    if (process.env.NODE_ENV === 'development') {
        console.log('📋 Application Data Received:', JSON.stringify(applicationData, null, 2));
        console.log('📁 Files Received:', filePaths);
    }
    const application = await prisma.distributorApplication.create({
        data: {
            fullName: applicationData.personalDetails.fullName,
            age: applicationData.personalDetails.age,
            gender: applicationData.personalDetails.gender,
            citizenshipNumber: applicationData.personalDetails.citizenshipNumber,
            issuedDistrict: applicationData.personalDetails.issuedDistrict,
            mobileNumber: applicationData.personalDetails.mobileNumber,
            email: applicationData.personalDetails.email,
            permanentAddress: applicationData.personalDetails.permanentAddress,
            temporaryAddress: applicationData.personalDetails.temporaryAddress,
            companyName: applicationData.businessDetails.companyName,
            registrationNumber: applicationData.businessDetails.registrationNumber,
            panVatNumber: applicationData.businessDetails.panVatNumber,
            officeAddress: applicationData.businessDetails.officeAddress,
            operatingArea: applicationData.businessDetails.operatingArea,
            desiredDistributorArea: applicationData.businessDetails.desiredDistributorArea,
            currentBusiness: applicationData.businessDetails.currentBusiness,
            businessType: applicationData.businessDetails.businessType,
            salesManCount: applicationData.staffInfrastructure.salesManCount,
            salesManExperience: applicationData.staffInfrastructure.salesManExperience,
            deliveryStaffCount: applicationData.staffInfrastructure.deliveryStaffCount,
            deliveryStaffExperience: applicationData.staffInfrastructure.deliveryStaffExperience,
            accountAssistantCount: applicationData.staffInfrastructure.accountAssistantCount,
            accountAssistantExperience: applicationData.staffInfrastructure.accountAssistantExperience,
            otherStaffCount: applicationData.staffInfrastructure.otherStaffCount,
            otherStaffExperience: applicationData.staffInfrastructure.otherStaffExperience,
            warehouseSpace: applicationData.staffInfrastructure.warehouseSpace,
            warehouseDetails: applicationData.staffInfrastructure.warehouseDetails,
            truckCount: applicationData.staffInfrastructure.truckCount,
            truckDetails: applicationData.staffInfrastructure.truckDetails,
            fourWheelerCount: applicationData.staffInfrastructure.fourWheelerCount,
            fourWheelerDetails: applicationData.staffInfrastructure.fourWheelerDetails,
            twoWheelerCount: applicationData.staffInfrastructure.twoWheelerCount,
            twoWheelerDetails: applicationData.staffInfrastructure.twoWheelerDetails,
            cycleCount: applicationData.staffInfrastructure.cycleCount,
            cycleDetails: applicationData.staffInfrastructure.cycleDetails,
            thelaCount: applicationData.staffInfrastructure.thelaCount,
            thelaDetails: applicationData.staffInfrastructure.thelaDetails,
            productCategory: applicationData.businessInformation.productCategory,
            yearsInBusiness: applicationData.businessInformation.yearsInBusiness,
            monthlySales: applicationData.businessInformation.monthlySales,
            storageFacility: applicationData.businessInformation.storageFacility,
            preferredProducts: applicationData.retailerRequirements.preferredProducts,
            monthlyOrderQuantity: applicationData.retailerRequirements.monthlyOrderQuantity,
            paymentPreference: applicationData.retailerRequirements.paymentPreference,
            creditDays: applicationData.retailerRequirements.creditDays,
            deliveryPreference: applicationData.retailerRequirements.deliveryPreference,
            partnerFullName: applicationData.partnershipDetails?.partnerFullName,
            partnerAge: applicationData.partnershipDetails?.partnerAge,
            partnerGender: applicationData.partnershipDetails?.partnerGender,
            partnerCitizenshipNumber: applicationData.partnershipDetails?.partnerCitizenshipNumber,
            partnerIssuedDistrict: applicationData.partnershipDetails?.partnerIssuedDistrict,
            partnerMobileNumber: applicationData.partnershipDetails?.partnerMobileNumber,
            partnerEmail: applicationData.partnershipDetails?.partnerEmail,
            partnerPermanentAddress: applicationData.partnershipDetails?.partnerPermanentAddress,
            partnerTemporaryAddress: applicationData.partnershipDetails?.partnerTemporaryAddress,
            additionalInfo1: applicationData.additionalInformation?.additionalInfo1,
            additionalInfo2: applicationData.additionalInformation?.additionalInfo2,
            additionalInfo3: applicationData.additionalInformation?.additionalInfo3,
            citizenshipId: filePaths.citizenshipId,
            companyRegistration: filePaths.companyRegistration,
            panVatRegistration: filePaths.panVatRegistration,
            officePhoto: filePaths.officePhoto,
            areaMap: filePaths.areaMap,
            declaration: applicationData.declaration.declaration,
            signature: applicationData.declaration.signature,
            date: applicationData.declaration.date,
            agreementAccepted: applicationData.agreement.agreementAccepted,
            distributorSignatureName: applicationData.agreement.distributorSignatureName,
            distributorSignatureDate: applicationData.agreement.distributorSignatureDate,
            currentTransactions: {
                create: applicationData.currentTransactions?.filter(ct => ct.company && ct.products).map(ct => ({
                    company: ct.company,
                    products: ct.products,
                    turnover: ct.turnover
                })) || []
            },
            productsToDistribute: {
                create: applicationData.productsToDistribute?.filter(pd => pd.productName).map(pd => ({
                    productName: pd.productName,
                    monthlySalesCapacity: pd.monthlySalesCapacity
                })) || []
            },
            areaCoverageDetails: {
                create: applicationData.areaCoverageDetails?.filter(acd => acd.distributionArea).map(acd => ({
                    distributionArea: acd.distributionArea,
                    populationEstimate: acd.populationEstimate,
                    competitorBrand: acd.competitorBrand
                })) || []
            },
            applicationHistory: {
                create: {
                    status: 'PENDING',
                    notes: 'आवेदन पेश गरिएको',
                    changedBy: 'System',
                    changedAt: new Date()
                }
            }
        },
        include: {
            currentTransactions: true,
            productsToDistribute: true,
            areaCoverageDetails: true,
            applicationHistory: true
        }
    });
    const response = {
        success: true,
        message: 'आवेदन सफलतापूर्वक पेश गरिएको छ',
        data: { application }
    };
    res.status(201).json(response);
});
exports.getApplications = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', status, dateFrom, dateTo, search, reviewedBy } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const where = {};
    if (status) {
        where.status = status;
    }
    if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) {
            where.createdAt.gte = new Date(dateFrom);
        }
        if (dateTo) {
            where.createdAt.lte = new Date(dateTo);
        }
    }
    if (search) {
        where.OR = [
            { fullName: { contains: search, mode: 'insensitive' } },
            { companyName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { mobileNumber: { contains: search } },
            { citizenshipNumber: { contains: search } }
        ];
    }
    if (reviewedBy) {
        where.reviewedById = reviewedBy;
    }
    if (req.user?.role === 'SALES_REPRESENTATIVE') {
        where.OR = [
            { createdById: req.user.id },
            { reviewedById: req.user.id }
        ];
    }
    const [applications, total] = await Promise.all([
        prisma.distributorApplication.findMany({
            where,
            skip,
            take,
            orderBy: { [sortBy]: sortOrder },
            include: {
                currentTransactions: true,
                productsToDistribute: true,
                areaCoverageDetails: true,
                reviewedBy: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: true
                    }
                },
                createdBy: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                },
                applicationHistory: {
                    orderBy: { changedAt: 'desc' },
                    take: 5
                }
            }
        }),
        prisma.distributorApplication.count({ where })
    ]);
    const totalPages = Math.ceil(total / take);
    const response = {
        success: true,
        message: 'आवेदनहरू सफलतापूर्वक प्राप्त भयो',
        data: applications,
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
exports.getApplicationById = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const application = await prisma.distributorApplication.findUnique({
        where: { id },
        include: {
            currentTransactions: true,
            productsToDistribute: true,
            areaCoverageDetails: true,
            reviewedBy: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    role: true
                }
            },
            createdBy: {
                select: {
                    id: true,
                    fullName: true,
                    email: true
                }
            },
            applicationHistory: {
                orderBy: { changedAt: 'desc' }
            }
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
    const response = {
        success: true,
        message: 'आवेदन सफलतापूर्वक प्राप्त भयो',
        data: { application }
    };
    res.status(200).json(response);
});
exports.updateApplicationStatus = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        const response = {
            success: false,
            message: 'प्रमाणीकरण आवश्यक छ',
            error: 'AUTHENTICATION_REQUIRED'
        };
        res.status(401).json(response);
        return;
    }
    const { id } = req.params;
    const updateData = req.body;
    const existingApplication = await prisma.distributorApplication.findUnique({
        where: { id },
        select: { id: true, status: true }
    });
    if (!existingApplication) {
        const response = {
            success: false,
            message: 'आवेदन फेला परेन',
            error: 'APPLICATION_NOT_FOUND'
        };
        res.status(404).json(response);
        return;
    }
    if (updateData.status === 'APPROVED') {
        const application = await prisma.distributorApplication.findUnique({
            where: { id },
            include: {
                currentTransactions: true,
                productsToDistribute: true,
                areaCoverageDetails: true
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
        const existingUser = await prisma.user.findFirst({
            where: {
                applicationId: application.id
            }
        });
        if (!existingUser) {
            const defaultUsername = `dist_${application.id.slice(-8)}`;
            const defaultPassword = Math.random().toString(36).slice(-12);
            const hashedPassword = await bcryptjs_1.default.hash(defaultPassword, 10);
            await prisma.user.create({
                data: {
                    email: application.email || `${defaultUsername}@distributor.local`,
                    username: defaultUsername,
                    fullName: application.fullName,
                    password: hashedPassword,
                    role: 'DISTRIBUTOR',
                    isActive: true,
                    isVerified: true,
                    address: application.permanentAddress,
                    department: 'Distributor',
                    position: 'Distributor',
                    applicationId: application.id,
                    distributorProfile: {
                        create: {
                            firstName: application.fullName.split(' ')[0] || 'Unknown',
                            lastName: application.fullName.split(' ').slice(1).join(' ') || 'Distributor',
                            phoneNumber: application.mobileNumber,
                            address: application.permanentAddress,
                            dateOfBirth: new Date(2000, 0, 1),
                            nationalId: application.citizenshipNumber,
                            companyName: application.companyName,
                            companyType: application.businessType,
                            registrationNumber: application.registrationNumber,
                            panNumber: application.panVatNumber,
                            vatNumber: application.panVatNumber,
                            establishedDate: new Date(),
                            companyAddress: application.officeAddress,
                            website: '',
                            description: `Distributor for ${application.desiredDistributorArea}`,
                            status: 'ACTIVE',
                            documents: JSON.stringify({
                                citizenshipId: application.citizenshipId,
                                companyRegistration: application.companyRegistration,
                                panVatRegistration: application.panVatRegistration
                            }),
                            createdBy: req.user.id,
                            approvedBy: req.user.id,
                            approvedAt: new Date()
                        }
                    }
                }
            });
        }
    }
    const updatedApplication = await prisma.distributorApplication.update({
        where: { id },
        data: {
            status: updateData.status,
            reviewNotes: updateData.reviewNotes,
            reviewedBy: { connect: { id: req.user.id } },
            reviewedAt: new Date(),
            applicationHistory: {
                create: {
                    status: updateData.status,
                    notes: updateData.reviewNotes || `स्थिति परिवर्तन: ${updateData.status}`,
                    changedBy: req.user.fullName,
                    changedAt: new Date()
                }
            }
        },
        include: {
            currentTransactions: true,
            productsToDistribute: true,
            areaCoverageDetails: true,
            reviewedBy: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    role: true
                }
            },
            applicationHistory: {
                orderBy: { changedAt: 'desc' },
                take: 5
            }
        }
    });
    if (updateData.status === 'APPROVED') {
        try {
            const createdUser = await prisma.user.findFirst({
                where: { applicationId: id },
                include: {
                    assignedCategories: {
                        include: {
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
            const emailData = {
                applicationId: updatedApplication.id,
                fullName: updatedApplication.fullName,
                email: updatedApplication.email,
                companyName: updatedApplication.companyName,
                distributionArea: updatedApplication.desiredDistributorArea,
                businessType: updatedApplication.businessType,
                reviewNotes: updateData.reviewNotes
            };
            if (createdUser) {
                const credentials = {
                    username: createdUser.username,
                    email: createdUser.email,
                    password: 'Temporary password - please change after first login',
                    categories: createdUser.assignedCategories.map(ac => ac.category)
                };
                await mailjet_service_1.default.notifyDistributorApproved(emailData, credentials);
            }
            else {
                await mailjet_service_1.default.notifyDistributorApproved(emailData);
            }
        }
        catch (emailError) {
            console.error('Failed to send approval email:', emailError);
        }
    }
    const response = {
        success: true,
        message: 'आवेदनको स्थिति सफलतापूर्वक अपडेट भयो',
        data: { application: updatedApplication }
    };
    res.status(200).json(response);
});
exports.updateApplicationStatusDev = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const existingApplication = await prisma.distributorApplication.findUnique({
        where: { id },
        select: { id: true, status: true }
    });
    if (!existingApplication) {
        const response = {
            success: false,
            message: 'आवेदन फेला परेन',
            error: 'APPLICATION_NOT_FOUND'
        };
        res.status(404).json(response);
        return;
    }
    if (updateData.status === 'APPROVED') {
        const application = await prisma.distributorApplication.findUnique({
            where: { id },
            include: {
                currentTransactions: true,
                productsToDistribute: true,
                areaCoverageDetails: true
            }
        });
        if (application) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email: application.email || '' },
                        { fullName: application.fullName }
                    ]
                }
            });
            if (!existingUser) {
                const defaultUsername = `dist_${application.id.slice(-8)}`;
                const defaultPassword = Math.random().toString(36).slice(-12);
                const hashedPassword = await bcryptjs_1.default.hash(defaultPassword, 10);
                await prisma.user.create({
                    data: {
                        email: application.email || `${defaultUsername}@distributor.local`,
                        username: defaultUsername,
                        fullName: application.fullName,
                        password: hashedPassword,
                        role: 'DISTRIBUTOR',
                        isActive: true,
                        isVerified: true,
                        address: application.permanentAddress,
                        department: 'Distributor',
                        position: 'Distributor',
                        distributorProfile: {
                            create: {
                                firstName: application.fullName.split(' ')[0] || 'Unknown',
                                lastName: application.fullName.split(' ').slice(1).join(' ') || 'Distributor',
                                phoneNumber: application.mobileNumber,
                                address: application.permanentAddress,
                                dateOfBirth: new Date(2000, 0, 1),
                                nationalId: application.citizenshipNumber,
                                companyName: application.companyName,
                                companyType: application.businessType,
                                registrationNumber: application.registrationNumber,
                                panNumber: application.panVatNumber,
                                vatNumber: application.panVatNumber,
                                establishedDate: new Date(),
                                companyAddress: application.officeAddress,
                                website: '',
                                description: `Distributor for ${application.desiredDistributorArea}`,
                                status: 'ACTIVE',
                                documents: JSON.stringify({
                                    citizenshipId: application.citizenshipId,
                                    companyRegistration: application.companyRegistration,
                                    panVatRegistration: application.panVatRegistration
                                }),
                                createdBy: 'dev-user',
                                approvedBy: 'dev-user',
                                approvedAt: new Date()
                            }
                        }
                    }
                });
            }
        }
    }
    const updatedApplication = await prisma.distributorApplication.update({
        where: { id },
        data: {
            status: updateData.status,
            reviewNotes: updateData.reviewNotes,
            reviewedAt: new Date(),
            applicationHistory: {
                create: {
                    status: updateData.status,
                    notes: updateData.reviewNotes || `स्थिति परिवर्तन: ${updateData.status}`,
                    changedBy: 'Development User',
                    changedAt: new Date()
                }
            }
        },
        include: {
            currentTransactions: true,
            productsToDistribute: true,
            areaCoverageDetails: true,
            reviewedBy: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    role: true
                }
            },
            applicationHistory: {
                orderBy: { changedAt: 'desc' },
                take: 5
            }
        }
    });
    if (updateData.status === 'APPROVED') {
        try {
            const createdUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email: updatedApplication.email || '' },
                        { fullName: updatedApplication.fullName }
                    ]
                },
                include: {
                    assignedCategories: {
                        include: {
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
            const emailData = {
                applicationId: updatedApplication.id,
                fullName: updatedApplication.fullName,
                email: updatedApplication.email,
                companyName: updatedApplication.companyName,
                distributionArea: updatedApplication.desiredDistributorArea,
                businessType: updatedApplication.businessType,
                reviewNotes: updateData.reviewNotes
            };
            if (createdUser) {
                const credentials = {
                    username: createdUser.username,
                    email: createdUser.email,
                    password: 'Temporary password - please change after first login',
                    categories: createdUser.assignedCategories.map(ac => ac.category)
                };
                await mailjet_service_1.default.notifyDistributorApproved(emailData, credentials);
            }
            else {
                await mailjet_service_1.default.notifyDistributorApproved(emailData);
            }
        }
        catch (emailError) {
            console.error('Failed to send approval email:', emailError);
        }
    }
    const response = {
        success: true,
        message: 'आवेदनको स्थिति सफलतापूर्वक अपडेट भयो',
        data: { application: updatedApplication }
    };
    res.status(200).json(response);
});
exports.deleteApplication = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        const response = {
            success: false,
            message: 'प्रमाणीकरण आवश्यक छ',
            error: 'AUTHENTICATION_REQUIRED'
        };
        res.status(401).json(response);
        return;
    }
    const { id } = req.params;
    const existingApplication = await prisma.distributorApplication.findUnique({
        where: { id },
        select: { id: true, status: true }
    });
    if (!existingApplication) {
        const response = {
            success: false,
            message: 'आवेदन फेला परेन',
            error: 'APPLICATION_NOT_FOUND'
        };
        res.status(404).json(response);
        return;
    }
    if (existingApplication.status !== 'PENDING') {
        const response = {
            success: false,
            message: 'केवल पेन्डिङ आवेदनहरू मेटाउन सकिन्छ',
            error: 'CANNOT_DELETE_PROCESSED_APPLICATION'
        };
        res.status(400).json(response);
        return;
    }
    await prisma.distributorApplication.update({
        where: { id },
        data: {
            status: 'REJECTED',
            reviewNotes: 'आवेदन रद्द गरिएको',
            reviewedBy: { connect: { id: req.user.id } },
            reviewedAt: new Date(),
            applicationHistory: {
                create: {
                    status: 'REJECTED',
                    notes: 'आवेदन रद्द गरिएको',
                    changedBy: req.user.fullName,
                    changedAt: new Date()
                }
            }
        }
    });
    const response = {
        success: true,
        message: 'आवेदन सफलतापूर्वक रद्द गरिएको छ'
    };
    res.status(200).json(response);
});
exports.getApplicationStats = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const [totalApplications, pendingApplications, approvedApplications, rejectedApplications, underReviewApplications, requiresChangesApplications] = await Promise.all([
        prisma.distributorApplication.count(),
        prisma.distributorApplication.count({ where: { status: 'PENDING' } }),
        prisma.distributorApplication.count({ where: { status: 'APPROVED' } }),
        prisma.distributorApplication.count({ where: { status: 'REJECTED' } }),
        prisma.distributorApplication.count({ where: { status: 'UNDER_REVIEW' } }),
        prisma.distributorApplication.count({ where: { status: 'REQUIRES_CHANGES' } })
    ]);
    const recentApplications = await prisma.distributorApplication.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            reviewedBy: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    role: true
                }
            }
        }
    });
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const applicationsByMonth = await prisma.$queryRaw `
    SELECT 
      DATE_TRUNC('month', "createdAt") as month,
      COUNT(*)::int as count
    FROM "distributor_applications"
    WHERE "createdAt" >= ${twelveMonthsAgo}
    GROUP BY DATE_TRUNC('month', "createdAt")
    ORDER BY month ASC
  `;
    const stats = {
        totalApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        underReviewApplications,
        requiresChangesApplications,
        recentApplications,
        applicationsByMonth: applicationsByMonth.map(item => ({
            month: item.month.toISOString().substring(0, 7),
            count: item.count
        })),
        applicationsByStatus: [
            { status: 'PENDING', count: pendingApplications },
            { status: 'UNDER_REVIEW', count: underReviewApplications },
            { status: 'APPROVED', count: approvedApplications },
            { status: 'REJECTED', count: rejectedApplications },
            { status: 'REQUIRES_CHANGES', count: requiresChangesApplications }
        ]
    };
    const response = {
        success: true,
        message: 'आवेदन तथ्याङ्क सफलतापूर्वक प्राप्त भयो',
        data: stats
    };
    res.status(200).json(response);
});
exports.sendOfferLetter = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { distributorId, products, additionalData, distributorInfo } = req.body;
    if (!distributorId || !products || !distributorInfo) {
        const response = {
            success: false,
            message: 'Missing required fields',
            error: 'MISSING_REQUIRED_FIELDS'
        };
        res.status(400).json(response);
        return;
    }
    try {
        await mailjet_service_1.default.sendDistributorOfferLetter({
            ...distributorInfo,
            applicationId: distributorId
        }, products, additionalData);
        const response = {
            success: true,
            message: 'Offer letter sent successfully',
            data: {
                distributorId,
                emailSent: true,
                productsCount: products.length,
                sentAt: new Date().toISOString()
            }
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error sending offer letter:', error);
        const response = {
            success: false,
            message: 'Failed to send offer letter',
            error: 'EMAIL_SEND_FAILED'
        };
        res.status(500).json(response);
    }
});
//# sourceMappingURL=distributor.controller.js.map