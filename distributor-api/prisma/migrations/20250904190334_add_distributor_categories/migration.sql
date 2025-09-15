-- CreateTable
CREATE TABLE "distributor_categories" (
    "id" TEXT NOT NULL,
    "distributorId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT NOT NULL,

    CONSTRAINT "distributor_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "distributor_categories_distributorId_categoryId_key" ON "distributor_categories"("distributorId", "categoryId");

-- AddForeignKey
ALTER TABLE "distributor_categories" ADD CONSTRAINT "distributor_categories_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributor_categories" ADD CONSTRAINT "distributor_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
