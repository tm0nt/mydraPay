-- AlterTable
ALTER TABLE "public"."Statement" ADD COLUMN     "blockedBalance" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "pendingBalance" DECIMAL(65,30) NOT NULL DEFAULT 0;
