/*
  Warnings:

  - You are about to drop the column `checkpointId` on the `DriverScanQRCode` table. All the data in the column will be lost.
  - Added the required column `checkpointTimeId` to the `DriverScanQRCode` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DriverScanQRCode" DROP CONSTRAINT "DriverScanQRCode_checkpointId_fkey";

-- AlterTable
ALTER TABLE "DriverScanQRCode" DROP COLUMN "checkpointId",
ADD COLUMN     "checkpointTimeId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "DriverScanQRCode" ADD CONSTRAINT "DriverScanQRCode_checkpointTimeId_fkey" FOREIGN KEY ("checkpointTimeId") REFERENCES "CheckpointTime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
