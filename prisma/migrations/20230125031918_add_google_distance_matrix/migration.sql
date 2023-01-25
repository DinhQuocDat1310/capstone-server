/*
  Warnings:

  - You are about to drop the column `routeId` on the `Checkpoint` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Checkpoint" DROP CONSTRAINT "Checkpoint_routeId_fkey";

-- AlterTable
ALTER TABLE "Checkpoint" DROP COLUMN "routeId";

-- CreateTable
CREATE TABLE "CheckpointTime" (
    "id" TEXT NOT NULL,
    "deadline" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "checkpointId" TEXT NOT NULL,

    CONSTRAINT "CheckpointTime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleDistanceMatrix" (
    "id" TEXT NOT NULL,
    "distance" INTEGER NOT NULL,
    "time" INTEGER NOT NULL,
    "originCheckpointId" TEXT NOT NULL,
    "destinationCheckpointId" TEXT NOT NULL,

    CONSTRAINT "GoogleDistanceMatrix_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CheckpointTime" ADD CONSTRAINT "CheckpointTime_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckpointTime" ADD CONSTRAINT "CheckpointTime_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "Checkpoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleDistanceMatrix" ADD CONSTRAINT "GoogleDistanceMatrix_originCheckpointId_fkey" FOREIGN KEY ("originCheckpointId") REFERENCES "Checkpoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleDistanceMatrix" ADD CONSTRAINT "GoogleDistanceMatrix_destinationCheckpointId_fkey" FOREIGN KEY ("destinationCheckpointId") REFERENCES "Checkpoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
