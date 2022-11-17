/*
  Warnings:

  - You are about to drop the column `totalKmDriven` on the `Tracking` table. All the data in the column will be lost.
  - Added the required column `totalMeterDriven` to the `Tracking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tracking" DROP COLUMN "totalKmDriven",
ADD COLUMN     "totalMeterDriven" TEXT NOT NULL;
