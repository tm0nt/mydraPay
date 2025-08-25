/*
  Warnings:

  - You are about to drop the `AccountBalance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Anticipation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AnticipationConfig` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BalanceHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('INFO', 'WARNING', 'ERROR', 'SUCCESS', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- DropForeignKey
ALTER TABLE "public"."AccountBalance" DROP CONSTRAINT "AccountBalance_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Anticipation" DROP CONSTRAINT "Anticipation_balanceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Anticipation" DROP CONSTRAINT "Anticipation_configId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BalanceHistory" DROP CONSTRAINT "BalanceHistory_balanceId_fkey";

-- AlterTable
ALTER TABLE "public"."GlobalConfig" ADD COLUMN     "faviconUrl" TEXT,
ADD COLUMN     "seoDefaultDescription" TEXT,
ADD COLUMN     "seoDefaultKeywords" TEXT,
ADD COLUMN     "seoDefaultTitle" TEXT,
ADD COLUMN     "siteLogoUrl" TEXT;

-- AlterTable
ALTER TABLE "public"."UserSettings" ADD COLUMN     "customLogoUrl" TEXT,
ADD COLUMN     "customSeoDescription" TEXT,
ADD COLUMN     "customSeoKeywords" TEXT,
ADD COLUMN     "customSeoTitle" TEXT,
ADD COLUMN     "notificationEmail" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notificationPush" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "preferredLanguage" TEXT,
ADD COLUMN     "preferredTheme" TEXT,
ADD COLUMN     "timezone" TEXT;

-- DropTable
DROP TABLE "public"."AccountBalance";

-- DropTable
DROP TABLE "public"."Anticipation";

-- DropTable
DROP TABLE "public"."AnticipationConfig";

-- DropTable
DROP TABLE "public"."BalanceHistory";

-- DropEnum
DROP TYPE "public"."AnticipationStatus";

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."NotificationType" NOT NULL DEFAULT 'INFO',
    "priority" "public"."NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "url" TEXT,
    "metadata" JSONB,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_createdAt_idx" ON "public"."Notification"("userId", "isRead", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Notification_type_priority_idx" ON "public"."Notification"("type", "priority");

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
