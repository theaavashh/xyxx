-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGERIAL', 'SALES_MANAGER', 'SALES_REPRESENTATIVE', 'DISTRIBUTOR');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'REQUIRES_CHANGES');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'SALES_REPRESENTATIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distributor_applications" (
    "id" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fullName" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "citizenshipNumber" TEXT NOT NULL,
    "issuedDistrict" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "email" TEXT,
    "permanentAddress" TEXT NOT NULL,
    "temporaryAddress" TEXT,
    "companyName" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "panVatNumber" TEXT NOT NULL,
    "officeAddress" TEXT NOT NULL,
    "operatingArea" TEXT NOT NULL,
    "desiredDistributorArea" TEXT NOT NULL,
    "currentBusiness" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "salesManCount" INTEGER NOT NULL DEFAULT 0,
    "salesManExperience" TEXT,
    "deliveryStaffCount" INTEGER NOT NULL DEFAULT 0,
    "deliveryStaffExperience" TEXT,
    "accountAssistantCount" INTEGER NOT NULL DEFAULT 0,
    "accountAssistantExperience" TEXT,
    "otherStaffCount" INTEGER NOT NULL DEFAULT 0,
    "otherStaffExperience" TEXT,
    "warehouseSpace" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "warehouseExperience" TEXT,
    "truckCount" INTEGER NOT NULL DEFAULT 0,
    "truckExperience" TEXT,
    "fourWheelerCount" INTEGER NOT NULL DEFAULT 0,
    "fourWheelerExperience" TEXT,
    "twoWheelerCount" INTEGER NOT NULL DEFAULT 0,
    "twoWheelerExperience" TEXT,
    "cycleCount" INTEGER NOT NULL DEFAULT 0,
    "cycleExperience" TEXT,
    "thelaCount" INTEGER NOT NULL DEFAULT 0,
    "thelaExperience" TEXT,
    "productCategory" TEXT NOT NULL,
    "yearsInBusiness" INTEGER NOT NULL,
    "monthlySales" TEXT NOT NULL,
    "storageFacility" TEXT NOT NULL,
    "preferredProducts" TEXT NOT NULL,
    "monthlyOrderQuantity" TEXT NOT NULL,
    "paymentPreference" TEXT NOT NULL,
    "creditDays" INTEGER,
    "deliveryPreference" TEXT NOT NULL,
    "partnerFullName" TEXT,
    "partnerAge" INTEGER,
    "partnerGender" TEXT,
    "partnerCitizenshipNumber" TEXT,
    "partnerIssuedDistrict" TEXT,
    "partnerMobileNumber" TEXT,
    "partnerEmail" TEXT,
    "partnerPermanentAddress" TEXT,
    "partnerTemporaryAddress" TEXT,
    "additionalInfo1" TEXT,
    "additionalInfo2" TEXT,
    "additionalInfo3" TEXT,
    "citizenshipId" TEXT,
    "companyRegistration" TEXT,
    "panVatRegistration" TEXT,
    "officePhoto" TEXT,
    "areaMap" TEXT,
    "declaration" BOOLEAN NOT NULL,
    "signature" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "reviewNotes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "createdById" TEXT,

    CONSTRAINT "distributor_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "current_transactions" (
    "id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "products" TEXT NOT NULL,
    "turnover" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,

    CONSTRAINT "current_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products_to_distribute" (
    "id" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "monthlySalesCapacity" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,

    CONSTRAINT "products_to_distribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area_coverage_details" (
    "id" TEXT NOT NULL,
    "distributionArea" TEXT NOT NULL,
    "populationEstimate" TEXT NOT NULL,
    "competitorBrand" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,

    CONSTRAINT "area_coverage_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_status_history" (
    "id" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL,
    "notes" TEXT,
    "changedBy" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applicationId" TEXT NOT NULL,

    CONSTRAINT "application_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "distributor_applications" ADD CONSTRAINT "distributor_applications_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributor_applications" ADD CONSTRAINT "distributor_applications_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "current_transactions" ADD CONSTRAINT "current_transactions_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "distributor_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products_to_distribute" ADD CONSTRAINT "products_to_distribute_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "distributor_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area_coverage_details" ADD CONSTRAINT "area_coverage_details_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "distributor_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_status_history" ADD CONSTRAINT "application_status_history_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "distributor_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
