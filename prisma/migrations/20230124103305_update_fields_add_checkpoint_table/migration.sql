/*
  Warnings:

  - You are about to drop the column `locationCampaignId` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `locationPricePerKm` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `minimumKmDrive` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `totalKm` on the `Campaign` table. All the data in the column will be lost.
  - The `statusCampaign` column on the `Campaign` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `endRegisterDate` column on the `Campaign` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `startRegisterDate` column on the `Campaign` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `endWrapDate` column on the `Campaign` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `startWrapDate` column on the `Campaign` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `bankAccountNumber` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `bankAccountOwner` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `bankName` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `idCar` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `isRequiredOdo` on the `DriverJoinCampaign` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `FAQs` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `PoliciesTerm` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `User` table. All the data in the column will be lost.
  - The `status` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `assignBy` on the `VerifyAccount` table. All the data in the column will be lost.
  - The `status` column on the `VerifyAccount` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `assignBy` on the `VerifyCampaign` table. All the data in the column will be lost.
  - The `status` column on the `VerifyCampaign` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `status` on the `Wrap` table. All the data in the column will be lost.
  - You are about to drop the `DriverTrackingLocation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IWallet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LocationCampaignPerKm` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderTransaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PaymentDebit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReporterDriverCampaign` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tracking` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[licensePlates]` on the table `Driver` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `startRunningDate` on the `Campaign` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `duration` on the `Campaign` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `quantityDriver` on the `Campaign` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `wrapPrice` on the `Campaign` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `totalDriverMoney` to the `ContractCampaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalSystemMoney` to the `ContractCampaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalWrapMoney` to the `ContractCampaign` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `createDate` on the `DriverJoinCampaign` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `createDate` on the `VerifyAccount` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `createDate` on the `VerifyCampaign` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `price` on the `Wrap` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "StatusUser" AS ENUM ('INIT', 'NEW', 'PENDING', 'UPDATE', 'BANNED', 'VERIFIED');

-- CreateEnum
CREATE TYPE "StatusTransaction" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "TypeTransaction" AS ENUM ('DEPOSIT', 'WITHDRAW');

-- CreateEnum
CREATE TYPE "StatusVerifyAccount" AS ENUM ('NEW', 'ACCEPT', 'BANNED', 'UPDATE', 'PENDING');

-- CreateEnum
CREATE TYPE "StatusCampaign" AS ENUM ('NEW', 'OPEN', 'PAYMENT', 'WRAPPING', 'RUNNING', 'CLOSED', 'CANCELED');

-- CreateEnum
CREATE TYPE "StatusVerifyCampaign" AS ENUM ('NEW', 'PENDING', 'ACCEPT', 'BANNED', 'UPDATE');

-- DropForeignKey
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_locationCampaignId_fkey";

-- DropForeignKey
ALTER TABLE "DriverTrackingLocation" DROP CONSTRAINT "DriverTrackingLocation_driverJoinCampaignId_fkey";

-- DropForeignKey
ALTER TABLE "IWallet" DROP CONSTRAINT "IWallet_userId_fkey";

-- DropForeignKey
ALTER TABLE "OrderTransaction" DROP CONSTRAINT "OrderTransaction_iWalletId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentDebit" DROP CONSTRAINT "PaymentDebit_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "ReporterDriverCampaign" DROP CONSTRAINT "ReporterDriverCampaign_driverJoinCampaignId_fkey";

-- DropForeignKey
ALTER TABLE "ReporterDriverCampaign" DROP CONSTRAINT "ReporterDriverCampaign_reporterId_fkey";

-- DropForeignKey
ALTER TABLE "Tracking" DROP CONSTRAINT "Tracking_driverTrackingLocationId_fkey";

-- DropIndex
DROP INDEX "Driver_bankAccountNumber_key";

-- DropIndex
DROP INDEX "Driver_idCar_key";

-- DropIndex
DROP INDEX "User_phoneNumber_key";

-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "locationCampaignId",
DROP COLUMN "locationPricePerKm",
DROP COLUMN "minimumKmDrive",
DROP COLUMN "totalKm",
ADD COLUMN     "endPaymentDate" TIMESTAMPTZ,
ADD COLUMN     "routeId" TEXT,
ADD COLUMN     "startPaymentDate" TIMESTAMPTZ,
DROP COLUMN "startRunningDate",
ADD COLUMN     "startRunningDate" TIMESTAMPTZ NOT NULL,
DROP COLUMN "statusCampaign",
ADD COLUMN     "statusCampaign" "StatusCampaign" NOT NULL DEFAULT 'NEW',
DROP COLUMN "duration",
ADD COLUMN     "duration" INTEGER NOT NULL,
DROP COLUMN "quantityDriver",
ADD COLUMN     "quantityDriver" INTEGER NOT NULL,
DROP COLUMN "endRegisterDate",
ADD COLUMN     "endRegisterDate" TIMESTAMPTZ,
DROP COLUMN "startRegisterDate",
ADD COLUMN     "startRegisterDate" TIMESTAMPTZ,
DROP COLUMN "endWrapDate",
ADD COLUMN     "endWrapDate" TIMESTAMPTZ,
DROP COLUMN "startWrapDate",
ADD COLUMN     "startWrapDate" TIMESTAMPTZ,
DROP COLUMN "wrapPrice",
ADD COLUMN     "wrapPrice" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "ContractCampaign" DROP COLUMN "totalDriverMoney",
ADD COLUMN     "totalDriverMoney" DOUBLE PRECISION NOT NULL,
DROP COLUMN "totalSystemMoney",
ADD COLUMN     "totalSystemMoney" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "isAccept" DROP NOT NULL,
DROP COLUMN "totalWrapMoney",
ADD COLUMN     "totalWrapMoney" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Driver" DROP COLUMN "bankAccountNumber",
DROP COLUMN "bankAccountOwner",
DROP COLUMN "bankName",
DROP COLUMN "idCar",
ADD COLUMN     "licensePlates" TEXT;

-- AlterTable
ALTER TABLE "DriverJoinCampaign" DROP COLUMN "isRequiredOdo",
DROP COLUMN "createDate",
ADD COLUMN     "createDate" TIMESTAMPTZ NOT NULL;

-- AlterTable
ALTER TABLE "FAQs" DROP COLUMN "status",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "PoliciesTerm" DROP COLUMN "status",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "phoneNumber",
DROP COLUMN "status",
ADD COLUMN     "status" "StatusUser" NOT NULL DEFAULT 'INIT';

-- AlterTable
ALTER TABLE "VerifyAccount" DROP COLUMN "assignBy",
DROP COLUMN "status",
ADD COLUMN     "status" "StatusVerifyAccount" NOT NULL DEFAULT 'NEW',
DROP COLUMN "createDate",
ADD COLUMN     "createDate" TIMESTAMPTZ NOT NULL;

-- AlterTable
ALTER TABLE "VerifyCampaign" DROP COLUMN "assignBy",
DROP COLUMN "status",
ADD COLUMN     "status" "StatusVerifyCampaign" NOT NULL DEFAULT 'NEW',
DROP COLUMN "createDate",
ADD COLUMN     "createDate" TIMESTAMPTZ NOT NULL;

-- AlterTable
ALTER TABLE "Wrap" DROP COLUMN "status",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
DROP COLUMN "price",
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;

-- DropTable
DROP TABLE "DriverTrackingLocation";

-- DropTable
DROP TABLE "IWallet";

-- DropTable
DROP TABLE "LocationCampaignPerKm";

-- DropTable
DROP TABLE "OrderTransaction";

-- DropTable
DROP TABLE "PaymentDebit";

-- DropTable
DROP TABLE "ReporterDriverCampaign";

-- DropTable
DROP TABLE "Tracking";

-- DropEnum
DROP TYPE "AssignBy";

-- DropEnum
DROP TYPE "CampaignStatus";

-- DropEnum
DROP TYPE "DescriptionType";

-- DropEnum
DROP TYPE "Status";

-- DropEnum
DROP TYPE "StatusOrder";

-- DropEnum
DROP TYPE "UserStatus";

-- DropEnum
DROP TYPE "VerifyAccountStatus";

-- DropEnum
DROP TYPE "VerifyCampaignStatus";

-- CreateTable
CREATE TABLE "EWallet" (
    "id" TEXT NOT NULL,
    "totalBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updateDate" TIMESTAMPTZ NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "EWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transactions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createDate" TIMESTAMPTZ NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "StatusTransaction" NOT NULL,
    "type" "TypeTransaction" NOT NULL,
    "campaignId" TEXT,
    "eWalletId" TEXT NOT NULL,

    CONSTRAINT "Transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverScanQRCode" (
    "id" TEXT NOT NULL,
    "submitTime" TIMESTAMPTZ NOT NULL,
    "driverJoinCampaignId" TEXT NOT NULL,
    "checkpointId" TEXT NOT NULL,

    CONSTRAINT "DriverScanQRCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrivingPhotoReport" (
    "id" TEXT NOT NULL,
    "createDate" TIMESTAMPTZ NOT NULL,
    "imageCarBack" TEXT NOT NULL,
    "imageCarLeft" TEXT,
    "imageCarRight" TEXT,
    "reporterId" TEXT NOT NULL,
    "driverJoinCampaignId" TEXT NOT NULL,

    CONSTRAINT "DrivingPhotoReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checkpoint" (
    "id" TEXT NOT NULL,
    "addressName" TEXT NOT NULL,
    "longitude" TEXT NOT NULL,
    "latitude" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "routeId" TEXT,

    CONSTRAINT "Checkpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "totalKilometer" INTEGER NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EWallet_userId_key" ON "EWallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Checkpoint_reporterId_key" ON "Checkpoint"("reporterId");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_licensePlates_key" ON "Driver"("licensePlates");

-- AddForeignKey
ALTER TABLE "EWallet" ADD CONSTRAINT "EWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_eWalletId_fkey" FOREIGN KEY ("eWalletId") REFERENCES "EWallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverScanQRCode" ADD CONSTRAINT "DriverScanQRCode_driverJoinCampaignId_fkey" FOREIGN KEY ("driverJoinCampaignId") REFERENCES "DriverJoinCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverScanQRCode" ADD CONSTRAINT "DriverScanQRCode_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "Checkpoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrivingPhotoReport" ADD CONSTRAINT "DrivingPhotoReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "Reporter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrivingPhotoReport" ADD CONSTRAINT "DrivingPhotoReport_driverJoinCampaignId_fkey" FOREIGN KEY ("driverJoinCampaignId") REFERENCES "DriverJoinCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkpoint" ADD CONSTRAINT "Checkpoint_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "Reporter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkpoint" ADD CONSTRAINT "Checkpoint_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE SET NULL ON UPDATE CASCADE;
