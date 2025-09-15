/*
  Warnings:

  - A unique constraint covering the columns `[applicationId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "applicationId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_applicationId_key" ON "users"("applicationId");
