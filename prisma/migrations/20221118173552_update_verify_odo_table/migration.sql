/*
  Warnings:

  - You are about to drop the column `imageCarOdoAfter` on the `ReporterDriverCampaign` table. All the data in the column will be lost.
  - You are about to drop the column `imageCarOdoBefore` on the `ReporterDriverCampaign` table. All the data in the column will be lost.
  - You are about to drop the `VerifyOdo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "VerifyOdo" DROP CONSTRAINT "VerifyOdo_brandId_fkey";

-- DropForeignKey
ALTER TABLE "VerifyOdo" DROP CONSTRAINT "VerifyOdo_driverJoinCampaignId_fkey";

-- AlterTable
ALTER TABLE "DriverJoinCampaign" ADD COLUMN     "isRequiredOdo" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "ReporterDriverCampaign" DROP COLUMN "imageCarOdoAfter",
DROP COLUMN "imageCarOdoBefore",
ADD COLUMN     "imageCarOdo" TEXT,
ALTER COLUMN "imageCarLeft" DROP NOT NULL,
ALTER COLUMN "imageCarRight" DROP NOT NULL;

-- DropTable
DROP TABLE "VerifyOdo";

-- DropEnum
DROP TYPE "VerifyStatusOdo";
