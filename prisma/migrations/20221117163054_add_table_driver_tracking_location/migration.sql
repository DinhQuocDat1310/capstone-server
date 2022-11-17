-- CreateTable
CREATE TABLE "DriverTrackingLocation" (
    "id" TEXT NOT NULL,
    "createDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "driverJoinCampaignId" TEXT,

    CONSTRAINT "DriverTrackingLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tracking" (
    "id" TEXT NOT NULL,
    "totalKmDriven" TEXT NOT NULL,
    "timeSubmit" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "driverTrackingLocationId" TEXT,

    CONSTRAINT "Tracking_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DriverTrackingLocation" ADD CONSTRAINT "DriverTrackingLocation_driverJoinCampaignId_fkey" FOREIGN KEY ("driverJoinCampaignId") REFERENCES "DriverJoinCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tracking" ADD CONSTRAINT "Tracking_driverTrackingLocationId_fkey" FOREIGN KEY ("driverTrackingLocationId") REFERENCES "DriverTrackingLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
