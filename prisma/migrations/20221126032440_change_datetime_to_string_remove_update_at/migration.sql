/*
  Warnings:

  - You are about to drop the column `updateDate` on the `DriverJoinCampaign` table. All the data in the column will be lost.
  - You are about to drop the column `updateAt` on the `LocationCampaignPerKm` table. All the data in the column will be lost.
  - You are about to drop the column `updateAt` on the `VerifyAccount` table. All the data in the column will be lost.
  - You are about to drop the column `updateAt` on the `VerifyCampaign` table. All the data in the column will be lost.
  - You are about to drop the column `updateAt` on the `Wrap` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Campaign" ALTER COLUMN "startRunningDate" SET DATA TYPE TEXT,
ALTER COLUMN "endRegisterDate" SET DATA TYPE TEXT,
ALTER COLUMN "startRegisterDate" SET DATA TYPE TEXT,
ALTER COLUMN "endWrapDate" SET DATA TYPE TEXT,
ALTER COLUMN "startWrapDate" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "DriverJoinCampaign" DROP COLUMN "updateDate",
ALTER COLUMN "createDate" DROP DEFAULT,
ALTER COLUMN "createDate" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "DriverTrackingLocation" ALTER COLUMN "createDate" DROP DEFAULT,
ALTER COLUMN "createDate" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "LocationCampaignPerKm" DROP COLUMN "updateAt",
ALTER COLUMN "createDate" DROP DEFAULT,
ALTER COLUMN "createDate" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "PaymentDebit" ALTER COLUMN "createDate" DROP DEFAULT,
ALTER COLUMN "createDate" SET DATA TYPE TEXT,
ALTER COLUMN "paidDate" SET DATA TYPE TEXT,
ALTER COLUMN "expiredDate" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "ReporterDriverCampaign" ALTER COLUMN "createDate" DROP DEFAULT,
ALTER COLUMN "createDate" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Tracking" ALTER COLUMN "timeSubmit" DROP DEFAULT,
ALTER COLUMN "timeSubmit" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "VerifyAccount" DROP COLUMN "updateAt",
ALTER COLUMN "createDate" DROP DEFAULT,
ALTER COLUMN "createDate" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "VerifyCampaign" DROP COLUMN "updateAt",
ALTER COLUMN "createDate" DROP DEFAULT,
ALTER COLUMN "createDate" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Wrap" DROP COLUMN "updateAt";
