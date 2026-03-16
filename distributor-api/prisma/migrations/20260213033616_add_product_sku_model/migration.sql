-- CreateTable
CREATE TABLE "product_skus" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantName" TEXT NOT NULL,
    "attributes" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "costPrice" DECIMAL(10,2) NOT NULL,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "minStockLevel" INTEGER NOT NULL DEFAULT 0,
    "maxStockLevel" INTEGER NOT NULL DEFAULT 0,
    "barcode" TEXT,
    "weight" DOUBLE PRECISION,
    "dimensions" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "images" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_skus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_targets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "units" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "product_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distributor_targets" (
    "id" TEXT NOT NULL,
    "distributorId" TEXT NOT NULL,
    "distributorName" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "totalTarget" INTEGER NOT NULL DEFAULT 0,
    "totalAchieved" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "distributor_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distributor_target_items" (
    "id" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "targetValue" INTEGER NOT NULL DEFAULT 0,
    "achievedValue" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "distributor_target_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_skus_sku_key" ON "product_skus"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_name_key" ON "product_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "product_targets_categoryId_name_key" ON "product_targets"("categoryId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "distributor_targets_distributorId_categoryId_month_year_key" ON "distributor_targets"("distributorId", "categoryId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "distributor_target_items_targetId_productId_key" ON "distributor_target_items"("targetId", "productId");

-- AddForeignKey
ALTER TABLE "product_skus" ADD CONSTRAINT "product_skus_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_targets" ADD CONSTRAINT "product_targets_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "product_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributor_targets" ADD CONSTRAINT "distributor_targets_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributor_targets" ADD CONSTRAINT "distributor_targets_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "product_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributor_target_items" ADD CONSTRAINT "distributor_target_items_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "distributor_targets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributor_target_items" ADD CONSTRAINT "distributor_target_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product_targets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
