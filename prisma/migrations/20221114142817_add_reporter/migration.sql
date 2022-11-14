-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'REPORTER';

-- CreateTable
CREATE TABLE "Reporter" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Reporter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReporterDriverCampaign" (
    "id" TEXT NOT NULL,
    "imageCarBack" TEXT NOT NULL,
    "imageCarLeft" TEXT NOT NULL,
    "imageCarRight" TEXT NOT NULL,
    "imageCarOdoBefore" TEXT,
    "imageCarOdoAfter" TEXT,
    "createDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reporterId" TEXT NOT NULL,
    "driverJoinCampaignId" TEXT NOT NULL,

    CONSTRAINT "ReporterDriverCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reporter_userId_key" ON "Reporter"("userId");

-- AddForeignKey
ALTER TABLE "Reporter" ADD CONSTRAINT "Reporter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReporterDriverCampaign" ADD CONSTRAINT "ReporterDriverCampaign_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "Reporter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReporterDriverCampaign" ADD CONSTRAINT "ReporterDriverCampaign_driverJoinCampaignId_fkey" FOREIGN KEY ("driverJoinCampaignId") REFERENCES "DriverJoinCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
