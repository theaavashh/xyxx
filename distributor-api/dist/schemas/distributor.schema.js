"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationUpdateDevSchema = exports.ApplicationUpdateSchema = exports.ApplicationStatusSchema = exports.DistributorApplicationSchema = exports.DeclarationSchema = exports.DocumentsSchema = exports.AdditionalInformationSchema = exports.AreaCoverageDetailsSchema = exports.AreaCoverageSchema = exports.RetailerRequirementsSchema = exports.PartnershipDetailsSchema = exports.ProductsToDistributeSchema = exports.ProductToDistributeSchema = exports.BusinessInformationSchema = exports.CurrentTransactionsSchema = exports.CurrentTransactionSchema = exports.StaffInfrastructureSchema = exports.BusinessDetailsSchema = exports.PersonalDetailsSchema = void 0;
const zod_1 = require("zod");
const phoneRegex = /^(\+977)?[0-9]{10}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const citizenshipRegex = /^[0-9]{2}-[0-9]{2}-[0-9]{2}-[0-9]{5}$/;
const panVatRegex = /^[0-9]{9}$/;
exports.PersonalDetailsSchema = zod_1.z.object({
    fullName: zod_1.z.string()
        .min(2, 'पूरा नाम कम्तिमा २ अक्षरको हुनुपर्छ')
        .max(100, 'पूरा नाम १०० अक्षरभन्दा बढी हुन सक्दैन'),
    age: zod_1.z.number()
        .int('उमेर पूर्णांक हुनुपर्छ')
        .min(18, 'उमेर कम्तिमा १८ वर्ष हुनुपर्छ')
        .max(100, 'उमेर १०० वर्षभन्दा बढी हुन सक्दैन'),
    gender: zod_1.z.enum(['पुरुष', 'महिला', 'अन्य'], {
        errorMap: () => ({ message: 'लिङ्ग छान्नुहोस्' })
    }),
    citizenshipNumber: zod_1.z.string()
        .regex(citizenshipRegex, 'नागरिकता नम्बर सही ढाँचामा हुनुपर्छ (XX-XX-XX-XXXXX)'),
    issuedDistrict: zod_1.z.string()
        .min(2, 'जारी जिल्ला प्रविष्ट गर्नुहोस्')
        .max(50, 'जिल्लाको नाम ५० अक्षरभन्दा बढी हुन सक्दैन'),
    mobileNumber: zod_1.z.string()
        .regex(phoneRegex, 'मोबाइल नम्बर सही ढाँचामा हुनुपर्छ'),
    email: zod_1.z.string()
        .regex(emailRegex, 'इमेल ठेगाना सही ढाँचामा हुनुपर्छ')
        .optional()
        .or(zod_1.z.literal('')),
    permanentAddress: zod_1.z.string()
        .min(10, 'स्थायी ठेगाना कम्तिमा १० अक्षरको हुनुपर्छ')
        .max(200, 'स्थायी ठेगाना २०० अक्षरभन्दा बढी हुन सक्दैन'),
    temporaryAddress: zod_1.z.string()
        .max(200, 'अस्थायी ठेगाना २०० अक्षरभन्दा बढी हुन सक्दैन')
        .optional()
});
exports.BusinessDetailsSchema = zod_1.z.object({
    companyName: zod_1.z.string()
        .min(2, 'कम्पनी/फर्मको नाम कम्तिमा २ अक्षरको हुनुपर्छ')
        .max(100, 'कम्पनी/फर्मको नाम १०० अक्षरभन्दा बढी हुन सक्दैन'),
    registrationNumber: zod_1.z.string()
        .min(5, 'दर्ता नम्बर कम्तिमा ५ अक्षरको हुनुपर्छ')
        .max(50, 'दर्ता नम्बर ५० अक्षरभन्दा बढी हुन सक्दैन'),
    panVatNumber: zod_1.z.string()
        .regex(panVatRegex, 'PAN/VAT नम्बर ९ अंकको हुनुपर्छ'),
    officeAddress: zod_1.z.string()
        .min(10, 'कार्यालयको ठेगाना कम्तिमा १० अक्षरको हुनुपर्छ')
        .max(200, 'कार्यालयको ठेगाना २०० अक्षरभन्दा बढी हुन सक्दैन'),
    operatingArea: zod_1.z.string()
        .min(2, 'काम गरिरहेको क्षेत्र प्रविष्ट गर्नुहोस्')
        .max(100, 'काम गरिरहेको क्षेत्र १०० अक्षरभन्दा बढी हुन सक्दैन'),
    desiredDistributorArea: zod_1.z.string()
        .min(2, 'वितरक बन्न चाहेको क्षेत्र प्रविष्ट गर्नुहोस्')
        .max(100, 'वितरक बन्न चाहेको क्षेत्र १०० अक्षरभन्दा बढी हुन सक्दैन'),
    currentBusiness: zod_1.z.string()
        .min(5, 'हालको व्यवसाय कम्तिमा ५ अक्षरको हुनुपर्छ')
        .max(200, 'हालको व्यवसाय २०० अक्षरभन्दा बढी हुन सक्दैन'),
    businessType: zod_1.z.string()
        .min(2, 'व्यवसायको प्रकार छान्नुहोस्')
        .max(50, 'व्यवसायको प्रकार ५० अक्षरभन्दा बढी हुन सक्दैन')
});
exports.StaffInfrastructureSchema = zod_1.z.object({
    salesManCount: zod_1.z.number().int().min(0, 'बिक्री कर्मचारी संख्या ० वा बढी हुनुपर्छ'),
    salesManExperience: zod_1.z.string().max(500, 'अनुभव विवरण ५०० अक्षरभन्दा बढी हुन सक्दैन').optional(),
    deliveryStaffCount: zod_1.z.number().int().min(0, 'डेलिभरी कर्मचारी संख्या ० वा बढी हुनुपर्छ'),
    deliveryStaffExperience: zod_1.z.string().max(500, 'अनुभव विवरण ५०० अक्षरभन्दा बढी हुन सक्दैन').optional(),
    accountAssistantCount: zod_1.z.number().int().min(0, 'खाता सहायक संख्या ० वा बढी हुनुपर्छ'),
    accountAssistantExperience: zod_1.z.string().max(500, 'अनुभव विवरण ५०० अक्षरभन्दा बढी हुन सक्दैन').optional(),
    otherStaffCount: zod_1.z.number().int().min(0, 'अन्य कर्मचारी संख्या ० वा बढी हुनुपर्छ'),
    otherStaffExperience: zod_1.z.string().max(500, 'अनुभव विवरण ५०० अक्षरभन्दा बढी हुन सक्दैन').optional(),
    warehouseSpace: zod_1.z.number().min(0, 'गोदाम ठाउँ ० वा बढी हुनुपर्छ'),
    warehouseExperience: zod_1.z.string().max(500, 'अनुभव विवरण ५०० अक्षरभन्दा बढी हुन सक्दैन').optional(),
    truckCount: zod_1.z.number().int().min(0, 'ट्रक संख्या ० वा बढी हुनुपर्छ'),
    truckExperience: zod_1.z.string().max(500, 'अनुभव विवरण ५०० अक्षरभन्दा बढी हुन सक्दैन').optional(),
    fourWheelerCount: zod_1.z.number().int().min(0, 'चार पाङ्ग्रे गाडी संख्या ० वा बढी हुनुपर्छ'),
    fourWheelerExperience: zod_1.z.string().max(500, 'अनुभव विवरण ५०० अक्षरभन्दा बढी हुन सक्दैन').optional(),
    twoWheelerCount: zod_1.z.number().int().min(0, 'दुई पाङ्ग्रे गाडी संख्या ० वा बढी हुनुपर्छ'),
    twoWheelerExperience: zod_1.z.string().max(500, 'अनुभव विवरण ५०० अक्षरभन्दा बढी हुन सक्दैन').optional(),
    cycleCount: zod_1.z.number().int().min(0, 'साइकल संख्या ० वा बढी हुनुपर्छ'),
    cycleExperience: zod_1.z.string().max(500, 'अनुभव विवरण ५०० अक्षरभन्दा बढी हुन सक्दैन').optional(),
    thelaCount: zod_1.z.number().int().min(0, 'ठेला संख्या ० वा बढी हुनुपर्छ'),
    thelaExperience: zod_1.z.string().max(500, 'अनुभव विवरण ५०० अक्षरभन्दा बढी हुन सक्दैन').optional()
});
exports.CurrentTransactionSchema = zod_1.z.object({
    company: zod_1.z.string().max(100, 'कम्पनीको नाम १०० अक्षरभन्दा बढी हुन सक्दैन').optional(),
    products: zod_1.z.string().max(200, 'उत्पादनहरू २०० अक्षरभन्दा बढी हुन सक्दैन').optional(),
    turnover: zod_1.z.string().max(50, 'कारोबार ५० अक्षरभन्दा बढी हुन सक्दैन').optional()
});
exports.CurrentTransactionsSchema = zod_1.z.object({
    currentTransactions: zod_1.z.array(exports.CurrentTransactionSchema).max(6, 'अधिकतम ६ वटा कारोबार मात्र थप्न सकिन्छ')
});
exports.BusinessInformationSchema = zod_1.z.object({
    productCategory: zod_1.z.string()
        .min(2, 'उत्पादन श्रेणी छान्नुहोस्')
        .max(100, 'उत्पादन श्रेणी १०० अक्षरभन्दा बढी हुन सक्दैन'),
    yearsInBusiness: zod_1.z.number()
        .int('व्यवसायमा वर्ष पूर्णांक हुनुपर्छ')
        .min(0, 'व्यवसायमा वर्ष ० वा बढी हुनुपर्छ')
        .max(100, 'व्यवसायमा वर्ष १०० भन्दा बढी हुन सक्दैन'),
    monthlySales: zod_1.z.string()
        .min(1, 'मासिक बिक्री प्रविष्ट गर्नुहोस्')
        .max(50, 'मासिक बिक्री ५० अक्षरभन्दा बढी हुन सक्दैन'),
    storageFacility: zod_1.z.string()
        .min(5, 'भण्डारण सुविधा कम्तिमा ५ अक्षरको हुनुपर्छ')
        .max(200, 'भण्डारण सुविधा २०० अक्षरभन्दा बढी हुन सक्दैन')
});
exports.ProductToDistributeSchema = zod_1.z.object({
    productName: zod_1.z.string().max(100, 'उत्पादनको नाम १०० अक्षरभन्दा बढी हुन सक्दैन').optional(),
    monthlySalesCapacity: zod_1.z.string().max(50, 'मासिक बिक्री क्षमता ५० अक्षरभन्दा बढी हुन सक्दैन').optional()
});
exports.ProductsToDistributeSchema = zod_1.z.object({
    productsToDistribute: zod_1.z.array(exports.ProductToDistributeSchema).max(10, 'अधिकतम १० वटा उत्पादन मात्र थप्न सकिन्छ')
});
exports.PartnershipDetailsSchema = zod_1.z.object({
    partnerFullName: zod_1.z.string().max(100, 'साझेदारको नाम १०० अक्षरभन्दा बढी हुन सक्दैन').optional(),
    partnerAge: zod_1.z.number().int().min(18).max(100).optional(),
    partnerGender: zod_1.z.enum(['पुरुष', 'महिला', 'अन्य']).optional(),
    partnerCitizenshipNumber: zod_1.z.string().regex(citizenshipRegex).optional(),
    partnerIssuedDistrict: zod_1.z.string().max(50).optional(),
    partnerMobileNumber: zod_1.z.string().regex(phoneRegex).optional(),
    partnerEmail: zod_1.z.string().regex(emailRegex).optional(),
    partnerPermanentAddress: zod_1.z.string().max(200).optional(),
    partnerTemporaryAddress: zod_1.z.string().max(200).optional()
});
exports.RetailerRequirementsSchema = zod_1.z.object({
    preferredProducts: zod_1.z.string()
        .min(2, 'मनपर्ने उत्पादनहरू प्रविष्ट गर्नुहोस्')
        .max(200, 'मनपर्ने उत्पादनहरू २०० अक्षरभन्दा बढी हुन सक्दैन'),
    monthlyOrderQuantity: zod_1.z.string()
        .min(1, 'मासिक अर्डर मात्रा प्रविष्ट गर्नुहोस्')
        .max(50, 'मासिक अर्डर मात्रा ५० अक्षरभन्दा बढी हुन सक्दैन'),
    paymentPreference: zod_1.z.string()
        .min(2, 'भुक्तानी प्राथमिकता छान्नुहोस्')
        .max(50, 'भुक्तानी प्राथमिकता ५० अक्षरभन्दा बढी हुन सक्दैन'),
    creditDays: zod_1.z.number().int().min(0).max(365).optional(),
    deliveryPreference: zod_1.z.string()
        .min(2, 'डेलिभरी प्राथमिकता छान्नुहोस्')
        .max(50, 'डेलिभरी प्राथमिकता ५० अक्षरभन्दा बढी हुन सक्दैन')
});
exports.AreaCoverageSchema = zod_1.z.object({
    distributionArea: zod_1.z.string().max(100, 'वितरण क्षेत्र १०० अक्षरभन्दा बढी हुन सक्दैन').optional(),
    populationEstimate: zod_1.z.string().max(50, 'जनसंख्या अनुमान ५० अक्षरभन्दा बढी हुन सक्दैन').optional(),
    competitorBrand: zod_1.z.string().max(100, 'प्रतिस्पर्धी ब्रान्ड १०० अक्षरभन्दा बढी हुन सक्दैन').optional()
});
exports.AreaCoverageDetailsSchema = zod_1.z.object({
    areaCoverage: zod_1.z.array(exports.AreaCoverageSchema).max(9, 'अधिकतम ९ वटा क्षेत्र मात्र थप्न सकिन्छ')
});
exports.AdditionalInformationSchema = zod_1.z.object({
    additionalInfo1: zod_1.z.string().max(500, 'थप जानकारी ५०० अक्षरभन्दा बढी हुन सक्दैन').optional(),
    additionalInfo2: zod_1.z.string().max(500, 'थप जानकारी ५०० अक्षरभन्दा बढी हुन सक्दैन').optional(),
    additionalInfo3: zod_1.z.string().max(500, 'थप जानकारी ५०० अक्षरभन्दा बढी हुन सक्दैन').optional()
});
exports.DocumentsSchema = zod_1.z.object({
    citizenshipId: zod_1.z.string().optional(),
    companyRegistration: zod_1.z.string().optional(),
    panVatRegistration: zod_1.z.string().optional(),
    officePhoto: zod_1.z.string().optional(),
    areaMap: zod_1.z.string().optional()
});
exports.DeclarationSchema = zod_1.z.object({
    declaration: zod_1.z.boolean().refine(val => val === true, {
        message: 'घोषणामा सहमति जनाउनुपर्छ'
    }),
    signature: zod_1.z.string()
        .min(2, 'हस्ताक्षर प्रविष्ट गर्नुहोस्')
        .max(100, 'हस्ताक्षर १०० अक्षरभन्दा बढी हुन सक्दैन'),
    date: zod_1.z.string()
        .min(10, 'मिति प्रविष्ट गर्नुहोस्')
        .max(10, 'मिति सही ढाँचामा हुनुपर्छ')
});
exports.DistributorApplicationSchema = zod_1.z.object({
    personalDetails: exports.PersonalDetailsSchema,
    businessDetails: exports.BusinessDetailsSchema,
    staffInfrastructure: exports.StaffInfrastructureSchema,
    currentTransactions: exports.CurrentTransactionsSchema,
    businessInformation: exports.BusinessInformationSchema,
    productsToDistribute: exports.ProductsToDistributeSchema,
    partnershipDetails: exports.PartnershipDetailsSchema.optional(),
    retailerRequirements: exports.RetailerRequirementsSchema,
    areaCoverageDetails: exports.AreaCoverageDetailsSchema,
    additionalInformation: exports.AdditionalInformationSchema.optional(),
    documents: exports.DocumentsSchema.optional(),
    declaration: exports.DeclarationSchema
});
exports.ApplicationStatusSchema = zod_1.z.enum([
    'PENDING',
    'UNDER_REVIEW',
    'APPROVED',
    'REJECTED',
    'REQUIRES_CHANGES'
]);
exports.ApplicationUpdateSchema = zod_1.z.object({
    status: exports.ApplicationStatusSchema,
    reviewNotes: zod_1.z.string()
        .max(1000, 'समीक्षा टिप्पणी १००० अक्षरभन्दा बढी हुन सक्दैन')
        .optional(),
    reviewedBy: zod_1.z.string()
        .min(1, 'समीक्षाकर्ताको नाम आवश्यक छ')
        .max(100, 'समीक्षाकर्ताको नाम १०० अक्षरभन्दा बढी हुन सक्दैन'),
    reviewedAt: zod_1.z.date().default(() => new Date())
});
exports.ApplicationUpdateDevSchema = zod_1.z.object({
    status: exports.ApplicationStatusSchema,
    reviewNotes: zod_1.z.string()
        .max(1000, 'समीक्षा टिप्पणी १००० अक्षरभन्दा बढी हुन सक्दैन')
        .optional()
});
//# sourceMappingURL=distributor.schema.js.map