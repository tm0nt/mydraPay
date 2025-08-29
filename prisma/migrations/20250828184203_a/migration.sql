-- AlterTable
ALTER TABLE "public"."GlobalConfig" ADD COLUMN     "minCryptoWithdrawalTax" DECIMAL(18,2),
ADD COLUMN     "minPixWithdrawalTax" DECIMAL(18,2);

-- AlterTable
ALTER TABLE "public"."UserSettings" ADD COLUMN     "minCryptoWithdrawalTax" DECIMAL(18,2),
ADD COLUMN     "minPixWithdrawalTax" DECIMAL(18,2);
