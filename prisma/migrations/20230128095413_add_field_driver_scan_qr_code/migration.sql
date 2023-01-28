/*
  Warnings:

  - Added the required column `createDate` to the `DriverScanQRCode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DriverScanQRCode" ADD COLUMN     "createDate" TIMESTAMPTZ NOT NULL,
ADD COLUMN     "isCheck" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "submitTime" DROP NOT NULL;
