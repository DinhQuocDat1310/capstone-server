/*
  Warnings:

  - The values [EXPIRED] on the enum `VerifyAccountStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('NEW', 'OPENING', 'RUNNING', 'CLOSED', 'CANCELED');

-- CreateEnum
CREATE TYPE "PositionWarp" AS ENUM ('BOTH_SIDE', 'ONE_SIDE');

-- CreateEnum
CREATE TYPE "VerifyCampaignStatus" AS ENUM ('NEW', 'PENDING', 'ACCEPT', 'BANNED', 'UPDATE');

-- AlterEnum
BEGIN;
CREATE TYPE "VerifyAccountStatus_new" AS ENUM ('NEW', 'ACCEPT', 'BANNED', 'UPDATE', 'PENDING');
ALTER TABLE "VerifyAccount" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "VerifyAccount" ALTER COLUMN "status" TYPE "VerifyAccountStatus_new" USING ("status"::text::"VerifyAccountStatus_new");
ALTER TYPE "VerifyAccountStatus" RENAME TO "VerifyAccountStatus_old";
ALTER TYPE "VerifyAccountStatus_new" RENAME TO "VerifyAccountStatus";
DROP TYPE "VerifyAccountStatus_old";
ALTER TABLE "VerifyAccount" ALTER COLUMN "status" SET DEFAULT 'NEW';
COMMIT;

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "campaignName" TEXT NOT NULL,
    "startRunningDate" TIMESTAMP(3) NOT NULL,
    "statusCampaign" "CampaignStatus" NOT NULL DEFAULT 'NEW',
    "duration" TEXT NOT NULL,
    "totalKm" TEXT NOT NULL,
    "quantityDriver" TEXT NOT NULL,
    "description" TEXT,
    "minimumKmDrive" TEXT NOT NULL DEFAULT '20',
    "totalDriverMoney" TEXT,
    "totalWarpMoney" TEXT,
    "totalSystemMoney" TEXT,
    "brandId" TEXT,
    "locationCampaignId" TEXT NOT NULL,
    "warpId" TEXT,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationCampaignPerKm" (
    "id" TEXT NOT NULL,
    "locationName" TEXT NOT NULL,
    "price" TEXT NOT NULL,

    CONSTRAINT "LocationCampaignPerKm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warp" (
    "id" TEXT NOT NULL,
    "imagePoster" TEXT NOT NULL,
    "positionWarp" "PositionWarp" NOT NULL,
    "price" TEXT NOT NULL,

    CONSTRAINT "Warp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerifyCampaign" (
    "id" TEXT NOT NULL,
    "status" "VerifyCampaignStatus" NOT NULL DEFAULT 'NEW',
    "detail" TEXT,
    "createDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "assignBy" "AssignBy",
    "managerId" TEXT,
    "campaignId" TEXT,

    CONSTRAINT "VerifyCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_locationCampaignId_key" ON "Campaign"("locationCampaignId");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_warpId_key" ON "Campaign"("warpId");

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_locationCampaignId_fkey" FOREIGN KEY ("locationCampaignId") REFERENCES "LocationCampaignPerKm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_warpId_fkey" FOREIGN KEY ("warpId") REFERENCES "Warp"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerifyCampaign" ADD CONSTRAINT "VerifyCampaign_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Manager"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerifyCampaign" ADD CONSTRAINT "VerifyCampaign_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
