-- CreateEnum
CREATE TYPE "public"."AnticipationStatus" AS ENUM ('PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED', 'CANCELED');

-- CreateTable
CREATE TABLE "public"."AccountBalance" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "userId" TEXT NOT NULL,
    "current" DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    "pending" DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    "blocked" DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    "lastTransactionAt" TIMESTAMP(3),
    "currency" "public"."Currency" NOT NULL DEFAULT 'BRL',

    CONSTRAINT "AccountBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BalanceHistory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "balanceId" TEXT NOT NULL,
    "currentBefore" DECIMAL(18,2) NOT NULL,
    "pendingBefore" DECIMAL(18,2) NOT NULL,
    "blockedBefore" DECIMAL(18,2) NOT NULL,
    "currentAfter" DECIMAL(18,2) NOT NULL,
    "pendingAfter" DECIMAL(18,2) NOT NULL,
    "blockedAfter" DECIMAL(18,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "referenceId" TEXT,
    "description" TEXT,

    CONSTRAINT "BalanceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Anticipation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "balanceId" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "netAmount" DECIMAL(18,2) NOT NULL,
    "interestRate" DECIMAL(5,4) NOT NULL,
    "interestAmount" DECIMAL(18,2) NOT NULL,
    "feeAmount" DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "public"."AnticipationStatus" NOT NULL DEFAULT 'PENDING',
    "currency" "public"."Currency" NOT NULL DEFAULT 'BRL',
    "configId" TEXT NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "metadata" JSONB,
    "approvedBy" TEXT,
    "rejectionReason" TEXT,

    CONSTRAINT "Anticipation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AnticipationConfig" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dailyRate" DECIMAL(5,4) NOT NULL,
    "minDays" INTEGER NOT NULL DEFAULT 1,
    "maxDays" INTEGER NOT NULL DEFAULT 30,
    "minAmount" DECIMAL(18,2) NOT NULL,
    "maxAmount" DECIMAL(18,2) NOT NULL,
    "fixedFee" DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    "percentageFee" DECIMAL(5,4) NOT NULL DEFAULT 0.00,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AnticipationConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountBalance_userId_key" ON "public"."AccountBalance"("userId");

-- CreateIndex
CREATE INDEX "AccountBalance_userId_idx" ON "public"."AccountBalance"("userId");

-- CreateIndex
CREATE INDEX "AccountBalance_current_idx" ON "public"."AccountBalance"("current");

-- CreateIndex
CREATE INDEX "BalanceHistory_balanceId_createdAt_idx" ON "public"."BalanceHistory"("balanceId", "createdAt");

-- CreateIndex
CREATE INDEX "BalanceHistory_referenceId_idx" ON "public"."BalanceHistory"("referenceId");

-- CreateIndex
CREATE INDEX "Anticipation_balanceId_status_idx" ON "public"."Anticipation"("balanceId", "status");

-- CreateIndex
CREATE INDEX "Anticipation_status_dueDate_idx" ON "public"."Anticipation"("status", "dueDate");

-- CreateIndex
CREATE INDEX "Anticipation_createdAt_idx" ON "public"."Anticipation"("createdAt");

-- CreateIndex
CREATE INDEX "AnticipationConfig_active_idx" ON "public"."AnticipationConfig"("active");

-- AddForeignKey
ALTER TABLE "public"."AccountBalance" ADD CONSTRAINT "AccountBalance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BalanceHistory" ADD CONSTRAINT "BalanceHistory_balanceId_fkey" FOREIGN KEY ("balanceId") REFERENCES "public"."AccountBalance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Anticipation" ADD CONSTRAINT "Anticipation_balanceId_fkey" FOREIGN KEY ("balanceId") REFERENCES "public"."AccountBalance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Anticipation" ADD CONSTRAINT "Anticipation_configId_fkey" FOREIGN KEY ("configId") REFERENCES "public"."AnticipationConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
