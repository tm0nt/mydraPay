/*
  Warnings:

  - You are about to drop the column `blockedBalance` on the `Statement` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Statement` table. All the data in the column will be lost.
  - You are about to drop the column `currentBalance` on the `Statement` table. All the data in the column will be lost.
  - You are about to drop the column `pendingBalance` on the `Statement` table. All the data in the column will be lost.
  - You are about to drop the column `reserveBalance` on the `Statement` table. All the data in the column will be lost.
  - You are about to alter the column `source` on the `Statement` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.

*/
-- DropIndex
DROP INDEX "public"."Statement_userId_asOf_idx";

-- DropIndex
DROP INDEX "public"."Statement_userId_createdAt_idx";

-- AlterTable
ALTER TABLE "public"."Statement" DROP COLUMN "blockedBalance",
DROP COLUMN "createdAt",
DROP COLUMN "currentBalance",
DROP COLUMN "pendingBalance",
DROP COLUMN "reserveBalance",
ADD COLUMN     "transactionsCount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "initialBalance" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "variation" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "finalBalance" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "asOf" DROP DEFAULT,
ALTER COLUMN "source" SET DATA TYPE VARCHAR(50);
