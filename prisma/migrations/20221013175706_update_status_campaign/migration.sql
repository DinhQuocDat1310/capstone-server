/*
  Warnings:

  - The values [OPENING] on the enum `CampaignStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CampaignStatus_new" AS ENUM ('NEW', 'OPEN', 'PAYMENT', 'WARPPING', 'RUNNING', 'CLOSED', 'CANCELED');
ALTER TABLE "Campaign" ALTER COLUMN "statusCampaign" DROP DEFAULT;
ALTER TABLE "Campaign" ALTER COLUMN "statusCampaign" TYPE "CampaignStatus_new" USING ("statusCampaign"::text::"CampaignStatus_new");
ALTER TYPE "CampaignStatus" RENAME TO "CampaignStatus_old";
ALTER TYPE "CampaignStatus_new" RENAME TO "CampaignStatus";
DROP TYPE "CampaignStatus_old";
ALTER TABLE "Campaign" ALTER COLUMN "statusCampaign" SET DEFAULT 'NEW';
COMMIT;

-- AlterTable
ALTER TABLE "ContractCampaign" ALTER COLUMN "totalDriverMoney" DROP NOT NULL,
ALTER COLUMN "totalSystemMoney" DROP NOT NULL,
ALTER COLUMN "totalWarpType" DROP NOT NULL;
