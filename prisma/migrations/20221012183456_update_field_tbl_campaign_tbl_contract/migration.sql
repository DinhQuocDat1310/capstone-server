/*
  Warnings:

  - You are about to drop the column `totalDriverMoney` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `totalSystemMoney` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `totalWarpMoney` on the `Campaign` table. All the data in the column will be lost.
  - Added the required column `dateOpenRegister` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateWrapSticket` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endRegisterDate` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startRegisterDate` to the `Campaign` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "totalDriverMoney",
DROP COLUMN "totalSystemMoney",
DROP COLUMN "totalWarpMoney",
ADD COLUMN     "dateOpenRegister" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "dateWrapSticket" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "endRegisterDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startRegisterDate" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "ContractCampaign" (
    "id" TEXT NOT NULL,
    "contractName" TEXT NOT NULL,
    "totalDriverMoney" TEXT NOT NULL,
    "totalSystemMoney" TEXT NOT NULL,
    "totalWarpType" TEXT NOT NULL,
    "campaignId" TEXT,

    CONSTRAINT "ContractCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContractCampaign_campaignId_key" ON "ContractCampaign"("campaignId");

-- AddForeignKey
ALTER TABLE "ContractCampaign" ADD CONSTRAINT "ContractCampaign_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
