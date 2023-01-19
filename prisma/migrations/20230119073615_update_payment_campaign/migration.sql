/*
  Warnings:

  - You are about to drop the column `type` on the `PaymentDebit` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[campaignId]` on the table `PaymentDebit` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PaymentDebit" DROP COLUMN "type";

-- DropEnum
DROP TYPE "TypePayment";

-- CreateIndex
CREATE UNIQUE INDEX "PaymentDebit_campaignId_key" ON "PaymentDebit"("campaignId");
