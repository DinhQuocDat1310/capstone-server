-- DropForeignKey
ALTER TABLE "DriverScanQRCode" DROP CONSTRAINT "DriverScanQRCode_checkpointId_fkey";

-- AddForeignKey
ALTER TABLE "DriverScanQRCode" ADD CONSTRAINT "DriverScanQRCode_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "CheckpointTime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
