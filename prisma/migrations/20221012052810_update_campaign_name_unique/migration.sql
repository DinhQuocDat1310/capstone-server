/*
  Warnings:

  - A unique constraint covering the columns `[campaignName]` on the table `Campaign` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Campaign_campaignName_key" ON "Campaign"("campaignName");
