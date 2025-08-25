-- AlterTable
ALTER TABLE "public"."UserSettings" ADD COLUMN     "creditFeeFixed" DECIMAL(18,2),
ADD COLUMN     "creditFeePercent" DECIMAL(5,2),
ADD COLUMN     "pixFeeFixed" DECIMAL(18,2),
ADD COLUMN     "pixFeePercent" DECIMAL(5,2),
ADD COLUMN     "reserveFixed" DECIMAL(18,2),
ADD COLUMN     "reservePercent" DECIMAL(5,2);
