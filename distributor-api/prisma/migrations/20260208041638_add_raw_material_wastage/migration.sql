-- CreateTable
CREATE TABLE "raw_material_wastage" (
    "id" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "unitCost" DECIMAL(10,2) NOT NULL,
    "totalCost" DECIMAL(10,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "batchNumber" TEXT,
    "location" TEXT,
    "wastageDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "raw_material_wastage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "raw_material_wastage" ADD CONSTRAINT "raw_material_wastage_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "raw_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;
