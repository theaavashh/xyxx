import { z } from 'zod';

// Base validation schemas
const phoneRegex = /^(\+977)?[0-9]{10}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const citizenshipRegex = /^[0-9]{2}-[0-9]{2}-[0-9]{2}-[0-9]{5}$/;
const panVatRegex = /^[0-9]{9}$/;

// Personal Details Schema
export const PersonalDetailsSchema = z.object({
  fullName: z.string()
    .min(2, 'पूरा नाम कम्तिमा २ अक्षरको हुनुपर्छ')
    .max(100, 'पूरा नाम १०० अक्षरभन्दा बढी हुन सक्दैन'),
  
  age: z.number()
    .int('उमेर पूर्णांक हुनुपर्छ')
    .min(18, 'उमेर कम्तिमा १८ वर्ष हुनुपर्छ')
    .max(100, 'उमेर १०० वर्षभन्दा बढी हुन सक्दैन'),
  
  gender: z.enum(['पुरुष', 'महिला', 'अन्य'], {
    errorMap: () => ({ message: 'लिङ्ग छान्नुहोस्' })
  }),
  
  citizenshipNumber: z.string()
    .regex(citizenshipRegex, 'नागरिकता नम्बर सही ढाँचामा हुनुपर्छ (XX-XX-XX-XXXXX)'),
  
  issuedDistrict: z.string()
    .min(2, 'जारी जिल्ला प्रविष्ट गर्नुहोस्')
    .max(50, 'जिल्लाको नाम ५० अक्षरभन्दा बढी हुन सक्दैन'),
  
  mobileNumber: z.string()
    .regex(phoneRegex, 'मोबाइल नम्बर सही ढाँचामा हुनुपर्छ'),
  
  email: z.string()
    .regex(emailRegex, 'इमेल ठेगाना सही ढाँचामा हुनुपर्छ')
    .optional()
    .or(z.literal('')),
  
  permanentAddress: z.string()
    .min(10, 'स्थायी ठेगाना कम्तिमा १० अक्षरको हुनुपर्छ')
    .max(200, 'स्थायी ठेगाना २०० अक्षरभन्दा बढी हुन सक्दैन'),
  
  temporaryAddress: z.string()
    .max(200, 'अस्थायी ठेगाना २०० अक्षरभन्दा बढी हुन सक्दैन')
    .optional()
});

// Business Details Schema
export const BusinessDetailsSchema = z.object({
  companyName: z.string()
    .min(2, 'कम्पनी/फर्मको नाम कम्तिमा २ अक्षरको हुनुपर्छ')
    .max(100, 'कम्पनी/फर्मको नाम १०० अक्षरभन्दा बढी हुन सक्दैन'),
  
  registrationNumber: z.string()
    .min(5, 'दर्ता नम्बर कम्तिमा ५ अक्षरको हुनुपर्छ')
    .max(50, 'दर्ता नम्बर ५० अक्षरभन्दा बढी हुन सक्दैन'),
  
  panVatNumber: z.string()
    .regex(panVatRegex, 'PAN/VAT नम्बर ९ अंकको हुनुपर्छ'),
  
  officeAddress: z.string()
    .min(10, 'कार्यालयको ठेगाना कम्तिमा १० अक्षरको हुनुपर्छ')
    .max(200, 'कार्यालयको ठेगाना २०० अक्षरभन्दा बढी हुन सक्दैन'),
  
  operatingArea: z.string()
    .min(2, 'काम गरिरहेको क्षेत्र प्रविष्ट गर्नुहोस्')
    .max(100, 'काम गरिरहेको क्षेत्र १०० अक्षरभन्दा बढी हुन सक्दैन'),
  
  desiredDistributorArea: z.string()
    .min(2, 'वितरक बन्न चाहेको क्षेत्र प्रविष्ट गर्नुहोस्')
    .max(100, 'वितरक बन्न चाहेको क्षेत्र १०० अक्षरभन्दा बढी हुन सक्दैन'),
  
  currentBusiness: z.string()
    .min(5, 'हालको व्यवसाय कम्तिमा ५ अक्षरको हुनुपर्छ')
    .max(200, 'हालको व्यवसाय २०० अक्षरभन्दा बढी हुन सक्दैन'),
  
  businessType: z.string()
    .min(2, 'व्यवसायको प्रकार छान्नुहोस्')
    .max(50, 'व्यवसायको प्रकार ५० अक्षरभन्दा बढी हुन सक्दैन')
});

// Staff and Infrastructure Schema
export const StaffInfrastructureSchema = z.object({
  salesManCount: z.number().int().min(0, 'बिक्री कर्मचारी संख्या ० वा बढी हुनुपर्छ'),
  salesManExperience: z.string().max(500, 'अनुभव विवरण ५०० अक्षरभन्दा बढी हुन सक्दैन').optional(),
  
  deliveryStaffCount: z.number().int().min(0, 'डेलिभरी कर्मचारी संख्या ० वा बढी हुनुपर्छ'),
  deliveryStaffExperience: z.string().max(500, 'अनुभव विवरण ५०० अक्षरभन्दा बढी हुन सक्दैन').optional(),
  
  accountAssistantCount: z.number().int().min(0, 'खाता सहायक संख्या ० वा बढी हुनुपर्छ'),
  accountAssistantExperience: z.string().max(500, 'अनुभव विवरण ५०० अक्षरभन्दा बढी हुन सक्दैन').optional(),
  
  otherStaffCount: z.number().int().min(0, 'अन्य कर्मचारी संख्या ० वा बढी हुनुपर्छ'),
  otherStaffExperience: z.string().max(500, 'अनुभव विवरण ५०० अक्षरभन्दा बढी हुन सक्दैन').optional(),
  
  warehouseSpace: z.number().min(0, 'गोदाम ठाउँ ० वा बढी हुनुपर्छ'),
  warehouseExperience: z.string().max(500, 'अनुभव विवरण ५०० अक्षरभन्दा बढी हुन सक्दैन').optional(),
  
  truckCount: z.number().int().min(0, 'ट्रक संख्या ० वा बढी हुनुपर्छ'),
  truckExperience: z.string().max(500, 'अनुभव विवरण ५०० अक्षरभन्दा बढी हुन सक्दैन').optional(),
  
  fourWheelerCount: z.number().int().min(0, 'चार पाङ्ग्रे गाडी संख्या ० वा बढी हुनुपर्छ'),
  fourWheelerExperience: z.string().max(500, 'अनुभव विवरण ५०० अक्षरभन्दा बढी हुन सक्दैन').optional(),
  
  twoWheelerCount: z.number().int().min(0, 'दुई पाङ्ग्रे गाडी संख्या ० वा बढी हुनुपर्छ'),
  twoWheelerExperience: z.string().max(500, 'अनुभव विवरण ५०० अक्षरभन्दा बढी हुन सक्दैन').optional(),
  
  cycleCount: z.number().int().min(0, 'साइकल संख्या ० वा बढी हुनुपर्छ'),
  cycleExperience: z.string().max(500, 'अनुभव विवरण ५०० अक्षरभन्दा बढी हुन सक्दैन').optional(),
  
  thelaCount: z.number().int().min(0, 'ठेला संख्या ० वा बढी हुनुपर्छ'),
  thelaExperience: z.string().max(500, 'अनुभव विवरण ५०० अक्षरभन्दा बढी हुन सक्दैन').optional()
});

// Current Transactions Schema
export const CurrentTransactionSchema = z.object({
  company: z.string().max(100, 'कम्पनीको नाम १०० अक्षरभन्दा बढी हुन सक्दैन').optional(),
  products: z.string().max(200, 'उत्पादनहरू २०० अक्षरभन्दा बढी हुन सक्दैन').optional(),
  turnover: z.string().max(50, 'कारोबार ५० अक्षरभन्दा बढी हुन सक्दैन').optional()
});

export const CurrentTransactionsSchema = z.object({
  currentTransactions: z.array(CurrentTransactionSchema).max(6, 'अधिकतम ६ वटा कारोबार मात्र थप्न सकिन्छ')
});

// Business Information Schema
export const BusinessInformationSchema = z.object({
  productCategory: z.string()
    .min(2, 'उत्पादन श्रेणी छान्नुहोस्')
    .max(100, 'उत्पादन श्रेणी १०० अक्षरभन्दा बढी हुन सक्दैन'),
  
  yearsInBusiness: z.number()
    .int('व्यवसायमा वर्ष पूर्णांक हुनुपर्छ')
    .min(0, 'व्यवसायमा वर्ष ० वा बढी हुनुपर्छ')
    .max(100, 'व्यवसायमा वर्ष १०० भन्दा बढी हुन सक्दैन'),
  
  monthlySales: z.string()
    .min(1, 'मासिक बिक्री प्रविष्ट गर्नुहोस्')
    .max(50, 'मासिक बिक्री ५० अक्षरभन्दा बढी हुन सक्दैन'),
  
  storageFacility: z.string()
    .min(5, 'भण्डारण सुविधा कम्तिमा ५ अक्षरको हुनुपर्छ')
    .max(200, 'भण्डारण सुविधा २०० अक्षरभन्दा बढी हुन सक्दैन')
});

// Products to Distribute Schema
export const ProductToDistributeSchema = z.object({
  productName: z.string().max(100, 'उत्पादनको नाम १०० अक्षरभन्दा बढी हुन सक्दैन').optional(),
  monthlySalesCapacity: z.string().max(50, 'मासिक बिक्री क्षमता ५० अक्षरभन्दा बढी हुन सक्दैन').optional()
});

export const ProductsToDistributeSchema = z.object({
  productsToDistribute: z.array(ProductToDistributeSchema).max(10, 'अधिकतम १० वटा उत्पादन मात्र थप्न सकिन्छ')
});

// Partnership Details Schema
export const PartnershipDetailsSchema = z.object({
  partnerFullName: z.string().max(100, 'साझेदारको नाम १०० अक्षरभन्दा बढी हुन सक्दैन').optional(),
  partnerAge: z.number().int().min(18).max(100).optional(),
  partnerGender: z.enum(['पुरुष', 'महिला', 'अन्य']).optional(),
  partnerCitizenshipNumber: z.string().regex(citizenshipRegex).optional(),
  partnerIssuedDistrict: z.string().max(50).optional(),
  partnerMobileNumber: z.string().regex(phoneRegex).optional(),
  partnerEmail: z.string().regex(emailRegex).optional(),
  partnerPermanentAddress: z.string().max(200).optional(),
  partnerTemporaryAddress: z.string().max(200).optional()
});

// Retailer Requirements Schema
export const RetailerRequirementsSchema = z.object({
  preferredProducts: z.string()
    .min(2, 'मनपर्ने उत्पादनहरू प्रविष्ट गर्नुहोस्')
    .max(200, 'मनपर्ने उत्पादनहरू २०० अक्षरभन्दा बढी हुन सक्दैन'),
  
  monthlyOrderQuantity: z.string()
    .min(1, 'मासिक अर्डर मात्रा प्रविष्ट गर्नुहोस्')
    .max(50, 'मासिक अर्डर मात्रा ५० अक्षरभन्दा बढी हुन सक्दैन'),
  
  paymentPreference: z.string()
    .min(2, 'भुक्तानी प्राथमिकता छान्नुहोस्')
    .max(50, 'भुक्तानी प्राथमिकता ५० अक्षरभन्दा बढी हुन सक्दैन'),
  
  creditDays: z.number().int().min(0).max(365).optional(),
  
  deliveryPreference: z.string()
    .min(2, 'डेलिभरी प्राथमिकता छान्नुहोस्')
    .max(50, 'डेलिभरी प्राथमिकता ५० अक्षरभन्दा बढी हुन सक्दैन')
});

// Area Coverage Schema
export const AreaCoverageSchema = z.object({
  distributionArea: z.string().max(100, 'वितरण क्षेत्र १०० अक्षरभन्दा बढी हुन सक्दैन').optional(),
  populationEstimate: z.string().max(50, 'जनसंख्या अनुमान ५० अक्षरभन्दा बढी हुन सक्दैन').optional(),
  competitorBrand: z.string().max(100, 'प्रतिस्पर्धी ब्रान्ड १०० अक्षरभन्दा बढी हुन सक्दैन').optional()
});

export const AreaCoverageDetailsSchema = z.object({
  areaCoverage: z.array(AreaCoverageSchema).max(9, 'अधिकतम ९ वटा क्षेत्र मात्र थप्न सकिन्छ')
});

// Additional Information Schema
export const AdditionalInformationSchema = z.object({
  additionalInfo1: z.string().max(500, 'थप जानकारी ५०० अक्षरभन्दा बढी हुन सक्दैन').optional(),
  additionalInfo2: z.string().max(500, 'थप जानकारी ५०० अक्षरभन्दा बढी हुन सक्दैन').optional(),
  additionalInfo3: z.string().max(500, 'थप जानकारी ५०० अक्षरभन्दा बढी हुन सक्दैन').optional()
});

// Documents Schema
export const DocumentsSchema = z.object({
  citizenshipId: z.string().optional(), // File path after upload
  companyRegistration: z.string().optional(),
  panVatRegistration: z.string().optional(),
  officePhoto: z.string().optional(),
  areaMap: z.string().optional()
});

// Declaration Schema
export const DeclarationSchema = z.object({
  declaration: z.boolean().refine(val => val === true, {
    message: 'घोषणामा सहमति जनाउनुपर्छ'
  }),
  signature: z.string()
    .min(2, 'हस्ताक्षर प्रविष्ट गर्नुहोस्')
    .max(100, 'हस्ताक्षर १०० अक्षरभन्दा बढी हुन सक्दैन'),
  date: z.string()
    .min(10, 'मिति प्रविष्ट गर्नुहोस्')
    .max(10, 'मिति सही ढाँचामा हुनुपर्छ')
});

// Complete Distributor Application Schema
export const DistributorApplicationSchema = z.object({
  personalDetails: PersonalDetailsSchema,
  businessDetails: BusinessDetailsSchema,
  staffInfrastructure: StaffInfrastructureSchema,
  currentTransactions: CurrentTransactionsSchema,
  businessInformation: BusinessInformationSchema,
  productsToDistribute: ProductsToDistributeSchema,
  partnershipDetails: PartnershipDetailsSchema.optional(),
  retailerRequirements: RetailerRequirementsSchema,
  areaCoverageDetails: AreaCoverageDetailsSchema,
  additionalInformation: AdditionalInformationSchema.optional(),
  documents: DocumentsSchema.optional(),
  declaration: DeclarationSchema
});

// Application Status Schema
export const ApplicationStatusSchema = z.enum([
  'PENDING',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'REQUIRES_CHANGES'
]);

// Application Update Schema (for sales team)
export const ApplicationUpdateSchema = z.object({
  status: ApplicationStatusSchema,
  reviewNotes: z.string()
    .max(1000, 'समीक्षा टिप्पणी १००० अक्षरभन्दा बढी हुन सक्दैन')
    .optional(),
  reviewedBy: z.string()
    .min(1, 'समीक्षाकर्ताको नाम आवश्यक छ')
    .max(100, 'समीक्षाकर्ताको नाम १०० अक्षरभन्दा बढी हुन सक्दैन'),
  reviewedAt: z.date().default(() => new Date())
});

// Application Update Schema (for development - no auth required)
export const ApplicationUpdateDevSchema = z.object({
  status: ApplicationStatusSchema,
  reviewNotes: z.string()
    .max(1000, 'समीक्षा टिप्पणी १००० अक्षरभन्दा बढी हुन सक्दैन')
    .optional()
});

// Export types
export type PersonalDetails = z.infer<typeof PersonalDetailsSchema>;
export type BusinessDetails = z.infer<typeof BusinessDetailsSchema>;
export type StaffInfrastructure = z.infer<typeof StaffInfrastructureSchema>;
export type CurrentTransactions = z.infer<typeof CurrentTransactionsSchema>;
export type BusinessInformation = z.infer<typeof BusinessInformationSchema>;
export type ProductsToDistribute = z.infer<typeof ProductsToDistributeSchema>;
export type PartnershipDetails = z.infer<typeof PartnershipDetailsSchema>;
export type RetailerRequirements = z.infer<typeof RetailerRequirementsSchema>;
export type AreaCoverageDetails = z.infer<typeof AreaCoverageDetailsSchema>;
export type AdditionalInformation = z.infer<typeof AdditionalInformationSchema>;
export type Documents = z.infer<typeof DocumentsSchema>;
export type Declaration = z.infer<typeof DeclarationSchema>;
export type DistributorApplication = z.infer<typeof DistributorApplicationSchema>;
export type ApplicationStatus = z.infer<typeof ApplicationStatusSchema>;
export type ApplicationUpdate = z.infer<typeof ApplicationUpdateSchema>;
