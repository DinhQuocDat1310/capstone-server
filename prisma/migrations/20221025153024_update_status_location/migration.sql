/*
  Warnings:

  - You are about to drop the column `isActive` on the `LocationCampaignPerKm` table. All the data in the column will be lost.
  - Added the required column `status` to the `LocationCampaignPerKm` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ENABLE', 'DISABLE');

-- AlterTable
ALTER TABLE "LocationCampaignPerKm" DROP COLUMN "isActive",
ADD COLUMN     "status" "Status" NOT NULL;
