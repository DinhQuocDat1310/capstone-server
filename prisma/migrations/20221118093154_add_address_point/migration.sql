/*
  Warnings:

  - Added the required column `addressPoint` to the `LocationCampaignPerKm` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LocationCampaignPerKm" ADD COLUMN     "addressPoint" TEXT NOT NULL;
