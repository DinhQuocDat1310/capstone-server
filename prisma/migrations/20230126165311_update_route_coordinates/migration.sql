/*
  Warnings:

  - You are about to drop the `GoogleDistanceMatrix` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GoogleDistanceMatrix" DROP CONSTRAINT "GoogleDistanceMatrix_destinationCheckpointId_fkey";

-- DropForeignKey
ALTER TABLE "GoogleDistanceMatrix" DROP CONSTRAINT "GoogleDistanceMatrix_originCheckpointId_fkey";

-- DropTable
DROP TABLE "GoogleDistanceMatrix";

-- CreateTable
CREATE TABLE "coordinates" (
    "id" TEXT NOT NULL,
    "points" DOUBLE PRECISION[],
    "routeId" TEXT,

    CONSTRAINT "coordinates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "coordinates" ADD CONSTRAINT "coordinates_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE SET NULL ON UPDATE CASCADE;
