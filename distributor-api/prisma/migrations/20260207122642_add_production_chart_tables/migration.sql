-- CreateTable
CREATE TABLE "production_charts" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "dayOfWeek" TEXT NOT NULL,
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_charts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_chart_ingredients" (
    "id" TEXT NOT NULL,
    "productionChartId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "category" TEXT,

    CONSTRAINT "production_chart_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_chart_outputs" (
    "id" TEXT NOT NULL,
    "productionChartId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "batchNumber" TEXT,

    CONSTRAINT "production_chart_outputs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_sub_charts" (
    "id" TEXT NOT NULL,
    "productionChartId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "ingredientName" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "production_sub_charts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_sub_chart_outputs" (
    "id" TEXT NOT NULL,
    "subChartId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "batchNumber" TEXT,

    CONSTRAINT "production_sub_chart_outputs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "production_chart_ingredients" ADD CONSTRAINT "production_chart_ingredients_productionChartId_fkey" FOREIGN KEY ("productionChartId") REFERENCES "production_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_chart_outputs" ADD CONSTRAINT "production_chart_outputs_productionChartId_fkey" FOREIGN KEY ("productionChartId") REFERENCES "production_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_sub_charts" ADD CONSTRAINT "production_sub_charts_productionChartId_fkey" FOREIGN KEY ("productionChartId") REFERENCES "production_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_sub_charts" ADD CONSTRAINT "production_sub_charts_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "production_chart_ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_sub_chart_outputs" ADD CONSTRAINT "production_sub_chart_outputs_subChartId_fkey" FOREIGN KEY ("subChartId") REFERENCES "production_sub_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
