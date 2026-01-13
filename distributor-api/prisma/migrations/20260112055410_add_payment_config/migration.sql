-- CreateTable
CREATE TABLE "payment_configs" (
    "id" TEXT NOT NULL,
    "qrCodeUrl" TEXT,
    "bankAccountNumber" TEXT,
    "bankAccountName" TEXT,
    "bankName" TEXT,
    "branchName" TEXT,
    "paymentGateway" TEXT,
    "paymentGatewayApiKey" TEXT,
    "paymentGatewaySecret" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_configs_pkey" PRIMARY KEY ("id")
);
