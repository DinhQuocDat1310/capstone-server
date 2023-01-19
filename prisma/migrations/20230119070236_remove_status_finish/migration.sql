/*
  Warnings:

  - The values [FINISH] on the enum `CampaignStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [WIDTHDRAW_AMOUNT] on the enum `DescriptionType` will be removed. If these variants are still used in the database, this will fail.

*/
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

-- AlterEnum
BEGIN;
CREATE TYPE "DescriptionType_new" AS ENUM ('ADD_AMOUNT', 'WITHDRAW_AMOUNT');
ALTER TABLE "OrderTransaction" ALTER COLUMN "descriptionType" TYPE "DescriptionType_new" USING ("descriptionType"::text::"DescriptionType_new");
ALTER TYPE "DescriptionType" RENAME TO "DescriptionType_old";
ALTER TYPE "DescriptionType_new" RENAME TO "DescriptionType";
DROP TYPE "DescriptionType_old";
COMMIT;
