-- CreateEnum
CREATE TYPE "public"."UserType" AS ENUM ('INDIVIDUAL', 'COMPANY');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('PIX', 'CREDIT_CARD', 'CRYPTO', 'BOLETO', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."TransactionType" AS ENUM ('INCOMING', 'OUTGOING');

-- CreateEnum
CREATE TYPE "public"."TransactionStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELED', 'CHARGEBACK');

-- CreateEnum
CREATE TYPE "public"."Currency" AS ENUM ('BRL', 'USD', 'EUR');

-- CreateEnum
CREATE TYPE "public"."TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "public"."AutomationStatus" AS ENUM ('ENABLED', 'DISABLED');

-- CreateEnum
CREATE TYPE "public"."AutomationEvent" AS ENUM ('PIX_CREATED', 'PIX_PAID', 'BALANCE_CHANGED', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."DeliveryStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'RETRYING', 'DEAD_LETTER');

-- CreateEnum
CREATE TYPE "public"."AdminRole" AS ENUM ('SUPERADMIN', 'SUPPORT', 'FINANCE', 'ANALYTICS');

-- CreateEnum
CREATE TYPE "public"."KycType" AS ENUM ('PASSPORT', 'NATIONAL_ID', 'DRIVER_LICENSE', 'COMPANY_REGISTRATION', 'TAX_CARD', 'PARTNER_DOCUMENT');

-- CreateEnum
CREATE TYPE "public"."SplitStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'SETTLED', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "public"."DomainEventStatus" AS ENUM ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."UserRewardStatus" AS ENUM ('CLAIMABLE', 'CLAIMED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "public"."LogLevel" AS ENUM ('TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "type" "public"."UserType" NOT NULL,
    "taxId" TEXT,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "canGeneratePix" BOOLEAN NOT NULL DEFAULT false,
    "canWithdraw" BOOLEAN NOT NULL DEFAULT false,
    "kycApproved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Credential" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "secretKey" TEXT NOT NULL,
    "rotatedAt" TIMESTAMP(3),
    "rotationBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AllowedIp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cidr" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AllowedIp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ApiKey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "scopes" TEXT[],
    "allowedIps" TEXT[],
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Kyc" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."KycType" NOT NULL,
    "fileFront" TEXT,
    "fileBack" TEXT,
    "selfieUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "notes" TEXT,

    CONSTRAINT "Kyc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Transaction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" "public"."Currency" NOT NULL DEFAULT 'BRL',
    "type" "public"."TransactionType" NOT NULL,
    "method" "public"."PaymentMethod" NOT NULL,
    "status" "public"."TransactionStatus" NOT NULL,
    "feeAmount" DECIMAL(18,2),
    "description" TEXT,
    "externalRef" TEXT,
    "payload" JSONB NOT NULL,
    "metadata" JSONB,
    "customerId" TEXT,
    "acquirerId" TEXT,
    "checkoutId" TEXT,
    "checkoutVariantId" TEXT,
    "funnelStage" TEXT,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TransactionSplit" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "transactionId" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "status" "public"."SplitStatus" NOT NULL DEFAULT 'PENDING',
    "externalRef" TEXT,
    "metadata" JSONB,

    CONSTRAINT "TransactionSplit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Statement" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "currentBalance" DECIMAL(18,2) NOT NULL,
    "pendingBalance" DECIMAL(18,2) NOT NULL,
    "blockedBalance" DECIMAL(18,2) NOT NULL,
    "reserveBalance" DECIMAL(18,2) NOT NULL,
    "initialBalance" DECIMAL(18,2) NOT NULL,
    "variation" DECIMAL(18,2) NOT NULL,
    "finalBalance" DECIMAL(18,2) NOT NULL,
    "asOf" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT,

    CONSTRAINT "Statement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Med" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "amount" DECIMAL(18,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "response" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "customerId" TEXT NOT NULL,

    CONSTRAINT "Med_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Customer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "taxId" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "product" TEXT,
    "amount" DECIMAL(18,2) NOT NULL,
    "payment" "public"."PaymentMethod" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "address" JSONB,
    "metadata" JSONB,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Analytic" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessions" INTEGER NOT NULL,
    "users" INTEGER NOT NULL,
    "pixGenerated" INTEGER NOT NULL,
    "pixPaid" INTEGER NOT NULL,
    "creditPaid" INTEGER NOT NULL,
    "creditError" INTEGER NOT NULL,
    "rejections" INTEGER NOT NULL,
    "avgPixTimeSec" INTEGER,
    "trafficSources" TEXT,
    "technology" TEXT,

    CONSTRAINT "Analytic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Withdrawal" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "method" "public"."PaymentMethod" NOT NULL,
    "pixKeyType" TEXT,
    "pixKey" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "dailyLimit" DECIMAL(18,2),
    "externalRef" TEXT,
    "payload" JSONB,
    "metadata" JSONB,

    CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AutomationRule" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "public"."AutomationStatus" NOT NULL DEFAULT 'ENABLED',
    "url" TEXT NOT NULL,
    "events" "public"."AutomationEvent"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "headers" JSONB,
    "transform" JSONB,

    CONSTRAINT "AutomationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WebhookSecret" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "secretHash" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookSecret_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AutomationDelivery" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "event" "public"."AutomationEvent" NOT NULL,
    "payload" JSONB NOT NULL,
    "attempt" INTEGER NOT NULL DEFAULT 1,
    "status" "public"."DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "responseCode" INTEGER,
    "responseBody" TEXT,
    "error" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextAttemptAt" TIMESTAMP(3),
    "lockedAt" TIMESTAMP(3),
    "lockOwner" TEXT,
    "correlationId" TEXT,
    "idempotencyKey" TEXT,
    "metadata" JSONB,

    CONSTRAINT "AutomationDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SupportTicket" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "public"."TicketStatus" NOT NULL DEFAULT 'OPEN',
    "reply" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 3,
    "tags" TEXT[],

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GlobalConfig" (
    "id" TEXT NOT NULL,
    "minPixWithdrawal" DECIMAL(18,2) NOT NULL,
    "minCryptoWithdrawal" DECIMAL(18,2) NOT NULL,
    "pixFeePercent" DECIMAL(5,2) NOT NULL,
    "pixFeeFixed" DECIMAL(18,2) NOT NULL,
    "creditFeePercent" DECIMAL(5,2) NOT NULL,
    "creditFeeFixed" DECIMAL(18,2) NOT NULL,
    "reservePercent" DECIMAL(5,2) NOT NULL,
    "reserveFixed" DECIMAL(18,2) NOT NULL,
    "siteName" TEXT NOT NULL,
    "siteUrl" TEXT NOT NULL,
    "pixAcquirerId" TEXT,
    "creditAcquirerId" TEXT,
    "cryptoAcquirerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "flags" JSONB,

    CONSTRAINT "GlobalConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "minPixWithdrawal" DECIMAL(18,2),
    "minCryptoWithdrawal" DECIMAL(18,2),
    "dailyWithdrawalLimit" DECIMAL(18,2),
    "pixAcquirerId" TEXT,
    "creditAcquirerId" TEXT,
    "cryptoAcquirerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "flags" JSONB,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Acquirer" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "publicToken" TEXT NOT NULL,
    "privateToken" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "timeoutMs" INTEGER,
    "retryPolicy" JSONB,

    CONSTRAINT "Acquirer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserAcquirerConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "acquirerId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "routingRules" JSONB,

    CONSTRAINT "UserAcquirerConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LevelDefinition" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "threshold" INTEGER NOT NULL,
    "iconUrl" TEXT,
    "color" TEXT,
    "rules" JSONB,

    CONSTRAINT "LevelDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RewardDefinition" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "data" JSONB,
    "expiresAfterDays" INTEGER,
    "unlockRules" JSONB,

    CONSTRAINT "RewardDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AchievementDefinition" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "iconUrl" TEXT,
    "color" TEXT,
    "criteria" JSONB NOT NULL,
    "rewardRefId" TEXT,

    CONSTRAINT "AchievementDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LevelProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentLevelId" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "LevelProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserReward" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "status" "public"."UserRewardStatus" NOT NULL DEFAULT 'CLAIMABLE',
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "correlationId" TEXT,
    "idempotencyKey" TEXT,

    CONSTRAINT "UserReward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Ranking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "achievements" TEXT[],
    "rewards" TEXT[],
    "challenges" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ranking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditEntry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorUserId" TEXT,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "reason" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "correlationId" TEXT,
    "idempotencyKey" TEXT,
    "userScopeId" TEXT,
    "metadata" JSONB,

    CONSTRAINT "AuditEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DomainEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "status" "public"."DomainEventStatus" NOT NULL DEFAULT 'PENDING',
    "eventName" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "actorUserId" TEXT,
    "correlationId" TEXT,
    "idempotencyKey" TEXT,

    CONSTRAINT "DomainEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SystemLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" "public"."LogLevel" NOT NULL,
    "service" TEXT,
    "category" TEXT,
    "message" TEXT NOT NULL,
    "context" JSONB,
    "stack" TEXT,
    "actorUserId" TEXT,
    "correlationId" TEXT,
    "requestId" TEXT,
    "traceId" TEXT,

    CONSTRAINT "SystemLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sku" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "basePrice" DECIMAL(18,2),
    "currency" "public"."Currency" NOT NULL DEFAULT 'BRL',
    "images" TEXT[],
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Checkout" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "accentColor" TEXT,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "headline" TEXT,
    "subheadline" TEXT,
    "guaranteeBadge" TEXT,
    "testimonials" JSONB,
    "faq" JSONB,
    "timerEnabled" BOOLEAN NOT NULL DEFAULT false,
    "timerType" TEXT,
    "timerEndsAt" TIMESTAMP(3),
    "timerDurationSec" INTEGER,
    "layout" JSONB,
    "fields" JSONB,
    "seo" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB,

    CONSTRAINT "Checkout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CheckoutVariant" (
    "id" TEXT NOT NULL,
    "checkoutId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "trafficShare" INTEGER NOT NULL DEFAULT 50,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "price" DECIMAL(18,2),
    "currency" "public"."Currency",
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "bannerUrl" TEXT,
    "headline" TEXT,
    "subheadline" TEXT,
    "layout" JSONB,
    "fields" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB,
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CheckoutVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CheckoutOrderBump" (
    "id" TEXT NOT NULL,
    "checkoutId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(18,2) NOT NULL,
    "currency" "public"."Currency" NOT NULL DEFAULT 'BRL',
    "productRefId" TEXT,
    "iconUrl" TEXT,
    "highlightColor" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB,
    "position" INTEGER NOT NULL DEFAULT 1,
    "acceptanceRate" DECIMAL(5,2),

    CONSTRAINT "CheckoutOrderBump_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CheckoutUpsell" (
    "id" TEXT NOT NULL,
    "checkoutId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(18,2) NOT NULL,
    "currency" "public"."Currency" NOT NULL DEFAULT 'BRL',
    "productRefId" TEXT,
    "mediaUrl" TEXT,
    "headline" TEXT,
    "ctaText" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB,
    "position" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "CheckoutUpsell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CheckoutDownsell" (
    "id" TEXT NOT NULL,
    "checkoutId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(18,2) NOT NULL,
    "currency" "public"."Currency" NOT NULL DEFAULT 'BRL',
    "productRefId" TEXT,
    "mediaUrl" TEXT,
    "headline" TEXT,
    "ctaText" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB,
    "position" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "CheckoutDownsell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_LevelDefaultRewards" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LevelDefaultRewards_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_taxId_key" ON "public"."User"("taxId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_taxId_idx" ON "public"."User"("taxId");

-- CreateIndex
CREATE UNIQUE INDEX "Credential_userId_key" ON "public"."Credential"("userId");

-- CreateIndex
CREATE INDEX "AllowedIp_userId_idx" ON "public"."AllowedIp"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AllowedIp_userId_cidr_key" ON "public"."AllowedIp"("userId", "cidr");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "public"."ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "ApiKey_userId_idx" ON "public"."ApiKey"("userId");

-- CreateIndex
CREATE INDEX "Kyc_userId_idx" ON "public"."Kyc"("userId");

-- CreateIndex
CREATE INDEX "Transaction_userId_createdAt_idx" ON "public"."Transaction"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Transaction_acquirerId_idx" ON "public"."Transaction"("acquirerId");

-- CreateIndex
CREATE INDEX "Transaction_externalRef_idx" ON "public"."Transaction"("externalRef");

-- CreateIndex
CREATE INDEX "Transaction_checkoutId_idx" ON "public"."Transaction"("checkoutId");

-- CreateIndex
CREATE INDEX "Transaction_checkoutVariantId_idx" ON "public"."Transaction"("checkoutVariantId");

-- CreateIndex
CREATE INDEX "TransactionSplit_transactionId_idx" ON "public"."TransactionSplit"("transactionId");

-- CreateIndex
CREATE INDEX "TransactionSplit_recipientEmail_idx" ON "public"."TransactionSplit"("recipientEmail");

-- CreateIndex
CREATE INDEX "Statement_userId_createdAt_idx" ON "public"."Statement"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Statement_userId_asOf_idx" ON "public"."Statement"("userId", "asOf");

-- CreateIndex
CREATE INDEX "Customer_userId_email_idx" ON "public"."Customer"("userId", "email");

-- CreateIndex
CREATE INDEX "Customer_userId_taxId_idx" ON "public"."Customer"("userId", "taxId");

-- CreateIndex
CREATE INDEX "Withdrawal_userId_createdAt_idx" ON "public"."Withdrawal"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Withdrawal_externalRef_idx" ON "public"."Withdrawal"("externalRef");

-- CreateIndex
CREATE INDEX "WebhookSecret_ruleId_validFrom_idx" ON "public"."WebhookSecret"("ruleId", "validFrom");

-- CreateIndex
CREATE INDEX "AutomationDelivery_ruleId_createdAt_idx" ON "public"."AutomationDelivery"("ruleId", "createdAt");

-- CreateIndex
CREATE INDEX "AutomationDelivery_userId_idx" ON "public"."AutomationDelivery"("userId");

-- CreateIndex
CREATE INDEX "AutomationDelivery_idempotencyKey_idx" ON "public"."AutomationDelivery"("idempotencyKey");

-- CreateIndex
CREATE INDEX "AutomationDelivery_correlationId_idx" ON "public"."AutomationDelivery"("correlationId");

-- CreateIndex
CREATE INDEX "SupportTicket_userId_createdAt_idx" ON "public"."SupportTicket"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "public"."UserSettings"("userId");

-- CreateIndex
CREATE INDEX "Acquirer_active_idx" ON "public"."Acquirer"("active");

-- CreateIndex
CREATE UNIQUE INDEX "Acquirer_name_role_key" ON "public"."Acquirer"("name", "role");

-- CreateIndex
CREATE INDEX "UserAcquirerConfig_userId_priority_idx" ON "public"."UserAcquirerConfig"("userId", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "UserAcquirerConfig_userId_acquirerId_key" ON "public"."UserAcquirerConfig"("userId", "acquirerId");

-- CreateIndex
CREATE UNIQUE INDEX "LevelDefinition_code_key" ON "public"."LevelDefinition"("code");

-- CreateIndex
CREATE UNIQUE INDEX "LevelDefinition_order_key" ON "public"."LevelDefinition"("order");

-- CreateIndex
CREATE UNIQUE INDEX "RewardDefinition_code_key" ON "public"."RewardDefinition"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AchievementDefinition_code_key" ON "public"."AchievementDefinition"("code");

-- CreateIndex
CREATE UNIQUE INDEX "LevelProgress_userId_key" ON "public"."LevelProgress"("userId");

-- CreateIndex
CREATE INDEX "UserReward_userId_grantedAt_idx" ON "public"."UserReward"("userId", "grantedAt");

-- CreateIndex
CREATE INDEX "UserReward_idempotencyKey_idx" ON "public"."UserReward"("idempotencyKey");

-- CreateIndex
CREATE INDEX "UserReward_correlationId_idx" ON "public"."UserReward"("correlationId");

-- CreateIndex
CREATE INDEX "UserAchievement_userId_achievementId_idx" ON "public"."UserAchievement"("userId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "public"."UserAchievement"("userId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "Ranking_userId_key" ON "public"."Ranking"("userId");

-- CreateIndex
CREATE INDEX "AuditEntry_entity_entityId_createdAt_idx" ON "public"."AuditEntry"("entity", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEntry_actorUserId_createdAt_idx" ON "public"."AuditEntry"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEntry_correlationId_idx" ON "public"."AuditEntry"("correlationId");

-- CreateIndex
CREATE INDEX "AuditEntry_idempotencyKey_idx" ON "public"."AuditEntry"("idempotencyKey");

-- CreateIndex
CREATE INDEX "DomainEvent_createdAt_idx" ON "public"."DomainEvent"("createdAt");

-- CreateIndex
CREATE INDEX "DomainEvent_eventName_createdAt_idx" ON "public"."DomainEvent"("eventName", "createdAt");

-- CreateIndex
CREATE INDEX "DomainEvent_correlationId_idx" ON "public"."DomainEvent"("correlationId");

-- CreateIndex
CREATE INDEX "DomainEvent_idempotencyKey_idx" ON "public"."DomainEvent"("idempotencyKey");

-- CreateIndex
CREATE INDEX "SystemLog_createdAt_idx" ON "public"."SystemLog"("createdAt");

-- CreateIndex
CREATE INDEX "SystemLog_service_category_createdAt_idx" ON "public"."SystemLog"("service", "category", "createdAt");

-- CreateIndex
CREATE INDEX "SystemLog_correlationId_idx" ON "public"."SystemLog"("correlationId");

-- CreateIndex
CREATE INDEX "SystemLog_traceId_idx" ON "public"."SystemLog"("traceId");

-- CreateIndex
CREATE UNIQUE INDEX "Checkout_slug_key" ON "public"."Checkout"("slug");

-- CreateIndex
CREATE INDEX "Checkout_userId_createdAt_idx" ON "public"."Checkout"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Checkout_productId_idx" ON "public"."Checkout"("productId");

-- CreateIndex
CREATE INDEX "Checkout_slug_idx" ON "public"."Checkout"("slug");

-- CreateIndex
CREATE INDEX "CheckoutVariant_checkoutId_idx" ON "public"."CheckoutVariant"("checkoutId");

-- CreateIndex
CREATE INDEX "CheckoutOrderBump_checkoutId_position_idx" ON "public"."CheckoutOrderBump"("checkoutId", "position");

-- CreateIndex
CREATE INDEX "CheckoutUpsell_checkoutId_position_idx" ON "public"."CheckoutUpsell"("checkoutId", "position");

-- CreateIndex
CREATE INDEX "CheckoutDownsell_checkoutId_position_idx" ON "public"."CheckoutDownsell"("checkoutId", "position");

-- CreateIndex
CREATE INDEX "_LevelDefaultRewards_B_index" ON "public"."_LevelDefaultRewards"("B");

-- AddForeignKey
ALTER TABLE "public"."Credential" ADD CONSTRAINT "Credential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AllowedIp" ADD CONSTRAINT "AllowedIp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Kyc" ADD CONSTRAINT "Kyc_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_acquirerId_fkey" FOREIGN KEY ("acquirerId") REFERENCES "public"."Acquirer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_checkoutId_fkey" FOREIGN KEY ("checkoutId") REFERENCES "public"."Checkout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_checkoutVariantId_fkey" FOREIGN KEY ("checkoutVariantId") REFERENCES "public"."CheckoutVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TransactionSplit" ADD CONSTRAINT "TransactionSplit_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Statement" ADD CONSTRAINT "Statement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Med" ADD CONSTRAINT "Med_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Customer" ADD CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Withdrawal" ADD CONSTRAINT "Withdrawal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AutomationRule" ADD CONSTRAINT "AutomationRule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WebhookSecret" ADD CONSTRAINT "WebhookSecret_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "public"."AutomationRule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AutomationDelivery" ADD CONSTRAINT "AutomationDelivery_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "public"."AutomationRule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AutomationDelivery" ADD CONSTRAINT "AutomationDelivery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SupportTicket" ADD CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserAcquirerConfig" ADD CONSTRAINT "UserAcquirerConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserAcquirerConfig" ADD CONSTRAINT "UserAcquirerConfig_acquirerId_fkey" FOREIGN KEY ("acquirerId") REFERENCES "public"."Acquirer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LevelProgress" ADD CONSTRAINT "LevelProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LevelProgress" ADD CONSTRAINT "LevelProgress_currentLevelId_fkey" FOREIGN KEY ("currentLevelId") REFERENCES "public"."LevelDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserReward" ADD CONSTRAINT "UserReward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserReward" ADD CONSTRAINT "UserReward_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "public"."RewardDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "public"."AchievementDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ranking" ADD CONSTRAINT "Ranking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditEntry" ADD CONSTRAINT "AuditEntry_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DomainEvent" ADD CONSTRAINT "DomainEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SystemLog" ADD CONSTRAINT "SystemLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Checkout" ADD CONSTRAINT "Checkout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Checkout" ADD CONSTRAINT "Checkout_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CheckoutVariant" ADD CONSTRAINT "CheckoutVariant_checkoutId_fkey" FOREIGN KEY ("checkoutId") REFERENCES "public"."Checkout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CheckoutOrderBump" ADD CONSTRAINT "CheckoutOrderBump_checkoutId_fkey" FOREIGN KEY ("checkoutId") REFERENCES "public"."Checkout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CheckoutUpsell" ADD CONSTRAINT "CheckoutUpsell_checkoutId_fkey" FOREIGN KEY ("checkoutId") REFERENCES "public"."Checkout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CheckoutDownsell" ADD CONSTRAINT "CheckoutDownsell_checkoutId_fkey" FOREIGN KEY ("checkoutId") REFERENCES "public"."Checkout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_LevelDefaultRewards" ADD CONSTRAINT "_LevelDefaultRewards_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."LevelDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_LevelDefaultRewards" ADD CONSTRAINT "_LevelDefaultRewards_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."RewardDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
