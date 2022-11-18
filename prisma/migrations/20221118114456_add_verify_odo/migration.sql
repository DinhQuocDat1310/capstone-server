-- CreateEnum
CREATE TYPE "VerifyStatusOdo" AS ENUM ('PENDING', 'SUCCESS', 'CANCELED');

-- CreateTable
CREATE TABLE "VerifyOdo" (
    "id" TEXT NOT NULL,
    "status" "VerifyStatusOdo" NOT NULL DEFAULT 'PENDING',
    "createDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "imageCarOdoBefore" TEXT,
    "imageCarOdoAfter" TEXT,
    "driverJoinCampaignId" TEXT,
    "brandId" TEXT,

    CONSTRAINT "VerifyOdo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VerifyOdo" ADD CONSTRAINT "VerifyOdo_driverJoinCampaignId_fkey" FOREIGN KEY ("driverJoinCampaignId") REFERENCES "DriverJoinCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerifyOdo" ADD CONSTRAINT "VerifyOdo_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;
