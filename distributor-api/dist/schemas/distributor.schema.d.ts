import { z } from 'zod';
export declare const PersonalDetailsSchema: z.ZodObject<{
    fullName: z.ZodString;
    age: z.ZodNumber;
    gender: z.ZodEnum<["पुरुष", "महिला", "अन्य"]>;
    citizenshipNumber: z.ZodString;
    issuedDistrict: z.ZodString;
    mobileNumber: z.ZodString;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    permanentAddress: z.ZodString;
    temporaryAddress: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fullName: string;
    age: number;
    gender: "पुरुष" | "महिला" | "अन्य";
    citizenshipNumber: string;
    issuedDistrict: string;
    mobileNumber: string;
    permanentAddress: string;
    email?: string | undefined;
    temporaryAddress?: string | undefined;
}, {
    fullName: string;
    age: number;
    gender: "पुरुष" | "महिला" | "अन्य";
    citizenshipNumber: string;
    issuedDistrict: string;
    mobileNumber: string;
    permanentAddress: string;
    email?: string | undefined;
    temporaryAddress?: string | undefined;
}>;
export declare const BusinessDetailsSchema: z.ZodObject<{
    companyName: z.ZodString;
    registrationNumber: z.ZodString;
    panVatNumber: z.ZodString;
    officeAddress: z.ZodString;
    operatingArea: z.ZodString;
    desiredDistributorArea: z.ZodString;
    currentBusiness: z.ZodString;
    businessType: z.ZodString;
}, "strip", z.ZodTypeAny, {
    companyName: string;
    registrationNumber: string;
    panVatNumber: string;
    officeAddress: string;
    operatingArea: string;
    desiredDistributorArea: string;
    currentBusiness: string;
    businessType: string;
}, {
    companyName: string;
    registrationNumber: string;
    panVatNumber: string;
    officeAddress: string;
    operatingArea: string;
    desiredDistributorArea: string;
    currentBusiness: string;
    businessType: string;
}>;
export declare const StaffInfrastructureSchema: z.ZodObject<{
    salesManCount: z.ZodNumber;
    salesManExperience: z.ZodOptional<z.ZodString>;
    deliveryStaffCount: z.ZodNumber;
    deliveryStaffExperience: z.ZodOptional<z.ZodString>;
    accountAssistantCount: z.ZodNumber;
    accountAssistantExperience: z.ZodOptional<z.ZodString>;
    otherStaffCount: z.ZodNumber;
    otherStaffExperience: z.ZodOptional<z.ZodString>;
    warehouseSpace: z.ZodNumber;
    warehouseExperience: z.ZodOptional<z.ZodString>;
    truckCount: z.ZodNumber;
    truckExperience: z.ZodOptional<z.ZodString>;
    fourWheelerCount: z.ZodNumber;
    fourWheelerExperience: z.ZodOptional<z.ZodString>;
    twoWheelerCount: z.ZodNumber;
    twoWheelerExperience: z.ZodOptional<z.ZodString>;
    cycleCount: z.ZodNumber;
    cycleExperience: z.ZodOptional<z.ZodString>;
    thelaCount: z.ZodNumber;
    thelaExperience: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    salesManCount: number;
    deliveryStaffCount: number;
    accountAssistantCount: number;
    otherStaffCount: number;
    warehouseSpace: number;
    truckCount: number;
    fourWheelerCount: number;
    twoWheelerCount: number;
    cycleCount: number;
    thelaCount: number;
    salesManExperience?: string | undefined;
    deliveryStaffExperience?: string | undefined;
    accountAssistantExperience?: string | undefined;
    otherStaffExperience?: string | undefined;
    warehouseExperience?: string | undefined;
    truckExperience?: string | undefined;
    fourWheelerExperience?: string | undefined;
    twoWheelerExperience?: string | undefined;
    cycleExperience?: string | undefined;
    thelaExperience?: string | undefined;
}, {
    salesManCount: number;
    deliveryStaffCount: number;
    accountAssistantCount: number;
    otherStaffCount: number;
    warehouseSpace: number;
    truckCount: number;
    fourWheelerCount: number;
    twoWheelerCount: number;
    cycleCount: number;
    thelaCount: number;
    salesManExperience?: string | undefined;
    deliveryStaffExperience?: string | undefined;
    accountAssistantExperience?: string | undefined;
    otherStaffExperience?: string | undefined;
    warehouseExperience?: string | undefined;
    truckExperience?: string | undefined;
    fourWheelerExperience?: string | undefined;
    twoWheelerExperience?: string | undefined;
    cycleExperience?: string | undefined;
    thelaExperience?: string | undefined;
}>;
export declare const CurrentTransactionSchema: z.ZodObject<{
    company: z.ZodOptional<z.ZodString>;
    products: z.ZodOptional<z.ZodString>;
    turnover: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    products?: string | undefined;
    company?: string | undefined;
    turnover?: string | undefined;
}, {
    products?: string | undefined;
    company?: string | undefined;
    turnover?: string | undefined;
}>;
export declare const CurrentTransactionsSchema: z.ZodObject<{
    currentTransactions: z.ZodArray<z.ZodObject<{
        company: z.ZodOptional<z.ZodString>;
        products: z.ZodOptional<z.ZodString>;
        turnover: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        products?: string | undefined;
        company?: string | undefined;
        turnover?: string | undefined;
    }, {
        products?: string | undefined;
        company?: string | undefined;
        turnover?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    currentTransactions: {
        products?: string | undefined;
        company?: string | undefined;
        turnover?: string | undefined;
    }[];
}, {
    currentTransactions: {
        products?: string | undefined;
        company?: string | undefined;
        turnover?: string | undefined;
    }[];
}>;
export declare const BusinessInformationSchema: z.ZodObject<{
    productCategory: z.ZodString;
    yearsInBusiness: z.ZodNumber;
    monthlySales: z.ZodString;
    storageFacility: z.ZodString;
}, "strip", z.ZodTypeAny, {
    productCategory: string;
    yearsInBusiness: number;
    monthlySales: string;
    storageFacility: string;
}, {
    productCategory: string;
    yearsInBusiness: number;
    monthlySales: string;
    storageFacility: string;
}>;
export declare const ProductToDistributeSchema: z.ZodObject<{
    productName: z.ZodOptional<z.ZodString>;
    monthlySalesCapacity: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    productName?: string | undefined;
    monthlySalesCapacity?: string | undefined;
}, {
    productName?: string | undefined;
    monthlySalesCapacity?: string | undefined;
}>;
export declare const ProductsToDistributeSchema: z.ZodObject<{
    productsToDistribute: z.ZodArray<z.ZodObject<{
        productName: z.ZodOptional<z.ZodString>;
        monthlySalesCapacity: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        productName?: string | undefined;
        monthlySalesCapacity?: string | undefined;
    }, {
        productName?: string | undefined;
        monthlySalesCapacity?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    productsToDistribute: {
        productName?: string | undefined;
        monthlySalesCapacity?: string | undefined;
    }[];
}, {
    productsToDistribute: {
        productName?: string | undefined;
        monthlySalesCapacity?: string | undefined;
    }[];
}>;
export declare const PartnershipDetailsSchema: z.ZodObject<{
    partnerFullName: z.ZodOptional<z.ZodString>;
    partnerAge: z.ZodOptional<z.ZodNumber>;
    partnerGender: z.ZodOptional<z.ZodEnum<["पुरुष", "महिला", "अन्य"]>>;
    partnerCitizenshipNumber: z.ZodOptional<z.ZodString>;
    partnerIssuedDistrict: z.ZodOptional<z.ZodString>;
    partnerMobileNumber: z.ZodOptional<z.ZodString>;
    partnerEmail: z.ZodOptional<z.ZodString>;
    partnerPermanentAddress: z.ZodOptional<z.ZodString>;
    partnerTemporaryAddress: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    partnerFullName?: string | undefined;
    partnerAge?: number | undefined;
    partnerGender?: "पुरुष" | "महिला" | "अन्य" | undefined;
    partnerCitizenshipNumber?: string | undefined;
    partnerIssuedDistrict?: string | undefined;
    partnerMobileNumber?: string | undefined;
    partnerEmail?: string | undefined;
    partnerPermanentAddress?: string | undefined;
    partnerTemporaryAddress?: string | undefined;
}, {
    partnerFullName?: string | undefined;
    partnerAge?: number | undefined;
    partnerGender?: "पुरुष" | "महिला" | "अन्य" | undefined;
    partnerCitizenshipNumber?: string | undefined;
    partnerIssuedDistrict?: string | undefined;
    partnerMobileNumber?: string | undefined;
    partnerEmail?: string | undefined;
    partnerPermanentAddress?: string | undefined;
    partnerTemporaryAddress?: string | undefined;
}>;
export declare const RetailerRequirementsSchema: z.ZodObject<{
    preferredProducts: z.ZodString;
    monthlyOrderQuantity: z.ZodString;
    paymentPreference: z.ZodString;
    creditDays: z.ZodOptional<z.ZodNumber>;
    deliveryPreference: z.ZodString;
}, "strip", z.ZodTypeAny, {
    preferredProducts: string;
    monthlyOrderQuantity: string;
    paymentPreference: string;
    deliveryPreference: string;
    creditDays?: number | undefined;
}, {
    preferredProducts: string;
    monthlyOrderQuantity: string;
    paymentPreference: string;
    deliveryPreference: string;
    creditDays?: number | undefined;
}>;
export declare const AreaCoverageSchema: z.ZodObject<{
    distributionArea: z.ZodOptional<z.ZodString>;
    populationEstimate: z.ZodOptional<z.ZodString>;
    competitorBrand: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    distributionArea?: string | undefined;
    populationEstimate?: string | undefined;
    competitorBrand?: string | undefined;
}, {
    distributionArea?: string | undefined;
    populationEstimate?: string | undefined;
    competitorBrand?: string | undefined;
}>;
export declare const AreaCoverageDetailsSchema: z.ZodObject<{
    areaCoverage: z.ZodArray<z.ZodObject<{
        distributionArea: z.ZodOptional<z.ZodString>;
        populationEstimate: z.ZodOptional<z.ZodString>;
        competitorBrand: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        distributionArea?: string | undefined;
        populationEstimate?: string | undefined;
        competitorBrand?: string | undefined;
    }, {
        distributionArea?: string | undefined;
        populationEstimate?: string | undefined;
        competitorBrand?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    areaCoverage: {
        distributionArea?: string | undefined;
        populationEstimate?: string | undefined;
        competitorBrand?: string | undefined;
    }[];
}, {
    areaCoverage: {
        distributionArea?: string | undefined;
        populationEstimate?: string | undefined;
        competitorBrand?: string | undefined;
    }[];
}>;
export declare const AdditionalInformationSchema: z.ZodObject<{
    additionalInfo1: z.ZodOptional<z.ZodString>;
    additionalInfo2: z.ZodOptional<z.ZodString>;
    additionalInfo3: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    additionalInfo1?: string | undefined;
    additionalInfo2?: string | undefined;
    additionalInfo3?: string | undefined;
}, {
    additionalInfo1?: string | undefined;
    additionalInfo2?: string | undefined;
    additionalInfo3?: string | undefined;
}>;
export declare const DocumentsSchema: z.ZodObject<{
    citizenshipId: z.ZodOptional<z.ZodString>;
    companyRegistration: z.ZodOptional<z.ZodString>;
    panVatRegistration: z.ZodOptional<z.ZodString>;
    officePhoto: z.ZodOptional<z.ZodString>;
    areaMap: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    citizenshipId?: string | undefined;
    companyRegistration?: string | undefined;
    panVatRegistration?: string | undefined;
    officePhoto?: string | undefined;
    areaMap?: string | undefined;
}, {
    citizenshipId?: string | undefined;
    companyRegistration?: string | undefined;
    panVatRegistration?: string | undefined;
    officePhoto?: string | undefined;
    areaMap?: string | undefined;
}>;
export declare const DeclarationSchema: z.ZodObject<{
    declaration: z.ZodEffects<z.ZodBoolean, boolean, boolean>;
    signature: z.ZodString;
    date: z.ZodString;
}, "strip", z.ZodTypeAny, {
    declaration: boolean;
    signature: string;
    date: string;
}, {
    declaration: boolean;
    signature: string;
    date: string;
}>;
export declare const DistributorApplicationSchema: z.ZodObject<{
    personalDetails: z.ZodObject<{
        fullName: z.ZodString;
        age: z.ZodNumber;
        gender: z.ZodEnum<["पुरुष", "महिला", "अन्य"]>;
        citizenshipNumber: z.ZodString;
        issuedDistrict: z.ZodString;
        mobileNumber: z.ZodString;
        email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        permanentAddress: z.ZodString;
        temporaryAddress: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        fullName: string;
        age: number;
        gender: "पुरुष" | "महिला" | "अन्य";
        citizenshipNumber: string;
        issuedDistrict: string;
        mobileNumber: string;
        permanentAddress: string;
        email?: string | undefined;
        temporaryAddress?: string | undefined;
    }, {
        fullName: string;
        age: number;
        gender: "पुरुष" | "महिला" | "अन्य";
        citizenshipNumber: string;
        issuedDistrict: string;
        mobileNumber: string;
        permanentAddress: string;
        email?: string | undefined;
        temporaryAddress?: string | undefined;
    }>;
    businessDetails: z.ZodObject<{
        companyName: z.ZodString;
        registrationNumber: z.ZodString;
        panVatNumber: z.ZodString;
        officeAddress: z.ZodString;
        operatingArea: z.ZodString;
        desiredDistributorArea: z.ZodString;
        currentBusiness: z.ZodString;
        businessType: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        companyName: string;
        registrationNumber: string;
        panVatNumber: string;
        officeAddress: string;
        operatingArea: string;
        desiredDistributorArea: string;
        currentBusiness: string;
        businessType: string;
    }, {
        companyName: string;
        registrationNumber: string;
        panVatNumber: string;
        officeAddress: string;
        operatingArea: string;
        desiredDistributorArea: string;
        currentBusiness: string;
        businessType: string;
    }>;
    staffInfrastructure: z.ZodObject<{
        salesManCount: z.ZodNumber;
        salesManExperience: z.ZodOptional<z.ZodString>;
        deliveryStaffCount: z.ZodNumber;
        deliveryStaffExperience: z.ZodOptional<z.ZodString>;
        accountAssistantCount: z.ZodNumber;
        accountAssistantExperience: z.ZodOptional<z.ZodString>;
        otherStaffCount: z.ZodNumber;
        otherStaffExperience: z.ZodOptional<z.ZodString>;
        warehouseSpace: z.ZodNumber;
        warehouseExperience: z.ZodOptional<z.ZodString>;
        truckCount: z.ZodNumber;
        truckExperience: z.ZodOptional<z.ZodString>;
        fourWheelerCount: z.ZodNumber;
        fourWheelerExperience: z.ZodOptional<z.ZodString>;
        twoWheelerCount: z.ZodNumber;
        twoWheelerExperience: z.ZodOptional<z.ZodString>;
        cycleCount: z.ZodNumber;
        cycleExperience: z.ZodOptional<z.ZodString>;
        thelaCount: z.ZodNumber;
        thelaExperience: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        salesManCount: number;
        deliveryStaffCount: number;
        accountAssistantCount: number;
        otherStaffCount: number;
        warehouseSpace: number;
        truckCount: number;
        fourWheelerCount: number;
        twoWheelerCount: number;
        cycleCount: number;
        thelaCount: number;
        salesManExperience?: string | undefined;
        deliveryStaffExperience?: string | undefined;
        accountAssistantExperience?: string | undefined;
        otherStaffExperience?: string | undefined;
        warehouseExperience?: string | undefined;
        truckExperience?: string | undefined;
        fourWheelerExperience?: string | undefined;
        twoWheelerExperience?: string | undefined;
        cycleExperience?: string | undefined;
        thelaExperience?: string | undefined;
    }, {
        salesManCount: number;
        deliveryStaffCount: number;
        accountAssistantCount: number;
        otherStaffCount: number;
        warehouseSpace: number;
        truckCount: number;
        fourWheelerCount: number;
        twoWheelerCount: number;
        cycleCount: number;
        thelaCount: number;
        salesManExperience?: string | undefined;
        deliveryStaffExperience?: string | undefined;
        accountAssistantExperience?: string | undefined;
        otherStaffExperience?: string | undefined;
        warehouseExperience?: string | undefined;
        truckExperience?: string | undefined;
        fourWheelerExperience?: string | undefined;
        twoWheelerExperience?: string | undefined;
        cycleExperience?: string | undefined;
        thelaExperience?: string | undefined;
    }>;
    currentTransactions: z.ZodObject<{
        currentTransactions: z.ZodArray<z.ZodObject<{
            company: z.ZodOptional<z.ZodString>;
            products: z.ZodOptional<z.ZodString>;
            turnover: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            products?: string | undefined;
            company?: string | undefined;
            turnover?: string | undefined;
        }, {
            products?: string | undefined;
            company?: string | undefined;
            turnover?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        currentTransactions: {
            products?: string | undefined;
            company?: string | undefined;
            turnover?: string | undefined;
        }[];
    }, {
        currentTransactions: {
            products?: string | undefined;
            company?: string | undefined;
            turnover?: string | undefined;
        }[];
    }>;
    businessInformation: z.ZodObject<{
        productCategory: z.ZodString;
        yearsInBusiness: z.ZodNumber;
        monthlySales: z.ZodString;
        storageFacility: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        productCategory: string;
        yearsInBusiness: number;
        monthlySales: string;
        storageFacility: string;
    }, {
        productCategory: string;
        yearsInBusiness: number;
        monthlySales: string;
        storageFacility: string;
    }>;
    productsToDistribute: z.ZodObject<{
        productsToDistribute: z.ZodArray<z.ZodObject<{
            productName: z.ZodOptional<z.ZodString>;
            monthlySalesCapacity: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            productName?: string | undefined;
            monthlySalesCapacity?: string | undefined;
        }, {
            productName?: string | undefined;
            monthlySalesCapacity?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        productsToDistribute: {
            productName?: string | undefined;
            monthlySalesCapacity?: string | undefined;
        }[];
    }, {
        productsToDistribute: {
            productName?: string | undefined;
            monthlySalesCapacity?: string | undefined;
        }[];
    }>;
    partnershipDetails: z.ZodOptional<z.ZodObject<{
        partnerFullName: z.ZodOptional<z.ZodString>;
        partnerAge: z.ZodOptional<z.ZodNumber>;
        partnerGender: z.ZodOptional<z.ZodEnum<["पुरुष", "महिला", "अन्य"]>>;
        partnerCitizenshipNumber: z.ZodOptional<z.ZodString>;
        partnerIssuedDistrict: z.ZodOptional<z.ZodString>;
        partnerMobileNumber: z.ZodOptional<z.ZodString>;
        partnerEmail: z.ZodOptional<z.ZodString>;
        partnerPermanentAddress: z.ZodOptional<z.ZodString>;
        partnerTemporaryAddress: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        partnerFullName?: string | undefined;
        partnerAge?: number | undefined;
        partnerGender?: "पुरुष" | "महिला" | "अन्य" | undefined;
        partnerCitizenshipNumber?: string | undefined;
        partnerIssuedDistrict?: string | undefined;
        partnerMobileNumber?: string | undefined;
        partnerEmail?: string | undefined;
        partnerPermanentAddress?: string | undefined;
        partnerTemporaryAddress?: string | undefined;
    }, {
        partnerFullName?: string | undefined;
        partnerAge?: number | undefined;
        partnerGender?: "पुरुष" | "महिला" | "अन्य" | undefined;
        partnerCitizenshipNumber?: string | undefined;
        partnerIssuedDistrict?: string | undefined;
        partnerMobileNumber?: string | undefined;
        partnerEmail?: string | undefined;
        partnerPermanentAddress?: string | undefined;
        partnerTemporaryAddress?: string | undefined;
    }>>;
    retailerRequirements: z.ZodObject<{
        preferredProducts: z.ZodString;
        monthlyOrderQuantity: z.ZodString;
        paymentPreference: z.ZodString;
        creditDays: z.ZodOptional<z.ZodNumber>;
        deliveryPreference: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        preferredProducts: string;
        monthlyOrderQuantity: string;
        paymentPreference: string;
        deliveryPreference: string;
        creditDays?: number | undefined;
    }, {
        preferredProducts: string;
        monthlyOrderQuantity: string;
        paymentPreference: string;
        deliveryPreference: string;
        creditDays?: number | undefined;
    }>;
    areaCoverageDetails: z.ZodObject<{
        areaCoverage: z.ZodArray<z.ZodObject<{
            distributionArea: z.ZodOptional<z.ZodString>;
            populationEstimate: z.ZodOptional<z.ZodString>;
            competitorBrand: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            distributionArea?: string | undefined;
            populationEstimate?: string | undefined;
            competitorBrand?: string | undefined;
        }, {
            distributionArea?: string | undefined;
            populationEstimate?: string | undefined;
            competitorBrand?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        areaCoverage: {
            distributionArea?: string | undefined;
            populationEstimate?: string | undefined;
            competitorBrand?: string | undefined;
        }[];
    }, {
        areaCoverage: {
            distributionArea?: string | undefined;
            populationEstimate?: string | undefined;
            competitorBrand?: string | undefined;
        }[];
    }>;
    additionalInformation: z.ZodOptional<z.ZodObject<{
        additionalInfo1: z.ZodOptional<z.ZodString>;
        additionalInfo2: z.ZodOptional<z.ZodString>;
        additionalInfo3: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        additionalInfo1?: string | undefined;
        additionalInfo2?: string | undefined;
        additionalInfo3?: string | undefined;
    }, {
        additionalInfo1?: string | undefined;
        additionalInfo2?: string | undefined;
        additionalInfo3?: string | undefined;
    }>>;
    documents: z.ZodOptional<z.ZodObject<{
        citizenshipId: z.ZodOptional<z.ZodString>;
        companyRegistration: z.ZodOptional<z.ZodString>;
        panVatRegistration: z.ZodOptional<z.ZodString>;
        officePhoto: z.ZodOptional<z.ZodString>;
        areaMap: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        citizenshipId?: string | undefined;
        companyRegistration?: string | undefined;
        panVatRegistration?: string | undefined;
        officePhoto?: string | undefined;
        areaMap?: string | undefined;
    }, {
        citizenshipId?: string | undefined;
        companyRegistration?: string | undefined;
        panVatRegistration?: string | undefined;
        officePhoto?: string | undefined;
        areaMap?: string | undefined;
    }>>;
    declaration: z.ZodObject<{
        declaration: z.ZodEffects<z.ZodBoolean, boolean, boolean>;
        signature: z.ZodString;
        date: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        declaration: boolean;
        signature: string;
        date: string;
    }, {
        declaration: boolean;
        signature: string;
        date: string;
    }>;
}, "strip", z.ZodTypeAny, {
    declaration: {
        declaration: boolean;
        signature: string;
        date: string;
    };
    currentTransactions: {
        currentTransactions: {
            products?: string | undefined;
            company?: string | undefined;
            turnover?: string | undefined;
        }[];
    };
    productsToDistribute: {
        productsToDistribute: {
            productName?: string | undefined;
            monthlySalesCapacity?: string | undefined;
        }[];
    };
    areaCoverageDetails: {
        areaCoverage: {
            distributionArea?: string | undefined;
            populationEstimate?: string | undefined;
            competitorBrand?: string | undefined;
        }[];
    };
    personalDetails: {
        fullName: string;
        age: number;
        gender: "पुरुष" | "महिला" | "अन्य";
        citizenshipNumber: string;
        issuedDistrict: string;
        mobileNumber: string;
        permanentAddress: string;
        email?: string | undefined;
        temporaryAddress?: string | undefined;
    };
    businessDetails: {
        companyName: string;
        registrationNumber: string;
        panVatNumber: string;
        officeAddress: string;
        operatingArea: string;
        desiredDistributorArea: string;
        currentBusiness: string;
        businessType: string;
    };
    staffInfrastructure: {
        salesManCount: number;
        deliveryStaffCount: number;
        accountAssistantCount: number;
        otherStaffCount: number;
        warehouseSpace: number;
        truckCount: number;
        fourWheelerCount: number;
        twoWheelerCount: number;
        cycleCount: number;
        thelaCount: number;
        salesManExperience?: string | undefined;
        deliveryStaffExperience?: string | undefined;
        accountAssistantExperience?: string | undefined;
        otherStaffExperience?: string | undefined;
        warehouseExperience?: string | undefined;
        truckExperience?: string | undefined;
        fourWheelerExperience?: string | undefined;
        twoWheelerExperience?: string | undefined;
        cycleExperience?: string | undefined;
        thelaExperience?: string | undefined;
    };
    businessInformation: {
        productCategory: string;
        yearsInBusiness: number;
        monthlySales: string;
        storageFacility: string;
    };
    retailerRequirements: {
        preferredProducts: string;
        monthlyOrderQuantity: string;
        paymentPreference: string;
        deliveryPreference: string;
        creditDays?: number | undefined;
    };
    documents?: {
        citizenshipId?: string | undefined;
        companyRegistration?: string | undefined;
        panVatRegistration?: string | undefined;
        officePhoto?: string | undefined;
        areaMap?: string | undefined;
    } | undefined;
    partnershipDetails?: {
        partnerFullName?: string | undefined;
        partnerAge?: number | undefined;
        partnerGender?: "पुरुष" | "महिला" | "अन्य" | undefined;
        partnerCitizenshipNumber?: string | undefined;
        partnerIssuedDistrict?: string | undefined;
        partnerMobileNumber?: string | undefined;
        partnerEmail?: string | undefined;
        partnerPermanentAddress?: string | undefined;
        partnerTemporaryAddress?: string | undefined;
    } | undefined;
    additionalInformation?: {
        additionalInfo1?: string | undefined;
        additionalInfo2?: string | undefined;
        additionalInfo3?: string | undefined;
    } | undefined;
}, {
    declaration: {
        declaration: boolean;
        signature: string;
        date: string;
    };
    currentTransactions: {
        currentTransactions: {
            products?: string | undefined;
            company?: string | undefined;
            turnover?: string | undefined;
        }[];
    };
    productsToDistribute: {
        productsToDistribute: {
            productName?: string | undefined;
            monthlySalesCapacity?: string | undefined;
        }[];
    };
    areaCoverageDetails: {
        areaCoverage: {
            distributionArea?: string | undefined;
            populationEstimate?: string | undefined;
            competitorBrand?: string | undefined;
        }[];
    };
    personalDetails: {
        fullName: string;
        age: number;
        gender: "पुरुष" | "महिला" | "अन्य";
        citizenshipNumber: string;
        issuedDistrict: string;
        mobileNumber: string;
        permanentAddress: string;
        email?: string | undefined;
        temporaryAddress?: string | undefined;
    };
    businessDetails: {
        companyName: string;
        registrationNumber: string;
        panVatNumber: string;
        officeAddress: string;
        operatingArea: string;
        desiredDistributorArea: string;
        currentBusiness: string;
        businessType: string;
    };
    staffInfrastructure: {
        salesManCount: number;
        deliveryStaffCount: number;
        accountAssistantCount: number;
        otherStaffCount: number;
        warehouseSpace: number;
        truckCount: number;
        fourWheelerCount: number;
        twoWheelerCount: number;
        cycleCount: number;
        thelaCount: number;
        salesManExperience?: string | undefined;
        deliveryStaffExperience?: string | undefined;
        accountAssistantExperience?: string | undefined;
        otherStaffExperience?: string | undefined;
        warehouseExperience?: string | undefined;
        truckExperience?: string | undefined;
        fourWheelerExperience?: string | undefined;
        twoWheelerExperience?: string | undefined;
        cycleExperience?: string | undefined;
        thelaExperience?: string | undefined;
    };
    businessInformation: {
        productCategory: string;
        yearsInBusiness: number;
        monthlySales: string;
        storageFacility: string;
    };
    retailerRequirements: {
        preferredProducts: string;
        monthlyOrderQuantity: string;
        paymentPreference: string;
        deliveryPreference: string;
        creditDays?: number | undefined;
    };
    documents?: {
        citizenshipId?: string | undefined;
        companyRegistration?: string | undefined;
        panVatRegistration?: string | undefined;
        officePhoto?: string | undefined;
        areaMap?: string | undefined;
    } | undefined;
    partnershipDetails?: {
        partnerFullName?: string | undefined;
        partnerAge?: number | undefined;
        partnerGender?: "पुरुष" | "महिला" | "अन्य" | undefined;
        partnerCitizenshipNumber?: string | undefined;
        partnerIssuedDistrict?: string | undefined;
        partnerMobileNumber?: string | undefined;
        partnerEmail?: string | undefined;
        partnerPermanentAddress?: string | undefined;
        partnerTemporaryAddress?: string | undefined;
    } | undefined;
    additionalInformation?: {
        additionalInfo1?: string | undefined;
        additionalInfo2?: string | undefined;
        additionalInfo3?: string | undefined;
    } | undefined;
}>;
export declare const ApplicationStatusSchema: z.ZodEnum<["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "REQUIRES_CHANGES"]>;
export declare const ApplicationUpdateSchema: z.ZodObject<{
    status: z.ZodEnum<["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "REQUIRES_CHANGES"]>;
    reviewNotes: z.ZodOptional<z.ZodString>;
    reviewedBy: z.ZodString;
    reviewedAt: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "REQUIRES_CHANGES";
    reviewedAt: Date;
    reviewedBy: string;
    reviewNotes?: string | undefined;
}, {
    status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "REQUIRES_CHANGES";
    reviewedBy: string;
    reviewNotes?: string | undefined;
    reviewedAt?: Date | undefined;
}>;
export declare const ApplicationUpdateDevSchema: z.ZodObject<{
    status: z.ZodEnum<["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "REQUIRES_CHANGES"]>;
    reviewNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "REQUIRES_CHANGES";
    reviewNotes?: string | undefined;
}, {
    status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "REQUIRES_CHANGES";
    reviewNotes?: string | undefined;
}>;
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
//# sourceMappingURL=distributor.schema.d.ts.map