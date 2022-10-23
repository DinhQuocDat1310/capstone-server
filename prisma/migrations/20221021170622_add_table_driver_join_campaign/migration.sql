-- CreateTable
CREATE TABLE "DriverJoinCampaign" (
    "id" TEXT NOT NULL,
    "isJoined" BOOLEAN NOT NULL DEFAULT false,
    "createDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "driverId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,

    CONSTRAINT "DriverJoinCampaign_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DriverJoinCampaign" ADD CONSTRAINT "DriverJoinCampaign_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverJoinCampaign" ADD CONSTRAINT "DriverJoinCampaign_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
