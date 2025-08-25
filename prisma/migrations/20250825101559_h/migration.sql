-- CreateEnum
CREATE TYPE "public"."WebhookEvent" AS ENUM ('PAYMENT_CREATED', 'PAYMENT_PAID', 'WITHDRAWAL_REQUESTED', 'WITHDRAWAL_PAID');

-- CreateTable
CREATE TABLE "public"."WebhookUser" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "events" "public"."WebhookEvent"[],

    CONSTRAINT "WebhookUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WebhookUser_userId_idx" ON "public"."WebhookUser"("userId");

-- AddForeignKey
ALTER TABLE "public"."WebhookUser" ADD CONSTRAINT "WebhookUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
