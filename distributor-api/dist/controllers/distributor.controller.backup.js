"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOfferLetter = exports.getApplicationByReference = exports.saveDraftApplication = exports.getApplicationStats = exports.deleteApplication = exports.updateApplicationStatusDev = exports.updateApplicationStatus = exports.getApplicationById = exports.getApplications = exports.submitApplication = void 0;
const client_1 = require("@prisma/client");
const error_middleware_1 = require("../middleware/error.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
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
    if (!applicationData.fullName || !applicationData.email || !applicationData.contactNumber) {
        const response = {
            success: false,
            message: 'व्यक्तिगत विवरण आवश्यक छ (नाम, इमेल, सम्पर्क नम्बर)',
            error: 'MISSING_PERSONAL_DETAILS'
        };
        res.status(400).json(response);
        return;
    }
    if (process.env.NODE_ENV === 'development') {
        console.log('📋 Application Data Received:', JSON.stringify(applicationData, null, 2));
        console.log('📁 Files Received:', filePaths);
    }
    const transformedData = {
        fullName: applicationData.fullName || '',
        age: parseInt(applicationData.age) || 18,
        gender: applicationData.gender || 'पुरुष',
        citizenshipNumber: applicationData.citizenshipNumber || '',
        issuedDistrict: applicationData.issuedDistrict || '',
        mobileNumber: applicationData.contactNumber || applicationData.mobileNumber || '',
        email: applicationData.email || '',
        permanentAddress: applicationData.permanentAddress || '',
        temporaryAddress: applicationData.temporaryAddress || '',
        companyName: applicationData.companyName || '',
        registrationNumber: applicationData.registrationNumber || '',
        panVatNumber: applicationData.panVatNumber || '',
        officeAddress: applicationData.officeAddress || '',
        operatingArea: `${applicationData.workAreaProvince || ''}, ${applicationData.workAreaDistrict || ''}`,
        desiredDistributorArea: applicationData.desiredDistributionArea || '',
        currentBusiness: applicationData.businessType || '',
        businessType: applicationData.businessStructure || 'individual',
        salesManCount: 0,
        salesManExperience: '',
        deliveryStaffCount: 0,
        deliveryStaffExperience: '',
        accountAssistantCount: 0,
        accountAssistantExperience: '',
        otherStaffCount: 0,
        otherStaffExperience: '',
        warehouseSpace: 0,
        warehouseDetails: '',
        truckCount: 0,
        truckDetails: '',
        fourWheelerCount: 0,
        fourWheelerDetails: '',
        twoWheelerCount: 0,
        twoWheelerDetails: '',
        cycleCount: 0,
        cycleDetails: '',
        thelaCount: 0,
        thelaDetails: '',
        productCategory: applicationData.productCategory || '',
        yearsInBusiness: parseInt(applicationData.businessExperience) || 1,
        monthlySales: applicationData.monthlyIncome || '',
        storageFacility: applicationData.storageFacility || '',
        preferredProducts: applicationData.productCategory || '',
        monthlyOrderQuantity: '0',
        paymentPreference: applicationData.paymentPreference || '',
        creditDays: parseInt(applicationData.creditDays) || 0,
        deliveryPreference: applicationData.deliveryPreference || '',
        partnerFullName: applicationData.partnerFullName || null,
        partnerAge: applicationData.partnerAge ? parseInt(applicationData.partnerAge) : null,
        partnerGender: applicationData.partnerGender || null,
        partnerCitizenshipNumber: applicationData.partnerCitizenshipNumber || null,
        partnerIssuedDistrict: applicationData.partnerIssuedDistrict || null,
        partnerMobileNumber: applicationData.partnerMobileNumber || null,
        partnerEmail: applicationData.partnerEmail || null,
        partnerPermanentAddress: applicationData.partnerPermanentAddress || null,
        partnerTemporaryAddress: applicationData.partnerTemporaryAddress || null,
        additionalInfo1: '',
        additionalInfo2: '',
        additionalInfo3: '',
        citizenshipId: filePaths.citizenshipId || null,
        citizenshipBack: filePaths.citizenshipBack || null,
        companyRegistration: filePaths.companyRegistration || null,
        panVatRegistration: filePaths.panVatRegistration || null,
        officePhoto: filePaths.officePhoto || null,
        areaMap: filePaths.areaMap || null,
        declaration: true,
        signature: applicationData.fullName || '',
        date: new Date().toISOString().split('T')[0],
        agreementAccepted: applicationData.agreementAccepted || false,
        distributorSignatureName: applicationData.distributorSignatureName || applicationData.fullName || '',
        distributorSignatureDate: applicationData.distributorSignatureDate || new Date().toISOString().split('T')[0],
    };
    if (applicationData.staffDetails && Array.isArray(applicationData.staffDetails)) {
        applicationData.staffDetails.forEach((staff) => {
            switch (staff.staffType) {
                case 'salesman':
                    transformedData.salesManCount = staff.quantity || 0;
                    break;
                case 'delivery-staff':
                    transformedData.deliveryStaffCount = staff.quantity || 0;
                    break;
                case 'account-assistant':
                    transformedData.accountAssistantCount = staff.quantity || 0;
                    break;
                case 'other':
                    transformedData.otherStaffCount = staff.quantity || 0;
                    break;
            }
        });
    }
    else if (applicationData.selectedStaffType && applicationData.staffQuantity) {
        switch (applicationData.selectedStaffType) {
            case 'salesman':
                transformedData.salesManCount = applicationData.staffQuantity;
                break;
            case 'delivery-staff':
                transformedData.deliveryStaffCount = applicationData.staffQuantity;
                break;
            case 'account-assistant':
                transformedData.accountAssistantCount = applicationData.staffQuantity;
                break;
            case 'other':
                transformedData.otherStaffCount = applicationData.staffQuantity;
                break;
        }
    }
    if (applicationData.infrastructureDetails && Array.isArray(applicationData.infrastructureDetails)) {
        applicationData.infrastructureDetails.forEach((infra) => {
            switch (infra.infrastructureType) {
                case 'warehouse':
                    transformedData.warehouseSpace = infra.quantity || 0;
                    break;
                case 'transport':
                    transformedData.truckCount = infra.quantity || 0;
                    break;
                case 'four-wheeler':
                    transformedData.fourWheelerCount = infra.quantity || 0;
                    break;
                case 'two-wheeler':
                    transformedData.twoWheelerCount = infra.quantity || 0;
                    break;
                case 'cycle':
                    transformedData.cycleCount = infra.quantity || 0;
                    break;
                case 'thela':
                    transformedData.thelaCount = infra.quantity || 0;
                    break;
            }
        });
    }
    else if (applicationData.selectedInfrastructureType && applicationData.infrastructureQuantity) {
        switch (applicationData.selectedInfrastructureType) {
            case 'warehouse':
                transformedData.warehouseSpace = applicationData.infrastructureQuantity;
                transformedData.warehouseDetails = applicationData.storageFacility || '';
                break;
            case 'transport':
                transformedData.truckCount = applicationData.infrastructureQuantity;
                transformedData.truckDetails = applicationData.storageFacility || '';
                break;
            case 'four-wheeler':
                transformedData.fourWheelerCount = applicationData.infrastructureQuantity;
                break;
            case 'two-wheeler':
                transformedData.twoWheelerCount = applicationData.infrastructureQuantity;
                break;
            case 'cycle':
                transformedData.cycleCount = applicationData.infrastructureQuantity;
                break;
            case 'thela':
                transformedData.thelaCount = applicationData.infrastructureQuantity;
                break;
        }
    }
    const referenceNumber = `APP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const application = await prisma.distributorApplication.create({
        data: {
            referenceNumber,
            ...transformedData,
            currentTransactions: {
                create: (applicationData.currentTransactions || []).filter((ct) => ct.company && ct.products).map((ct) => ({
                    company: ct.company,
                    products: ct.products,
                    turnover: ct.turnover
                }))
            },
            productsToDistribute: {
                create: (applicationData.products || []).filter((pd) => pd.name).map((pd) => ({
                    productName: pd.name,
                    monthlySalesCapacity: pd.monthlySalesCapacity || '0'
                }))
            },
            areaCoverageDetails: {
                create: [{
                        distributionArea: applicationData.desiredDistributionArea || '',
                        populationEstimate: '0',
                        competitorBrand: ''
                    }]
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
        data: {
            application,
            referenceNumber
        }
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
    const authenticatedReq = req;
    if (authenticatedReq.user?.role === 'SALES_REPRESENTATIVE') {
        where.OR = [
            { createdById: authenticatedReq.user.id },
            { reviewedById: authenticatedReq.user.id }
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
var distributor_controller_original_1 = require("./distributor.controller.original");
Object.defineProperty(exports, "updateApplicationStatus", { enumerable: true, get: function () { return distributor_controller_original_1.updateApplicationStatus; } });
Object.defineProperty(exports, "updateApplicationStatusDev", { enumerable: true, get: function () { return distributor_controller_original_1.updateApplicationStatusDev; } });
Object.defineProperty(exports, "deleteApplication", { enumerable: true, get: function () { return distributor_controller_original_1.deleteApplication; } });
Object.defineProperty(exports, "getApplicationStats", { enumerable: true, get: function () { return distributor_controller_original_1.getApplicationStats; } });
Object.defineProperty(exports, "saveDraftApplication", { enumerable: true, get: function () { return distributor_controller_original_1.saveDraftApplication; } });
Object.defineProperty(exports, "getApplicationByReference", { enumerable: true, get: function () { return distributor_controller_original_1.getApplicationByReference; } });
Object.defineProperty(exports, "sendOfferLetter", { enumerable: true, get: function () { return distributor_controller_original_1.sendOfferLetter; } });
//# sourceMappingURL=distributor.controller.backup.js.map