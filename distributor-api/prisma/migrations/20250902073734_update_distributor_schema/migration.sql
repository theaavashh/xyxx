/*
  Warnings:

  - You are about to drop the column `cycleExperience` on the `distributor_applications` table. All the data in the column will be lost.
  - You are about to drop the column `fourWheelerExperience` on the `distributor_applications` table. All the data in the column will be lost.
  - You are about to drop the column `thelaExperience` on the `distributor_applications` table. All the data in the column will be lost.
  - You are about to drop the column `truckExperience` on the `distributor_applications` table. All the data in the column will be lost.
  - You are about to drop the column `twoWheelerExperience` on the `distributor_applications` table. All the data in the column will be lost.
  - You are about to drop the column `warehouseExperience` on the `distributor_applications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "distributor_applications" DROP COLUMN "cycleExperience",
DROP COLUMN "fourWheelerExperience",
DROP COLUMN "thelaExperience",
DROP COLUMN "truckExperience",
DROP COLUMN "twoWheelerExperience",
DROP COLUMN "warehouseExperience",
ADD COLUMN     "agreementAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cycleDetails" TEXT,
ADD COLUMN     "distributorSignatureDate" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "distributorSignatureName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "fourWheelerDetails" TEXT,
ADD COLUMN     "thelaDetails" TEXT,
ADD COLUMN     "truckDetails" TEXT,
ADD COLUMN     "twoWheelerDetails" TEXT,
ADD COLUMN     "warehouseDetails" TEXT;
