-- CreateTable
CREATE TABLE "public"."UserBalance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currency" "public"."Currency" NOT NULL DEFAULT 'BRL',
    "available" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "pending" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "blocked" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBalance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserBalance_userId_key" ON "public"."UserBalance"("userId");

-- CreateIndex
CREATE INDEX "UserBalance_userId_idx" ON "public"."UserBalance"("userId");

-- CreateIndex
CREATE INDEX "UserBalance_currency_idx" ON "public"."UserBalance"("currency");

-- AddForeignKey
ALTER TABLE "public"."UserBalance" ADD CONSTRAINT "UserBalance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
