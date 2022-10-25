/*
  Warnings:

  - The values [WARPPING] on the enum `CampaignStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `dateEndPaymentDeposit` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `dateEndWarpSticket` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `dateOpenRegister` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `datePaymentDeposit` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `dateWrapSticket` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `warpId` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `totalWarpType` on the `ContractCampaign` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `FAQs` table. All the data in the column will be lost.
  - You are about to drop the `Warp` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `poster` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wrapPrice` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isAccept` to the `ContractCampaign` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PositionWrap" AS ENUM ('BOTH_SIDE', 'LEFT_SIDE', 'RIGHT_SIDE');

-- CreateEnum
CREATE TYPE "TypePayment" AS ENUM ('POSTPAID', 'PREPAY');

-- CreateEnum
CREATE TYPE "StatusTerm" AS ENUM ('ENABLE', 'DISABLE');

-- AlterEnum
BEGIN;
CREATE TYPE "CampaignStatus_new" AS ENUM ('NEW', 'OPEN', 'PAYMENT', 'WRAPPING', 'RUNNING', 'CLOSED', 'CANCELED');
ALTER TABLE "Campaign" ALTER COLUMN "statusCampaign" DROP DEFAULT;
ALTER TABLE "Campaign" ALTER COLUMN "statusCampaign" TYPE "CampaignStatus_new" USING ("statusCampaign"::text::"CampaignStatus_new");
ALTER TYPE "CampaignStatus" RENAME TO "CampaignStatus_old";
ALTER TYPE "CampaignStatus_new" RENAME TO "CampaignStatus";
DROP TYPE "CampaignStatus_old";
ALTER TABLE "Campaign" ALTER COLUMN "statusCampaign" SET DEFAULT 'NEW';
COMMIT;

-- DropForeignKey
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_warpId_fkey";

-- DropIndex
DROP INDEX "Campaign_locationCampaignId_key";

-- DropIndex
DROP INDEX "Campaign_warpId_key";

-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "dateEndPaymentDeposit",
DROP COLUMN "dateEndWarpSticket",
DROP COLUMN "dateOpenRegister",
DROP COLUMN "datePaymentDeposit",
DROP COLUMN "dateWrapSticket",
DROP COLUMN "warpId",
ADD COLUMN     "detailMessage" TEXT,
ADD COLUMN     "endWrapDate" TIMESTAMP(3),
ADD COLUMN     "locationPricePerKm" TEXT,
ADD COLUMN     "poster" TEXT NOT NULL,
ADD COLUMN     "startWrapDate" TIMESTAMP(3),
ADD COLUMN     "wrapId" TEXT,
ADD COLUMN     "wrapPrice" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ContractCampaign" DROP COLUMN "totalWarpType",
ADD COLUMN     "isAccept" BOOLEAN NOT NULL,
ADD COLUMN     "message" TEXT,
ADD COLUMN     "totalWrapMoney" TEXT;

-- AlterTable
ALTER TABLE "FAQs" DROP COLUMN "isActive",
ADD COLUMN     "status" "StatusTerm" NOT NULL DEFAULT 'ENABLE';

-- AlterTable
ALTER TABLE "LocationCampaignPerKm" ADD COLUMN     "createDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "Warp";

-- DropEnum
DROP TYPE "PositionWarp";

-- CreateTable
CREATE TABLE "Wrap" (
    "id" TEXT NOT NULL,
    "positionWrap" "PositionWrap" NOT NULL,
    "price" TEXT NOT NULL,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wrap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentDebit" (
    "id" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "type" "TypePayment" NOT NULL,
    "createDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidDate" TIMESTAMP(3) NOT NULL,
    "expiredDate" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT NOT NULL,

    CONSTRAINT "PaymentDebit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_wrapId_fkey" FOREIGN KEY ("wrapId") REFERENCES "Wrap"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentDebit" ADD CONSTRAINT "PaymentDebit_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
